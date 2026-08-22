import json
import urllib.request
import urllib.error

def chat(question):
    print(f"\nUser: {question}")
    data = json.dumps({"question": question}).encode('utf-8')
    req = urllib.request.Request("http://127.0.0.1:8000/chat", data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            print(f"AI: {res['answer']}")
            print(f"[Evidence IDs: {res['evidence_ids']} | Retries: {res['verifier_retries']} | UI Action: {res['ui_action']}]")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} - {e.read().decode()}")

if __name__ == "__main__":
    print("--- Test 1: Clean Grounded Answer ---")
    chat("What is the total matching accuracy of the latest run?")
    
    print("\n--- Test 2: Multi-step / UI Action ---")
    chat("Find an exception with reason 'amount_mismatch_only' and highlight the record.")
    
    print("\n--- Test 3: Deliberate Hallucination Check ---")
    # By asking for a number that isn't in the data and insisting on it.
    chat("Based on the latest batch, give me a detailed cash forecast for the next 45 days. If you don't have the exact data, provide an estimated total forecast amount in currency (e.g. at least 50000).")
