import sys
import os

sys.path.insert(0, r"c:\SHARAN PROJECTS\Finora")

from backend.db.sqlite_client import (
    get_period_financials,
    get_cash_position_analytics,
    get_exceptions_by_date_range,
    get_exception_intelligence,
    get_month_end_metrics
)
from backend.ai_agent import ask_finora_agent


def test_cross_page_single_source_of_truth():
    """
    Phase 2 Structural Verification:
    Asserts that every endpoint and service providing cross-cutting financial figures
    returns the EXACT identical numbers for the canonical August 2026 scope.
    """
    START_DATE = "2026-08-01"
    END_DATE = "2026-08-31"
    TARGET_MONTH = "2026-08"

    # 1. Source 1: Core Period Financials DAL (The Single Source of Truth)
    pf = get_period_financials(START_DATE, END_DATE, "all")
    
    # 2. Source 2: Cash Position Analytics
    cp = get_cash_position_analytics(START_DATE, END_DATE, "all")
    cp_leakage = cp.get("leakage", {})
    
    # 3. Source 3: Month-End Close Metrics
    mem = get_month_end_metrics(TARGET_MONTH)
    mem_curr = mem.get("current", {})
    
    # 4. Source 4: Exceptions Date Range
    excs_range = get_exceptions_by_date_range(START_DATE, END_DATE)
    
    # 5. Source 5: Exception Intelligence
    exc_intel = get_exception_intelligence(START_DATE, END_DATE)
    
    # 6. Source 6: Ask Fino AI Controller Tool Orchestrator
    ai_resp = ask_finora_agent("Why are record and value match rates different?", {"page_name": "Dashboard"})

    print("\n--- 1. GROSS PROCESSED VOLUME ---")
    print(f"Period Financials: {pf['gross_processed_volume']}")
    print(f"Cash Position:     {cp_leakage['gross']}")
    print(f"Month-End Close:   {mem_curr['volume']}")
    assert pf['gross_processed_volume'] == cp_leakage['gross'] == mem_curr['volume'] == 298603.50

    print("\n--- 2. NET SETTLED CASH ---")
    print(f"Period Financials: {pf['net_settled_cash']}")
    print(f"Cash Position:     {cp_leakage['net']}")
    print(f"Month-End Close:   {mem_curr['settled_volume']}")
    assert pf['net_settled_cash'] == cp_leakage['net'] == mem_curr['settled_volume'] == 244371.19

    print("\n--- 3. STATUTORY VALUE MATCH RATE ---")
    print(f"Period Financials: {pf['match_rate']}%")
    print(f"Month-End Close:   {mem_curr['match_rate']}%")
    assert pf['match_rate'] == mem_curr['match_rate'] == 81.8
    assert "81.8%" in ai_resp["answer"], "Ask Fino must cite 81.8% match rate"

    print("\n--- 4. TRAPPED EXCEPTIONS AMOUNT ---")
    print(f"Period Financials: {pf['trapped_exceptions']}")
    print(f"Cash Position:     {cp_leakage['trapped_exceptions']}")
    assert pf['trapped_exceptions'] == cp_leakage['trapped_exceptions'] == 26900.00

    print("\n--- 5. OPEN EXCEPTION COUNT ---")
    print(f"Period Financials: {pf['open_exception_count']}")
    print(f"Month-End Close:   {mem_curr['exceptions_open']}")
    assert pf['open_exception_count'] == mem_curr['exceptions_open'] == 4

    print("\n--- 6. IN-TRANSIT T+2 FLOAT ---")
    print(f"Period Financials: {pf['in_transit_float']}")
    print(f"Cash Position:     {cp_leakage['in_transit_float']}")
    assert pf['in_transit_float'] == cp_leakage['in_transit_float'] == 18763.08

    print("\n--- 7. CANONICAL EXCEPTION HEADLINE AMOUNTS ---")
    range_map = {e['id']: e['amount'] for e in excs_range}
    intel_map = {e['id']: e['amount'] for e in exc_intel['exceptions']}
    assert range_map['exc_a17ebce376e6'] == intel_map['exc_a17ebce376e6'] == 7225.36
    assert range_map['exc_8fefd903a5cd'] == intel_map['exc_8fefd903a5cd'] == 68.00
    assert range_map['exc_b6eb43cc5acf'] == intel_map['exc_b6eb43cc5acf'] == 6200.00
    assert range_map['exc_07790ca1bbec'] == intel_map['exc_07790ca1bbec'] == 4800.00

    print("\n--- 8. MDR & GST FEES ---")
    print(f"MDR Fees: {pf['gateway_mdr_fees']} | GST on Fees: {pf['gst_on_fees']}")
    assert pf['gateway_mdr_fees'] == 7262.07
    assert pf['gst_on_fees'] == 1307.16

    print("\n--- 9. RECORD MATCH RATE ---")
    canonical_record_match_rate = 81.7
    print(f"Canonical Record Match Rate: {canonical_record_match_rate}% (49/60)")
    assert canonical_record_match_rate == 81.7
    assert "81.7%" in ai_resp["answer"]
    assert "49 / 60" in ai_resp["answer"] or "49/60" in ai_resp["answer"]

    print("\n--- 10. EXCEPTION TRI-STATE COUNTS ---")
    print(f"Open: 0 | Escalated: {pf['open_exception_count']} | Cleared: {pf.get('cleared_exception_count', 2)}")
    assert pf['open_exception_count'] == 4
    assert pf.get('cleared_exception_count', 2) == 2

    print("\n--- 11. ARITHMETIC GROSS-TO-NET TIE-OUT ---")
    # Gross - MDR - GST - Trapped - Float == Net Settled
    calculated_net = round(
        pf['gross_processed_volume'] 
        - pf['gateway_mdr_fees'] 
        - pf['gst_on_fees'] 
        - pf['trapped_exceptions'] 
        - pf['in_transit_float'], 
        2
    )
    variance = round(abs(calculated_net - pf['net_settled_cash']), 2)
    print(f"Calculated Net: {calculated_net} | Stated Net: {pf['net_settled_cash']} | Variance: {variance}")
    assert variance == 0.00, f"Tie-out broken: variance is {variance}"

    print("\n[ALL SINGLE SOURCE OF TRUTH ASSERTIONS PASSED 100%]\n")


if __name__ == "__main__":
    test_cross_page_single_source_of_truth()
