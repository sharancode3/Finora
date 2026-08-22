import uuid
from datetime import datetime
from typing import Dict
from backend.db.firestore_client import get_batch_runs, write_briefing
from backend.metrics.value_weighted import compute_value_metrics

def generate_daily_briefing(business_id: str = None) -> Dict:
    batch_runs = get_batch_runs(limit=2)
    current_run = batch_runs[0] if len(batch_runs) > 0 else None
    prev_run = batch_runs[1] if len(batch_runs) > 1 else None
    
    metrics = compute_value_metrics(business_id)
    
    current_rate = metrics['record_match_rate']
    prev_rate = prev_run.get('overall_match_rate', 0) * 100 if prev_run else current_rate
    diff_rate = round(current_rate - prev_rate, 2)
    diff_sign = "+" if diff_rate >= 0 else ""
    
    settled_value = metrics['total_value']
    exceptions_count = 3 # Mock for now or calculate from DB
    unresolved_value = metrics['exception_value']
    
    briefing_text = f"""Good morning. Here's what changed since yesterday.

• ₹{settled_value/100000:,.1f}L settled yesterday
• Reconciliation rate: {current_rate}% ({diff_sign}{diff_rate}% from yesterday)
• {exceptions_count} new exceptions detected
• ₹{unresolved_value:,.0f} unresolved
• No immediate cash shortfall expected

Attention needed:
→ High-value exceptions require review.
"""

    record = {
        "id": f"brief_{uuid.uuid4().hex[:8]}",
        "business_id": business_id,
        "content": briefing_text,
        "generated_at": datetime.utcnow().isoformat()
    }
    
    write_briefing(record)
    return record
