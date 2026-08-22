import uuid
from datetime import datetime
from backend.db.firestore_client import get_exceptions, get_batch_runs, write_alert
from backend.metrics.value_weighted import compute_value_metrics
from backend.scoring.risk_scorer import score_all_exceptions

def run_alert_engine(business_id: str = None):
    # 1. Check Unreconciled Value
    metrics = compute_value_metrics(business_id)
    if metrics['exception_value'] > 100000.0:
        create_alert(
            title="High Unreconciled Value",
            message=f"Total unresolved exception value is ₹{metrics['exception_value']:,.0f}.",
            severity="CRITICAL",
            business_id=business_id
        )
        
    # 2. Check Match Rate Drop
    batch_runs = get_batch_runs(limit=2)
    if len(batch_runs) >= 2:
        current_rate = batch_runs[0].get('overall_match_rate', 0.0)
        prev_rate = batch_runs[1].get('overall_match_rate', 0.0)
        if (prev_rate - current_rate) > 0.05: # > 5% drop
            create_alert(
                title="Match Rate Dropped",
                message=f"Reconciliation rate dropped by {(prev_rate - current_rate)*100:.1f}% since last run.",
                severity="INFO",
                business_id=business_id
            )
            
    # 3. New High Value Exception
    exceptions = get_exceptions()
    if business_id:
        exceptions = [e for e in exceptions if e.get('business_id') == business_id]
        
    scored = score_all_exceptions(exceptions)
    for exc in scored:
        if exc.get('amount', 0) > 50000.0 and exc.get('status') != 'resolved':
            # In a real app we'd check if this alert was already generated
            create_alert(
                title="Critical Exception Detected",
                message=f"A new exception for ₹{exc.get('amount', 0):,.0f} requires immediate attention.",
                severity="CRITICAL",
                business_id=business_id,
                related_entity_id=exc.get('id')
            )
            # Only trigger once for this demo
            break

def create_alert(title: str, message: str, severity: str, business_id: str = None, related_entity_id: str = None):
    alert = {
        "id": f"alert_{uuid.uuid4().hex[:8]}",
        "business_id": business_id,
        "title": title,
        "message": message,
        "severity": severity,
        "related_entity_id": related_entity_id,
        "dismissed": False,
        "created_at": datetime.utcnow().isoformat()
    }
    write_alert(alert)
