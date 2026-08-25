import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Receipt, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  RotateCw, 
  Filter, 
  Search, 
  FileText, 
  Building, 
  ArrowUpRight, 
  Info, 
  HelpCircle,
  Clock,
  Download,
  Send,
  X,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Percent,
  TrendingDown,
  Layers
} from 'lucide-react';
import { useAI } from '../context/AIContext';
import { useTheme } from '../context/ThemeContext';
import { AskableMetric } from '../components/ui/AskableMetric';
import { FormattedMarkdown } from '../components/ui/FormattedMarkdown';
import { InstitutionLogo } from '../components/ui/InstitutionLogo';
import { GroundedDeltaExplainer } from '../components/ui/GroundedDeltaExplainer';
import { FinoraMark } from '../components/ui/FinoraMark';

interface TaxSummary {
  total_tax_records: number;
  matched_records: number;
  exception_records: number;
  tax_match_rate_pct: number;
  value_match_rate_pct: number;
  value_gap_explanation?: string;
  total_itc_claimed: number;
  eligible_itc_confirmed: number;
  blocked_itc_at_risk: number;
  total_tax_variance: number;
  tds_compliance_rate_pct: number;
  exceptions_by_type: Record<string, number>;
  scope_period: string;
  last_reconciliation_time: string;
}

interface TaxRecord {
  match_id: string;
  tax_line_id: string;
  related_tx_id?: string;
  tax_type: string;
  counterparty_name: string;
  counterparty_identifier: string;
  invoice_ref: string;
  invoice_date: string;
  tds_section?: string;
  ledger_taxable_value: number;
  ledger_tax_amount: number;
  portal_taxable_value: number;
  portal_tax_amount: number;
  taxable_variance: number;
  tax_variance: number;
  status: string;
  match_stage: string;
  confidence_score: number;
  ai_explanation: string;
  impact_on_itc: string;
  suggested_remedy: string;
  resolved: boolean;
  resolution_notes?: string;
}

