# Database Schema Document: Finora (Firebase / Firestore)

## 1. Firestore Collection Structure
The database relies on flat, top-level collections linked by ID references (no deeply nested subcollections) to optimize for the scale and access patterns of this reconciliation loop.

### `settlements`
Raw `settlement_report` rows, as ingested.
- **ID**: `{payment_id}`
- **Fields**:
  - `payment_id` (String): e.g., "pay_xxxxxxxxxxx"
  - `order_id` (String): e.g., "order_xxxxxxxxxxx"
  - `gross_amount` (Number)
  - `razorpay_fee` (Number)
  - `gst_on_fee` (Number)
  - `tds` (Number)
  - `settled_amount` (Number)
  - `utr` (String)
  - `settlement_date` (Timestamp)
  - `payment_date` (Timestamp)
  - `method` (String)
  - `status` (String)

### `bank_transactions`
Raw `bank_statement` rows, as ingested.
- **ID**: `{auto_id}`
- **Fields**:
  - `transaction_date` (Timestamp)
  - `description` (String)
  - `credit_amount` (Number)
  - `reference_number` (String)
  - `value_date` (Timestamp)

### `ledger_entries`
Raw `internal_ledger` rows, as ingested.
- **ID**: `{order_id}`
- **Fields**:
  - `order_id` (String)
  - `customer_name` (String)
  - `amount_charged` (Number)
  - `order_date` (Timestamp)
  - `order_status` (String)

### `matches`
One document per successfully resolved match.
- **ID**: `{auto_id}`
- **Fields**:
  - `settlement_id` (String): Reference to `settlements/{payment_id}`.
  - `bank_transaction_id` (String | Null): Reference to `bank_transactions/{auto_id}`. (Nullable for batched matches).
  - `batch_members` (Array of Strings): Array of `settlement_id`s, used *only* for batched matches.
  - `method` (String): `"exact"`, `"batched"`, or `"fuzzy"`.
  - `confidence` (Number): Float between 0.0 and 1.0.
  - `trust_state` (String): `"VERIFIED"` or `"PROBABLE"`.
  - `created_at` (Timestamp)

### `exceptions`
One document per unresolved item from the matching engine.
- **ID**: `{auto_id}`
- **Fields**:
  - `related_settlement_id` (String | Null)
  - `related_bank_transaction_id` (String | Null)
  - `reason` (String): Enum matching Stage 4 classifications (e.g., `"amount_mismatch_only"`, `"no_bank_credit_found"`, `"no_settlement_found"`, `"possible_duplicate"`, `"no_settlement_for_order"`).
  - `amount` (Number)
  - `ai_summary` (String | Null): Nullable until the exception summarizer has run.
  - `trust_state` (String): `"EXCEPTION"`
  - `created_at` (Timestamp)

### `batch_runs`
One document per full reconciliation execution. This powers the dashboard top summary cards directly, preventing on-the-fly aggregation queries.
- **ID**: `{auto_id}`
- **Fields**:
  - `timestamp` (Timestamp)
  - `total_records` (Number)
  - `exact_count` (Number)
  - `batched_count` (Number)
  - `fuzzy_count` (Number)
  - `exception_count` (Number)
  - `overall_match_rate` (Number)
  - `processing_time_ms` (Number)

### `verifier_rejections`
Logs failed AI answers per the AI Architecture rules. This is a primary project artifact demonstrating the technical obstacle of hallucination prevention.
- **ID**: `{auto_id}`
- **Fields**:
  - `question` (String)
  - `draft_answer` (String)
  - `tool_data_provided` (Map/JSON)
  - `failure_reason` (String)
  - `timestamp` (Timestamp)

### `chat_history`
Record of interactions with the AI controller.
- **ID**: `{auto_id}`
- **Fields**:
  - `question` (String)
  - `tool_calls_made` (Array of Maps)
  - `final_answer` (String)
  - `evidence_record_ids` (Array of Strings)
  - `verifier_passed` (Boolean)
  - `ui_action` (Map | Null): E.g., `{ "screen": "...", "filters": {...} }` or `{ "record_id": "..." }`.
  - `timestamp` (Timestamp)

### `forecasts`
Generated cash-position projections.
- **ID**: `{auto_id}`
- **Fields**:
  - `date_range` (Map): e.g., `{ "start": Timestamp, "end": Timestamp }`
  - `method_used` (String)
  - `projected_inflow` (Number)
  - `based_on_records` (Array of Strings)
  - `generated_at` (Timestamp)

## 2. Indexing Notes
Given the query patterns required by the AI's tool functions, the following Firestore composite indexes are necessary. (These must be configured in `firestore.indexes.json` so they deploy properly).
- **Exceptions Collection**: `reason` (ASC) + `created_at` (DESC) - *Used by `get_exceptions(reason_filter, date_range)`*
- **Matches Collection**: `method` (ASC) + `created_at` (DESC) - *Used for getting variance breakdown or summary stats filtered by specific methods*
- **Settlements Collection**: `settlement_date` (ASC) + `status` (ASC) - *Used by `get_settlement_summary(start_date, end_date)`*

## 3. Data Access Layer Rule
All reads and writes must pass through a single, dedicated data-access module (e.g., `/backend/db/firestore_client.py`), which exposes one function per query pattern. 
There must be **no raw Firestore calls scattered across route handlers or AI tool implementations**. Both the REST API endpoints and the AI's tool functions must call into this shared module. This guarantees that the UI and the AI always see the exact same version of "the truth."

## 4. Security Rules
Because this is a finance-adjacent application (even utilizing synthetic data), we operate under strict security constraints. 
**Firestore Security Rules:** 
- `allow read, write: if false;` globally for all web/mobile client SDKs.
- No collection is publicly readable or writable.
- All database access occurs exclusively through the authenticated FastAPI backend service using the Firebase Admin SDK. 
*Do not default to permissive rules (like `if true;`) for build-speed convenience.*
