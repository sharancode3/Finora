import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { FileCode, ArrowLeft, Link as LinkIcon, AlertCircle, Database, Search } from 'lucide-react';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { SeverityBadge } from '../components/ui/SeverityBadge';

export default function RecordDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [record, setRecord] = useState<any>(null);
  const [evidenceTrail, setEvidenceTrail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      try {
        if (type === 'exception') {
          const res = await api.get(`/records/exceptions/${id}`);
          setRecord(res.data);
          setEvidenceTrail(res.data.evidence_trail);
        } else {
          // generic fallback for settlements/ledger/bank
          const endpoint = type === 'bank' ? 'bank-transactions' : `${type}s`;
          const res = await api.get(`/records/${endpoint}/${id}`);
          setEvidenceTrail(res.data);
          // the record itself is inside the trail
          if (type === 'settlement') setRecord(res.data.settlement);
          else if (type === 'ledger') setRecord(res.data.ledger_entry);
          else if (type === 'bank') setRecord(res.data.bank_transaction);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.detail || 'Failed to fetch record');
      } finally {
        setLoading(false);
      }
    };
    
    if (id && type) {
      fetchRecord();
    }
  }, [type, id]);

  if (loading) {
    return <div className="p-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-accent"></div></div>;
  }

  if (error || !record) {
    return (
      <div className="p-20 text-center text-slate-500">
        <AlertCircle size={48} className="mx-auto text-rose-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Record Not Found</h2>
        <p className="mt-2">{error}</p>
        <Link to="/exceptions" className="mt-4 inline-block text-primary-accent hover:underline">&larr; Back to Exceptions</Link>
      </div>
    );
  }

  // Format JSON beautifully
  const jsonString = JSON.stringify(record, null, 2);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link to=".." onClick={(e) => { e.preventDefault(); window.history.back(); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-500" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            {type === 'exception' ? 'Exception Details' : 'Record Details'}
            {type === 'exception' && record.severity && <SeverityBadge severity={record.severity} />}
          </h2>
          <p className="text-slate-500 font-mono text-sm mt-1">{id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Raw JSON View */}
        <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 flex flex-col h-[700px] overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
            <FileCode size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-300 font-mono">raw_data.json</h3>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-[#0d1117]">
            <pre className="text-[13px] leading-relaxed text-slate-300 font-mono">
              {jsonString.split('\n').map((line, i) => (
                <div key={i} className="flex hover:bg-slate-800/50 px-2 rounded">
                  <span className="w-8 shrink-0 text-slate-600 select-none text-right pr-4">{i + 1}</span>
                  <span className={`${line.includes('":') ? 'text-blue-300' : ''} ${line.includes('null') ? 'text-slate-500' : ''}`}>{line}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>

        {/* Right Column: Evidence Graph / Flow */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-6 flex items-center gap-2">
              <LinkIcon size={16} className="text-primary-accent" /> Reconciliation Flow
            </h3>

            {/* Visual Flow diagram */}
            <div className="relative flex flex-col items-center justify-center py-4 space-y-6">
              
              <div className="absolute left-1/2 top-10 bottom-10 w-0.5 bg-slate-200 -translate-x-1/2 z-0"></div>

              {/* Settlement Node */}
              <div className={`relative z-10 w-full max-w-sm bg-white p-4 rounded-xl border-2 shadow-sm ${evidenceTrail?.settlement ? 'border-indigo-200' : 'border-dashed border-slate-200 opacity-60'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settlement Record</span>
                  {evidenceTrail?.settlement && <CheckCircleIcon />}
                </div>
                {evidenceTrail?.settlement ? (
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-slate-600">{evidenceTrail.settlement.id.substring(0, 12)}...</span>
                    <span className="font-bold text-slate-900"><AmountDisplay amount={evidenceTrail.settlement.amount} /></span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">Not found in batch</div>
                )}
              </div>

              {/* Match Result Node */}
              <div className={`relative z-10 flex flex-col items-center justify-center p-3 rounded-full border-2 bg-white ${type === 'exception' ? 'border-rose-400 text-rose-500' : 'border-emerald-400 text-emerald-500'}`}>
                {type === 'exception' ? <AlertCircle size={24} /> : <LinkIcon size={24} />}
                <div className="absolute top-1/2 left-full ml-4 -translate-y-1/2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg whitespace-nowrap shadow-sm text-xs font-medium text-slate-600">
                  {type === 'exception' ? record.reason : 'MATCHED'}
                </div>
              </div>

              {/* Ledger Node */}
              <div className={`relative z-10 w-full max-w-sm bg-white p-4 rounded-xl border-2 shadow-sm ${evidenceTrail?.ledger_entry ? 'border-indigo-200' : 'border-dashed border-slate-200 opacity-60'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ledger Entry</span>
                  {evidenceTrail?.ledger_entry && <CheckCircleIcon />}
                </div>
                {evidenceTrail?.ledger_entry ? (
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-slate-600">{evidenceTrail.ledger_entry.id.substring(0, 12)}...</span>
                    <span className="font-bold text-slate-900"><AmountDisplay amount={evidenceTrail.ledger_entry.amount} /></span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">Not matched</div>
                )}
              </div>

            </div>
          </div>

          <div className="bg-white rounded-xl border border-border shadow-sm p-6 flex-1">
             <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Search size={16} className="text-primary-accent" /> Investigation Notes
            </h3>
            {type === 'exception' ? (
              <div className="space-y-4">
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg text-sm text-rose-800">
                  <span className="font-bold block mb-1">Exception Detected</span>
                  The automated reconciliation engine could not confidently match this record. The primary failure reason is identified as <strong>{record.reason}</strong>.
                </div>
                
                {record.ai_summary && (
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-900">
                    <span className="font-bold block mb-1">AI Context</span>
                    {record.ai_summary}
                  </div>
                )}
                
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Action Required</h4>
                  <p className="text-sm text-slate-700">{record.recommended_action || 'Manual review required.'}</p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">
                This record was matched successfully during the batch process. No further investigation is required.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}
