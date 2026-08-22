import argparse
import csv
import json
import random
import os
from datetime import date, timedelta
from decimal import Decimal

# HARDCODED HOLIDAYS (2026) for realistic T+2 cadence
HOLIDAYS_2026 = [
    date(2026, 1, 26),  # Republic Day
    date(2026, 8, 15),  # Independence Day (Saturday anyway)
    date(2026, 10, 2),  # Gandhi Jayanti
]

def is_business_day(d: date) -> bool:
    if d.weekday() >= 5:  # 5=Sat, 6=Sun
        return False
    if d in HOLIDAYS_2026:
        return False
    return True

def add_business_days(start_date: date, days_to_add: int) -> date:
    d = start_date
    added = 0
    while added < days_to_add:
        d += timedelta(days=1)
        if is_business_day(d):
            added += 1
    return d

def generate_utr() -> str:
    banks = ['HDFC', 'SBIN', 'ICIC', 'UTIB', 'PUNB']
    return f"{random.choice(banks)}000{random.randint(100000000, 999999999)}"

def generate_random_amount() -> Decimal:
    base = random.randint(50, 500) * 10
    if random.random() < 0.2:
        base += random.choice([0.50, 0.25, 0.75])
    return Decimal(str(base))

class DataGenerator:
    def __init__(self, seed: int, n_records: int):
        self.seed = seed
        self.n_records = n_records
        random.seed(seed)
        
        self.ledger_rows = []
        self.settlement_rows = []
        self.bank_rows = []
        self.ground_truth = {}
        
        # We will assign these once all bank records are created and shuffled
        self._temp_bank_records = []
        
        # Config
        self.start_date = date(2026, 8, 1)
        self.end_date = date(2026, 8, 28)

    def random_date(self) -> date:
        delta = self.end_date - self.start_date
        return self.start_date + timedelta(days=random.randint(0, delta.days))

    def run(self):
        # Calculate allocations for exactly n_records settlements
        # DATA_SPEC ratios:
        n_batched = int(self.n_records * 0.08) # ~12
        # Round n_batched to a multiple of 3 for batch groups
        n_batched = (n_batched // 3) * 3 
        n_fuzzy = int(self.n_records * 0.06) # ~9
        
        # Specific exceptions
        n_no_bank_credit = 1
        n_possible_duplicate = 1
        n_amount_mismatch = 2
        
        # Ledger only exceptions
        n_ledger_only = 5
        
        # Bank only exceptions
        n_bank_only = 1
        
        n_clean = self.n_records - (n_batched + n_fuzzy + n_no_bank_credit + n_possible_duplicate + n_amount_mismatch)
        
        # Ensure we meet the total exactly
        assert n_clean + n_batched + n_fuzzy + n_no_bank_credit + n_possible_duplicate + n_amount_mismatch == self.n_records

        # Keep track of settlements generated so far
        self.s_idx = 1
        self.l_idx = 1

        print("--- Data Generation Allocations ---")
        print(f"Total Settlements: {self.n_records}")
        print(f"Clean: {n_clean}")
        print(f"Batched: {n_batched}")
        print(f"Fuzzy: {n_fuzzy}")
        print(f"Exceptions (no bank credit): {n_no_bank_credit}")
        print(f"Exceptions (possible dup): {n_possible_duplicate}")
        print(f"Exceptions (amount mismatch): {n_amount_mismatch}")
        print(f"Exceptions (ledger only): {n_ledger_only}")
        print(f"Exceptions (bank only): {n_bank_only}")
        print("-----------------------------------")
        
        # Assert required subtypes exist per DATA_SPEC
        assert n_no_bank_credit > 0
        assert n_possible_duplicate > 0
        assert n_amount_mismatch > 0
        assert n_ledger_only > 0
        assert n_bank_only > 0

        # 1. Clean Matches
        for _ in range(n_clean):
            self.create_flow(match_type="clean")

        # 2. Batched Matches
        for _ in range(n_batched // 3):
            self.create_batched_flow(batch_size=3)
            
        # 3. Fuzzy Matches
        for _ in range(n_fuzzy):
            self.create_flow(match_type="fuzzy")
            
        # 4. Exceptions (Settlement side)
        for _ in range(n_no_bank_credit):
            self.create_flow(match_type="exception", reason="no_bank_credit_found")
            
        for _ in range(n_possible_duplicate):
            self.create_flow(match_type="exception", reason="possible_duplicate")
            
        for _ in range(n_amount_mismatch):
            self.create_flow(match_type="exception", reason="amount_mismatch_only")

        # 5. Ledger Only (no settlement)
        for _ in range(n_ledger_only):
            self.create_ledger_only()
            
        # 6. Bank Only (no settlement)
        for _ in range(n_bank_only):
            self.create_bank_only()

        # Finalize and Shuffle Bank rows so they aren't perfectly ordered
        random.shuffle(self._temp_bank_records)
        for i, br in enumerate(self._temp_bank_records):
            bank_id = f"bank_row_{i}"
            # Update ground truth with the final row ID
            if br['gt_ref'] is not None:
                # br['gt_ref'] points to the ground truth list of bank IDs for a given settlement
                br['gt_ref'].append(bank_id)
            
            # Format Bank Row for CSV output exactly as requested
            self.bank_rows.append({
                "transaction_date": br["transaction_date"],
                "description": br["description"],
                "credit_amount": br["credit_amount"],
                "reference_number": br["reference_number"],
                "value_date": br["value_date"]
            })

    def get_next_ids(self):
        order_id = f"order_{self.seed}_{self.l_idx:04d}"
        pay_id = f"pay_{self.seed}_{self.s_idx:04d}"
        self.l_idx += 1
        self.s_idx += 1
        return order_id, pay_id

    def create_ledger_record(self, order_id, amount, o_date):
        self.ledger_rows.append({
            "order_id": order_id,
            "customer_name": f"Customer_{random.randint(100, 999)}",
            "amount_charged": amount,
            "order_date": o_date,
            "order_status": "paid"
        })

    def create_settlement_record(self, pay_id, order_id, amount, o_date, utr):
        fee = (amount * Decimal("0.02")).quantize(Decimal("0.01"))
        gst = (fee * Decimal("0.18")).quantize(Decimal("0.01"))
        tds = Decimal("0.00")
        settled = amount - fee - gst - tds
        
        s_date = add_business_days(o_date, 2)
        
        self.settlement_rows.append({
            "payment_id": pay_id,
            "order_id": order_id,
            "gross_amount": amount,
            "razorpay_fee": fee,
            "gst_on_fee": gst,
            "tds": tds,
            "settled_amount": settled,
            "utr": utr,
            "settlement_date": s_date.strftime("%Y-%m-%d"),
            "payment_date": o_date.strftime("%Y-%m-%d"),
            "method": random.choice(["upi", "card", "netbanking"]),
            "status": "settled"
        })
        return settled, s_date

    def create_flow(self, match_type="clean", reason=None):
        o_id, p_id = self.get_next_ids()
        amt = generate_random_amount()
        date_obj = self.random_date()
        utr = generate_utr()
        
        self.create_ledger_record(o_id, amt, date_obj)
        settled_amt, s_date = self.create_settlement_record(p_id, o_id, amt, date_obj, utr)
        
        gt_bank_ids = []
        self.ground_truth[p_id] = {
            "matched_bank_ids": gt_bank_ids,
            "true_match_type": "exact" if match_type == "clean" else match_type,
            "exception_reason": reason
        }

        if match_type == "exception" and reason == "no_bank_credit_found":
            return # No bank record generated

        desc_options = [f"NEFT-{utr}-RAZORPAY", f"UPI-{utr}", f"IMPS-{utr}-SETTLEMENT"]
        bank_desc = random.choice(desc_options)
        bank_ref = utr
        bank_amt = settled_amt
        bank_date = s_date

        if match_type == "fuzzy":
            # Apply 1 or 2 random messiness factors so the score stays above 0.6
            messiness = random.sample(["amount", "date", "utr"], k=1)
            
            if "amount" in messiness:
                bank_amt = bank_amt + Decimal(random.choice(["0.50", "-0.50"]))
            if "utr" in messiness:
                bank_ref = utr[-8:] # Last 8 chars
                bank_desc = f"NEFT-xxxxxxxx{bank_ref}-RZP"
            if "date" in messiness:
                bank_date = s_date + timedelta(days=random.choice([-1, 1]))
            
        elif match_type == "exception" and reason == "amount_mismatch_only":
            bank_amt = bank_amt - Decimal("500.00") # Simulate refund reversal not caught
            
        bank_record = {
            "transaction_date": bank_date.strftime("%Y-%m-%d"),
            "description": bank_desc,
            "credit_amount": bank_amt,
            "reference_number": bank_ref,
            "value_date": bank_date.strftime("%Y-%m-%d"),
            "gt_ref": gt_bank_ids
        }
        
        self._temp_bank_records.append(bank_record)
        
        if match_type == "exception" and reason == "possible_duplicate":
            # Add an exact duplicate
            dup_record = bank_record.copy()
            # It's a duplicate so it also maps back to this settlement
            dup_record["gt_ref"] = gt_bank_ids
            self._temp_bank_records.append(dup_record)


    def create_batched_flow(self, batch_size=3):
        # Multiple settlements map to one bank credit
        s_date = self.random_date()
        s_date_settle = add_business_days(s_date, 2)
        
        total_settled = Decimal("0.00")
        batch_pay_ids = []
        gt_bank_ids = [] # Shared array for all members of the batch
        
        for _ in range(batch_size):
            o_id, p_id = self.get_next_ids()
            amt = generate_random_amount()
            utr = generate_utr() # Different UTRs, but they get batched
            
            self.create_ledger_record(o_id, amt, s_date)
            settled_amt, _ = self.create_settlement_record(p_id, o_id, amt, s_date, utr)
            total_settled += settled_amt
            batch_pay_ids.append(p_id)
            
            self.ground_truth[p_id] = {
                "matched_bank_ids": gt_bank_ids,
                "true_match_type": "batched",
                "exception_reason": None
            }

        # Single bank record
        self._temp_bank_records.append({
            "transaction_date": s_date_settle.strftime("%Y-%m-%d"),
            "description": f"NEFT-BATCH-SETTLEMENT-RZP",
            "credit_amount": total_settled,
            "reference_number": generate_utr(), # Bank creates a new UTR for the batch
            "value_date": s_date_settle.strftime("%Y-%m-%d"),
            "gt_ref": gt_bank_ids
        })

    def create_ledger_only(self):
        o_id = f"order_{self.seed}_{self.l_idx:04d}"
        self.l_idx += 1
        amt = generate_random_amount()
        self.create_ledger_record(o_id, amt, self.random_date())

    def create_bank_only(self):
        s_date = self.random_date()
        self._temp_bank_records.append({
            "transaction_date": s_date.strftime("%Y-%m-%d"),
            "description": f"NEFT-ORPHAN-CREDIT",
            "credit_amount": generate_random_amount(),
            "reference_number": generate_utr(),
            "value_date": s_date.strftime("%Y-%m-%d"),
            "gt_ref": None # Ground truth doesn't track this from settlement perspective
        })

    def save(self, output_dir: str):
        os.makedirs(output_dir, exist_ok=True)
        
        # 1. Ledger
        with open(os.path.join(output_dir, 'internal_ledger.csv'), 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=["order_id", "customer_name", "amount_charged", "order_date", "order_status"])
            writer.writeheader()
            writer.writerows(self.ledger_rows)
            
        # 2. Settlement
        with open(os.path.join(output_dir, 'settlement_report.csv'), 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=[
                "payment_id", "order_id", "gross_amount", "razorpay_fee", "gst_on_fee", 
                "tds", "settled_amount", "utr", "settlement_date", "payment_date", 
                "method", "status"
            ])
            writer.writeheader()
            writer.writerows(self.settlement_rows)
            
        # 3. Bank
        with open(os.path.join(output_dir, 'bank_statement.csv'), 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=[
                "transaction_date", "description", "credit_amount", "reference_number", "value_date"
            ])
            writer.writeheader()
            writer.writerows(self.bank_rows)
            
        # 4. Ground truth
        with open(os.path.join(output_dir, 'ground_truth.json'), 'w') as f:
            json.dump(self.ground_truth, f, indent=2)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--seed", type=int, required=True)
    parser.add_argument("--n_records", type=int, default=150)
    parser.add_argument("--output_dir", type=str, required=True)
    args = parser.parse_args()
    
    generator = DataGenerator(seed=args.seed, n_records=args.n_records)
    generator.run()
    generator.save(args.output_dir)
    print(f"Successfully generated files in {args.output_dir}")
