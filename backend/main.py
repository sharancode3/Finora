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
