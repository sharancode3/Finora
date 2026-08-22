from typing import List, Dict
from backend.db.firestore_client import get_businesses, IN_MEMORY_DB

def get_all_businesses() -> List[Dict]:
    return get_businesses()

def get_business_by_id(business_id: str) -> Dict:
    for b in get_businesses():
        if b.get('id') == business_id:
            return b
    return None

def get_business_summary() -> List[Dict]:
    """
    Returns a summary of all businesses with their key metrics.
    """
    businesses = get_all_businesses()
    summary = []
    
    # Simple calculation for unresolved amount per business
    # Real implementation would use value_weighted.py per business
    from backend.db.firestore_client import get_exceptions
    
    all_exceptions = get_exceptions()
    
    for b in businesses:
        bid = b.get('id')
        biz_exceptions = [e for e in all_exceptions if e.get('business_id') == bid]
        unresolved_amount = sum(float(e.get('amount', 0)) for e in biz_exceptions if e.get('status') != 'resolved')
        
        summary.append({
            "business_id": bid,
            "name": b.get('name'),
            "unresolved_amount": unresolved_amount,
            "exception_count": len(biz_exceptions)
        })
        
    # Sort by unresolved amount descending
    return sorted(summary, key=lambda x: x['unresolved_amount'], reverse=True)
