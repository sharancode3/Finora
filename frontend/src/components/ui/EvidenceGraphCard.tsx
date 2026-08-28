import React from 'react';
import { BookOpen, CreditCard, Building2, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { AmountDisplay } from './AmountDisplay';
import { useAI } from '../../context/AIContext';

export interface EvidenceNodeData {
  orderId?: string;
  grossAmount?: number;
  orderDate?: string;
  customer?: string;
  gateway?: string;
  feeAmount?: number;
  feeRate?: number;
  gstAmount?: number;
  expectedNet?: number;
  bankAccount?: string;
  utr?: string;
  actualSettled?: number;
  settlementDate?: string;
  transitDays?: number;
  status?: 'settled' | 'open' | 'delayed' | 'fee_variance';
}

export interface EvidenceGraphCardProps {
  data: EvidenceNodeData;
  className?: string;
  onInspectNode?: (nodeKey: string) => void;
}

export const EvidenceGraphCard: React.FC<EvidenceGraphCardProps> = ({
  data,
  className = '',
  onInspectNode
}) => {
  const { askAboutElement } = useAI();

  const isFeeDiscrepancy = (data.feeRate && data.feeRate > 2.05) || (data.status === 'fee_variance');
  const isTransitDelay = (data.transitDays && data.transitDays > 2) || (data.status === 'delayed') || (!data.utr && data.status !== 'settled');
  const isSettled = data.status === 'settled' && Boolean(data.utr);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-6 ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">3-Way Traceability Graph</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-[#5B45F5] border border-violet-200">
              Audit Evidence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Continuous verification flow from internal checkout to bank statement deposit.</p>
        </div>
      </div>

      {/* 3 Connected Nodes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative">
        
        {/* Node 1: Internal Sales Order */}
        <div 
          onClick={() => onInspectNode && onInspectNode('order')}
          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer relative flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                <BookOpen size={16} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Source 1</span>
                <h4 className="text-xs font-bold text-slate-900">Internal Order</h4>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#F0FDF4] px-1.5 py-0.5 rounded border border-[#BBF7D0]">
              Verified
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Order ID:</span>
              <span className="font-mono font-bold text-slate-900">{data.orderId || 'ORD-2026-AUG'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Gross Charge:</span>
              <span className="font-mono font-bold text-slate-900">₹{(data.grossAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span className="text-slate-700">{data.orderDate || '2026-08-28'}</span>
            </div>
          </div>
        </div>

        {/* Node 2: Razorpay Gateway Settlement */}
        <div 
          onClick={() => onInspectNode && onInspectNode('gateway')}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-3 ${
            isFeeDiscrepancy 
              ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300' 
              : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg border ${isFeeDiscrepancy ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                <CreditCard size={16} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Source 2</span>
                <h4 className="text-xs font-bold text-slate-900">{data.gateway || 'Razorpay'}</h4>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              isFeeDiscrepancy 
                ? 'text-[#B45309] bg-[#FFFBEB] border-[#FEF3C7]' 
                : 'text-[#15803D] bg-[#F0FDF4] border-[#BBF7D0]'
            }`}>
              {isFeeDiscrepancy ? 'Fee Variance' : 'MDR Reconciled'}
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">MDR Fee (2.0%):</span>
              <span className="font-mono font-bold text-slate-900">₹{(data.feeAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">GST (18% on Fee):</span>
              <span className="font-mono text-slate-700">₹{(data.gstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200/60 pt-1">
              <span className="text-slate-700 font-medium">Expected Net:</span>
              <span className="font-mono font-bold text-[#15803D]">₹{(data.expectedNet || (data.grossAmount || 0) - (data.feeAmount || 0) - (data.gstAmount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Node 3: Bank Account Credit */}
        <div 
          onClick={() => onInspectNode && onInspectNode('bank')}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-3 ${
            isTransitDelay 
              ? 'bg-red-50/40 border-red-200 hover:border-red-300' 
              : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg border ${isTransitDelay ? 'bg-red-100 text-red-800 border-red-300' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                <Building2 size={16} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Source 3</span>
                <h4 className="text-xs font-bold text-slate-900">{data.bankAccount || 'Kotak / HDFC Bank'}</h4>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              isTransitDelay 
                ? 'text-[#B91C1C] bg-[#FEF2F2] border-[#FECACA]' 
                : 'text-[#15803D] bg-[#F0FDF4] border-[#BBF7D0]'
            }`}>
              {isTransitDelay ? 'Delayed / Missing' : 'Deposit Confirmed'}
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Bank UTR Ref:</span>
              <span className="font-mono font-bold text-slate-900 truncate max-w-[140px]">{data.utr || 'Pending Settlement'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Net Credit:</span>
              <span className="font-mono font-bold text-[#15803D]">
                {data.actualSettled !== undefined 
                  ? `₹${data.actualSettled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` 
                  : (isTransitDelay ? '₹0.00 (In Transit)' : '₹' + (data.expectedNet || 0).toLocaleString('en-IN'))
                }
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200/60 pt-1">
              <span className="text-slate-700 font-medium">Settlement SLA:</span>
              <span className={`font-medium ${isTransitDelay ? 'text-[#B91C1C] font-bold' : 'text-slate-700'}`}>
                {data.transitDays ? `${data.transitDays} Days (${data.transitDays > 2 ? 'Overdue' : 'On-Time'})` : 'T+2 Standard'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
