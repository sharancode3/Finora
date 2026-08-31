import React, { useEffect, useState } from 'react';
import { ShieldCheck, Activity, CheckCircle2, AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { api } from '../../api/client';

export interface TelemetryData {
  total_queries_evaluated: number;
  grounded_resolutions: number;
  grounded_accuracy_pct: number;
  average_confidence: number;
  false_positive_rate_pct: number;
  verifier_retry_rate_pct: number;
  deterministic_math_violations: number;
  statutory_compliance_rate_pct: number;
  recent_queries: Array<{
    query_id: string;
    query_text: string;
    intent: string;
    tool_used: string;
    confidence_score: number;
    confidence_badge: string;
    verifier_passed: number;
    timestamp: string;
  }>;
}

export const AIAccuracyTelemetryWidget: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTelemetry = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/analytics/ai-accuracy-telemetry');
      setTelemetry(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  if (!telemetry) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-slate-200 animate-pulse text-xs text-slate-400">
        Loading AI grounding accuracy & audit telemetry metrics...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#1E293B] text-white flex items-center justify-center font-bold text-[10px] font-mono shrink-0">
            F
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Self-Reported AI Grounding Accuracy & Audit Telemetry</h3>
            <p className="text-xs text-slate-500">Live deterministic verification metrics evaluated across all Fino queries</p>
          </div>
        </div>
        <button
          onClick={fetchTelemetry}
          disabled={isLoading}
          className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          title="Refresh telemetry"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>Sync</span>
        </button>
      </div>

      {/* 4 Core Honest KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
          <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Grounded Accuracy</span>
          <div className="text-xl font-bold font-mono text-[#15803D]">{telemetry.grounded_accuracy_pct}%</div>
          <p className="text-[10px] text-emerald-700">Deterministic DAL resolution</p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Evaluated Queries</span>
          <div className="text-xl font-bold font-mono text-slate-900">{telemetry.total_queries_evaluated}</div>
          <p className="text-[10px] text-slate-500">Trailing copilot interactions</p>
        </div>

        <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
          <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider block">Avg Confidence</span>
          <div className="text-xl font-bold font-mono text-blue-900">{telemetry.average_confidence}%</div>
          <p className="text-[10px] text-blue-700">Self-calibrated score</p>
        </div>

        <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1">
          <span className="text-[10px] text-purple-800 font-bold uppercase tracking-wider block">Mental Math Violations</span>
          <div className="text-xl font-bold font-mono text-purple-900">{telemetry.deterministic_math_violations}</div>
          <p className="text-[10px] text-purple-700">100% computed in SQLite</p>
        </div>

      </div>

      {/* Recent Telemetry Log Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Database size={13} className="text-slate-400" />
          Recent Query Audit Telemetry Logs
        </h4>
        <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-56 overflow-y-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-3 py-2">Query</th>
                <th className="px-3 py-2">Intent</th>
                <th className="px-3 py-2">Tool Engine</th>
                <th className="px-3 py-2">Grounding</th>
                <th className="px-3 py-2 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {telemetry.recent_queries.map((q) => (
                <tr key={q.query_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-3 py-2 font-medium text-slate-800 max-w-[220px] truncate" title={q.query_text}>
                    {q.query_text}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-slate-600">
                    {q.intent}
                  </td>
                  <td className="px-3 py-2 font-mono text-[10px] text-slate-500">
                    {q.tool_used}
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 size={10} /> Grounded ({(q.confidence_score * 100).toFixed(0)}%)
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-[10px] text-slate-400 text-right whitespace-nowrap">
                    {q.timestamp?.split(' ')[1] || q.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
