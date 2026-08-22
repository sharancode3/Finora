import os
import csv
import json
import uuid
from datetime import datetime
from google.cloud import firestore

# Ensure we connect to the local emulator for the backend
os.environ["FIRESTORE_EMULATOR_HOST"] = "127.0.0.1:8080"
db = firestore.Client(project="finora-d6051")

def chunked(iterable, n):
    """Yield successive n-sized chunks from iterable."""
    for i in range(0, len(iterable), n):
        yield iterable[i:i + n]

def load_csv(path):
    with open(path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def clean_dict(d):
    """Convert numeric strings to floats where appropriate"""
    res = {}
    for k, v in d.items():
        if v is None:
            res[k] = None
        elif isinstance(v, str) and k in ['amount_charged', 'gross_amount', 'razorpay_fee', 'gst_on_fee', 'tds', 'settled_amount', 'credit_amount']:
            try:
                res[k] = float(v)
            except ValueError:
                res[k] = v
        else:
            res[k] = v
    return res

def main():
    data_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'output')
    
    # Load files
    businesses = load_json(os.path.join(data_dir, 'businesses.json'))
    ledgers = load_csv(os.path.join(data_dir, 'internal_ledger.csv'))
    settlements = load_csv(os.path.join(data_dir, 'settlement_report.csv'))
    banks = load_csv(os.path.join(data_dir, 'bank_statement.csv'))
    
    batch_id = f"batch_{datetime.utcnow().strftime('%Y%md%H%M%S')}"
    created_at = datetime.utcnow().isoformat()
    
    def add_meta(record, source):
        rec = clean_dict(record)
        rec['created_at'] = created_at
        rec['source_file'] = source
        rec['batch_id'] = batch_id
        return rec

    operations = []

    # 1. Businesses
    for b in businesses:
        doc_ref = db.collection('businesses').document(b['business_id'])
        operations.append((doc_ref, add_meta(b, 'businesses.json')))

    # 2. Ledgers
    for l in ledgers:
        doc_ref = db.collection('ledger_entries').document(l['order_id'])
        operations.append((doc_ref, add_meta(l, 'internal_ledger.csv')))

    # 3. Settlements
    for s in settlements:
        doc_ref = db.collection('settlements').document(s['payment_id'])
        operations.append((doc_ref, add_meta(s, 'settlement_report.csv')))

    # 4. Bank Transactions
    for b in banks:
        doc_ref = db.collection('bank_transactions').document() # auto-id
        operations.append((doc_ref, add_meta(b, 'bank_statement.csv')))

    # Execute batch writes
    total_written = 0
    for chunk in chunked(operations, 500):
        batch = db.batch()
        for doc_ref, data in chunk:
            batch.set(doc_ref, data)
        batch.commit()
        total_written += len(chunk)
        print(f"Committed {len(chunk)} records... ({total_written}/{len(operations)})")

    print("\n=== Seeding Complete ===")
    print(f"Batch ID: {batch_id}")
    print(f"Seeded {len(settlements)} settlements, {len(banks)} bank transactions, {len(ledgers)} ledger entries, {len(businesses)} businesses.")

if __name__ == '__main__':
    main()
