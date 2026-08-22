import re
import json
import uuid
import itertools
from datetime import datetime, date
from decimal import Decimal, InvalidOperation
from rapidfuzz import fuzz

def normalize_string(s):
    if not s:
        return ""
    return re.sub(r'[^a-zA-Z0-9]', '', str(s)).upper()

def parse_date(d):
    if not d:
        return None
    if isinstance(d, date):
        return d
    try:
        if 'T' in d:
            d = d.split('T')[0]
        return datetime.strptime(d, "%Y-%m-%d").date()
    except Exception:
        return None

def parse_amount(amt):
    try:
        return float(Decimal(str(amt)).quantize(Decimal('0.01')))
    except (InvalidOperation, TypeError, ValueError):
        return 0.0

def normalize_records(settlements, bank_transactions, ledger_entries):
    for s in settlements:
        s['normalized_utr'] = normalize_string(s.get('utr', ''))
        s['settled_amount'] = parse_amount(s.get('settled_amount', 0))
        s['settlement_date'] = parse_date(s.get('settlement_date'))
        s['gross_amount'] = parse_amount(s.get('gross_amount', 0))

    for b in bank_transactions:
        b['normalized_reference'] = normalize_string(b.get('reference_number', ''))
        b['credit_amount'] = parse_amount(b.get('credit_amount', 0))
        b['transaction_date'] = parse_date(b.get('transaction_date'))

    for l in ledger_entries:
        l['amount_charged'] = parse_amount(l.get('amount_charged', 0))
        l['order_date'] = parse_date(l.get('order_date'))

def compute_fuzzy_confidence(settlement, bank_tx):
    # Amount Score (30%)
    diff = abs(settlement['settled_amount'] - bank_tx['credit_amount'])
    if diff <= 1.0:
        amount_score = 1.0
    elif diff <= 100.0:
        amount_score = 1.0 - (diff / 100.0) * 0.5
    elif diff <= 1000.0:
        amount_score = 0.5 - (diff / 1000.0) * 0.3
    else:
        amount_score = 0.0

    # Date Score (20%)
    if settlement['settlement_date'] and bank_tx['transaction_date']:
        days_diff = abs((settlement['settlement_date'] - bank_tx['transaction_date']).days)
        if days_diff > 3:
            date_score = 0.0
        else:
            date_score = 1.0 - (days_diff / 3.0)
    else:
        date_score = 0.0

    # UTR Similarity (40%)
    n_utr = settlement.get('normalized_utr', '')
    n_ref = bank_tx.get('normalized_reference', '')
    if not n_utr or not n_ref:
        utr_sim = 0.0
    else:
        utr_sim = fuzz.partial_ratio(n_utr, n_ref) / 100.0

    # Reference Score (10%)
    o_id = str(settlement.get('order_id', ''))
    desc = str(bank_tx.get('description', ''))
    if o_id and o_id in desc:
        ref_score = 1.0
    else:
        ref_score = fuzz.partial_ratio(o_id, desc) / 100.0 if o_id and desc else 0.0

    combined = (0.3 * amount_score) + (0.2 * date_score) + (0.4 * utr_sim) + (0.1 * ref_score)
    
    return {
        "score": combined,
        "components": {
            "amount_score": amount_score,
            "date_score": date_score,
            "utr_similarity": utr_sim,
            "reference_score": ref_score
        }
    }

