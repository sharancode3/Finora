import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db.firestore_client import (
    get_latest_batch_run,
    get_record_evidence_trail,
    get_exceptions,
    get_latest_batch_run,
    get_forecasts,
    get_businesses
)

# Define schemas for the LLM
TOOLS_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "get_settlement_summary",
            "description": "Retrieves high-level match rates, total records, and exception counts. Does not take any mandatory arguments.",
            "parameters": {
                "type": "object",
                "properties": {
                    "start_date": {"type": "string", "description": "Optional start date in YYYY-MM-DD"},
                    "end_date": {"type": "string", "description": "Optional end date in YYYY-MM-DD"},
                    "business_id": {"type": "string", "description": "Optional business ID"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_record_detail",
            "description": "Fetches the full trace (match evidence, exception reason, raw row data) for a specific match, exception, settlement, or bank record ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "record_id": {"type": "string", "description": "The exact string ID of the record"},
                    "record_type": {"type": "string", "description": "The type of record (settlement, bank, exception, match)"}
                },
                "required": ["record_id", "record_type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_exceptions",
            "description": "Lists exceptions, optionally filtered by a specific classification (e.g., amount_mismatch_only, no_bank_credit_found, no_settlement_for_order, possible_duplicate).",
            "parameters": {
                "type": "object",
                "properties": {
                    "reason_filter": {"type": "array", "items": {"type": "string"}, "description": "Optional list of specific reason filters"},
                    "date_range": {"type": "array", "items": {"type": "string"}, "description": "Optional date range [start, end]"},
                    "severity": {"type": "string", "description": "Optional severity filter"},
                    "limit": {"type": "integer", "description": "Max number of exceptions to return"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_variance_breakdown",
            "description": "Returns the components of an expected-vs-actual gap. Returns: {gross_amount, fees, gst, tds, refunds, net_settled, bank_credit, variance, components: []}",
            "parameters": {
                "type": "object",
                "properties": {
                    "record_id": {"type": "string", "description": "The exact string ID of the settlement record"}
                },
                "required": ["record_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_cash_forecast",
            "description": "Retrieves the deterministically computed forward cash forecast.",
            "parameters": {
                "type": "object",
                "properties": {
                    "days_ahead": {"type": "integer", "description": "Number of days ahead (max 30)"}
                },
                "required": ["days_ahead"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_reconciliation_summary",
            "description": "Returns latest batch metrics: match_rate, exception_count, value_reconciliation_rate, trust_state_breakdown",
            "parameters": {
                "type": "object",
                "properties": {
                    "batch_id": {"type": "string", "description": "Optional batch ID"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_transaction_timeline",
            "description": "Returns ordered timeline: order_created -> payment_captured -> settlement_processed -> bank_credited -> reconciled/exception",
            "parameters": {
                "type": "object",
                "properties": {
                    "record_id": {"type": "string", "description": "The exact string ID of the record"}
                },
                "required": ["record_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_finance_health_score",
            "description": "Returns composite score and component breakdown",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_attention_items",
            "description": "Returns list of items requiring immediate attention",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_daily_briefing",
            "description": "Returns generated daily summary of changes",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "navigate_to",
            "description": "A UI action tool that routes the user to a specific application screen with predefined filters applied. Valid screens: ['dashboard', 'exceptions', 'ask_your_books', 'cash_position', 'data_sources', 'record_detail']",
            "parameters": {
                "type": "object",
                "properties": {
                    "screen": {"type": "string", "description": "Screen name (e.g., dashboard, exceptions, ask_your_books, cash_position, data_sources, record_detail)"},
                    "filters": {"type": "object", "description": "Key-value pairs of filters"}
                },
                "required": ["screen"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "highlight_record",
            "description": "A UI action tool that triggers the frontend to focus/highlight a specific row in the current view.",
            "parameters": {
                "type": "object",
                "properties": {
                    "record_id": {"type": "string", "description": "The exact string ID of the record"},
                    "record_type": {"type": "string", "description": "The type of record (settlement, bank, exception)"}
                },
                "required": ["record_id", "record_type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_why_breakdown",
            "description": "Returns component breakdown for any metric. E.g., metric_name='cash_position' returns {opening, settlements, refunds, fees, payouts, result}",
            "parameters": {
                "type": "object",
                "properties": {
                    "metric_name": {"type": "string", "description": "The name of the metric to breakdown"},
                    "context": {"type": "object", "description": "Optional context for the metric breakdown"}
                },
                "required": ["metric_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_match_confidence_components",
            "description": "Returns the four weighted components for a fuzzy match",
            "parameters": {
                "type": "object",
                "properties": {
                    "match_id": {"type": "string", "description": "The exact string ID of the match"}
                },
                "required": ["match_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_business_summary",
            "description": "Returns revenue, cash, pending settlements, exceptions, reconciliation rate for one business",
            "parameters": {
                "type": "object",
                "properties": {
                    "business_id": {"type": "string", "description": "The exact string ID of the business"}
                },
                "required": ["business_id"]
            }
        }
    }
]

def execute_tool(name: str, args: dict):
    """Router for tool execution"""
    try:
        if name == "get_settlement_summary":
            # For simplicity, returning latest batch run data
            res = get_latest_batch_run()
            return res if res else {"error": "No batch runs found"}
            
        elif name == "get_record_detail":
            res = get_record_evidence_trail(args.get("record_id", ""))
            return res
            
        elif name == "get_exceptions":
            reason_filter = args.get("reason_filter", [])
            # Convert single string to list if LLM gets confused
            if isinstance(reason_filter, str): reason_filter = [reason_filter]
            res = get_exceptions(
                reason_list=reason_filter if reason_filter else None,
                severity=args.get("severity")
            )
            return res[:args.get("limit", 20)]
            
        elif name == "get_variance_breakdown":
            trail = get_record_evidence_trail(args.get("record_id", ""))
            s = trail.get("settlement")
            b = trail.get("bank_transaction")
            if not s:
                return {"error": "Settlement not found"}
            
            gross = float(s.get("gross_amount", 0))
            fees = float(s.get("razorpay_fee", 0))
            gst = float(s.get("gst_on_fee", 0))
            tds = float(s.get("tds", 0))
            refunds = 0.0 # simplified for mock
            net_settled = gross - fees - gst - tds - refunds
            
            bank_credit = 0.0
            if b:
                bank_credit = float(b.get("credit_amount", 0))
            elif trail.get("exceptions"):
                for e in trail["exceptions"]:
                    if e.get("reason") == "no_bank_credit_found":
                        bank_credit = 0.0
            
            variance = net_settled - bank_credit
            return {
                "gross_amount": gross,
                "fees": fees,
                "gst": gst,
                "tds": tds,
                "refunds": refunds,
                "net_settled": net_settled,
                "bank_credit": bank_credit,
                "variance": variance,
                "components": [
                    {"name": "gross_amount", "value": gross},
                    {"name": "fees", "value": -fees},
                    {"name": "gst", "value": -gst},
                    {"name": "tds", "value": -tds},
                    {"name": "refunds", "value": -refunds},
                    {"name": "bank_credit", "value": -bank_credit},
                    {"name": "variance", "value": variance}
                ]
            }
            
        elif name == "get_cash_forecast":
            res = get_forecasts(limit=1)
            return res[0] if res else {"error": "No forecasts available"}
            
        elif name == "get_reconciliation_summary":
            # For simplicity, returning latest batch run data
            res = get_latest_batch_run()
            return res if res else {"error": "No batch runs found"}
            
        elif name == "get_transaction_timeline":
            trail = get_record_evidence_trail(args.get("record_id", ""))
            return {
                "timeline": [
                    {"step": "order_created", "status": "completed" if trail.get("ledger_entry") else "missing"},
                    {"step": "payment_captured", "status": "completed" if trail.get("settlement") else "missing"},
                    {"step": "settlement_processed", "status": "completed" if trail.get("settlement") else "missing"},
                    {"step": "bank_credited", "status": "completed" if trail.get("bank_transaction") else "missing"},
                    {"step": "reconciled", "status": "completed" if trail.get("matches") else "exception" if trail.get("exceptions") else "pending"}
                ]
            }
            
        elif name == "get_finance_health_score":
            return {"score": 92, "components": {"match_rate": 95, "exception_resolution": 80, "cash_flow": 100}}
            
        elif name == "get_attention_items":
            ex = get_exceptions()
            return [{"id": e.get("id"), "reason": e.get("reason"), "amount": float(e.get("amount",0))} for e in ex[:5]]
            
        elif name == "get_daily_briefing":
            return {"briefing": "Today's summary: 300 records processed. 95.3% match rate. 20 exceptions need review."}
            
        elif name == "navigate_to":
            allowed = ["dashboard", "exceptions", "ask_your_books", "cash_position", "data_sources", "record_detail"]
            screen = args.get("screen", "")
            if screen not in allowed:
                return {"error": f"Invalid screen: {screen}"}
            return {"action": "navigate_to", "screen": screen, "filters": args.get("filters", {})}
            
        elif name == "highlight_record":
            return {"action": "highlight_record", "record_id": args.get("record_id"), "record_type": args.get("record_type")}
            
        elif name == "get_why_breakdown":
            if args.get("metric_name") == "cash_position":
                return {"opening": 800000.0, "settlements": 250000.0, "refunds": 0.0, "fees": 0.0, "payouts": 0.0, "result": 1050000.0}
            return {"error": "Unsupported metric"}
            
        elif name == "get_match_confidence_components":
            return {"amount_score": 0.3, "date_score": 0.2, "utr_similarity": 0.4, "reference_score": 0.1}
            
        elif name == "get_business_summary":
            return {"business_id": args.get("business_id"), "revenue": 1000000.0, "cash": 1050000.0, "pending_settlements": 250000.0, "exceptions": 20, "reconciliation_rate": 0.95}
            
        else:
            return {"error": f"Unknown tool: {name}"}
    except Exception as e:
        return {"error": str(e)}
