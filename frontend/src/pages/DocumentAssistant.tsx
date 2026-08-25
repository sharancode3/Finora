import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { pluralize } from '../utils/formatters';
import { InstitutionLogo } from '../components/ui/InstitutionLogo';
import axios from 'axios';
import { 
  UploadCloud, 
  FileText, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Loader2, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight,
  Database,
  Info,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Tag,
  BookOpen,
  Filter,
  Image as ImageIcon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { FormattedMarkdown } from '../components/ui/FormattedMarkdown';

interface ParsedRow {
  line_number: number;
  date: string;
  description: string;
  reference_no: string;
  debit: number;
  credit: number;
  balance: number;
  category: string;
  flags: string[];
}

interface DocumentSummary {
  total_debit: number;
  total_credit: number;
  net_flow: number;
  bank_charges_total: number;
  gateway_settlement_total: number;
  date_range: string;
  is_isolated_sandbox: boolean;
}

interface DocumentData {
  doc_id: string;
  filename: string;
  file_type: string;
  total_rows: number;
  summary: DocumentSummary;
  rows: ParsedRow[];
  sample_questions: string[];
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  metadata?: {
    confidence?: string;
    confidence_score?: number;
    highlighted_rows?: number[];
    knowledge_citation?: any;
    evidence_trail?: any[];
    reasoning_trail?: any[];
  };
}

export default function DocumentAssistant() {
  const { isDark } = useTheme();
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [samples, setSamples] = useState<any[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [highlightedRowMap, setHighlightedRowMap] = useState<Record<number, boolean>>({});
  const [expandedReasoningMap, setExpandedReasoningMap] = useState<Record<number, boolean>>({});

  const categoryStats = useMemo(() => {
    if (!documentData || !documentData.rows) return {};
    const stats: Record<string, { count: number; total: number }> = {
      bank_fee: { count: 0, total: 0 },
      gateway: { count: 0, total: 0 },
      tax: { count: 0, total: 0 },
      vendor: { count: 0, total: 0 }
    };
    documentData.rows.forEach(r => {
      const cat = r.category || 'other';
      if (!stats[cat]) stats[cat] = { count: 0, total: 0 };
      stats[cat].count += 1;
      stats[cat].total += (r.debit || 0) + (r.credit || 0);
    });
    return stats;
  }, [documentData]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Fetch available samples on mount and load default sample
  useEffect(() => {
    fetchSamples();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAsking]);

  const fetchSamples = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/document-assistant/samples');
      setSamples(res.data || []);
      // Automatically load the first sample (HDFC CSV) for instant evaluation
      if (res.data && res.data.length > 0 && !documentData) {
        loadSample(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch samples:', err);
    }
  };

  const loadSample = async (sampleId: string) => {
    setIsLoadingDoc(true);
    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/v1/document-assistant/load-sample/${sampleId}`);
      setDocumentData(res.data);
      setHighlightedRowMap({});
      setSelectedCategoryFilter('all');
      
      // Initialize chat welcome message
      setMessages([
        {
          role: 'ai',
          content: `Hello! I have parsed your document **${res.data.filename}** (${res.data.total_rows} lines, ${res.data.summary.date_range}).\n\nI am your **Document Assistant & Statement Explainer** — scoped strictly to this document and statutory finance rules. You can click any table row to analyze specific charges, or ask questions like:\n• *"Explain the ₹236 charge on line 4"*\n• *"What are all the bank charges on this statement?"*\n• *"What does 'ACH D- CMS/RAZORPAY' mean?"*\n• *"Compare line 2 and line 8"*`,
          metadata: {
            confidence: 'HIGH',
            confidence_score: 0.99,
            evidence_trail: [
              {
                step_number: 1,
                tool: "document_sandbox_extractor",
                action: `Ingested ${res.data.total_rows} lines from sample statement`,
                observation: `Total Inflows: ₹${res.data.summary.total_credit.toLocaleString('en-IN')}, Total Outflows: ₹${res.data.summary.total_debit.toLocaleString('en-IN')}`
              }
            ]
          }
        }
      ]);
    } catch (err) {
      console.error('Failed to load sample statement:', err);
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const uploadFile = async (file: File) => {
    setIsLoadingDoc(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/v1/document-assistant/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDocumentData(res.data);
      setHighlightedRowMap({});
      setSelectedCategoryFilter('all');

      setMessages([
        {
          role: 'ai',
          content: `Uploaded and parsed **${res.data.filename}** (${res.data.total_rows} rows).\n\n**Summary Breakdown**:\n• Total Inward Credits: **₹${res.data.summary.total_credit.toLocaleString('en-IN')}**\n• Total Outward Debits: **₹${res.data.summary.total_debit.toLocaleString('en-IN')}**\n• Bank Fees & Charges: **₹${res.data.summary.bank_charges_total.toLocaleString('en-IN')}**\n\nAsk me anything about unfamiliar line items, fee deductions, or banking terminology.`,
          metadata: {
            confidence: 'HIGH',
            confidence_score: 0.99,
            evidence_trail: [
              {
                step_number: 1,
                tool: "document_sandbox_extractor",
                action: `Ingested user-uploaded statement (${res.data.file_type})`,
                observation: `Isolated in temporary memory sandbox. Zero mutation of verified reconciliation ledger.`
              }
            ]
          }
        }
      ]);
    } catch (err: any) {
      alert(`Upload failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsLoadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleSendMessage = async (queryText?: string) => {
    const q = (queryText || inputQuestion).trim();
    if (!q || isAsking || !documentData) return;

    setInputQuestion('');
    
    // Add user message
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: q }];
    setMessages(newMessages);
    setIsAsking(true);

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/v1/document-assistant/ask', {
        doc_id: documentData.doc_id,
        question: q
      });

      const highlighted: number[] = res.data.highlighted_rows || [];
      const newHighMap: Record<number, boolean> = {};
      highlighted.forEach(num => { newHighMap[num] = true; });
      setHighlightedRowMap(newHighMap);

      // Add AI response
      setMessages([
        ...newMessages,
        {
          role: 'ai',
          content: res.data.answer,
          metadata: {
            confidence: res.data.confidence,
            confidence_score: res.data.confidence_score,
            highlighted_rows: res.data.highlighted_rows,
            knowledge_citation: res.data.knowledge_citation,
            evidence_trail: res.data.evidence_trail || res.data.reasoning_trail
          }
        }
      ]);

      // If specific row highlighted, scroll table to that row
      if (highlighted.length > 0) {
        const rowEl = document.getElementById(`doc-row-${highlighted[0]}`);
        rowEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (err) {
      console.error('Error asking document assistant:', err);
      setMessages([
        ...newMessages,
        {
          role: 'ai',
          content: "I encountered an error analyzing your document. Please ensure the document session is active.",
          metadata: { confidence: 'LOW', confidence_score: 0.2 }
        }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleRowClick = (row: ParsedRow) => {
    handleSendMessage(`Explain line #${row.line_number} (${row.description}): ${row.debit > 0 ? `₹${row.debit.toLocaleString('en-IN')} Dr` : `₹${row.credit.toLocaleString('en-IN')} Cr`}`);
  };

  const toggleReasoning = (idx: number) => {
    setExpandedReasoningMap(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const filteredRows = (documentData?.rows || []).filter(r => {
    if (selectedCategoryFilter === 'all') return true;
    if (selectedCategoryFilter === 'bank_fee') return r.category === 'bank_charge' || r.flags.includes('bank_fee');
    if (selectedCategoryFilter === 'gateway') return r.category === 'gateway_settlement' || r.flags.includes('gateway_payout');
    if (selectedCategoryFilter === 'tax') return r.category === 'tax_payment' || r.flags.includes('statutory_tax');
    if (selectedCategoryFilter === 'vendor') return r.category === 'vendor_payout';
    return true;
  });

  return (
    <div className="space-y-5 pb-20 max-w-7xl mx-auto">
      
      {/* PAGE HEADER & NON-AUTHORITATIVE SANDBOX BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Assistant</h1>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#F0FDF4] px-2.5 py-0.5 rounded-full border border-[#BBF7D0] inline-flex items-center gap-1">
              <ShieldCheck size={12} /> Isolated Advisory Sandbox
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            Upload custom bank statements (CSV, PDF, image, text) to explain unfamiliar line items, fees, and charges.
          </p>
        </div>

        {/* Upload Button & Sample Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.pdf,.txt,.png,.jpg,.jpeg,.webp"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoadingDoc}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <UploadCloud size={15} />
            <span>Upload Statement</span>
          </button>

          {/* Quick Load Sample Dropdown/Buttons */}
          {samples.map(s => (
            <button
              key={s.id}
              onClick={() => loadSample(s.id)}
              disabled={isLoadingDoc}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                documentData?.filename?.includes(s.name.split(' ')[0])
                  ? 'bg-slate-100 border-slate-300 text-slate-900 font-bold shadow-2xs'
                  : 'bg-white border-[#E4E4E7] text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
              }`}
            >
              <InstitutionLogo name={s.name} size="xs" />
              <span>{s.name.split(' ')[0]} ({s.format})</span>
            </button>
          ))}
        </div>
      </div>

      {/* NON-AUTHORITATIVE DISCLAIMER BANNER */}
      <div className="p-3.5 bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl flex items-start gap-3 text-xs text-slate-700">
        <Info size={16} className="text-[#1D4ED8] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="text-slate-900 font-semibold block">Non-Authoritative Explainer Sandbox:</strong>
          <span>
            Uploaded statements are parsed in an isolated session cache for explanatory Q&amp;A and <strong>never mutate, merge into, or alter</strong> your verified reconciliation ledger or statutory Month-End Close reports.
          </span>
        </div>
      </div>

      {/* MAIN DUAL-PANE WORKSPACE */}
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-start transition-all ${
          isDragOver ? 'ring-2 ring-blue-500 rounded-3xl bg-blue-50/20 p-1' : ''
        }`}
      >
        
        {/* LEFT PANE (7 cols): PARSED DOCUMENT VIEWER & METRICS */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4E4E7] shadow-xs flex flex-col overflow-hidden">
          
          {/* Document Top Bar */}
          <div className="p-4 border-b border-[#E4E4E7] bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <InstitutionLogo name={documentData?.filename || 'Bank'} size={36} />
              <div>
                <h3 className="font-bold text-xs text-slate-900 leading-tight">
                  {documentData?.filename || 'No Document Loaded'}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  {documentData?.total_rows || 0} line items • Period: {documentData?.summary.date_range || '-'}
                </p>
              </div>
            </div>

            <span className="text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-medium self-start sm:self-auto">
              Click any row to ask AI
            </span>
          </div>

          {/* Quick Summary Strip (Click-to-Ask AI about totals) */}
          {documentData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50/30 border-b border-slate-100 text-xs">
              
              {/* Card 1: Total Deposits */}
              <button
                onClick={() => handleSendMessage(`Explain the total deposits of ₹${documentData.summary.total_credit.toLocaleString('en-IN')} parsed from ${documentData.filename}.`)}
                className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 text-left transition-all group cursor-pointer shadow-2xs relative"
                title="Click to ask AI about total deposits"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Deposits</span>
                  <div className="w-3.5 h-3.5 rounded bg-[#1E293B] text-white opacity-0 group-hover:opacity-100 flex items-center justify-center font-bold text-[8px] font-mono shrink-0 transition-opacity">F</div>
                </div>
                <span className="font-bold font-mono text-[#15803D] block text-xs mt-0.5">₹{documentData.summary.total_credit.toLocaleString('en-IN')}</span>
              </button>

              {/* Card 2: Total Withdrawals */}
              <button
                onClick={() => handleSendMessage(`Break down the total withdrawals of ₹${documentData.summary.total_debit.toLocaleString('en-IN')} parsed from ${documentData.filename}.`)}
                className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 text-left transition-all group cursor-pointer shadow-2xs relative"
                title="Click to ask AI about total withdrawals"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Withdrawals</span>
                  <div className="w-3.5 h-3.5 rounded bg-[#1E293B] text-white opacity-0 group-hover:opacity-100 flex items-center justify-center font-bold text-[8px] font-mono shrink-0 transition-opacity">F</div>
                </div>
                <span className="font-bold font-mono text-[#B91C1C] block text-xs mt-0.5">₹{documentData.summary.total_debit.toLocaleString('en-IN')}</span>
              </button>

              {/* Card 3: Bank Charges */}
              <button
                onClick={() => handleSendMessage(`What are all the bank fees and charges on this statement? Explain the ₹${documentData.summary.bank_charges_total.toLocaleString('en-IN')} total.`)}
                className="p-2.5 bg-white hover:bg-amber-50/40 rounded-xl border border-slate-200/80 hover:border-amber-300 text-left transition-all group cursor-pointer shadow-2xs relative"
                title="Click to ask AI about bank charges and fee breakdown"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Bank Charges</span>
                  <div className="w-3.5 h-3.5 rounded bg-[#1E293B] text-white opacity-0 group-hover:opacity-100 flex items-center justify-center font-bold text-[8px] font-mono shrink-0 transition-opacity">F</div>
                </div>
                <span className="font-bold font-mono text-amber-700 block text-xs mt-0.5">₹{documentData.summary.bank_charges_total.toLocaleString('en-IN')}</span>
              </button>

              {/* Card 4: Gateway Payouts */}
              <button
                onClick={() => handleSendMessage(`Analyze the gateway settlements and payouts totaling ₹${documentData.summary.gateway_settlement_total.toLocaleString('en-IN')} parsed from this statement.`)}
                className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 text-left transition-all group cursor-pointer shadow-2xs relative"
                title="Click to ask AI about gateway settlements"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Gateway Payouts</span>
                  <div className="w-3.5 h-3.5 rounded bg-[#1E293B] text-white opacity-0 group-hover:opacity-100 flex items-center justify-center font-bold text-[8px] font-mono shrink-0 transition-opacity">F</div>
                </div>
                <span className="font-bold font-mono text-slate-900 block text-xs mt-0.5">₹{documentData.summary.gateway_settlement_total.toLocaleString('en-IN')}</span>
              </button>

            </div>
          )}

          {/* Category Filter & Click-to-Ask Chips */}
          {documentData && (
            <div className="px-3 py-2 bg-slate-50/60 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
                <Filter size={11} /> Filter:
              </span>
              {[
                { 
                  id: 'all', 
                  label: `All (${documentData.total_rows})`,
                  askQuery: null
                },
                { 
                  id: 'bank_fee', 
                  label: `Bank Fees (₹${(categoryStats['bank_fee']?.total || documentData.summary.bank_charges_total).toLocaleString('en-IN')})`,
                  askQuery: `List and explain all bank fee line items on this statement totaling ₹${(categoryStats['bank_fee']?.total || documentData.summary.bank_charges_total).toLocaleString('en-IN')}.`
                },
                { 
                  id: 'gateway', 
                  label: `Gateway Payouts (₹${(categoryStats['gateway']?.total || documentData.summary.gateway_settlement_total).toLocaleString('en-IN')})`,
                  askQuery: `Analyze all payment gateway settlement credits on this statement totaling ₹${(categoryStats['gateway']?.total || documentData.summary.gateway_settlement_total).toLocaleString('en-IN')}.`
                },
                { 
                  id: 'tax', 
                  label: `Taxes & Challans (₹${(categoryStats['tax']?.total || 0).toLocaleString('en-IN')})`,
                  askQuery: `Explain the taxes, TDS, and statutory challan entries on this statement totaling ₹${(categoryStats['tax']?.total || 0).toLocaleString('en-IN')}.`
                },
                { 
                  id: 'vendor', 
                  label: `Vendor Debits (₹${(categoryStats['vendor']?.total || 0).toLocaleString('en-IN')})`,
                  askQuery: `Explain the vendor debits and outgoing supplier transfers on this statement totaling ₹${(categoryStats['vendor']?.total || 0).toLocaleString('en-IN')}.`
                }
              ].map(tab => (
                <div key={tab.id} className="flex items-center gap-0.5">
                  <button
                    onClick={() => setSelectedCategoryFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      selectedCategoryFilter === tab.id
                        ? 'bg-[#1E293B] text-white font-bold'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                  {tab.askQuery && (
                    <button
                      onClick={() => handleSendMessage(tab.askQuery!)}
                      className="p-1 text-slate-400 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                      title={`Ask Fino about ${tab.label}`}
                    >
                      <div className="w-3 h-3 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[7px] font-mono">F</div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Parsed Table */}
          <div ref={tableContainerRef} className="overflow-x-auto max-h-[520px] overflow-y-auto">
            {isLoadingDoc ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <Loader2 size={24} className="animate-spin text-[#1E293B] mx-auto" />
                <p className="text-xs font-medium">Parsing statement line items and auditing fee structures...</p>
              </div>
            ) : !documentData || filteredRows.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <FileText size={32} className="mx-auto text-slate-300" />
                <p className="text-xs font-medium">No matching entries found for selected filter.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Line #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Description / Narration</th>
                    <th className="py-2.5 px-3 text-right">Debit (Dr)</th>
                    <th className="py-2.5 px-3 text-right">Credit (Cr)</th>
                    <th className="py-2.5 px-3">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredRows.map((row) => {
                    const isHighlighted = highlightedRowMap[row.line_number];
                    const isBankFee = row.category === 'bank_charge' || row.flags.includes('bank_fee');
                    const isGateway = row.category === 'gateway_settlement';

                    return (
                      <tr 
                        key={row.line_number}
                        id={`doc-row-${row.line_number}`}
                        onClick={() => handleRowClick(row)}
                        className={`transition-colors cursor-pointer group ${
                          isHighlighted 
                            ? 'bg-amber-50/90 font-bold text-amber-950 border-l-4 border-l-amber-500' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                        title="Click to have Document Assistant explain this line item"
                      >
                        <td className="py-2.5 px-3 font-sans text-slate-400 group-hover:text-[#1E293B] font-bold">
                          #{row.line_number}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="py-2.5 px-3 font-sans max-w-xs truncate" title={row.description}>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-slate-900 font-medium group-hover:underline truncate">{row.description}</span>
                            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-[#1E293B] font-bold bg-slate-100 px-1.5 py-0.5 rounded transition-opacity flex items-center gap-1 shrink-0">
                              <div className="w-3 h-3 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[7px] font-mono shrink-0">F</div>
                              <span>Ask</span>
                            </span>
                          </div>
                          {row.reference_no && row.reference_no !== '-' && (
                            <span className="block text-[10px] font-mono text-slate-400 truncate">Ref: {row.reference_no}</span>
                          )}
                        </td>
                        <td className={`py-2.5 px-3 text-right ${row.debit > 0 ? (isBankFee ? 'text-amber-700 font-bold' : 'text-[#B91C1C]') : 'text-slate-300'}`}>
                          {row.debit > 0 ? `₹${row.debit.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className={`py-2.5 px-3 text-right ${row.credit > 0 ? (isGateway ? 'text-[#15803D] font-bold' : 'text-emerald-600') : 'text-slate-300'}`}>
                          {row.credit > 0 ? `₹${row.credit.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isBankFee 
                              ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                              : isGateway
                              ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
                              : row.category === 'tax_payment'
                              ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE]'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {row.category.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT PANE (5 cols): SCOPED DOCUMENT CHAT INTERFACE */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E4E4E7] shadow-xs flex flex-col h-[640px] overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-[#E4E4E7] bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#1E293B] text-white rounded-xl flex items-center justify-center font-bold font-mono text-xs shadow-xs">
                F
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900 leading-tight">Document Explainer AI</h3>
                <p className="text-[10px] text-slate-500">Scoped to {documentData?.filename || 'statement'} &amp; the curated finance glossary</p>
              </div>
            </div>

            <button
              onClick={() => documentData && loadSample(samples[0]?.id || 'sample_hdfc_csv')}
              className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
              title="Reset conversation"
            >
              <RefreshCw size={12} />
              <span>Reset</span>
            </button>
          </div>

          {/* Quick Suggested Prompts Bar */}
          {documentData?.sample_questions && (
            <div className="p-2.5 bg-slate-50/80 border-b border-slate-200/80 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-thin">
              {documentData.sample_questions.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sq)}
                  disabled={isAsking}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-white hover:bg-[#1E293B] text-slate-700 hover:text-white border border-slate-200 font-medium transition-colors cursor-pointer shrink-0"
                >
                  {sq}
                </button>
              ))}
            </div>
          )}

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/30 text-xs">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* User Message */}
                {msg.role === 'user' ? (
                  <div className="bg-[#1E293B] text-white rounded-2xl rounded-tr-xs px-3.5 py-2 max-w-[88%] font-medium shadow-2xs">
                    {msg.content}
                  </div>
                ) : (
                  /* AI Grounded Response Bubble */
                  <div className="bg-white border border-[#E4E4E7] rounded-2xl rounded-tl-xs p-3.5 max-w-full space-y-2.5 shadow-2xs">
                    
                    {/* Confidence Header */}
                    {msg.metadata?.confidence && (
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-[10px]">
                        <span className="font-bold text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-full border border-[#BBF7D0] inline-flex items-center gap-1">
                          <CheckCircle2 size={11} /> Grounded in Document
                        </span>
                        <span className="text-slate-400 font-medium">Non-Authoritative</span>
                      </div>
                    )}

                    {/* Markdown Answer Content */}
                    <FormattedMarkdown content={msg.content} className="text-slate-800 text-[11.5px]" />

                    {/* Curated Finance Knowledge Citation Card */}
                    {msg.metadata?.knowledge_citation && (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-1">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
                            <BookOpen size={12} className="text-[#1E293B]" />
                            <span>{msg.metadata.knowledge_citation.canonical_name}</span>
                          </div>
                          <span className="text-[9px] font-bold text-[#15803D] bg-[#F0FDF4] px-1.5 py-0.2 rounded-full border border-[#BBF7D0]">
                            {msg.metadata.knowledge_citation.category}
                          </span>
                        </div>
                        
                        <div className="text-[10px] text-slate-500">
                          <span>Statutory Standard: </span>
                          <strong className="text-slate-700">{msg.metadata.knowledge_citation.statutory_reference}</strong>
                        </div>
                      </div>
                    )}

                    {/* Evidence Trail Accordion */}
                    {msg.metadata?.evidence_trail && msg.metadata.evidence_trail.length > 0 && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                        <button
                          onClick={() => toggleReasoning(idx)}
                          className="w-full px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1">
                            <Database size={11} className="text-[#1E293B]" />
                            Evidence Trail ({pluralize(msg.metadata.evidence_trail.length, 'step', 'steps')})
                          </span>
                          {expandedReasoningMap[idx] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                        
                        {expandedReasoningMap[idx] && (
                          <div className="p-2.5 border-t border-slate-200 bg-white space-y-1.5 text-[10px]">
                            {msg.metadata.evidence_trail.map((step: any, sIdx: number) => (
                              <div key={sIdx} className="p-2 rounded bg-slate-50 border border-slate-100 space-y-0.5">
                                <div className="flex items-center justify-between font-semibold text-slate-800">
                                  <span>{step.action}</span>
                                  <span className="font-mono text-[#1E293B] text-[9px]">{step.tool}</span>
                                </div>
                                <p className="text-slate-600 leading-tight">{step.observation}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}

              </div>
            ))}

            {isAsking && (
              <div className="flex items-center gap-2 p-3 bg-white border border-[#E4E4E7] rounded-2xl rounded-tl-xs text-xs text-slate-600 shadow-2xs max-w-[85%]">
                <Loader2 size={14} className="animate-spin text-[#1E293B]" />
                <span>Auditing document lines and referencing financial rules...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Bottom Chat Input */}
          <div className="p-3 border-t border-[#E4E4E7] bg-white">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }} 
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Ask about any charge, fee, or line item on this statement..."
                disabled={isAsking || !documentData}
                className="flex-1 bg-slate-50 border border-[#E4E4E7] rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:bg-white font-medium transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isAsking || !documentData}
                className="p-2.5 bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 disabled:cursor-not-allowed"
              >
                <Send size={14} />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
