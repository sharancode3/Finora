# Finora — AI Financial Controller & Autonomous 3-Way Reconciliation Engine

<p align="center">
  <strong>Automated 3-Way Financial Reconciliation • Agentic Forensic Auditing • Monte Carlo Treasury Forecasting • Ind AS Continuous Close</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10%2B-blue?style=flat-square&logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Local_AI-Gemma_3_(Ollama)-indigo?style=flat-square" alt="Local AI" />
  <img src="https://img.shields.io/badge/Audit_Standard-Ind_AS_Compliant-emerald?style=flat-square" alt="Ind AS" />
</p>

---

## 📌 Executive Summary

Every day, finance and operations teams manually compare three disjointed financial records:
1. **Internal Ledgers:** Sales orders, cart checkouts, and invoices generated in core ERP databases.
2. **Payment Gateway Feeds:** Razorpay gross transactions, MDR fee deductions (2%), and GST surcharges (18%).
3. **Bank Statement Batches:** Actual net cash deposited into bank accounts (HDFC, ICICI) via UTR settlement batches.

Manual reconciliation across thousands of daily transactions creates severe blind spots: trapped float, delayed settlements, unnoticed gateway fee variances, and tedious month-end close scrambles.

**Finora** is a high-precision AI Financial Controller. It combines **deterministic 4-stage matching**, **unsupervised machine learning (Isolation Forest)**, **Benford's Law forensic integrity analysis**, **1,000-trial Monte Carlo cash forecasting**, and **Gemma 3 agentic tool-calling with auditable reasoning trails** to automate continuous reconciliation and month-end closing under Indian Accounting Standards (Ind AS).

---

## 🏗️ System Architecture

```text
                               ┌────────────────────────────────────────────────────────┐
                               │                    DATA INGESTION                      │
                               │  Internal Books CSV • Razorpay API • Bank UTR Batches  │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
                                                           ▼
                               ┌────────────────────────────────────────────────────────┐
                               │             4-STAGE MATCHING ENGINE (CORE)             │
                               │  Stage 1: 1-to-1 Exact Match (ID + Amount)             │
                               │  Stage 2: Batched Net Settlement Match                 │
                               │  Stage 3: Fee Variance & MDR Tolerance Detection       │
                               │  Stage 4: Unmatched & Anomaly Triage                   │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
                                                           ▼
                               ┌────────────────────────────────────────────────────────┐
                               │            SQLITE ACID LEDGER & AUDIT STORE            │
                               │  transactions • exceptions • settlements • journals    │
                               └─────────────┬────────────────────────────┬─────────────┘
                                             │                            │
                     ┌───────────────────────┴──────┐              ┌──────┴────────────────────────┐
                     ▼                              ▼              ▼                               ▼
     ┌───────────────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
     │      STATISTICAL FORENSICS    │ │ TREASURY MONTE CARLO │ │   AGENTIC AI ENGINE  │ │  VERIFIER GUARDRAIL  │
     │ • Isolation Forest Anomaly ML │ │ • 1,000 Trial Runs   │ │ • Local Gemma 3      │ │ • Zero-Hallucination │
     │ • Benford's Law MAD Digit Chk │ │ • P10/P50/P90 Bands  │ │ • Tool Execution     │ │ • Math Ledger Lock   │
     │ • Composite Risk Scoring      │ │ • Delay Variance     │ │ • Reasoning Trails   │ │ • Citation Check     │
     └───────────────┬───────────────┘ └──────────┬───────────┘ └──────────┬───────────┘ └──────────┬───────────┘
                     │                            │                        │                        │
                     └────────────────────────────┼────────────────────────┴────────────────────────┘
                                                  ▼
                               ┌────────────────────────────────────────────────────────┐
                               │                FASTAPI BACKEND SERVICES                │
                               │  /api/dashboard • /api/exceptions • /api/analytics     │
                               │  /api/cash-position/monte-carlo • /api/ai/query        │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
                                                           ▼
                               ┌────────────────────────────────────────────────────────┐
                               │             HIGH-CONTRAST REACT UI (FRONTEND)          │
                               │  Locked Sidebar • Period-over-Period • Live Audit Trail│
                               └────────────────────────────────────────────────────────┘
```

