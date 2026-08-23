# Finora — AI Financial Controller & Autonomous Reconciliation Platform

<p align="center">
  <strong>Next-Generation 3-Way Financial Reconciliation • Statistical ML Forensics • Monte Carlo Treasury Forecasting • Ind AS Continuous Close • The Ledger Copilot</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production--Ready-emerald?style=for-the-badge&logo=checkmarx" alt="Status" />
  <img src="https://img.shields.io/badge/Architecture-Deterministic_Core_%2B_Agentic_Shell-indigo?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Compliance-Ind_AS_/_ICAI_Aligned-blue?style=for-the-badge" alt="Compliance" />
  <img src="https://img.shields.io/badge/AI_Engine-Gemma_3_(Local_Inference)-purple?style=for-the-badge" alt="AI Engine" />
  <img src="https://img.shields.io/badge/Eval_Accuracy-100.0%25_(33/33_Passed)-success?style=for-the-badge" alt="Eval Accuracy" />
</p>

---

## 📑 Table of Contents

- [Executive Summary & Plain-English Overview](#-executive-summary--plain-english-overview)
- [How Finora Helps Businesses (Small vs. Large)](#-how-finora-helps-businesses-small-vs-large)
- [End-to-End Customer Traversal Walkthrough](#-end-to-end-customer-traversal-walkthrough)
- [Architectural Philosophy & Zero-Hallucination Core](#-architectural-philosophy--zero-hallucination-core)
- [Comprehensive Feature Matrix](#-comprehensive-feature-matrix)
  - [1. Executive Command Center & Dashboard](#1-executive-command-center--dashboard)
  - [2. 4-Stage Autonomous Matching Engine](#2-4-stage-autonomous-matching-engine)
  - [3. Exceptions Management & AI Root-Cause Investigation](#3-exceptions-management--ai-root-cause-investigation)
  - [4. Treasury Intelligence & Monte Carlo Cash Forecasting](#4-treasury-intelligence--monte-carlo-cash-forecasting)
  - [5. Forensic Integrity & Statistical Machine Learning](#5-forensic-integrity--statistical-machine-learning)
  - [6. Multi-Rail Bank & Gateway Feed Synchronization](#6-multi-rail-bank--gateway-feed-synchronization)
  - [7. Continuous Month-End Close (Ind AS Compliant)](#7-continuous-month-end-close-ind-as-compliant)
  - [8. Governance, Internal Controls & Segregation of Duties](#8-governance-internal-controls--segregation-of-duties)
  - [9. The Ledger Copilot — Global Contextual AI Architecture](#9-the-ledger-copilot--global-contextual-ai-architecture)
- [System Architecture & Data Flow](#-system-architecture--data-flow)
- [Design System & Semantic Color Tokens](#-design-system--semantic-color-tokens)
- [Mathematical & Statistical Formulations](#-mathematical--statistical-formulations)
- [Quantitative Evaluation & Benchmark Results](#-quantitative-evaluation--benchmark-results)
- [Statutory Compliance & Standards Alignment](#-statutory-compliance--standards-alignment)
- [Technology Stack](#-technology-stack)
- [Repository Structure](#-repository-structure)
- [Deployment & Localhost Setup Guide](#-deployment--localhost-setup-guide)

---

## 📌 Executive Summary & Plain-English Overview

### What is Finora in Simple Words?
Think of **Finora** as your business's **Automated AI Financial Controller**.

When customers buy goods or services from your business online:
1. **Your Store / ERP** records the gross sale order (e.g. ₹10,000).
2. **The Payment Gateway (Razorpay or PayPal)** processes the payment, deducts a credit card transaction fee (MDR ~2%) plus 18% Goods & Services Tax (GST), and holds the payout for 2–3 days ($T+2$ float).
3. **Your Bank (Kotak Mahindra Bank or HDFC Bank)** receives a bulk, batched deposit with a cryptic Unique Transaction Reference (UTR) code that combines multiple customer orders into a single lump sum.

```text
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│     Internal Books      │       │     Payment Gateway     │       │     Bank Statement      │
│  (Invoices / Orders)    │ ────► │    (Razorpay MDR Feeds) │ ────► │   (UTR Net Deposits)    │
│  Expected Gross Revenue │       │  Fee Deductions / Float │       │   Settled Cash In Hand  │
└─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
            ▲                                 ▲                                 ▲
            └─────────────────────────────────┴─────────────────────────────────┘
                                              │
                               3-Way Automated Reconciliation
```

### The Problem It Solves
Without Finora, business owners and accounting teams must manually export three different CSV spreadsheets, perform fragile Excel VLOOKUP formulas, and spend days figuring out:
- *Why did we receive less money than expected?*
- *Did the payment gateway charge the correct fee, or was there fee leakage?*
- *Which specific customer orders were in yesterday's bulk bank deposit?*
- *Is cash stuck in gateway suspense or transit?*

**Finora automates this entire lifecycle** in real time using a deterministic 4-stage matching engine, machine learning anomaly detection, Monte Carlo cash forecasting, and a grounded AI Copilot that never hallucinates numbers.

---

## 🏢 How Finora Helps Businesses (Small vs. Large)

### For Small Businesses & Startups
- **Stop Hidden Fee Leakage:** Verifies that every transaction fee matches contracted Merchant Discount Rates (2.0% MDR + 18% GST). Never overpay on gateway commissions.
- **Track Real Bank Float:** Know instantly how much cash has cleared into your bank account versus what is still pending in $T+2$ transit.
- **Zero Manual Spreadsheets:** 1-click automated reconciliation replaces tedious Excel matching and saves 15+ hours every month.
- **Plain-English Answers:** Ask questions like *"Why was my deposit lower today?"* and get instant, grounded explanations without needing an accounting degree.

### For Mid-Market & Large Enterprises
- **Multi-Rail Routing & Attribution:** Track multi-account money movements across domestic gateways (Razorpay), cross-border international wallets (PayPal), and multiple corporate operating accounts (Kotak, HDFC) with exact upstream attribution.
- **Statutory Ind AS Compliance:** Full alignment with **Ind AS 1** (Financial Statement Presentation), **Ind AS 7** (Cash Flow Statements), and **Ind AS 115** (Revenue Recognition) with cryptographic period locking.
- **Segregation of Duties (SoD) Internal Controls:** Automated dual-custody rule validation ensuring team members cannot simultaneously hold gateway API credentials and resolve exceptions.
- **1,000-Trial Monte Carlo Treasury Modeling:** Stress-test cash reserves under varying settlement delay scenarios, volume fluctuations, and recovery rates.

---

## 🗺️ End-to-End Customer Traversal Walkthrough

```text
[1. Link Accounts] ──► [2. 3-Way Match] ──► [3. Executive Dashboard] ──► [4. AI Exception Audit]
                                                                                │
[7. Ledger Copilot] ◄── [6. Month-End Close] ◄── [5. Monte Carlo Forecast] ◄───┘
```

1. **Step 1: Link Accounts (`/accounts`)**
   - Connect your payment gateway credentials (`rzp_test_...`), PayPal wallet, and corporate bank accounts (Kotak Mahindra Bank, HDFC Bank).
   - Finora establishes encrypted connections and continuously checks sync SLA health against a 15-minute polling interval.

2. **Step 2: Automated 3-Way Reconciliation Ingestion**
   - Finora ingests internal sales orders, gateway MDR settlement feeds, and bank statement UTR batches.
   - The 4-Stage Matching Engine automatically matches transactions, aggregates bulk batches, identifies fee variances, and isolates exceptions in milliseconds.

3. **Step 3: Monitor Health on the Executive Dashboard (`/dashboard`)**
   - Review top-line financial KPIs: Total Gross Volume, Net Settled Cash, Value Match Rate (%), and Open Exceptions with Period-over-Period ($\Delta\%$) comparative metrics.
   - Click **"Why?"** on any card to view the exact mathematical formula, contributing components, and causal explanation.
   - Read the **Today's AI Controller Briefing** and check the **Benford's Law Forensic Integrity Score**.

4. **Step 4: Investigate & Resolve Exceptions (`/exceptions` & `/record/:type/:id`)**
   - View discrepancies ranked by a 100-point composite risk score.
   - Click **`[ ✨ Investigate with AI ]`** to run a deterministic 4-step root cause trace (refund check, fee recalculation, bank transit lag, duplicate scan).
   - Resolve exceptions with audit logging or escalate to senior financial controllers.

5. **Step 5: Forecast Cash & Test Scenarios (`/cash-position`)**
   - Inspect the 5-Stage Cash Conversion Waterfall and 30-day liquidity trends.
   - Move What-If scenario sliders (Settlement Delay $+N$ days, Recovery %, Volume shift %) to simulate stochastic cash boundaries ($P_{10}/P_{50}/P_{90}$).

6. **Step 6: Execute Continuous Month-End Close (`/month-end-close`)**
   - Validate the 5-Pillar Statutory Pre-Lock Checklist.
   - Click **"What's needed to clear?"** to see blocking items, generate an executive AI Closing Memorandum, and apply a cryptographic period lock.

7. **Step 7: The Ledger Copilot Everywhere (`✨ Copilot`)**
   - Launch the persistent Copilot on any screen. The AI reads your current viewport context and answers inquiries with 100% verified citation trails.

---

## 🛡️ Architectural Philosophy & Zero-Hallucination Core

Finora enforces an uncompromising enterprise design principle:

> **"Deterministic Math at the Core, Grounded AI at the Shell."**

```text
                                  ┌─────────────────────────────────────────┐
                                  │           GROUNDED AI SHELL             │
                                  │   (Gemma 3 • Multi-Step Tool Calling)   │
                                  │   Synthesizes Explanations & Evidence   │
                                  └────────────────────┬────────────────────┘
                                                       │
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │        VERIFIER GUARDRAIL ENGINE        │
                                  │    Zero-Hallucination Math Check        │
                                  │    Deterministic Data Schema Proof      │
                                  └────────────────────┬────────────────────┘
                                                       │
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │        DETERMINISTIC SQLITE CORE        │
                                  │   ACID Transactions • Exact Ledgers     │
                                  │   Statutory Journal Hash Locking        │
                                  └─────────────────────────────────────────┘
```

1. **Zero-Hallucination Core:** Large Language Models are strictly prohibited from calculating ledger balances, computing fees, or inventing settlement matches. All calculations are executed deterministically in the SQL database engine.
2. **Transparent Reasoning Trails:** Every autonomous AI response produces an inspectable, sequential audit trail detailing which database functions were invoked, exact parameters, and raw data observations.
3. **Deterministic Confidence Ratings:** Explanations carry strict confidence metrics (`HIGH`, `MEDIUM`, `LOW`) computed from data retrieval completeness and statistical evidence.
4. **Human-in-the-Loop Escalation:** Ambiguous edge cases trigger automated Controller Escalation workflows rather than AI extrapolation.

---

## 🌟 Comprehensive Feature Matrix

### 1. Executive Command Center & Dashboard
- **Today's AI Controller Briefing:** Proactive 24-hour reconciliation posture synthesis with grounded narrative, raw SQLite data inspection toggle, and key metric badges.
- **Formula-Anchored KPI Cards:** Four top-line financial metrics (Total Processed, Net Settled Cash, Value Match Rate, and Open Exceptions) with Period-over-Period ($\Delta\%$) comparative intelligence.
- **Inline "Why?" Breakdown Drawers:** Clickable formula decompositions for every KPI displaying the exact mathematical formula, contributing components, and grounded causal explanations (zero modal popups).
- **Forensic Trust Badges:** Live Benford's Law compliance indicator computing Mean Absolute Deviation (MAD) across all ledger records.
- **90-Day Interactive Settlement Heatmap:** Color-coded daily volume calendar with click-to-expand daily transaction drill-downs.

### 2. 4-Stage Autonomous Matching Engine
- **Stage 1 — 1-to-1 Exact Match:** Immediate reconciliation of transactions matching on Transaction ID, gross amount, and timestamp within tolerance.
- **Stage 2 — Batched Settlement Aggregation:** Groups individual internal orders to match bulk bank UTR credit batches using subset-sum matching algorithms.
- **Stage 3 — Fee Variance & MDR Tolerance Detection:** Flags transactions where gateway fees deviate from negotiated contract rates (e.g., 2.0% MDR + 18% GST).
- **Stage 4 — Anomaly & Unmatched Triage:** Isolates orphan transactions (payments captured without internal orders, or bank credits without gateway settlement IDs).

### 3. Exceptions Management & AI Root-Cause Investigation
- **100-Point Composite Risk Scoring:** Deterministic severity ranking based on Transaction Value (40%), ML Anomaly Score (35%), and Aging Latency (25%).
- **Deterministic 4-Step AI Investigation Agent:** Fixed sequential investigation workflow:
  1. Record retrieval (amount, type, settlement/bank/ledger IDs).
  2. Refund verification on settlement batch.
  3. Fee/MDR and GST calculation check against contractual schedules.
  4. Bank credit trace and expected $T+2$ transit delay comparison.
  5. Duplicate credit candidate search.
- **Persistent Investigation Audit Trails:** SQLite persistence (`exception_investigations` table) storing full reasoning chains, findings, and recommended resolution steps.
- **AI Common-Thread Synthesis:** Multi-record cluster intelligence explaining shared systemic patterns (e.g. HDFC net settlement transit lag).
- **Natural Language Filter:** Parse unstructured queries (e.g., *"Show Razorpay fee discrepancies over ₹500 from last Tuesday"*) into structured database filters.
- **Ind AS Auditable Resolutions:** One-click adjustment workflows with standardized reason codes and permanent audit logging.

### 4. Treasury Intelligence & Monte Carlo Cash Forecasting
- **1,000-Trial Stochastic Monte Carlo Engine:** Simulates 1,000 parallel iterations of upcoming cash flows modeling settlement delay variance and historical exception rates.
- **Probabilistic Percentile Bands:**
  - **$P_{10}$ (Conservative):** High-confidence baseline liquidity floor.
  - **$P_{50}$ (Expected):** Median expected cash balance.
  - **$P_{90}$ (Optimistic):** Upper boundary assuming accelerated settlement clearing.
- **Interactive What-If Scenario Controller:** Adjustable sliders for Settlement Delay (+N days), Exception Recovery Rate (0–100%), and Expected Volume Shift (-50% to +50%).
- **AI Delta Narration:** The AI strictly narrates the statistical shift ($\Delta$ cash balance and confidence intervals) computed deterministically by the Monte Carlo model.
- **5-Stage Cash Conversion & Leakage Waterfall:** Visualizes gross customer inflow stepping down through Gateway MDR Fees, GST (18%), Suspense Exceptions, and Net Settled Cash.
- **Days Sales Outstanding (DSO) Tracker:** Real-time tracking of average transit latency between gateway capture and bank deposit.

### 5. Forensic Integrity & Statistical Machine Learning
- **Unsupervised Isolation Forest Outlier Detection:** Multi-dimensional anomaly scoring evaluating transaction amount, fee deviation, and float latency to isolate high-risk records.
- **Benford's Law First-Digit Analysis:** Computes natural logarithmic digit distributions ($d \in [1..9]$) against expected frequencies:
  $$P(d) = \log_{10}\left(1 + \frac{1}{d}\right)$$
  Computes Mean Absolute Deviation (MAD) to verify ledger integrity under statutory audit standards.
- **Forensic Sample Guardrails:** When filtered transactions count is $< 30$ (Benford) or $< 20$ (Isolation Forest), explicitly displays: *"Fewer than [N] transactions in this view — statistical checks need a larger sample to be meaningful."*

### 6. Multi-Rail Bank & Gateway Feed Synchronization
- **Strict Test-Mode Key Guardrails:** Enforced test-mode identifier masking (`rzp_test_` only, zero live key exposure) across all surfaces.
- **Multi-Rail Connection Monitoring:** Real-time health metrics for Razorpay Gateway (`demo_org_1`), Kotak Mahindra Bank (`acct_kotak_bank`), HDFC Corporate Current (`acct_hdfc_bank`), and PayPal International Wallet (`acct_paypal_wallet`).
- **Interactive Money Movement Flow:** Live diagram tracing upstream processor collections $\rightarrow$ settlement routes $\rightarrow$ destination bank deposit accounts.
- **Rule-Based Sync SLA Anomaly Tripwires:** Deterministically flags feeds breaching expected polling intervals (e.g. HDFC 34h lag vs. 15-minute polling SLA).
- **Suspense Decomposition:** Categorical breakdown of trapped funds by exception type.

### 7. Continuous Month-End Close (Ind AS Compliant)
- **Continuous Close Readiness:** Daily match rate tracking reconciliation health continuously throughout the accounting period.
- **5-Pillar Statutory Pre-Lock Checklist:** Step-by-step validation verifying Sales Ledgers, Gateway Feeds, Bank Statements, Suspense Clearance, and 3-Way Match Verification.
- **Grounded Checklist Audit Guidance ("What's needed?"):** Queries exact blocking exception IDs, amounts, and dates (e.g. 6 items totaling ₹46,600.00).
- **AI-Drafted Statutory Closing Memo:** Generates a formal, executive memorandum with 100% verified ledger figures, controller-editable workspace, and 1-click clipboard export.
- **Cryptographic Statutory Period Freeze:** Controller sign-off locking accounting periods to prevent retroactive tampering.

### 8. Governance, Internal Controls & Segregation of Duties
- **Deterministic Segregation of Duties (SoD) Rule Engine:** Evaluates assigned role scopes against dual-custody rules (e.g. Rule SOD-01: Exception Resolution + API Key Custody violation).
- **Grounded Control Risk Explanations:** Explains internal accounting control risks under Ind AS 1 and ICAI Internal Financial Controls (IFC).
- **Granular Notification Rule Rationales:** Explains statutory purpose and delivery channel rationale (Email vs In-App) for all 5 alert triggers.
- **Role-Based Access Control (RBAC):** Organization Admin, Finance Controller, and Statutory Auditor roles.

### 9. The Ledger Copilot — Global Contextual AI Architecture
Finora unifies conversational AI across the entire platform through **The Ledger Copilot** — a persistent, page-aware AI assistant reachable from every view. Rather than running fragmented bots, Finora uses a single unified orchestrator, verifier, and read-only tool registry with dynamic `PageContext` injection.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE LEDGER COPILOT                                     │
│        (Persistent Global AI Assistant Reachable Across Every View in Finora)          │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Injects PageContext
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               PAGE CONTEXT INJECTION LAYER                             │
│  - Active Viewport: Route (/dashboard, /exceptions, /cash-position, /month-end-close)  │
│  - Active Filters: Date Range (2026-08-01 to 2026-08-31), Account ID, Status          │
│  - Selected Entities: Selected Exception ID, Focused Batch UTR, Target Feed ID         │
│  - Visible Metrics: Match Rate %, Trapped Liquidity, SLA Pacing, Active Scenarios      │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Dispatches Query + State
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             UNIFIED AI AGENT ORCHESTRATOR                              │
│  - Multi-Step Reasoning Trails: Sequential plan -> action -> tool observation chain     │
│  - Zero-Hallucination Core: Never calculates numbers; queries deterministic SQL/tools  │
│  - Sourced Confidence Scoring: HIGH (0.95-0.99), MEDIUM, LOW with rationale           │
│  - Concrete Escalation Paths: Human-in-the-loop escalation on ambiguity                │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Validates Output
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              MATHEMATICAL VERIFIER GUARDRAIL                           │
│  - Cross-checks all generated numbers against SQLite ground truth & tool observations  │
│  - Rejects/Regenerates responses if any numerical hallucination or drift is detected   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Design System & Semantic Color Tokens

Finora enforces a strict, standardized semantic color token mapping to eliminate cognitive fatigue and maintain audit credibility:

| Color Family | Tailwind Token | Semantic Meaning | Approved System Uses |
| :--- | :--- | :--- | :--- |
| **GREEN** | `emerald` (`bg-emerald-50`, `text-emerald-700`, `border-emerald-200`) | **Verified / Healthy / Pass / Settled** | Exact Match Trust Badge, Healthy Feed Sync, Benford MAD Compliant Pass, Balanced Month-End Close |
| **AMBER** | `amber` (`bg-amber-50`, `text-amber-800`, `border-amber-200`) | **Probable / Pending / Review Required / Stale** | Fuzzy Match Trust Badge, Sync SLA Delay Alert, Statistical Sample &lt; 30, Medium Severity Badge |
| **RED** | `rose` (`bg-rose-50`, `text-rose-700`, `border-rose-200`) | **Exception / Critical / Failed / High Risk** | Unmatched / Open Exception Badge, Critical & High Risk Tier Badges, SoD Governance Blockers |
| **INDIGO** | `indigo` (`bg-indigo-50`, `text-indigo-700`, `border-indigo-200`) | **AI Intelligence / Copilot Sparkles** | ✨ AI Copilot launcher, Forensic AI Narrations, AI Root-Cause Investigation Summaries |
| **SLATE** | `slate` (`bg-slate-50` to `bg-slate-900`, `text-slate-700`) | **Neutral Chrome / Structural Bounds** | Data table borders, headers, transaction IDs, UTRs, timestamps |

> **Prohibited:** Blue is strictly prohibited from status encoding and reserved solely for hyperlinks and navigation breadcrumbs.

---

## 🔄 System Architecture & Data Flow

```mermaid
flowchart TD
    subgraph INGESTION["1. Data Ingestion Layer"]
        A1["Internal ERP Records (CSV)"] --> N1["Data Normalizer"]
        A2["Razorpay Settlement Feeds"] --> N1
        A3["Bank Statement UTR Batches"] --> N1
    end

    subgraph MATCHER["2. 4-Stage Matching Engine"]
        N1 --> M1["Stage 1: 1-to-1 Exact Match"]
        M1 -->|Unmatched| M2["Stage 2: Batched Settlement Match"]
        M2 -->|Variance| M3["Stage 3: Fee & MDR Tolerance Detection"]
        M3 -->|Exceptions| M4["Stage 4: Anomaly & Risk Triage"]
    end

    subgraph STORAGE["3. ACID Storage & Audit Ledger"]
        M1 --> DB[("SQLite ACID Ledger")]
        M2 --> DB
        M3 --> DB
        M4 --> DB
    end

    subgraph INTELLIGENCE["4. Intelligence & Analytic Services"]
        DB --> S1["Isolation Forest ML Engine"]
        DB --> S2["Benford Law Forensic Analyzer"]
        DB --> S3["1,000-Trial Monte Carlo Engine"]
        DB --> S4["Gemma 3 Agentic AI Shell"]
        S4 --> V1["Zero-Hallucination Verifier Guardrail"]
    end

    subgraph API["5. FastAPI Backend Services"]
        S1 --> E1["/api/v1/analytics/statistical-anomalies"]
        S2 --> E2["/api/v1/analytics/benford-analysis"]
        S3 --> E3["/api/v1/analytics/cash-scenario-simulation"]
        V1 --> E4["/api/v1/chat/ask & daily-briefing"]
        DB --> E5["/api/v1/transactions & exceptions"]
    end

    subgraph UI["6. High-Contrast Frontend & Ledger Copilot"]
        E1 --> UI1["Executive Dashboard & KPI Decompositions"]
        E2 --> UI1
        E3 --> UI3["Cash Position & What-If Monte Carlo Sliders"]
        E4 --> UI6["Persistent Global Ledger Copilot Drawer"]
        E5 --> UI2["Exceptions Queue & AI Investigation Agent"]
        E5 --> UI4["Month-End Close & AI Closing Memo"]
        E5 --> UI5["Settings & Segregation of Duties Copilot"]
    end
```

---

## 📊 Quantitative Evaluation & Benchmark Results

Finora is evaluated against an automated 33-question benchmark suite testing lookups, fee variances, date range filtering, exception causality, navigation intents, Monte Carlo scenarios, and SoD governance.

```text
===========================================================================
FINORA — COMPREHENSIVE QA & CONTEXTUAL COPILOT EVALUATION SUITE
===========================================================================
Total Evaluated Questions : 33
Overall Accuracy          : 100.0% (33/33 Passed)
Mathematical Verifier Rate: 100.0% (33/33 Passed)
Insufficient-Data Fallback: 100.0% Guardrail Adherence (2/2)
Average Latency           : 0.01s per query
===========================================================================
```

### 4-Stage Matching Engine Performance
- **Processing Time:** 0.06 seconds across 58 settlement test cases.
- **Overall Record Accuracy:** **100.00%**
- **Exact Match F1:** **100.0%**
- **Batched Settlement Match F1:** **100.0%**
- **Fuzzy Tolerance Match F1:** **100.0%**
- **Exception Classification F1:** **100.0%**

---

## 🏛️ Statutory Compliance & Standards Alignment

| Standard / Framework | Finora Implementation |
| :--- | :--- |
| **Ind AS 1 (Presentation of Financial Statements)** | True and fair view of settled cash versus pending receivables with verified audit schedules. |
| **Ind AS 7 (Statement of Cash Flows)** | Deterministic categorization of gross customer collections, gateway fees, and operating bank float. |
| **Ind AS 115 (Revenue from Contracts)** | Transaction-level gross revenue recognition net of gateway processing fees and returns. |
| **ICAI Internal Financial Controls (IFC)** | Role-based segregation of duties, four-eyes approval workflows, and immutable ledger locking. |
| **SOX Section 404** | Dual-custody separation of duties matrix with automated conflict detection. |

---

## 💻 Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React 18 + TypeScript | Component-driven reactive interface with strict type safety |
| **Design System** | Tailwind CSS + Lucide Icons | High-contrast, accessible financial design tokens |
| **Visualizations** | Recharts | SVG financial time-series, fan charts, and cash conversion waterfalls |
| **Backend API** | FastAPI + Pydantic v2 | High-throughput asynchronous REST API with automatic schema validation |
| **Database** | SQLite (ACID Engine) | Zero-configuration transactional database with connection pooling |
| **Machine Learning** | Scikit-learn (Isolation Forest) | Unsupervised multidimensional financial anomaly detection |
| **Forensics & Stats** | NumPy | High-performance vectorized 1,000-trial Monte Carlo simulation |
| **Local Agentic AI** | Gemma 3 (4B via Ollama) | Air-gapped on-premise inference with JSON Schema tool calling |

---

## 📁 Repository Structure

```text
Finora/
├── backend/
│   ├── ai_agent.py                  # Agentic Gemma 3 orchestrator & reasoning engine
│   ├── anomaly_engine.py            # Isolation Forest ML & Benford's Law forensics
│   ├── main.py                      # FastAPI REST application routes
│   ├── db/
│   │   └── sqlite_client.py         # SQLite client & deterministic analytics engine
│   ├── matching/
│   │   └── matcher.py               # 4-stage deterministic reconciliation matching engine
│   └── scripts/
│       ├── check_no_live_keys.py    # Automated CI security scanner for key leaks
│       └── generate_phase0_data.py  # High-fidelity 3-way reconciliation data generator
├── data/
│   └── output/
│       ├── internal_records.csv     # Internal ERP sales orders
│       ├── razorpay_feed.csv        # Razorpay gateway settlement feed
│       ├── bank_statement.csv       # Bank statement credit batches
│       └── finora.db                # SQLite ACID database
├── eval/
│   ├── eval_qa.py                   # Automated 33-question benchmarking engine
│   ├── eval_matching.py             # 4-stage matching engine evaluator
│   ├── test_questions.json          # Benchmark questions & ground-truth assertions
│   └── results_qa.md                # Quantitative accuracy & verifier audit report
├── frontend/
│   ├── src/
│   │   ├── api/                     # Axios API client configuration
│   │   ├── components/
│   │   │   ├── AppInfoGuide.tsx     # Comprehensive interactive platform & traversal guide
│   │   │   ├── LedgerCopilotPanel.tsx # Global contextual AI copilot panel
│   │   │   └── ui/                  # Reusable UI tokens (AmountDisplay, Badges, Buttons)
│   │   ├── context/
│   │   │   └── AIContext.tsx        # Global copilot viewport & filter context provider
│   │   ├── theme/
│   │   │   └── statusTokens.ts      # Single source-of-truth semantic color tokens
│   │   ├── layouts/
│   │   │   └── MainLayout.tsx       # Stationary sidebar & TopBar layout
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx      # Platform overview & product architecture
│   │   │   ├── Dashboard.tsx        # Command center with PoP delta & predictive risk
│   │   │   ├── Exceptions.tsx       # Composite risk scoring & systemic root-cause clustering
│   │   │   ├── CashPosition.tsx     # 1,000-trial Monte Carlo forecast & waterfall
│   │   │   ├── LinkedAccounts.tsx   # Sync health monitoring & cross-account flow
│   │   │   ├── MonthEndClose.tsx    # Continuous close readiness & statutory audit package
│   │   │   ├── RecordDetail.tsx     # 3-way transaction investigation drawer
│   │   │   ├── AskYourBooks.tsx     # Conversational AI with inspectable reasoning trails
│   │   │   ├── AboutFinora.tsx      # System architecture, platform guide & roadmap note
│   │   │   └── Settings.tsx         # Segregation of duties, alerts & about guide
│   │   ├── App.tsx                  # React Router application entry
│   │   └── index.css                # Tailwind directives & typography
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── DATA_SPEC.md                     # Single-month August 2026 dataset & 4-account spec
├── UI_UX.md                         # Locked design system & semantic color tokens
├── PROJECT_MEMORY.md                # Persistent project engineering memory & changelog
├── requirements.txt                 # Backend Python dependencies
└── README.md
```

---

## 🚀 Deployment & Localhost Setup Guide

### Prerequisites
- **Python 3.10 or higher**
- **Node.js 18 or higher** (`npm` included)
- **Ollama** (for local AI query execution)

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/sharancode3/Finora.git
cd Finora

# Install Python backend dependencies
pip install -r requirements.txt

# Install Frontend packages
cd frontend
npm install
cd ..
```

### 2. Pull Local AI Model
```bash
# Pull the Gemma 3 model for local execution via Ollama
ollama pull gemma3:4b
```

### 3. Initialize & Seed Ledger Database
```bash
# Generates single-month August 2026 3-way reconciliation data into data/output/finora.db
python backend/scripts/generate_phase0_data.py
```

### 4. Run Quantitative Evaluation Suite
```bash
# Run 33-question automated test suite
python eval/eval_qa.py

# Run matching engine evaluation
python eval/eval_matching.py
```

### 5. Launch Application
```bash
# Terminal 1 — Start FastAPI Backend API (Port 8000)
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — Start Frontend Application (Port 5173 / 5174)
cd frontend
npm run dev
```

---

## 📜 License & Acknowledgments

Developed for the **Razorpay Buildathon 2026**. Designed in compliance with **Indian Accounting Standards (Ind AS)** and statutory financial reporting principles.
