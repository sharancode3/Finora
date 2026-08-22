# AI Architecture Document: Finora

## 1. Why Not Classic RAG
Classic Retrieval-Augmented Generation (RAG) is designed for unstructured document retrieval (e.g., chunks of text, vector similarity search). Our data is inherently structured: it consists of rows with specific fields such as amounts, dates, UTRs, and IDs. Vector-searching over structured financial rows is a category mismatch. It introduces approximate semantic matching into a domain that demands exact field-level lookups and strict arithmetic precision. RAG was actively considered and explicitly rejected because financial reconciliation requires deterministic retrieval, not semantic proximity.

## 2. Why Tool-Calling / Function-Calling is the Correct Pattern Here
The correct architectural pattern for this project is tool-calling (function-calling). We provide the Gemma 3 4B model with a fixed set of callable functions, each defined by a strict JSON-schema signature. 

When a user asks a question, the model's first job is *not* to answer immediately. Instead, its job is to decide which function(s) to call and with what exact arguments. The backend then executes the requested function (which is a normal, deterministic database query) and returns a small, exact result set. Only then does the model produce a natural-language answer, generated strictly from that returned data.

This pattern achieves two critical goals:
1. **Bounded Context**: It bounds the context size regardless of the total dataset size (10 relevant records are returned whether the DB has 150 rows or 150,000 rows).
2. **Traceability**: It makes every single answer traceable to an exact query result.

## 3. The Full Tool List

- **`get_settlement_summary(start_date, end_date, business_id?)`**
  - *Purpose*: Retrieves high-level match rates, total records, and exception counts.
  - *Input*: Dates and optional business ID.
  - *Output*: JSON summary of aggregated metrics.
  - *Constraint*: Must never estimate or calculate metrics itself; it only returns the pre-computed summary.

- **`get_record_detail(record_id)`**
  - *Purpose*: Fetches the full trace (match evidence, exception reason, raw row data) for a specific match or exception.
  - *Input*: The exact string ID of the record.
  - *Output*: JSON containing the record's fields and match confidence/reason.
  - *Constraint*: Must never infer details that are not present in the returned document.

- **`get_exceptions(reason_filter?, date_range?)`**
  - *Purpose*: Lists exceptions, optionally filtered by a specific classification (e.g., `amount_mismatch_only`).
  - *Input*: Optional string filter and date range.
  - *Output*: JSON array of exception records.
  - *Constraint*: Must never invent exception categories.

- **`get_variance_breakdown(date_range)`**
  - *Purpose*: Returns the components of an expected-vs-actual gap (e.g., refunds, fees, tax, unresolved amount).
  - *Input*: Date range.
  - *Output*: JSON breakdown of financial components.
  - *Constraint*: MUST NEVER estimate a number that isn't already computed and stored. It only retrieves and formats deterministic calculations.

- **`get_cash_forecast(days_ahead)`**
  - *Purpose*: Retrieves the deterministically computed forward cash forecast.
  - *Input*: Integer days ahead (max 30).
  - *Output*: JSON array of projected dates and amounts.
  - *Constraint*: The model must not generate the forecast logic; it only narrates the result returned by this tool.

- **`navigate_to(screen, filters)`**
  - *Purpose*: A UI action tool (not a data tool) that routes the user to a specific application screen with predefined filters applied.
  - *Input*: A string `screen` name from an allowed list, and a `filters` JSON object.
  - *Output*: Confirmation of the UI action payload.
  - *Constraint*: Must only reference real screens known to the frontend.

- **`highlight_record(record_id)`**
  - *Purpose*: A UI action tool that triggers the frontend to focus/highlight a specific row in the current view.
  - *Input*: The exact string ID of the record.
  - *Output*: Confirmation of the UI action payload.
  - *Constraint*: Must only reference a real record ID.

