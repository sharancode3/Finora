import sys
import os
import json
from datetime import datetime
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai.ollama_client import chat_with_tools, chat
from ai.tools import TOOLS_SCHEMA, execute_tool
from ai.verifier import Verifier
from db.firestore_client import write_verifier_rejection, write_chat_history

verifier = Verifier()

def extract_ui_action(tool_calls):
    for call in tool_calls:
        if call.get("function", {}).get("name") in ["navigate_to", "highlight_record"]:
            try:
                args = json.loads(call.get("function", {}).get("arguments", "{}"))
                action_type = call["function"]["name"]
                return {"type": action_type, **args}
            except:
                pass
    return None

def extract_record_ids(tool_results):
    ids = []
    def traverse(obj):
        if isinstance(obj, dict):
            for k, v in obj.items():
                if k in ["id", "payment_id", "business_id", "order_id", "batch_id", "record_id"] and isinstance(v, str):
                    if v not in ids:
                        ids.append(v)
                traverse(v)
        elif isinstance(obj, list):
            for item in obj:
                traverse(item)
    traverse(tool_results)
    return ids

def process_question(question: str, session_id: str = None) -> dict:
    # Step 1: Model decides which tool(s) to call
    initial_messages = [{"role": "user", "content": question}]
    res = chat_with_tools(initial_messages, TOOLS_SCHEMA)
    msg = res.get("message", {})
    
    tool_calls = msg.get("tool_calls", [])
    
    # Step 2: Execute tools sequentially
    tool_results = []
    for call in tool_calls:
        name = call["function"]["name"]
        try:
            args = call["function"]["arguments"]
            # Ollama might return args as dict or JSON string
            if isinstance(args, str):
                args = json.loads(args)
        except:
            args = {}
        
        result = execute_tool(name, args)
        tool_results.append(result)

    # Step 3: Model drafts answer from tool results
    context_msg = f"User Question: {question}\nTool Results:\n{json.dumps(tool_results)}"
    
    if not tool_calls:
        # If it didn't call any tools, it's drafting immediately from internal knowledge. 
        # But our system prompt says "If you don't have data, say so."
        draft_answer = msg.get("content", "I don't have enough data to answer that.")
    else:
        # Prompt it to generate answer from tool data
        draft_res = chat([{"role": "user", "content": context_msg + "\nAnswer the question using ONLY the numbers from the tool results above. Do not invent numbers."}])
        draft_answer = draft_res.get("message", {}).get("content", "")

    # Step 4: Verifier checks draft
    verification = verifier.check(draft_answer, tool_results)

    # Step 5: Handle verification result
    if verification.passed:
        final_answer = draft_answer
        verifier_passed = True
        attempts = 1
    else:
        # Regenerate once with corrective instruction
        corrective_prompt = f"Your previous answer failed verification: {verification.failure_reason}. Only state numbers that appear in the provided data. Try again."
        regen_messages = [
            {"role": "user", "content": context_msg},
            {"role": "assistant", "content": draft_answer},
            {"role": "user", "content": corrective_prompt}
        ]
        regen_res = chat(regen_messages)
        draft_answer_2 = regen_res.get("message", {}).get("content", "")
        
        verification_2 = verifier.check(draft_answer_2, tool_results)

        if verification_2.passed:
            final_answer = draft_answer_2
            verifier_passed = True
            attempts = 2
        else:
            final_answer = "I don't have enough verified information to answer that precisely. Please check your data sources or ask a more specific question."
            verifier_passed = False
            attempts = 2

            # Log rejection to in-memory store
            try:
                write_verifier_rejection({
                    "id": f"rej_{datetime.utcnow().timestamp()}",
                    "question": question,
                    "draft_answer": draft_answer_2,
                    "tool_data": json.dumps(tool_results)[:5000],
                    "failure_reason": verification_2.failure_reason,
                    "timestamp": datetime.utcnow().isoformat()
                })
            except Exception as e:
                print(f"Failed to log rejection: {e}")

    # Step 6: Extract ui_action if present
    ui_action = extract_ui_action(tool_calls)

    # Step 7: Store chat history
    try:
        write_chat_history({
            "id": f"chat_{datetime.utcnow().timestamp()}",
            "session_id": session_id or "default",
            "question": question,
            "tool_calls": [t.get("function", {}).get("name") for t in tool_calls],
            "final_answer": final_answer,
            "evidence_record_ids": extract_record_ids(tool_results),
            "verifier_passed": verifier_passed,
            "attempts": attempts,
            "ui_action": ui_action,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        print(f"Failed to log chat: {e}")

    return {
        "answer": final_answer,
        "evidence_record_ids": extract_record_ids(tool_results),
        "verifier_passed": verifier_passed,
        "attempts": attempts,
        "ui_action": ui_action
    }
