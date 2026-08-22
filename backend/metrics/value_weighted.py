from typing import Dict
from backend.db.firestore_client import get_exceptions, get_matches, get_settlements
from backend.scoring.risk_scorer import score_all_exceptions

def compute_value_metrics(business_id: str = None) -> Dict:
    settlements = get_settlements(business_id=business_id)
    matches = get_matches()
    exceptions = get_exceptions()
    if business_id:
        exceptions = [e for e in exceptions if e.get('business_id') == business_id]
        # simple filtering for matches based on settlement business_id
        settlement_ids = {s['id'] for s in settlements if s.get('id')}
        matches = [m for m in matches if m.get('settlement_id') in settlement_ids]
        
    scored_exceptions = score_all_exceptions(exceptions)
    
    # Total Records
    total_records = len(settlements)
    matched_records = len(matches)
    
    record_match_rate = (matched_records / total_records) if total_records > 0 else 0.0
    
    # Financial Value
    total_value = sum(float(s.get('gross_amount', s.get('amount', 0))) for s in settlements)
    
    # matched value is sum of matched settlements gross amounts
    matched_settlement_ids = {m.get('settlement_id') for m in matches}
    matched_value = sum(float(s.get('gross_amount', s.get('amount', 0))) for s in settlements if s.get('id') in matched_settlement_ids)
    
    financial_value_reconciled = (matched_value / total_value) if total_value > 0 else 0.0
    
    # Exception Value Exposure
    exception_value = sum(float(e.get('amount', 0)) for e in exceptions)
    exception_value_exposure = (exception_value / total_value) if total_value > 0 else 0.0
    
    # Value at risk (CRITICAL or HIGH exceptions)
    value_at_risk = sum(float(e.get('amount', 0)) for e in scored_exceptions if e.get('severity') in ['CRITICAL', 'HIGH'])
    
    return {
        "record_match_rate": round(record_match_rate * 100, 2),
        "financial_value_reconciled": round(financial_value_reconciled * 100, 2),
        "exception_value_exposure": round(exception_value_exposure * 100, 2),
        "value_at_risk": round(value_at_risk, 2),
        "total_records": total_records,
        "matched_records": matched_records,
        "total_value": round(total_value, 2),
        "matched_value": round(matched_value, 2),
        "exception_value": round(exception_value, 2)
    }
