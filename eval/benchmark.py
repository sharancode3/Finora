import time
import requests
import os
import csv

def load_csv(path):
    with open(path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)

def run_benchmarks():
    print("Starting Performance Benchmarks...")
    
    # 1. Matching Engine
    start = time.time()
    from backend.matching.matcher import run_reconciliation
    
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'output')
    settlements = load_csv(os.path.join(data_dir, 'settlement_report.csv'))
    bank_txs = load_csv(os.path.join(data_dir, 'bank_statement.csv'))
    ledgers = load_csv(os.path.join(data_dir, 'internal_ledger.csv'))
    
    res = run_reconciliation(settlements, bank_txs, ledgers)
    matches = res['matched_records']
    exceptions = res['exceptions']
    
    match_time = time.time() - start
    
    print(f"Reconciliation of {len(settlements)} records took {match_time:.4f} seconds.")
    
    # 2. API Latency
    endpoints = [
        "/api/v1/business",
        "/api/v1/scoring/health",
        "/api/v1/metrics/value-weighted",
        "/api/v1/forecast/compute",
        "/api/v1/briefing"
    ]
    
    latencies = []
    for ep in endpoints:
        ep_start = time.time()
        requests.get(f"http://localhost:8800{ep}")
        latencies.append(time.time() - ep_start)
        
    avg_api_latency = sum(latencies) / len(latencies)
    print(f"Average API Latency: {avg_api_latency*1000:.2f} ms")
    
    # 3. AI Question Processing
    ai_start = time.time()
    requests.post("http://localhost:8800/api/v1/chat/ask", json={
        "message": "What is my match rate?",
        "session_id": "benchmark"
    })
    ai_latency = time.time() - ai_start
    print(f"AI Question Latency: {ai_latency:.2f} seconds")
    
    report = f"""# Performance Benchmark Results

- **Reconciliation Engine**: Processed {len(settlements)} records in {match_time:.4f} seconds. (Target: < 3s)
- **Average API Latency**: {avg_api_latency*1000:.2f} ms. (Target: < 200ms)
- **AI Question Latency**: {ai_latency:.2f} seconds. (Target: < 5s)
"""
    with open(os.path.join(os.path.dirname(__file__), 'benchmark_results.md'), "w") as f:
        f.write(report)
        
    print(report)

if __name__ == "__main__":
    run_benchmarks()
