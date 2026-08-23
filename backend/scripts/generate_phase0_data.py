import os
import random
import math
import uuid
import json
import sqlite3
from datetime import datetime, timedelta

# Need to ensure database is created/loaded
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from backend.db.sqlite_client import get_connection, init_db

# Configuration
END_DATE = datetime(2026, 9, 5)
START_DATE = END_DATE - timedelta(days=183) # Approx 6 months
BUSINESS_ID = "BIZ-001"
HOLIDAYS = ['2026-08-15', '2026-05-01'] # Examples

def is_business_day(date_obj: datetime) -> bool:
    if date_obj.weekday() >= 5:
        return False
    if date_obj.strftime('%Y-%m-%d') in HOLIDAYS:
        return False
    return True

def get_settlement_date(tx_date: datetime, delay_days=0) -> datetime:
    # T+2 normal, plus any delay_days
    days_to_add = 2 + delay_days
    current = tx_date
    added = 0
    while added < days_to_add:
        current += timedelta(days=1)
        if is_business_day(current):
            added += 1
    return current

def generate_utr() -> str:
    banks = ["HDFC", "ICICI", "SBI", "AXIS"]
    bank = random.choice(banks)
    branch = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=2))
    numeric = "".join(random.choices("0123456789", k=10))
    return f"{bank}{branch}{numeric}"

def generate_monthly_amounts(n: int) -> list:
    """Generate n amounts using log-normal distribution ensuring total is 1L to 5L"""
    while True:
        # mu=7.8 -> exp(7.8) = ~2440. sigma=1.0 -> highly skewed right
        amounts = [round(random.lognormvariate(7.8, 1.0), 2) for _ in range(n)]
        # Clip absurdly high values to 1,00,000 as requested
        amounts = [min(a, 100000.0) for a in amounts]
        # Ensure min is at least ~100
        amounts = [max(a, 100.0) for a in amounts]
        
        total = sum(amounts)
        if 100000 <= total <= 500000:
            return amounts

def generate_daily_counts(days_in_month: int, target_tx_count: int) -> list:
    """Generate daily counts using a Poisson-like approach, distributing target_tx_count"""
    # Lambda approx target / days. 
    lam = target_tx_count / days_in_month
    
    while True:
        # Generate poisson distribution
        counts = []
        for _ in range(days_in_month):
            # approximate poisson via uniform+math trick or just use a basic simulation
            # L = exp(-lam), k=0, p=1. do k++; p*=u; while p>L; return k-1
            L = math.exp(-lam)
            k = 0
            p = 1.0
            while True:
                k += 1
                p *= random.uniform(0, 1)
                if p <= L:
                    break
            counts.append(k - 1)
            
        if sum(counts) == target_tx_count:
            return counts

