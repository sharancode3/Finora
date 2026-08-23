from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Any, Dict
from pydantic import BaseModel
import time
import os
import sys

# Phase 0 DAL strictly
from backend.db.sqlite_client import (
    get_transactions_by_date_range, get_transactions_by_business,
    get_exceptions_by_date_range, get_aggregates,
    get_transaction_by_id, get_exception_by_id,
    resolve_exception, escalate_exception,
    get_cash_position_analytics
)
from backend.ai_agent import ask_finora_agent

app = FastAPI(title="Finora API", description="AI Finance Controller API - Phase 0 (Data Foundation)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Phase 0 & Phase 4 Routers ---
transactions_router = APIRouter(prefix="/api/v1/transactions", tags=["Transactions"])
exceptions_router = APIRouter(prefix="/api/v1/exceptions", tags=["Exceptions"])
analytics_router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])
chat_router = APIRouter(prefix="/api/v1/chat", tags=["AI Chat"])

class ChatReq(BaseModel):
    question: str
    context: dict = {}

@chat_router.post("/ask")
def api_chat_ask(req: ChatReq):
    return ask_finora_agent(req.question, req.context)

@transactions_router.get("/")
def api_get_transactions(start_date: str = Query(...), end_date: str = Query(...)):
    return get_transactions_by_date_range(start_date, end_date)

@transactions_router.get("/business/{business_id}")
def api_get_transactions_by_business(business_id: str):
    return get_transactions_by_business(business_id)

