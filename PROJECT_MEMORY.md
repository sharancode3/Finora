# Project Memory: Finora

## Current Phase: Round 7 Phase 9 � Final Pass (Complete)

## Round 7 Final Verifications
- 'Ind AS-Aligned' terminology verified app-wide (no 'Compliant' claims).
- Raw markdown asterisks removed from all AI texts (consolidated FormattedMarkdown component).
- Exceptions systemic clustering strictly demands >= 2 items.
- Exception Detail exactly computes Gross - 2% MDR - 18% GST.
- Confidence scoring dynamically generated via compute_dynamic_confidence().
- 'Multi-Step Tool Orchestration' enforced over 'Multi-Brain' / 'LLM Function Calling'.

## 5-Minute Rehearsal Path & Cut Strategy
**Protected Moments:**
1. Landing Page Scroll-in & Visual Reconciliation Bridge
2. Dashboard Pass (Fino Noticed Today review state)
3. Exceptions Investigation (AI Recommended Priority explainability)
4. Reconciliation Bridge (exact mathematical tie-out)
5. Ask Fino (Show dynamic 'why this confidence' rationale)

**Cut Strategy:** If running long (>3 minutes after Exceptions), cut the Document Assistant generation, cut Month-End Close export, and cut Tax-Line Matcher completely to preserve time for the final Ask Fino and Reconciliation Bridge.

## Noticed Today Review State
- Added a 
eviewed status and dismiss action for Fino Noticed Today anomaly signals.
- Created a backend POST /analytics/proactive-nudges/{id}/dismiss route that saves state in a new 
udge_state SQLite table and writes an entry into the existing udit_logs table (matching the existing closed-loop action patterns).
- Updated ProactiveAnomalyNudges.tsx UI to group signals into 'Live' and 'Reviewed' tabs, complete with real-time UI transitions and optimistic local state updates.

## Clarity Updates
- Calendar Hover Badge Removed: Deleted the absolute positioned 'F' badge from the Dashboard Transaction Calendar heatmap cells to prevent it from being misinterpreted as an unexplained anomaly marker.
- Reconciliation Ribbon Label: Changed the bare "Scope:" label above the search/filter inputs to "Find a specific transaction:" to accurately describe the UI's purpose.

## Terminology Standards
- Canonical Phrase for AI Tool Calling: "Multi-Step Tool Orchestration"
  - Replaces forbidden variants: "Multi-Brain Internal Routing", "Multi-Step Function Calling", "LLM Function Calling", "dynamic function calling", and all "Brain" suffixes (Reconciliation Brain, Forecast Brain, etc.).

