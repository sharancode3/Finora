# Product Requirements Document (PRD): Finora

## 1. Problem Statement
Businesses that accept payments through gateways like Razorpay face a constant operational challenge: reconciling money movement across multiple disparate systems. They must manually match three records for every transaction:
1. What the payment gateway says it settled (Settlement Report).
2. What the bank statement shows as credited (Bank Statement).
3. What the business's own internal system expected (Order Ledger).

This process is currently done by hand, is heavily error-prone, and hides real money issues—such as refunds, fee miscalculations, delayed settlements, and duplicate credits—inside chaotic spreadsheets.

For the Razorpay AI Buildathon (Track 04), our specific objective is to: "Build an agent that closes one finance-ops loop across a 50+ record batch of synthetic data, reporting its match rate and the exceptions it could not resolve." The stated bar is: "Throughput plus measured accuracy plus an honest exception list. One cherry-picked match proves nothing."

## 2. Target User
The primary user is a merchant's finance/operations professional or the business owner themselves. We are *not* building for their end-customers.

**User Context:**
- Time-pressured and overwhelmed by data volume.
- Needs absolute trust in a number before acting on it.
- Currently suffers from heavy context-switching across at least three spreadsheets/portals just to answer a basic question like "why was I paid less?"

## 3. In Scope (This Build)
- **Three-way reconciliation**: Automatic reconciliation across the settlement report, bank statement, and internal ledger over a 150-record synthetic batch.
- **Deterministic Matching**: Four-stage deterministic matching (exact, batched, fuzzy, exception).
- **Confidence Scoring**: A confidence score per match computed from real data signals—never asserted by an LLM.
- **Honest Exception List**: A list of unresolved matches, each with a plain-English, grounded reason.
- **AI Controller (Gemma 3 4B)**: A tool-calling AI agent for settlement Q&A, exception summarization, in-app navigation, and a "why was I paid less" flow.
- **Post-Generation Verifier**: A programmatic verifier that checks every AI-stated number against its source tool result *before* display. Implements reject/regenerate/fallback behavior.
- **Cash-Position View**: A dashboard showing settlement trends and a simple statistical T+N forward forecast. (Forecast is deterministic, not LLM-generated; Gemma only narrates it).
- **DataSource Abstraction**: A connector interface with two working implementations (Razorpay test-mode API, CSV upload).
- **Backing Store**: Firebase/Firestore for real-time document storage.
- **UI/UX**: Professional, restrained flat-design user interface.

## 4. Explicitly Out of Scope
*Note: This prevents scope creep. Do not build these features.*
- **No real bank/UPI account linking**: RBI Account Aggregator licensing is required for real linking, which is out of scope. This will be built as a documented stub connector only.
- **No consumer personal-finance features**: No investment advice, savings-goal coaching, or wealth management features. This is strictly a merchant finance-ops tool.
- **No multi-business/multi-tenant support**: The schema should not actively block it for the future, but it will not be built now.
- **No production-grade authentication**: Basic email/password or a single demo account is sufficient.
- **No AI model fine-tuning**: The system relies entirely on tool-calling and the post-generation verifier.

## 5. Success Criteria
- **End-to-End Processing**: The full 150-record batch processes without manual intervention.
- **Measured Accuracy**: The reported match rate is computed against a ground-truth file we control, outputting real precision/recall/F1 metrics, not a fabricated percentage.
- **Specific Exceptions**: Every exception has a specific, data-grounded reason—never "unknown".
- **Zero Hallucinated Numbers**: Across a 20-question Q&A evaluation set, there are zero instances of the AI stating a number that does not trace back exactly to a tool-call result. (This is the single most important success criterion).
- **Verifier Demonstration**: The demo can show (live or via a logged example) the verifier successfully catching and correcting one hallucinated number.

## 6. User Stories
1. **As a merchant finance user**, I want to view my overall match rate at a glance, so that I immediately understand the health of my recent settlements.
2. **As a merchant finance user**, I want to drill into a specific exception, so that I can see exactly why a transaction failed to reconcile across my 3 data sources.
3. **As a merchant finance user**, I want to ask a free-text question (e.g., "why was I paid less on Tuesday?"), so that I don't have to manually cross-reference spreadsheets to find the missing fees or refunds.
4. **As a merchant finance user**, I want to receive grounded answers from the AI, so that I can trust the financial figures it provides.
5. **As a merchant finance user**, I want the AI to navigate me directly to the relevant screen or record based on my question, so that I save time searching the UI.
6. **As a merchant finance user**, I want to view a cash-position forecast, so that I know what working capital I can expect in the coming days.
7. **As a merchant finance user**, I want to upload CSV files or connect test-mode APIs, so that I can feed data into the reconciliation engine easily.
8. **As a merchant finance user**, I want to see the audit trail behind any number shown, so that I can verify the system's logic and trust its conclusions.

## 7. Non-Functional Requirements
- **Performance/Throughput**: Processing the 150-record batch must complete within a few seconds (demonstrating throughput for the buildathon).
- **Security**: Strict enforcement of test-mode APIs only, no plaintext secrets, and absolutely no financial data in application logs.
- **Privacy (Local AI)**: The AI model (Gemma 3 4B) must run entirely locally so that sensitive merchant financial data never leaves the machine.
