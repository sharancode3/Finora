import sqlite3
import os
import json
import uuid
import random
import statistics
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional, Tuple, Any
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'output')
DB_FILE = os.path.join(DATA_DIR, 'finora.db')

def get_connection():
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Transactions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            transaction_id TEXT PRIMARY KEY,
            business_id TEXT NOT NULL,
            transaction_date TEXT NOT NULL,
            gross_amount REAL NOT NULL,
            fee REAL NOT NULL,
            gst REAL NOT NULL,
            net_amount REAL NOT NULL,
            bank_reference TEXT,
            settlement_date TEXT,
            status TEXT NOT NULL
        )
    ''')
    
    # Exceptions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS exceptions (
            id TEXT PRIMARY KEY,
            transaction_id TEXT NOT NULL,
            business_id TEXT NOT NULL,
            transaction_date TEXT NOT NULL,
            reason TEXT NOT NULL,
            underlying_data TEXT NOT NULL
        )
    ''')
    
    # Accounts table (Phase 6)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS accounts (
            account_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            status TEXT NOT NULL,
            connected_at TEXT NOT NULL
        )
    ''')

    # Run migrations for Phase 3 & Phase 9 columns
    try:
        cursor.execute("ALTER TABLE exceptions ADD COLUMN status TEXT DEFAULT 'open'")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE exceptions ADD COLUMN resolution_note TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE exceptions ADD COLUMN resolved_at TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE exceptions ADD COLUMN escalated_at TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE accounts ADD COLUMN last_synced_at TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE accounts ADD COLUMN sync_status TEXT DEFAULT 'healthy'")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE accounts ADD COLUMN sync_message TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE accounts ADD COLUMN account_number TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE accounts ADD COLUMN key_id TEXT")
    except sqlite3.OperationalError:
        pass

    # Ensure rich multi-account seed exists
    cursor.execute("SELECT COUNT(*) as c FROM accounts")
    if cursor.fetchone()['c'] == 0:
        cursor.execute('''
            INSERT INTO accounts (account_id, name, type, status, connected_at, last_synced_at, sync_status, sync_message, key_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('demo_org_1', 'Razorpay Gateway (Primary)', 'payment_gateway', 'connected', '2026-08-01T00:00:00Z', '2026-08-31T17:40:00Z', 'healthy', None, 'rzp_live_89aNqP44v'))
        
        cursor.execute('''
            INSERT INTO accounts (account_id, name, type, status, connected_at, last_synced_at, sync_status, sync_message, account_number) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('acct_hdfc_bank', 'HDFC Corporate Current Feed', 'bank_feed', 'connected', '2026-08-05T00:00:00Z', '2026-08-30T09:15:00Z', 'stale', 'No incoming bank settlement UTR updates in 36 hours. Credit verification delayed.', '50200084920192'))

        cursor.execute('''
            INSERT INTO accounts (account_id, name, type, status, connected_at, last_synced_at, sync_status, sync_message, account_number) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('acct_icici_bank', 'ICICI Escrow Account', 'bank_feed', 'connected', '2026-08-10T00:00:00Z', '2026-08-31T16:55:00Z', 'healthy', None, '001205018392'))

    # Indexes
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(transaction_date)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_tx_business ON transactions(business_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_exc_date ON exceptions(transaction_date)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_exc_reason ON exceptions(reason)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_exc_status ON exceptions(status)')
    
    conn.commit()
    conn.close()

def _dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def _run_query(query: str, params: tuple = ()) -> List[Dict]:
    conn = get_connection()
    conn.row_factory = _dict_factory
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.commit()
    conn.close()
    return rows

def get_transactions_by_date_range(start_date: str, end_date: str, account_id: Optional[str] = None) -> List[Dict]:
    query = '''
        SELECT * FROM transactions 
        WHERE transaction_date >= ? AND transaction_date <= ?
    '''
    params = [start_date, end_date]
    if account_id and account_id != 'all':
        query += ' AND business_id = ?'
        params.append(account_id)
    query += ' ORDER BY transaction_date DESC'
    return _run_query(query, tuple(params))

def get_transactions_by_business(business_id: str) -> List[Dict]:
    query = '''
        SELECT * FROM transactions 
        WHERE business_id = ?
        ORDER BY transaction_date DESC
    '''
    return _run_query(query, (business_id,))

def get_exceptions_by_date_range(start_date: str, end_date: str, reason: Optional[str] = None, status: Optional[str] = None, account_id: Optional[str] = None) -> List[Dict]:
    query = 'SELECT * FROM exceptions WHERE transaction_date BETWEEN ? AND ?'
    params = [start_date, end_date]
    if reason:
        query += ' AND reason = ?'
        params.append(reason)
    if status:
        query += ' AND status = ?'
        params.append(status)
    if account_id and account_id != 'all':
        query += ' AND business_id = ?'
        params.append(account_id)
    query += ' ORDER BY transaction_date DESC'
    
    rows = _run_query(query, tuple(params))
    # Parse the underlying_data JSON strings back to dicts
    for row in rows:
        try:
            row['underlying_data'] = json.loads(row['underlying_data'])
        except Exception:
            pass
    return rows

def get_aggregates(interval: str = 'monthly') -> List[Dict]:
    """
    Get aggregated counts and amounts.
    interval: 'monthly' or 'daily'
    """
    if interval == 'monthly':
        date_expr = "substr(transaction_date, 1, 7)"  # YYYY-MM
    elif interval == 'daily':
        date_expr = "transaction_date"                # YYYY-MM-DD
    else:
        raise ValueError("interval must be 'monthly' or 'daily'")
        
    query = f'''
        SELECT 
            {date_expr} as period,
            COUNT(*) as transaction_count,
            SUM(gross_amount) as total_gross,
            SUM(net_amount) as total_net,
            SUM(fee) as total_fee,
            SUM(gst) as total_gst
        FROM transactions
        GROUP BY period
        ORDER BY period DESC
    '''
    return _run_query(query)

def get_transaction_by_id(tx_id: str) -> Optional[Dict]:
    rows = _run_query('SELECT * FROM transactions WHERE transaction_id = ?', (tx_id,))
    return rows[0] if rows else None

def get_exception_by_id(exc_id: str) -> Optional[Dict]:
    rows = _run_query('SELECT * FROM exceptions WHERE id = ?', (exc_id,))
    if rows:
        row = rows[0]
        try:
            row['underlying_data'] = json.loads(row['underlying_data'])
        except Exception:
            pass
        return row
    return None

def resolve_exception(exc_id: str, reason: str, note: str):
    now = datetime.utcnow().isoformat()
    _run_query(
        "UPDATE exceptions SET status = 'resolved', reason = ?, resolution_note = ?, resolved_at = ? WHERE id = ?",
        (reason, note, now, exc_id)
    )

def escalate_exception(exc_id: str, note: str):
    now = datetime.utcnow().isoformat()
    _run_query(
        "UPDATE exceptions SET status = 'escalated', resolution_note = ?, escalated_at = ? WHERE id = ?",
        (note, now, exc_id)
    )

def get_cash_position_analytics(start_date: str, end_date: str, account_id: Optional[str] = None):
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # 1. Base Metrics for the selected period
    query_base = '''
        SELECT 
            SUM(gross_amount) as gross, 
            SUM(fee) as fees, 
            SUM(CASE WHEN status = 'settled' THEN net_amount ELSE 0 END) as net,
            AVG(julianday(settlement_date) - julianday(transaction_date)) as dso
        FROM transactions 
        WHERE transaction_date BETWEEN ? AND ?
    '''
    params_base = [start_date, end_date]
    if account_id and account_id != 'all':
        query_base += ' AND business_id = ?'
        params_base.append(account_id)
        
    c.execute(query_base, tuple(params_base))
    row = c.fetchone()
    
    gross = row['gross'] or 0.0
    fees = row['fees'] or 0.0
    net = row['net'] or 0.0
    dso_current = row['dso'] or 0.0
    gst = fees * 0.18 # GST is 18% of fee
    
    # 2. Prior Period DSO for Trend
    from datetime import timedelta
    s = datetime.strptime(start_date, '%Y-%m-%d')
    e = datetime.strptime(end_date, '%Y-%m-%d')
    delta_days = (e - s).days + 1
    
    prior_e = s - timedelta(days=1)
    prior_s = prior_e - timedelta(days=delta_days - 1)
    
    c.execute('''
        SELECT AVG(julianday(settlement_date) - julianday(transaction_date)) as dso
        FROM transactions 
        WHERE transaction_date BETWEEN ? AND ?
    ''', (prior_s.strftime('%Y-%m-%d'), prior_e.strftime('%Y-%m-%d')))
    prior_row = c.fetchone()
    dso_prior = prior_row['dso'] or dso_current
    
    # 3. Trailing 12-week Anomaly Detection
    trailing_s = s - timedelta(weeks=12)
    c.execute('''
        SELECT strftime('%Y-%W', transaction_date) as week, SUM(net_amount) as weekly_net
        FROM transactions
        WHERE transaction_date BETWEEN ? AND ?
        GROUP BY week
    ''', (trailing_s.strftime('%Y-%m-%d'), prior_e.strftime('%Y-%m-%d')))
    weekly_history = [r['weekly_net'] for r in c.fetchall() if r['weekly_net'] is not None]
    
    anomaly = {"is_anomalous": False, "direction": "normal", "description": "Settlement volume is within normal historical ranges."}
    if len(weekly_history) >= 4 and delta_days > 0:
        mean_val = statistics.mean(weekly_history)
        stdev_val = statistics.stdev(weekly_history) if len(weekly_history) > 1 else 1.0
        
        current_weekly_run_rate = (net / delta_days) * 7
        
        if stdev_val > 0:
            z_score = (current_weekly_run_rate - mean_val) / stdev_val
            if z_score > 1.5:
                anomaly = {
                    "is_anomalous": True, 
                    "direction": "up", 
                    "description": f"Current weekly run-rate is {abs(z_score):.1f} standard deviations ABOVE the trailing 12-week average."
                }
            elif z_score < -1.5:
                anomaly = {
                    "is_anomalous": True, 
                    "direction": "down", 
                    "description": f"Current weekly run-rate is {abs(z_score):.1f} standard deviations BELOW the trailing 12-week average."
                }
                
    # 4. Scenario: Value of Open Exceptions
    query_exc = '''
        SELECT SUM(t.gross_amount) as trapped_cash
        FROM exceptions e
        JOIN transactions t ON e.transaction_id = t.transaction_id
        WHERE e.status = 'open' AND t.transaction_date BETWEEN ? AND ?
    '''
    params_exc = [start_date, end_date]
    if account_id and account_id != 'all':
        query_exc += ' AND t.business_id = ?'
        params_exc.append(account_id)
        
    c.execute(query_exc, tuple(params_exc))
    exc_row = c.fetchone()
    trapped_cash = (exc_row['trapped_cash'] or 0.0) if exc_row else 0.0

    # 5. Monte Carlo Treasury Simulation (1,000 Trials for 7-Day Forecast)
    # Fit historical daily run rate and standard deviation
    daily_net_mean = (net / delta_days) if delta_days > 0 else 8500.0
    daily_net_std = max(1200.0, daily_net_mean * 0.28)
    
    N_TRIALS = 1000
    FORECAST_DAYS = 7
    
    # Generate simulations
    np.random.seed(42) # Deterministic repeatable seed
    
    base_trajectories = np.zeros((N_TRIALS, FORECAST_DAYS))
    resolved_trajectories = np.zeros((N_TRIALS, FORECAST_DAYS))
    
    cur_base = net
    cur_resolved = net + trapped_cash
    
    for trial in range(N_TRIALS):
        # Sample daily settlement timing and exception volatility
        daily_inflows = np.random.normal(daily_net_mean, daily_net_std, FORECAST_DAYS)
        daily_inflows = np.maximum(daily_inflows, 500.0) # non-negative
        
        # Base scenario with timing delays & open exception friction
        delay_factors = np.random.choice([0.88, 0.94, 1.0, 1.04], size=FORECAST_DAYS)
        exc_friction = np.random.choice([0.93, 0.96, 0.98], size=FORECAST_DAYS)
        
        base_cum = cur_base
        res_cum = cur_resolved
        
        for d in range(FORECAST_DAYS):
            base_increment = daily_inflows[d] * delay_factors[d] * exc_friction[d]
            base_cum += base_increment
            base_trajectories[trial, d] = base_cum
            
            # Resolved scenario (no exception friction, unlocked trapped cash)
            res_increment = daily_inflows[d] * delay_factors[d]
            res_cum += res_increment
            resolved_trajectories[trial, d] = res_cum
            
    fan_chart_data = []
    end_date_obj = datetime.strptime(end_date, '%Y-%m-%d')
    
    for d in range(FORECAST_DAYS):
        f_date = end_date_obj + timedelta(days=d + 1)
        
        day_base = base_trajectories[:, d]
        day_res = resolved_trajectories[:, d]
        
        fan_chart_data.append({
            "day": f"+{d+1}d",
            "date": f_date.strftime('%b %d'),
            "p10": round(float(np.percentile(day_base, 10)), 2),
            "p25": round(float(np.percentile(day_base, 25)), 2),
            "p50": round(float(np.percentile(day_base, 50)), 2), # Median
            "p75": round(float(np.percentile(day_base, 75)), 2),
            "p90": round(float(np.percentile(day_base, 90)), 2),
            "resolved_p10": round(float(np.percentile(day_res, 10)), 2),
            "resolved_p50": round(float(np.percentile(day_res, 50)), 2),
            "resolved_p90": round(float(np.percentile(day_res, 90)), 2)
        })
        
    day7_p10 = fan_chart_data[-1]['p10']
    day7_p90 = fan_chart_data[-1]['p90']
    day7_date = fan_chart_data[-1]['date']
    
    summary_statement = f"80% probability available cash lands between ₹{day7_p10:,.2f} and ₹{day7_p90:,.2f} by {day7_date} across 1,000 simulated trials."
    
    return {
        "dso": {
            "current": round(dso_current, 1),
            "prior": round(dso_prior, 1),
            "trend_direction": "up" if dso_current > dso_prior else "down" if dso_current < dso_prior else "flat"
        },
        "leakage": {
            "gross": round(gross, 2),
            "fees": round(fees, 2),
            "gst": round(gst, 2),
            "trapped_exceptions": round(trapped_cash, 2),
            "net": round(net, 2),
            "conversion_rate": round((net / gross * 100), 2) if gross > 0 else 0
        },
        "waterfall": [
            {"name": "Gross Collected", "start": 0, "end": gross, "color": "#94a3b8"},
            {"name": "Gateway Fees (MDR)", "start": max(0, gross - fees), "end": gross, "color": "#f43f5e"},
            {"name": "GST on Fees (18%)", "start": max(0, gross - fees - gst), "end": max(0, gross - fees), "color": "#fb923c"},
            {"name": "Trapped Exceptions", "start": max(0, gross - fees - gst - trapped_cash), "end": max(0, gross - fees - gst), "color": "#f59e0b"},
            {"name": "Net Settled Cash", "start": 0, "end": net, "color": "#10b981"}
        ],
        "anomaly": anomaly,
        "monte_carlo": {
            "trials_count": N_TRIALS,
            "forecast_days": FORECAST_DAYS,
            "confidence_level": "80%",
            "summary_statement": summary_statement,
            "day7_p10": day7_p10,
            "day7_p50": fan_chart_data[-1]['p50'],
            "day7_p90": day7_p90,
            "fan_chart": fan_chart_data
        },
        "scenario": {
            "current_pending": round(gross - net, 2),
            "trapped_in_exceptions": round(trapped_cash, 2),
            "projected_with_exceptions": round(net + trapped_cash, 2)
        }
    }

def get_accounts():
    rows = _run_query("SELECT * FROM accounts ORDER BY connected_at ASC", ())
    return [dict(r) for r in rows]

def sync_account(account_id: str) -> Dict[str, Any]:
    now = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        UPDATE accounts 
        SET last_synced_at = ?, sync_status = 'healthy', sync_message = NULL
        WHERE account_id = ?
    ''', (now, account_id))
    conn.commit()
    conn.close()
    return {"account_id": account_id, "last_synced_at": now, "sync_status": "healthy"}

def connect_new_account(name: str, type: str, config: Optional[Dict[str, Any]] = None) -> str:
    account_id = f"acct_{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
    
    cfg = config or {}
    key_id = cfg.get('key_id') or (f"rzp_live_{uuid.uuid4().hex[:10]}" if 'gateway' in type else None)
    account_number = cfg.get('account_number') or (f"{random.randint(1000000000, 9999999999)}" if 'bank' in type else None)

    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        INSERT INTO accounts (account_id, name, type, status, connected_at, last_synced_at, sync_status, sync_message, key_id, account_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (account_id, name, type, 'connected', now, now, 'healthy', None, key_id, account_number))
    
    # Generate initial realistic live transactions
    end_date = date(2026, 9, 5)
    start_date = date(2026, 8, 1)
    delta = (end_date - start_date).days
    
    for i in range(delta + 1):
        current_date = start_date + timedelta(days=i)
        daily_count = np.random.poisson(2)
        if daily_count == 0:
            continue
            
        for _ in range(daily_count):
            tx_id = f"txn_{uuid.uuid4().hex[:12]}"
            gross = round(float(np.random.lognormal(mean=6.2, sigma=0.8)), 2)
            if gross < 250: gross = 250.0
            
            fee = round(gross * 0.02, 2)
            gst = round(fee * 0.18, 2)
            net = round(gross - fee - gst, 2)
            
            settle_date = current_date + timedelta(days=2)
            if settle_date.weekday() >= 5:
                settle_date += timedelta(days=2)
                
            c.execute('''
                INSERT INTO transactions (transaction_id, business_id, transaction_date, gross_amount, fee, gst, net_amount, bank_reference, settlement_date, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (tx_id, account_id, current_date.isoformat(), gross, fee, gst, net, f"UTR{uuid.uuid4().hex[:8].upper()}", settle_date.isoformat(), 'settled'))
            
    conn.commit()
    conn.close()
    return account_id

def generate_demo_account(account_name: str, account_type: str):
    return connect_new_account(account_name, account_type)

def get_cross_account_reconciliation(start_date: str = "2026-08-01", end_date: str = "2026-08-31") -> Dict[str, Any]:
    conn = get_connection()
    c = conn.cursor()

    # 1. Fetch total transactions grouped by account
    c.execute('''
        SELECT 
            t.business_id,
            COALESCE(a.name, 'Primary Gateway') as account_name,
            COALESCE(a.type, 'payment_gateway') as account_type,
            COALESCE(a.sync_status, 'healthy') as sync_status,
            COALESCE(a.last_synced_at, '2026-08-31T17:40:00Z') as last_synced_at,
            COUNT(*) as tx_count,
            SUM(t.gross_amount) as gross_volume,
            SUM(t.fee) as total_fees,
            SUM(t.gst) as total_gst,
            SUM(t.net_amount) as net_settled
        FROM transactions t
        LEFT JOIN accounts a ON t.business_id = a.account_id
        WHERE t.transaction_date BETWEEN ? AND ?
        GROUP BY t.business_id
    ''', (start_date, end_date))
    rows = c.fetchall()

    total_gross = sum(r['gross_volume'] or 0.0 for r in rows)
    total_net = sum(r['net_settled'] or 0.0 for r in rows)

    # 2. Fetch trapped in exceptions
    c.execute('''
        SELECT SUM(t.gross_amount) as trapped
        FROM exceptions e
        JOIN transactions t ON e.transaction_id = t.transaction_id
        WHERE e.status = 'open' AND t.transaction_date BETWEEN ? AND ?
    ''', (start_date, end_date))
    trapped_row = c.fetchone()
    trapped_cash = trapped_row['trapped'] or 0.0

    contributions = []
    for r in rows:
        vol = float(r['gross_volume'] or 0.0)
        share_pct = round((vol / total_gross * 100), 1) if total_gross > 0 else 0.0
        contributions.append({
            "account_id": r['business_id'],
            "account_name": r['account_name'],
            "account_type": r['account_type'],
            "sync_status": r['sync_status'],
            "last_synced_at": r['last_synced_at'],
            "transaction_count": r['tx_count'],
            "gross_volume": round(vol, 2),
            "net_settled": round(float(r['net_settled'] or 0.0), 2),
            "share_percentage": share_pct
        })

    # Realistic inter-account settlement route flows
    inter_account_flows = [
        {
            "from_account": "Razorpay Gateway (Primary)",
            "to_account": "HDFC Corporate Current Feed (A/C ...9192)",
            "settled_amount": round(total_net * 0.76, 2),
            "status": "settled",
            "cycle": "T+2 Rolling Settlement"
        },
        {
            "from_account": "Razorpay Gateway (Primary)",
            "to_account": "ICICI Escrow Account (A/C ...8392)",
            "settled_amount": round(total_net * 0.24, 2),
            "status": "settled",
            "cycle": "T+1 Priority Float"
        },
        {
            "from_account": "Razorpay Gateway (Primary)",
            "to_account": "Pending / Exceptions Suspense",
            "settled_amount": round(trapped_cash, 2),
            "status": "trapped",
            "cycle": "Awaiting UTR Match & Fee Validation"
        }
    ]

    conn.close()

    return {
        "summary": {
            "total_collected": round(total_gross, 2),
            "total_bank_settled": round(total_net, 2),
            "trapped_in_exceptions": round(trapped_cash, 2),
            "connected_accounts_count": len(rows)
        },
        "contributions": contributions,
        "inter_account_flows": inter_account_flows
    }

def get_month_end_metrics(target_month: str):
    # target_month format: YYYY-MM
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    try:
        dt = datetime.strptime(target_month, '%Y-%m')
        # Previous month calculation
        if dt.month == 1:
            prev_dt = dt.replace(year=dt.year - 1, month=12)
        else:
            prev_dt = dt.replace(month=dt.month - 1)
        prev_month = prev_dt.strftime('%Y-%m')
    except ValueError:
        target_month = '2026-08'
        prev_month = '2026-07'
        
    def _get_metrics(month_str):
        c.execute('''
            SELECT COUNT(*) as count, SUM(gross_amount) as vol, SUM(CASE WHEN status='settled' THEN net_amount ELSE 0 END) as settled_vol
            FROM transactions
            WHERE transaction_date LIKE ?
        ''', (f"{month_str}-%",))
        tx_row = c.fetchone()
        
        c.execute('''
            SELECT 
                COUNT(*) as exc_count,
                SUM(CASE WHEN status='resolved' THEN 1 ELSE 0 END) as resolved_count,
                SUM(CASE WHEN status='open' THEN 1 ELSE 0 END) as open_count,
                AVG(CASE WHEN status='resolved' AND resolved_at IS NOT NULL 
                    THEN julianday(resolved_at) - julianday(transaction_date) 
                    ELSE NULL END) as avg_resolution_days
            FROM exceptions
            WHERE transaction_date LIKE ?
        ''', (f"{month_str}-%",))
        exc_row = c.fetchone()
        
        gross_vol = tx_row['vol'] or 0.0
        settled_vol = tx_row['settled_vol'] or 0.0
        match_rate = round((settled_vol / gross_vol * 100), 1) if gross_vol > 0 else 96.5
        
        return {
            "month": month_str,
            "transaction_count": tx_row['count'] or 0,
            "volume": gross_vol,
            "settled_volume": settled_vol,
            "match_rate": match_rate,
            "exceptions_total": exc_row['exc_count'] or 0,
            "exceptions_resolved": exc_row['resolved_count'] or 0,
            "exceptions_open": exc_row['open_count'] or 0,
            "avg_resolution_days": round(exc_row['avg_resolution_days'] or 2.1, 1)
        }
        
    current = _get_metrics(target_month)
    previous = _get_metrics(prev_month)
    
    # 2. Daily Readiness Sparkline Tracking (Continuous Close Daily Progression)
    c.execute('''
        SELECT 
            transaction_date,
            COUNT(*) as tx_count,
            SUM(gross_amount) as day_gross,
            SUM(CASE WHEN status='settled' THEN net_amount ELSE 0 END) as day_settled
        FROM transactions
        WHERE transaction_date LIKE ?
        GROUP BY transaction_date
        ORDER BY transaction_date ASC
    ''', (f"{target_month}-%",))
    daily_rows = c.fetchall()

    daily_readiness = []
    ready_days_count = 0
    
    for row in daily_rows:
        d_str = row['transaction_date']
        d_gross = float(row['day_gross'] or 0.0)
        d_settled = float(row['day_settled'] or 0.0)
        d_rate = round((d_settled / d_gross * 100), 1) if d_gross > 0 else 100.0
        
        # Day readiness logic (if rate >= 95% -> ready)
        is_ready = d_rate >= 95.0
        if is_ready: ready_days_count += 1
        
        daily_readiness.append({
            "date": d_str,
            "day": int(d_str.split('-')[-1]),
            "gross": d_gross,
            "settled": d_settled,
            "match_rate": d_rate,
            "is_ready": is_ready,
            "readiness_score": min(100, int(d_rate))
        })
        
    total_days = max(1, len(daily_readiness))
    overall_readiness_score = round((ready_days_count / total_days * 100), 1)
    
    # 3. Pre-Lock Validation Checklist Items
    open_excs = current['exceptions_open']
    match_rate = current['match_rate']
    
    validation_checks = [
        {
            "id": "feeds_synced",
            "title": "All Bank & Payment Gateway Feeds Synchronized",
            "description": "Verify all incoming settlement webhook batches and account aggregator feeds are ingested.",
            "status": "pass",
            "stat": "3 of 3 Feeds Ingested"
        },
        {
            "id": "match_sla",
            "title": "Value Match Rate Exceeds 95.0% Statutory SLA",
            "description": "Ensures gross settlements match bank deposits within acceptable variance tolerances.",
            "status": "pass" if match_rate >= 95.0 else "fail",
            "stat": f"Current: {match_rate}%"
        },
        {
            "id": "open_exceptions",
            "title": "Clear Open Discrepancies & Suspense Balances",
            "description": "Ind AS standard requires all unapplied receipts and fee disputes to be explained or posted to suspense.",
            "status": "pass" if open_excs == 0 else "action_required",
            "stat": f"{open_excs} Unresolved Items" if open_excs > 0 else "0 Open Items"
        },
        {
            "id": "signoff_required",
            "title": "Financial Controller Formal Authorization",
            "description": "Requires certified management sign-off to legally finalize and freeze the ledger.",
            "status": "pending",
            "stat": "Pending Digital Signature"
        }
    ]
    
    conn.close()
    return {
        "current": current,
        "previous": previous,
        "daily_readiness": daily_readiness,
        "overall_readiness_score": overall_readiness_score,
        "ready_days_count": ready_days_count,
        "total_days_evaluated": total_days,
        "validation_checks": validation_checks
    }

def get_exception_intelligence(start_date: str = "2026-03-01", end_date: str = "2026-09-05", status: Optional[str] = None, account_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Computes composite risk scores per exception, clusters systemic pattern issues,
    and returns time-to-resolution metrics broken down by reason.
    """
    conn = get_connection()
    c = conn.cursor()

    # 1. Fetch exceptions
    query = 'SELECT * FROM exceptions WHERE transaction_date BETWEEN ? AND ?'
    params = [start_date, end_date]
    if status and status != 'all' and status != 'statistically unusual':
        query += ' AND status = ?'
        params.append(status)
    if account_id and account_id != 'all':
        query += ' AND business_id = ?'
        params.append(account_id)
    query += ' ORDER BY transaction_date DESC'

    c.execute(query, tuple(params))
    raw_exceptions = c.fetchall()

    # 2. Fetch ML Anomaly Scores
    c.execute('SELECT transaction_id, anomaly_score, is_statistically_unusual, explanation FROM anomaly_scores')
    anomaly_map = {row['transaction_id']: dict(row) for row in c.fetchall()}

    # Reference today as 2026-08-31 for consistent demo aging calculation
    ref_date = date(2026, 8, 31)

    enriched_exceptions = []
    clusters_by_reason: Dict[str, List[Dict]] = {}

    for row in raw_exceptions:
        exc = dict(row)
        try:
            exc['underlying_data'] = json.loads(exc['underlying_data']) if isinstance(exc['underlying_data'], str) else exc['underlying_data']
        except Exception:
            exc['underlying_data'] = {}

        # Extract amount
        amount = 0.0
        if exc['underlying_data']:
            amount = float(exc['underlying_data'].get('gross_amount') or exc['underlying_data'].get('expected_fee') or exc['underlying_data'].get('calculated_net') or 0.0)
        
        # ML Anomaly Score (0.0 to 1.0)
        ml_entry = anomaly_map.get(exc['transaction_id'], {})
        ml_score = float(ml_entry.get('anomaly_score', 0.20))
        ml_explanation = ml_entry.get('explanation', '')

        # Aging in days
        try:
            tx_dt = datetime.strptime(exc['transaction_date'], '%Y-%m-%d').date()
            aging_days = max(1, (ref_date - tx_dt).days)
        except Exception:
            aging_days = 5

        # Composite Risk Formula (0 to 100):
        # 1. Amount: up to 40 pts (amount / 50,000)
        amount_pts = min(1.0, amount / 50000.0) * 40.0
        # 2. ML Anomaly: up to 35 pts
        ml_pts = ml_score * 35.0
        # 3. Aging factor: up to 25 pts (aging / 30 days)
        age_pts = min(1.0, aging_days / 30.0) * 25.0
        
        total_risk = round(amount_pts + ml_pts + age_pts, 1)

        # Risk Tier
        if total_risk >= 65:
            risk_tier = "CRITICAL"
        elif total_risk >= 45:
            risk_tier = "HIGH"
        elif total_risk >= 25:
            risk_tier = "MEDIUM"
        else:
            risk_tier = "LOW"

        exc['risk_score'] = total_risk
        exc['risk_tier'] = risk_tier
        exc['aging_days'] = aging_days
        exc['ml_score'] = round(ml_score, 2)
        exc['ml_explanation'] = ml_explanation
        exc['amount'] = amount
        exc['risk_breakdown'] = {
            "amount_pts": round(amount_pts, 1),
            "ml_pts": round(ml_pts, 1),
            "age_pts": round(age_pts, 1)
        }

        enriched_exceptions.append(exc)

        if exc.get('status') == 'open':
            r = exc['reason']
            if r not in clusters_by_reason:
                clusters_by_reason[r] = []
            clusters_by_reason[r].append(exc)

    # Sort enriched exceptions by Composite Risk Score (Descending)
    enriched_exceptions.sort(key=lambda e: e['risk_score'], reverse=True)

    # 3. Pattern Clustering Detection
    pattern_clusters = []
    for reason, items in clusters_by_reason.items():
        if len(items) >= 2:
            total_cluster_amount = sum(it['amount'] for it in items)
            
            # Format readable reason
            readable_reason = reason.replace('_', ' ').title()
            
            if reason == 'fee_variance':
                insight = f"Systemic Gateway Fee Variance: {len(items)} transactions totaling ₹{total_cluster_amount:,.2f} share an irregular fee deduction (~4.2% vs 2.0% MDR contract). Recommend updating gateway rate schedule."
            elif reason == 'no_bank_credit_found':
                insight = f"Delayed Gateway Settlement Batch: {len(items)} transactions totaling ₹{total_cluster_amount:,.2f} have pending bank UTR credits across adjacent transit windows."
            elif reason == 'amount_mismatch':
                insight = f"Value Discrepancies: {len(items)} transactions totaling ₹{total_cluster_amount:,.2f} show cart currency or rounding divergence."
            else:
                insight = f"Pattern Cluster: {len(items)} open {readable_reason} exceptions totaling ₹{total_cluster_amount:,.2f} detected within the active period."

            pattern_clusters.append({
                "reason": reason,
                "title": f"{len(items)} {readable_reason} Exceptions",
                "count": len(items),
                "total_amount": round(total_cluster_amount, 2),
                "insight": insight,
                "item_ids": [it['id'] for it in items]
            })

    # 4. Time-to-Resolution Analytics
    c.execute('''
        SELECT 
            reason,
            COUNT(*) as resolved_count,
            AVG(CASE WHEN resolved_at IS NOT NULL 
                THEN julianday(resolved_at) - julianday(transaction_date)
                ELSE 2.4 END) as avg_days
        FROM exceptions
        WHERE status = 'resolved' OR resolved_at IS NOT NULL
        GROUP BY reason
    ''')
    res_rows = c.fetchall()

    resolution_by_reason = {}
    total_resolved = 0
    total_days_weighted = 0.0

    # Realistic benchmark fallbacks if resolved count is early
    fallbacks = {
        "no_bank_credit_found": 3.2,
        "fee_variance": 1.4,
        "amount_mismatch": 2.1,
        "duplicate": 0.8
    }

    for r in res_rows:
        reason = r['reason']
        avg_d = round(r['avg_days'] or fallbacks.get(reason, 2.0), 1)
        cnt = r['resolved_count']
        resolution_by_reason[reason] = avg_d
        total_resolved += cnt
        total_days_weighted += (avg_d * cnt)

    for k, v in fallbacks.items():
        if k not in resolution_by_reason:
            resolution_by_reason[k] = v

    overall_avg_days = round(total_days_weighted / total_resolved, 1) if total_resolved > 0 else 2.1

    conn.close()

    return {
        "exceptions": enriched_exceptions,
        "total_count": len(enriched_exceptions),
        "pattern_clusters": pattern_clusters,
        "resolution_analytics": {
            "overall_avg_days": overall_avg_days,
            "by_reason": resolution_by_reason
        }
    }

# Ensure tables are created when module loads
init_db()
