# Finora - AI Finance Controller

**Finora** is an AI Finance Controller that reconciles Razorpay settlements, bank statements, and internal ledgers with deterministic matching and verified AI explanations.

---

## 🚀 The Problem

Every day, finance and operations teams manually compare three spreadsheets: 
1. **Internal Ledgers** (Orders generated in their database)
2. **Payment Gateway Settlements** (e.g., Razorpay payouts)
3. **Bank Statements** (The actual cash hitting the bank)

They do this to ensure they got paid for every order, the fees were correct, and there are no missing funds. Doing this manually for thousands of transactions is painful, error-prone, and slow.

## 🏗️ Architecture

```text
Data Connectors 
   (CSV / Stubs)  -->  Normalization  -->  4-Stage Matcher  -->  Firestore
                                                                    |
                                                                    v
User Interface  <--  Verifier  <--  Gemma 3 (Tool-calling)  <--  FastAPI
```

### Core Engineering Decision
**Deterministic core + grounded AI shell.** The AI never decides matches or computes numbers. It only explains what the deterministic matching engine already proved. The AI operates under a strict rule-based Verifier to prevent hallucinations.

### Trust-State Model
Finora uses a unified state model for all records:
- **VERIFIED**: Reconciled exactly across all three systems.
- **PROBABLE**: Reconciled with minor acceptable variances (e.g., fuzzy matching).
- **REVIEW REQUIRED**: Exceptions that need human attention (e.g., amount mismatch).
- **UNRESOLVED**: Critical failures like missing bank credits.

## 📊 Evaluation Results

### Matching Engine Results
- **Processing Time**: ~0.08 seconds for 300 settlement cases.
- **Value Reconciliation Rate**: 97.41%
- **Overall Record Accuracy**: 94.20%
- **Stages**: Exact Match (96.6% F1), Batched Match (100% F1), Fuzzy Match (56% F1), Exception Detection (42.4% F1).

### Q&A Evaluation Results
*Tested across 25 dynamic questions covering Lookups, Variances, Date-ranges, Exceptions, and Navigation.*
- **Accuracy**: ~96%
- **Fallback Rate (Insufficient Data)**: 100% successful fallback on trick questions.
- **Verifier Checks**: Active on all requests.

## 🔌 Connector Honesty
What's real vs stubbed in this project:
- **Real**: CSV Uploads for ledgers, bank statements, and Razorpay settlements. The AI integration with `gemma3:4b` using function calling.
- **Stubbed**: Firebase is currently mapped to an `in_memory_db.json` for rapid prototyping. Direct API integrations for Bank AA (Account Aggregator) and UPI are stubbed.

## 🛠️ Technical Obstacles Overcome
The hardest part of building Finora was keeping the LLM honest with financial data. 

*Example*: Gemma initially hallucinated that a ₹18,500 refund caused a variance. Our custom **Verifier** intercepted the response, checked the tool execution trace, found no such refund in the data, rejected the answer, triggered a regeneration, and forced the AI to correctly state there was insufficient evidence.

## ⚙️ Setup Instructions

1. **Clone & Install**
   ```bash
   git clone https://github.com/yourusername/finora.git
   cd finora
   pip install -r requirements.txt
   npm install --prefix frontend
   ```
2. **Setup Ollama & Gemma**
   Ensure Ollama is running locally.
   ```bash
   ollama pull gemma3:4b
   ```
3. **Generate Test Data**
   ```bash
   python generate_data.py
   ```
4. **Run Backend**
   ```bash
   set PYTHONPATH=.
   python backend/main.py
   ```
5. **Run Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

## 🗺️ Future Roadmap
- Multi-business dashboard implementation.
- Live Bank Account Aggregator (AA) Integration.
- Proactive agent to automatically draft emails to payment gateways for missing settlements.
- Mobile companion app for quick health checks.
