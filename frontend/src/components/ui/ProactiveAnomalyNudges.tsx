import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, AlertTriangle, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { api } from '../../api/client';
import { useAI } from '../../context/AIContext';

export interface AnomalyNudge {
  id: string;
  title: string;
  type: string;
  severity: 'positive' | 'warning' | 'danger' | 'info';
  observation: string;
  metric: string;
  suggested_action: string;
  suggested_question: string;
}

export const ProactiveAnomalyNudges: React.FC = () => {
  const [nudges, setNudges] = useState<AnomalyNudge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { askAboutElement } = useAI();

  useEffect(() => {
    const fetchNudges = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/analytics/proactive-nudges');
        setNudges(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNudges();
  }, []);

  if (isLoading || nudges.length === 0) return null;

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'positive':
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: ShieldCheck };
      case 'warning':
        return { bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: AlertTriangle };
      case 'danger':
        return { bg: 'bg-rose-50 text-rose-800 border-rose-200', icon: AlertCircle };
      case 'info':
      default:
        return { bg: 'bg-blue-50 text-blue-800 border-blue-200', icon: Info };
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#1E293B] text-white flex items-center justify-center font-bold text-[10px] font-mono shrink-0">
            F
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Fino Noticed Today — Proactive Controller Observations</span>
              <Sparkles size={14} className="text-amber-500" />
            </h3>
            <p className="text-xs text-slate-500">Live deterministic anomaly signals evaluated across ledger &amp; tax feeds (Ramp / Brex copilot pattern)</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto font-mono">
          {nudges.length} Live Signals
        </span>
      </div>

      {/* Grid of Proactive Signal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {nudges.map((nudge) => {
          const badge = getSeverityBadge(nudge.severity);
          const IconComponent = badge.icon;

          return (
            <div
              key={nudge.id}
              className="bg-white border border-slate-200/90 rounded-xl p-3.5 flex flex-col justify-between space-y-3 hover:border-slate-300 hover:shadow-2xs transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${badge.bg}`}>
                    <IconComponent size={11} />
                    <span>{nudge.metric}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">
                    {nudge.type.replace(/_/g, ' ')}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {nudge.title}
                </h4>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {nudge.observation}
                </p>
              </div>

              {/* 1-Click Ask Action Pill */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">
                  {nudge.suggested_action}
                </span>
                <button
                  onClick={() => askAboutElement(nudge.suggested_question)}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-[#1E293B] text-slate-700 hover:text-white border border-slate-200 hover:border-[#1E293B] rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer group shadow-2xs"
                  title="Ask Fino to investigate this observation"
                >
                  <span>Investigate</span>
                  <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