---

## 🌟 Core Innovations & Key Features

### 1. 🛡️ Deterministic Core + Grounded Agentic AI Shell
- **Zero-Hallucination Guarantee:** The AI model never decides matches or computes raw financial figures. It only explains and synthesizes what the deterministic database engine has already computed and proven.
- **Auditable Reasoning Trails:** Every AI output generates an inspectable multi-step execution trace documenting which database tools were called, the exact query parameters, and the raw observations.
- **Explicit Confidence Ratings:** All AI explanations carry deterministic confidence tags (`HIGH`, `MEDIUM`, `LOW`) calculated based on retrieval completeness and statistical evidence.
- **Escalation Routing:** Cases with low data density automatically present structured Controller Escalation recommendations rather than speculative reasoning.

### 2. 🔍 Forensic Intelligence & Statistical Machine Learning
- **Isolation Forest ML Anomaly Detection:** An unsupervised machine learning model trained on transaction amounts, gateway fee rates, and settlement latency to flag high-dimensional outliers with anomaly scores ($\in [-1.0, 1.0]$).
- **Benford's Law Digit Analysis:** Evaluates first-digit logarithmic distributions across all transaction amounts using Mean Absolute Deviation (MAD) to detect synthetic entries and enforce Ind AS forensic integrity.
- **Composite 100-Point Risk Scoring:** Every exception is scored deterministically based on three weighted pillars:
  $$\text{Risk Score} = \text{Amount Severity (40\%)} + \text{ML Anomaly Score (35\%)} + \text{Aging Delay (25\%)}$$
- **Systemic Root-Cause Clustering:** Open exceptions sharing common operational root causes (e.g., recurring MDR fee variance on credit card batches) are dynamically grouped into actionable clusters.

### 3. 📈 Treasury Forecasting & Monte Carlo Simulation
- **1,000-Trial Stochastic Forecast:** Replaces flat linear projections with empirical probability distributions for 7-day available cash.
- **Probabilistic Percentile Bands:** Delivers $P_{10}$ (Conservative), $P_{50}$ (Expected), and $P_{90}$ (Optimistic) cash projections grounded in historical settlement float and exception resolution curves.
- **Scenario Stress Testing:** Instant scenario modeling (Baseline vs. Delayed Settlement vs. High Exception Variance).
- **Cash Movement Waterfall:** Visualizes Gross Inflow $\rightarrow$ Gateway Fees $\rightarrow$ Pending Float $\rightarrow$ Trapped Exceptions $\rightarrow$ Settled Bank Cash.

### 4. 📑 Continuous Month-End Close (Ind AS Compliant)
- **Continuous Close Readiness:** Daily match rate sparklines tracking close-readiness throughout the month rather than a single end-of-period crunch.
- **Period-over-Period ($\Delta\%$) Intelligence:** Dynamic comparative analysis against the preceding financial period.
- **Pre-Lock Checklist & Controller Sign-Off:** Enforces segregation of duties and validation gates before immutably locking the financial period.
- **Statutory Audit Package:** Exportable journal entries and exception audit trails adhering to Indian Accounting Standards.

### 5. 🔐 Governance, Security & High-Contrast Design
- **Segregation of Duties Matrix:** Fine-grained role distinction (`Organization Admin`, `Finance Admin`, `Viewer`) preventing single-user conflict of interest.
- **Granular Event Notification Triggers:** Configurable alerts for high-severity exceptions, sync health issues, and ledger lock events.
- **Fixed Stationary Layout:** Locked sidebar with independent scrollport, responsive navigation, and high-contrast light theme built for financial legibility.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts |
| **Backend API** | FastAPI (Python 3.10+), Uvicorn, Pydantic, Scikit-learn, NumPy |
| **Database** | SQLite with ACID transactions & connection pooling |
| **Machine Learning** | Isolation Forest (`sklearn.ensemble`), Benford's Law MAD Analyzer |
| **AI / LLM** | Gemma 3 (via local Ollama inference) with JSON Schema Tool Calling |
| **Compliance** | Indian Accounting Standards (Ind AS) Statutory Audit Rules |

