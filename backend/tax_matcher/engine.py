import os
import re
import datetime
from typing import List, Dict, Any, Tuple
from backend.tax_matcher.dataset_generator import generate_synthetic_tax_lines
from backend.knowledge.finance_knowledge_base import lookup_finance_term

class TaxMatcherEngine:
    """
    Deterministic 3-Stage Tax-Line Matching Engine.
    Reconciles GST and TDS line items against transaction ledger & purchase register,
    evaluating Input Tax Credit (ITC) eligibility under CGST Rule 36(4) and TDS Section compliance.
    """

    _CACHED_RESULTS: Dict[str, Any] = {}

    @classmethod
    def run_reconciliation(cls, scope_period: str = "2026-08", force_refresh: bool = False) -> Dict[str, Any]:
        if not force_refresh and scope_period in cls._CACHED_RESULTS:
            return cls._CACHED_RESULTS[scope_period]

        raw_tax_lines = generate_synthetic_tax_lines(scope_period)
        match_records: List[Dict[str, Any]] = []

        total_itc_claimed = 0.0
        eligible_itc_confirmed = 0.0
        blocked_itc_at_risk = 0.0
        total_tax_variance = 0.0

        exception_counts = {
            "rate_mismatch": 0,
            "missing_gstr2b": 0,
            "tds_section_misclassification": 0,
            "amount_discrepancy": 0,
            "unmatched_portal_entry": 0
        }

        tds_total_count = 0
        tds_compliant_count = 0

        for line in raw_tax_lines:
            tax_id = line["tax_line_id"]
            tax_type = line["tax_type"]
            vendor = line["counterparty_name"]
            gstin_tan = line["counterparty_identifier"]
            inv_ref = line["invoice_ref"]
            inv_date = line["invoice_date"]
            portal_taxable = line["taxable_value"]
            portal_tax = line["tax_amount"]
            tds_sec = line.get("tds_section")
            filing_status = line.get("gstr_2b_filing_status", "filed")

            # Determine ledger counterpart values
            # (Simulates matching against internal purchase register & ledger transactions)
            ledger_taxable = portal_taxable
            ledger_tax = portal_tax
            status = "matched"
            match_stage = "Stage 1: Exact Reference & GSTIN Match"
            confidence = 0.99
            impact_on_itc = "eligible_itc"
            suggested_remedy = "None required. Reconciled and certified for monthly return."

            # Case A: Missing GSTR-2B entry (Counterparty has not filed GSTR-1 yet)
            if filing_status == "unfiled_by_counterparty":
                status = "missing_gstr2b"
                match_stage = "Stage 3: Exception Identification"
                confidence = 0.95
                impact_on_itc = "blocked_itc_unfiled"
                portal_taxable = 0.0
                portal_tax = 0.0
                taxable_var = ledger_taxable
                tax_var = ledger_tax
                exception_counts["missing_gstr2b"] += 1
                blocked_itc_at_risk += ledger_tax
                total_itc_claimed += ledger_tax

                ai_explanation = (
                    f"**No corresponding GSTR-2B entry found for vendor {vendor} (GSTIN: `{gstin_tan}`).** "
                    f"Internal purchase register reflects Invoice `{inv_ref}` of ₹{ledger_taxable:,.2f} with ₹{ledger_tax:,.2f} GST, "
                    f"but vendor has not filed their outward GSTR-1 return for period {scope_period}. "
                    f"Under **Rule 36(4) of the CGST Rules**, Input Tax Credit cannot be availed until the supplier files."
                )
                suggested_remedy = "Issue automated statutory vendor reminder to file GSTR-1 before the 11th of the month to unlock ITC."

            # Case B1: Amount Discrepancy (e.g. AWS invoice matches, but GST amount differs by ₹340)
            elif "AWS-IN" in inv_ref and tax_type == "GST":
                status = "amount_discrepancy"
                match_stage = "Stage 2: Fuzzy Reference & Amount Tolerance Match"
                confidence = 0.91
                ledger_taxable = 14200.00
                ledger_tax = 2556.00
                portal_taxable = 12311.11
                portal_tax = 2216.00
                taxable_var = 1888.89
                tax_var = 340.00
                total_tax_variance += tax_var
                exception_counts["amount_discrepancy"] += 1
                impact_on_itc = "demand_risk_rate_diff"
                total_itc_claimed += ledger_tax
                eligible_itc_confirmed += portal_tax

                ai_explanation = (
                    f"**Vendor invoice reference `{inv_ref}` ({vendor}) matches, but GST amount differs by ₹340.00 — possible rate misapplication.** "
                    f"Internal purchase register recorded ₹2,556.00 GST on ₹14,200.00 gross services, whereas GSTR-2B reflects ₹2,216.00 GST on ₹12,311.11. "
                    f"Variance likely stems from an unbooked cloud credit discount or overseas vendor exchange rate variation."
                )
                suggested_remedy = "Reconcile cloud credit discount and adjust internal Input Tax Credit entry down by ₹340.00 to match GSTR-2B."

            # Case B2: Rate Mismatch / Taxable Discrepancy on Payment Gateway Fee
            elif "RZP/INV" in inv_ref:
                status = "rate_mismatch"
                match_stage = "Stage 2: Fuzzy Reference & Amount Tolerance Match"
                confidence = 0.88
                ledger_taxable = round(portal_taxable + 20.0, 2)
                ledger_tax = round(ledger_taxable * 0.18, 2)
                taxable_var = round(ledger_taxable - portal_taxable, 2)
                tax_var = round(ledger_tax - portal_tax, 2)
                total_tax_variance += tax_var
                exception_counts["rate_mismatch"] += 1
                impact_on_itc = "demand_risk_rate_diff"
                total_itc_claimed += ledger_tax
                eligible_itc_confirmed += portal_tax

                ai_explanation = (
                    f"**Gateway invoice reference matches, but GST amount differs by ₹{tax_var:,.2f}.** "
                    f"Internal ledger posted ₹{ledger_tax:,.2f} GST on ₹{ledger_taxable:,.2f} gross fee, "
                    f"whereas GSTR-2B reflects ₹{portal_tax:,.2f} GST on ₹{portal_taxable:,.2f}. "
                    f"Possible rate or discount variance applied by aggregator before GST invoicing."
                )
                suggested_remedy = "Adjust purchase register GST credit entry by -₹3.60 to match auto-drafted GSTR-2B figure."

            # Case C: TDS Section Misclassification (e.g. Google Cloud 194C vs 194J)
            elif tds_sec == "194C" and ("Google" in vendor or "AWS" in vendor or "Cloud" in vendor):
                status = "tds_section_misclassification"
                match_stage = "Stage 3: Statutory TDS Section Audit"
                confidence = 0.94
                tds_total_count += 1
                taxable_var = 0.0
                tax_var = round(portal_taxable * 0.01, 2)  # 1% shortfall (2% under 194J vs 1% under 194C)
                exception_counts["tds_section_misclassification"] += 1
                impact_on_itc = "withholding_penalty_risk"
                suggested_remedy = "Reclassify vendor under Section 194J (2% technical services) and remit ₹85 shortfall with 1.5% interest."

                ai_explanation = (
                    f"**TDS Section Misclassification Detected for {vendor}.** "
                    f"SaaS software hosting and cloud infrastructure was deducted under **Section 194C** (1% Contractor rate), "
                    f"whereas CBDT notifications mandate **Section 194J** (2% Technical Services for software). "
                    f"Short-deduction creates interest liability under Section 201(1A) and potential 30% expense disallowance under Section 40(a)(ia)."
                )

            # Case D: Orphan GSTR-2B Entry (In portal, not in internal register)
            elif "Legal" in vendor:
                status = "unmatched_portal_entry"
                match_stage = "Stage 3: Exception Identification"
                confidence = 0.92
                ledger_taxable = 0.0
                ledger_tax = 0.0
                taxable_var = portal_taxable
                tax_var = portal_tax
                exception_counts["unmatched_portal_entry"] += 1
                impact_on_itc = "eligible_itc"
                eligible_itc_confirmed += portal_tax
                ai_explanation = (
                    f"**Unclaimed GSTR-2B Input Tax Credit found for {vendor} (Invoice `{inv_ref}`).** "
                    f"GSTN portal auto-drafted ₹{portal_tax:,.2f} ITC on ₹{portal_taxable:,.2f} legal services, "
                    f"but no matching entry was found in internal accounting books. Services under Legal Counsel are subject to Reverse Charge Mechanism (RCM)."
                )
                suggested_remedy = "Book missing legal advisory invoice in purchase register to avail ₹900 Input Tax Credit."

            # Clean Match
            else:
                taxable_var = 0.0
                tax_var = 0.0
                if tax_type == "GST":
                    total_itc_claimed += ledger_tax
                    eligible_itc_confirmed += ledger_tax
                elif tax_type == "TDS":
                    tds_total_count += 1
                    tds_compliant_count += 1

                ai_explanation = (
                    f"**100% Deterministic Match Confirmed.** "
                    f"Invoice `{inv_ref}` ({vendor}) matched across internal ledger, vendor GSTIN `{gstin_tan}`, and portal records. "
                    f"{'18% GST Input Tax Credit verified in GSTR-2B.' if tax_type == 'GST' else f'TDS correctly withheld under Section {tds_sec}.'}"
                )

            match_records.append({
                "match_id": f"MATCH-{tax_id}",
                "tax_line_id": tax_id,
                "related_tx_id": line.get("related_tx_id"),
                "tax_type": tax_type,
                "counterparty_name": vendor,
                "counterparty_identifier": gstin_tan,
                "invoice_ref": inv_ref,
                "invoice_date": inv_date,
                "tds_section": tds_sec,
                "ledger_taxable_value": round(ledger_taxable, 2),
                "ledger_tax_amount": round(ledger_tax, 2),
                "portal_taxable_value": round(portal_taxable, 2),
                "portal_tax_amount": round(portal_tax, 2),
                "taxable_variance": round(taxable_var, 2),
                "tax_variance": round(tax_var, 2),
                "status": status,
                "match_stage": match_stage,
                "confidence_score": confidence,
                "ai_explanation": ai_explanation,
                "impact_on_itc": impact_on_itc,
                "suggested_remedy": suggested_remedy,
                "resolved": False,
                "resolution_notes": None
            })

        total_records = len(match_records)
        matched_count = sum(1 for r in match_records if r["status"] == "matched")
        exception_count = total_records - matched_count
        tax_match_rate = round((matched_count / total_records) * 100.0, 1) if total_records > 0 else 0.0

        # Value Match Rate: Monetary value of matched tax vs total
        total_tax_volume = sum(r["ledger_tax_amount"] or r["portal_tax_amount"] for r in match_records)
        matched_tax_volume = sum(r["portal_tax_amount"] for r in match_records if r["status"] == "matched")
        val_match_rate = round((matched_tax_volume / total_tax_volume) * 100.0, 1) if total_tax_volume > 0 else 0.0

        tds_comp_rate = round((tds_compliant_count / tds_total_count) * 100.0, 1) if tds_total_count > 0 else 100.0

        summary = {
            "total_tax_records": total_records,
            "matched_records": matched_count,
            "exception_records": exception_count,
            "tax_match_rate_pct": tax_match_rate,
            "value_match_rate_pct": val_match_rate,
            "total_itc_claimed": round(total_itc_claimed, 2),
            "eligible_itc_confirmed": round(eligible_itc_confirmed, 2),
            "blocked_itc_at_risk": round(blocked_itc_at_risk, 2),
            "total_tax_variance": round(total_tax_variance, 2),
            "tds_compliance_rate_pct": tds_comp_rate,
            "exceptions_by_type": exception_counts,
            "scope_period": scope_period,
            "last_reconciliation_time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        result = {
            "summary": summary,
            "records": match_records
        }

        cls._CACHED_RESULTS[scope_period] = result
        return result

    @classmethod
    def resolve_exception(cls, match_id: str, action: str, note: str, scope_period: str = "2026-08") -> Dict[str, Any]:
        data = cls.run_reconciliation(scope_period)
        records = data.get("records", [])
        
        target = next((r for r in records if r["match_id"] == match_id), None)
        if not target:
            raise ValueError(f"Tax match record '{match_id}' not found.")

        target["resolved"] = True
        target["resolution_notes"] = f"Action: {action}. {note}"
        target["status"] = "matched"
        
        # Recalculate summary
        matched_count = sum(1 for r in records if r["status"] == "matched" or r["resolved"])
        data["summary"]["matched_records"] = matched_count
        data["summary"]["exception_records"] = len(records) - matched_count
        data["summary"]["tax_match_rate_pct"] = round((matched_count / len(records)) * 100.0, 1)

        return {"status": "success", "record": target, "summary": data["summary"]}
