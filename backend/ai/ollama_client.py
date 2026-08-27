import requests
import json
from typing import List, Dict, Any

OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
MODEL_NAME = "gemma3:4b"

def build_system_prompt(tools_json: str, context: Optional[Dict[str, Any]] = None) -> str:
    ctx = context or {}
    user_name = ctx.get("user_name") or "Finance"
    page_name = ctx.get("page_name") or "Reconciliation & Treasury Dashboard"
    date_range = ctx.get("date_range", {})
    start_dt = date_range.get("start", "2026-08-01") if isinstance(date_range, dict) else "2026-08-01"
    end_dt = date_range.get("end", "2026-08-31") if isinstance(date_range, dict) else "2026-08-31"

    prompt = f"""You are Fino, Finora's Autonomous AI Financial Controller.
You are collaborating with {user_name}. Greet and address {user_name} naturally when appropriate.
Current active page view: {page_name}
Active reporting date range: {start_dt} to {end_dt}

INTERNAL REASONING ARCHITECTURE:
Internally, evaluate inquiries across four specialized reasoning capabilities before responding:
1. Reconciliation Brain: Grounded in deterministic SQLite 3-way matching and variance detection.
2. Forecast Brain: Grounded in stochastic Monte Carlo simulation and rolling T+2 liquidity float.
3. Compliance Brain: Grounded in statutory tax/GST rules (CGST Rule 36(4), TDS Section 194C, Ind AS 115).
4. Conversational Brain: Synthesizes specialist findings into one unified, clear response from Fino.

CRITICAL RULES:
- You answer questions using ONLY data verified through tool calls.
- You NEVER invent numbers, dates, UTRs, or record IDs.
- You format all currency in INR with ₹ and Indian comma grouping (e.g. ₹2,44,371.19).
- Maintain single persona: always respond as Fino, never mention "the brain says" to the user.
- If you don't have data for a question, state so honestly.

You have access to the following deterministic tools:
{tools_json}

To call a tool, you MUST output a JSON object in this exact format, and nothing else:
{{"tool_calls": [{{"name": "tool_name", "arguments": {{"arg1": "val1"}}}}]}}

If you are ready to answer {user_name}, output your answer directly as markdown text. DO NOT output JSON if you are answering the user."""
    return prompt

def chat_with_tools(messages: List[Dict[str, Any]], tools: List[Dict[str, Any]], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    # Inject tools and context into system prompt
    tools_json = json.dumps(tools, indent=2)
    sys_prompt = build_system_prompt(tools_json, context)
    
    # Ensure system prompt is the first message
    if not messages or messages[0].get("role") != "system":
        messages.insert(0, {"role": "system", "content": sys_prompt})
    else:
        messages[0]["content"] = sys_prompt

    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "options": {
            "temperature": 0.1
        },
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        data = response.json()
        
        # Parse manual tool calls from content
        content = data.get("message", {}).get("content", "").strip()
        
        # Strip markdown if present
        if content.startswith("```"):
            lines = content.split('\n')
            if len(lines) >= 2:
                content = '\n'.join(lines[1:-1]).strip()
        
        # Check if content is a JSON object with tool_calls
        if content.startswith("{") and content.endswith("}"):
            try:
                parsed = json.loads(content)
                if "tool_calls" in parsed:
                    # Map to expected format
                    calls = []
                    for c in parsed["tool_calls"]:
                        calls.append({
                            "function": {
                                "name": c.get("name"),
                                "arguments": c.get("arguments", {})
                            }
                        })
                    data["message"]["tool_calls"] = calls
            except:
                pass
                
        return data
    except Exception as e:
        print(f"Ollama API Error: {e}")
        return {"message": {"role": "assistant", "content": "I am unable to reach my language model backend right now."}}

def chat(messages: List[Dict[str, Any]]) -> Dict[str, Any]:
    # Ensure system prompt is the first message
    sys_prompt = SYSTEM_PROMPT.replace("{tools_json}", "[]")
    if not messages or messages[0].get("role") != "system":
        messages.insert(0, {"role": "system", "content": sys_prompt})
    else:
        messages[0]["content"] = sys_prompt # enforce permanent prompt
        
    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "options": {
            "temperature": 0.1
        },
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Ollama API Error: {e}")
        return {"message": {"role": "assistant", "content": "I am unable to reach my language model backend right now."}}
