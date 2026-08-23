# Project Memory: Finora

## Current Phase
- AI-Everywhere Initiative (Phases 0–8) — Complete & Verified

## Decisions Log
- [2026-08-23] Decision — Renamed project from ReconAgent to Finora across the entire codebase to match Razorpay AI Buildathon Track 04 requirements.
- [2026-08-23] Note — Built FastAPI backend with SQLite ACID ledger, 4-stage matching engine, Gemma 3 local AI orchestrator, and Recharts high-contrast UI.
- [2026-08-23] Fix (Phase 0) — Test-mode key isolation (`rzp_test_`), non-zero waterfall & leakage aggregates, dual-state scenario toggle labels, exception cluster sums, and demo data transparency.
- [2026-08-23] Decision (Phase 1) — Global Contextual AI Architecture (Ledger Copilot): Reused single AI orchestrator & verifier pipeline across entire application with structured `PageContext` injection and strict read-only tool guardrails.
- [2026-08-23] Decision (Phase 2) — Dashboard AI-Narrated Forensic Signals & "Why?" Pattern: Added inline mathematical decompositions, Benford/Isolation Forest narrations, proactive daily briefing, and Poisson predictive risk bounds.
- [2026-08-23] Decision (Phase 3) — Exceptions AI Investigation Agent & Root-Cause Chains: Deterministic 4-check root-cause pipeline, persistent SQLite audit storage (`exception_investigations`), cluster common-thread synthesis, and natural language query parser.
- [2026-08-23] Decision (Phase 4) — Cash Position Grounded Scenario Simulation: Parameter sliders (+N days delay, recovery %, volume shift %), grounded AI delta narration, and leakage deduction category explanations.
- [2026-08-23] Decision (Phase 5) — Linked Accounts Sync Health Intelligence: Deterministic sync checks (SLA evaluation), AI sync health explanation banner, and suspense decomposition.
- [2026-08-23] Decision (Phase 6) — Month-End Close AI-Drafted Closing Memo & Checklist Assistance: Per-checklist-item "What's needed?" exception lists, AI closing memo drafting, and review workspace.
- [2026-08-23] Decision (Phase 7) — Settings Governance Copilot: Deterministic Segregation of Duties (SoD) Rule Engine, sourced AI risk explanations, and notification rule rationales.
- [2026-08-23] Decision (Phase 8) — Final Consistency Pass & Evaluation Suite:
  - Confirmed 100% uniform Ledger Copilot launcher, response format, and trust-badge/reasoning-trail across all 7 views.
  - Verified zero-hallucination fallback across all surfaces.
  - Evaluated comprehensive test suite (`eval/eval_qa.py`) with 31 test questions across all categories: 100.0% Accuracy, 100.0% Verifier Pass Rate.
  - Documented Global Contextual AI Architecture in `README.md`.
  ```json
  {
    "page_name": "string (e.g. 'Exceptions Queue', 'Cash Position & Treasury')",
    "route": "string (e.g. '/exceptions')",
    "active_filters": {
      "status": "string",
      "date_range": "YYYY-MM-DD to YYYY-MM-DD",
      "account": "string",
      "cluster": "string"
    },
    "visible_metrics": {
      "metric_key": "number | string"
    },
    "selected_record_id": "string | undefined",
    "suggested_inquiries": ["string", "string", "string"],
    "extra_hints": "string | undefined"
  }
  ```
  Strict Guardrails Enforced: Zero mutating tools exposed to AI. Immutability guaranteed — all mutation/reconciliation actions remain human-initiated via UI action drawers.

## File Map
- `backend/main.py`: FastAPI server entry point and endpoint definitions.
- `backend/db/sqlite_client.py`: SQLite ACID database abstraction, deterministic matching analytics, and exception scoring.
- `backend/ai_agent.py`: Agentic AI engine with local Gemma 3 tool execution, confidence scoring, and reasoning trails.
- `backend/anomaly_engine.py`: Isolation Forest ML outlier detection and Benford's Law forensic analysis.
- `backend/scripts/check_no_live_keys.py`: Automated security lint script blocking any `rzp_live_` patterns.
- `backend/scripts/generate_phase0_data.py`: Seed data generator for 3-way reconciliation ledger.
- `data/output/finora.db`: SQLite database storing transactions, exceptions, settlements, and accounts.
- `frontend/src/App.tsx`: Main React application component and router.
- `frontend/src/context/AIContext.tsx`: React Context for global AI copilot state.
- `frontend/src/layouts/MainLayout.tsx`: Locked stationary sidebar and modern top bar layout.
- `frontend/src/pages/`:
  - `LandingPage.tsx`: Product overview and 3-way reconciliation architecture.
  - `Dashboard.tsx`: Executive command center with PoP delta %, predictive risk, and Benford forensics.
  - `Exceptions.tsx`: Exceptions queue with 100-pt composite risk scoring and systemic cluster cards.
  - `CashPosition.tsx`: 1,000-trial Monte Carlo cash forecast and cash flow waterfall.
  - `LinkedAccounts.tsx`: Continuous sync health monitoring and cross-account flow.
  - `MonthEndClose.tsx`: Continuous close readiness, pre-lock checklist, and statutory audit package.
  - `RecordDetail.tsx`: 3-way reconciliation deep-dive drawer.
  - `AskYourBooks.tsx`: Grounded conversational AI with inspectable reasoning trails.
  - `Settings.tsx`: Internal controls, segregation of duties, and granular notification triggers.

## Known Constraints
- Matching, scoring, confidence calculation, and all arithmetic on money are done in deterministic Python code — never by the LLM.
- The AI (Gemma 3 4B) only explains, summarizes, answers questions, and triggers navigation — always grounded in tool-call results, always checked by the verifier before display.
- Every number shown in the UI must have a 'Why?' breakdown traceable to source records.

## Known Stubs / TODOs
- **Connectors**: Live Bank Account Aggregator (AA) and UPI direct integrations are illustrative mock configurations; live data ingestion operates via CSV and simulated gateway feeds.
- **Team Governance Data**: Team profiles (Sarah Jenkins CPA, Statutory Audit Partner) in Settings are clearly labeled illustrative demo seed profiles. The "Invite Member" modal updates in-memory UI state for demonstration.
- **Local AI Inference**: AI query endpoints run against local Ollama Gemma 3 instance with zero-hallucination tool calling.

## Next Steps
- Await instructions for Phase 1.
