# Project Memory: Finora

## Current Phase
- Cleanup Phase 6 — Final Pass & Pack Completion (All Phases 0–6 Complete & Verified)

## Decisions Log
- [2026-08-23] Decision (Cleanup Phase 6) — Final Consistency Pass & Cleanup Pack Completion:
  1. Multi-Account Consistency Audit: Verified all screens (Dashboard, Exceptions, Cash Position, Linked Accounts, Month-End Close, Settings, About Finora) show the 4 accounts (`Razorpay Gateway`, `Kotak Mahindra Bank`, `HDFC Bank`, `PayPal Wallet`) and confirmed zero leftover legacy ICICI references across the entire frontend and backend.
  2. Strict Color Enforcement: Confirmed single source-of-truth color system (`statusTokens.ts`) holds across all pages with zero arbitrary blue/purple status badges.
  3. Volume Cap Consistency: Total gross volume is verified at ₹288,303.50 (< ₹300,000.00 merchant cap) with single-month August 2026 dates (`2026-08-01` to `2026-08-31`).
  4. QA & Copilot Evaluation: Re-ran `eval/eval_qa.py` with 33 questions covering multi-account flows, forensic checks, SoD rules, and verifier guardrails: **100.0% Accuracy (33/33 Passed)**, **100.0% Verifier Pass Rate**.
  5. Documentation & README: Updated `README.md` data section to accurately detail the 4-account structure, volume scope, and multi-rail reconciliation pipeline.
- [2026-08-23] Decision (Cleanup Phase 5) — Personal Finance Roadmap Note (No Build):
  1. Added an explicit, clearly-labeled "What's Next & Future Roadmap" section to `AboutFinora.tsx` and the Settings About tab stating: *"The same account-linking and grounded-AI-explanation architecture built for business reconciliation is designed to extend naturally to a personal-finance view for individual users — spend tracking, EMI monitoring, and savings goals — as a future direction, while keeping the current submission strictly focused on business finance operations."*
  2. Scope guardrail strictly honored: Zero personal finance UI, routes, or data models were created.