## AI Confidence Scoring Rule Set
- Base Score: 1.00 (High)
- Tools Failed/Missing: -0.10 for partial, -0.20 for all failed
- No Tools Used: -0.05
- Verifier Fallback: -0.30
- Verifier Required Regen: -0.08
- Small Sample (<30 records): -0.12
- Period Comparison w/o Prior Data: -0.15
- Clamped to bounds: [0.35, 0.99]
- Tiers: HIGH (>=0.90), MEDIUM (>=0.70), LOW (<0.70)
- Round 3: Consolidation, Bug Fixes & Agentic Upgrade — ALL 14 PHASES COMPLETE & FULLY VERIFIED (Production-Ready)
## Decisions Log
- [2026-08-24] Decision (Round 3 — Phase 13: Navigation Reorganization Complete & Verified):
  1. Grouped Sidebar Navigation: Restructured flat 7-item navigation into 3 clearly categorized sections in [`MainLayout.tsx`](file:///c:/SHARAN%20PROJECTS/Finora/frontend/src/layouts/MainLayout.tsx) with small uppercase group headers:
     - **Daily Operations**: Dashboard (`/dashboard`), Reconciliation Batch (`/reconciliation`), Exceptions (`/exceptions`), Ask Your Books (`/ask_your_books`).
     - **Treasury & Finance Ops**: Cash Position (`/cash-position`), Month-End Close (`/month-end-close`).
     - **Configuration & Controls**: Linked Accounts (`/accounts`), Settings & Governance (`/settings`).
  2. Maintained Existing Mechanisms: Preserved collapse/expand drawer behavior, active route pill indicator, and standardized icon palette.
  3. Verification: `npm run build` compiled in 763ms with 0 errors.
- [2026-08-24] Decision (Round 3 — Phase 14: Final Cross-Page Consistency Pass & Demo Rehearsal Complete & Verified):
  1. Comprehensive Cross-Page Number Audit: Verified that open exception count (`3`), trapped volume (`₹16,500.00`), gross volume (`₹298,603.50`), and match rate (`81.8%`) are mathematically identical across Dashboard, Exceptions, Cash Position, Reconciliation, and Month-End Close.
  2. Closed-Loop Action & Propagation Rehearsal: Verified in-process state transitions (resolve exception -> instant audit log write -> metrics propagation -> state rollback).
  3. 5-Minute Timed Demo Script: Created a structured 5-minute video walkthrough timeline for judging presentation.
  4. Verification: `verify_phase14_end_to_end_rehearsal.py` passed 100%; `eval/eval_qa.py` passed 33/33 (100% accuracy, 100% verifier); `npm run build` compiled cleanly.
- [2026-08-24] Decision (Round 3 — Phase 12: Settings Demoted Visual Weight, AI Configuration Transparency & Persona Naming Complete & Verified):
  1. Calmer Visual Hierarchy: Restyled `/settings` into clean, calm `#FFFFFF` cards with `#E5E7EB` borders, restrained badge usage, and preserved 100% of functional features (SoD dual-custody matrix, granular notification triggers, linked accounts, and live SQLite audit trail).
  2. Dedicated AI Configuration & Architecture Section: Added `"AI Architecture & Tools"` tab disclosing:
     - Underlying Model: `Gemma 3 4B-Instruct`
     - Privacy Guarantee: `100% Local On-Device Inference (Transformers / ONNX)` — zero financial records or credentials are sent to external third-party cloud APIs.
     - Registered Tool Catalog: Discloses all 6 agentic tools (`sqlite_settlements_query`, `deterministic_variance_detector`, `stochastic_monte_carlo_engine`, `benford_law_inspector`, `segregation_of_duties_evaluator`, `month_end_close_memo_synthesizer`).
     - Grounding Policy Rules: Formulates 4 immutable rules (Tool-grounded sourcing, complete mathematical traceability, inspectable evidence trail, dual-custody state mutations).
  3. Persona Naming Fix: Renamed seed persona `"Statutory Audit Partner (EY)"` -> `"Statutory Audit Partner (External)"` in `Settings.tsx`, `sqlite_client.py`, and `finora.db`.
  4. Technical Claims Audit: Softened algorithm claim from `"AES-256 GCM At Rest"` -> accurate `"Encrypted At Rest"`.
  5. Verification: `verify_phase12_settings.py` passed 100%; `npm run build` compiled in 831ms; `eval/eval_qa.py` passed 33/33 (100% accuracy, 100% verifier).
- [2026-08-24] Decision (Round 3 — Phase 11: Month-End Close Grounded Closing Memo & Ind AS Terminology Complete & Verified):
  1. Real Grounded Closing Memo Generation: Implemented "Draft Closing Memo" as a live, deterministic generation engine (`draft_month_end_closing_memo` in `sqlite_client.py` and `MonthEndClose.tsx`):
     - Period Status: Evaluates pre-lock checklist state (`PARTIALLY READY — ACTION REQUIRED` vs `READY TO LOCK` vs `NOT READY`).
     - Grounded Numbers: Sourced from verified SQLite ledger records (Gross volume `₹298,603.50`, Match rate `81.8%`, Settled cash `₹244,371.19`, MDR fees `₹7,262.07`, GST `₹1,307.16`, Open blockers `3 items / ₹16,500.00`, Avg resolution speed `1.8 days`).
     - Unresolved Blockers List: Lists exact open discrepancy items with ID, reason, and amount.
     - Controller Recommendation: Explicit directive (*"Do not lock 2026-08 books until the 3 unresolved discrepancy items below (₹16,500.00) are cleared or explicitly written off."*).
     - Phase 4 Grounding: Includes 3-step Evidence Trail and paired confidence rating (`Confidence: High (98%)`).
     - Export & Workspace: Copy to clipboard with live confirmation, export/download as `.md`, and inline edit workspace.
  2. Terminology Precision Pass:
     - Updated `"Ind AS Compliance: Pass"` -> `"Statutory Format: Ind AS–aligned"`.
     - Updated `"under Ind AS convergence"` -> `"under Ind AS requirements"`.
  3. Verification: `verify_phase11_closing_memo.py` passed 100%; `npm run build` compiled in 839ms (0 errors); `eval/eval_qa.py` passed 33/33 (100% accuracy, 100% verifier).
- [2026-08-24] Decision (Round 3 — Phase 10: Exceptions Page Terminology Alignment & Standardized AIInsightCard Complete & Verified):
  1. Preserved Strong Core Features with Strict Restraint: Kept the composite risk scoring, 4-check deterministic investigation engine, pattern clustering, and time-to-resolution metrics intact without architectural churn.
  2. Applied Phase 4 AIInsightCard to Inline Investigation Drawer: Replaced the ad-hoc conclusion box with the universal [`AIInsightCard.tsx`](file:///c:/SHARAN%20PROJECTS/Finora/frontend/src/components/ui/AIInsightCard.tsx), complete with paired confidence rating (`Confidence: High / Medium`), initial vs explained variance chips, and an expandable 4-step sequential Evidence Trail accordion.
  3. Standardized Dual Access Actions ("Investigate with Fino" vs "Deep Audit"):
     - "Investigate with Fino": Executes the 4-check deterministic verification and smoothly expands the inline investigation drawer.
     - "Deep Audit": Provides direct navigation to the full record detail page (`/record/exception/:id`), which renders the identical 4-factor root-cause check, `AIInsightCard`, and closed-loop resolution actions.
  4. Systemic Pattern Clusters & Evidence Trail Terminology: Verified all cluster explanations and audit trails use strict "Evidence Trail" terminology and grounded observations.
  5. Verification: `verify_phase10_exceptions_terminology.py` passed 100%; `npm run build` compiled in 950ms (0 errors); `eval/eval_qa.py` passed 33/33 (100% accuracy, 100% verifier).
- [2026-08-24] Decision (Round 3 — Phase 9: Cash Position Scenario Selector Redesign & Forecast Explanation Complete & Verified):
  1. Replaced Ambiguous Single Toggle with Explicit Scenario Selector: Eliminated the unclear "Actual Bank Cash" toggle. Created an explicit, 4-preset scenario card selector with custom parameter support:
     - Preset 1: `Base Case (Verified Bank Cash)` — Real cash verified in bank feeds from UTR settlement batches (`₹244,371.19`).
     - Preset 2: `Recover All Exceptions (100% Discrepancy Release)` — Simulates full release of trapped open exceptions into usable cash (`₹261,041.19`, `+₹16,670`).
     - Preset 3: `50% Partial Recovery` — Conservative partial recovery of open suspense items (`₹252,706.19`, `+₹8,335`).
     - Preset 4: `Settlement Delay Stress (T+3 Gateway Transit Lag)` — Simulates a 3-day webhook payout delay extending transit DSO to 6.0 days (`₹218,500.00`, `-₹25,871`).
     - Custom What-If Sliders: Dedicated panel for granular adjustments (Settlement Delay days, Recovery rate %, Volume shift %).
  2. Live Headline Numbers Directly on Each Scenario Card: Every card displays its own live, computed headline amount and delta badge, making comparisons immediately legible at a glance as account or date filters change.
  3. Grounded "Why Did This Change?" AI Insight Card: Integrated `AIInsightCard.tsx` directly beneath the selector:
     - Synthesizes exact mathematical drivers behind the scenario shift (e.g., *"Projected liquidity increased ₹16,670 because 4 currently-open exceptions, if resolved, release their trapped settlement value"*).
     - Displays paired confidence ratings (`Confidence: High (96%)`).
     - Includes numbered Evidence Trail accordion citing exact tool steps (`sqlite_settlement_baseline`, `exception_suspense_resolver`, `stochastic_monte_carlo`).
  4. Verification: `verify_phase9_cash_scenarios.py` passed 100%; `npm run build` compiled in 888ms (0 errors); `eval/eval_qa.py` passed 33/33 (100% accuracy, 100% verifier); `verify_phase1_fixes.py` passed 6/6; `verify_phase6_closed_loop.py` passed 100%; `verify_phase8_recon_run.py` passed 100%.
- [2026-08-24] Decision (Round 3 — Phase 8: Reconciliation "Run" Interface Complete & Verified):
  1. Explicit Demo Moment for Multi-Stage Reconciliation: Built a dedicated, interactive Reconciliation Run engine and modal (`ReconciliationRunModal.tsx`) allowing the controller to trigger real-time 3-way reconciliation across any selected scope:
     - Active Month: `August 2026` (60 records, ₹298.6k gross volume across 4 rails).
     - Individual historical periods: `July 2026`, `June 2026`, `May 2026`, `April 2026`, `March 2026`.
     - Enterprise Demonstration Batch: `Full 6-Month History (March – August 2026)` (334 records, ₹1.66M gross volume).
  2. Timed 7-Stage Deterministic Pipeline Execution: Configured sequential progress animation with real-time outputs per stage:
     - Stage 1: Gateway Feed & Ledger Ingestion (`60 records loaded • ₹298,603.50 Gross`)
     - Stage 2: Tier 1: 1:1 Exact UTR & Reference Matching (`36 exact matches • ₹221,402.25`)
     - Stage 3: Tier 2: Batched Settlement Group Matching (`6 batched items in 2 payout groups`)
     - Stage 4: Tier 3: Fuzzy / Timing Window Matching (`12 probable matches • 91.2% confidence`)
     - Stage 5: Exception Classification & Root-Cause Extraction (`4 open exceptions classified • ₹16,670 trapped`)
     - Stage 6: Forensic & ML Anomaly Scan (`Benford: Conforming • 5 ML outliers checked`)
     - Stage 7: Statutory Ind AS Synthesis & Audit Seal (`81.8% / 97.0% Value Match Rate • Audit log stored`)
  3. Live Telemetry Console & Outcome Overview: Displays a live engine execution log stream, followed by high-level outcome KPI cards (Value Match Rate, Total Gross Processed, Net Settled Cash, Exceptions Trapped, Trust Tier Breakdown) with 1-click links to Exceptions Queue, Dashboard, and Audit Trail.
  4. Global Accessibility & Dedicated Ledger Route:
     - Added prominent `"⚡ Run Reconciliation"` button in Top Navbar and Sidebar navigation (`/reconciliation`).
     - Added dedicated 3-Way Reconciliation Ledger page (`Reconciliation.tsx`).
     - Connected Step 2 in Month-End Close (`MonthEndClose.tsx`) to open the runner modal with target month pre-selected.
     - Automatically writes immutable entries to `audit_logs` table upon each run execution.
  5. Verification: `verify_phase8_recon_run.py` passed 100% (Scopes, August 2026 Run, Full History 334-record Run, Audit Log verification); `npm run build` compiled in 1.03s (0 errors); `eval/eval_qa.py` passed 33/33 (100% accuracy, 100% verifier); `verify_phase1_fixes.py` passed 6/6; `verify_phase6_closed_loop.py` passed 100%; `verify_phase7_dashboard_hierarchy.py` passed 100%.
  1. Primary Controller Focal Point: Today's AI Controller Briefing remains at the very top as a full-width hero element, providing immediate 24-hour grounded narrative, key settled metrics, and Evidence Trail.
  2. Level 2 Core Numbers: The 4 KPI cards (Total Processed, Settled Net Amount, Exceptions Volume, Value Match Rate) sit directly below the briefing with previous-to-new animated counters and interactive "Why?" mathematical breakdown drawers.
  3. Level 3 Daily Operational Core: Grouped the daily essentials side-by-side:
     - Left (`lg:col-span-5`): Attention Required list with composite risk badges, amounts, and direct investigation links.
     - Right (`lg:col-span-7`): Settlement Deposit Trend area chart showing daily bank cash trajectory.
     - Followed by Recent Discrepancies queue table and Transaction Calendar heatmap with interactive day inspection.
  4. Level 4 Secondary Deep Telemetry ("Forensic Intelligence & Advanced Signals"): Moved the statistical anomaly and predictive risk widgets below the fold into a dedicated, 1-click collapsible panel:
     - Collapsed state displays quick status pills: `Benford: Conforming`, `ML: Clean`, `Risk: 2–5 items`.
     - Expanded state reveals the Predictive Exception Risk Indicator with velocity breakdown, Benford's Law distribution analysis & digit inspector, Isolation Forest ML flags, and Value-Weighted / Trust State reconciliation breakdowns.
  5. Verification: Zero features or functionality removed; `npm run build` compiled in 1.01s (0 errors); `verify_phase7_dashboard_hierarchy.py` passed 100%; `eval/eval_qa.py` passed 33/33 (100% accuracy, 100% verifier).
- [2026-08-24] Decision (Round 3 — Phase 6: Closed-Loop Actions & Audit Log Propagation Complete & Verified):
  1. Real State Mutations Across the Whole App: Wired "Escalate to Gateway Ops", "Apply Recommended Resolution", "Mark Explained & Resolve", and "Authorize & Sign Off" buttons to real SQLite mutations.
  2. Full Metric Propagation in the Same Page Load: Resolving an exception immediately propagates across all views without hard reload:
     - Exceptions page: Decreases open count and reduces unresolved value by exact exception amount (e.g. ₹14,200.00).
     - Dashboard: Updates Attention Required open exceptions count and pending volume.
     - Cash Position: Decreases "trapped in open exceptions" figure and updates Monte Carlo scenario forecast.
     - Month-End Close: Records authorized period close and freezes ledger state.
  3. Immutable SQLite Audit Trail (`audit_logs` table): Every state-changing action logs:
     - Actor/User (e.g. `Sarah Jenkins, CPA`, `Finance Admin`, `Statutory Audit Partner (EY)`).
     - Trigger Type (`AI Recommendation Applied` vs `Human Controller Manual Approval` vs `Controller Sign-Off`).
     - Action & Target (e.g. `Resolved Exception -> exc_c4c2b81321b9 (₹14,200.00)`).
     - State Transitions (`Status: open -> Status: resolved`).
     - Detailed audit notes, ISO/IST timestamps, and client IP addresses.
  4. Visible Audit Surface in Settings: Replaced static demo audit logs in `Settings.tsx` with a live, real-time table connected to `GET /api/v1/audit-logs/` with color-coded trigger badges and instant reactive listeners.
  5. Verification: `verify_phase6_closed_loop.py` passed 100% (open count reduced 5->4, unresolved value reduced ₹30,870->₹16,670, trapped cash reduced ₹39,200->₹25,000, audit logs written); `eval/eval_qa.py` passed 33/33 (100% accuracy, 100% verifier); `npm run build` compiled cleanly in 812ms.
- [2026-08-24] Decision (Round 3 — Phase 5: Global AI Side Panel Complete & Verified):
  1. Calm, Persistent "Ask Controller" Trigger: Replaced the large floating sparkle button with a calm, compact button (`Ask Controller` with a still `#16A34A` ready dot and subtle `#5B45F5` brand accents) available globally from the bottom-right and top navbar on every page.
  2. Reused "Active Agent Context" Header: Integrated the live context header at the top of the side panel, displaying the active view name, date range / scope (`Aug 01 to Aug 31, 2026`), live filtered metrics, and `Ind AS Grounded • Benford Verified` badge.
  3. Dynamic Context-Aware Questions (3–4 per page): Mapped intelligent suggested inquiries automatically per route:
     - Exceptions: Highest risk score, largest fee discrepancy, T+2 aging root cause.
     - Cash Position: Why forecast changed, 3-day delay cash impact, trapped cash in exceptions, DSO trend.
     - Month-End Close: Clearing suspense, draft closing memo, 5 checklist pillars, delta variance.
     - Linked Accounts: Kotak vs HDFC routing volume, PayPal destination, feed sync health.
     - Dashboard: Statutory match rate & settled cash, daily briefing synthesis, Benford status & ML outliers.
  4. Grounded Chat & Evidence Trails: Same high-precision function calling chat engine with paired confidence ratings (`Confidence: High (98%)`), numbered Evidence Trails, mini chart visual data, and recommended controller action callouts.
  5. Verification: `npm run build` compiled in 837ms (0 errors); `eval/eval_qa.py` passed 33/33 tests (100% accuracy, 100% verifier); Phase 1 test suite passed 6/6 test groups.
- [2026-08-24] Decision (Round 3 — Phase 4: AI Response Consistency & Terminology Fixes Complete & Verified):
  1. Universal AI Output Component (`AIInsightCard.tsx`): Built a single reusable component with a strict fixed structure: Fino indicator + still ready dot, Insight narration, paired confidence label (`Confidence: High (98%)` / `Medium (82%)` / `Low (45%)`), single status badge in the header, and an expandable numbered Evidence Trail accordion.
  2. Applied Standardized Card Across All Pages:
     - Dashboard: Daily Financial Controller Briefing (`Dashboard.tsx`)
     - Exceptions: AI Cluster Common-Thread Explanation & High-Contrast Investigation Drawer (`Exceptions.tsx`)
     - Record Detail: Deterministic AI Root-Cause Investigation Card (`RecordDetail.tsx`)
     - Cash Position: 7-Day Baseline Forecast & Grounded What-If Scenario Synthesis (`CashPosition.tsx`)
     - Month-End Close: Fino Month-End Reconciliation Synthesis (`MonthEndClose.tsx`)
  3. Renamed "Reasoning Trail" to "Evidence Trail": Everywhere in the application (buttons, accordions, labels, headers), replaced "reasoning trail" with "Evidence Trail". Numbered list displays the exact tool called, parameters, concise return observation, and how it supported the deterministic financial conclusion.
  4. Softened Grounding Language: Replaced "Enterprise Guarantee: Every AI response carries an explicit confidence score and inspectable reasoning trail" with factual grounding: `"AI Grounding: Responses are generated from verified ledger records with a linked evidence trail."`
  5. Paired Confidence Labels: Enforced pairing the confidence tier word with the percentage (e.g. `Confidence: High (98%)`, `Confidence: Medium (82%)`, `Confidence: Low (45%)`) rather than bare percentages alone.
  6. Verification: `npm run build` compiled in 914ms (0 errors); `eval/eval_qa.py` passed 33/33 tests (100% accuracy, 100% verifier); Phase 1 test suite passed 6/6 test groups.
- [2026-08-24] Decision (Round 3 — Phase 3: Motion System Complete & Verified):
  1. Calm, Controlled Fintech Transitions: Standardized all UI transitions to 150–250ms with `ease-out` timing curves. Eliminated playful scale pops, bouncy zooms, and shadow elevation shifts.
  2. Smooth Previous-to-New Number Counting (`AnimatedNumber` & `AmountDisplay`): Created `AnimatedNumber.tsx` and upgraded `AmountDisplay.tsx` to interpolate numeric values from previous shown value to new value over ~600ms on date range or filter changes (never resetting to zero).
  3. Strict Motion Elimination (Forbidden Animations Removed):
     - Removed `animate-pulse` from AI sparkles, daily briefing headers, and status dots. Replaced with static icons and still green status dots (`#16A34A`).
     - Removed `animate-ping` from the floating Copilot trigger button. Replaced with a clean, static status dot.
     - Removed spinning sparkles (`<Sparkles className="animate-spin" />`). Replaced with a clean, standard `<Loader2 className="animate-spin" />` only during active network operations.
     - Removed table row hover scale transforms; enforced subtle background shift only (`hover:bg-slate-50 transition-colors duration-150 ease-out`).
  4. Route Transitions: Enforced smooth fade + slide entrance on route navigation (`duration-200 ease-out`).
  5. Verification: `npm run build` compiled in 653ms (0 errors); `eval/eval_qa.py` passed 33/33 tests (100% accuracy, 100% verifier); Phase 1 test suite passed 6/6 test groups.
- [2026-08-24] Decision (Round 3 — Phase 2: Design System Consolidation Complete & Verified):
  1. Palette Unification: Standardized the application onto the exact locked hex design tokens across `index.css`, `statusTokens.ts`, `Button.tsx`, and all pages:
     - Page Background: `#F7F8FC`
     - Surface (Cards): `#FFFFFF`
     - Primary Text: `#0F172A` | Secondary Text: `#64748B` | Muted Text: `#94A3B8` | Border: `#E5E7EB`
     - Primary (Brand / AI Intelligence): `#5B45F5` | Hover: `#4C35E8` | Soft BG: `#EEEBFF`
     - Success: `#16A34A` | BG: `#ECFDF3` | Border: `#BBF7D0`
     - Warning: `#D97706` | BG: `#FFF7ED` | Border: `#FED7AA`
     - Danger: `#DC2626` | BG: `#FEF2F2` | Border: `#FECACA`
     - Info: `#2563EB` | BG: `#EFF6FF` | Border: `#BFDBFE`
  2. Strict Semantic Rules Enforced: Violet (`#5B45F5`) is reserved exclusively for AI Copilot (Fino) and primary product triggers. Success, Warning, Danger, and Info maintain 100% uniform semantic meaning across all views, charts, and badges.
  3. Badge & Pill Reduction: Enforced single status badge rule per card header across `AskYourBooks.tsx`, `LedgerCopilotPanel.tsx`, `LinkedAccounts.tsx`, `MonthEndClose.tsx`, and `Exceptions.tsx`. Secondary metadata (evidence count, timestamps, grounding notes) moved to muted body/footer text.
  4. Card Micro-Label Reduction: Streamlined the 4 Dashboard summary KPI cards by removing the competing inline "Why?" buttons from headers and transforming the cards into clean on-click interactive toggles for mathematical decompositions.
  5. Icon Standardization: Standardized all icons onto `lucide-react` with uniform stroke weights and clean sizing.
  6. Verification: `npm run build` compiled in 742ms with 0 errors; `eval/eval_qa.py` passed 33/33 tests (100% accuracy, 100% verifier); Phase 1 test suite passed 6/6 test groups.
- [2026-08-24] Decision (Round 3 — Phase 1: Critical Bug Fixes Complete & Verified):
  1. Bug 1 (Unified System Date): Added `get_system_current_date()` in `sqlite_client.py` and `GET /api/v1/system/date` in `main.py` querying `MAX(transaction_date)` (`2026-08-28`). Updated `get_daily_briefing_data` to dynamic format `August 28, 2026 18:00 IST`, aligning all "As of" timestamps across the application.
  2. Bug 2 (Guarded PoP Comparisons): Replaced zero/null division fallbacks on `Dashboard.tsx` with `has_prior_data` guards. When prior period volume is zero or outside partition, KPI cards render a clean `"No prior data"` neutral badge instead of fabricated `+100%`.
  3. Bug 3 & 5 (Populated Discrepancies & Dynamic Severity): Enriched `get_exceptions_by_date_range` with `LEFT JOIN transactions` on `transaction_id`. Attention Required items now read non-zero amounts (e.g. ₹14,200.00 for `exc_c4c2b81321b9`) and display dynamic `ex.risk_tier` severity badges (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
  4. Bug 4 (Trust State vs Value-Weighted Clarification): Explicitly differentiated "Trust State Breakdown (by Record Count)" vs "Value-Weighted Reconciliation (by Value)" with exact mathematical formulas printed beneath both widgets.
  5. Bug 6 (Linked Account Filtering for Cash Position): Implemented universal `get_account_filter_clause` mapping Kotak (`KKBK`), HDFC (`HDFC`), Razorpay, and PayPal. Filtering by Kotak accurately returns ₹192,913.68 settled net volume, DSO (3.0d), Leakage, and Monte Carlo simulation without breaking.
  6. Bug 7 (Conversational AI Intent Routing for Fino): Added intent classification in `orchestrate_agent_workflow`: greetings/help/small-talk ("hi", "hello", "who are you") return warm conversational replies with `is_greeting: True` and no confidence score/tool errors; ambiguous queries ask clarifying questions.
  7. Bug 8 (Clean Production Chat UI): Removed `Dev Context Inspector` debug accordion from `AskYourBooks.tsx` and `LedgerCopilotPanel.tsx`.
  8. Bug 9 (Month-End Close Zero Prior Volume Handling): Updated closing memo and AI summary to explain that August 2026 is the baseline initial operating period when prior volume is 0, eliminating contradictory `increased by 0.0% vs 2026-07` statements. Cards show `"No prior period data loaded"`.
  9. Bug 10 (Smooth Continuous Close Readiness Progression): Updated `get_month_end_metrics` to compute cumulative MTD close readiness (`cum_rate`), trending smoothly from 97.6% gradually to 81.8% across the month without whipsawing. Domain set to `[75, 100]` with tooltip `"Cumulative MTD Close Readiness"`.
  10. Verification: Automated test suite `scratch/verify_phase1_fixes.py` (6/6 groups passed), `eval/eval_qa.py` (33/33 passed, 100% accuracy & verifier), and `npm run build` (0 errors, 891ms).
- [2026-08-23] Decision (Branding & Global Identity) — AI Copilot Named "Fino":
  1. Renamed the global contextual AI Copilot and conversational controller to **Fino** across the entire UI, floating action buttons, slide-over drawer, Ask Your Books canvas, documentation, and user guides.
  2. Updated all references, greeting prompts, button triggers (e.g. *Ask Fino: Why Kotak > HDFC?*), and input placeholders (*Ask Fino about this ledger...*).
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
  - `components/ui/FormattedMarkdown.tsx`: Single shared markdown rendering component for all AI chat and insight surfaces.
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
