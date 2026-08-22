from pydantic import BaseModel, ConfigDict
from enum import Enum
from typing import List, Optional, Any, Dict
from datetime import date, datetime
from decimal import Decimal

# --- Enums ---
class MatchMethod(str, Enum):
    exact = "exact"
    batched = "batched"
    fuzzy = "fuzzy"

class TrustState(str, Enum):
    verified = "VERIFIED"
    probable = "PROBABLE"
    exception = "EXCEPTION"
    unresolved = "UNRESOLVED"

class ExceptionReason(str, Enum):
    no_bank_credit_found = "no_bank_credit_found"
    amount_mismatch_only = "amount_mismatch_only"
    possible_duplicate = "possible_duplicate"
    refund_reversal = "refund_reversal"
    fee_variance = "fee_variance"
    no_settlement_found = "no_settlement_found"
    no_settlement_for_order = "no_settlement_for_order"
    none_or_not_exception = "none_or_not_exception" # for initial parsing or default

class Severity(str, Enum):
    critical = "CRITICAL"
    high = "HIGH"
    medium = "MEDIUM"
    low = "LOW"

# --- Models ---
class Business(BaseModel):
    id: str
    name: str

class Settlement(BaseModel):
    id: str  # payment_id
    order_id: str
    business_id: str
    gross_amount: Decimal
    fee_amount: Decimal
    tax_amount: Decimal
    settled_amount: Decimal
    payment_date: date
    settlement_date: date
    utr: str
    status: str
    normalized_utr: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class BankTransaction(BaseModel):
    id: str
    bank_account_id: str
    transaction_date: date
    description: str
    reference_number: str
    credit_amount: Decimal
    debit_amount: Decimal
    balance: Decimal
    normalized_reference: Optional[str] = None

class LedgerEntry(BaseModel):
    id: str # order_id
    business_id: str
    order_amount: Decimal
    order_date: date
    status: str

class Match(BaseModel):
    id: str
    batch_id: str
    settlement_id: str
    bank_transaction_id: str
    ledger_entry_id: str
    method: MatchMethod
    confidence: float
    trust_state: TrustState
    batch_members: List[str] = []
    created_at: datetime
    
class ExceptionModel(BaseModel):
    id: str
    batch_id: str
    related_settlement_id: Optional[str] = None
    related_bank_transaction_id: Optional[str] = None
    related_ledger_entry_id: Optional[str] = None
    reason: ExceptionReason
    amount: Decimal
    ai_summary: Optional[str] = None
    trust_state: TrustState
    severity: Severity
    recommended_action: str
    created_at: datetime

class BatchRun(BaseModel):
    id: str
    timestamp: datetime
    total_records: int
    exact_count: int
    batched_count: int
    fuzzy_count: int
    exception_count: int
    overall_match_rate: float
    value_reconciliation_rate: float
    processing_time_ms: int
    trust_state_breakdown: Dict[str, int]

class ChatHistory(BaseModel):
    id: str
    session_id: str
    question: str
    answer: str
    evidence_ids: List[str]
    verifier_passed: bool
    created_at: datetime

class VerifierRejection(BaseModel):
    id: str
    chat_id: str
    reason: str
    timestamp: datetime

class Forecast(BaseModel):
    id: str
    generated_at: datetime
    days_ahead: int
    expected_inflows: Decimal
    expected_outflows: Decimal
    projected_balance: Decimal
