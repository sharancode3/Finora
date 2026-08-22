from typing import Dict, List
from backend.db.firestore_client import get_record_evidence_trail

def build_transaction_timeline(record_id: str) -> List[Dict]:
    trail = get_record_evidence_trail(record_id)
    timeline = []
    
    # Order Created (Ledger)
    ledger = trail.get('ledger_entry')
    if ledger:
        timeline.append({
            "icon": "FileText",
            "title": "Order Created",
            "id": ledger.get('id', ledger.get('order_id', '')),
            "date": ledger.get('created_at', ledger.get('date', 'Unknown')),
            "amount": float(ledger.get('amount', 0))
        })
        
    # Payment Captured (Settlement)
    settlement = trail.get('settlement')
    if settlement:
        # Assuming we have a payment captured event
        timeline.append({
            "icon": "CreditCard",
            "title": "Payment Captured",
            "id": settlement.get('id', settlement.get('payment_id', '')),
            "date": settlement.get('payment_captured_at', settlement.get('settlement_date', 'Unknown')),
            "amount": float(settlement.get('gross_amount', 0))
        })
        
        timeline.append({
            "icon": "Building",
            "title": "Settlement Processed",
            "id": settlement.get('settlement_id', 'SET-UNKNOWN'),
            "date": settlement.get('settlement_date', 'Unknown'),
            "amount": float(settlement.get('settled_amount', 0))
        })
        
    # Bank Credit
    bank = trail.get('bank_transaction')
    if bank:
        timeline.append({
            "icon": "Banknote",
            "title": "Bank Credit Received",
            "id": bank.get('id', bank.get('reference_number', '')),
            "date": bank.get('transaction_date', 'Unknown'),
            "amount": float(bank.get('credit_amount', 0))
        })
        
    # Exceptions
    for e in trail.get('exceptions', []):
        timeline.append({
            "icon": "XCircle",
            "title": f"Exception: {e.get('reason', 'unknown')}",
            "id": e.get('id', 'EXC-UNKNOWN'),
            "date": e.get('created_at', 'Unknown'),
            "amount": float(e.get('amount', 0)),
            "is_exception": True
        })
        
    # Matches
    for m in trail.get('matches', []):
        timeline.append({
            "icon": "CheckCircle",
            "title": f"Reconciled ({m.get('method', 'Exact')})",
            "id": m.get('id', 'MATCH-UNKNOWN'),
            "date": m.get('created_at', 'Unknown'),
            "amount": 0,
            "is_success": True
        })
        
    # Sort timeline by date
    timeline = sorted(timeline, key=lambda x: x['date'])
    return timeline
