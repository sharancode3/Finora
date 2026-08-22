from fastapi import FastAPI, APIRouter, HTTPException, Query, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Any, Dict
from pydantic import BaseModel
import time
import os
import sys

# Import our DAL strictly
from db.firestore_client import (
    get_latest_batch_run, get_batch_runs, get_settlements, get_settlement_by_id,
    get_bank_transactions, get_bank_transaction_by_id, get_ledger_entries, get_ledger_entry_by_id,
    get_matches, get_match_by_id, get_exceptions, get_exception_by_id, get_record_evidence_trail
)
from connectors.base import active_connectors
from scripts.ingest_results import ingest_data
from matching.matcher import run_reconciliation
from ai.orchestrator import process_question

app = FastAPI(title="Finora API", description="AI Finance Controller API - Phase 4")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
reconciliation_router = APIRouter(prefix="/api/v1/reconciliation", tags=["Reconciliation"])
records_router = APIRouter(prefix="/api/v1/records", tags=["Records"])
chat_router = APIRouter(prefix="/api/v1/chat", tags=["Chat"])
forecast_router = APIRouter(prefix="/api/v1/forecast", tags=["Forecast"])
connectors_router = APIRouter(prefix="/api/v1/connectors", tags=["Connectors"])
dashboard_router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])

# --- Models for requests/responses (some are in schemas.py, but we can define explicit request models here) ---
class RunRequest(BaseModel):
    business_id: Optional[str] = None
    batch_id: Optional[str] = None

class RZPKey(BaseModel):
    api_key: str

class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = None

# ================= RECONCILIATION =================
@reconciliation_router.post("/run")
def api_run_reconciliation(req: RunRequest):
    import csv
    start_time = time.time()
    
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'output')
    
    def load_csv(name):
        with open(os.path.join(data_dir, name), 'r', encoding='utf-8') as f:
            return list(csv.DictReader(f))
            
    try:
        settlements = load_csv('settlement_report.csv')
        banks = load_csv('bank_statement.csv')
        ledgers = load_csv('internal_ledger.csv')
        
        # Call matcher directly
        res = run_reconciliation(settlements, banks, ledgers)
        
        # Write temporary json for ingestion script
        import json
        with open(os.path.join(data_dir, 'matched_records.json'), 'w') as f:
            json.dump(res['matched_records'], f)
        with open(os.path.join(data_dir, 'exceptions.json'), 'w') as f:
            json.dump(res['exceptions'], f)
            
        processing_time = int((time.time() - start_time) * 1000)
        
        # Ingest to Firestore
        batch_run = ingest_data(data_dir, processing_time_ms=processing_time, value_reconciliation_rate=res['metrics']['value_reconciliation_rate'])
        
        return {"batch_id": batch_run['id'], "status": "success", "summary": batch_run}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@reconciliation_router.get("/summary")
def api_get_summary():
    data = get_latest_batch_run()
    if not data:
        raise HTTPException(status_code=404, detail="No batch runs found")
    return data

@reconciliation_router.get("/runs")
def api_get_runs():
    return get_batch_runs()

# ================= RECORDS =================
@records_router.get("/settlements")
def api_get_settlements(business_id: Optional[str] = None, status: Optional[str] = None):
    # Ignoring status parameter for now as it wasn't strictly defined in requirements
    return get_settlements(business_id=business_id)

@records_router.get("/settlements/{id}")
def api_get_settlement(id: str):
    trail = get_record_evidence_trail(id)
    if not trail["settlement"]:
        raise HTTPException(status_code=404, detail="Not found")
    return trail

@records_router.get("/bank-transactions")
def api_get_bank_transactions():
    return get_bank_transactions()

@records_router.get("/bank-transactions/{id}")
def api_get_bank_transaction(id: str):
    trail = get_record_evidence_trail(id)
    if not trail["bank_transaction"]:
        raise HTTPException(status_code=404, detail="Not found")
    return trail

@records_router.get("/ledger-entries")
def api_get_ledger_entries(business_id: Optional[str] = None, status: Optional[str] = None):
    return get_ledger_entries(business_id=business_id, order_status=status)

@records_router.get("/ledger-entries/{id}")
def api_get_ledger_entry(id: str):
    trail = get_record_evidence_trail(id)
    if not trail["ledger_entry"]:
        raise HTTPException(status_code=404, detail="Not found")
    return trail

@records_router.get("/matches")
def api_get_matches(method: Optional[str] = None, trust_state: Optional[str] = None):
    return get_matches(method=method, trust_state=trust_state)

@records_router.get("/matches/{id}")
def api_get_match(id: str):
    m = get_match_by_id(id)
    if not m:
        raise HTTPException(status_code=404, detail="Not found")
    return m

@records_router.get("/exceptions")
def api_get_exceptions(
    reason_filter: Optional[str] = None,
    severity: Optional[str] = None,
    trust_state: Optional[str] = None
):
    reason_list = reason_filter.split(",") if reason_filter else None
    return get_exceptions(severity=severity, trust_state=trust_state, reason_list=reason_list)

@records_router.get("/exceptions/{id}")
def api_get_exception(id: str):
    e = get_exception_by_id(id)
    if not e:
        raise HTTPException(status_code=404, detail="Not found")
    # Simulate evidence trail
    trail = {}
    if e.get("related_settlement_id"):
        trail = get_record_evidence_trail(e["related_settlement_id"])
    e["evidence_trail"] = trail
    return e

# ================= CHAT =================
@chat_router.post("/ask")
def api_chat_ask(req: ChatRequest):
    try:
        res = process_question(req.question, req.session_id)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ================= FORECAST =================
@forecast_router.get("/cash-position")
def api_cash_position():
    return {"cash_available": 1050000.0, "pending_settlements": 250000.0}

