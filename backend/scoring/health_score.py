from typing import Dict, List
from datetime import datetime

def compute_health_score(business_id: str = None) -> Dict:
    from backend.db.firestore_client import get_exceptions, get_latest_batch_run, get_matches, get_settlements
    
    # Get required data
    exceptions = get_exceptions()
    if business_id:
        exceptions = [e for e in exceptions if e.get('business_id') == business_id]
        
    batch_run = get_latest_batch_run()
    
    matches = get_matches()
    settlements = get_settlements(business_id=business_id)
    
    # 1. Reconciliation Rate (30%)
    overall_match_rate = batch_run.get('overall_match_rate', 0.0) if batch_run else 0.0
    reconciliation_score = overall_match_rate * 100
    
    # 2. Exception Exposure (25%)
    # 100 - (exception_value / total_value * 100 * 2) [capped at 100]
    total_value = sum(s.get('settled_amount', 0) for s in settlements)
    exception_value = sum(e.get('amount', 0) for e in exceptions)
    
    exception_exposure = 100.0
    if total_value > 0:
        exposure_penalty = (exception_value / total_value) * 100 * 2
        exception_exposure = max(0.0, 100.0 - exposure_penalty)
        
    # 3. Data Freshness (15%)
    data_freshness = 0.0
    if batch_run and batch_run.get('timestamp'):
        try:
            last_run_time = datetime.fromisoformat(batch_run['timestamp'].replace('Z', '+00:00'))
            # Calculate hours since last run (ignoring timezone issues by just comparing naive for now, or assume UTC)
            now = datetime.utcnow()
            hours_diff = (now - last_run_time.replace(tzinfo=None)).total_seconds() / 3600.0
            
            if hours_diff <= 24:
                data_freshness = 100.0
            elif hours_diff >= 168: # 7 days
                data_freshness = 0.0
            else:
                # decays linearly to 0 at 7 days (168 hours)
                # 100 -> 24h, 0 -> 168h
                decay_rate = 100.0 / (168 - 24)
                data_freshness = 100.0 - ((hours_diff - 24) * decay_rate)
        except:
            data_freshness = 50.0
            
    # 4. Cash Visibility (15%)
    # 100 if cash position is calculable, 0 if missing data
    # (assuming it's calculable if we have settlements)
    cash_visibility = 100.0 if len(settlements) > 0 else 0.0
    
    # 5. Forecast Confidence (15%)
    # based on forecast method + data recency
    forecast_confidence = 85.0 # baseline for holiday-rolling avg with some data
    if data_freshness < 50:
        forecast_confidence = 50.0
        
    # Total Score
    health_score_val = (
        0.30 * reconciliation_score +
        0.25 * exception_exposure +
        0.15 * data_freshness +
        0.15 * cash_visibility +
        0.15 * forecast_confidence
    )
    
    score_rounded = round(health_score_val)
    
    color = "rose"
    if score_rounded > 80:
        color = "emerald"
    elif score_rounded >= 60:
        color = "amber"
        
    return {
        "score": score_rounded,
        "color": color,
        "trend": "up", # mock trend
        "breakdown": {
            "reconciliation_rate": {
                "weight": 30,
                "score": round(reconciliation_score, 1),
                "weighted_contribution": round(0.30 * reconciliation_score, 1)
            },
            "exception_exposure": {
                "weight": 25,
                "score": round(exception_exposure, 1),
                "weighted_contribution": round(0.25 * exception_exposure, 1)
            },
            "data_freshness": {
                "weight": 15,
                "score": round(data_freshness, 1),
                "weighted_contribution": round(0.15 * data_freshness, 1)
            },
            "cash_visibility": {
                "weight": 15,
                "score": round(cash_visibility, 1),
                "weighted_contribution": round(0.15 * cash_visibility, 1)
            },
            "forecast_confidence": {
                "weight": 15,
                "score": round(forecast_confidence, 1),
                "weighted_contribution": round(0.15 * forecast_confidence, 1)
            }
        },
        "generated_at": datetime.utcnow().isoformat()
    }
