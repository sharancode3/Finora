# Phase 0: The Core Idea & Inviolable Rules

**Project**: Finora — AI Finance Controller (Razorpay AI Buildathon Track 04)
**Purpose**: A merchant-facing finance-ops tool reconciling money movement across a Razorpay-style settlement report, a bank statement, and an internal order ledger.
**Scale**: Synthetic batch of 150 records, built to real-world formatting standards.
**Output**: A real, measured match rate and an honest, unresolved exception list.

## 🔴 The Inviolable Rule
**Matching, scoring, and arithmetic are done by deterministic code.**
The AI *never* decides whether two records match and *never* invents a number.
The AI explains, summarizes, answers, and navigates — always grounded in something a function already computed, and always verified before being shown to the user.
*If any future prompt, feature idea, or shortcut would violate this rule, stop and flag it instead of building it.*

## Tech Stack (Locked)
| Layer | Choice | Why |
| :--- | :--- | :--- |
| **Backend** | FastAPI (Python) | Native support for pandas + rapidfuzz (matching logic). Pydantic validation for structured data. Auto-generated docs for judges. |
| **Database** | Firebase (Firestore) | Managed, real-time, no server ops. Document model fits record shapes perfectly. |
| **Frontend** | React + Tailwind CSS | Component reusability, fast iteration. Matches flat design system. |
| **Charts** | Recharts | Simple, composable, live rendering from data (no static images). |
| **AI Model** | Gemma 3 4B (via Ollama) | Runs locally offline (~3-4GB). Real tool-calling support. Ensures merchant data never leaves the machine. |

## Architecture & Patterns
- **AI Orchestration**: Tool-calling agent loop with a post-generation verifier. (Not RAG). The model uses tool calls to request specific data slices, and the verifier checks every number in the output against that slice before display.
- **Connector Honesty**: 
  - *Implemented*: Razorpay test-mode API, CSV upload.
  - *Stubbed/Documented*: UPI / Bank via Account Aggregator (out of scope for buildathon due to RBI licensing, but architected for).
- **AI Capabilities**: Navigation tools (`navigate_to`, `highlight_record`) to drive the UI. A dedicated "Ask Your Books" visual canvas for on-demand charting.

## Data Reality
- All data is synthetic with controlled ground truth.
- Every field, format, and naming convention *must* mirror real-world equivalents (e.g., UTR formats, GST/TDS fields, bank statement noise).
- 150 total records, deliberately messy.

## Visual Tone
- Restrained, serious fintech product.
- Flat design system, but tuned for professional use (restrained color use, no distracting geometric shapes).
