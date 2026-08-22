# Workflow & User Journey Document: Finora

*This document ties all prior specifications into an end-to-end narrative. It serves as both the architectural flow definition and the backbone for the final demo video script.*

## 1. End-to-End System Workflow
The core loop of the system follows this strict sequence:
1. **Data Generation**: `generate_data.py` creates the synthetic CSVs and the isolated `ground_truth.json` file. *(Ref: DATA_SPEC)*
2. **Ingestion**: The CSVs are uploaded and parsed into `settlements`, `bank_transactions`, and `ledger_entries` Firestore collections. *(Ref: DATABASE_SCHEMA)*
3. **Matching Engine Run**: The backend executes the deterministic 4-stage matching algorithm. *(Ref: TRD §2)*
4. **Summary Persistence**: A `batch_runs` document is written containing the final aggregated metrics (rates, processing time).
5. **Dashboard Read**: The frontend fetches the `batch_runs` summary and renders the top cards and charts immediately. *(Ref: UI_UX §1)*
6. **User AI Interaction**: The user asks a natural-language question in the Q&A panel.
7. **AI Tool-Calling Loop**: Gemma 3 4B formulates a tool call (e.g., `get_variance_breakdown`). The backend executes the DB query and returns the exact data slice. *(Ref: AI_ARCHITECTURE §4)*
8. **Verifier Check**: The AI produces a draft answer. The Verifier extracts all numeric tokens and confirms they exist in the returned tool data. *(Ref: AI_ARCHITECTURE §5)*
9. **Response Delivery**: The verified answer (and optional `ui_action` payload) is returned to the frontend.
10. **Frontend Rendering**: The text answer is displayed with an "evidence" indicator, and the UI executes any navigation or highlighting payload seamlessly. *(Ref: UI_UX §3)*

## 2. The User's First-Run Journey (Video Shot List)
This is the intended screen-by-screen flow for a new user, doubling as our demo sequence:
- **Shot 1 (Onboarding)**: The "explain-what-we-need" landing screen. The user connects a Razorpay test-mode key and uploads the bank and ledger CSVs. A confirmation screen shows the received row counts.
- **Shot 2 (Execution)**: The user clicks "Run Reconciliation." A non-blocking loading state shows the engine progressing through the 4 stages.
- **Shot 3 (Dashboard)**: The main dashboard loads instantly from the `batch_runs` document. The user sees the top summary cards and the stacked-bar match breakdown.
- **Shot 4 (Exception Drill-Down)**: The user opens the always-visible Exceptions Table and expands a single row inline. They see the deterministic reason, the grounded AI summary, and the raw side-by-side records.
- **Shot 5 (AI Navigation)**: In the persistent Q&A input, the user types: *"Show me the exceptions from last Tuesday."* The AI answers, and the UI seamlessly routes to the Exceptions screen, filtered to that date, with a transient banner explaining the jump.
- **Shot 6 (Forecast View)**: The user navigates to the Cash Position tab to view the settlement trend line and the clearly-labeled T+N deterministic forecast.

## 3. The Evaluation Workflow
This workflow is entirely separate from the user-facing product, existing solely to prove the technical bar of the submission.
- **Matching Eval (`eval_matching.py`)**: Runs the engine's output against `DATA_SPEC`'s `ground_truth.json`. It outputs true precision, recall, and F1 scores, along with a confusion matrix for the exceptions.
- **Q&A Eval (`eval_qa.py`)**: Runs a fixed set of 20 test questions (defined in `test_questions.json`). It grades factual correctness and strictly reports:
  - How many were fully grounded on the first try.
  - How many were caught and corrected by the Verifier.
  - How many genuinely failed (fallback triggered).
- **Hard Requirement**: Both of these evaluation results **MUST** be written into the project `README.md` as a results table. This is not optional.

## 4. The "Why Was I Paid Less?" Flow in Full Detail
This is the single most important demo moment, proving the deterministic-AI boundary.
1. **Trigger**: User asks *"Why was I paid less than my total order volume this week?"* in the Ask Your Books canvas.
2. **Tool Call**: The model invokes `get_variance_breakdown(date_range)`.
3. **Execution**: The backend deterministically calculates the components (total gross, gateway fees, tax/GST, refunds, and any unresolved staging amount).
4. **Verification**: The model drafts an answer (e.g., *"You were paid ₹1200 less due to ₹800 in fees and ₹400 in refunds."*). The Verifier confirms that `1200`, `800`, and `400` exactly match the numeric components returned by the tool.
5. **Rendering**: The text answer is rendered alongside a small, programmatic breakdown chart.
6. **Interaction**: Every numeric component in the UI or text is clickable, expanding the "evidence: N records" drawer to show the exact source rows.
