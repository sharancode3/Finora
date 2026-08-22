# Technical Requirements Document (TRD): Finora

## 1. System Architecture Diagram

```ascii
                                +-------------------+
                                |  Data Generator   |
                                | (Synthetic Data)  |
                                +---------+---------+
                                          |
        +-------------------------+-------+-------+-------------------------+
        |                         |               |                         |
+-------v-------+         +-------v-------+ +-----v-------+         +-------v-------+
| Settlement.csv|         |   Bank.csv    | |  Ledger.csv |         | GroundTruth.csv|
+-------+-------+         +-------+-------+ +-----+-------+         +-------+-------+
        |                         |               |                         |
        +-------------------------+---------------+                         |
                                  |                                         |
                       +----------v-----------+                             |
                       |   Matching Engine    | <--- (Eval Harness compares)|
                       | (Deterministic logic)|                             |
                       +----------+-----------+                             |
                                  |                                         |
                       +----------v-----------+                             |
                       |      Firestore       |                             |
                       |  (matched_records,   |                             |
                       |    exceptions)       |                             |
                       +----------+-----------+                             |
                                  |                                         |
                       +----------v-----------+                             |
                       |   FastAPI API Layer  |                             |
                       | (Data-access module) |                             |
                       +----------+-----------+                             |
                                  ^                                         |
                                  |                                         |
                 +----------------+----------------+                        |
                 |                                 |                        |
        +--------v--------+               +--------v--------+               |
        |  React Frontend | <---(nav)---- |    Verifier     |               |
        |   (UI/Charts)   |               | (Checks numbers)|               |
        +--------^--------+               +--------^--------+               |
                 |                                 |                        |
                 |                        +--------v--------+               |
                 +------------------------| AI Controller   |               |
                                          | (Gemma 3 4B via |               |
                                          |    Ollama)      |               |
                                          | (Tool calls to  |               |
                                          |   API Layer)    |               |
                                          +-----------------+
```

## 2. The Matching Engine
The engine processes reconciliation in four deterministic stages, in exact order.

### Stage 1: Exact Match
- **Logic**: Join Settlement records to Bank records on an exact string match of the UTR (Unique Transaction Reference).
- **Confidence**: `1.0`
- **Method Tag**: `"exact"`

### Stage 2: Batched Match
- **Logic**: For remaining unmatched bank credits, test whether a single bank credit amount equals the sum of 2–4 remaining, unmatched settlement records dated the same day (or within a 1-day window). This is effectively a small subset-sum search over a tightly bounded candidate set (capped at a small N to remain fast), not a generic combinatorial search over the entire dataset.
- **Confidence**: `0.9`
- **Method Tag**: `"batched"`

### Stage 3: Fuzzy Match
- **Logic**: For remaining records, compute a weighted confidence score.
  - *Amount match* (within ₹1 tolerance): 30% weight.
  - *Date proximity* (within 3 days, linearly decayed): 20% weight.
  - *UTR partial similarity* (via `rapidfuzz.partial_ratio`): 40% weight.
  - *Order-reference similarity*: 10% weight.
- **Threshold**: Accept if combined score > `0.6`. Otherwise, it falls through to exceptions.
- **Method Tag**: `"fuzzy"`
- **Explicit Rule**: This formula, once fixed, is what the UI displays as "confidence." The AI never invents or restates this number differently.

### Stage 4: Exception Classification
Whatever remains unmatched is classified into one of the following exception types:
- `no_bank_credit_found`: Settlement exists, no matching bank credit.
- `no_settlement_found`: Bank credit exists, no matching settlement.
- `possible_duplicate`: Exact amount and close date, but UTR is already mapped.
- `amount_mismatch_only`: Exact UTR match, but the amount differs by more than ₹1.

### Third Join (Ledger Exceptions)
- **Logic**: Join matched settlements to the `internal_ledger` on `order_id`.
- **Exception**: Surface ledger entries with no corresponding settlement at all.
- **Type**: `no_settlement_for_order`.

