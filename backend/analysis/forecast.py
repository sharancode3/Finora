from datetime import date, timedelta, datetime
import uuid
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db.firestore_client import get_all_settlements, save_forecast

# HARDCODED HOLIDAYS (2026) for realistic T+2 cadence (From Phase A)
HOLIDAYS_2026 = [
    date(2026, 1, 26),  # Republic Day
    date(2026, 8, 15),  # Independence Day
    date(2026, 10, 2),  # Gandhi Jayanti
]

def is_business_day(d: date) -> bool:
    if d.weekday() >= 5:  # 5=Sat, 6=Sun
        return False
    if d in HOLIDAYS_2026:
        return False
    return True

def generate_forecast(days_ahead: int = 7) -> dict:
    settlements = get_all_settlements()
    if not settlements:
        return {"error": "No settlements available to forecast"}

    # Aggregate by date
    daily_totals = {}
    for s in settlements:
        if not s.get("settlement_date"): continue
        
        # Parse date. Could be string like '2026-08-01' or timestamp dict if raw firestore
        d_str = s["settlement_date"]
        if isinstance(d_str, str):
            d_str = d_str[:10]  # Just YYYY-MM-DD
        else:
            continue # Skip unknown formats for safety
            
        try:
            d_val = datetime.strptime(d_str, "%Y-%m-%d").date()
        except:
            continue
            
        daily_totals[d_val] = daily_totals.get(d_val, 0.0) + float(s.get("settled_amount", 0.0))

    if not daily_totals:
        return {"error": "No valid settlement dates"}

    sorted_dates = sorted(daily_totals.keys())
    latest_date = sorted_dates[-1]
    
    # Calculate rolling average of the last 14 business days (or max available)
    recent_dates = [d for d in sorted_dates if is_business_day(d)]
    recent_14 = recent_dates[-14:] if len(recent_dates) > 14 else recent_dates
    
    if not recent_14:
        return {"error": "No business days found in data"}
        
    avg_inflow = sum(daily_totals[d] for d in recent_14) / len(recent_14)

    # Project forward
    projections = []
    accumulated_shift = 0.0
    
    for i in range(1, days_ahead + 1):
        curr_date = latest_date + timedelta(days=i)
        
        if is_business_day(curr_date):
            expected = avg_inflow + accumulated_shift
            accumulated_shift = 0.0
            projections.append({
                "date": curr_date.strftime("%Y-%m-%d"),
                "projected_inflow": round(expected, 2),
                "is_holiday": False
            })
        else:
            accumulated_shift += avg_inflow
            projections.append({
                "date": curr_date.strftime("%Y-%m-%d"),
                "projected_inflow": 0.0,
                "is_holiday": True
            })
            
    # Prepare trailing 7 days for the chart
    trailing_7 = sorted_dates[-7:]
    historical = [{"date": d.strftime("%Y-%m-%d"), "actual_inflow": round(daily_totals[d], 2)} for d in trailing_7]
    
    # Save to Firestore
    forecast_id = f"fct_{uuid.uuid4().hex[:8]}"
    start_d = (latest_date + timedelta(days=1)).strftime("%Y-%m-%d")
    end_d = (latest_date + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
    
    forecast_doc = {
        "date_range": {"start": start_d, "end": end_d},
        "method_used": "holiday-adjusted rolling average",
        "projected_inflow": round(sum(p["projected_inflow"] for p in projections), 2),
        "based_on_records": [s["id"] for s in settlements if "id" in s],
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "daily_projections": projections,
        "historical_context": historical
    }
    
    save_forecast(forecast_id, forecast_doc)
    
    forecast_doc["id"] = forecast_id
    return forecast_doc

if __name__ == "__main__":
    res = generate_forecast(7)
    print("Forecast generated:")
    import json
    print(json.dumps(res, indent=2))
