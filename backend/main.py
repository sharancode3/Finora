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
    get_cash_position_analytics, get_period_comparison
)
from backend.ai_agent import ask_finora_agent

app = FastAPI(title="Finora API", description="AI Finance Controller API")

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
def api_get_transactions(start_date: str = Query(...), end_date: str = Query(...), account_id: Optional[str] = None):
    return get_transactions_by_date_range(start_date, end_date, account_id)

@transactions_router.get("/business/{business_id}")
def api_get_transactions_by_business(business_id: str):
    return get_transactions_by_business(business_id)

@transactions_router.get("/period-comparison")
def api_get_period_comparison(curr_start: str = Query(...), curr_end: str = Query(...), prev_start: str = Query(...), prev_end: str = Query(...), account_id: Optional[str] = None):
    try:
        return get_period_comparison(curr_start, curr_end, prev_start, prev_end, account_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@transactions_router.get("/{tx_id}")
def api_get_transaction(tx_id: str):
    tx = get_transaction_by_id(tx_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx

@exceptions_router.get("/")
def api_get_exceptions(start_date: str = Query(...), end_date: str = Query(...), reason: Optional[str] = None, status: Optional[str] = None, account_id: Optional[str] = None):
    return get_exceptions_by_date_range(start_date, end_date, reason, status, account_id)

@exceptions_router.get("/{exc_id}")
def api_get_exception(exc_id: str):
    exc = get_exception_by_id(exc_id)
    if not exc:
        tx = get_transaction_by_id(exc_id)
        if tx:
            exc = {
                "id": f"exc_{tx['transaction_id']}",
                "transaction_id": tx['transaction_id'],
                "business_id": tx.get('business_id', 'demo_org_1'),
                "reason": "fee_variance" if tx.get('status') != 'settled' else "settlement_delay",
                "status": "resolved" if tx.get('status') == 'settled' else "open",
                "amount": tx.get('gross_amount', 0.0),
                "gross_amount": tx.get('gross_amount', 0.0),
                "transaction_date": tx.get('transaction_date'),
                "tx_gross": tx.get('gross_amount', 0.0),
                "tx_net": tx.get('net_amount', 0.0),
                "tx_fee": tx.get('fee', 0.0),
                "tx_gst": tx.get('gst', 0.0),
                "tx_bank_reference": tx.get('bank_reference'),
                "tx_status": tx.get('status'),
                "underlying_data": tx
            }
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")
    return exc

class ResolveReq(BaseModel):
    reason: str
    note: str = ""
    user: Optional[str] = "Sarah Jenkins, CPA"
    trigger_type: Optional[str] = "Human Controller Manual Approval"

class EscalateReq(BaseModel):
    note: str = ""
    user: Optional[str] = "Finance Admin"
    trigger_type: Optional[str] = "Human Controller Manual Approval"

@exceptions_router.post("/{exc_id}/resolve")
def api_resolve_exception(exc_id: str, req: ResolveReq):
    resolve_exception(exc_id, req.reason, req.note, user=req.user or "Finance Admin", trigger_type=req.trigger_type or "Human Controller Manual Approval")
    return {"status": "success"}

@exceptions_router.post("/{exc_id}/escalate")
def api_escalate_exception(exc_id: str, req: EscalateReq):
    escalate_exception(exc_id, req.note, user=req.user or "Finance Admin", trigger_type=req.trigger_type or "Human Controller Manual Approval")
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

system_router = APIRouter(prefix="/api/v1/system", tags=["System"])

@system_router.get("/date")
def api_get_system_date():
    from backend.db.sqlite_client import get_system_current_date
    from datetime import datetime
    current_date = get_system_current_date()
    try:
        dt = datetime.strptime(current_date, "%Y-%m-%d")
        formatted = dt.strftime("%B %d, %Y")
        as_of_ts = dt.strftime("%B %d, %Y 18:00 IST")
        month = dt.strftime("%Y-%m")
        month_name = dt.strftime("%B %Y")
    except Exception:
        formatted = current_date
        as_of_ts = f"{current_date} 18:00 IST"
        month = "2026-08"
        month_name = "August 2026"
    return {
        "current_date": current_date,
        "formatted_date": formatted,
        "as_of_timestamp": as_of_ts,
        "month": month,
        "month_name": month_name,
        "is_system_date": True
    }

audit_router = APIRouter(prefix="/api/v1/audit-logs", tags=["Audit Logs"])

class AuditLogCreateReq(BaseModel):
    user: str = "Finance Admin"
    trigger_type: str = "Human Controller Manual Approval"
    action: str
    target: str
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    notes: Optional[str] = None
    ip: Optional[str] = "127.0.0.1 (Local Verified)"

@audit_router.get("/")
def api_get_audit_logs(limit: int = 100):
    from backend.db.sqlite_client import get_audit_logs
    return get_audit_logs(limit)

@audit_router.post("/")
def api_create_audit_log(req: AuditLogCreateReq):
    from backend.db.sqlite_client import record_audit_log
    return record_audit_log(
        user=req.user,
        trigger_type=req.trigger_type,
        action=req.action,
        target=req.target,
        previous_value=req.previous_value,
        new_value=req.new_value,
        notes=req.notes,
        ip=req.ip or "127.0.0.1 (Local Verified)"
    )

month_end_router = APIRouter(prefix="/api/v1/month-end", tags=["Month-End Close"])

class SignOffReq(BaseModel):
    target_month: str = "2026-08"
    signer_name: str = "Sarah Jenkins, CPA"
    signer_role: str = "Finance Controller"
    note: str = ""

@month_end_router.post("/sign-off")
def api_sign_off_month_end(req: SignOffReq):
    from backend.db.sqlite_client import record_audit_log
    log = record_audit_log(
        user=f"{req.signer_name} ({req.signer_role})",
        trigger_type="Controller Sign-Off",
        action="Authorized Period Close & Sign-Off",
        target=f"{req.target_month} Statutory Books",
        previous_value="Status: Pre-Close Verification",
        new_value="Status: Cryptographically Certified & Locked",
        notes=req.note or "Full 5-pillar statutory Ind AS reconciliation checklist verified."
    )
    return {"status": "success", "audit_log": log}

reconciliation_router = APIRouter(prefix="/api/v1/reconciliation", tags=["Reconciliation Run"])

class RunReconciliationReq(BaseModel):
    scope: str = "2026-08"
    account_id: Optional[str] = "all"
    user: Optional[str] = "Sarah Jenkins, CPA"

@reconciliation_router.get("/scopes")
def api_get_reconciliation_scopes():
    from backend.db.sqlite_client import get_available_reconciliation_scopes
    return get_available_reconciliation_scopes()

@reconciliation_router.post("/run")
def api_run_reconciliation(req: RunReconciliationReq):
    from backend.db.sqlite_client import execute_reconciliation_pipeline
    return execute_reconciliation_pipeline(
        scope=req.scope,
        account_id=req.account_id or "all",
        user=req.user or "Sarah Jenkins, CPA"
    )

# --- Phase 6: Document Assistant (Bank Statement Upload & Explainer) ---
from fastapi import UploadFile, File
from backend.document_assistant import DocumentProcessor, DocumentExplainerAgent, get_sample_statements

document_assistant_router = APIRouter(prefix="/api/v1/document-assistant", tags=["Document Assistant"])

# Ephemeral session cache for uploaded documents (Strictly Isolated from ACID Ledger)
_DOCUMENT_SESSION_CACHE: Dict[str, Any] = {}

class DocAssistantAskReq(BaseModel):
    doc_id: str
    question: str

@document_assistant_router.post("/upload")
async def api_document_upload(file: UploadFile = File(...)):
    filename = file.filename or "statement.csv"
    content_bytes = await file.read()

    try:
        if filename.lower().endswith(".csv"):
            text_str = content_bytes.decode("utf-8", errors="ignore")
            result = DocumentProcessor.parse_csv(text_str, filename=filename)
        elif filename.lower().endswith(".pdf"):
            result = DocumentProcessor.parse_pdf(content_bytes, filename=filename)
        elif any(filename.lower().endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp"]):
            result = DocumentProcessor.parse_image(content_bytes, filename=filename)
        else:
            text_str = content_bytes.decode("utf-8", errors="ignore")
            result = DocumentProcessor.parse_text_lines(text_str, filename=filename, doc_type="TEXT")

        _DOCUMENT_SESSION_CACHE[result["doc_id"]] = result
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process statement: {str(e)}")

@document_assistant_router.get("/samples")
def api_get_samples():
    return get_sample_statements()

@document_assistant_router.post("/load-sample/{sample_id}")
def api_load_sample(sample_id: str):
    samples = get_sample_statements()
    sample = next((s for s in samples if s["id"] == sample_id), None)
    if not sample:
        raise HTTPException(status_code=404, detail="Sample statement not found")

    if sample["format"] == "CSV":
        result = DocumentProcessor.parse_csv(sample["content"], filename=sample["name"])
    else:
        result = DocumentProcessor.parse_text_lines(sample["content"], filename=sample["name"], doc_type="TEXT")

    _DOCUMENT_SESSION_CACHE[result["doc_id"]] = result
    return result

@document_assistant_router.get("/document/{doc_id}")
def api_get_document(doc_id: str):
    doc = _DOCUMENT_SESSION_CACHE.get(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document session expired or not found")
    return doc

@document_assistant_router.post("/ask")
def api_document_ask(req: DocAssistantAskReq):
    doc = _DOCUMENT_SESSION_CACHE.get(req.doc_id)
    if not doc:
        # Fallback to loading sample HDFC statement if session was refreshed
        samples = get_sample_statements()
        fallback_sample = samples[0]
        doc = DocumentProcessor.parse_csv(fallback_sample["content"], filename=fallback_sample["name"])
        doc["doc_id"] = req.doc_id
        _DOCUMENT_SESSION_CACHE[req.doc_id] = doc

    return DocumentExplainerAgent.answer_question(doc, req.question)

# --- Phase 7: Tax-Line Matcher (GST & TDS Reconciliation) ---
from backend.tax_matcher import TaxMatcherEngine

tax_matcher_router = APIRouter(prefix="/api/v1/tax-matcher", tags=["Tax Matcher"])

class TaxResolveReq(BaseModel):
    match_id: str
    action: str
    note: str = ""
    scope_period: str = "2026-08"

class TaxReRunReq(BaseModel):
    scope_period: str = "2026-08"
    tolerance: float = 1.0

@tax_matcher_router.get("/summary")
def api_get_tax_summary(scope: str = Query("2026-08")):
    data = TaxMatcherEngine.run_reconciliation(scope)
    return data["summary"]

@tax_matcher_router.get("/records")
def api_get_tax_records(scope: str = Query("2026-08"), tax_type: Optional[str] = None, status: Optional[str] = None):
    data = TaxMatcherEngine.run_reconciliation(scope)
    records = data["records"]
    if tax_type and tax_type.lower() != "all":
        records = [r for r in records if r["tax_type"].lower() == tax_type.lower()]
    if status and status.lower() != "all":
        records = [r for r in records if r["status"].lower() == status.lower()]
    return records

@tax_matcher_router.get("/record/{match_id}")
def api_get_tax_record(match_id: str, scope: str = Query("2026-08")):
    data = TaxMatcherEngine.run_reconciliation(scope)
    record = next((r for r in data["records"] if r["match_id"] == match_id), None)
    if not record:
        raise HTTPException(status_code=404, detail="Tax match record not found")
    return record

@tax_matcher_router.post("/re-run")
def api_tax_re_run(req: TaxReRunReq):
    data = TaxMatcherEngine.run_reconciliation(req.scope_period, force_refresh=True)
    from backend.db.sqlite_client import record_audit_log
    record_audit_log(
        user="Sarah Jenkins, CPA (Finance Controller)",
        trigger_type="Tax Reconciliation",
        action="Executed 3-Stage Tax-Line Matching Pipeline",
        target=f"{req.scope_period} GST & TDS Returns",
        previous_value="Match Status: Stale",
        new_value=f"Match Rate: {data['summary']['tax_match_rate_pct']}%",
        notes=f"Processed {data['summary']['total_tax_records']} tax lines. Total eligible ITC: ₹{data['summary']['eligible_itc_confirmed']:,.2f}."
    )
    return data

@tax_matcher_router.post("/resolve-exception")
def api_tax_resolve_exception(req: TaxResolveReq):
    try:
        res = TaxMatcherEngine.resolve_exception(req.match_id, req.action, req.note, req.scope_period)
        from backend.db.sqlite_client import record_audit_log
        record_audit_log(
            user="Sarah Jenkins, CPA (Finance Controller)",
            trigger_type="Tax Exception Resolution",
            action=f"Remediated Tax Break {req.match_id}",
            target=req.match_id,
            previous_value="Status: Tax Exception",
            new_value="Status: Reconciled & Certified",
            notes=f"Action: {req.action}. {req.note}"
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

app.include_router(transactions_router)
app.include_router(exceptions_router)
app.include_router(analytics_router)
app.include_router(chat_router)
app.include_router(accounts_router)
app.include_router(system_router)
app.include_router(audit_router)
app.include_router(month_end_router)
app.include_router(reconciliation_router)
app.include_router(document_assistant_router)
app.include_router(tax_matcher_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
