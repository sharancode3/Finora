# Data & Ground Truth Specification: Finora

*Prerequisite Note: This document defines the exact data shapes and rules. The Database Schema (Phase 5) must be derived directly from these specifications.*

## 1. The Three Source Files

The reconciliation engine operates across three distinct input files, generated to match real-world naming conventions and data structures exactly.

### A. `settlement_report` (Razorpay-style)
Represents the exact output from a payment gateway.
**Fields:**
- `payment_id`: String (e.g., `pay_xxxxxxxxxxx`)
- `order_id`: String (e.g., `order_xxxxxxxxxxx`)
- `gross_amount`: Decimal (original transaction amount)
- `razorpay_fee`: Decimal (gateway fee)
- `gst_on_fee`: Decimal (18% GST on the fee)
- `tds`: Decimal (Tax Deducted at Source, if applicable)
- `settled_amount`: Decimal (`gross_amount` - `razorpay_fee` - `gst_on_fee` - `tds`)
- `utr`: String (Unique Transaction Reference, e.g., `AXIS000123456789`)
- `settlement_date`: Date (YYYY-MM-DD)
- `payment_date`: Date (YYYY-MM-DD)
- `method`: String (e.g., `upi`, `card`, `netbanking`)
- `status`: String (e.g., `settled`, `refunded`)

### B. `bank_statement` (Deliberately Messier)
Represents the raw, often chaotic export from a corporate bank account.
**Fields:**
- `transaction_date`: Date (YYYY-MM-DD)
- `description`: String (Free text. Often contains a truncated or reformatted UTR, e.g., "NEFT-AXIS000123-RAZORPAY", "UPI-123456789")
- `credit_amount`: Decimal (Amount hitting the bank)
- `reference_number`: String (May be truncated to the last 8-10 characters, dashes stripped, or have inconsistent casing)
- `value_date`: Date (YYYY-MM-DD)

### C. `internal_ledger` (Merchant's Own Records)
Represents the business's internal system of record for orders.
**Fields:**
- `order_id`: String (Must match the `order_id` in the settlement report)
- `customer_name`: String
- `amount_charged`: Decimal
- `order_date`: Date (YYYY-MM-DD)
- `order_status`: String (e.g., `paid`, `shipped`, `cancelled`)

## 2. Messiness Ratios (150 Total Settlement Records)
The synthetic data batch of exactly 150 settlement records must adhere to the following distribution to test the engine's 4 stages realistically:

- **80–85% Clean Match**: A clean one-to-one match. The UTR is present in both systems, though the bank side may be slightly reformatted (case changes, dashes stripped). Once normalized, these must pass the Stage 1 exact-match.
- **6–8% Batched Match**: A single bank credit equals the exact sum of 2–4 settlements credited on the exact same day.
- **4–6% Fuzzy Match**: The UTR is missing, garbled, or heavily truncated in the bank statement, but the amount is within ₹1 and the date is within 3 days.
- **4–6% True Exceptions**: These must fail matching and fall through to Stage 4. The data generator **MUST** include all of the following specific edge cases:
  - At least one settlement with *no matching bank credit* (simulating money in T+2/T+3 transit).
  - At least one bank credit with *no matching settlement* (simulating a late-landing or out-of-band settlement).
  - At least one refund reversal that produces a negative-amount adjustment on a later settlement.
  - At least one exact duplicate bank credit.
  - At least two `internal_ledger` orders with a charge but *no settlement record at all* (surfaced by the third join).

## 3. Ground Truth File
The `ground_truth.json` file is strictly for evaluation.
- **Content**: It maps every single settlement record ID to its *true* matching bank record ID. If it is a genuine exception, it maps to `null` alongside the *true* string reason for the exception.
- **Generation**: Generated concurrently at data-creation time; it is never inferred afterward.
- **Hard Rule**: This file must **never** be read by the matching engine. It exists solely for `eval_matching.py` to score the engine's real precision, recall, and F1 score against.

## 4. Realism Rules
- **UTR Shapes**: UTRs must resemble real Indian banking UTR shapes (e.g., bank-code prefix + numeric string like `HDFC000987654321`), never random UUIDs.
- **Settlement Cadence**: Settlement dates must follow a realistic T+2 cadence from the payment date.
- **Holiday Shifts**: The generator must inject occasional T+3/T+4 shifts simulating weekends and holidays. Use a small set of representative 2026 Indian holiday dates (e.g., Jan 26, Aug 15, Oct 2) so the forecast module in Phase F has a realistic pattern to learn from.
- **Amounts**: Amounts must look like real transaction amounts, containing a mix of round numbers (e.g., ₹1500.00) and paise-level precision (e.g., ₹1499.50), not just uniformly flat hundreds.

## 5. Generation Script Requirements
The data generation script (`generate_data.py`) must meet these requirements:
- **CLI Usage**: Must accept `--seed` (integer) and `--n_records` (integer, default 150).
- **Reproducibility**: Must be fully reproducible. Running the script twice with the same seed must produce the exact same byte-for-byte output.
- **Output**: Must generate all three CSV files (`settlement_report.csv`, `bank_statement.csv`, `internal_ledger.csv`) and the `ground_truth.json` file in a single run.

*Example CLI Usage (to be implemented in Phase A):*
`python generate_data.py --seed 42 --n_records 150`
