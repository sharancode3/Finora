import io
from typing import Dict, Any, List

SAMPLE_HDFC_CSV = """Date,Narration,Chq/Ref No,Value Dt,Withdrawal Amt,Deposit Amt,Closing Balance
01/08/2026,OPENING BALANCE B/F,,,,,"4,12,850.00"
02/08/2026,ACH D- CMS/RAZORPAY TECH/PAY-00289,CMS009819280,02/08/2026,,"1,69,856.12","5,82,706.12"
03/08/2026,INF/NEFT/00291038192/AWS INDIA CLOUD SVCS,NEFT00291038,03/08/2026,"14,200.00",,"5,68,506.12"
05/08/2026,CHG: CONSOLIDATED CHARGES FOR JUL26+GST,CHG99210084,05/08/2026,"236.00",,"5,68,270.12"
07/08/2026,TIN-NSDL/CHALLAN 281/TDS 194C/AUG2026,CIN981029102,07/08/2026,"8,450.00",,"5,59,820.12"
10/08/2026,ACH C- PAYPAL INWARD REMITTANCE/USD SETTLE,PAYPAL98102,10/08/2026,,"44,205.76","6,04,025.88"
12/08/2026,POS RENTAL CHARGES FOR 2 TERMINALS+18% GST,POS88192019,12/08/2026,"1,180.00",,"6,02,845.88"
14/08/2026,IMPS/P2A/622718910291/VENDOR BLUEDART LOGISTICS,UTR981290312,14/08/2026,"18,400.00",,"5,84,445.88"
16/08/2026,ACH D- CMS/RAZORPAY TECH/PAY-00290,CMS009819291,16/08/2026,,"44,205.76","6,28,651.64"
18/08/2026,UPI/MERCHANT-RECEIPT/623100819201/SWIGGY STORE,UPI623100819,18/08/2026,,"12,450.00","6,41,101.64"
21/08/2026,CHQ RTN CHG: INSUFFICIENT FUNDS CLG 48192,CHQRET88192,21/08/2026,"590.00",,"6,40,511.64"
24/08/2026,AMB NON-MAINTENANCE CHARGE Q1-26+GST,AMB88192011,24/08/2026,"708.00",,"6,39,803.64"
28/08/2026,ACH D- CMS/RAZORPAY TECH/PAY-00291,CMS009819292,28/08/2026,,"25,916.63","6,65,720.27"
30/08/2026,INT.PD: CREDIT INTEREST TO CURRENT ACCT,INTPD992100,30/08/2026,,"1,420.00","6,67,140.27"
"""

SAMPLE_ICICI_TEXT = """ICICI BANK LIMITED - STATEMENT OF ACCOUNT
Account Name: FINORA ENTERPRISES PVT LTD
Account Number: 000405019284 (Current Account - INR)
Branch: Nariman Point, Mumbai
Statement Period: 01-Aug-2026 to 31-Aug-2026

Date        Particulars / Description                      Ref / Cheque No    Withdrawals (Dr)    Deposits (Cr)       Balance
-----------------------------------------------------------------------------------------------------------------------------
01/08/2026  B/F OPENING BALANCE                            -                                      -                   5,20,000.00
03/08/2026  CMS/KOTAK-SETTLEMENT-ROUTE/SETTLE-AUG01        CMS9810291         -                   1,69,856.12         6,89,856.12
05/08/2026  ICEGATE GSTN MONTHLY E-PAYMENT CGST/SGST       GST9910281         28,400.00           -                   6,61,456.12
08/08/2026  CONSOLIDATED FOLIO & LEDGER MAINTENANCE CHGS   CHG0029101         354.00              -                   6,61,102.12
12/08/2026  NEFT/OUTWARD/DELHIVERY SUPPLY CHAIN LOGISTICS  NEFT8819201        22,500.00           -                   6,38,602.12
15/08/2026  CMS/RAZORPAY-SETTLEMENT/BATCH-20260815         CMS9812992         -                   65,322.39           7,03,924.51
19/08/2026  OUTWARD FOREX TT COMMISSION + 18% GST          FX88102910         1,416.00            -                   7,02,508.51
22/08/2026  SALARY DISBURSEMENT BATCH AUGUST 2026          SAL9810291         1,85,000.00         -                   5,17,508.51
25/08/2026  INWARD NEFT REMITTANCE/CLIENT ENTERPRISE INVOICE NEFT9921008       -                   75,000.00           5,92,508.51
28/08/2026  MONTHLY CURRENT ACC AMB PENALTY CHG            AMB0091820         472.00              -                   5,92,036.51
30/08/2026  ANNUAL CORPORATE DEBIT CARD FEE + GST          DC88192019         590.00              -                   5,91,446.51
-----------------------------------------------------------------------------------------------------------------------------
Total Withdrawals: INR 2,38,732.00 | Total Deposits: INR 3,10,178.51 | Closing Balance: INR 5,91,446.51
"""

def get_sample_statements() -> List[Dict[str, Any]]:
    return [
        {
            "id": "sample_hdfc_csv",
            "name": "HDFC Bank Business Current Statement (August 2026)",
            "format": "CSV",
            "size": "1.4 KB",
            "description": "Standard HDFC Bank current account statement showing Razorpay settlements, PayPal remittances, AWS SaaS debits, and consolidated charges with GST.",
            "content": SAMPLE_HDFC_CSV
        },
        {
            "id": "sample_icici_pdf",
            "name": "ICICI Corporate Treasury Statement (August 2026)",
            "format": "PDF / Text",
            "size": "2.1 KB",
            "description": "ICICI Corporate banking account statement with ICEGATE GSTN tax payments, forex commissions, and AMB ledger charges.",
            "content": SAMPLE_ICICI_TEXT
        }
    ]
