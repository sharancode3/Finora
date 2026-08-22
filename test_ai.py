import requests
import json
import time

URL = "http://127.0.0.1:8000/api/v1/chat/ask"

queries = [
    # 1. Clean grounded answer
    "What is my match rate?",
    
    # 2. Multi-step tool call answer
    "Why was settlement PAY-00290 lower than expected?",
    
    # 3. Deliberate hallucination catch 1
    "What was my settlement amount on 2025-12-25?",
    
    # 4. Deliberate hallucination catch 2
    "How much did Business BIZ-999 earn?",
    
    # 5. Deliberate hallucination catch 3
    "What is the total of all settlements plus all exceptions?"
]

results = []

for i, q in enumerate(queries):
    print(f"\n--- Query {i+1}: {q} ---")
    try:
        res = requests.post(URL, json={"question": q, "session_id": "test_session"}, timeout=60)
        data = res.json()
        print(json.dumps(data, indent=2))
        results.append(data)
    except Exception as e:
        print(f"Error: {e}")
    time.sleep(1)

with open("ai_test_results.json", "w") as f:
    json.dump(results, f, indent=2)
