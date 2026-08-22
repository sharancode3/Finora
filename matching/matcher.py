import csv
import json
import os
import uuid
import itertools
from datetime import datetime
from decimal import Decimal
from rapidfuzz import fuzz

def normalize_date(d_str):
    if not d_str:
        return None
    return datetime.strptime(d_str, "%Y-%m-%d").date()

def normalize_amount(a_str):
    if not a_str:
        return Decimal('0.00')
    return Decimal(a_str).quantize(Decimal('0.01'))

def normalize_str(s):
    if not s:
        return ""
    return s.strip().upper()

def compute_fuzzy_confidence(bank, settlement):
    """
    Stage 3 (fuzzy): implement the exact weighted formula from TRD.md
    amount (30%), date proximity (20%, linear decay across the 3-day window), 
    UTR partial similarity via rapidfuzz.partial_ratio (40%), 
    order-reference similarity (10%). 
    Accept the match only if combined score > 0.6;
    """
    # Amount Score
    amt_diff = abs(bank['credit_amount'] - settlement['settled_amount'])
    if amt_diff <= Decimal('1.00'):
        # linear decay within 1 rupee
        amt_score = 1.0 - float(amt_diff) 
    else:
        amt_score = 0.0

    # Date Score
    date_diff = abs((bank['transaction_date'] - settlement['settlement_date']).days)
    if date_diff <= 3:
        # linear decay across 3 days: 0 diff = 1.0, 1 diff = 0.66, 2 diff = 0.33, 3 diff = 0.0
        date_score = max(0.0, 1.0 - (date_diff / 3.0))
    else:
        date_score = 0.0

    # UTR partial similarity
    utr_score = fuzz.partial_ratio(bank['description'], settlement['utr']) / 100.0

    # Order reference similarity
    # Is order_id in description?
    order_id_clean = normalize_str(settlement['order_id'])
    desc_clean = normalize_str(bank['description'])
    order_score = fuzz.partial_ratio(desc_clean, order_id_clean) / 100.0 if order_id_clean else 0.0

    final_score = (amt_score * 0.30) + (date_score * 0.20) + (utr_score * 0.40) + (order_score * 0.10)
    
    return final_score, {
        "amount_score": round(amt_score, 4),
        "date_score": round(date_score, 4),
        "utr_score": round(utr_score, 4),
        "order_score": round(order_score, 4)
    }