## 3. Trust-State Model
Every match or exception is assigned exactly one trust state. This is a *stored field* in the database, not a UI-only label.
- **VERIFIED**: Applied to Stage 1 (exact) or Stage 2 (batched) matches.
- **PROBABLE**: Applied to Stage 3 (fuzzy) matches above the threshold (confidence score explicitly stored and shown).
- **EXCEPTION**: Applied to matches below the threshold or caught in Stage 4. Never auto-resolved, always explained.

## 4. AI Controller Architecture
*Note: Refer to AI Architecture doc (Phase 3) for full detail.*
The AI layer interacts with the backend strictly through a defined tool-calling contract.
**Exposed Tools (API Contract):**
```python
from pydantic import BaseModel, Field

class GetMatchSummary(BaseModel):
    # Returns total records, match rate, exception counts
    pass 

class ListExceptions(BaseModel):
    type_filter: str | None = Field(description="Filter by exception type e.g. amount_mismatch_only")

class GetRecordEvidence(BaseModel):
    record_id: str = Field(description="The internal ID of the match or exception to fetch full trace for")

class GetCashPosition(BaseModel):
    days_forward: int = Field(description="Number of days to forecast, max 30")
```
*The verifier module sits between the raw LLM output and the frontend response, ensuring numbers in the text strictly match the raw tool output.*

## 5. API Layer (FastAPI)
List of minimum endpoints:
- `POST /api/v1/reconcile`: Run reconciliation batch. Request: list of DataSources. Response: Batch run ID.
- `GET /api/v1/stats`: Get summary stats (match rate, precision/recall vs ground truth).
- `GET /api/v1/exceptions`: List exceptions (supports filters).
- `GET /api/v1/records/{id}`: Get single record detail with full evidence trail.
- `POST /api/v1/chat`: Ask/chat endpoint. Request: `{ query: str }`. Response: `{ answer: str, ui_action: Optional[dict] }`.
- `GET /api/v1/forecast`: Get deterministic cash-position forecast.
- `GET /api/v1/connectors`: List data sources.
- `POST /api/v1/connectors/upload`: Upload CSV.
- `POST /api/v1/connectors/razorpay`: Connect test key.

## 6. Database (Firestore)
*Note: Refer to Database Schema doc (Phase 4) for schema details.*
Firestore is accessed *only* through a thin data-access module (`db_client.py`). There are no scattered raw Firestore calls throughout the codebase. The AI's tools and the REST API share this single source of truth for queries, guaranteeing consistency.

## 7. Connector Abstraction
The `DataSource` interface defines standard data fetching:
```python
class DataSource(ABC):
    @abstractmethod
    def fetch_settlements(self) -> List[dict]: pass
    @abstractmethod
    def fetch_bank_statement(self) -> List[dict]: pass
```
**Implementations:**
- `RazorpayTestModeConnector`: Real implementation.
- `CSVUploadConnector`: Real implementation.
- `UPIConnector`: Stubbed. Raises `NotImplementedError("Requires Account Aggregator integration")`.
- `BankAAConnector`: Stubbed. Raises `NotImplementedError("Requires Account Aggregator integration")`.
*(No silent faking of live bank data).*

## 8. Navigation Tool Bridge
The AI can issue `navigate_to(screen, filters)` and `highlight_record(id)` tool calls.
- **Bridge Logic**: The `POST /api/v1/chat` endpoint returns the grounded text answer and a structured `ui_action` field.
- **Client Execution**: The React frontend reads `ui_action` and performs the navigation/highlight client-side.
- **Constraint**: Navigation actions are NOT free-form. They must reference a real screen (e.g., `"exceptions_list"`) and either a real record ID or a valid filter schema, grounded exactly like data tool calls.

## 9. Build Phases / Sequencing
- **Phase A**: Data generation + ground truth.
- **Phase B**: Matching engine + eval harness against ground truth.
- **Phase C**: Firestore integration + API layer (non-AI endpoints working end to end first).
- **Phase D**: AI tool-calling controller + verifier.
- **Phase E**: Navigation bridge + "Ask Your Books" visual canvas.
- **Phase F**: Cash-position forecast module.
- **Phase G**: Frontend build against the now-stable API.
- **Phase H**: Full eval run (matching eval + 20-question Q&A eval), polish, README, video prep.

*Explicit Rule: Do not begin a phase until the previous one's stated verification step passes.*
