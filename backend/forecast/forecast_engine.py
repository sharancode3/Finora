import uuid
from datetime import datetime, timedelta
from typing import List, Dict
from backend.db.firestore_client import get_settlements, write_forecast

def is_holiday(dt: datetime) -> bool:
    # A stub for holiday logic (weekends only for now, could integrate a calendar API)
    return dt.weekday() >= 5

def group_by_date(settlements: List[Dict], date_key: str, val_key: str) -> Dict[str, float]:
    grouped = {}
    for s in settlements:
        d_str = s.get(date_key)
        v = s.get(val_key, 0)
        if d_str and isinstance(d_str, str):
            # parse date ignoring time if needed, assuming ISO
            d_date = d_str[:10]
            grouped[d_date] = grouped.get(d_date, 0) + float(v)
    return grouped

def get_last_n_business_days(grouped_data: Dict[str, float], n: int, today: datetime) -> List[float]:
    recent_days = []
    current_date = today
    while len(recent_days) < n:
        if not is_holiday(current_date):
            d_str = current_date.strftime("%Y-%m-%d")
            recent_days.append(grouped_data.get(d_str, 0.0))
        current_date -= timedelta(days=1)
    return recent_days

def get_holidays_in_window(window_start: datetime, window_end: datetime) -> List[datetime]:
    holidays = []
    current = window_start
    while current <= window_end:
        if is_holiday(current):
            holidays.append(current)
        current += timedelta(days=1)
    return holidays

def compute_forecast(business_id: str = None, days_ahead: int = 7) -> Dict:
    settlements = get_settlements(business_id=business_id)
    today = datetime.utcnow()
    
    # 1. Group settlements by settlement_date
    daily_inflows = group_by_date(settlements, 'settlement_date', 'settled_amount')
    
    # 2. Compute rolling average of last 14 business days
    recent_days = get_last_n_business_days(daily_inflows, n=14, today=today)
    rolling_avg = sum(recent_days) / len(recent_days) if recent_days else 0.0
    
    # 3. Adjust for known upcoming holidays
    window_end = today + timedelta(days=days_ahead)
    upcoming_holidays = get_holidays_in_window(window_start=today, window_end=window_end)
    # The requirement said 15% reduction per holiday
    holiday_adjustment_factor = max(0.0, 1.0 - (len(upcoming_holidays) * 0.15))
    
    # 4. Project forward
    projections = []
    for day in range(1, days_ahead + 1):
        projected_date = today + timedelta(days=day)
        if is_holiday(projected_date):
            projected_inflow = 0.0
        else:
            projected_inflow = rolling_avg * holiday_adjustment_factor
            
        projections.append({
            "date": projected_date.isoformat(),
            "projected_inflow": round(projected_inflow, 2),
            "is_holiday": is_holiday(projected_date)
        })
        
    forecast_record = {
        "id": f"forecast_{uuid.uuid4().hex[:8]}",
        "business_id": business_id,
        "method_used": "holiday-adjusted rolling average",
        "based_on_records": [s.get('id') for s in settlements if s.get('id')],
        "rolling_average": round(rolling_avg, 2),
        "holiday_adjustment_factor": round(holiday_adjustment_factor, 2),
        "projections": projections,
        "total_projected": round(sum(p["projected_inflow"] for p in projections), 2),
        "generated_at": datetime.utcnow().isoformat()
    }
    
    write_forecast(forecast_record)
    return forecast_record