@forecast_router.get("/projected")
def api_projected_forecast():
    return {"expected_inflows": 500000.0, "expected_outflows": 120000.0}

@forecast_router.post("/what-if")
def api_what_if():
    # Phase 7 stub
    return {"status": "simulated"}

# ================= CONNECTORS =================
@connectors_router.get("/")
def api_get_connectors():
    return [c.get_status().model_dump() for c in active_connectors.values()]

@connectors_router.post("/csv-upload")
def api_upload_csv(file: UploadFile = File(...)):
    try:
        content = file.file.read().decode('utf-8')
        res = active_connectors["csv"].connect({"file_content": content})
        if not res.success:
            raise HTTPException(status_code=400, detail=res.error)
        records = active_connectors["csv"].fetch_transactions(None)
        return {
            "row_count": len(records),
            "sample": records[:2] if len(records) > 0 else []
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@connectors_router.post("/razorpay-test-key")
def api_setup_rzp(req: RZPKey):
    res = active_connectors["rzp_test"].connect({"api_key": req.api_key})
    if not res.success:
        raise HTTPException(status_code=401, detail=res.error)
    return {"status": "success"}

@connectors_router.get("/razorpay-test-key/status")
def api_rzp_status():
    return active_connectors["rzp_test"].get_status()

# ================= DASHBOARD =================
@dashboard_router.get("/metrics")
def api_dashboard_metrics():
    # Fetch from latest batch run
    latest = get_latest_batch_run()
    if not latest:
        return {}
    
    return {
        "total_processed": latest.get("total_records", 0),
        "settled_amount": 21947046.65, # From Phase 3 eval
        "unreconciled_amount": 567733.81, # From Phase 3 eval
        "match_rate": latest.get("overall_match_rate", 0),
        "exception_count": latest.get("exception_count", 0),
        "cash_available": 1050000.0,
        "pending_settlements": 250000.0,
        "expected_inflows": 500000.0,
        "expected_outflows": 120000.0,
        "finance_health_score": 92,
        "attention_items": [] # Fetch from exceptions
    }

@dashboard_router.get("/attention")
def api_dashboard_attention():
    exceptions = get_exceptions()
    items = []
    for e in exceptions[:5]:
        items.append({
            "type": "EXCEPTION",
            "severity": e.get("severity", "MEDIUM"),
            "message": e.get("reason", "Unknown Exception"),
            "amount": e.get("amount", 0.0),
            "record_id": e.get("id"),
            "recommended_action": e.get("recommended_action", "Review manually")
        })
    return items

# Register routers
app.include_router(reconciliation_router)
app.include_router(records_router)
app.include_router(chat_router)
app.include_router(forecast_router)
app.include_router(connectors_router)
app.include_router(dashboard_router)

from backend.forecast.forecast_engine import compute_forecast
from backend.forecast.what_if import run_what_if_simulation
from backend.scoring.health_score import compute_health_score
from backend.metrics.value_weighted import compute_value_metrics
from backend.metrics.why_breakdown import get_cash_position_why, get_variance_why
from backend.metrics.timeline_builder import build_transaction_timeline
from backend.ai.briefing import generate_daily_briefing
from backend.alerts.alert_engine import run_alert_engine
from backend.db.firestore_client import get_alerts, get_latest_briefing
from backend.business.multi_business import get_all_businesses, get_business_summary
from typing import Dict, Any
from fastapi import HTTPException

# ---------------------------------------------------------
# Phase 7: Advanced Analytics Routes
# ---------------------------------------------------------
phase7_router = APIRouter(prefix="/api/v1", tags=["Phase 7 Advanced"])

@phase7_router.get("/business")
def get_businesses_route():
    return {"businesses": get_all_businesses()}

@phase7_router.get("/business/summary")
def get_business_summary_route():
    return {"summary": get_business_summary()}

@phase7_router.get("/scoring/health")
def get_health_score_route(business_id: str = None):
    return compute_health_score(business_id)

@phase7_router.get("/metrics/value-weighted")
def get_value_weighted_metrics_route(business_id: str = None):
    return compute_value_metrics(business_id)

@phase7_router.get("/forecast/compute")
def get_cash_forecast_route(business_id: str = None, days: int = 7):
    return compute_forecast(business_id, days)

@phase7_router.post("/forecast/what-if")
def post_what_if_route(request: Dict[str, Any]):
    scenario = request.get('scenario')
    params = request.get('params', {})
    business_id = request.get('business_id')
    
    if not scenario:
        raise HTTPException(status_code=400, detail="Missing scenario")
        
    return run_what_if_simulation(business_id, scenario, params)

@phase7_router.get("/metrics/why/cash-position")
def get_why_cash_position():
    return {"breakdown": get_cash_position_why()}

@phase7_router.get("/metrics/why/variance/{record_id}")
def get_why_variance(record_id: str):
    return {"breakdown": get_variance_why(record_id)}

@phase7_router.get("/metrics/timeline/{record_id}")
def get_transaction_timeline_route(record_id: str):
    return {"timeline": build_transaction_timeline(record_id)}

@phase7_router.get("/briefing")
def get_daily_briefing_route(business_id: str = None, force_generate: bool = False):
    if force_generate:
        return generate_daily_briefing(business_id)
        
    latest = get_latest_briefing()
    if latest:
        return latest
    return generate_daily_briefing(business_id)

@phase7_router.get("/alerts")
def get_alerts_route(business_id: str = None):
    # Run the engine to generate any pending alerts
    run_alert_engine(business_id)
    
    alerts = get_alerts(active_only=True)
    if business_id:
        alerts = [a for a in alerts if a.get('business_id') == business_id]
        
    return {"alerts": alerts}

app.include_router(phase7_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