export default function TaxLineMatcher() {
  const { askAboutElement, setBannerMessage } = useAI();
  const { isDark } = useTheme();

  const [summary, setSummary] = useState<TaxSummary | null>(null);
  const [records, setRecords] = useState<TaxRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReRunning, setIsReRunning] = useState(false);
  const [scopePeriod, setScopePeriod] = useState('2026-08');

  // Filters
  const [taxTypeFilter, setTaxTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected record for audit drawer
  const [selectedRecord, setSelectedRecord] = useState<TaxRecord | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    fetchTaxData();
  }, [scopePeriod]);

  const fetchTaxData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, recRes] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/v1/tax-matcher/summary?scope=${scopePeriod}`),
        axios.get(`http://127.0.0.1:8000/api/v1/tax-matcher/records?scope=${scopePeriod}`)
      ]);
      setSummary(sumRes.data);
      setRecords(recRes.data);
    } catch (err) {
      console.error('Failed to fetch tax match data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReRun = async () => {
    setIsReRunning(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/v1/tax-matcher/re-run', {
        scope_period: scopePeriod,
        tolerance: 1.0
      });
      setSummary(res.data.summary);
      setRecords(res.data.records);
      setBannerMessage(`Tax reconciliation completed: ${res.data.summary.tax_match_rate_pct}% match rate across ${res.data.summary.total_tax_records} tax lines.`);
    } catch (err) {
      console.error('Tax re-run error:', err);
    } finally {
      setIsReRunning(false);
    }
  };

  const handleResolve = async (action: string) => {
    if (!selectedRecord) return;
    setIsResolving(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/v1/tax-matcher/resolve-exception', {
        match_id: selectedRecord.match_id,
        action: action,
        note: resolutionNote || 'Remediated in controller review.',
        scope_period: scopePeriod
      });
      
      // Update local state
      setRecords(prev => prev.map(r => r.match_id === selectedRecord.match_id ? res.data.record : r));
      setSummary(res.data.summary);
      setSelectedRecord(res.data.record);
      setResolutionNote('');
      setBannerMessage(`Tax exception ${selectedRecord.match_id} successfully resolved.`);
    } catch (err) {
      console.error('Failed to resolve tax exception:', err);
    } finally {
      setIsResolving(false);
    }
  };

  const filteredRecords = records.filter(r => {
    if (taxTypeFilter !== 'all' && r.tax_type.toLowerCase() !== taxTypeFilter.toLowerCase()) return false;
    if (statusFilter !== 'all' && r.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchVendor = r.counterparty_name.toLowerCase().includes(q);
      const matchGstin = r.counterparty_identifier.toLowerCase().includes(q);
      const matchInv = r.invoice_ref.toLowerCase().includes(q);
      const matchId = r.tax_line_id.toLowerCase().includes(q);
      if (!matchVendor && !matchGstin && !matchInv && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tax-Line Matcher</h1>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#F0FDF4] px-2.5 py-0.5 rounded-full border border-[#BBF7D0] inline-flex items-center gap-1">
              <ShieldCheck size={12} /> GSTR-2B &amp; TRACES Verified
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            Deterministic 3-stage GST &amp; TDS tax reconciliation matching purchase register against GSTN GSTR-2B portal feeds.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center gap-2.5">
          <select
            value={scopePeriod}
            onChange={(e) => setScopePeriod(e.target.value)}
            className="bg-white border border-[#E4E4E7] text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E293B] shadow-2xs"
          >
            <option value="2026-08">August 2026 (Active Period)</option>
            <option value="2026-07">July 2026 (Closed Period)</option>
          </select>

          <button
            onClick={handleReRun}
            disabled={isReRunning}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RotateCw size={14} className={isReRunning ? 'animate-spin' : ''} />
            <span>{isReRunning ? 'Matching Lines...' : 'Run Tax Reconciliation'}</span>
          </button>
        </div>
      </div>

      {/* SUMMARY KPI CARDS (ALL ASKABLE WITH PHASE 4 AFFORDANCE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Tax Match Rate */}
        <div className="p-4 bg-white border border-[#E4E4E7] rounded-2xl shadow-xs space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tax Match Rate</span>
          <div className="flex items-baseline justify-between">
            <AskableMetric
              label="Tax Match Rate"
              value={`${summary?.tax_match_rate_pct || 0}%`}
              customQuestion={`Why is the Tax Match Rate ${summary?.tax_match_rate_pct || 0}% for period ${scopePeriod}? Please explain the un-reconciled tax lines and variance breakdown.`}
              className="text-2xl font-extrabold text-slate-900 font-mono"
            />
            <span className="text-[11px] font-bold text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-md border border-[#BBF7D0]">
              {summary?.matched_records || 0} / {summary?.total_tax_records || 0} Lines
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Monetary Value Match Rate: <strong className="text-slate-800 font-mono">{summary?.value_match_rate_pct || 0}%</strong>
          </p>
        </div>

        {/* Card 2: Eligible Input Tax Credit (ITC) */}
        <div className="p-4 bg-white border border-[#E4E4E7] rounded-2xl shadow-xs space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Eligible GSTR-2B ITC</span>
          <div className="flex items-baseline justify-between">
            <AskableMetric
              label="Eligible Input Tax Credit"
              value={`₹${(summary?.eligible_itc_confirmed || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              customQuestion={`Explain our eligible Input Tax Credit of ₹${(summary?.eligible_itc_confirmed || 0).toLocaleString('en-IN')} confirmed in GSTR-2B for ${scopePeriod}.`}
              className="text-2xl font-extrabold text-[#15803D] font-mono"
            />
            <span className="text-[11px] font-bold text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-md border border-[#BBF7D0]">
              Confirmed
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Total Claimed: <strong className="text-slate-800 font-mono">₹{(summary?.total_itc_claimed || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </p>
        </div>

        {/* Card 3: Blocked ITC at Risk */}
        <div className="p-4 bg-white border border-[#E4E4E7] rounded-2xl shadow-xs space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Blocked ITC at Risk</span>
          <div className="flex items-baseline justify-between">
            <AskableMetric
              label="Blocked ITC at Risk"
              value={`₹${(summary?.blocked_itc_at_risk || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              customQuestion={`Why is ₹${(summary?.blocked_itc_at_risk || 0).toLocaleString('en-IN')} of Input Tax Credit blocked for period ${scopePeriod}? Walk me through the unfiled vendor invoices.`}
              className="text-2xl font-extrabold text-[#B91C1C] font-mono"
            />
            <span className="text-[11px] font-bold text-[#B91C1C] bg-[#FEF2F2] px-2 py-0.5 rounded-md border border-[#FECACA]">
              Rule 36(4)
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Vendor GSTR-1 unfiled (Delhivery Logistics)
          </p>
        </div>

        {/* Card 4: TDS Section Compliance */}
        <div className="p-4 bg-white border border-[#E4E4E7] rounded-2xl shadow-xs space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">TDS Compliance Rate</span>
          <div className="flex items-baseline justify-between">
            <AskableMetric
              label="TDS Compliance Rate"
              value={`${summary?.tds_compliance_rate_pct || 0}%`}
              customQuestion={`Explain our TDS compliance rate of ${summary?.tds_compliance_rate_pct || 0}% and the Section 194C vs 194J misclassifications for ${scopePeriod}.`}
              className="text-2xl font-extrabold text-slate-900 font-mono"
            />
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              194C / 194J / 194H
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Sec 194J misclassification flagged
          </p>
        </div>

      </div>

      {/* COUNT VS. MONETARY VALUE MATCH RATE GAP EXPLANATION (REUSABLE COMPONENT) */}
      <GroundedDeltaExplainer
        title="Tax Match Rate Divergence Analysis"
        metricA={{
          label: "Count Match Rate",
          value: `${summary?.tax_match_rate_pct || 91.4}% (${summary?.matched_records || 64}/${summary?.total_tax_records || 70} lines)`
        }}
        metricB={{
          label: "Monetary Value Match Rate",
          value: `${summary?.value_match_rate_pct || 47.9}% (₹2,98,603.50 base)`
        }}
        badgeLabel="Skew Driver Identified"
        badgeVariant="danger"
        explanation={summary?.value_gap_explanation || (
          <span>
            The 64 routine payment gateway fee lines (Razorpay, ₹18–₹120 each) reconcile at 98%+ by count, while a single unfiled supplier invoice from <strong>Delhivery Supply Chain Logistics Ltd</strong> (₹3,312.00 GST blocked under Rule 36(4)) and an <strong>AWS cloud credit variance</strong> (₹340.00) dominate over half of the month's total taxable volume.
          </span>
        )}
        outliers={[
          {
            name: "Delhivery Supply Chain Logistics Ltd",
            amount: 3312.0,
            detail: "Unfiled GSTR-1 supplier invoice blocking input tax credit",
            rule: "CGST Rule 36(4)"
          },
          {
            name: "Amazon Web Services (AWS Cloud)",
            amount: 340.0,
            detail: "GST credit timing mismatch across multi-region billings",
            rule: "GSTR-2B Variance"
          }
        ]}
        customQuestion={`Explain why our Tax Match Rate is ${summary?.tax_match_rate_pct || 91.4}% by count but only ${summary?.value_match_rate_pct || 47.9}% by monetary value for period ${scopePeriod}.`}
      />

      {/* FILTER & SEARCH BAR */}
      <div className="p-3.5 bg-white border border-[#E4E4E7] rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
            <Filter size={11} /> Filters:
          </span>

          {/* Tax Type Filter */}
          <select
            value={taxTypeFilter}
            onChange={(e) => setTaxTypeFilter(e.target.value)}
            className="bg-slate-50 border border-[#E4E4E7] rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Tax Types</option>
            <option value="gst">GST (GSTR-2B)</option>
            <option value="tds">TDS Withholding</option>
          </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-[#E4E4E7] rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses ({records.length})</option>
              <option value="matched">Matched Clean ({records.filter(r => r.status === 'matched').length})</option>
              <option value="missing_gstr2b">Missing GSTR-2B ({records.filter(r => r.status === 'missing_gstr2b').length})</option>
              <option value="amount_discrepancy">Amount Discrepancy ({records.filter(r => r.status === 'amount_discrepancy').length})</option>
              <option value="rate_mismatch">Rate Mismatch ({records.filter(r => r.status === 'rate_mismatch').length})</option>
              <option value="tds_section_misclassification">TDS Misclassification ({records.filter(r => r.status === 'tds_section_misclassification').length})</option>
              <option value="unmatched_portal_entry">Unclaimed Portal Credits ({records.filter(r => r.status === 'unmatched_portal_entry').length})</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendor, GSTIN, invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-[#E4E4E7] rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1E293B]"
            />
          </div>
        </div>

        {/* INTERACTIVE TAX RECONCILIATION TABLE */}
        <div className="bg-white rounded-2xl border border-[#E4E4E7] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E4E4E7] flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Tax Line Reconciliation Records
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md font-semibold">
                Showing {filteredRecords.length} of {records.length}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Last synced: {summary?.last_reconciliation_time || 'Just now'}
            </span>
          </div>

            {isLoading ? (
              <div className="p-16 text-center text-slate-400 space-y-3">
                <RotateCw size={24} className="animate-spin text-[#1E293B] mx-auto" />
                <p className="text-xs font-medium">Executing deterministic tax-line reconciliation...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <Receipt size={32} className="mx-auto text-slate-300" />
                <p className="text-xs font-medium">No tax line records match current filter criteria.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Tax ID / Section</th>
                    <th className="py-3 px-4">Vendor &amp; GSTIN/TAN</th>
                    <th className="py-3 px-4">Invoice Reference</th>
                    <th className="py-3 px-4 text-right">Ledger Tax</th>
                    <th className="py-3 px-4 text-right">Portal Tax</th>
                    <th className="py-3 px-4 text-right">Variance</th>
                    <th className="py-3 px-4">Compliance Status</th>
                    <th className="py-3 px-4 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredRecords.map((rec) => {
                    const isClean = rec.status === 'matched';
                    const isMissingGSTR = rec.status === 'missing_gstr2b';
                    const isAmountDiscrepancy = rec.status === 'amount_discrepancy';
                    const isRateMismatch = rec.status === 'rate_mismatch';
                    const isTDSMisclass = rec.status === 'tds_section_misclassification';
                    const isOrphanPortal = rec.status === 'unmatched_portal_entry';

                    return (
                      <tr 
                        key={rec.match_id}
                        onClick={() => setSelectedRecord(rec)}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                          selectedRecord?.match_id === rec.match_id ? 'bg-slate-50 font-bold' : ''
                        }`}
                      >
                        {/* Column 1: Tax ID & Section */}
                        <td className="py-3 px-4 font-sans">
                          <span className="font-bold text-slate-900 block">{rec.tax_line_id}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {rec.tax_type} {rec.tds_section ? `Sec ${rec.tds_section}` : '18%'}
                          </span>
                        </td>

                        {/* Column 2: Vendor & GSTIN */}
                        <td className="py-3 px-4 font-sans max-w-xs">
                          <div className="flex items-center gap-2.5">
                            <InstitutionLogo name={rec.counterparty_name} size="xs" />
                            <div className="truncate">
                              <span className="font-semibold text-slate-900 block truncate" title={rec.counterparty_name}>
                                {rec.counterparty_name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 block truncate">
                                {rec.counterparty_identifier}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Column 3: Invoice Ref & Date */}
                        <td className="py-3 px-4 font-sans">
                          <span className="font-medium text-slate-800 block">{rec.invoice_ref}</span>
                          <span className="text-[10px] text-slate-400">{rec.invoice_date}</span>
                        </td>

                        {/* Column 4: Ledger Tax */}
                        <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                          {rec.ledger_tax_amount > 0 ? `₹${rec.ledger_tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                        </td>

                        {/* Column 5: Portal Tax */}
                        <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                          {rec.portal_tax_amount > 0 ? `₹${rec.portal_tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                        </td>

                        {/* Column 6: Variance */}
                        <td className="py-3 px-4 text-right font-mono">
                          {rec.tax_variance !== 0 ? (
                            <span className="font-bold text-[#B91C1C]">
                              ₹{Math.abs(rec.tax_variance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-slate-300">₹0.00</span>
                          )}
                        </td>

                        {/* Column 7: Status Badge */}
                        <td className="py-3 px-4 font-sans">
                          {isClean ? (
                            <span className="text-[9px] font-bold text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-full border border-[#BBF7D0] inline-flex items-center gap-1">
                              <CheckCircle2 size={10} /> Reconciled
                            </span>
                          ) : isMissingGSTR ? (
                            <span className="text-[9px] font-bold text-[#B91C1C] bg-[#FEF2F2] px-2 py-0.5 rounded-full border border-[#FECACA] inline-flex items-center gap-1">
                              <ShieldAlert size={10} /> Unfiled GSTR-1
                            </span>
                          ) : isAmountDiscrepancy ? (
                            <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1">
                              <AlertTriangle size={10} /> Amount Discrepancy
                            </span>
                          ) : isRateMismatch ? (
                            <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1">
                              <AlertTriangle size={10} /> Rate Mismatch
                            </span>
                          ) : isTDSMisclass ? (
                            <span className="text-[9px] font-bold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#DBEAFE] inline-flex items-center gap-1">
                              <AlertTriangle size={10} /> TDS Sec Misclass
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#DBEAFE] inline-flex items-center gap-1">
                              <Info size={10} /> Unclaimed ITC
                            </span>
                          )}
                        </td>

                      {/* Column 8: Audit Details Action */}
                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(rec);
                          }}
                          className="text-[11px] font-bold text-[#1E293B] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight size={12} />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      {/* AUDIT & REMEDIATION DRAWER / MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E4E4E7] shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E4E4E7] flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-[#1E293B]">
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Tax Audit Inspection — {selectedRecord.tax_line_id}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {selectedRecord.counterparty_name} • Invoice: {selectedRecord.invoice_ref}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Side-by-Side Tax Comparison */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Left: Internal Purchase Register */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Internal Purchase Register
                  </span>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Taxable Value:</span>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{selectedRecord.ledger_taxable_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tax Amount ({selectedRecord.tax_type}):</span>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{selectedRecord.ledger_tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Invoice Date:</span>
                      <span className="font-mono text-slate-700">{selectedRecord.invoice_date}</span>
                    </div>
                  </div>
                </div>

                {/* Right: GSTN / Portal Feed */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    GSTN GSTR-2B / TRACES Feed
                  </span>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Taxable Value:</span>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{selectedRecord.portal_taxable_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tax Amount ({selectedRecord.tax_type}):</span>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{selectedRecord.portal_tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">GSTIN / TAN:</span>
                      <span className="font-mono text-slate-700">{selectedRecord.counterparty_identifier}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* AI Reasoned Explanation */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                    <FinoraMark size={14} />
                    Grounded AI Tax Compliance Audit
                  </span>
                  <span className="text-[10px] font-bold text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                    {selectedRecord.match_stage}
                  </span>
                </div>
                <FormattedMarkdown content={selectedRecord.ai_explanation} className="text-slate-700 text-xs" />
              </div>

              {/* Recommended Controller Remedy */}
              <div className="p-3.5 bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl space-y-1 text-xs">
                <strong className="text-slate-900 font-semibold block flex items-center gap-1.5">
                  <Info size={13} className="text-[#1D4ED8]" /> Recommended Remediation:
                </strong>
                <p className="text-slate-700">{selectedRecord.suggested_remedy}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResolve(selectedRecord.suggested_remedy)}
                    disabled={isResolving || selectedRecord.resolved}
                    className="flex-1 py-2.5 bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    {selectedRecord.resolved ? '✓ Already Resolved' : 'Apply Recommended Action'}
                  </button>

                  <button
                    onClick={() => {
                      askAboutElement(
                        `Tax Line ${selectedRecord.tax_line_id} (₹${selectedRecord.ledger_tax_amount}, ${selectedRecord.counterparty_name}): Audit tax discrepancy on invoice ${selectedRecord.invoice_ref}. ${selectedRecord.ai_explanation}`
                      );
                      setSelectedRecord(null);
                    }}
                    className="py-2.5 px-4 bg-white border border-[#E4E4E7] hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <div className="w-3.5 h-3.5 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[8px] font-mono shrink-0">F</div>
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