def run():
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    
    # Clear existing data for idempotency
    cursor.execute('DELETE FROM exceptions')
    cursor.execute('DELETE FROM transactions')
    
    # Generate data month by month
    current_month_start = START_DATE
    
    transactions_buffer = []
    exceptions_buffer = []
    
    while current_month_start < END_DATE:
        # determine month end
        next_month = current_month_start.month + 1 if current_month_start.month < 12 else 1
        next_year = current_month_start.year if current_month_start.month < 12 else current_month_start.year + 1
        current_month_end = datetime(next_year, next_month, 1) - timedelta(days=1)
        if current_month_end > END_DATE:
            current_month_end = END_DATE
            
        days_in_month = (current_month_end - current_month_start).days + 1
        if days_in_month <= 0:
            break
            
        # Base monthly target is 50-60
        base_target = random.randint(50, 60)
        
        # If it's a partial month (e.g. Sept 1-5, or March 6-31), scale down the transactions proportionally
        if days_in_month < 28:
            target_tx_count = max(1, int(base_target * (days_in_month / 30.0)))
        else:
            target_tx_count = base_target
            
        daily_counts = generate_daily_counts(days_in_month, target_tx_count)
        amounts = generate_monthly_amounts(target_tx_count)
        
        amount_idx = 0
        for day_idx, count in enumerate(daily_counts):
            current_date = current_month_start + timedelta(days=day_idx)
            
            for _ in range(count):
                gross = amounts[amount_idx]
                amount_idx += 1
                
                fee_expected = round(gross * 0.02, 2)
                gst_expected = round(fee_expected * 0.18, 2)
                net_expected = round(gross - fee_expected - gst_expected, 2)
                
                tx_id = f"txn_{uuid.uuid4().hex[:12]}"
                tx_date_str = current_date.strftime('%Y-%m-%d')
                
                # Default values
                actual_fee = fee_expected
                actual_net = net_expected
                delay = 0
                if random.random() < 0.2: # 20% chance of a 1-2 day natural delay
                    delay = random.randint(1, 2)
                
                settlement_date = get_settlement_date(current_date, delay)
                settlement_date_str = settlement_date.strftime('%Y-%m-%d')
                
                # Exception injection (10-15%)
                is_exception = random.random() < 0.125
                exception_reason = None
                underlying_data = {}
                
                if is_exception:
                    exception_reason = random.choice(['no_bank_credit_found', 'fee_variance', 'amount_mismatch', 'duplicate'])
                    
                    if exception_reason == 'no_bank_credit_found':
                        is_overdue = random.choice([True, False])
                        if is_overdue:
                            settlement_date = get_settlement_date(current_date, delay_days=10) # Way overdue
                        underlying_data = {
                            "expected_credit_date": get_settlement_date(current_date, 0).strftime('%Y-%m-%d'),
                            "is_overdue": is_overdue
                        }
                    
                    elif exception_reason == 'fee_variance':
                        variance = round(random.uniform(5.0, 50.0), 2)
                        actual_fee = round(fee_expected + variance, 2)
                        actual_net = round(gross - actual_fee - gst_expected, 2)
                        underlying_data = {
                            "expected_fee": fee_expected,
                            "charged_fee": actual_fee,
                            "variance": variance
                        }
                        
                    elif exception_reason == 'amount_mismatch':
                        mismatch = round(random.uniform(10.0, 100.0), 2) * random.choice([1, -1])
                        actual_net = round(net_expected + mismatch, 2)
                        underlying_data = {
                            "calculated_net": net_expected,
                            "settled_net": actual_net,
                            "mismatch": mismatch
                        }
                        
                    elif exception_reason == 'duplicate':
                        # We handle duplicate by pushing the exact same record twice, but generating the exception for the second
                        underlying_data = {
                            "original_transaction_id": tx_id
                        }
                
                # Prepare record
                record = (
                    tx_id, BUSINESS_ID, tx_date_str, gross, actual_fee, gst_expected, actual_net, 
                    generate_utr(), settlement_date_str, 'settled' if not is_exception else 'exception'
                )
                transactions_buffer.append(record)
                
                if is_exception:
                    exc_id = f"exc_{uuid.uuid4().hex[:12]}"
                    exceptions_buffer.append((
                        exc_id, tx_id, BUSINESS_ID, tx_date_str, exception_reason, json.dumps(underlying_data)
                    ))
                    
                    if exception_reason == 'duplicate':
                        # Create the duplicated transaction row
                        dup_tx_id = f"txn_{uuid.uuid4().hex[:12]}"
                        record_dup = (
                            dup_tx_id, BUSINESS_ID, tx_date_str, gross, actual_fee, gst_expected, actual_net, 
                            generate_utr(), settlement_date_str, 'exception'
                        )
                        transactions_buffer.append(record_dup)
                        # Link this one to the same exception
                        exc_id_2 = f"exc_{uuid.uuid4().hex[:12]}"
                        exceptions_buffer.append((
                            exc_id_2, dup_tx_id, BUSINESS_ID, tx_date_str, 'duplicate', json.dumps({"original_transaction_id": tx_id})
                        ))
                
        # Advance to next month
        current_month_start = current_month_end + timedelta(days=1)
        
    # Insert everything
    cursor.executemany('''
        INSERT INTO transactions (
            transaction_id, business_id, transaction_date, gross_amount, fee, gst, net_amount, bank_reference, settlement_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', transactions_buffer)
    
    cursor.executemany('''
        INSERT INTO exceptions (
            id, transaction_id, business_id, transaction_date, reason, underlying_data
        ) VALUES (?, ?, ?, ?, ?, ?)
    ''', exceptions_buffer)
    
    conn.commit()
    conn.close()
    
    print(f"Generated {len(transactions_buffer)} transactions and {len(exceptions_buffer)} exceptions successfully.")

if __name__ == "__main__":
    run()
