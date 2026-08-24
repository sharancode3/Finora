from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class TaxLineItem(BaseModel):
    tax_line_id: str
    related_tx_id: Optional[str] = None
    tax_type: str = "GST"  # "GST" or "TDS"
    counterparty_name: str
    counterparty_identifier: str  # GSTIN (e.g. 27AABCU9603R1ZM) or TAN (e.g. MUMB12345C)
    invoice_ref: str
    invoice_date: str
    taxable_value: float
    tax_rate: float
    tax_amount: float
    tds_section: Optional[str] = None  # "194C", "194J", "194H", "194Q"
    gstr_2b_filing_status: str = "filed"  # "filed", "unfiled_by_counterparty", "pending_sync"
    tax_filing_period: str = "2026-08"
    source_portal: str = "GSTR-2B (GSTN Auto-Drafted)"
    notes: Optional[str] = None

class TaxMatchRecord(BaseModel):
    match_id: str
    tax_line_id: str
    related_tx_id: Optional[str] = None
    tax_type: str
    counterparty_name: str
    counterparty_identifier: str
    invoice_ref: str
    invoice_date: str
    tds_section: Optional[str] = None
    
    # Internal Ledger vs Portal Amounts
    ledger_taxable_value: float
    ledger_tax_amount: float
    portal_taxable_value: float
    portal_tax_amount: float
    
    # Variances
    taxable_variance: float
    tax_variance: float
    
    # Matching Status & Confidence
    status: str  # "matched", "rate_mismatch", "amount_discrepancy", "missing_gstr2b", "tds_section_misclassification", "unmatched_portal_entry"
    match_stage: str
    confidence_score: float
    
    # AI Grounded Explanation & Remediation
    ai_explanation: str
    impact_on_itc: str  # "eligible_itc", "blocked_itc_unfiled", "demand_risk_rate_diff", "withholding_penalty_risk", "neutral"
    suggested_remedy: str
    resolved: bool = False
    resolution_notes: Optional[str] = None

class TaxMatcherSummary(BaseModel):
    total_tax_records: int
    matched_records: int
    exception_records: int
    tax_match_rate_pct: float
    value_match_rate_pct: float
    
    # ITC Metrics
    total_itc_claimed: float
    eligible_itc_confirmed: float
    blocked_itc_at_risk: float
    
    # Variances
    total_tax_variance: float
    tds_compliance_rate_pct: float
    
    # Categorical Counts
    exceptions_by_type: Dict[str, int]
    scope_period: str = "2026-08"
    last_reconciliation_time: str
