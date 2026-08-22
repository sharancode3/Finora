from backend.db.firestore_client import IN_MEMORY_DB

def check_audit_trail():
    print("Checking Audit Trail Completeness...")
    db = IN_MEMORY_DB
    
    # Check Batch Runs
    for b in db.get('batch_runs', []):
        assert 'timestamp' in b
        assert 'total_records' in b
        assert 'overall_match_rate' in b
        assert 'processing_time_ms' in b
        
    # Check Matches
    for m in db.get('matches', []):
        assert 'method' in m
        assert 'confidence' in m
        
    # Check Exceptions
    for e in db.get('exceptions', []):
        assert 'reason' in e
        assert 'severity' in e
        assert 'recommended_action' in e
        
    # Check Alerts & Briefings
    for a in db.get('alerts', []):
        assert 'severity' in a
        assert 'title' in a
        
    print("Audit trail verified. All required fields are present across collections.")

if __name__ == "__main__":
    check_audit_trail()
