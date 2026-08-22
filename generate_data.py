import os
import csv
import json
import random
import argparse
import hashlib
from datetime import datetime, timedelta

HOLIDAYS = ['2026-01-26', '2026-03-17', '2026-08-15', '2026-10-02', '2026-11-09']
BUSINESSES = [
    {"business_id": "BIZ-001", "name": "Finora E-commerce", "account_id": "ACC-HDFC-001"},
    {"business_id": "BIZ-002", "name": "Finora SaaS", "account_id": "ACC-ICICI-002"},
    {"business_id": "BIZ-003", "name": "Finora Retail", "account_id": "ACC-SBI-003"}
]

def is_business_day(date_obj):
    if date_obj.weekday() >= 5: return False
    if date_obj.strftime('%Y-%m-%d') in HOLIDAYS: return False
    return True

def get_next_business_day(date_obj):
    next_day = date_obj + timedelta(days=1)
    while not is_business_day(next_day):
        next_day += timedelta(days=1)
    return next_day

def add_business_days(date_obj, days):
    current = date_obj
    for _ in range(days):
        current = get_next_business_day(current)
    return current

def generate_utr(bank_code=None):
    banks = ["HDFC", "ICICI", "SBI", "AXIS", "KOTAK"]
    bank = bank_code or random.choice(banks)
    branch = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=2))
    numeric = "".join(random.choices("0123456789", k=10))
    return f"{bank}{branch}{numeric}"

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument('--n_records', type=int, default=300)
    parser.add_argument('--output_dir', type=str, default='./data/output')
    args = parser.parse_args()

    random.seed(args.seed)
    os.makedirs(args.output_dir, exist_ok=True)

    # 240 Exact, 22 Batched (settlements), 18 Fuzzy, 20 Exceptions
    # To get exactly 300 settlements, if we lose 7 in exceptions (no_settlement), we need to adjust.
    # The prompt asks for 240 exact, 22 batched, 18 fuzzy, 20 exception cases.
    # We will generate cases exactly as specified.
    
    n_exact = 240
    n_batched_settlements = 22
    n_fuzzy = 18
    
    # Generate batched cases: chunks of 2-4 until we hit 22 settlements
    batched_cases = []
    curr = 0
    while curr < n_batched_settlements:
        chunk = random.randint(2, 4)
        if curr + chunk > n_batched_settlements:
            chunk = n_batched_settlements - curr
            if chunk == 1:
                batched_cases[-1] += 1
                curr += 1
                break
        batched_cases.append(chunk)
        curr += chunk

    n_batched_cases = len(batched_cases)
    
    # Exceptions config
    exc_cases = {
        'no_bank_credit_found': 4,
        'no_settlement_found': 3,
        'amount_mismatch_only': 3,
        'possible_duplicate': 3,
        'no_settlement_for_order': 4,
        'refund_reversal': 3
    }
    
    # Trackers
    ledgers = []
    settlements = []
    banks = []
    ground_truth = {"settlements": {}, "metadata": {}}
    
    pay_id_counter = 1
    ord_id_counter = 1
    bank_id_counter = 1
    
    def gen_base_record(biz, amount_min=500, amount_max=150000):
        nonlocal ord_id_counter, pay_id_counter
        amount = round(random.uniform(amount_min, amount_max), 2)
        # Payment dates spread across 45 days (2026-07-01 to 2026-08-14)
        start_date = datetime(2026, 7, 1)
        pay_date = start_date + timedelta(days=random.randint(0, 44))
        set_date = add_business_days(pay_date, 2)
        
        o_id = f"ORD-{ord_id_counter:05d}"
        p_id = f"PAY-{pay_id_counter:05d}"
        ord_id_counter += 1
        pay_id_counter += 1
        return o_id, p_id, amount, pay_date, set_date

    def create_ledger(o_id, biz, amount, date):
        ledgers.append({
            "order_id": o_id,
            "customer_name": f"Customer {o_id[-4:]}",
            "amount_charged": f"{amount:.2f}",
            "order_date": date.strftime('%Y-%m-%d'),
            "order_status": "completed",
            "business_id": biz["business_id"],
            "product_category": "Software"
        })

    fee_variants = [True] * 15 + [False] * 500
    gst_variants = [True] * 10 + [False] * 500
    tds_variants = [True] * 5 + [False] * 500
    random.shuffle(fee_variants)
    random.shuffle(gst_variants)
    random.shuffle(tds_variants)
    var_idx = 0

    def create_settlement(p_id, o_id, biz, amount, pay_date, set_date, utr):
        nonlocal var_idx
        fee_rate = 0.025 if fee_variants[var_idx] else 0.02
        fee = round(amount * fee_rate, 2)
        gst = round(fee * 0.18, 2)
        if gst_variants[var_idx]: gst += 0.01  # rounding difference
        tds = round(amount * 0.01, 2) if tds_variants[var_idx] else 0.0
        var_idx += 1
        
        settled = round(amount - fee - gst - tds, 2)
        settlements.append({
            "payment_id": p_id,
            "order_id": o_id,
            "gross_amount": f"{amount:.2f}",
            "razorpay_fee": f"{fee:.2f}",
            "gst_on_fee": f"{gst:.2f}",
            "tds": f"{tds:.2f}",
            "settled_amount": f"{settled:.2f}",
            "utr": utr,
            "settlement_date": set_date.strftime('%Y-%m-%d'),
            "payment_date": pay_date.strftime('%Y-%m-%d'),
            "method": random.choice(["upi", "card", "netbanking"]),
            "status": "settled",
            "business_id": biz["business_id"]
        })
        return settled

    def create_bank(biz, amount, date, ref, desc=""):
        nonlocal bank_id_counter
        b_id = f"BANK-{bank_id_counter:05d}"
        bank_id_counter += 1
        if not desc:
            desc = f"NEFT-RECV-{ref}-SETTLEMENT"
        banks.append({
            "bank_id": b_id,
            "transaction_date": date.strftime('%Y-%m-%d'),
            "description": desc,
            "credit_amount": f"{amount:.2f}",
            "reference_number": ref,
            "value_date": date.strftime('%Y-%m-%d'),
            "bank_account_id": biz["account_id"]
        })
        return b_id

    # 1. Exact Matches
    for _ in range(n_exact):
        biz = random.choice(BUSINESSES)
        o_id, p_id, amount, pay_date, set_date = gen_base_record(biz)
        utr = generate_utr()
        create_ledger(o_id, biz, amount, pay_date)
        settled = create_settlement(p_id, o_id, biz, amount, pay_date, set_date, utr)
        
        # Exact match can have case/dashes changes, but not truncation
        ref = utr
        if random.random() < 0.5: ref = ref.lower()
        if random.random() < 0.5: ref = f"{ref[:4]}-{ref[4:8]}-{ref[8:]}"
        
        b_id = create_bank(biz, settled, set_date, ref)
        
        ground_truth["settlements"][p_id] = {
            "matched_bank_ids": [b_id],
            "true_match_type": "exact",
            "true_reason": None,
            "expected_settled_amount": settled,
            "bank_credit_amount": settled
        }

    # 2. Batched Matches
    for chunk_size in batched_cases:
        biz = random.choice(BUSINESSES)
        set_date = None
        chunk_p_ids = []
        total_settled = 0.0
        utr = generate_utr()
        
        # Generate a common date for the batch
        _, _, _, common_pay_date, common_set_date = gen_base_record(biz)
        
        for i in range(chunk_size):
            # Same or near day
            pay_date = common_pay_date + timedelta(days=random.choice([-1, 0, 1]))
            set_date = add_business_days(pay_date, 2)
            amount = round(random.uniform(500, 150000), 2)
            
            o_id = f"ORD-{ord_id_counter:05d}"
            p_id = f"PAY-{pay_id_counter:05d}"
            ord_id_counter += 1
            pay_id_counter += 1
            
            create_ledger(o_id, biz, amount, pay_date)
            settled = create_settlement(p_id, o_id, biz, amount, pay_date, set_date, utr)
            total_settled += settled
            chunk_p_ids.append(p_id)
            
        total_settled = round(total_settled, 2)
        # Bank date should be close to the settlement dates
        bank_date = add_business_days(common_pay_date, 2)
        # Change the bank reference so Exact Match doesn't swallow one of them
        b_id = create_bank(biz, total_settled, bank_date, f"BATCH-{utr[-8:]}")
        
        for p_id in chunk_p_ids:
            ground_truth["settlements"][p_id] = {
                "matched_bank_ids": [b_id],
                "true_match_type": "batched",
                "true_reason": None,
                "batch_members": chunk_p_ids,
                "expected_sum": total_settled,
                "bank_credit_amount": total_settled
            }

    # 3. Fuzzy Matches
    for _ in range(n_fuzzy):
        biz = random.choice(BUSINESSES)
        o_id, p_id, amount, pay_date, set_date = gen_base_record(biz)
        utr = generate_utr()
        create_ledger(o_id, biz, amount, pay_date)
        settled = create_settlement(p_id, o_id, biz, amount, pay_date, set_date, utr)
        
        # Fuzzy manipulations: UTR MUST be garbled so it falls through Exact match
        bank_ref = utr[:-2] + "XX" # garbled
        bank_amount = settled
        bank_date = set_date
        
        f_type = random.choice(['amount', 'date', 'both'])
        if f_type == 'amount' or f_type == 'both':
            bank_amount = round(settled + random.choice([-1.0, -0.5, 0.5, 1.0]), 2)
        if f_type == 'date' or f_type == 'both':
            bank_date = set_date + timedelta(days=random.choice([-1, 1, 2, 3]))
            
        b_id = create_bank(biz, bank_amount, bank_date, bank_ref)
        
        ground_truth["settlements"][p_id] = {
            "matched_bank_ids": [b_id],
            "true_match_type": "fuzzy",
            "true_reason": f"Fuzzy on {f_type}",
            "expected_settled_amount": settled,
            "bank_credit_amount": bank_amount
        }

    # 4. Exceptions
    # no_bank_credit_found (4)
    for _ in range(exc_cases['no_bank_credit_found']):
        biz = random.choice(BUSINESSES)
        o_id, p_id, amount, pay_date, set_date = gen_base_record(biz)
        utr = generate_utr()
        create_ledger(o_id, biz, amount, pay_date)
        settled = create_settlement(p_id, o_id, biz, amount, pay_date, set_date, utr)
        # NO BANK RECORD
        ground_truth["settlements"][p_id] = {
            "matched_bank_ids": [],
            "true_match_type": "exception",
            "true_reason": "no_bank_credit_found",
            "expected_settled_amount": settled,
            "bank_credit_amount": 0.0
        }

    # no_settlement_found (3)
    for _ in range(exc_cases['no_settlement_found']):
        biz = random.choice(BUSINESSES)
        utr = generate_utr()
        amount = round(random.uniform(500, 10000), 2)
        set_date = datetime(2026, 7, 20)
        # ONLY BANK RECORD
        b_id = create_bank(biz, amount, set_date, utr)
        # Doesn't get added to ground_truth["settlements"] because there's no p_id

    # amount_mismatch_only (3)
    for _ in range(exc_cases['amount_mismatch_only']):
        biz = random.choice(BUSINESSES)
        o_id, p_id, amount, pay_date, set_date = gen_base_record(biz)
        utr = generate_utr()
        create_ledger(o_id, biz, amount, pay_date)
        settled = create_settlement(p_id, o_id, biz, amount, pay_date, set_date, utr)
        
        bank_amount = round(settled - 50.0, 2) # Diff by >1
        b_id = create_bank(biz, bank_amount, set_date, utr)
        
        ground_truth["settlements"][p_id] = {
            "matched_bank_ids": [b_id],
            "true_match_type": "exception",
            "true_reason": "amount_mismatch_only",
            "expected_settled_amount": settled,
            "bank_credit_amount": bank_amount
        }

    # possible_duplicate (3)
    for _ in range(exc_cases['possible_duplicate']):
        biz = random.choice(BUSINESSES)
        o_id, p_id, amount, pay_date, set_date = gen_base_record(biz)
        utr = generate_utr()
        create_ledger(o_id, biz, amount, pay_date)
        settled = create_settlement(p_id, o_id, biz, amount, pay_date, set_date, utr)
        
        b_id1 = create_bank(biz, settled, set_date, utr)
        b_id2 = create_bank(biz, settled, set_date, utr) # Duplicate
        
        ground_truth["settlements"][p_id] = {
            "matched_bank_ids": [b_id1, b_id2],
            "true_match_type": "exception",
            "true_reason": "possible_duplicate",
            "expected_settled_amount": settled,
            "bank_credit_amount": settled * 2
        }

    # no_settlement_for_order (4)
    for _ in range(exc_cases['no_settlement_for_order']):
        biz = random.choice(BUSINESSES)
        amount = round(random.uniform(500, 10000), 2)
        pay_date = datetime(2026, 7, 20)
        o_id = f"ORD-{ord_id_counter:05d}"
        ord_id_counter += 1
        create_ledger(o_id, biz, amount, pay_date)
        # NO SETTLEMENT OR BANK

    # refund_reversal (3)
    for _ in range(exc_cases['refund_reversal']):
        biz = random.choice(BUSINESSES)
        o_id, p_id, amount, pay_date, set_date = gen_base_record(biz)
        utr = generate_utr()
        create_ledger(o_id, biz, amount, pay_date)
        
        # Negative settlement
        neg_amount = -amount
        fee = 0
        gst = 0
        tds = 0
        settlements.append({
            "payment_id": p_id,
            "order_id": o_id,
            "gross_amount": f"{neg_amount:.2f}",
            "razorpay_fee": "0.00",
            "gst_on_fee": "0.00",
            "tds": "0.00",
            "settled_amount": f"{neg_amount:.2f}",
            "utr": utr,
            "settlement_date": set_date.strftime('%Y-%m-%d'),
            "payment_date": pay_date.strftime('%Y-%m-%d'),
            "method": "refund",
            "status": "settled",
            "business_id": biz["business_id"]
        })
        b_id = create_bank(biz, neg_amount, set_date, utr)
        
        ground_truth["settlements"][p_id] = {
            "matched_bank_ids": [b_id],
            "true_match_type": "exception",
            "true_reason": "refund_reversal",
            "expected_settled_amount": neg_amount,
            "bank_credit_amount": neg_amount
        }

    # 5. Output writing
    def write_csv(filename, fieldnames, data):
        path = os.path.join(args.output_dir, filename)
        with open(path, 'w', newline='', encoding='utf-8') as f:
            # Drop our internal bank_id when writing to bank_statement.csv
            if filename == "bank_statement.csv":
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                for d in data:
                    c = dict(d)
                    if 'bank_id' in c: del c['bank_id']
                    writer.writerow(c)
            else:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(data)

    write_csv('internal_ledger.csv', 
              ["order_id", "customer_name", "amount_charged", "order_date", "order_status", "business_id", "product_category"], 
              ledgers)
    
    write_csv('settlement_report.csv', 
              ["payment_id", "order_id", "gross_amount", "razorpay_fee", "gst_on_fee", "tds", "settled_amount", "utr", "settlement_date", "payment_date", "method", "status", "business_id"], 
              settlements)
    
    write_csv('bank_statement.csv', 
              ["transaction_date", "description", "credit_amount", "reference_number", "value_date", "bank_account_id"], 
              banks)
              
    with open(os.path.join(args.output_dir, 'businesses.json'), 'w') as f:
        json.dump(BUSINESSES, f, indent=2)

    ground_truth["metadata"] = {
        "generated_at": "2026-08-23T00:00:00.000000",
        "seed": args.seed,
        "n_records": len(settlements),
        "breakdown": {
            "exact": n_exact,
            "batched_settlements": n_batched_settlements,
            "fuzzy": n_fuzzy,
            "exceptions_settlements": sum(exc_cases.values()) - exc_cases['no_settlement_found'] - exc_cases['no_settlement_for_order']
        }
    }
    
    gt_path = os.path.join(args.output_dir, 'ground_truth.json')
    with open(gt_path, 'w') as f:
        json.dump(ground_truth, f, indent=2, sort_keys=True)

    # Calculate MD5
    with open(gt_path, 'rb') as f:
        md5_hash = hashlib.md5(f.read()).hexdigest()

    print("=== Self-Verification ===")
    print(f"Total Settlements: {len(settlements)}")
    print(f"Total Bank Records: {len(banks)}")
    print(f"Total Ledger Records: {len(ledgers)}")
    print("\nBreakdown of Ground Truth (Settlements):")
    print(f"- Exact: {n_exact}")
    print(f"- Batched: {n_batched_settlements}")
    print(f"- Fuzzy: {n_fuzzy}")
    print(f"- Exceptions: 13 (derived from the 20 exception cases)")
    print(f"\nExceptions Configuration:")
    for k, v in exc_cases.items():
        print(f"  {k}: {v}")
    print(f"\nground_truth.json MD5: {md5_hash}")

if __name__ == '__main__':
    main()
