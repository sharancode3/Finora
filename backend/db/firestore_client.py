import os
import json
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- In-Memory Store ---
IN_MEMORY_DB = {
    'businesses': [],
    'settlements': [],
    'bank_transactions': [],
    'ledger_entries': [],
    'matches': [],
    'exceptions': [],
    'batch_runs': [],
    'chat_history': [],
    'verifier_rejections': [],
    'forecasts': [],
    'alerts': [],
    'briefings': []
}

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'output')
DB_FILE = os.path.join(DATA_DIR, 'in_memory_db.json')

def load_seed_data():
    """Loads all synthetic data into memory on module load."""
    import csv
    
    def load_json(filename):
        path = os.path.join(DATA_DIR, filename)
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []

    def load_csv(filename, id_field):
        path = os.path.join(DATA_DIR, filename)
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                rows = list(reader)
                for r in rows:
                    r['id'] = r[id_field]
                    # convert numeric strings
                    for k, v in r.items():
                        if isinstance(v, str) and k in ['amount_charged', 'gross_amount', 'razorpay_fee', 'gst_on_fee', 'tds', 'settled_amount', 'credit_amount', 'amount']:
                            try:
                                r[k] = float(v)
                            except:
                                pass
                return rows
        return []

    # If we have a saved state, load it. Otherwise load from raw seeds.
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, 'r', encoding='utf-8') as f:
                saved_db = json.load(f)
                for k in IN_MEMORY_DB.keys():
                    if k in saved_db:
                        IN_MEMORY_DB[k] = saved_db[k]
            return
        except Exception as e:
            print(f"Error loading {DB_FILE}: {e}")

    # Initial Seed
    b = load_json('businesses.json')
    for biz in b:
        biz['id'] = biz['business_id']
    IN_MEMORY_DB['businesses'] = b
    
    IN_MEMORY_DB['settlements'] = load_csv('settlement_report.csv', 'payment_id')
    
    banks = load_csv('bank_statement.csv', 'reference_number')
    # Wait, bank_statement doesn't have an ID field natively, so we ensure one
    for idx, row in enumerate(banks):
        if 'id' not in row or not row['id']:
            row['id'] = f"bank_auto_{idx}"
    IN_MEMORY_DB['bank_transactions'] = banks
    
    IN_MEMORY_DB['ledger_entries'] = load_csv('internal_ledger.csv', 'order_id')
    
    persist_db()

def persist_db():
    """Saves the current in-memory state to disk so it survives hot-reloads."""
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(IN_MEMORY_DB, f, indent=2, default=str)

# Load immediately
load_seed_data()

# --- Businesses ---
def get_businesses() -> List[Dict]:
    return IN_MEMORY_DB['businesses']

# --- Settlements ---
def get_settlements(business_id: Optional[str] = None, date_range: Optional[tuple] = None, limit: Optional[int] = None) -> List[Dict]:
    res = IN_MEMORY_DB['settlements']
    if business_id:
        res = [r for r in res if r.get('business_id') == business_id]
    if date_range:
        res = [r for r in res if date_range[0] <= r.get('settlement_date', '') <= date_range[1]]
    if limit:
        res = res[:limit]
    return res

def get_settlement_by_id(payment_id: str) -> Optional[Dict]:
    for r in IN_MEMORY_DB['settlements']:
        if r.get('id') == payment_id:
            return r
    return None

# --- Bank Transactions ---
def get_bank_transactions(bank_account_id: Optional[str] = None, date_range: Optional[tuple] = None) -> List[Dict]:
    res = IN_MEMORY_DB['bank_transactions']
    if bank_account_id:
        res = [r for r in res if r.get('bank_account_id') == bank_account_id]
    if date_range:
        res = [r for r in res if date_range[0] <= r.get('transaction_date', '') <= date_range[1]]
    return res

def get_bank_transaction_by_id(id: str) -> Optional[Dict]:
    for r in IN_MEMORY_DB['bank_transactions']:
        if r.get('id') == id:
            return r
    return None

# --- Ledger Entries ---
def get_ledger_entries(business_id: Optional[str] = None, order_status: Optional[str] = None) -> List[Dict]:
    res = IN_MEMORY_DB['ledger_entries']
    if business_id:
        res = [r for r in res if r.get('business_id') == business_id]
    if order_status:
        res = [r for r in res if r.get('status') == order_status]
    return res

def get_ledger_entry_by_id(order_id: str) -> Optional[Dict]:
    for r in IN_MEMORY_DB['ledger_entries']:
        if r.get('id') == order_id:
            return r
    return None

# --- Matches ---
def get_matches(batch_id: Optional[str] = None, method: Optional[str] = None, trust_state: Optional[str] = None) -> List[Dict]:
    res = IN_MEMORY_DB['matches']
    if batch_id:
        res = [r for r in res if r.get('batch_id') == batch_id]
    if method:
        res = [r for r in res if r.get('method') == method]
    if trust_state:
        res = [r for r in res if r.get('trust_state') == trust_state]
    return res

def get_match_by_id(id: str) -> Optional[Dict]:
    for r in IN_MEMORY_DB['matches']:
        if r.get('id') == id:
            return r
    return None

def write_matches(matches_array: List[Dict]):
    for m in matches_array:
        existing = get_match_by_id(m['id'])
        if existing:
            existing.update(m)
        else:
            IN_MEMORY_DB['matches'].append(m)
    persist_db()