- [2026-08-23] Decision (Cleanup Phase 3) — Color System Consolidation & Statistical Sample Guardrails:
  1. Single Source-of-Truth Color Mapping (`frontend/src/theme/statusTokens.ts`):
     - Green (`emerald`): Verified / Healthy / Pass / Settled / Reconciled.
     - Amber (`amber`): Probable / Pending / Review Required / Stale / Warning / Medium-Low Severity.
     - Red (`rose`): Exception / Critical / Failed / High Risk / Unresolved / Open.
     - Indigo (`indigo`): Reserved EXCLUSIVELY for AI-generated content, AI Copilot, Sparkles, and AI reasoning trails.
     - Slate (`slate`): Neutral chrome, borders, metadata, transaction IDs.
     - Blue: Strictly prohibited as a status color across the entire application.
  2. Screen-by-Screen Color Audit & Remediation:
     - `Dashboard.tsx`: Replaced decorative purple "Isolation Forest" tag with dynamic status badges (`Sample < 20` amber, `N Flagged` red, `Clean Signal` green). Replaced arbitrary origin breakdown dots with neutral slate.
     - `Exceptions.tsx`: Consolidated risk tier badges (Critical/High = Red, Medium = Amber, Low = Neutral Slate). Replaced purple escalation submit button with Amber.
     - `RecordDetail.tsx`: Replaced purple Escalated status badge and button with Amber.
     - `CashPosition.tsx`: Replaced blue anomaly alert banner with Emerald (for upward surge) or Amber (for downward drop).
     - `LinkedAccounts.tsx`: Replaced purple and blue icon containers and route highlights with neutral slate and standardized status tokens.
     - `TrustBadge.tsx` and `SeverityBadge.tsx`: Fully rewritten to use centralized `statusTokens.ts`.
  3. Honest Forensic Sample Size Explanations:
     - When filtered transactions count is $< 30$ (for Benford's Law) or $< 20$ (for Isolation Forest), the widgets explicitly explain: *"Fewer than [N] transactions in this view (found [X]) — statistical checks need a larger sample to be meaningful."* instead of a bare "0" or "Insufficient Data".
  4. Documentation: Updated `docs/UI_UX.md` and root `UI_UX.md` with the locked color system specification.
- [2026-08-23] Decision (Cleanup Phase 2) — Per-Account Money Flow Visibility & Upstream Attribution:
  1. Linked Accounts Per-Account Breakdown:
     - Each connected account displays exact monthly volume and net settled amounts computed live from SQLite `source_account` and `bank_reference` tags.
     - Kotak Mahindra Bank card displays exact upstream breakdown: Total ₹192,913.68 received (₹148,707.92 / 77.1% from Razorpay Gateway settlements across 30 transactions, ₹44,205.76 / 22.9% from PayPal batch payout transfers across 12 transactions).
     - HDFC Bank card displays exact upstream breakdown: Total ₹56,957.51 received (₹51,457.51 / 90.3% from Razorpay Gateway settlements across 12 transactions, ₹5,500.00 / 9.7% from Direct Inward NEFT Credit).
     - Razorpay Gateway & PayPal Wallet cards show downstream destination distribution percentages and transaction counts.
  2. Dashboard Dynamic Multi-Source Origin Breakdown:
     - Replaced single origin line with dynamic live calculation across filtered transactions: `Razorpay Gateway (Business): 84.0% (₹246,103.50) · PayPal — International Wallet: 16.0% (₹47,000.00)`, updating dynamically on filter changes.
  3. Interactive "Money Movement & Route Settlement" Visual:
     - Built an interactive flow diagram on Linked Accounts displaying upstream sources (`Razorpay Gateway`, `PayPal Wallet`), concrete settlement paths (`Razorpay → Kotak`, `Razorpay → HDFC`, `PayPal → Kotak`, `Razorpay → Suspense`), and downstream bank targets (`Kotak Bank`, `HDFC Bank`) with exact rupee balances and percentages.
     - Added direct Copilot prompt affordance: *"Ask Copilot: Why Kotak > HDFC?"*.
  4. Extended AI Copilot Multi-Account Grounding:
     - Enhanced `ai_agent.py` to answer *"Why did more money go to Kotak than HDFC?"*, per-account flow queries, and PayPal settlement destinations using exact SQLite ledger route records with 100% verified confidence.
- [2026-08-23] Decision (Cleanup Phase 1) — Full Data Reset, August 2026 Single Month & 4-Account Structure:
  1. Full Data Wipe & Regeneration: Cleared all prior synthetic data and regenerated a clean, single-month partition strictly bound to August 2026 (`2026-08-01` to `2026-08-31`).
  2. Volume Cap: Total gross volume is ₹288,303.50 across 58 settlements, strictly satisfying the `< ₹3,00,000.00` small-to-mid merchant requirement.
  3. New 4-Account Integrated Treasury Structure:
     - `Razorpay Gateway (Business)` (`demo_org_1`, `rzp_test_89aNqP44v`) — Primary domestic gateway feed (~70% Kotak Bank, ~30% HDFC Bank).
     - `Kotak Mahindra Bank — Business Current Account` (`acct_kotak_bank`, `981200481920`) — Primary operating current account.
     - `HDFC Bank — Business Current Account` (`acct_hdfc_bank`, `50200084920192`) — Secondary corporate bank feed.
     - `PayPal — International Wallet` (`acct_paypal_wallet`, `paypal_merch_in_94`) — Cross-border wallet collecting international orders with periodic batched lump-sum payout transfers to Kotak Mahindra Bank.
     - ICICI Escrow Account permanently removed.
  4. Record Source Attribution: `source_account` field populated across all settlements, bank statements, ledger orders, and SQLite database tables (`transactions`, `exceptions`).
  5. Ground Truth & Matching Verification: `eval/eval_matching.py` executed against new `ground_truth.json`: **100.00% Record Accuracy**, **100.0% Exact Match F1**, **100.0% Batched Match F1**, **100.0% Fuzzy Match F1**, and **100.0% Exception Classification F1**.
  6. Documentation: Created and updated `DATA_SPEC.md` reflecting the new 4-account structure and volume bounds.
- [2026-08-23] Fix (Cleanup Phase 0) — Page-Context Bleed & Linked Accounts Sync Now:
  1. Resolved Ledger Copilot context bleed: `AIContext.tsx` dynamically constructs and validates fresh `PageContext` directly from the current browser route at the exact moment of query submission, eliminating stale cache from prior page visits. Added collapsible `Dev Context Inspector` displaying injected context in both Ask Your Books and Ledger Copilot panel.
  2. Fixed Linked Accounts "Sync Now" button: Added active loading state (`Syncing...`), updated `last_synced_at` timestamp via backend `/sync-now` endpoint, cleared "Sync Stale" / "Sync Delayed" flags and SLA warnings to `healthy`, and added a temporary success banner & `Synced!` button feedback.
  3. Re-affirmed strict scope: Finora remains an enterprise B2B finance controller for Razorpay merchants (personal card/EMI/savings features are strictly out of scope).
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