def run_matcher(data_dir, output_dir):
    # Load and normalize data
    settlements = {}
    bank_txns = {}
    ledgers = {}

    with open(os.path.join(data_dir, 'settlement_report.csv'), 'r') as f:
        for row in csv.DictReader(f):
            settlements[row['payment_id']] = {
                'payment_id': row['payment_id'],
                'order_id': row['order_id'],
                'gross_amount': normalize_amount(row['gross_amount']),
                'settled_amount': normalize_amount(row['settled_amount']),
                'utr': normalize_str(row['utr']),
                'settlement_date': normalize_date(row['settlement_date']),
                'raw': row
            }

    with open(os.path.join(data_dir, 'bank_statement.csv'), 'r') as f:
        for i, row in enumerate(csv.DictReader(f)):
            b_id = f"bank_row_{i}"
            bank_txns[b_id] = {
                'bank_id': b_id,
                'transaction_date': normalize_date(row['transaction_date']),
                'description': normalize_str(row['description']),
                'credit_amount': normalize_amount(row['credit_amount']),
                'reference_number': normalize_str(row['reference_number']),
                'raw': row
            }

    with open(os.path.join(data_dir, 'internal_ledger.csv'), 'r') as f:
        for row in csv.DictReader(f):
            ledgers[row['order_id']] = {
                'order_id': row['order_id'],
                'amount_charged': normalize_amount(row['amount_charged']),
                'order_date': normalize_date(row['order_date']),
                'raw': row
            }

    unmatched_settlements = set(settlements.keys())
    unmatched_bank = set(bank_txns.keys())
    
    matches = []
    exceptions = []

    def add_match(s_id, b_id, batch_members, method, confidence, trust_state):
        matches.append({
            "id": f"match_{uuid.uuid4().hex[:8]}",
            "settlement_id": s_id,
            "bank_transaction_id": b_id,
            "batch_members": batch_members,
            "method": method,
            "confidence": round(confidence, 4),
            "trust_state": trust_state,
            "created_at": datetime.utcnow().isoformat() + "Z"
        })

    def add_exception(s_id, b_id, reason, amount, ai_summary=None):
        exceptions.append({
            "id": f"exc_{uuid.uuid4().hex[:8]}",
            "related_settlement_id": s_id,
            "related_bank_transaction_id": b_id,
            "reason": reason,
            "amount": float(amount) if amount is not None else 0.0,
            "ai_summary": ai_summary,
            "trust_state": "EXCEPTION",
            "created_at": datetime.utcnow().isoformat() + "Z"
        })

    # STAGE 1: Exact
    for p_id in list(unmatched_settlements):
        s = settlements[p_id]
        if not s['utr']: continue
        
        candidates = [b_id for b_id in unmatched_bank if bank_txns[b_id]['reference_number'] == s['utr']]
        
        if len(candidates) == 1:
            b_id = candidates[0]
            b = bank_txns[b_id]
            if abs(b['credit_amount'] - s['settled_amount']) <= Decimal('0.01'):
                add_match(p_id, b_id, None, "exact", 1.0, "VERIFIED")
                unmatched_settlements.remove(p_id)
                unmatched_bank.remove(b_id)

    # STAGE 2: Batched
    for b_id in list(unmatched_bank):
        b = bank_txns[b_id]
        b_date = b['transaction_date']
        
        candidates = []
        for p_id in unmatched_settlements:
            s = settlements[p_id]
            if abs((s['settlement_date'] - b_date).days) <= 1:
                candidates.append(p_id)
                
        found_batch = False
        for r in range(2, 5): 
            if found_batch: break
            for subset in itertools.combinations(candidates, r):
                subset_sum = sum(settlements[p_id]['settled_amount'] for p_id in subset)
                if abs(subset_sum - b['credit_amount']) <= Decimal('0.01'):
                    add_match(None, b_id, list(subset), "batched", 0.9, "VERIFIED")
                    unmatched_bank.remove(b_id)
                    for p_id in subset:
                        unmatched_settlements.remove(p_id)
                    found_batch = True
                    break

    # STAGE 3: Fuzzy
    for p_id in list(unmatched_settlements):
        s = settlements[p_id]
        best_b_id = None
        best_score = 0.0
        
        for b_id in unmatched_bank:
            b = bank_txns[b_id]
            # If UTR matches exactly, it failed Stage 1. 
            # We must skip it if it's a true Stage 4 exception (duplicate or large amount mismatch).
            if s['utr'] and b['reference_number'] == s['utr']:
                exact_matches = [b2 for b2 in unmatched_bank if bank_txns[b2]['reference_number'] == s['utr']]
                if len(exact_matches) > 1:
                    continue # duplicate exception
                if abs(b['credit_amount'] - s['settled_amount']) > Decimal('1.00'):
                    continue # amount mismatch exception
                
            score, comps = compute_fuzzy_confidence(b, s)
            if score > best_score:
                best_score = score
                best_b_id = b_id
                
        if best_score > 0.6 and best_b_id is not None:
            add_match(p_id, best_b_id, None, "fuzzy", best_score, "PROBABLE")
            unmatched_settlements.remove(p_id)
            unmatched_bank.remove(best_b_id)

    # STAGE 4: Exceptions
    for p_id in list(unmatched_settlements):
        s = settlements[p_id]
        candidates = [b_id for b_id in unmatched_bank if bank_txns[b_id]['reference_number'] == s['utr']]
        
        if len(candidates) > 1:
            for b_id in candidates:
                add_exception(p_id, b_id, "possible_duplicate", bank_txns[b_id]['credit_amount'])
                unmatched_bank.remove(b_id)
            unmatched_settlements.remove(p_id)
        elif len(candidates) == 1:
            b_id = candidates[0]
            add_exception(p_id, b_id, "amount_mismatch_only", abs(bank_txns[b_id]['credit_amount'] - s['settled_amount']))
            unmatched_bank.remove(b_id)
            unmatched_settlements.remove(p_id)
        else:
            add_exception(p_id, None, "no_bank_credit_found", s['settled_amount'])
            unmatched_settlements.remove(p_id)

    for b_id in list(unmatched_bank):
        add_exception(None, b_id, "no_settlement_found", bank_txns[b_id]['credit_amount'])
        unmatched_bank.remove(b_id)

    for o_id, l in ledgers.items():
        found = False
        for s in settlements.values():
            if s['order_id'] == o_id:
                found = True
                break
        if not found:
            add_exception(None, None, "no_settlement_for_order", l['amount_charged'])

    os.makedirs(output_dir, exist_ok=True)
    with open(os.path.join(output_dir, 'matched_records.json'), 'w') as f:
        json.dump(matches, f, indent=2)
        
    with open(os.path.join(output_dir, 'exceptions.json'), 'w') as f:
        json.dump(exceptions, f, indent=2)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", default="data/output")
    parser.add_argument("--output_dir", default="data/output")
    args = parser.parse_args()
    run_matcher(args.data_dir, args.output_dir)
    print("Matching engine run complete.")
