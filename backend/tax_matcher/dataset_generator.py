import os
import sqlite3
import random
from typing import List, Dict, Any
from backend.db.sqlite_client import get_connection

def generate_synthetic_tax_lines(scope_period: str = "2026-08") -> List[Dict[str, Any]]:
    """
    Generates realistic GST & TDS tax lines paralleling the 42 core SQLite transactions,
    with deliberately injected real-world discrepancies (GSTR-2B unfiled breaks,
    taxable amount discrepancies, rate variances, and TDS section misclassifications).
    """
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT transaction_id, transaction_date, gross_amount, fee, gst, net_amount, bank_reference FROM transactions WHERE transaction_date LIKE ? ORDER BY transaction_date ASC", (f"{scope_period}%",))
    tx_rows = cur.fetchall()
    conn.close()

    tax_lines: List[Dict[str, Any]] = []
    line_seq = 1

    # 1. Generate GST Lines on Payment Gateway Processing Fees for Transactions
    for idx, tx in enumerate(tx_rows):
        tx_id = tx["transaction_id"]
        tx_date = tx["transaction_date"]
        fee = round(float(tx["fee"]), 2)
        gst = round(float(tx["gst"]), 2)
        bank_ref = tx["bank_reference"] or f"UTR{random.randint(10000000, 99999999)}"

        if fee <= 0:
            continue

        # Deterministically inject discrepancy on specific transactions
        # E.g. TXN with fee variance (TXN-2026-0814-41 or EXP-2026-8819)
        if "0814-41" in tx_id or idx == 14:
            # Rate mismatch on gateway invoice
            tax_lines.append({
                "tax_line_id": f"TAX-{scope_period.replace('-', '')}-{line_seq:04d}",
                "related_tx_id": tx_id,
                "tax_type": "GST",
                "counterparty_name": "Razorpay Software Pvt Ltd",
                "counterparty_identifier": "27AAACR7081K1Z2",
                "invoice_ref": f"RZP/INV/2026/{line_seq:04d}",
                "invoice_date": tx_date,
                "taxable_value": round(fee - 20.0, 2),
                "tax_rate": 18.0,
                "tax_amount": round((fee - 20.0) * 0.18, 2),
                "tds_section": None,
                "gstr_2b_filing_status": "filed",
                "tax_filing_period": scope_period,
                "source_portal": "GSTR-2B (GSTN Auto-Drafted)",
                "notes": "Invoice taxable value on portal is ₹20 lower than internal recorded gateway fee."
            })
        elif "0816-02" in tx_id or idx == 22:
            # Invoice reference mismatch (slash vs dash)
            tax_lines.append({
                "tax_line_id": f"TAX-{scope_period.replace('-', '')}-{line_seq:04d}",
                "related_tx_id": tx_id,
                "tax_type": "GST",
                "counterparty_name": "Razorpay Software Pvt Ltd",
                "counterparty_identifier": "27AAACR7081K1Z2",
                "invoice_ref": f"RZP-202608-{line_seq:04d}",
                "invoice_date": tx_date,
                "taxable_value": fee,
                "tax_rate": 18.0,
                "tax_amount": gst,
                "tds_section": None,
                "gstr_2b_filing_status": "filed",
                "tax_filing_period": scope_period,
                "source_portal": "GSTR-2B (GSTN Auto-Drafted)",
                "notes": "Exact amount match with normalized reference variant."
            })
        else:
            # Clean exact GST match
            tax_lines.append({
                "tax_line_id": f"TAX-{scope_period.replace('-', '')}-{line_seq:04d}",
                "related_tx_id": tx_id,
                "tax_type": "GST",
                "counterparty_name": "Razorpay Software Pvt Ltd",
                "counterparty_identifier": "27AAACR7081K1Z2",
                "invoice_ref": f"RZP/2026/08/{line_seq:04d}",
                "invoice_date": tx_date,
                "taxable_value": fee,
                "tax_rate": 18.0,
                "tax_amount": gst,
                "tds_section": None,
                "gstr_2b_filing_status": "filed",
                "tax_filing_period": scope_period,
                "source_portal": "GSTR-2B (GSTN Auto-Drafted)",
                "notes": "Verified 18% Input Tax Credit confirmed on GSTR-2B."
            })
        line_seq += 1

    # 2. Add Vendor Services GST & TDS Line Items
    vendor_items = [
        {
            "vendor": "Amazon Web Services India Pvt Ltd",
            "gstin": "27AAGCA1234F1Z8",
            "tan": "MUMA12345B",
            "inv": "AWS-IN-2026-0819",
            "date": "2026-08-03",
            "taxable": 12311.11,
            "gst_rate": 18.0,
            "tds_sec": "194J",
            "tds_rate": 2.0,
            "status": "filed",
            "anomaly": "amount_discrepancy"  # Invoice ref matches, GST differs by ₹340
        },
        {
            "vendor": "Delhivery Supply Chain Logistics Ltd",
            "gstin": "06AABCD9912K1Z9",
            "tan": "DELH98102C",
            "inv": "DLV/2026/08/991",
            "date": "2026-08-08",
            "taxable": 18400.00,
            "gst_rate": 18.0,
            "tds_sec": "194C",
            "tds_rate": 2.0,
            "status": "unfiled_by_counterparty",  # Missing in GSTR-2B
            "anomaly": "missing_gstr2b"
        },
        {
            "vendor": "Blue Dart Express Logistics",
            "gstin": "27AAACB1029R1ZV",
            "tan": "MUMB98102E",
            "inv": "BDE/2026-08/441",
            "date": "2026-08-14",
            "taxable": 15600.00,
            "gst_rate": 18.0,
            "tds_sec": "194C",
            "tds_rate": 2.0,
            "status": "filed",
            "anomaly": None
        },
        {
            "vendor": "Google Cloud India Pvt Ltd",
            "gstin": "29AAACG9612E1ZT",
            "tan": "BLRG98102A",
            "inv": "GCP/INV/2026/8812",
            "date": "2026-08-18",
            "taxable": 8500.00,
            "gst_rate": 18.0,
            "tds_sec": "194C",  # Misclassified! Should be 194J (2% tech) vs 194C (1% contractor)
            "tds_rate": 1.0,
            "status": "filed",
            "anomaly": "tds_misclassification"
        },
        {
            "vendor": "Pine Labs POS Terminal Services",
            "gstin": "07AAACP9912Q1ZL",
            "tan": "DELP99102X",
            "inv": "PINE/POS/2026/08",
            "date": "2026-08-12",
            "taxable": 1000.00,
            "gst_rate": 18.0,
            "tds_sec": "194H",
            "tds_rate": 2.0,
            "status": "filed",
            "anomaly": None
        },
        {
            "vendor": "Mehta & Partners Legal & Tax LLP",
            "gstin": "27AABCM9921D1ZO",
            "tan": "MUMM99210F",
            "inv": "MP/LEGAL/2026/104",
            "date": "2026-08-25",
            "taxable": 5000.00,
            "gst_rate": 18.0,
            "tds_sec": "194J",
            "tds_rate": 10.0,
            "status": "filed",
            "anomaly": "unmatched_portal_entry"  # In portal, not in internal register
        }
    ]

    for v in vendor_items:
        # GST line
        gst_amt = round(v["taxable"] * (v["gst_rate"] / 100.0), 2)
        tax_lines.append({
            "tax_line_id": f"TAX-{scope_period.replace('-', '')}-{line_seq:04d}",
            "related_tx_id": None,
            "tax_type": "GST",
            "counterparty_name": v["vendor"],
            "counterparty_identifier": v["gstin"],
            "invoice_ref": v["inv"],
            "invoice_date": v["date"],
            "taxable_value": v["taxable"],
            "tax_rate": v["gst_rate"],
            "tax_amount": gst_amt,
            "tds_section": None,
            "gstr_2b_filing_status": v["status"],
            "tax_filing_period": scope_period,
            "source_portal": "GSTR-2B (GSTN Auto-Drafted)",
            "notes": f"Vendor GST invoice for {v['vendor']}."
        })
        line_seq += 1

        # TDS line
        if v.get("tds_sec"):
            tds_amt = round(v["taxable"] * (v["tds_rate"] / 100.0), 2)
            tax_lines.append({
                "tax_line_id": f"TAX-{scope_period.replace('-', '')}-{line_seq:04d}",
                "related_tx_id": None,
                "tax_type": "TDS",
                "counterparty_name": v["vendor"],
                "counterparty_identifier": v["tan"],
                "invoice_ref": v["inv"],
                "invoice_date": v["date"],
                "taxable_value": v["taxable"],
                "tax_rate": v["tds_rate"],
                "tax_amount": tds_amt,
                "tds_section": v["tds_sec"],
                "gstr_2b_filing_status": "filed",
                "tax_filing_period": scope_period,
                "source_portal": "TRACES (Form 26AS / 27Q)",
                "notes": f"Statutory TDS withholding under Section {v['tds_sec']}."
            })
            line_seq += 1

    return tax_lines
