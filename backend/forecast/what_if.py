import uuid
from datetime import datetime, timedelta
from typing import Dict, Any
from backend.forecast.forecast_engine import compute_forecast

def run_what_if_simulation(business_id: str, scenario: str, params: Dict[str, Any]) -> Dict:
    # 1. Get baseline forecast
    baseline = compute_forecast(business_id=business_id, days_ahead=7)
    
    # 2. Clone baseline projections
    projected = []
    for p in baseline['projections']:
        projected.append(p.copy())
        
    # 3. Apply transformation based on scenario
    if scenario == "delay_settlements":
        delay_days = params.get('days', 3)
        # shift everything right by delay_days
        new_projected = []
        for i, p in enumerate(projected):
            shifted_inflow = 0.0
            if i >= delay_days:
                shifted_inflow = projected[i - delay_days]['projected_inflow']
            
            new_projected.append({
                "date": p['date'],
                "projected_inflow": round(shifted_inflow, 2),
                "is_holiday": p['is_holiday']
            })
        projected = new_projected

    elif scenario == "decrease_sales":
        percent = params.get('percent', 10.0) / 100.0
        for p in projected:
            p['projected_inflow'] = round(p['projected_inflow'] * (1.0 - percent), 2)

    elif scenario == "increase_refunds":
        refund_rate = params.get('percent', 5.0) / 100.0
        for p in projected:
            p['projected_inflow'] = round(p['projected_inflow'] * (1.0 - refund_rate), 2)
            
    elif scenario == "custom_scenario":
        adjustment = params.get('adjustment', 0.0)
        for p in projected:
            p['projected_inflow'] = round(max(0.0, p['projected_inflow'] + adjustment), 2)
    
    else:
        raise ValueError(f"Unknown scenario: {scenario}")

    # 4. Compute metrics
    baseline_total = baseline['total_projected']
    projected_total = round(sum(p['projected_inflow'] for p in projected), 2)
    difference = round(projected_total - baseline_total, 2)
    
    difference_pct = 0.0
    if baseline_total > 0:
        difference_pct = round((difference / baseline_total) * 100, 2)
        
    risk_level = "LOW"
    if difference_pct < -20:
        risk_level = "CRITICAL"
    elif difference_pct < -10:
        risk_level = "HIGH"
    elif difference_pct < -5:
        risk_level = "MEDIUM"

    return {
        "id": f"sim_{uuid.uuid4().hex[:8]}",
        "scenario_name": scenario,
        "params": params,
        "baseline_total": baseline_total,
        "projected_total": projected_total,
        "difference": difference,
        "difference_pct": difference_pct,
        "risk_level": risk_level,
        "projections": projected,
        "generated_at": datetime.utcnow().isoformat()
    }
