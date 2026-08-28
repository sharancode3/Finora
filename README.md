<div align="center">
  <img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80" alt="Finora AI Financial Controller" width="100%" style="border-radius: 12px; margin-bottom: 20px;" />
  
  # Finora: Autonomous AI Financial Controller
  
  **Continuous 3-Way Reconciliation • Zero-Hallucination Execution • Local Neural Intelligence**
  
  *Engineered for the Razorpay Buildathon*
</div>

---

## 🚨 The Problem We Are Solving

Modern digital businesses process thousands of transactions daily across multiple payment gateways (Razorpay, PayPal) and banking rails (Kotak, HDFC). However, the **financial control loop is fundamentally broken**:

1. **Manual 3-Way Reconciliation**: Finance teams waste weeks downloading CSVs, matching UTRs, and manually tying out Gateway Ledgers against Bank Statements.
2. **The Suspense Trap**: Unmatched exceptions (fee variances, tax deductions, duplicate UTRs) sit in "suspense accounts" for months, trapping critical working capital.
3. **Lagging Financial Visibility**: "Month-End Close" actually takes 15 days *after* the month ends, leaving CFOs flying blind regarding real-time cash position and in-transit T+2 float.
4. **Data Isolation**: ERPs, Gateways, and Bank Portals don't talk to each other intuitively, requiring SQL and VLOOKUPs just to answer simple questions like: *"Why is my net bank deposit less than my gross sales?"*

---

## 💡 The Solution: Meet Finora

**Finora** is an autonomous AI Financial Controller designed to replace manual reconciliation spreadsheets with a continuous, intelligent, and conversational treasury engine. 

Instead of waiting for month-end, Finora continuously ingests your payment gateway and bank feeds, performs exact-match 3-way reconciliation, mathematically isolates discrepancies, and allows the CFO to query the active ledger in plain English.

---

## ✨ Core Features & Capabilities

### 1. 🤖 Ask Fino: Multi-Step Tool Orchestration
Finora is powered by a grounded AI Orchestrator that natively queries your active SQLite ACID ledger.
- **Natural Language to SQL**: Ask *"Why is my pay less than last month?"* and Fino will execute tools to pull gross volume, calculate gateway fees (MDR + GST), and explain the variance.
- **Zero-Hallucination Guardrails**: Fino strictly adheres to a financial domain boundary. It will refuse non-financial queries and accurately handles future-date projections by defaulting to mathematical Monte Carlo simulations rather than hallucinating historical data.

### 2. 🔄 Continuous 3-Way Reconciliation
- **Canonical Tie-Out**: Automatically reconciles Customer Checkout $\rightarrow$ Razorpay Gateway $\rightarrow$ Kotak/HDFC Bank.
- **Deterministic Auditing**: Verifies contractual MDR fee deductions (e.g., 2.0%) and GST (18%) on every transaction, instantly flagging unauthorized gateway deductions.

### 3. ⚠️ Automated Exception Clustering
- Groups thousands of unmatched transactions into actionable clusters (e.g., *Duplicate Bank UTR*, *Gateway Fee Variance*, *Ledger Only*).
- **1-Click Escalation**: Provides context-aware resolution paths that write directly to an immutable audit log.

### 4. 📊 Treasury & Cash Position Engine
- **In-Transit Float Tracking**: Real-time visibility into rolling T+2 settlement float stuck between the gateway and the bank.
- **1,000-Trial Monte Carlo Forecaster**: Stochastic projections of P10 (downside), P50 (expected), and P90 (upside) liquidity bands based on historical settlement velocity.

### 5. 🕵️ Forensic Outlier Detection
- **Isolation Forests**: Unsupervised machine learning to detect anomalous fee-to-gross ratios.
- **Benford's Law MAD**: Evaluates the logarithmic distribution of leading digits to detect ledger tampering and fabricated synthetic entries.

### 6. 📝 1-Click Month-End Close & AI Memo
- Generates a fully audited, Ind AS-Aligned CFO Memorandum in seconds, sealed with an immutable SHA-256 cryptographic digest.

---

## ⚖️ Dual Match-Rate Model (Record vs Statutory Value)

Finora implements two distinct match-rate metrics to provide controllers with true financial transparency:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│           RECORD MATCH RATE            │       STATUTORY VALUE MATCH RATE       │
│                 81.7%                  │                 84.4%                  │
│       (49 / 60 Settled Records)        │       (₹2,44,371.19 / ₹2,98,603.50)    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

**Why Do They Differ?**
In multi-rail commerce, transaction count rarely equals financial risk. Two high-value open exceptions account for **50.0%** of all trapped cash, skewing rupee exposure significantly higher than the raw transaction count indicates.

---

## 🧮 Mathematical & Statistical Formulations

### 1. Canonical Gross-to-Net Tie-Out
```math
\text{Net Settled Cash} = \text{Gross Volume} - \text{MDR Fees} - \text{GST (18\%)} - \text{In-Transit Float} - \text{Trapped Exceptions}
```
```math
₹2,44,371.19 = ₹2,98,603.50 - ₹7,262.07 - ₹1,307.16 - ₹18,763.08 - ₹26,900.00 \quad (\text{Variance: } ₹0.00)
```

### 2. Benford's Law Mean Absolute Deviation (MAD)
```math
\text{MAD} = \frac{1}{9} \sum_{d=1}^{9} \left| P_{\text{observed}}(d) - \log_{10}\left(1 + \frac{1}{d}\right) \right| = 0.0084 \quad (\text{Close Conformity})
```

---

## 🔒 Security, Data Privacy & Zero-Hallucination Guardrails

1. **100% Local Neural Execution**: Finora uses on-device neural SLM weights executing locally via Ollama. Financial data never leaves the host machine.
2. **Immutable Audit Trail**: All AI recommendations and human controller approvals generate append-only logs tracking timestamp, user identity, and delta state.
3. **Dual-Custody Segregation of Duties (SoD)**: Compliant with standard enterprise financial governance frameworks.
4. **Strict Domain Fencing**: The AI strictly refuses non-financial inputs (programming, general knowledge, etc.) to maintain professional controller governance.

---

## 🚀 Quickstart & Local Installation Guide

### Prerequisites
- **Node.js**: v18.0 or higher
- **Python**: v3.10 or higher
- **Ollama**: (Optional for local neural inference; deterministic fallback enabled automatically if offline)

### 1. Clone & Setup Backend
```bash
# Navigate to project root
cd finora

# Install Python dependencies
pip install fastapi uvicorn sqlite3 pydantic numpy scikit-learn requests

# Start Backend Server (Port 8000)
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Setup Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite Development Server (Port 5173)
npm run dev
```

### 3. (Optional) Run Local Neural SLM
```bash
# Pull and run local SLM weights via Ollama
ollama run gemma:3-4b
```

### 4. Access Finora
Open your browser and navigate to:
**`http://127.0.0.1:5173`**

---

<p align="center">
  <strong>Finora — AI Finance Controller</strong> ✦ Engineered for the Razorpay Buildathon
</p>