@transactions_router.get("/{tx_id}")
def api_get_transaction(tx_id: str):
    tx = get_transaction_by_id(tx_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx

@exceptions_router.get("/")
def api_get_exceptions(start_date: str = Query(...), end_date: str = Query(...), reason: Optional[str] = None, status: Optional[str] = None):
    return get_exceptions_by_date_range(start_date, end_date, reason, status)

@exceptions_router.get("/{exc_id}")
def api_get_exception(exc_id: str):
    exc = get_exception_by_id(exc_id)
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")
    return exc

class ResolveReq(BaseModel):
    reason: str
    note: str = ""

class EscalateReq(BaseModel):
    note: str = ""

@exceptions_router.post("/{exc_id}/resolve")
def api_resolve_exception(exc_id: str, req: ResolveReq):
    resolve_exception(exc_id, req.reason, req.note)
    return {"status": "success"}

@exceptions_router.post("/{exc_id}/escalate")
def api_escalate_exception(exc_id: str, req: EscalateReq):
    escalate_exception(exc_id, req.note)
    return {"status": "success"}

@exceptions_router.post("/{exc_id}/investigate-ai")
def api_investigate_exception_ai(exc_id: str):
    try:
        from backend.db.sqlite_client import run_ai_exception_investigation
        res = run_ai_exception_investigation(exc_id)
        if "error" in res:
            raise HTTPException(status_code=404, detail=res["error"])
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@exceptions_router.get("/{exc_id}/investigations")
def api_get_exception_investigations(exc_id: str):
    try:
        from backend.db.sqlite_client import get_exception_investigations
        return get_exception_investigations(exc_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.get("/aggregates")
def api_get_aggregates(interval: str = Query("monthly")):
    try:
        return get_aggregates(interval)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@analytics_router.get("/cash-position")
def get_cash_position(start_date: str, end_date: str, account_id: Optional[str] = None):
    try:
        from backend.db.sqlite_client import get_cash_position_analytics
        return get_cash_position_analytics(start_date, end_date, account_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.get("/month-end-summary")
def get_month_end_summary(target_month: str = "2026-08"):
    try:
        from backend.ai_agent import generate_month_end_summary
        return generate_month_end_summary(target_month)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.get("/statistical-anomalies")
def get_statistical_anomalies(start_date: str = "2026-03-01", end_date: str = "2026-09-05", account_id: Optional[str] = None):
    try:
        from backend.db.sqlite_client import get_transactions_by_date_range
        from backend.anomaly_engine import run_isolation_forest_analysis
        txs = get_transactions_by_date_range(start_date, end_date, account_id)
        return run_isolation_forest_analysis(txs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.get("/benford-analysis")
def get_benford_analysis(start_date: str = "2026-03-01", end_date: str = "2026-09-05", account_id: Optional[str] = None):
    try:
        from backend.db.sqlite_client import get_transactions_by_date_range
        from backend.anomaly_engine import compute_benfords_law_distribution
        txs = get_transactions_by_date_range(start_date, end_date, account_id)
        return compute_benfords_law_distribution(txs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.get("/exception-intelligence")
def get_exception_intelligence_endpoint(start_date: str = "2026-03-01", end_date: str = "2026-09-05", status: Optional[str] = None, account_id: Optional[str] = None):
    try:
        from backend.db.sqlite_client import get_exception_intelligence
        return get_exception_intelligence(start_date, end_date, status, account_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.get("/kpi-breakdown")
def get_kpi_breakdown_endpoint(metric_key: str = Query(...), start_date: str = "2026-08-01", end_date: str = "2026-08-31", account_id: Optional[str] = None):
    try:
        from backend.db.sqlite_client import get_kpi_why_breakdown
        return get_kpi_why_breakdown(metric_key, start_date, end_date, account_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.get("/forensic-narration")
def get_forensic_narration_endpoint(start_date: str = "2026-08-01", end_date: str = "2026-08-31", account_id: Optional[str] = None):
    try:
        from backend.db.sqlite_client import get_forensic_narration
        return get_forensic_narration(start_date, end_date, account_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.get("/daily-briefing")
def get_daily_briefing_endpoint(reference_date: str = "2026-08-31", account_id: Optional[str] = None):
    try:
        from backend.db.sqlite_client import get_daily_briefing_data
        return get_daily_briefing_data(reference_date, account_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.get("/predictive-risk-basis")
def get_predictive_risk_basis_endpoint(start_date: str = "2026-08-01", end_date: str = "2026-08-31", account_id: Optional[str] = None):
    try:
        from backend.db.sqlite_client import get_predictive_risk_basis
        return get_predictive_risk_basis(start_date, end_date, account_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.get("/cluster-why")
def get_cluster_why_endpoint(cluster_key: str = Query(...), start_date: str = "2026-08-01", end_date: str = "2026-08-31", account_id: Optional[str] = None):
    try:
        from backend.db.sqlite_client import get_cluster_why_summary
        return get_cluster_why_summary(cluster_key, start_date, end_date, account_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.get("/parse-exception-query")
def parse_exception_query_endpoint(q: str = Query(...), start_date: str = "2026-08-01", end_date: str = "2026-08-31", account_id: Optional[str] = None):
    try:
        from backend.db.sqlite_client import parse_natural_language_exception_query
        return parse_natural_language_exception_query(q, start_date, end_date, account_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.get("/cash-scenario-simulation")
def get_cash_scenario_simulation_endpoint(
    start_date: str = "2026-08-01",
    end_date: str = "2026-08-31",
    settlement_delay_days: int = 0,
    exception_recovery_rate: float = 1.0,
    volume_change_pct: float = 0.0,
    account_id: Optional[str] = None
):
    try:
        from backend.db.sqlite_client import run_cash_scenario_simulation
        return run_cash_scenario_simulation(
            start_date, end_date, settlement_delay_days, exception_recovery_rate, volume_change_pct, account_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.get("/month-close-checklist-detail")
def get_month_close_checklist_detail_endpoint(check_id: str = Query(...), target_month: str = "2026-08"):
    try:
        from backend.db.sqlite_client import get_checklist_item_assistance
        return get_checklist_item_assistance(check_id, target_month)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.get("/draft-closing-memo")
def get_draft_closing_memo_endpoint(target_month: str = "2026-08"):
    try:
        from backend.db.sqlite_client import draft_month_end_closing_memo
        return draft_month_end_closing_memo(target_month)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.get("/sod-evaluation")
def get_sod_evaluation_endpoint(capabilities: str = Query(..., description="Comma-separated capability strings"), role_name: Optional[str] = None):
    try:
        from backend.db.sqlite_client import evaluate_sod_conflict
        cap_list = [c.strip() for c in capabilities.split(",") if c.strip()]
        return evaluate_sod_conflict(cap_list, role_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.get("/notification-rule-explanation")
def get_notification_rule_explanation_endpoint(rule_id: str = Query(...)):
    try:
        from backend.db.sqlite_client import get_notification_rule_explanation
        return get_notification_rule_explanation(rule_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from backend.db.sqlite_client import get_accounts, connect_new_account, sync_account, get_cross_account_reconciliation

accounts_router = APIRouter(prefix="/api/v1/accounts", tags=["Accounts"])

class ConnectAccountReq(BaseModel):
    name: str
    type: str
    config: Optional[Dict[str, Any]] = None

@accounts_router.get("/")
def api_get_accounts():
    return get_accounts()

@accounts_router.post("/connect")
def api_connect_account(req: ConnectAccountReq):
    try:
        acct_id = connect_new_account(req.name, req.type, req.config)
        return {"status": "success", "account_id": acct_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@accounts_router.post("/connect-demo")
def api_connect_demo(req: ConnectAccountReq):
    try:
        acct_id = connect_new_account(req.name, req.type, req.config)
        return {"status": "success", "account_id": acct_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@accounts_router.post("/{account_id}/sync-now")
def api_sync_now(account_id: str):
    try:
        return sync_account(account_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@accounts_router.get("/cross-reconciliation")
def api_cross_reconciliation(start_date: str = "2026-08-01", end_date: str = "2026-08-31"):
    try:
        return get_cross_account_reconciliation(start_date, end_date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@accounts_router.get("/suspense-breakdown")
def api_suspense_breakdown(start_date: str = "2026-08-01", end_date: str = "2026-08-31"):
    try:
        from backend.db.sqlite_client import get_suspense_reconciliation_breakdown
        return get_suspense_reconciliation_breakdown(start_date, end_date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@accounts_router.get("/{account_id}/sync-health")
def api_get_sync_health(account_id: str):
    try:
        from backend.db.sqlite_client import get_feed_sync_health
        return get_feed_sync_health(account_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(transactions_router)
app.include_router(exceptions_router)
app.include_router(analytics_router)
app.include_router(chat_router)
app.include_router(accounts_router)

# Note: All previous routers and logic (reconciliation, chat, forecast, connectors, dashboard, phase7 features)
# have been temporarily removed in Phase 0 as they depended on the deprecated Firebase DAL.
# They will be restored and migrated to the new SQLite schema in subsequent phases.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
