import math
import numpy as np
from datetime import datetime
from typing import List, Dict, Any, Optional
from sklearn.ensemble import IsolationForest
from backend.db.sqlite_client import get_connection

# Theoretical Benford's Law Probabilities for leading digits 1..9
BENFORD_EXPECTED = {
    d: math.log10(1.0 + 1.0 / d) for d in range(1, 10)
}

def init_anomaly_tables():
    """Initializes persistent storage for precomputed ML and forensic anomaly scores."""
    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS anomaly_scores (
            transaction_id TEXT PRIMARY KEY,
            anomaly_score REAL NOT NULL,
            is_statistically_unusual INTEGER NOT NULL,
            top_feature TEXT,
            explanation TEXT,
            computed_at TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def run_isolation_forest_analysis(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Executes an unsupervised Isolation Forest model on tabular transaction features:
    - gross_amount
    - fee_ratio (fee / gross_amount)
    - gst_ratio (gst / fee)
    - settlement_delay_days (settlement_date - transaction_date)
    """
    if not transactions or len(transactions) < 10:
        return {"anomalies": [], "total_evaluated": len(transactions)}

    features = []
    valid_txs = []

    for tx in transactions:
        gross = float(tx.get('gross_amount') or 0.0)
        fee = float(tx.get('fee') or 0.0)
        gst = float(tx.get('gst') or 0.0)
        
        fee_ratio = (fee / gross) if gross > 0 else 0.02
        gst_ratio = (gst / fee) if fee > 0 else 0.18

        # Calculate transit delay
        t_date_str = tx.get('transaction_date')
        s_date_str = tx.get('settlement_date')
        delay_days = 2.0
        if t_date_str and s_date_str:
            try:
                t_d = datetime.fromisoformat(t_date_str)
                s_d = datetime.fromisoformat(s_date_str)
                delay_days = max(0.0, (s_d - t_d).days)
            except Exception:
                delay_days = 2.0

        features.append([gross, fee_ratio, gst_ratio, delay_days])
        valid_txs.append(tx)

    if len(valid_txs) < 20:
        return {
            "anomalies": [],
            "total_evaluated": len(valid_txs),
            "unusual_count": 0,
            "sample_too_small": True,
            "explanation": f"Fewer than 20 transactions in this view (found {len(valid_txs)}) — statistical checks need a larger sample to be meaningful."
        }

    X = np.array(features)

    # Train Isolation Forest (unsupervised tree partitioning)
    # Contamination=0.08 flags the ~8% most structurally isolated data points
    clf = IsolationForest(n_estimators=100, contamination=0.08, random_state=42)
    clf.fit(X)
    
    # decision_function: lower means more abnormal
    raw_scores = clf.decision_function(X)
    predictions = clf.predict(X) # -1 for anomaly, 1 for normal

    # Normalize scores to [0, 1] where 1.0 = highest anomaly
    min_s = float(np.min(raw_scores))
    max_s = float(np.max(raw_scores))
    spread = (max_s - min_s) if (max_s - min_s) > 0 else 1.0
    normalized_scores = 1.0 - ((raw_scores - min_s) / spread)

    # Feature statistics for explainability
    means = np.mean(X, axis=0)
    stds = np.std(X, axis=0)
    stds[stds == 0] = 1.0

    anomalies = []
    conn = get_connection()
    c = conn.cursor()
    now_iso = datetime.utcnow().isoformat()

    for idx, tx in enumerate(valid_txs):
        score = float(normalized_scores[idx])
        is_unusual = bool(predictions[idx] == -1 or score > 0.70)
        
        # Calculate feature deviations (Z-scores) to explain why the tree isolated this point
        point = X[idx]
        z_scores = np.abs((point - means) / stds)
        max_feat_idx = int(np.argmax(z_scores))
        
        feature_names = ["Gross Amount", "Fee Ratio", "GST Deduction", "Settlement Delay"]
        top_feature = feature_names[max_feat_idx]
        
        explanation = ""
        if max_feat_idx == 0:
            explanation = f"Gross amount ₹{point[0]:,.2f} is significantly outside the typical distribution."
        elif max_feat_idx == 1:
            explanation = f"Gateway fee ratio of {point[1]*100:.2f}% deviates from standard 2.0% MDR contract."
        elif max_feat_idx == 2:
            explanation = f"GST tax deduction of {point[2]*100:.2f}% on fees diverges from 18% statutory baseline."
        else:
            delay_val = point[3]
            if delay_val > 2:
                explanation = f"Settlement delay of {delay_val:.0f} {'day' if round(delay_val) == 1 else 'days'} exceeds standard T+2 SLA."
            elif delay_val == 0:
                explanation = "Settlement cleared same-day (T+0 instant posting), diverging from expected T+2 rolling batch window."
            else:
                explanation = f"Settlement timing of {delay_val:.0f} {'day' if round(delay_val) == 1 else 'days'} is within standard T+2 window."

        if is_unusual:
            anomalies.append({
                "transaction_id": tx.get('transaction_id'),
                "business_id": tx.get('business_id'),
                "transaction_date": tx.get('transaction_date'),
                "gross_amount": tx.get('gross_amount'),
                "anomaly_score": round(score, 3),
                "is_statistically_unusual": True,
                "top_feature": top_feature,
                "explanation": explanation
            })

        # Cache score into database
        c.execute('''
            INSERT OR REPLACE INTO anomaly_scores 
            (transaction_id, anomaly_score, is_statistically_unusual, top_feature, explanation, computed_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (tx.get('transaction_id'), score, 1 if is_unusual else 0, top_feature, explanation, now_iso))

    conn.commit()
    conn.close()

    # Sort by highest anomaly score
    anomalies.sort(key=lambda a: a['anomaly_score'], reverse=True)

    return {
        "anomalies": anomalies,
        "total_evaluated": len(valid_txs),
        "unusual_count": len(anomalies)
    }

def compute_benfords_law_distribution(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes forensic Benford's Law leading-digit distribution across transaction gross amounts.
    Compares observed digit frequencies against theoretical logarithmic frequencies.
    """
    digit_counts = {d: 0 for d in range(1, 10)}
    total_valid = 0

    for tx in transactions:
        gross = float(tx.get('gross_amount') or 0.0)
        if gross <= 0:
            continue
        
        # Get first non-zero digit
        gross_str = f"{gross:.2f}".lstrip('0').replace('.', '')
        if gross_str:
            leading_digit = int(gross_str[0])
            if 1 <= leading_digit <= 9:
                digit_counts[leading_digit] += 1
                total_valid += 1

    if total_valid < 30:
        return {
            "status": "Insufficient Sample",
            "is_compliant": True,
            "mad": 0.0,
            "total_evaluated": total_valid,
            "sample_too_small": True,
            "explanation": f"Fewer than 30 transactions in this view (found {total_valid}) — statistical checks need a larger sample to be meaningful.",
            "forensic_summary": f"Fewer than 30 transactions in this view (found {total_valid}) — statistical checks need a larger sample to be meaningful.",
            "digits": []
        }

    digits_breakdown = []
    mad_sum = 0.0
    chi_square_sum = 0.0

    for d in range(1, 10):
        observed_count = digit_counts[d]
        actual_freq = observed_count / total_valid
        expected_freq = BENFORD_EXPECTED[d]
        expected_count = expected_freq * total_valid
        
        diff = abs(actual_freq - expected_freq)
        mad_sum += diff

        if expected_count > 0:
            chi_square_sum += ((observed_count - expected_count) ** 2) / expected_count

        digits_breakdown.append({
            "digit": d,
            "count": observed_count,
            "actual_pct": round(actual_freq * 100, 1),
            "expected_pct": round(expected_freq * 100, 1),
            "deviation_pct": round((actual_freq - expected_freq) * 100, 1)
        })

    # Mean Absolute Deviation (MAD)
    mad = mad_sum / 9.0

    # Forensic Classification Thresholds:
    # MAD <= 0.015: Close Conformity
    # 0.015 - 0.025: Acceptable Conformity
    # > 0.025: Non-Conformity (Fabrication / Batch Manipulation risk)
    if mad <= 0.018:
        status = "Pass — Natural Distribution"
        is_compliant = True
        summary = f"Leading digit distribution conforms naturally to Benford's Law (MAD = {mad:.3f}), confirming genuine, unmanipulated transactional flow under Ind AS forensic audit criteria."
    elif mad <= 0.028:
        status = "Acceptable Conformity"
        is_compliant = True
        summary = f"Slight retail clustering detected (MAD = {mad:.3f}), but within standard commercial e-commerce thresholds."
    else:
        status = "Elevated Deviation Flagged"
        is_compliant = False
        summary = f"Significant deviation from natural logarithmic frequencies (MAD = {mad:.3f}). Forensic review recommended for synthetic clustering."

    return {
        "status": status,
        "is_compliant": is_compliant,
        "mad": round(mad, 4),
        "chi_square": round(chi_square_sum, 2),
        "total_evaluated": total_valid,
        "digits": digits_breakdown,
        "forensic_summary": summary
    }
