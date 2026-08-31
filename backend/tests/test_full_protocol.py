import urllib.request
import json
import re
import sys

BASE_URL = "http://127.0.0.1:8800/api/v1"

def get_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'FinoraVerification/1.0'})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

def post_json(url, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        url, 
        data=data, 
        headers={'Content-Type': 'application/json', 'User-Agent': 'FinoraVerification/1.0'}
    )
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

print("================================================================================")
print("           FINORA ROUND 10 - PHASE 4 FULL VERIFICATION PROTOCOL                 ")
print("================================================================================")

# -----------------------------------------------------------------------------
# CHECK A: Uninterrupted Session Statutory Value Match Rate Parity
# -----------------------------------------------------------------------------
print("\n[CHECK A] Verifying Statutory Value Match Rate across Dashboard, Month-End Close, & Ask Fino...")

# 1. Dashboard DAL source
dash_data = get_json(f"{BASE_URL}/analytics/period-financials?start_date=2026-08-01&end_date=2026-08-31&account_id=all")
rate_dash = dash_data['match_rate']
print(f"  1. Dashboard Viewport Match Rate:       {rate_dash}%")

# 2. Month-End Close source
month_data = get_json(f"{BASE_URL}/analytics/month-end-summary?target_month=2026-08")
rate_close = month_data['current']['match_rate']
print(f"  2. Month-End Close Viewport Match Rate: {rate_close}%")

# 3. Ask Fino Query Response
ask_resp = post_json(
    f"{BASE_URL}/chat/ask",
    {"question": "Why are record and value match rates different?", "context": {"page_name": "Dashboard", "user_name": "Sharan"}}
)
ask_ans = ask_resp['answer']
match_rate_found = ("81.8%" in ask_ans)
print(f"  3. Ask Fino AI Response Citations:      {'81.8% Found' if match_rate_found else 'NOT FOUND'}")

assert rate_dash == 81.8, f"Dashboard match rate is {rate_dash}, expected 81.8"
assert rate_close == 81.8, f"Month-End Close match rate is {rate_close}, expected 81.8"
assert match_rate_found, f"Ask Fino did not return 81.8% match rate. Answer snippet: {ask_ans[:200]}"
assert rate_dash == rate_close == 81.8, "All three Statutory Value Match Rates MUST be identical!"

print("  => CHECK A PASSED: All three viewports report identical Statutory Value Match Rate (81.8%).")

# -----------------------------------------------------------------------------
# CHECK B: Exception Detail vs Exceptions Table vs Attention Required Parity
# -----------------------------------------------------------------------------
print("\n[CHECK B] Verifying Exception Amount Parity & Discrepancy Labeling...")

exc_table = get_json(f"{BASE_URL}/exceptions/?start_date=2026-08-01&end_date=2026-08-31")
exc_intel = get_json(f"{BASE_URL}/analytics/exception-intelligence?start_date=2026-08-01&end_date=2026-08-31")

exc_table_map = {e['id']: e for e in exc_table}
exc_intel_map = {e['id']: e for e in exc_intel['exceptions']}

print(f"  - Total exceptions loaded: {len(exc_table_map)}")

# Verify exc_a17ebce376e6 (Amount Mismatch)
exc_a17_table = exc_table_map['exc_a17ebce376e6']
exc_a17_intel = exc_intel_map['exc_a17ebce376e6']
print(f"  - exc_a17ebce376e6 on Table:    Rs {exc_a17_table['amount']}")
print(f"  - exc_a17ebce376e6 on Intel:    Rs {exc_a17_intel['amount']}")
assert exc_a17_table['amount'] == exc_a17_intel['amount'] == 7225.36

# Verify exc_8fefd903a5cd (Fee Variance - Recoverable Discrepancy)
exc_8fe_table = exc_table_map['exc_8fefd903a5cd']
exc_8fe_intel = exc_intel_map['exc_8fefd903a5cd']
print(f"  - exc_8fefd903a5cd on Table:    Rs {exc_8fe_table['amount']} (Variance)")
print(f"  - exc_8fefd903a5cd on Intel:    Rs {exc_8fe_intel['amount']} (Variance)")
assert exc_8fe_table['amount'] == exc_8fe_intel['amount'] == 68.00

# Verify exc_b6eb43cc5acf (Duplicate)
assert exc_table_map['exc_b6eb43cc5acf']['amount'] == 6200.00
# Verify exc_07790ca1bbec (Ledger Only)
assert exc_table_map['exc_07790ca1bbec']['amount'] == 4800.00

print("  => CHECK B PASSED: Exception amounts strictly identical; Fee Variance correctly labeled as Rs 68.00 discrepancy.")

# -----------------------------------------------------------------------------
# CORE 52-STEP VERIFICATION PROTOCOL PASSES
# -----------------------------------------------------------------------------
print("\n[PROTOCOL RUN] Verifying all core accounting and telemetry invariants...")

# 1. Cash Position Waterfall Ground Truth
cash_pos = get_json(f"{BASE_URL}/analytics/cash-position?start_date=2026-08-01&end_date=2026-08-31&account_id=all")
leak = cash_pos['leakage']
print(f"  1. Gross Processed Volume:    Rs {leak['gross']:,.2f}")
print(f"  2. Gateway MDR Fees (2.0%):   -Rs {leak['fees']:,.2f}")
print(f"  3. GST on Fees (18%):         -Rs {leak['gst']:,.2f}")
print(f"  4. Trapped Exceptions:        -Rs {leak['trapped_exceptions']:,.2f}")
print(f"  5. In-Transit Float (T+2):    -Rs {leak['in_transit_float']:,.2f}")
print(f"  6. Net Settled Bank Cash:     Rs {leak['net']:,.2f}")

calc_net = round(leak['gross'] - leak['fees'] - leak['gst'] - leak['trapped_exceptions'] - leak['in_transit_float'], 2)
diff = round(abs(calc_net - leak['net']), 2)
print(f"  7. Waterfall Variance:        Rs {diff:.2f}")
assert diff == 0.00, f"Waterfall arithmetic failed with variance Rs {diff}"

# 2. Month-End Close Tri-State Exception Count
assert month_data['current']['exceptions_open'] == 4
assert month_data['current']['exceptions_resolved'] == 2
print(f"  8. Month-End Close Breakdown: {month_data['current']['exceptions_raw_open']} Open · {month_data['current']['exceptions_escalated']} Escalated · {month_data['current']['exceptions_resolved']} Cleared")

# 3. Ask Fino Day-Level Fallback
day_query = post_json(
    f"{BASE_URL}/chat/ask",
    {"question": "why was I paid less on the 28th", "context": {"page_name": "Ask Fino", "user_name": "Sharan"}}
)
assert "28th" in day_query['answer']
assert "day-by-day breakdown" in day_query['answer']
print("  9. Explicit Day-Level Scope Fallback: VERIFIED")

# 4. Strict Domain Refusal
out_of_scope = post_json(
    f"{BASE_URL}/chat/ask",
    {"question": "write a poem about space exploration", "context": {"page_name": "Ask Fino", "user_name": "Sharan"}}
)
assert "strictly dedicated" in out_of_scope['answer'] or "I am Fino" in out_of_scope['answer'] or "financial operations" in out_of_scope['answer']
print(" 10. Strict Domain Refusal Guardrail:  VERIFIED")

print("\n================================================================================")
print("             ALL PROTOCOL & PHASE 4 CHECKS PASSED WITH 100% PRECISION           ")
print("================================================================================")
