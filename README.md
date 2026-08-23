# Finora — AI Financial Controller & Autonomous Reconciliation Platform

<p align="center">
  <strong>Next-Generation 3-Way Financial Reconciliation • Statistical ML Forensics • Monte Carlo Treasury Forecasting • Ind AS Continuous Close</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production--Ready-emerald?style=for-the-badge&logo=checkmarx" alt="Status" />
  <img src="https://img.shields.io/badge/Architecture-Deterministic_Core_%2B_Agentic_Shell-indigo?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Compliance-Ind_AS_/_ICAI_Aligned-blue?style=for-the-badge" alt="Compliance" />
  <img src="https://img.shields.io/badge/AI_Engine-Gemma_3_(Local_Inference)-purple?style=for-the-badge" alt="AI Engine" />
</p>

---

## 📑 Table of Contents

- [Executive Summary & Problem Space](#-executive-summary--problem-space)
- [Architectural Philosophy](#-architectural-philosophy)
- [Comprehensive Feature Matrix](#-comprehensive-feature-matrix)
  - [1. Executive Command Center & Dashboard](#1-executive-command-center--dashboard)
  - [2. 4-Stage Autonomous Matching Engine](#2-4-stage-autonomous-matching-engine)
  - [3. Exceptions Management & Systemic Root-Cause Intelligence](#3-exceptions-management--systemic-root-cause-intelligence)
  - [4. Treasury Intelligence & Monte Carlo Cash Forecasting](#4-treasury-intelligence--monte-carlo-cash-forecasting)
  - [5. Forensic Integrity & Statistical Machine Learning](#5-forensic-integrity--statistical-machine-learning)
  - [6. Continuous Month-End Close (Ind AS Compliant)](#6-continuous-month-end-close-ind-as-compliant)
  - [7. Linked Accounts & Continuous Multi-Account Sync](#7-linked-accounts--continuous-multi-account-sync)
  - [8. Ask Your Books — Grounded Conversational AI](#8-ask-your-books--grounded-conversational-ai)
  - [9. Governance, Security & Segregation of Duties](#9-governance-security--segregation-of-duties)
- [System Architecture & Data Pipeline](#-system-architecture--data-pipeline)
- [Mathematical & Statistical Formulations](#-mathematical--statistical-formulations)
- [Statutory Compliance & Standards Alignment](#-statutory-compliance--standards-alignment)
- [Technology Stack](#-technology-stack)
- [Repository Structure](#-repository-structure)
- [Deployment & Setup Guide](#-deployment--setup-guide)

---

## 📌 Executive Summary & Problem Space

Modern enterprise finance operations face a critical tri-party reconciliation problem:
1. **Internal Books (ERP/Ledgers):** Invoices, sales orders, and shopping cart checkouts capturing expected gross customer receivables.
2. **Payment Gateway Feeds (Razorpay):** Gross transactions, Merchant Discount Rates (MDR ~2%), and statutory GST withholdings (18%).
3. **Bank Statement Batches (HDFC/ICICI/Axis):** Lump-sum net settlement deposits arriving via Unique Transaction Reference (UTR) clearing batches.

```text
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│     Internal Books      │       │     Payment Gateway     │       │     Bank Statement      │
│  (Invoices / Orders)    │ ────► │    (Razorpay MDR Feeds) │ ────► │   (UTR Net Deposits)    │
│  Expected Gross Revenue │       │  Fee Deductions / Float │       │   Settled Cash In Hand  │
└─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
            ▲                                 ▲                                 ▲
            └─────────────────────────────────┴─────────────────────────────────┘
                                              │
                                   3-Way Reconciliation
```

### The Operational Challenge
When transaction volumes scale to thousands of daily orders, legacy spreadsheet reconciliation breaks down:
- **Fee Leakage:** Subtle MDR contract miscalculations, unapplied tier discounts, and incorrect GST deductions compound silently.
- **Trapped Cash Float:** Delayed gateway payouts (T+2 vs. T+3 float) create misleading liquidity assumptions.
- **Opaque Discrepancies:** Finance controllers lack automated causality analysis for missing credits, chargebacks, and partial payouts.
- **End-of-Period Scramble:** Month-end financial closes require days of stressful, manual transaction matching across disparate exports.

**Finora** eliminates this friction by unifying deterministic 4-stage matching, unsupervised machine learning forensics, 1,000-trial Monte Carlo cash forecasting, and grounded local agentic AI into a single autonomous financial control center.

---

## 🛡️ Architectural Philosophy

Finora operates under an uncompromising enterprise design principle:

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

1. **Zero-Hallucination Guarantees:** Large Language Models are never permitted to compute ledger balances, calculate fees, or fabricate settlement matches. All calculations are executed deterministically in the SQL database engine.
2. **Transparent Reasoning Trails:** Every autonomous AI response produces an inspectable, sequential audit trail detailing which database functions were invoked, exact parameters, and raw data observations.
3. **Deterministic Confidence Ratings:** Explanations carry strict confidence metrics (`HIGH`, `MEDIUM`, `LOW`) computed from data retrieval completeness and statistical evidence.
4. **Human-in-the-Loop Escalation:** Ambiguous edge cases trigger automated Controller Escalation workflows rather than AI extrapolation.

---

## 🌟 Comprehensive Feature Matrix

### 1. Executive Command Center & Dashboard
- **Period-over-Period ($\Delta\%$) Analytics:** Real-time comparative intelligence comparing Total Volume, Net Settled Cash, Value Match Rate, and Open Exceptions against the preceding matching window.
- **7-Day Predictive Risk Indicator:** Forward-looking heuristic analysis projecting upcoming exception volumes and fee exposure based on historical float distributions.
- **Forensic Trust Badge:** Live Benford's Law compliance indicator computing Mean Absolute Deviation (MAD) across all ledger records.
- **Dynamic Date Filtering:** Instant multi-range presets (Today, Last 7 Days, Last 30 Days, Quarter-to-Date, Year-to-Date, and Custom Range).
- **Interactive Settlement Flow Visualization:** Recharts-powered settlement trajectories comparing internal bookings against gateway clearing curves.

### 2. 4-Stage Autonomous Matching Engine
- **Stage 1 — 1-to-1 Exact Match:** Immediate reconciliation of transactions matching on Transaction ID, gross amount, and timestamp within tolerance.
- **Stage 2 — Batched Settlement Aggregation:** Groups individual internal orders to match bulk bank UTR credit batches using subset-sum matching algorithms.
- **Stage 3 — Fee Variance & MDR Tolerance Detection:** Flags transactions where gateway fees deviate from negotiated contract rates (e.g., 2.0% MDR + 18% GST).
- **Stage 4 — Anomaly & Unmatched Triage:** Isolates orphan transactions (payments captured without internal orders, or bank credits without gateway settlement IDs).

### 3. Exceptions Management & Systemic Root-Cause Intelligence
- **100-Point Composite Risk Scoring:** Deterministic severity ranking based on Transaction Value (40%), ML Anomaly Score (35%), and Aging Latency (25%).
- **Systemic Root-Cause Clustering:** Automatically clusters open exceptions sharing systemic operational defects (e.g., recurring MDR fee variance on specific card networks).
- **Interactive Deep-Dive Investigation:** Expandable row drawers providing full 3-way side-by-side evidence (Internal Order vs. Gateway Capture vs. Bank Statement).
- **Auditable Resolution Workflows:** Controller adjustment sign-offs with standardized reason codes (`Gateway Fee Adjustment`, `Timing Difference`, `Refund Offset`) and permanent Ind AS audit logging.
- **Controller Escalation Routing:** One-click escalation to senior controllers for unidentifiable bank deposits or suspected fraudulent activity.

### 4. Treasury Intelligence & Monte Carlo Cash Forecasting
- **1,000-Trial Stochastic Monte Carlo Engine:** Simulates 1,000 parallel iterations of upcoming cash flows modeling settlement delay variance and historical exception rates.
- **Probabilistic Percentile Bands:**
  - **$P_{10}$ (Conservative):** High-confidence baseline liquidity floor.
  - **$P_{50}$ (Expected):** Median expected cash balance.
  - **$P_{90}$ (Optimistic):** Upper boundary assuming accelerated settlement clearing.
- **Scenario Stress Testing:** Instant scenario modeling:
  - *Baseline Scenario:* Historical settlement parameters.
  - *Delayed Settlement:* Simulated 3-day gateway clearing backlog.
  - *High Exception Variance:* Elevated transaction rejection rate.
- **5-Stage Cash Movement Waterfall:** Visualizes flow from Gross Inflow $\rightarrow$ Gateway Fees $\rightarrow$ Pending Float $\rightarrow$ Trapped Exceptions $\rightarrow$ Available Settled Cash.

### 5. Forensic Integrity & Statistical Machine Learning
- **Unsupervised Isolation Forest Outlier Detection:** Multi-dimensional anomaly scoring evaluating amount size, fee deviation, and settlement float latency to isolate high-risk transactions.
- **Benford's Law First-Digit Analysis:** Computes natural logarithmic digit distributions ($d \in [1..9]$) against expected frequencies:
  $$P(d) = \log_{10}\left(1 + \frac{1}{d}\right)$$
  Computes Mean Absolute Deviation (MAD) to verify ledger integrity under statutory audit standards.
- **Synthetic Ledger Entry Detection:** Automatically alerts on round-number clustering or non-conforming digit spikes indicative of data corruption or tampering.

### 6. Continuous Month-End Close (Ind AS Compliant)
- **Continuous Close Readiness:** Daily match rate sparkline tracking reconciliation health continuously throughout the accounting period.
- **Period Close Sequence:** Step-by-step validation checklist verifying:
  1. Internal Sales Ledger Import
  2. Gateway Settlement Feed Sync
  3. Bank Statement Ingestion
  4. Exception Resolution & Sign-Off
  5. 3-Way Match Verification
- **Grounded AI Executive Close Summary:** Multi-paragraph controller narrative generated with verifiable multi-step reasoning traces.
- **Immutable Ledger Freeze:** Cryptographic journal hash locking preventing retroactive record modification once closed.
- **Statutory Audit Package:** Exportable statutory journal vouchers and exception resolution logs adhering to Indian Accounting Standards.

### 7. Linked Accounts & Continuous Multi-Account Sync
- **Continuous Sync Health Monitoring:** Live telemetry tracking sync status, latency, and record volume across connected gateways and bank feeds.
- **Stale Connection Alerts:** Proactive warnings when integrations fail to receive expected settlement batches within defined thresholds.
- **Cross-Account Money Movement Flow:** Tracks inter-account fund flows (e.g., Gross collections in Razorpay $\rightarrow$ Net settlement batches in HDFC Bank Direct Feed $\rightarrow$ Unsettled gateway reserve balance).
- **Per-Account Contribution Matrix:** Breakdown of gross volume, fee rates, and exception volume across all active payment rails.
- **Interactive Integration Connector:** Modal interface supporting Razorpay, Stripe, Cashfree, HDFC Bank, ICICI Bank, and Axis Bank.

### 8. Ask Your Books — Grounded Conversational AI
- **On-Premise Local AI:** Powered by Gemma 3 via local Ollama inference — financial records are processed privately without third-party API exposure.
- **Tool-Calling Orchestration:** Converts natural language financial queries into structured database queries (`get_summary_metrics`, `get_exceptions`, `get_settlement_breakdown`, `get_benford_analysis`).
- **Interactive Visual Synthesizer:** Automatically renders Recharts pie charts, bar charts, and data tables inline with answers.
- **Auditable Reasoning Trail:** Expandable step-by-step breakdown displaying exact tools executed, parameters, and observations.
- **Intelligent Suggested Prompts:** Context-aware quick queries for fee leakage, trapped cash, and high-risk exceptions.

### 9. Governance, Security & Segregation of Duties
- **Role-Based Access Control (RBAC):**
  - **Organization Admin:** Full administrative control, API key configuration, and security management.
  - **Finance Admin:** Full reconciliation authority, exception resolution sign-off, and month-end close execution.
  - **Viewer:** Read-only visibility into dashboards and treasury forecasts without adjustment permissions.
- **Granular Event Notification Triggers:** Configurable multi-channel alert rules for high-risk exceptions, sync failures, readiness changes, and forensic anomaly flags.
- **Enterprise Security Posture:**
  - AES-256 GCM encryption at rest for sensitive account credentials and transaction identifiers.
  - Test-mode isolation preventing sandbox test keys from mingling with production feeds.
  - Two-Factor Authentication (TOTP 2FA) policy support and session termination controls.

---

## 🔄 System Architecture & Data Pipeline

```mermaid
flowchart TD
    subgraph INGESTION["1. Data Ingestion Layer"]
        A1[Internal ERP Records CSV] --> N1[Data Normalizer]
        A2[Razorpay Settlement Feeds] --> N1
        A3[Bank UTR Statements] --> N1
    end

    subgraph MATCHER["2. 4-Stage Matching Engine"]
        N1 --> M1[Stage 1: 1-to-1 Exact Match]
        M1 -->|Unmatched| M2[Stage 2: Batched Settlement Match]
        M2 -->|Variance| M3[Stage 3: Fee & MDR Tolerance Detection]
        M3 -->|Exceptions| M4[Stage 4: Anomaly & Risk Triage]
    end

    subgraph STORAGE["3. ACID Storage & Audit Ledger"]
        M1 --> DB[(SQLite ACID Ledger)]
        M2 --> DB
        M3 --> DB
        M4 --> DB
    end

    subgraph INTELLIGENCE["4. Intelligence & Analytic Services"]
        DB --> S1[Isolation Forest ML Engine]
        DB --> S2[Benford's Law Forensic Analyzer]
        DB --> S3[1,000-Trial Monte Carlo Engine]
        DB --> S4[Gemma 3 Agentic AI Shell]
        S4 --> V1[Rule-Based Verifier Guardrail]
    end

    subgraph API["5. FastAPI Backend Services"]
        S1 --> E1[/api/analytics/anomalies]
        S2 --> E2[/api/analytics/benford]
        S3 --> E3[/api/cash-position/monte-carlo]
        V1 --> E4[/api/ai/query]
        DB --> E5[/api/dashboard & /api/exceptions]
    end

    subgraph UI["6. High-Contrast Frontend UI"]
        E1 & E2 & E3 & E4 & E5 --> UI1[Command Dashboard]
        E1 & E2 & E3 & E4 & E5 --> UI2[Exceptions Queue]
        E1 & E2 & E3 & E4 & E5 --> UI3[Monte Carlo Cash Position]
        E1 & E2 & E3 & E4 & E5 --> UI4[Continuous Month-End Close]
        E1 & E2 & E3 & E4 & E5 --> UI5[Ask Your Books AI]
    end
```

---

## 📐 Mathematical & Statistical Formulations

### 1. Composite Exception Risk Score
Every exception is evaluated across three weighted dimensions to yield a deterministic score $S \in [0, 100]$:
$$S = \left(0.40 \times S_{\text{amount}}\right) + \left(0.35 \times S_{\text{anomaly}}\right) + \left(0.25 \times S_{\text{aging}}\right)$$
Where:
- $S_{\text{amount}} = \min\left(100, \frac{\text{Amount}}{1000} \times 10\right)$
- $S_{\text{anomaly}} = \text{Isolation Forest Outlier Score mapped to } [0, 100]$
- $S_{\text{aging}} = \min\left(100, \text{Days Open} \times 3.33\right)$

### 2. Benford's Law Mean Absolute Deviation (MAD)
Integrity compliance across leading digits $d \in \{1, 2, \dots, 9\}$:
$$\text{MAD} = \frac{1}{9} \sum_{d=1}^{9} \left| P_{\text{observed}}(d) - \log_{10}\left(1 + \frac{1}{d}\right) \right|$$
- **$\text{MAD} \le 0.012$:** Close Non-Conformity (Pass / Verified Authentic)
- **$\text{MAD} > 0.012$:** Non-Conformity (Flagged for Forensic Review)

### 3. Stochastic Monte Carlo Cash Projection
For simulation trial $k \in [1 \dots 1000]$ over forecast horizon $T = 7\text{ days}$:
$$\text{Cash}_k(T) = \text{Current Cash} + \sum_{t=1}^{T} \left( \hat{I}_t \times (1 - \hat{\delta}_{k,t}) - \hat{E}_{k,t} \right)$$
Where $\hat{\delta}_{k,t} \sim \mathcal{N}(\mu_{\text{delay}}, \sigma^2_{\text{delay}})$ represents stochastic settlement delay and $\hat{E}_{k,t}$ models exception entrapment.

---

## 🏛️ Statutory Compliance & Standards Alignment

| Standard / Framework | Finora Implementation |
| :--- | :--- |
| **Ind AS 1 (Presentation of Financial Statements)** | True and fair view of settled cash versus pending receivables with verified audit schedules. |
| **Ind AS 7 (Statement of Cash Flows)** | Deterministic categorization of gross customer collections, gateway fees, and operating bank float. |
| **Ind AS 115 (Revenue from Contracts)** | Transaction-level gross revenue recognition net of gateway processing fees and returns. |
| **ICAI Internal Financial Controls (IFC)** | Role-based segregation of duties, four-eyes approval workflows, and immutable ledger locking. |

---

## 💻 Technology Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript | Type-safe, component-driven reactive interface |
| **Styling & Design** | Tailwind CSS + Lucide Icons | High-contrast, accessible financial UI design system |
| **Data Visualization** | Recharts | Composable SVG charts for financial time-series & waterfalls |
| **Backend API** | FastAPI + Pydantic v2 | High-throughput asynchronous REST API with auto validation |
| **Database Engine** | SQLite (ACID) | Zero-configuration transactional database with connection pooling |
| **Machine Learning** | Scikit-learn (Isolation Forest) | Unsupervised multidimensional financial anomaly detection |
| **Statistical Engine** | NumPy | High-performance vectorized 1,000-trial Monte Carlo simulation |
| **Local AI LLM** | Gemma 3 (4B Parameters via Ollama) | Air-gapped on-premise inference with JSON Schema tool execution |

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
│   └── scripts/
│       └── generate_phase0_data.py  # High-fidelity 3-way reconciliation data generator
├── data/
│   └── output/
│       ├── internal_records.csv     # Internal ERP sales orders
│       ├── razorpay_feed.csv        # Razorpay gateway settlement feed
│       ├── bank_statement.csv       # Bank statement credit batches
│       └── finora.db                # SQLite ACID database
├── frontend/
│   ├── src/
│   │   ├── components/ui/           # Reusable UI tokens (AmountDisplay, Badges, Buttons)
│   │   ├── constants/theme.ts       # Unified financial design tokens & color palette
│   │   ├── context/AIContext.tsx    # Global AI copilot state provider
│   │   ├── layouts/MainLayout.tsx   # Locked stationary sidebar & TopBar layout
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx      # Platform overview & product architecture
│   │   │   ├── Dashboard.tsx        # Command center with PoP delta & predictive risk
│   │   │   ├── Exceptions.tsx       # Composite risk scoring & systemic root-cause clustering
│   │   │   ├── CashPosition.tsx     # 1,000-trial Monte Carlo forecast & waterfall
│   │   │   ├── LinkedAccounts.tsx   # Sync health monitoring & cross-account flow
│   │   │   ├── MonthEndClose.tsx    # Continuous close readiness & statutory audit package
│   │   │   ├── RecordDetail.tsx     # 3-way transaction investigation drawer
│   │   │   ├── AskYourBooks.tsx     # Conversational AI with inspectable reasoning trails
│   │   │   └── Settings.tsx         # Segregation of duties & notification triggers
│   │   ├── App.tsx                  # React Router application entry
│   │   └── index.css                # Tailwind directives & typography
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── start_servers.bat                # Automated one-click startup script (Windows)
├── requirements.txt                 # Backend Python dependencies
└── README.md
```

---

## 🚀 Deployment & Setup Guide

### Prerequisites
- **Python 3.10 or higher**
- **Node.js 18 or higher** (`npm` included)
- **Ollama** (for on-premise local AI query execution)

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
# Pull the Gemma 3 model for local on-premise execution via Ollama
ollama pull gemma3:4b
```

### 3. Initialize & Seed Ledger Database
```bash
# Generates high-fidelity 3-way reconciliation data into data/output/finora.db
python backend/scripts/generate_phase0_data.py
```

### 4. Launch Application

#### Option A: One-Click Startup (Windows)
Double-click `start_servers.bat` in the project root to launch both the backend API and frontend development server simultaneously.

#### Option B: Manual Terminal Startup
```bash
# Terminal 1 — Start Backend API
python backend/main.py

# Terminal 2 — Start Frontend Application
cd frontend
npm run dev
```

---

## 📜 License & Acknowledgments

Developed for the **Razorpay Buildathon 2026**. Designed under **Indian Accounting Standards (Ind AS)** and statutory financial reporting guidelines.