---

## 📂 Project Structure

```text
Finora/
├── backend/
│   ├── ai_agent.py             # Agentic AI with reasoning trails & confidence scoring
│   ├── anomaly_engine.py       # Isolation Forest ML & Benford's Law forensic engine
│   ├── main.py                 # FastAPI application routes & endpoints
│   ├── db/
│   │   └── sqlite_client.py    # SQLite database client & deterministic analytics
│   └── scripts/
│       └── generate_phase0_data.py # Seed data generator for 3-way reconciliation
├── data/
│   └── output/
│       ├── internal_records.csv    # Internal ERP sales orders
│       ├── razorpay_feed.csv       # Payment gateway settlement feed
│       ├── bank_statement.csv      # Bank credit & UTR statement
│       └── finora.db               # ACID SQLite Database ledger
├── frontend/
│   ├── src/
│   │   ├── components/ui/      # AmountDisplay, Badges, Skeletons, Buttons
│   │   ├── context/            # AIContext state provider
│   │   ├── layouts/            # MainLayout (Locked sidebar & TopBar)
│   │   ├── pages/              # LandingPage, Dashboard, Exceptions, CashPosition,
│   │   │                       # LinkedAccounts, MonthEndClose, AskYourBooks, Settings
│   │   ├── App.tsx             # Route configuration
│   │   └── index.css           # Global typography and Tailwind directives
│   ├── package.json
│   └── vite.config.ts
├── start_servers.bat           # Automated local launch script
├── requirements.txt            # Python dependencies
└── README.md
```

---

## ⚡ Quick Start & Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & `npm`
- **Ollama** (for local AI inference with Gemma 3)

### 1. Clone the Repository
```bash
git clone https://github.com/sharancode3/Finora.git
cd Finora
```

### 2. Install Python & Node Dependencies
```bash
# Install Python backend requirements
pip install -r requirements.txt

# Install Frontend packages
cd frontend
npm install
cd ..
```

### 3. Setup Local AI Model (Ollama)
```bash
# Pull the Gemma 3 model for local on-premise execution
ollama pull gemma3:4b
```

### 4. Initialize Database & Seed Synthetic Financial Ledger
```bash
python backend/scripts/generate_phase0_data.py
```

### 5. Start Application (Single Script)
Double-click `start_servers.bat` on Windows, or run:
```bash
# Terminal 1: Backend API (FastAPI)
python backend/main.py

# Terminal 2: Frontend (Vite)
cd frontend
npm run dev
```

Open your browser at **[http://localhost:5173](http://localhost:5173)** to access Finora.

---

## 📊 Evaluation & Financial Parity Metrics

Finora enforces strict mathematical reconciliation parity across all operational views:

| Metric | Verified Value | Grounded Source |
| :--- | :--- | :--- |
| **Gross Transaction Volume** | ₹2,61,307.44 | Total Internal ERP orders ($N = 65$) |
| **Total Gateway Deductions** | ₹5,532.74 | Verified MDR fees (2%) + GST (18%) |
| **Net Settled Cash** | ₹2,21,853.60 | Bank-credited UTR batches ($N = 54$) |
| **Value Match Rate** | 84.90% | Settled Net Cash / Gross Volume |
| **Exceptions Count** | 6 Items | Unresolved fee variances, missing credits, float delays |
| **Benford's Law Compliance** | MAD 0.0076 (Pass) | Close non-conformity ($< 0.012$ threshold) |
| **Monte Carlo 7-Day Range** | ₹1.82L – ₹2.45L | 1,000 stochastic simulation runs |

---

## 📄 License & Compliance

Built for the **Razorpay Buildathon 2026**. Designed under **Indian Accounting Standards (Ind AS)** statutory reporting requirements.
