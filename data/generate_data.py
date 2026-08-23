import os
import sys
import io
import csv
import json
import random
import uuid
import sqlite3
from datetime import date, datetime, timedelta
from decimal import Decimal

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Indian Statutory / Business Calendar Holidays for August 2026
HOLIDAYS_AUG_2026 = [
    date(2026, 8, 15),  # Independence Day
]

def is_business_day(d: date) -> bool:
    if d.weekday() >= 5:  # Saturday = 5, Sunday = 6
        return False
    if d in HOLIDAYS_AUG_2026:
        return False
    return True

def add_business_days(start_d: date, days_to_add: int) -> date:
    cur = start_d
    added = 0
    while added < days_to_add:
        cur += timedelta(days=1)
        if is_business_day(cur):
            added += 1
    return cur

def generate_utr(bank_code="KKBK") -> str:
    numeric = "".join(random.choices("0123456789", k=12))
    return f"{bank_code}{numeric}"

class FinoraDataGenerator:
    def __init__(self, seed: int = 42):
        self.seed = seed
        random.seed(seed)
        
        self.start_date = date(2026, 8, 1)
        self.end_date = date(2026, 8, 31)
        
        # Accounts Specification
        self.ACCOUNTS = [
            {
                "account_id": "demo_org_1",
                "name": "Razorpay Gateway (Business)",
                "type": "payment_gateway",
                "status": "connected",
                "connected_at": "2026-08-01T00:00:00Z",
                "last_synced_at": "2026-08-31T17:40:00Z",
                "sync_status": "healthy",
                "sync_message": None,
                "key_id": "rzp_test_89aNqP44v"
            },
            {
                "account_id": "acct_kotak_bank",
                "name": "Kotak Mahindra Bank — Business Current Account",
                "type": "bank_feed",
                "status": "connected",
                "connected_at": "2026-08-01T00:00:00Z",
                "last_synced_at": "2026-08-31T17:15:00Z",
                "sync_status": "healthy",
                "sync_message": None,
                "account_number": "981200481920"
            },
            {
                "account_id": "acct_hdfc_bank",
                "name": "HDFC Bank — Business Current Account",
                "type": "bank_feed",
                "status": "connected",
                "connected_at": "2026-08-05T00:00:00Z",
                "last_synced_at": "2026-08-31T17:15:00Z",
                "sync_status": "healthy",
                "sync_message": None,
                "account_number": "50200084920192"
            },
            {
                "account_id": "acct_paypal_wallet",
                "name": "PayPal — International Wallet",
                "type": "wallet",
                "status": "connected",
                "connected_at": "2026-08-08T00:00:00Z",
                "last_synced_at": "2026-08-31T16:30:00Z",
                "sync_status": "healthy",
                "sync_message": None,
                "key_id": "paypal_merch_in_94"
            }
        ]

        self.ledger_rows = []
        self.settlement_rows = []
        self.bank_rows = []
        self.temp_bank_records = []
        self.ground_truth = {"settlements": {}, "ledger": {}, "bank": {}}
        
        self.db_transactions = []
        self.db_exceptions = []
        self.db_investigations = []

    def random_day(self, start_day=1, end_day=28) -> date:
        day = random.randint(start_day, end_day)
        return date(2026, 8, day)

    def generate(self):
        print("=== Generating Finora August 2026 Ledger Data ===")
        
        # 1. Clean Exact Matches — Razorpay Gateway settling to Kotak (70%) and HDFC (30%)
        # 36 Exact matches
        for i in range(1, 37):
            order_id = f"ORD-2026-08-{i:04d}"
            pay_id = f"PAY-00{i:03d}"
            order_date = self.random_day(1, 26)
            
            # Amount between 1,200 and 8,500
            gross = Decimal(str(random.randint(12, 85) * 100))
            if random.random() < 0.25:
                gross += Decimal(str(random.choice([0.50, 0.25, 0.75])))
            
            fee = (gross * Decimal("0.02")).quantize(Decimal("0.01"))
            gst = (fee * Decimal("0.18")).quantize(Decimal("0.01"))
            net = (gross - fee - gst).quantize(Decimal("0.01"))
            
            settlement_date = add_business_days(order_date, 2)
            
            # 70% Kotak, 30% HDFC
            is_kotak = (i % 10 < 7)
            dest_bank_acct = "Kotak Mahindra Bank — Business Current Account" if is_kotak else "HDFC Bank — Business Current Account"
            bank_code = "KKBK" if is_kotak else "HDFC"
            utr = generate_utr(bank_code)
            
            # Ledger
            self.ledger_rows.append({
                "order_id": order_id,
                "customer_name": f"Customer_{random.randint(100, 999)}",
                "amount_charged": float(gross),
                "order_date": order_date.strftime("%Y-%m-%d"),
                "order_status": "paid",
                "source_account": "Razorpay Gateway (Business)"
            })
            
            # Settlement
            self.settlement_rows.append({
                "payment_id": pay_id,
                "order_id": order_id,
                "gross_amount": float(gross),
                "razorpay_fee": float(fee),
                "gst_on_fee": float(gst),
                "tds": 0.0,
                "settled_amount": float(net),
                "utr": utr,
                "settlement_date": settlement_date.strftime("%Y-%m-%d"),
                "payment_date": order_date.strftime("%Y-%m-%d"),
                "method": random.choice(["upi", "card", "netbanking"]),
                "status": "settled",
                "source_account": "Razorpay Gateway (Business)",
                "destination_account": dest_bank_acct
            })
            
            # Bank Statement
            desc = f"CMS-RAZORPAY-SETTLEMENT-{utr}"
            bank_id = f"bnk_row_{len(self.temp_bank_records):04d}"
            self.temp_bank_records.append({
                "bank_id": bank_id,
                "transaction_date": settlement_date.strftime("%Y-%m-%d"),
                "description": desc,
                "credit_amount": float(net),
                "reference_number": utr,
                "value_date": settlement_date.strftime("%Y-%m-%d"),
                "source_account": dest_bank_acct,
                "gt_payment_id": pay_id
            })
            
            # Ground truth
            self.ground_truth["settlements"][pay_id] = {
                "matched_bank_ids": [bank_id],
                "true_match_type": "exact",
                "source_account": "Razorpay Gateway (Business)",
                "destination_account": dest_bank_acct
            }
            
            # SQLite Transaction
            tx_id = f"txn_{uuid.uuid4().hex[:12]}"
            self.db_transactions.append((
                tx_id, "demo_org_1", order_date.strftime("%Y-%m-%d"),
                float(gross), float(fee), float(gst), float(net),
                utr, settlement_date.strftime("%Y-%m-%d"), "settled",
                "Razorpay Gateway (Business)"
            ))

        # 2. Batched Matches — 1 Razorpay Domestic Batch (3 orders -> 1 bulk Bank UTR credit to Kotak)
        batch_orders = []
        batch_net_sum = Decimal("0.00")
        batch_date = date(2026, 8, 12)
        batch_settle_date = add_business_days(batch_date, 2)
        batch_utr = generate_utr("KKBK")
        batch_pay_ids = []
        
        for b_i in range(1, 4):
            idx = 36 + b_i
            order_id = f"ORD-2026-08-{idx:04d}"
            pay_id = f"PAY-00{idx:03d}"
            batch_pay_ids.append(pay_id)
            gross = Decimal(str(random.randint(18, 40) * 100))
            fee = (gross * Decimal("0.02")).quantize(Decimal("0.01"))
            gst = (fee * Decimal("0.18")).quantize(Decimal("0.01"))
            net = (gross - fee - gst).quantize(Decimal("0.01"))
            batch_net_sum += net
            
            self.ledger_rows.append({
                "order_id": order_id,
                "customer_name": f"Enterprise_Client_{b_i}",
                "amount_charged": float(gross),
                "order_date": batch_date.strftime("%Y-%m-%d"),
                "order_status": "paid",
                "source_account": "Razorpay Gateway (Business)"
            })
            
            self.settlement_rows.append({
                "payment_id": pay_id,
                "order_id": order_id,
                "gross_amount": float(gross),
                "razorpay_fee": float(fee),
                "gst_on_fee": float(gst),
                "tds": 0.0,
                "settled_amount": float(net),
                "utr": batch_utr,
                "settlement_date": batch_settle_date.strftime("%Y-%m-%d"),
                "payment_date": batch_date.strftime("%Y-%m-%d"),
                "method": "card",
                "status": "settled",
                "source_account": "Razorpay Gateway (Business)",
                "destination_account": "Kotak Mahindra Bank — Business Current Account"
            })
            
            tx_id = f"txn_{uuid.uuid4().hex[:12]}"
            self.db_transactions.append((
                tx_id, "demo_org_1", batch_date.strftime("%Y-%m-%d"),
                float(gross), float(fee), float(gst), float(net),
                batch_utr, batch_settle_date.strftime("%Y-%m-%d"), "settled",
                "Razorpay Gateway (Business)"
            ))

        bank_id_batch = f"bnk_row_{len(self.temp_bank_records):04d}"
        self.temp_bank_records.append({
            "bank_id": bank_id_batch,
            "transaction_date": batch_settle_date.strftime("%Y-%m-%d"),
            "description": f"NEFT-BULK-RAZORPAY-BATCH-{batch_utr}",
            "credit_amount": float(batch_net_sum),
            "reference_number": batch_utr,
            "value_date": batch_settle_date.strftime("%Y-%m-%d"),
            "source_account": "Kotak Mahindra Bank — Business Current Account",
            "gt_payment_id": batch_pay_ids
        })
        for pid in batch_pay_ids:
            self.ground_truth["settlements"][pid] = {
                "matched_bank_ids": [bank_id_batch],
                "true_match_type": "batched",
                "source_account": "Razorpay Gateway (Business)",
                "destination_account": "Kotak Mahindra Bank — Business Current Account"
            }

        # 3. PayPal International Wallet Batched Settlements -> Kotak Bank (12 international orders in 2 payout batches)
        # Batch A: 6 international orders settling on Aug 16
        # Batch B: 6 international orders settling on Aug 30
        for batch_num, (o_start, s_day) in enumerate([(1, 16), (2, 30)], 1):
            pp_batch_pay_ids = []
            pp_net_sum = Decimal("0.00")
            pp_utr = f"PP-PAYOUT-202608{s_day}-KKBK"
            settle_date = date(2026, 8, s_day)
            
            for p_sub in range(1, 7):
                p_idx = 40 + (batch_num - 1) * 6 + p_sub
                order_id = f"ORD-INTL-2026-08-{p_idx:04d}"
                pay_id = f"PAY-PP-00{p_idx:03d}"
                pp_batch_pay_ids.append(pay_id)
                order_date = date(2026, 8, s_day - random.randint(2, 4))
                
                # International gross: ~2,500 to 5,500 INR
                gross = Decimal(str(random.randint(25, 55) * 100))
                # PayPal fee: 4.4% + fixed fee ~25 INR
                fee = (gross * Decimal("0.044") + Decimal("25.00")).quantize(Decimal("0.01"))
                gst = (fee * Decimal("0.18")).quantize(Decimal("0.01"))
                net = (gross - fee - gst).quantize(Decimal("0.01"))
                pp_net_sum += net
                
                self.ledger_rows.append({
                    "order_id": order_id,
                    "customer_name": f"Global_Buyer_{p_idx}",
                    "amount_charged": float(gross),
                    "order_date": order_date.strftime("%Y-%m-%d"),
                    "order_status": "paid",
                    "source_account": "PayPal — International Wallet"
                })
                
                self.settlement_rows.append({
                    "payment_id": pay_id,
                    "order_id": order_id,
                    "gross_amount": float(gross),
                    "razorpay_fee": float(fee),
                    "gst_on_fee": float(gst),
                    "tds": 0.0,
                    "settled_amount": float(net),
                    "utr": pp_utr,
                    "settlement_date": settle_date.strftime("%Y-%m-%d"),
                    "payment_date": order_date.strftime("%Y-%m-%d"),
                    "method": "paypal_wallet",
                    "status": "settled",
                    "source_account": "PayPal — International Wallet",
                    "destination_account": "Kotak Mahindra Bank — Business Current Account"
                })
                
                tx_id = f"txn_{uuid.uuid4().hex[:12]}"
                self.db_transactions.append((
                    tx_id, "acct_paypal_wallet", order_date.strftime("%Y-%m-%d"),
                    float(gross), float(fee), float(gst), float(net),
                    pp_utr, settle_date.strftime("%Y-%m-%d"), "settled",
                    "PayPal — International Wallet"
                ))

            bank_id_pp = f"bnk_row_{len(self.temp_bank_records):04d}"
            self.temp_bank_records.append({
                "bank_id": bank_id_pp,
                "transaction_date": settle_date.strftime("%Y-%m-%d"),
                "description": f"CMS-PAYPAL-LUMP-SUM-PAYOUT-{pp_utr}",
                "credit_amount": float(pp_net_sum),
                "reference_number": pp_utr,
                "value_date": settle_date.strftime("%Y-%m-%d"),
                "source_account": "Kotak Mahindra Bank — Business Current Account",
                "gt_payment_id": pp_batch_pay_ids
            })
            for pid in pp_batch_pay_ids:
                self.ground_truth["settlements"][pid] = {
                    "matched_bank_ids": [bank_id_pp],
                    "true_match_type": "batched",
                    "source_account": "PayPal — International Wallet",
                    "destination_account": "Kotak Mahindra Bank — Business Current Account"
                }

        # 4. Fuzzy Matches (3 transactions with minor timing / ref difference)
        for f_i in range(1, 4):
            idx = 52 + f_i
            order_id = f"ORD-2026-08-{idx:04d}"
            pay_id = f"PAY-00{idx:03d}"
            order_date = date(2026, 8, 10 + f_i * 3)
            gross = Decimal(str(random.randint(20, 45) * 100))
            fee = (gross * Decimal("0.02")).quantize(Decimal("0.01"))
            gst = (fee * Decimal("0.18")).quantize(Decimal("0.01"))
            net = (gross - fee - gst).quantize(Decimal("0.01"))
            
            settlement_date = add_business_days(order_date, 2)
            bank_date = settlement_date + timedelta(days=1)  # 1 day bank clearing lag
            utr = generate_utr("HDFC")
            # Bank statement truncated UTR reference (fuzzy trigger)
            bank_ref = utr[:10]
            
            self.ledger_rows.append({
                "order_id": order_id,
                "customer_name": f"Fuzzy_Client_{f_i}",
                "amount_charged": float(gross),
                "order_date": order_date.strftime("%Y-%m-%d"),
                "order_status": "paid",
                "source_account": "Razorpay Gateway (Business)"
            })
            
            self.settlement_rows.append({
                "payment_id": pay_id,
                "order_id": order_id,
                "gross_amount": float(gross),
                "razorpay_fee": float(fee),
                "gst_on_fee": float(gst),
                "tds": 0.0,
                "settled_amount": float(net),
                "utr": utr,
                "settlement_date": settlement_date.strftime("%Y-%m-%d"),
                "payment_date": order_date.strftime("%Y-%m-%d"),
                "method": "upi",
                "status": "settled",
                "source_account": "Razorpay Gateway (Business)",
                "destination_account": "HDFC Bank — Business Current Account"
            })
            
            bank_id_fuz = f"bnk_row_{len(self.temp_bank_records):04d}"
            self.temp_bank_records.append({
                "bank_id": bank_id_fuz,
                "transaction_date": bank_date.strftime("%Y-%m-%d"),
                "description": f"UPI-CLEARING-{bank_ref}-RAZORPAY",
                "credit_amount": float(net),
                "reference_number": bank_ref,
                "value_date": bank_date.strftime("%Y-%m-%d"),
                "source_account": "HDFC Bank — Business Current Account",
                "gt_payment_id": pay_id
            })
            
            self.ground_truth["settlements"][pay_id] = {
                "matched_bank_ids": [bank_id_fuz],
                "true_match_type": "fuzzy",
                "source_account": "Razorpay Gateway (Business)",
                "destination_account": "HDFC Bank — Business Current Account"
            }
            
            tx_id = f"txn_{uuid.uuid4().hex[:12]}"
            self.db_transactions.append((
                tx_id, "demo_org_1", order_date.strftime("%Y-%m-%d"),
                float(gross), float(fee), float(gst), float(net),
                utr, settlement_date.strftime("%Y-%m-%d"), "settled",
                "Razorpay Gateway (Business)"
            ))

        # 5. Exceptions — Covering every required subtype
        
        # Exception 1: fee_variance (PAY-00150 / exc_fee_var)
        order_id_e1 = "ORD-2026-08-0091"
        pay_id_e1 = "PAY-00150"
        o_date_e1 = date(2026, 8, 14)
        gross_e1 = Decimal("8500.00")
        expected_fee = (gross_e1 * Decimal("0.02")).quantize(Decimal("0.01"))  # 170.00
        charged_fee = Decimal("238.00")  # 2.8% MDR variance
        gst_e1 = (charged_fee * Decimal("0.18")).quantize(Decimal("0.01"))      # 42.84
        net_e1 = (gross_e1 - charged_fee - gst_e1).quantize(Decimal("0.01"))   # 8219.16
        s_date_e1 = add_business_days(o_date_e1, 2)
        utr_e1 = generate_utr("KKBK")
        
        self.ledger_rows.append({
            "order_id": order_id_e1,
            "customer_name": "Premium_Wholesale_Corp",
            "amount_charged": float(gross_e1),
            "order_date": o_date_e1.strftime("%Y-%m-%d"),
            "order_status": "paid",
            "source_account": "Razorpay Gateway (Business)"
        })
        self.settlement_rows.append({
            "payment_id": pay_id_e1,
            "order_id": order_id_e1,
            "gross_amount": float(gross_e1),
            "razorpay_fee": float(charged_fee),
            "gst_on_fee": float(gst_e1),
            "tds": 0.0,
            "settled_amount": float(net_e1),
            "utr": utr_e1,
            "settlement_date": s_date_e1.strftime("%Y-%m-%d"),
            "payment_date": o_date_e1.strftime("%Y-%m-%d"),
            "method": "card",
            "status": "exception",
            "source_account": "Razorpay Gateway (Business)",
            "destination_account": "Kotak Mahindra Bank — Business Current Account"
        })
        bank_id_e1 = f"bnk_row_{len(self.temp_bank_records):04d}"
        self.temp_bank_records.append({
            "bank_id": bank_id_e1,
            "transaction_date": s_date_e1.strftime("%Y-%m-%d"),
            "description": f"CMS-RAZORPAY-SETTLEMENT-{utr_e1}",
            "credit_amount": float(net_e1),
            "reference_number": utr_e1,
            "value_date": s_date_e1.strftime("%Y-%m-%d"),
            "source_account": "Kotak Mahindra Bank — Business Current Account",
            "gt_payment_id": pay_id_e1
        })
        self.ground_truth["settlements"][pay_id_e1] = {
            "matched_bank_ids": [bank_id_e1],
            "true_match_type": "exception",
            "true_reason": "fee_variance",
            "source_account": "Razorpay Gateway (Business)"
        }
        tx_id_e1 = f"txn_{uuid.uuid4().hex[:12]}"
        exc_id_e1 = f"exc_{uuid.uuid4().hex[:12]}"
        self.db_transactions.append((
            tx_id_e1, "demo_org_1", o_date_e1.strftime("%Y-%m-%d"),
            float(gross_e1), float(charged_fee), float(gst_e1), float(net_e1),
            utr_e1, s_date_e1.strftime("%Y-%m-%d"), "exception",
            "Razorpay Gateway (Business)"
        ))
        self.db_exceptions.append((
            exc_id_e1, tx_id_e1, "demo_org_1", o_date_e1.strftime("%Y-%m-%d"),
            "fee_variance", json.dumps({
                "expected_fee": float(expected_fee),
                "charged_fee": float(charged_fee),
                "variance": float(charged_fee - expected_fee),
                "source_account": "Razorpay Gateway (Business)"
            }),
            "open", None, None, None, "Razorpay Gateway (Business)"
        ))

        # Exception 2: no_bank_credit_found / delayed_settlement (PAY-00289)
        order_id_e2 = "ORD-2026-08-0092"
        pay_id_e2 = "PAY-00289"
        o_date_e2 = date(2026, 8, 18)
        gross_e2 = Decimal("14200.00")
        fee_e2 = (gross_e2 * Decimal("0.02")).quantize(Decimal("0.01"))
        gst_e2 = (fee_e2 * Decimal("0.18")).quantize(Decimal("0.01"))
        net_e2 = (gross_e2 - fee_e2 - gst_e2).quantize(Decimal("0.01"))
        s_date_e2 = add_business_days(o_date_e2, 2)
        utr_e2 = generate_utr("HDFC")
        
        self.ledger_rows.append({
            "order_id": order_id_e2,
            "customer_name": "Apex_Retail_Hub",
            "amount_charged": float(gross_e2),
            "order_date": o_date_e2.strftime("%Y-%m-%d"),
            "order_status": "paid",
            "source_account": "Razorpay Gateway (Business)"
        })
        self.settlement_rows.append({
            "payment_id": pay_id_e2,
            "order_id": order_id_e2,
            "gross_amount": float(gross_e2),
            "razorpay_fee": float(fee_e2),
            "gst_on_fee": float(gst_e2),
            "tds": 0.0,
            "settled_amount": float(net_e2),
            "utr": utr_e2,
            "settlement_date": s_date_e2.strftime("%Y-%m-%d"),
            "payment_date": o_date_e2.strftime("%Y-%m-%d"),
            "method": "netbanking",
            "status": "exception",
            "source_account": "Razorpay Gateway (Business)",
            "destination_account": "HDFC Bank — Business Current Account"
        })
        # No bank statement row generated -> missing bank credit
        self.ground_truth["settlements"][pay_id_e2] = {
            "matched_bank_ids": [],
            "true_match_type": "exception",
            "true_reason": "no_bank_credit_found",
            "source_account": "Razorpay Gateway (Business)"
        }
        tx_id_e2 = f"txn_{uuid.uuid4().hex[:12]}"
        exc_id_e2 = f"exc_{uuid.uuid4().hex[:12]}"
        self.db_transactions.append((
            tx_id_e2, "demo_org_1", o_date_e2.strftime("%Y-%m-%d"),
            float(gross_e2), float(fee_e2), float(gst_e2), float(net_e2),
            utr_e2, s_date_e2.strftime("%Y-%m-%d"), "exception",
            "Razorpay Gateway (Business)"
        ))
        self.db_exceptions.append((
            exc_id_e2, tx_id_e2, "demo_org_1", o_date_e2.strftime("%Y-%m-%d"),
            "no_bank_credit_found", json.dumps({
                "expected_credit_date": s_date_e2.strftime("%Y-%m-%d"),
                "is_overdue": True,
                "source_account": "Razorpay Gateway (Business)"
            }),
            "open", None, None, None, "Razorpay Gateway (Business)"
        ))

        # Exception 3: possible_duplicate (PAY-00045)
        order_id_e3 = "ORD-2026-08-0093"
        pay_id_e3 = "PAY-00045"
        o_date_e3 = date(2026, 8, 20)
        gross_e3 = Decimal("6200.00")
        fee_e3 = (gross_e3 * Decimal("0.02")).quantize(Decimal("0.01"))
        gst_e3 = (fee_e3 * Decimal("0.18")).quantize(Decimal("0.01"))
        net_e3 = (gross_e3 - fee_e3 - gst_e3).quantize(Decimal("0.01"))
        s_date_e3 = add_business_days(o_date_e3, 2)
        utr_e3 = generate_utr("KKBK")
        
        self.ledger_rows.append({
            "order_id": order_id_e3,
            "customer_name": "Zenith_Digital_Labs",
            "amount_charged": float(gross_e3),
            "order_date": o_date_e3.strftime("%Y-%m-%d"),
            "order_status": "paid",
            "source_account": "Razorpay Gateway (Business)"
        })
        self.settlement_rows.append({
            "payment_id": pay_id_e3,
            "order_id": order_id_e3,
            "gross_amount": float(gross_e3),
            "razorpay_fee": float(fee_e3),
            "gst_on_fee": float(gst_e3),
            "tds": 0.0,
            "settled_amount": float(net_e3),
            "utr": utr_e3,
            "settlement_date": s_date_e3.strftime("%Y-%m-%d"),
            "payment_date": o_date_e3.strftime("%Y-%m-%d"),
            "method": "upi",
            "status": "exception",
            "source_account": "Razorpay Gateway (Business)",
            "destination_account": "Kotak Mahindra Bank — Business Current Account"
        })
        # Two identical credits in bank statement -> duplicate credit anomaly
        bank_id_e3_a = f"bnk_row_{len(self.temp_bank_records):04d}"
        self.temp_bank_records.append({
            "bank_id": bank_id_e3_a,
            "transaction_date": s_date_e3.strftime("%Y-%m-%d"),
            "description": f"CMS-RAZORPAY-SETTLEMENT-{utr_e3}",
            "credit_amount": float(net_e3),
            "reference_number": utr_e3,
            "value_date": s_date_e3.strftime("%Y-%m-%d"),
            "source_account": "Kotak Mahindra Bank — Business Current Account",
            "gt_payment_id": pay_id_e3
        })
        bank_id_e3_b = f"bnk_row_{len(self.temp_bank_records):04d}"
        self.temp_bank_records.append({
            "bank_id": bank_id_e3_b,
            "transaction_date": s_date_e3.strftime("%Y-%m-%d"),
            "description": f"CMS-RAZORPAY-SETTLEMENT-{utr_e3}-DUP",
            "credit_amount": float(net_e3),
            "reference_number": utr_e3,
            "value_date": s_date_e3.strftime("%Y-%m-%d"),
            "source_account": "Kotak Mahindra Bank — Business Current Account",
            "gt_payment_id": pay_id_e3
        })
        self.ground_truth["settlements"][pay_id_e3] = {
            "matched_bank_ids": [bank_id_e3_a, bank_id_e3_b],
            "true_match_type": "exception",
            "true_reason": "possible_duplicate",
            "source_account": "Razorpay Gateway (Business)"
        }
        tx_id_e3 = f"txn_{uuid.uuid4().hex[:12]}"
        exc_id_e3 = f"exc_{uuid.uuid4().hex[:12]}"
        self.db_transactions.append((
            tx_id_e3, "demo_org_1", o_date_e3.strftime("%Y-%m-%d"),
            float(gross_e3), float(fee_e3), float(gst_e3), float(net_e3),
            utr_e3, s_date_e3.strftime("%Y-%m-%d"), "exception",
            "Razorpay Gateway (Business)"
        ))
        self.db_exceptions.append((
            exc_id_e3, tx_id_e3, "demo_org_1", o_date_e3.strftime("%Y-%m-%d"),
            "possible_duplicate", json.dumps({
                "duplicate_utr": utr_e3,
                "occurrences": 2,
                "source_account": "Razorpay Gateway (Business)"
            }),
            "open", None, None, None, "Razorpay Gateway (Business)"
        ))

        # Exception 4: amount_mismatch_only (PAY-00090)
        order_id_e4 = "ORD-2026-08-0094"
        pay_id_e4 = "PAY-00090"
        o_date_e4 = date(2026, 8, 22)
        gross_e4 = Decimal("7400.00")
        fee_e4 = (gross_e4 * Decimal("0.02")).quantize(Decimal("0.01"))
        gst_e4 = (fee_e4 * Decimal("0.18")).quantize(Decimal("0.01"))
        calculated_net = (gross_e4 - fee_e4 - gst_e4).quantize(Decimal("0.01"))  # 7159.08
        actual_settled_net = calculated_net - Decimal("350.00")                 # 6809.08 (withholding mismatch)
        s_date_e4 = add_business_days(o_date_e4, 2)
        utr_e4 = generate_utr("KKBK")
        
        self.ledger_rows.append({
            "order_id": order_id_e4,
            "customer_name": "Nexus_Consulting_Group",
            "amount_charged": float(gross_e4),
            "order_date": o_date_e4.strftime("%Y-%m-%d"),
            "order_status": "paid",
            "source_account": "Razorpay Gateway (Business)"
        })
        self.settlement_rows.append({
            "payment_id": pay_id_e4,
            "order_id": order_id_e4,
            "gross_amount": float(gross_e4),
            "razorpay_fee": float(fee_e4),
            "gst_on_fee": float(gst_e4),
            "tds": 0.0,
            "settled_amount": float(actual_settled_net),
            "utr": utr_e4,
            "settlement_date": s_date_e4.strftime("%Y-%m-%d"),
            "payment_date": o_date_e4.strftime("%Y-%m-%d"),
            "method": "card",
            "status": "exception",
            "source_account": "Razorpay Gateway (Business)",
            "destination_account": "Kotak Mahindra Bank — Business Current Account"
        })
        bank_id_e4 = f"bnk_row_{len(self.temp_bank_records):04d}"
        self.temp_bank_records.append({
            "bank_id": bank_id_e4,
            "transaction_date": s_date_e4.strftime("%Y-%m-%d"),
            "description": f"CMS-RAZORPAY-SETTLEMENT-{utr_e4}",
            "credit_amount": float(actual_settled_net),
            "reference_number": utr_e4,
            "value_date": s_date_e4.strftime("%Y-%m-%d"),
            "source_account": "Kotak Mahindra Bank — Business Current Account",
            "gt_payment_id": pay_id_e4
        })
        self.ground_truth["settlements"][pay_id_e4] = {
            "matched_bank_ids": [bank_id_e4],
            "true_match_type": "exception",
            "true_reason": "amount_mismatch_only",
            "source_account": "Razorpay Gateway (Business)"
        }
        tx_id_e4 = f"txn_{uuid.uuid4().hex[:12]}"
        exc_id_e4 = f"exc_{uuid.uuid4().hex[:12]}"
        self.db_transactions.append((
            tx_id_e4, "demo_org_1", o_date_e4.strftime("%Y-%m-%d"),
            float(gross_e4), float(fee_e4), float(gst_e4), float(actual_settled_net),
            utr_e4, s_date_e4.strftime("%Y-%m-%d"), "exception",
            "Razorpay Gateway (Business)"
        ))
        self.db_exceptions.append((
            exc_id_e4, tx_id_e4, "demo_org_1", o_date_e4.strftime("%Y-%m-%d"),
            "amount_mismatch_only", json.dumps({
                "calculated_net": float(calculated_net),
                "settled_net": float(actual_settled_net),
                "mismatch": -350.00,
                "source_account": "Razorpay Gateway (Business)"
            }),
            "open", None, None, None, "Razorpay Gateway (Business)"
        ))

        # Exception 5: ledger_only (Internal Order placed, customer dropped checkout, no gateway settlement)
        order_id_e5 = "ORD-2026-08-0095"
        gross_e5 = Decimal("4800.00")
        o_date_e5 = date(2026, 8, 25)
        self.ledger_rows.append({
            "order_id": order_id_e5,
            "customer_name": "Unpaid_Checkout_Session",
            "amount_charged": float(gross_e5),
            "order_date": o_date_e5.strftime("%Y-%m-%d"),
            "order_status": "pending",
            "source_account": "Razorpay Gateway (Business)"
        })
        self.ground_truth["ledger"][order_id_e5] = {
            "true_match_type": "exception",
            "true_reason": "ledger_only",
            "source_account": "Razorpay Gateway (Business)"
        }
        tx_id_e5 = f"txn_{uuid.uuid4().hex[:12]}"
        exc_id_e5 = f"exc_{uuid.uuid4().hex[:12]}"
        self.db_transactions.append((
            tx_id_e5, "demo_org_1", o_date_e5.strftime("%Y-%m-%d"),
            float(gross_e5), 0.0, 0.0, float(gross_e5),
            None, None, "exception",
            "Razorpay Gateway (Business)"
        ))
        self.db_exceptions.append((
            exc_id_e5, tx_id_e5, "demo_org_1", o_date_e5.strftime("%Y-%m-%d"),
            "ledger_only", json.dumps({
                "order_id": order_id_e5,
                "status": "pending_payment",
                "source_account": "Razorpay Gateway (Business)"
            }),
            "open", None, None, None, "Razorpay Gateway (Business)"
        ))

        # Exception 6: bank_only (Unidentified Bank Credit without matching gateway settlement ID)
        bank_date_e6 = date(2026, 8, 27)
        credit_e6 = Decimal("5500.00")
        ref_e6 = "DIRECT-NEFT-UNKNOWN-REF-8491"
        bank_id_e6 = f"bnk_row_{len(self.temp_bank_records):04d}"
        self.temp_bank_records.append({
            "bank_id": bank_id_e6,
            "transaction_date": bank_date_e6.strftime("%Y-%m-%d"),
            "description": "NEFT-DIRECT-INWARD-REMITTANCE-UNKNOWN",
            "credit_amount": float(credit_e6),
            "reference_number": ref_e6,
            "value_date": bank_date_e6.strftime("%Y-%m-%d"),
            "source_account": "HDFC Bank — Business Current Account",
            "gt_payment_id": None
        })
        self.ground_truth["bank"][bank_id_e6] = {
            "true_match_type": "exception",
            "true_reason": "bank_only",
            "source_account": "HDFC Bank — Business Current Account"
        }
        tx_id_e6 = f"txn_{uuid.uuid4().hex[:12]}"
        exc_id_e6 = f"exc_{uuid.uuid4().hex[:12]}"
        self.db_transactions.append((
            tx_id_e6, "acct_hdfc_bank", bank_date_e6.strftime("%Y-%m-%d"),
            float(credit_e6), 0.0, 0.0, float(credit_e6),
            ref_e6, bank_date_e6.strftime("%Y-%m-%d"), "exception",
            "HDFC Bank — Business Current Account"
        ))
        self.db_exceptions.append((
            exc_id_e6, tx_id_e6, "acct_hdfc_bank", bank_date_e6.strftime("%Y-%m-%d"),
            "bank_only", json.dumps({
                "reference_number": ref_e6,
                "credit_amount": float(credit_e6),
                "source_account": "HDFC Bank — Business Current Account"
            }),
            "open", None, None, None, "HDFC Bank — Business Current Account"
        ))

        # Shuffle Bank rows
        random.shuffle(self.temp_bank_records)
        for br in self.temp_bank_records:
            self.bank_rows.append({
                "transaction_date": br["transaction_date"],
                "description": br["description"],
                "credit_amount": br["credit_amount"],
                "reference_number": br["reference_number"],
                "value_date": br["value_date"],
                "source_account": br["source_account"]
            })

        total_gross = sum(s["gross_amount"] for s in self.settlement_rows)
        total_settled = sum(s["settled_amount"] for s in self.settlement_rows if s["status"] == "settled")
        total_tx_count = len(self.settlement_rows)
        
        print(f"Total Gross Volume: ₹{total_gross:,.2f}")
        print(f"Total Settled Value: ₹{total_settled:,.2f}")
        print(f"Total Settlements: {total_tx_count}")
        print(f"Total Ledger Rows: {len(self.ledger_rows)}")
        print(f"Total Bank Rows: {len(self.bank_rows)}")
        print(f"Total Exceptions: {len(self.db_exceptions)}")
        assert total_gross < 300000.0, f"Total gross volume exceeds 3,00,000! Got {total_gross}"
        print(f"Volume constraint PASSED: ₹{total_gross:,.2f} < ₹3,00,000.00")

    def save_csvs(self, output_dir: str):
        os.makedirs(output_dir, exist_ok=True)
        
        # 1. settlements
        settlement_fields = ["payment_id", "order_id", "gross_amount", "razorpay_fee", "gst_on_fee", "tds", "settled_amount", "utr", "settlement_date", "payment_date", "method", "status", "source_account", "destination_account"]
        with open(os.path.join(output_dir, "settlement_report.csv"), "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=settlement_fields)
            writer.writeheader()
            writer.writerows(self.settlement_rows)

        with open(os.path.join(output_dir, "razorpay_feed.csv"), "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=settlement_fields)
            writer.writeheader()
            writer.writerows(self.settlement_rows)

        # 2. bank
        bank_fields = ["transaction_date", "description", "credit_amount", "reference_number", "value_date", "source_account"]
        with open(os.path.join(output_dir, "bank_statement.csv"), "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=bank_fields)
            writer.writeheader()
            writer.writerows(self.bank_rows)

        # 3. ledger
        ledger_fields = ["order_id", "customer_name", "amount_charged", "order_date", "order_status", "source_account"]
        with open(os.path.join(output_dir, "internal_ledger.csv"), "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=ledger_fields)
            writer.writeheader()
            writer.writerows(self.ledger_rows)

        with open(os.path.join(output_dir, "internal_records.csv"), "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=ledger_fields)
            writer.writeheader()
            writer.writerows(self.ledger_rows)

        # 4. ground_truth
        with open(os.path.join(output_dir, "ground_truth.json"), "w", encoding="utf-8") as f:
            json.dump(self.ground_truth, f, indent=2)

        print(f"[OK] Saved CSV and Ground Truth files to {output_dir}")

    def save_sqlite(self, db_path: str):
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Wipe tables
        cursor.execute("DROP TABLE IF EXISTS exception_investigations")
        cursor.execute("DROP TABLE IF EXISTS exceptions")
        cursor.execute("DROP TABLE IF EXISTS transactions")
        cursor.execute("DROP TABLE IF EXISTS accounts")

        # Create tables
        cursor.execute('''
            CREATE TABLE transactions (
                transaction_id TEXT PRIMARY KEY,
                business_id TEXT NOT NULL,
                transaction_date TEXT NOT NULL,
                gross_amount REAL NOT NULL,
                fee REAL NOT NULL,
                gst REAL NOT NULL,
                net_amount REAL NOT NULL,
                bank_reference TEXT,
                settlement_date TEXT,
                status TEXT NOT NULL,
                source_account TEXT
            )
        ''')

        cursor.execute('''
            CREATE TABLE exceptions (
                id TEXT PRIMARY KEY,
                transaction_id TEXT NOT NULL,
                business_id TEXT NOT NULL,
                transaction_date TEXT NOT NULL,
                reason TEXT NOT NULL,
                underlying_data TEXT NOT NULL,
                status TEXT DEFAULT 'open',
                resolution_note TEXT,
                resolved_at TEXT,
                escalated_at TEXT,
                source_account TEXT
            )
        ''')

        cursor.execute('''
            CREATE TABLE accounts (
                account_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                status TEXT NOT NULL,
                connected_at TEXT NOT NULL,
                last_synced_at TEXT,
                sync_status TEXT DEFAULT 'healthy',
                sync_message TEXT,
                account_number TEXT,
                key_id TEXT
            )
        ''')

        cursor.execute('''
            CREATE TABLE exception_investigations (
                investigation_id TEXT PRIMARY KEY,
                exception_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                initial_variance REAL NOT NULL,
                explained_amount REAL NOT NULL,
                unexplained_amount REAL NOT NULL,
                is_fully_explained INTEGER NOT NULL,
                steps_checked TEXT NOT NULL,
                conclusion TEXT NOT NULL,
                confidence_score REAL NOT NULL,
                confidence_badge TEXT NOT NULL,
                recommended_action TEXT NOT NULL,
                verifier_status TEXT NOT NULL,
                FOREIGN KEY (exception_id) REFERENCES exceptions(id)
            )
        ''')

        # Insert accounts
        for a in self.ACCOUNTS:
            cursor.execute('''
                INSERT INTO accounts (account_id, name, type, status, connected_at, last_synced_at, sync_status, sync_message, account_number, key_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (a["account_id"], a["name"], a["type"], a["status"], a["connected_at"], a["last_synced_at"], a["sync_status"], a["sync_message"], a.get("account_number"), a.get("key_id")))

        # Insert transactions
        cursor.executemany('''
            INSERT INTO transactions (transaction_id, business_id, transaction_date, gross_amount, fee, gst, net_amount, bank_reference, settlement_date, status, source_account)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', self.db_transactions)

        # Insert exceptions
        cursor.executemany('''
            INSERT INTO exceptions (id, transaction_id, business_id, transaction_date, reason, underlying_data, status, resolution_note, resolved_at, escalated_at, source_account)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', self.db_exceptions)

        # Indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(transaction_date)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_tx_business ON transactions(business_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_tx_source ON transactions(source_account)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_exc_date ON exceptions(transaction_date)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_exc_reason ON exceptions(reason)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_exc_status ON exceptions(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_exc_source ON exceptions(source_account)')

        conn.commit()
        conn.close()
        print(f"[OK] Successfully initialized SQLite database at {db_path}")

def run():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    output_dir = os.path.join(base_dir, "data", "output")
    db_path = os.path.join(output_dir, "finora.db")
    
    gen = FinoraDataGenerator(seed=42)
    gen.generate()
    gen.save_csvs(output_dir)
    gen.save_sqlite(db_path)

if __name__ == "__main__":
    run()