def run_reconciliation(settlements, bank_transactions, ledger_entries):
    normalize_records(settlements, bank_transactions, ledger_entries)
    
    matched_records = []
    exceptions = []
    
    unmatched_settlements = {s['payment_id']: s for s in settlements}
    # bank_id missing from bank_statement.csv, generated randomly or from auto-id
    # We will assume bank_transactions has bank_account_id but no unique _id unless added
    # We will generate a temporary 'bank_tx_id' for tracking if it doesn't exist
    for idx, b in enumerate(bank_transactions):
        if 'bank_id' not in b:
            b['bank_id'] = f"tmp_bank_{idx}"
            
    unmatched_banks = {b['bank_id']: b for b in bank_transactions}
    
    # Track overall metrics
    total_settled_value = sum(s['gross_amount'] for s in settlements)
    reconciled_value = 0.0
    
    def log_match(settlement, bank_ids, method, confidence, trust_state):
        nonlocal reconciled_value
        reconciled_value += settlement['gross_amount']
        matched_records.append({
            "payment_id": settlement['payment_id'],
            "matched_bank_ids": bank_ids,
            "method": method,
            "confidence": confidence,
            "trust_state": trust_state,
            "created_at": datetime.utcnow().isoformat()
        })
        if settlement['payment_id'] in unmatched_settlements:
            del unmatched_settlements[settlement['payment_id']]
        for bid in bank_ids:
            if bid in unmatched_banks:
                del unmatched_banks[bid]

    # Stage 1: Exact Match
    for p_id in list(unmatched_settlements.keys()):
        s = unmatched_settlements[p_id]
        if not s['normalized_utr']: continue
        
        for b_id, b in list(unmatched_banks.items()):
            if s['normalized_utr'] == b['normalized_reference']:
                diff = abs(s['settled_amount'] - b['credit_amount'])
                if diff > 1.0:
                    continue # Let fee_variance and amount_mismatch_only fall through to Stage 4
                log_match(s, [b_id], "exact", 1.0, "VERIFIED")
                break

    # Stage 2: Batched Match
    for b_id in list(unmatched_banks.keys()):
        b = unmatched_banks[b_id]
        if not b['transaction_date']: continue
        
        candidates = []
        for p_id, s in unmatched_settlements.items():
            if not s['settlement_date']: continue
            if abs((s['settlement_date'] - b['transaction_date']).days) <= 1:
                candidates.append(s)
                
        if len(candidates) < 2:
            continue
            
        found_batch = False
        for subset_size in [2, 3, 4]:
            if found_batch: break
            # Evaluate all combinations of this size
            valid_subsets = []
            for subset in itertools.combinations(candidates, subset_size):
                subset_sum = sum(x['settled_amount'] for x in subset)
                if abs(subset_sum - b['credit_amount']) <= 0.01:
                    date_diff_sum = sum(abs((x['settlement_date'] - b['transaction_date']).days) for x in subset)
                    valid_subsets.append((date_diff_sum, subset))
                    
            if valid_subsets:
                # Pick smallest date difference
                valid_subsets.sort(key=lambda x: x[0])
                best_subset = valid_subsets[0][1]
                
                # Mark as matched
                for s in best_subset:
                    log_match(s, [b_id], "batched", 0.9, "VERIFIED")
                # Wait, log_match deletes the bank tx. The first call deletes it, subsequent calls won't error but just won't delete.
                # Actually, we need to be careful: the match doc might need batch_members. 
                # Let's fix the schema for batched matches if needed. The prompt just says "Write match document with batch_members array".
                # But we call log_match for EACH settlement. Or maybe ONE match document? The DB schema usually has one match doc per payment_id.
                # I'll just append batch_members to the matched_records.
                found_batch = True

    # Ensure batch_members is added to batched matches
    # The instructions say: "Write match document with batch_members array"
    # If we created multiple match records for the same batch, we need to add batch_members to them.
    # Let's group batched matches by bank_id and inject batch_members.
    batch_groups = {}
    for mr in matched_records:
        if mr['method'] == 'batched':
            b_id = mr['matched_bank_ids'][0]
            batch_groups.setdefault(b_id, []).append(mr['payment_id'])
    for mr in matched_records:
        if mr['method'] == 'batched':
            b_id = mr['matched_bank_ids'][0]
            mr['batch_members'] = batch_groups[b_id]

    # Stage 3: Fuzzy Match
    for p_id in list(unmatched_settlements.keys()):
        s = unmatched_settlements[p_id]
        best_b_id = None
        best_score = 0
        
        for b_id, b in unmatched_banks.items():
            conf = compute_fuzzy_confidence(s, b)
            if conf['score'] > 0.6 and conf['score'] > best_score:
                diff = abs(s['settled_amount'] - b['credit_amount'])
                utr_sim = fuzz.partial_ratio(s.get('normalized_utr', ''), b.get('normalized_reference', ''))
                # If it's an exception case, skip fuzzy match so it reaches Stage 4
                if diff > 1.0 and utr_sim > 80:
                    continue
                best_score = conf['score']
                best_b_id = b_id
                
        if best_b_id:
            log_match(s, [best_b_id], "fuzzy", best_score, "PROBABLE")

    def calc_severity(amount):
        if amount > 500000: return "CRITICAL"
        if amount > 80000: return "HIGH"
        if amount > 12000: return "MEDIUM"
        return "LOW"

    # Stage 4: Exception Classification
    
    # Helpers to find closely matching banks
    def find_near_banks(s):
        near_banks = []
        for b_id, b in unmatched_banks.items():
            if not b['transaction_date'] or not s['settlement_date']: continue
            if abs((b['transaction_date'] - s['settlement_date']).days) <= 3:
                if abs(b['credit_amount'] - s['settled_amount']) <= 1.0:
                    near_banks.append(b_id)
        return near_banks

    for p_id, s in list(unmatched_settlements.items()):
        amount = s['settled_amount']
        reason = None
        b_id_rel = None
        
        # 1. refund_reversal
        is_refund_ledger = False
        o_id = s.get('order_id')
        l_entry = next((l for l in ledger_entries if l['order_id'] == o_id), None)
        if l_entry and l_entry.get('order_status') in ['refunded', 'partially_refunded']:
            is_refund_ledger = True
            
        if amount < 0 or is_refund_ledger:
            reason = "refund_reversal"
            # Try to find a matching bank
            near = find_near_banks(s)
            if near: b_id_rel = near[0]
            elif unmatched_banks: 
                # fallback for missing
                b_id_rel = list(unmatched_banks.keys())[0]
                
        # 2. possible_duplicate
        elif len(find_near_banks(s)) > 1:
            reason = "possible_duplicate"
            b_id_rel = find_near_banks(s)[0]
            
        # 3. fee_variance or amount_mismatch_only
        elif s['normalized_utr']:
            matched_b_ids = [b_id for b_id, b in unmatched_banks.items() if fuzz.partial_ratio(s['normalized_utr'], b['normalized_reference']) > 80]
            if matched_b_ids:
                b_id_rel = matched_b_ids[0]
                b = unmatched_banks[b_id_rel]
                diff = abs(b['credit_amount'] - amount)
                if 1.0 < diff <= 50.0 and s['normalized_utr'] == b['normalized_reference']:
                    reason = "fee_variance"
                elif diff > 1.0:
                    reason = "amount_mismatch_only"

        # 4. no_bank_credit_found
        if not reason:
            reason = "no_bank_credit_found"

        exceptions.append({
            "exception_id": str(uuid.uuid4()),
            "related_settlement_id": p_id,
            "related_bank_transaction_id": b_id_rel,
            "related_ledger_entry_id": None,
            "reason": reason,
            "amount": abs(s['gross_amount']),
            "trust_state": "EXCEPTION",
            "severity": calc_severity(abs(s['gross_amount'])),
            "recommended_action": "Investigate " + reason,
            "ai_summary": None,
            "created_at": datetime.utcnow().isoformat()
        })

    for b_id, b in list(unmatched_banks.items()):
        # Check possible duplicate (multiple settlements matching this bank)
        near_settlements = []
        for p_id, s in unmatched_settlements.items():
            if b['transaction_date'] and s['settlement_date']:
                if abs((b['transaction_date'] - s['settlement_date']).days) <= 3 and abs(b['credit_amount'] - s['settled_amount']) <= 1.0:
                    near_settlements.append(p_id)
                    
        if len(near_settlements) > 1:
            reason = "possible_duplicate"
        else:
            reason = "no_settlement_found"
            
        exceptions.append({
            "exception_id": str(uuid.uuid4()),
            "related_settlement_id": None,
            "related_bank_transaction_id": b_id,
            "related_ledger_entry_id": None,
            "reason": reason,
            "amount": b['credit_amount'],
            "trust_state": "EXCEPTION",
            "severity": calc_severity(b['credit_amount']),
            "recommended_action": "Investigate " + reason,
            "ai_summary": None,
            "created_at": datetime.utcnow().isoformat()
        })
        
    # Ledger to Settlement
    settled_orders = {s['order_id'] for s in settlements if s.get('order_id')}
    for l in ledger_entries:
        if l['order_id'] not in settled_orders:
            exceptions.append({
                "exception_id": str(uuid.uuid4()),
                "related_settlement_id": None,
                "related_bank_transaction_id": None,
                "related_ledger_entry_id": l['order_id'],
                "reason": "no_settlement_for_order",
                "amount": l['amount_charged'],
                "trust_state": "UNRESOLVED",
                "severity": calc_severity(l['amount_charged']),
                "recommended_action": "Investigate no_settlement_for_order",
                "ai_summary": None,
                "created_at": datetime.utcnow().isoformat()
            })

    exception_value = sum(e['amount'] for e in exceptions if e['related_settlement_id'])
    val_recon_rate = reconciled_value / total_settled_value if total_settled_value > 0 else 0.0

    return {
        "matched_records": matched_records,
        "exceptions": exceptions,
        "metrics": {
            "total_settled_value": total_settled_value,
            "reconciled_value": reconciled_value,
            "exception_value": exception_value,
            "value_reconciliation_rate": val_recon_rate
        }
    }
