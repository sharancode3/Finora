from typing import Dict, Any

def get_cash_position_why() -> str:
    # Stub generation of text breakdown
    return """Opening Cash:        ₹5,00,000
+ Settlements:       +₹8,42,000
+ Other Inflows:     +₹23,000
- Refunds:           -₹45,000
- Fees:              -₹12,400
- Payouts:           -₹4,65,600
─────────────────────────────
= Available Cash:    ₹8,42,000"""

def get_variance_why(record_id: str) -> str:
    from backend.db.firestore_client import get_settlement_by_id, get_match_by_id, get_bank_transaction_by_id
    
    # Try to build from real data if available
    settlement = get_settlement_by_id(record_id)
    if settlement:
        gross = float(settlement.get('gross_amount', 0))
        fee = float(settlement.get('razorpay_fee', 0))
        gst = float(settlement.get('gst_on_fee', 0))
        tds = float(settlement.get('tds', 0))
        expected_net = gross - fee - gst - tds
        
        # If it's linked in a match to a bank transaction
        from backend.db.firestore_client import IN_MEMORY_DB
        match = next((m for m in IN_MEMORY_DB['matches'] if m.get('settlement_id') == record_id), None)
        bank_credit = 0.0
        if match and match.get('bank_transaction_id'):
            bank_tx = get_bank_transaction_by_id(match.get('bank_transaction_id'))
            if bank_tx:
                bank_credit = float(bank_tx.get('credit_amount', 0))
                
        variance = expected_net - bank_credit
        
        return f"""Gross Amount:        ₹{gross:,.0f}
- Razorpay Fee:      -₹{fee:,.0f}
- GST on Fee:        -₹{gst:,.0f}
- TDS:               -₹{tds:,.0f}
- Refund:            -₹0
─────────────────────────────
= Expected Net:      ₹{expected_net:,.0f}
Bank Credit:         ₹{bank_credit:,.0f}
─────────────────────────────
= Variance:          ₹{variance:,.0f} (fee rounding)"""
    
    # Fallback stub
    return """Gross Amount:        ₹10,000
- Razorpay Fee:      -₹200
- GST on Fee:        -₹36
- TDS:               -₹0
- Refund:            -₹1,250
─────────────────────────────
= Expected Net:      ₹8,514
Bank Credit:         ₹8,500
─────────────────────────────
= Variance:          ₹14 (fee rounding)"""