## 4. The Orchestration Loop
The execution loop follows a strict sequence:
1. **User Question**: The user submits a natural-language query.
2. **Tool Proposal**: The model proposes a tool call (or multiple, sequentially, if one result implies it needs another).
3. **Execution**: The backend executes the tool and returns structured data.
4. **Draft Answer**: The model produces a draft answer based solely on the returned data.
5. **Verification**: The draft answer passes to the Verifier (see Section 5).
6. **Resolution**:
   - *Pass*: The answer is shown to the user, accompanied by a "traced to N records" evidence note.
   - *Fail 1*: The system rejects the draft and regenerates it once, appending a stricter prompt instructing the model to only state numbers present in the tool results.
   - *Fail 2*: If it fails the verifier a second time, the system returns a templated response: *"I don't have enough information to answer that precisely"*. An unverified number is NEVER shown.

## 5. The Verifier
The Verifier is a deterministic, rule-based Python module (not a second LLM call). It is cheaper, faster, and fully deterministic—essential for a component whose sole job is to enforce trust.

**Logic Flow:**
1. **Extraction**: Extract every numeric/currency token from the model's draft answer using regex (matching `₹` patterns, bare numbers, percentages).
2. **Validation**: For each extracted number, check whether it appears (exactly, or as a simple, clearly labeled sum/difference of numbers that do appear) in the structured tool-call result(s) fed to the model for this turn.
3. **Pass Condition**: If every extracted number traces back perfectly to the tool data, the answer passes. The source record IDs are attached as an "evidence" list alongside the answer.
4. **Fail Condition**: If *any* number does not trace back, the draft fails.
5. **Persistence**: The failed attempt (draft answer + the tool data it should have used) is logged to a `verifier_rejections` collection in Firestore. This is a real, persisted log that serves as concrete evidence of the technical obstacle being handled.
6. **Fallback**: Regenerate once with a corrective prompt. Fallback to the templated "insufficient information" response on a second failure.

## 6. Grounding Guarantee for the Exception Summarizer
The exception summarizer strictly follows the grounding rule. It produces exactly one sentence per exception, built *only* from that exception's own stored fields (amounts, dates, classification reason). It is explicitly forbidden from using speculative language like "probably" or "likely," unless a probability/confidence field actually exists on that specific record.

## 7. Why Not Fine-Tuning
Fine-tuning the Gemma model was considered and rejected. Fine-tuning is appropriate for teaching a model stable, repetitive output formatting on data it will see repeatedly. It is *not* designed for injecting frequently-changing factual data (such as a specific batch's daily settlement numbers). The tool-calling pattern is specifically designed to inject dynamic, factual context at runtime. While fine-tuning could theoretically enforce exact JSON formatting for tool calls, the added complexity and resource overhead are not worth it for this build, as Gemma 3 4B supports native tool-calling well enough.

## 8. The Navigation Tools Are Held to the Same Grounding Standard
The UI action tools (`navigate_to` and `highlight_record`) are not exempt from grounding. 
- They must only ever be called with a `screen` name from a fixed, allowed list known to the frontend.
- The `record_id` must be a real record ID (validated against Firestore before being returned to the frontend).
- The `filters` must match a shape the frontend already knows how to render. 
The model is strictly prohibited from navigating to an arbitrary or invented location.

## 9. Failure Mode Table

| Failure Mode | How This Architecture Prevents or Catches It |
| :--- | :--- |
| **Model invents a settlement amount** | The Verifier extracts the invented number, finds it missing from the tool-call JSON, fails the draft, logs the rejection to Firestore, and forces a regeneration or fallback. |
| **Model answers from outdated/stale data** | Model has no internal data. It must use the `get_*` tools, which run live queries against Firestore, guaranteeing fresh data. |
| **Model calls a tool with a malformed argument** | Pydantic validation on the backend API catches the malformed JSON schema immediately, returning a clear error back to the model for self-correction. |
| **Model tries to navigate to a non-existent screen** | The `navigate_to` tool validates the requested screen against a strict Enum/allowed list. Invalid screens are rejected before the UI action payload is ever sent to the frontend. |
| **Model over-confidently states an exception's cause without evidence** | The Exception Summarizer is prompted to only use the explicit `reason` string returned by the tool. If it fabricates a reason containing a number, the Verifier catches it. If it fabricates text, prompt engineering strictness limits it to a single grounded sentence. |
