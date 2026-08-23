import os
import sys
import io
import json
import csv
from collections import defaultdict
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_matcher_outputs(data_dir):
    matches = load_json(os.path.join(data_dir, 'matched_records.json'))
    exceptions = load_json(os.path.join(data_dir, 'exceptions.json'))
    return matches, exceptions

def evaluate():
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'output')
    gt = load_json(os.path.join(data_dir, 'ground_truth.json'))
    
    start_time = time.time()
    # Run matcher logic if needed or just evaluate the outputs
    # Let's import the matcher and run it
    import sys
    sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
    from backend.matching.matcher import run_reconciliation
    
    def load_csv(path):
        with open(path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            return list(reader)
            
    settlements = load_csv(os.path.join(data_dir, 'settlement_report.csv'))
    banks = load_csv(os.path.join(data_dir, 'bank_statement.csv'))
    ledgers = load_csv(os.path.join(data_dir, 'internal_ledger.csv'))
    
    res = run_reconciliation(settlements, banks, ledgers)
    matches = res['matched_records']
    exceptions = res['exceptions']
    metrics = res['metrics']
    
    with open(os.path.join(data_dir, 'matched_records.json'), 'w') as f:
        json.dump(matches, f, indent=2)
    with open(os.path.join(data_dir, 'exceptions.json'), 'w') as f:
        json.dump(exceptions, f, indent=2)
        
    duration = time.time() - start_time
    
    gt_settlements = gt['settlements']
    
    predicted_exact = 0
    correct_exact = 0
    predicted_batched = 0
    correct_batched = 0
    predicted_fuzzy = 0
    correct_fuzzy = 0
    predicted_exceptions = sum(1 for e in exceptions if e.get('related_settlement_id'))
    correct_exceptions = 0
    
    # Evaluate matches
    for m in matches:
        p_id = m['payment_id']
        method = m['method']
        gt_s = gt_settlements.get(p_id, {})
        true_method = gt_s.get('true_match_type')
        
        if method == "exact":
            predicted_exact += 1
            if true_method == "exact": correct_exact += 1
        elif method == "batched":
            predicted_batched += 1
            if true_method == "batched": correct_batched += 1
        elif method == "fuzzy":
            predicted_fuzzy += 1
            if true_method == "fuzzy": correct_fuzzy += 1

    # Evaluate exceptions
    # To check correct exceptions, we look at gt_settlements where true_match_type == "exception"
    # and match against our predicted exceptions list.
    true_exceptions_count = 0
    for s_id, s_data in gt_settlements.items():
        if s_data.get('true_match_type') == "exception":
            true_exceptions_count += 1
            
    # For now, simplistic correct_exceptions
    # Let's count how many predicted exceptions have a related_settlement_id that is actually an exception in GT
    for e in exceptions:
        p_id = e.get('related_settlement_id')
        if p_id and gt_settlements.get(p_id, {}).get('true_match_type') == "exception":
            correct_exceptions += 1
            
    # Also exception confusion breakdown
    # If predicted exception reason vs true exception reason
    confusion = defaultdict(int)
    for e in exceptions:
        p_id = e.get('related_settlement_id')
        if p_id:
            gt_s = gt_settlements.get(p_id, {})
            true_reason = gt_s.get('true_reason', 'none_or_not_exception')
            pred_reason = e.get('reason')
            confusion[f"{true_reason} -> {pred_reason}"] += 1

    total_records = len(gt_settlements)
    correct_matches = correct_exact + correct_batched + correct_fuzzy
    overall_accuracy = (correct_matches + correct_exceptions) / total_records if total_records else 0

    def get_f1(correct, predicted, true_count):
        p = correct / predicted if predicted else 0
        r = correct / true_count if true_count else 0
        f1 = 2 * p * r / (p + r) if (p + r) else 0
        return p, r, f1

    gt_exact = sum(1 for s in gt_settlements.values() if s.get('true_match_type') == 'exact')
    gt_batched = sum(1 for s in gt_settlements.values() if s.get('true_match_type') == 'batched')
    gt_fuzzy = sum(1 for s in gt_settlements.values() if s.get('true_match_type') == 'fuzzy')
    
    p_ex, r_ex, f_ex = get_f1(correct_exact, predicted_exact, gt_exact)
    p_ba, r_ba, f_ba = get_f1(correct_batched, predicted_batched, gt_batched)
    p_fu, r_fu, f_fu = get_f1(correct_fuzzy, predicted_fuzzy, gt_fuzzy)
    p_exc, r_exc, f_exc = get_f1(correct_exceptions, predicted_exceptions, true_exceptions_count)

    val_rate = metrics['value_reconciliation_rate']
    
    result_md = f"""# Matching Evaluation Results

**Processing Time**: {duration:.2f} seconds for {total_records} settlement cases.

## Value-Weighted Metrics
- Total Settled Value: ₹{metrics['total_settled_value']:,.2f}
- Reconciled Value: ₹{metrics['reconciled_value']:,.2f}
- Exception Value: ₹{metrics['exception_value']:,.2f}
- **Value Reconciliation Rate**: {val_rate * 100:.2f}% (Target: >95%)

## Record Accuracy
- **Overall Accuracy**: {overall_accuracy * 100:.2f}% (Target: >90%)

### Per-Stage Precision / Recall / F1
| Stage | Precision | Recall | F1 Score | Predicted | True |
|---|---|---|---|---|---|
| Exact | {p_ex*100:.1f}% | {r_ex*100:.1f}% | {f_ex*100:.1f}% | {predicted_exact} | {gt_exact} |
| Batched | {p_ba*100:.1f}% | {r_ba*100:.1f}% | {f_ba*100:.1f}% | {predicted_batched} | {gt_batched} |
| Fuzzy | {p_fu*100:.1f}% | {r_fu*100:.1f}% | {f_fu*100:.1f}% | {predicted_fuzzy} | {gt_fuzzy} |
| Exception | {p_exc*100:.1f}% | {r_exc*100:.1f}% | {f_exc*100:.1f}% | {predicted_exceptions} | {true_exceptions_count} |

### Exception Confusion Breakdown
(True Reason -> Predicted Reason)
"""
    for k, v in confusion.items():
        result_md += f"- {k}: {v}\n"

    with open(os.path.join(os.path.dirname(__file__), 'results_matching.md'), 'w', encoding='utf-8') as f:
        f.write(result_md)
        
    print(result_md)

if __name__ == '__main__':
    evaluate()
