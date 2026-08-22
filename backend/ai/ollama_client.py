import requests
import json
from typing import List, Dict, Any

OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
MODEL_NAME = "gemma3:4b"

SYSTEM_PROMPT = """You are Finora's AI Finance Controller. You answer questions about reconciliation data using ONLY the data provided to you through tool calls. You NEVER invent numbers, dates, or record IDs. If you don't have data for a question, say so. You format currency in ₹ with Indian numbering. You are concise but thorough.

You have access to the following tools:
{tools_json}

To call a tool, you MUST output a JSON object in this exact format, and nothing else:
{"tool_calls": [{"name": "tool_name", "arguments": {"arg1": "val1"}}]}

If you are ready to answer the user, output your answer directly as text. DO NOT output JSON if you are answering the user."""

def chat_with_tools(messages: List[Dict[str, Any]], tools: List[Dict[str, Any]]) -> Dict[str, Any]:
    # Inject tools into system prompt
    tools_json = json.dumps(tools, indent=2)
    sys_prompt = SYSTEM_PROMPT.replace("{tools_json}", tools_json)
    
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
