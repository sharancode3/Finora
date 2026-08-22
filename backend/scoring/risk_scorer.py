import math
from typing import Dict, List

def compute_risk_score(exception: Dict, max_amount: float = 1000000.0, business_exception_count: int = 0) -> Dict:
    # 1. Amount weight: log(amount + 1) / log(max_amount + 1) * 40
    amount = float(exception.get('amount', 0.0))
    # Cap max_amount if needed
    safe_max = max(max_amount, amount, 1.0)
    amount_weight = (math.log(amount + 1) / math.log(safe_max + 1)) * 40
    
    # 2. Age weight: days_since_created / 30 * 30 (older = higher risk)
    # Using 'created_at' or 'timestamp' from exception
    # Mocking age calculation based on current time
    # Let's say we have 'created_at' in exception or assume it's new
    age_weight = 0.0
    created_at = exception.get('created_at', exception.get('timestamp'))
    if created_at:
        try:
            from datetime import datetime
            dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            now = datetime.utcnow()
            days_since = (now - dt.replace(tzinfo=None)).days
            age_weight = min(30.0, (days_since / 30.0) * 30.0)
        except:
            pass
            
    # 3. Type weight
    reason = exception.get('reason', '')
    type_weight = 0.0
    if reason == 'no_bank_credit_found':
        type_weight = 10.0
    elif reason == 'amount_mismatch':
        type_weight = 20.0
    elif reason == 'duplicate':
        type_weight = 15.0
    elif reason == 'missing_settlement':
        type_weight = 25.0
        
    # 4. Business weight
    business_weight = 5.0 if business_exception_count > 10 else 0.0
    
    # Total
    total_risk_score = min(100.0, amount_weight + age_weight + type_weight + business_weight)
    
    # Map to Severity
    severity = "LOW"
    if total_risk_score > 80 or amount > 500000.0:
        severity = "CRITICAL"
    elif total_risk_score > 50 or amount > 80000.0:
        severity = "HIGH"
    elif total_risk_score > 25 or amount > 12000.0:
        severity = "MEDIUM"
        
    return {
        "risk_score": round(total_risk_score, 1),
        "severity": severity,
        "breakdown": {
            "amount_weight": round(amount_weight, 1),
            "age_weight": round(age_weight, 1),
            "type_weight": round(type_weight, 1),
            "business_weight": round(business_weight, 1)
        }
    }
    
def score_all_exceptions(exceptions: List[Dict]) -> List[Dict]:
    if not exceptions:
        return []
        
    max_amt = max((float(e.get('amount', 0)) for e in exceptions), default=1000000.0)
    business_counts = {}
    for e in exceptions:
        bid = e.get('business_id', 'default')
        business_counts[bid] = business_counts.get(bid, 0) + 1
        
    scored = []
    for e in exceptions:
        bid = e.get('business_id', 'default')
        res = compute_risk_score(e, max_amount=max_amt, business_exception_count=business_counts.get(bid, 0))
        e_copy = e.copy()
        e_copy['risk_score'] = res['risk_score']
        e_copy['severity'] = res['severity']
        e_copy['risk_breakdown'] = res['breakdown']
        scored.append(e_copy)
        
    return sorted(scored, key=lambda x: x['risk_score'], reverse=True)
