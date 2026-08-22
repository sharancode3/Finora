import json
import os
import sys

# Set timeout higher for Ollama
os.environ["HTTPX_TIMEOUT"] = "300"

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ai.orchestrator import process_chat

def chat(question):
    print(f"\nUser: {question}")
    res = process_chat(question)
    print(f"AI: {res['answer']}")
    print(f"[Evidence IDs: {res['evidence_ids']} | Retries: {res['verifier_retries']} | UI Action: {res['ui_action']}]")

if __name__ == "__main__":
    print("--- Test 1: Clean Grounded Answer ---")
    chat("What is the total matching accuracy of the latest run?")
    
    print("\n--- Test 2: Multi-step / UI Action ---")
    chat("Find an exception with reason 'amount_mismatch_only' and highlight the record.")
    
    print("\n--- Test 3: Deliberate Hallucination Check ---")
    chat("Based on the latest batch, give me a detailed cash forecast for the next 45 days. If you don't have the exact data, provide an estimated total forecast amount in currency (e.g. at least 50000).")