# --- Exceptions ---
def get_exceptions(batch_id: Optional[str] = None, reason: Optional[str] = None, severity: Optional[str] = None, trust_state: Optional[str] = None, reason_list: Optional[List[str]] = None) -> List[Dict]:
    res = IN_MEMORY_DB['exceptions']
    if batch_id:
        res = [r for r in res if r.get('batch_id') == batch_id]
    if reason:
        res = [r for r in res if r.get('reason') == reason]
    if reason_list:
        res = [r for r in res if r.get('reason') in reason_list]
    if severity:
        res = [r for r in res if r.get('severity') == severity]
    if trust_state:
        res = [r for r in res if r.get('trust_state') == trust_state]
    return res

def get_exception_by_id(id: str) -> Optional[Dict]:
    for r in IN_MEMORY_DB['exceptions']:
        if r.get('id') == id:
            return r
    return None

def write_exceptions(exceptions_array: List[Dict]):
    for e in exceptions_array:
        existing = get_exception_by_id(e['id'])
        if existing:
            existing.update(e)
        else:
            IN_MEMORY_DB['exceptions'].append(e)
    persist_db()

def update_exception_ai_summary(exception_id: str, summary: str):
    e = get_exception_by_id(exception_id)
    if e:
        e['ai_summary'] = summary
        persist_db()

# --- Batch Runs ---
def get_batch_runs(limit: Optional[int] = None) -> List[Dict]:
    res = sorted(IN_MEMORY_DB['batch_runs'], key=lambda x: x.get('timestamp', ''), reverse=True)
    if limit:
        res = res[:limit]
    return res

def get_latest_batch_run() -> Optional[Dict]:
    runs = get_batch_runs(limit=1)
    return runs[0] if runs else None

def write_batch_run(data: Dict):
    existing = next((r for r in IN_MEMORY_DB['batch_runs'] if r.get('id') == data['id']), None)
    if existing:
        existing.update(data)
    else:
        IN_MEMORY_DB['batch_runs'].append(data)
    persist_db()
    return data

# --- Chat History & Verification ---
def write_chat_history(data: Dict):
    IN_MEMORY_DB['chat_history'].append(data)
    persist_db()
    return data

def get_chat_history(limit: Optional[int] = None) -> List[Dict]:
    res = sorted(IN_MEMORY_DB['chat_history'], key=lambda x: x.get('timestamp', ''), reverse=True)
    if limit:
        res = res[:limit]
    return res

def write_verifier_rejection(data: Dict):
    IN_MEMORY_DB['verifier_rejections'].append(data)
    persist_db()
    return data

def get_verifier_rejections(limit: Optional[int] = None) -> List[Dict]:
    res = sorted(IN_MEMORY_DB['verifier_rejections'], key=lambda x: x.get('timestamp', ''), reverse=True)
    if limit:
        res = res[:limit]
    return res

# --- Forecasts ---
def write_forecast(data: Dict):
    existing = next((r for r in IN_MEMORY_DB['forecasts'] if r.get('id') == data['id']), None)
    if existing:
        existing.update(data)
    else:
        IN_MEMORY_DB['forecasts'].append(data)
    persist_db()
    return data

def get_forecasts(limit: Optional[int] = None) -> List[Dict]:
    res = sorted(IN_MEMORY_DB['forecasts'], key=lambda x: x.get('generated_at', ''), reverse=True)
    if limit:
        res = res[:limit]
    return res

# --- Aggregates ---
def get_record_evidence_trail(record_id: str) -> Dict[str, Any]:
    settlement = get_settlement_by_id(record_id)
    bank_tx = get_bank_transaction_by_id(record_id)
    ledger = get_ledger_entry_by_id(record_id)
    
    trail = {
        "settlement": settlement,
        "bank_transaction": bank_tx,
        "ledger_entry": ledger,
        "matches": [],
        "exceptions": []
    }
    
    # Matches
    m1 = [m for m in IN_MEMORY_DB['matches'] if m.get('settlement_id') == record_id]
    m2 = [m for m in IN_MEMORY_DB['matches'] if m.get('bank_transaction_id') == record_id]
    m3 = [m for m in IN_MEMORY_DB['matches'] if m.get('ledger_entry_id') == record_id]
    
    # avoid duplicates
    m_all = []
    for m in m1 + m2 + m3:
        if m not in m_all:
            m_all.append(m)
    trail["matches"] = m_all
    
    # Exceptions
    e1 = [e for e in IN_MEMORY_DB['exceptions'] if e.get('related_settlement_id') == record_id]
    e2 = [e for e in IN_MEMORY_DB['exceptions'] if e.get('related_bank_transaction_id') == record_id]
    e3 = [e for e in IN_MEMORY_DB['exceptions'] if e.get('related_ledger_entry_id') == record_id]
    
    e_all = []
    for e in e1 + e2 + e3:
        if e not in e_all:
            e_all.append(e)
    trail["exceptions"] = e_all
    
    return trail

# --- Alerts & Briefings ---
def write_alert(data: Dict):
    IN_MEMORY_DB['alerts'].append(data)
    persist_db()
    return data

def get_alerts(limit: Optional[int] = None, active_only: bool = False) -> List[Dict]:
    res = IN_MEMORY_DB['alerts']
    if active_only:
        res = [r for r in res if not r.get('dismissed')]
    res = sorted(res, key=lambda x: x.get('created_at', ''), reverse=True)
    if limit:
        res = res[:limit]
    return res

def write_briefing(data: Dict):
    existing = next((r for r in IN_MEMORY_DB['briefings'] if r.get('id') == data['id']), None)
    if existing:
        existing.update(data)
    else:
        IN_MEMORY_DB['briefings'].append(data)
    persist_db()
    return data

def get_latest_briefing() -> Optional[Dict]:
    res = sorted(IN_MEMORY_DB['briefings'], key=lambda x: x.get('generated_at', ''), reverse=True)
    return res[0] if res else None
