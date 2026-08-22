import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.firestore_client import get_exceptions, update_exception_ai_summary

def run_summarizer():
    exceptions = get_exceptions()
    count = 0
    
    for ex in exceptions:
        if ex.get("ai_summary"):
            continue
            
        reason = ex.get("reason", "unknown")
        amount = ex.get("amount", 0.0)
        settlement_id = ex.get("related_settlement_id", "Unknown")
        created_at = ex.get("created_at", "")
        
        # Simple rule-based grounded generation
        if reason == "no_bank_credit_found":
            summary = f"Settlement {settlement_id} for ₹{amount:,.2f} shows no matching bank credit as of {created_at[:10]}, likely in T+2 transit."
        elif reason == "fee_variance":
            summary = f"Settlement {settlement_id} has a fee variance exception of ₹{amount:,.2f}."
        elif reason == "no_settlement_found":
            summary = f"Bank credit of ₹{amount:,.2f} on {created_at[:10]} shows no matching settlement."
        elif reason == "no_settlement_for_order":
            summary = f"Ledger entry shows no matching settlement for ₹{amount:,.2f}."
        else:
            summary = f"Exception {ex.get('id')} flagged for {reason} concerning ₹{amount:,.2f}."
            
        # Update
        if ex.get("id"):
            update_exception_ai_summary(ex["id"], summary)
            count += 1
            print(f"Generated summary for {ex['id']}: {summary}")
            
    print(f"Finished generating {count} summaries.")

if __name__ == "__main__":
    # If FIRESTORE_EMULATOR_HOST is set, this automatically connects to emulator
    if "FIRESTORE_EMULATOR_HOST" not in os.environ:
        os.environ["FIRESTORE_EMULATOR_HOST"] = "127.0.0.1:8080"
    run_summarizer()
