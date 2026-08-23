# Finora — Synthetic Reconciliation Data Specification (August 2026)

## 📌 Overview & Scope

Finora is designed and calibrated specifically as an enterprise **B2B Financial Controller & Autonomous 3-Way Reconciliation Platform** for Razorpay merchants.

Personal credit/debit card tracking, EMI monitoring, and personal consumer savings features are strictly **OUT OF SCOPE**.

---

## 📅 Timeframe & Volume Bounds

| Parameter | Specification | Value |
| :--- | :--- | :--- |
| **Accounting Period** | Single Calendar Month | **2026-08-01 to 2026-08-31** (August 2026) |
| **Gross Volume Constraint** | Small-to-Mid Merchant Bound | **Strictly under ₹3,00,000.00** |
| **Current Dataset Gross Volume** | Ground-Truth Generated Sum | **₹288,303.50** |
| **Current Dataset Net Settled** | Ground-Truth Settled Cash | **₹252,003.50** |
| **Total Settlements** | Settlement Record Count | **58** |
| **Total Exceptions** | Discrepancy Record Count | **6** |

---

## 🏦 4-Account Integrated Banking & Feed Structure

Finora models a realistic multi-rail corporate treasury structure comprising **3 connected feeds + 1 international wallet**:

```text
┌────────────────────────────────────────┐
│     Razorpay Gateway (Business)        │ ── (Primary Domestic Payment Gateway)
│      key_id: rzp_test_89aNqP44v        │
└──────────────────┬─────────────────────┘
                   │
         ┌─────────┴─────────┐
         │ (~70% Volume)     │ (~30% Volume)
         ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│  Kotak Mahindra  │  │    HDFC Bank     │
│  Business Acct   │  │  Business Acct   │
│  A/C ...1920     │  │  A/C ...0192     │
└────────▲─────────┘  └──────────────────┘
         │
         │ (Batched Lump-Sum Payouts)
┌────────┴─────────┐
│ PayPal Int'l     │ ── (Cross-Border Consumer Wallet)
│ key_id: paypal.. │
└──────────────────┘
```

### 1. Razorpay Gateway (Business)
- **Account ID**: `demo_org_1`
- **Type**: `payment_gateway`
- **Role**: Primary domestic INR payment gateway collector.
- **Contract Rate**: 2.00% MDR + 18% GST on processing fees.
- **Settlement Route**: Domestic settlements split ~70% to Kotak Mahindra Bank and ~30% to HDFC Bank on standard $T+2$ business day rolling cadence.
- **Test-Mode Identifier**: `rzp_test_89aNqP44v` (Strictly test-mode prefix).

### 2. Kotak Mahindra Bank — Business Current Account
- **Account ID**: `acct_kotak_bank`
- **Type**: `bank_feed`
- **Account Number**: `981200481920`
- **Role**: Primary operating corporate current account receiving the majority (~70%) of domestic Razorpay settlements and all periodic international PayPal lump-sum payout deposits.
- **Polling SLA**: 15-minute Account Aggregator webhook feed.

### 3. HDFC Bank — Business Current Account
- **Account ID**: `acct_hdfc_bank`
- **Type**: `bank_feed`
- **Account Number**: `50200084920192`
- **Role**: Secondary operational corporate bank account receiving ~30% of domestic Razorpay settlements.
- **Polling SLA**: 15-minute Account Aggregator webhook feed.

### 4. PayPal — International Wallet
- **Account ID**: `acct_paypal_wallet`
- **Type**: `wallet`
- **Key ID**: `paypal_merch_in_94`
- **Role**: Dedicated wallet connector for international customer payments.
- **Processing Fee Structure**: ~4.40% cross-border fee + ₹25.00 fixed transaction charge (+ 18% GST).
- **Settlement Mechanics**: International payments accumulate in the PayPal wallet and are periodically transferred as batched lump-sum payout deposits to Kotak Mahindra Bank.

---

## 🏷️ Record Source Attribution

Every record in the 3-way data model carries an explicit `source_account` attribute:

- **Settlement Records (`settlement_report.csv` / `razorpay_feed.csv`)**:
  - `source_account`: `"Razorpay Gateway (Business)"` or `"PayPal — International Wallet"`
  - `destination_account`: `"Kotak Mahindra Bank — Business Current Account"` or `"HDFC Bank — Business Current Account"`
- **Bank Statement Records (`bank_statement.csv`)**:
  - `source_account`: `"Kotak Mahindra Bank — Business Current Account"` or `"HDFC Bank — Business Current Account"`
- **Internal Ledger Records (`internal_ledger.csv` / `internal_records.csv`)**:
  - `source_account`: `"Razorpay Gateway (Business)"` or `"PayPal — International Wallet"`
- **SQLite Database (`finora.db`)**:
  - `transactions.source_account` and `exceptions.source_account` columns indexed and populated.

---

## 📊 Reconciliation Stage Allocations & Realism Ratios

| Matching Stage | Volume Share | Record Count | Description |
| :--- | :--- | :--- | :--- |
| **Exact 1-to-1 Match** | ~62% | 36 records | 1-to-1 matching on UTR reference, settled amount ($\Delta \le ₹1.00$), and date window. |
| **Batched Match** | ~26% | 15 records | 1 Razorpay domestic batch (3 orders) + 2 PayPal international batches (6 orders each) settling as lump-sum deposits. |
| **Fuzzy / Timing Match** | ~5% | 3 records | 1-to-2 day bank transit clearance differences or truncated UTR bank description strings. |
| **Exceptions (Discrepancies)** | ~7% | 4 settlement + 2 external | Systemic fee variances, missing bank credits, duplicate entries, amount mismatches, and orphan entries. |

### Exceptions Subtype Coverage Matrix
1. `fee_variance` (`PAY-00150`): Gateway charged 2.8% MDR vs contractual 2.0% rate.
2. `no_bank_credit_found` (`PAY-00289`): Settlement past $T+2$ window with no matching bank statement credit.
3. `possible_duplicate` (`PAY-00045`): Two identical bank credits for the same UTR reference.
4. `amount_mismatch_only` (`PAY-00090`): Gateway deposit is ₹350 short due to unrecorded withholding.
5. `ledger_only` (`ORD-2026-08-0095`): Internal checkout order dropped by customer without gateway capture.
6. `bank_only` (`DIRECT-NEFT-UNKNOWN-REF-8491`): Inward bank credit without matching gateway settlement.

---

## 🔬 Benchmark Verification Metrics

The dataset is verified by the automated matching evaluator (`eval/eval_matching.py`):
- **Overall Record Accuracy**: **100.00%**
- **Exact Match F1 Score**: **100.0%** (36/36)
- **Batched Match F1 Score**: **100.0%** (15/15)
- **Fuzzy Match F1 Score**: **100.0%** (3/3)
- **Exception Classification F1 Score**: **100.0%** (4/4)
- **Value Reconciliation Rate**: **95.07%**
