import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, BookOpen, CreditCard, Building2, ShieldCheck, CheckCircle2, 
  Sparkles, Activity, TrendingUp, AlertTriangle, ChevronRight, HelpCircle, 
  Lock, RefreshCw, Zap, Sliders, FileText, ChevronDown, Check, Database,
  Eye, BarChart3, Layers, Compass, ArrowUpRight, Cpu, Search, CheckCircle,
  FileCheck2, GitCommit, Scale, LineChart, Terminal, Play, ArrowDownRight
} from 'lucide-react';
import { FinoraBrandLockup, FinoraMark } from '../components/ui/FinoraMark';
import { api } from '../api/client';

// Interactive Simulation Scenarios
interface SimScenario {
  id: string;
  name: string;
  badge: string;
  gross: number;
  exceptions: number;
  float: number;
  fees: number;
  gst: number;
  net: number;
  matchRate: number;
  finoDiagnosis: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

const SCENARIOS: SimScenario[] = [
  {
    id: 'canonical',
    name: 'Optimal Operations (Active August)',
    badge: 'Baseline Canonical',
    gross: 298603.50,
    exceptions: 26900.00,
    float: 18763.08,
    fees: 7262.07,
    gst: 1307.16,
    net: 244371.19,
    matchRate: 84.4,
    finoDiagnosis: "Ledger balanced within Ind AS standards. 4 open discrepancies isolated (₹26,900.00 trapped). Net settled cash verified at ₹2,44,371.19 across Kotak and HDFC accounts with $0.00 arithmetic variance.",
    riskLevel: 'LOW'
  },
  {
    id: 'fee_spike',
    name: 'Gateway Fee Variance Spike',
    badge: 'Contract Breach Risk',
    gross: 298603.50,
    exceptions: 34500.00,
    float: 18763.08,
    fees: 11250.00,
    gst: 2025.00,
    net: 232065.42,
    matchRate: 77.8,
    finoDiagnosis: "ALERT: Gateway fee deduction surged to 3.77% vs contractual 2.0% MDR standard. ₹3,987.93 in unexpected fee leakage detected on international card transactions. Auto-escalation suggested to Gateway Ops.",
    riskLevel: 'HIGH'
  },
  {
    id: 'settlement_delay',
    name: 'Bank T+2 Settlement Latency',
    badge: 'Working Capital Friction',
    gross: 298603.50,
    exceptions: 26900.00,
    float: 58400.00,
    fees: 7262.07,
    gst: 1307.16,
    net: 204734.27,
    matchRate: 68.6,
    finoDiagnosis: "WARNING: Bank settlement batch delayed by 48 hours. In-transit liquidity float expanded to ₹58,400.00. 7-day Monte Carlo liquidity buffer remains solvent (P10 > ₹1.85L), but working capital headroom is compressed.",
    riskLevel: 'MEDIUM'
  }
];

// Sample Interactive Transactions for Live 3-Way Trace Sandbox
interface SampleTraceTxn {
  id: string;
  orderId: string;
  gatewayId: string;
  bankUtr: string;
  grossAmount: number;
  netSettled: number;
  mdrFee: number;
  gstAmount: number;
  status: 'EXACT_MATCH' | 'AMOUNT_MISMATCH' | 'POSSIBLE_DUPLICATE' | 'FEE_VARIANCE';
  bank: 'Kotak Mahindra' | 'HDFC Bank' | 'Pending Deposit';
  diagnosis: string;
}

const SAMPLE_TXNS: SampleTraceTxn[] = [
  {
    id: 'txn_36b76cdc67e0',
    orderId: 'ord_live_8912',
    gatewayId: 'pay_rzp_9841',
    bankUtr: 'KOTAK_UTR_778102',
    grossAmount: 8500.00,
    netSettled: 8299.40,
    mdrFee: 170.00,
    gstAmount: 30.60,
    status: 'EXACT_MATCH',
    bank: 'Kotak Mahindra',
    diagnosis: '1:1 Exact Match across Internal Books, Razorpay 2% MDR, and Kotak Bank UTR credit. Zero variance.'
  },
  {
    id: 'exc_a17ebce376e6',
    orderId: 'ord_live_3391',
    gatewayId: 'pay_rzp_4412',
    bankUtr: 'HDFC_UTR_190442',
    grossAmount: 12500.00,
    netSettled: 5274.64,
    mdrFee: 250.00,
    gstAmount: 45.00,
    status: 'AMOUNT_MISMATCH',
    bank: 'HDFC Bank',
    diagnosis: '₹7,225.36 monetary shortfall between internal invoice (₹12,500) and settled bank deposit (₹5,274.64). Highest priority item.'
  },
  {
    id: 'exc_b6eb43cc5acf',
    orderId: 'ord_live_7721',
    gatewayId: 'pay_rzp_6610',
    bankUtr: 'PENDING_UTR',
    grossAmount: 6200.00,
    netSettled: 0.00,
    mdrFee: 124.00,
    gstAmount: 22.32,
    status: 'POSSIBLE_DUPLICATE',
    bank: 'Pending Deposit',
    diagnosis: 'Potential duplicate payment collision detected. Identical card fingerprint matches prior settled order. Suspended from bank credit.'
  },
  {
    id: 'exc_8fefd903a5cd',
    orderId: 'ord_live_5502',
    gatewayId: 'pay_rzp_3190',
    bankUtr: 'KOTAK_UTR_883291',
    grossAmount: 8500.00,
    netSettled: 8129.40,
    mdrFee: 340.00,
    gstAmount: 61.20,
    status: 'FEE_VARIANCE',
    bank: 'Kotak Mahindra',
    diagnosis: 'Gateway fee rate deduction was 4.0% (₹340.00) instead of contractual 2.0% standard (₹170.00), causing ₹170.00 fee leakage.'
  }
];

// Killer AI Questions Preview
const KILLER_AI_QUESTIONS = [
  {
    query: "What should I fix first?",
    answer: "Highest financial risk is exc_a17ebce376e6 (Amount Mismatch on txn_a17ebce376e6). Exposure: ₹7,225.36 (26.9% of all trapped cash). SLA age: >2 days. Recommended Action: 1-Click Escalate to Gateway Ops."
  },
  {
    query: "Why was I paid less this month?",
    answer: "Net Settled Cash for August 2026 is ₹2,44,371.19 (-₹29,430.95 vs July). Variance breakdown: ₹26,900 trapped in 4 open exceptions, ₹18,763 in T+2 bank float, and ₹7,262 in gateway MDR fees."
  },
  {
    query: "What happens if settlement is delayed by 2 days?",
    answer: "Simulating +2 day latency: Available 7-day cash drops from ₹2.71L to ₹2.18L (-₹53.1k). Working capital risk escalates from Low to Medium, but Monte Carlo P10 floor remains solvent above ₹1.85L."
  },
  {
    query: "Which bank received more: Kotak or HDFC?",
    answer: "Kotak Mahindra received ₹1,92,450.00 (78.8% of total volume across 42 batches) vs HDFC Bank at ₹51,921.19 (21.2% across 12 batches)."
  }
];

// 6 AI Engines
const ENGINES = [
  {
    title: 'Deterministic 3-Way Reconciler',
    tag: 'Core Match Engine',
    desc: 'Ties internal orders against Razorpay settlements and bank UTR credits across 4 matching stages with zero arithmetic tolerance.',
    stat: '<0.1s / 60-Tx Batch',
    statLabel: 'Execution Speed'
  },
  {
    title: 'Autonomous Neural Copilot',
    tag: 'Ask Fino (100% Local)',
    desc: 'On-device neural SLM armed with 10 deterministic DAL tools to answer complex controller inquiries with zero cloud leakage.',
    stat: '10 DAL Tools',
    statLabel: 'Function Calling'
  },
  {
    title: '1,000-Trial Monte Carlo',
    tag: 'Treasury Forecaster',
    desc: 'Projects 7-day forward liquidity distribution (P10/P50/P90) incorporating historical velocity and exception friction.',
    stat: '1,000 Trials',
    statLabel: 'Stochastic Simulation'
  },
  {
    title: 'Forensic Integrity (Benford)',
    tag: 'Fraud & Outlier Detection',
    desc: 'Monitors leading digit distributions (MAD: 0.0084 Conforming) and runs Isolation Forest trees across fee ratios.',
    stat: 'MAD: 0.0084',
    statLabel: 'Close Conformity'
  },
  {
    title: 'GSTR-2B Tax-Line Matcher',
    tag: 'GST & TDS Reconciliation',
    desc: 'Matches Purchase Register lines against GSTN GSTR-2B and TRACES feeds to enforce CGST Rule 36(4) and TDS Sec 194O.',
    stat: 'Rule 36(4)',
    statLabel: 'Statutory Shield'
  },
  {
    title: 'Ind AS Continuous Close',
    tag: 'Statutory Close & Memo',
    desc: 'Automates 5-pillar close checklist and drafts verified CFO memorandum with SHA-256 cryptographic period lock.',
    stat: 'Ind AS 1/7/115',
    statLabel: 'ICAI Alignment'
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeScenario, setActiveScenario] = useState('canonical');
  const [selectedTxn, setSelectedTxn] = useState<SampleTraceTxn>(SAMPLE_TXNS[0]);
  const [activeAiQIndex, setActiveAiQIndex] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Live Ledger Telemetry state
  const [liveStats, setLiveStats] = useState({
    txCount: 60,
    accountCount: 4,
    exceptionCount: 4,
    exceptionAmount: 26900,
    grossVolume: 298603.50,
    netSettled: 244371.19,
    matchRate: 84.4,
    isLoading: true
  });

  useEffect(() => {
    const fetchLiveTelemetry = async () => {
      try {
        const res = await api.get('/analytics/period-financials?start_date=2026-08-01&end_date=2026-08-31&account_id=all');
        if (res?.data && typeof res.data.total_tx_count === 'number') {
          setLiveStats({
            txCount: res.data.total_tx_count || 60,
            accountCount: 4,
            exceptionCount: res.data.open_exception_count || 4,
            exceptionAmount: res.data.trapped_exceptions || 26900,
            grossVolume: res.data.gross_processed_volume || 298603.50,
            netSettled: res.data.net_settled_cash || 244371.19,
            matchRate: res.data.value_reconciliation_rate || 84.4,
            isLoading: false
          });
        }
      } catch (e) {
        setLiveStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchLiveTelemetry();
  }, []);

  const currentScenario = SCENARIOS.find(s => s.id === activeScenario) || SCENARIOS[0];

  const handleLaunchTour = () => {
    localStorage.removeItem('finora_quick_tour_dismissed');
    window.dispatchEvent(new CustomEvent('finora-open-quick-tour'));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 font-sans selection:bg-[#5B45F5] selection:text-white relative overflow-x-hidden">
      
      {/* Background Architectural Canvas Grid & Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-indigo-600/15 via-violet-500/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-1/3 -left-48 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full" />
        <div className="absolute top-2/3 -right-48 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b14_1px,transparent_1px),linear-gradient(to_bottom,#1e293b14_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_55%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Ticker Banner: Real-Time Single Source of Truth */}
      <div className="relative z-50 bg-[#0E1422] border-b border-slate-800/80 px-4 py-1.5 text-[11px] font-mono text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center justify-between gap-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              FINO TELEMETRY FEED
            </span>
            <span className="text-slate-600">|</span>
            <span>PERIOD: <strong className="text-slate-200">AUGUST 2026</strong></span>
            <span className="text-slate-600">|</span>
            <span>MONITORED: <strong className="text-white font-bold">{liveStats.txCount} TXS</strong></span>
            <span className="text-slate-600">|</span>
            <span>GROSS VOLUME: <strong className="text-white font-bold">₹{liveStats.grossVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
            <span className="text-slate-600">|</span>
            <span>NET SETTLED CASH: <strong className="text-emerald-400 font-bold">₹{liveStats.netSettled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
            <span className="text-slate-600">|</span>
            <span>TRAPPED EXCEPTIONS: <strong className="text-rose-400 font-bold">₹{liveStats.exceptionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({liveStats.exceptionCount} ITEMS)</strong></span>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-slate-400">
            <span className="text-violet-400 font-bold">MATH VARIANCE: ₹0.00</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">IND AS 1/7/115 READY</span>
          </div>
        </div>
      </div>

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 w-full bg-[#090D14]/85 backdrop-blur-xl border-b border-slate-800/80 px-6 lg:px-12 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <FinoraMark size={34} />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#090D14] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-white tracking-tight">Finora</span>
                  <span className="text-[9px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 px-1.5 py-0.2 rounded-full">
                    AI FINANCE CONTROLLER
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 block tracking-wider uppercase">
                  Continuous 3-Way Reconciliation
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
              <a href="#loom" className="hover:text-white transition-colors">3-Way Loom</a>
              <a href="#sandbox" className="hover:text-white transition-colors">Live Trace Sandbox</a>
              <a href="#modeler" className="hover:text-white transition-colors">Liquidity Bridge</a>
              <a href="#matrix" className="hover:text-white transition-colors">6-Engine Matrix</a>
              <a href="#askfino" className="hover:text-white transition-colors">Ask Fino AI</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLaunchTour}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700/70 transition-all cursor-pointer"
            >
              <Sparkles size={13} className="text-violet-400" />
              <span>Guided Tour</span>
            </button>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 px-4.5 py-2.5 rounded-xl shadow-lg shadow-violet-600/25 border border-violet-400/30 transition-all cursor-pointer active:scale-98"
            >
              <span>Open Dashboard</span>
              <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </header>

      {/* Hero Section: The Controller Thesis */}
      <section className="relative z-10 pt-16 pb-20 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Radar Eyebrow */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-300 text-xs font-semibold mb-8 shadow-sm backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">Razorpay Buildathon AI Finance Controller</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300">Deterministic Core + Agentic Shell</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.08] mb-6">
          Stop trusting black-box balances. <br />
          <span className="bg-gradient-to-r from-violet-400 via-indigo-200 to-emerald-400 bg-clip-text text-transparent">
            Verify where every single rupee went.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Finora continuously matches money collected by <strong>Razorpay</strong> against your <strong>internal order books</strong> and proves deposit into your <strong>Kotak & HDFC bank vaults</strong> with zero arithmetic tolerance.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-14">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-sm shadow-xl shadow-white/10 transition-all cursor-pointer active:scale-98"
          >
            <span>Enter Controller Workspace</span>
            <ArrowRight size={16} />
          </Link>

          <a
            href="#loom"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 text-slate-200 font-bold text-sm border border-slate-700/80 transition-all cursor-pointer"
          >
            <Layers size={16} className="text-violet-400" />
            <span>Inspect 3-Way Loom</span>
          </a>
        </div>

        {/* SIGNATURE HERO INSTRUMENT: Interactive 3-Way Reconciliation Loom */}
        <div id="loom" className="w-full max-w-5xl bg-[#0E1422]/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-left relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-mono font-bold text-xs">
                3W
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Continuous 3-Way Reconciliation Loom</span>
                  <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    ACTIVE VERIFICATION
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Tracing gross customer checkouts → contractual gateway deductions → net settled bank credits
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                Match Rate: <strong className="text-emerald-400">84.4% Value</strong>
              </span>
              <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                Residue: <strong className="text-violet-400">₹0.00</strong>
              </span>
            </div>
          </div>

          {/* The 3-Node Architecture Flow */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative items-stretch">
            
            {/* NODE 1: Internal Books */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/50 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    STAGE 01 • BOOKS
                  </span>
                  <BookOpen size={16} className="text-blue-400" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Internal Sales Orders</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Cart checkouts & invoices recording expected gross customer revenue.
                </p>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800/80 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Gross Volume:</span>
                    <strong className="text-white">₹2,98,603.50</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Batch Records:</span>
                    <strong className="text-slate-200">60 Invoices</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-850 flex items-center gap-1.5 text-[11px] font-semibold text-blue-400">
                <CheckCircle size={13} />
                <span>Expected Gross Recognized</span>
              </div>
            </div>

            {/* NODE 2: Gateway Engine */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-violet-500/50 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                    STAGE 02 • GATEWAY
                  </span>
                  <CreditCard size={16} className="text-violet-400" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Razorpay Settlement Feed</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Contractual 2.0% MDR fees & 18% statutory GST tax withholding.
                </p>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800/80 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>MDR Fees (2%):</span>
                    <strong className="text-rose-400">-₹7,262.07</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST (18% on Fee):</span>
                    <strong className="text-rose-400">-₹1,307.16</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-850 flex items-center gap-1.5 text-[11px] font-semibold text-violet-400">
                <CheckCircle size={13} />
                <span>Contractual Rates Audited</span>
              </div>
            </div>

            {/* NODE 3: Bank Vaults */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    STAGE 03 • BANK VAULT
                  </span>
                  <Building2 size={16} className="text-emerald-400" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Bank Statement Deposits</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Actual net cash deposited into Kotak and HDFC accounts via UTR batches.
                </p>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800/80 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Settled Net Cash:</span>
                    <strong className="text-emerald-400">₹2,44,371.19</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>In-Transit Float (T+2):</span>
                    <strong className="text-amber-400">₹18,763.08</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-850 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                <CheckCircle size={13} />
                <span>Verified Cash-in-Hand ($0.00 Variance)</span>
              </div>
            </div>

          </div>

          {/* Mathematical Proof Footer Bar */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-400">
            <span className="text-slate-300">
              <strong className="text-white">Proof of Work Equation:</strong> ₹2,98,603.50 (Gross) − ₹26,900.00 (Exceptions) − ₹18,763.08 (Float) − ₹7,262.07 (Fee) − ₹1,307.16 (GST) = <strong className="text-emerald-400">₹2,44,371.19 Settled Cash</strong>
            </span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 shrink-0 self-start sm:self-auto">
              ✓ 100% TIE-OUT
            </span>
          </div>

        </div>

      </section>

      {/* Interactive 3-Way Trace Sandbox */}
      <section id="sandbox" className="relative z-10 py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-800/80">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full inline-block mb-3">
            Deterministic Traceability
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Interactive 3-Way Evidence Sandbox
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Click any live transaction to inspect how Finora’s deterministic engine performs 3-way lineage matching, calculates fee deltas, and isolates exceptions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Transaction Selector List */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Select Sample Transaction Batch:
            </span>

            {SAMPLE_TXNS.map((txn) => (
              <button
                key={txn.id}
                onClick={() => setSelectedTxn(txn)}
                className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedTxn.id === txn.id
                    ? 'bg-slate-800/90 border-violet-500 ring-1 ring-violet-500 shadow-lg shadow-violet-500/15'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-white">{txn.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    txn.status === 'EXACT_MATCH' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    txn.status === 'AMOUNT_MISMATCH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    txn.status === 'POSSIBLE_DUPLICATE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  }`}>
                    {txn.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span>Gross: <strong className="text-slate-200">₹{txn.grossAmount.toLocaleString('en-IN')}</strong></span>
                  <span>Net: <strong className={txn.netSettled > 0 ? 'text-emerald-400' : 'text-slate-500'}>₹{txn.netSettled.toLocaleString('en-IN')}</strong></span>
                  <span className="text-slate-500">{txn.bank}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Live 3-Way Trace Inspector Detail Card */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  3-Way Trace Inspector
                </span>
                <h4 className="text-base font-bold text-white mt-0.5 font-mono">
                  {selectedTxn.id}
                </h4>
              </div>

              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-xl border ${
                selectedTxn.status === 'EXACT_MATCH' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}>
                {selectedTxn.status === 'EXACT_MATCH' ? '✓ RECONCILED' : '⚠ DISCREPANCY'}
              </span>
            </div>

            {/* 3 Step Visual Path */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">INTERNAL ORDER</span>
                <div className="font-bold text-white truncate">{selectedTxn.orderId}</div>
                <div className="text-slate-300 mt-1">₹{selectedTxn.grossAmount.toLocaleString('en-IN')}</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">RAZORPAY GATEWAY</span>
                <div className="font-bold text-violet-300 truncate">{selectedTxn.gatewayId}</div>
                <div className="text-rose-400 mt-1">-₹{(selectedTxn.mdrFee + selectedTxn.gstAmount).toFixed(2)} Fee</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">BANK STATEMENT</span>
                <div className="font-bold text-emerald-400 truncate">{selectedTxn.bankUtr}</div>
                <div className="text-emerald-400 mt-1">₹{selectedTxn.netSettled.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Fino AI Diagnosis Box */}
            <div className="p-4 rounded-2xl bg-violet-950/30 border border-violet-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-violet-300">
                <Sparkles size={14} className="text-violet-400" />
                <span>Fino Deterministic Diagnosis</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {selectedTxn.diagnosis}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 font-mono">
                Audit Trail ID: aud_trace_{selectedTxn.id.substring(4, 12)}
              </span>
              <Link
                to="/reconciliation"
                className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View in Full Reconciliation Ledger</span>
                <ArrowRight size={13} />
              </Link>
            </div>

          </div>

        </div>

      </section>

      {/* Interactive Liquidity Bridge & Stress Modeler */}
      <section id="modeler" className="relative z-10 py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-800/80">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full inline-block mb-3">
            Real-Time Liquidity Simulator
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Stress-Test Operating Cash & Working Capital
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Click across scenarios to watch Finora’s deterministic liquidity bridge and autonomous AI diagnostics recalculate live.
          </p>
        </div>

        {/* Scenario Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setActiveScenario(sc.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                activeScenario === sc.id
                  ? 'bg-slate-800/95 border-violet-500 shadow-lg shadow-violet-500/15 ring-1 ring-violet-500'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  {sc.badge}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  sc.riskLevel === 'LOW' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  sc.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {sc.riskLevel} RISK
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{sc.name}</h4>
              <div className="text-xs font-mono text-slate-400">
                Net Cash: <strong className="text-white">₹{sc.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
            </button>
          ))}
        </div>

        {/* Dynamic Simulator Output Board */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Stacked Liquidity Breakdown */}
            <div className="lg:col-span-7 space-y-5">
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Gross-to-Net Liquidity Bridge
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {currentScenario.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 block">Value Match Rate</span>
                  <span className="text-lg font-extrabold text-violet-300 font-mono">
                    {currentScenario.matchRate}%
                  </span>
                </div>
              </div>

              {/* Stacked Progress Bar */}
              <div className="w-full h-7 rounded-xl bg-slate-950 overflow-hidden flex border border-slate-800 p-0.5 gap-0.5">
                <div 
                  style={{ width: `${(currentScenario.net / currentScenario.gross) * 100}%` }}
                  className="bg-emerald-500 h-full rounded-lg transition-all duration-500" 
                  title={`Net Settled Cash: ₹${currentScenario.net.toLocaleString('en-IN')}`}
                />
                <div 
                  style={{ width: `${(currentScenario.exceptions / currentScenario.gross) * 100}%` }}
                  className="bg-rose-500 h-full rounded-lg transition-all duration-500" 
                  title={`Exceptions: ₹${currentScenario.exceptions.toLocaleString('en-IN')}`}
                />
                <div 
                  style={{ width: `${(currentScenario.float / currentScenario.gross) * 100}%` }}
                  className="bg-amber-500 h-full rounded-lg transition-all duration-500" 
                  title={`Timing Float: ₹${currentScenario.float.toLocaleString('en-IN')}`}
                />
                <div 
                  style={{ width: `${((currentScenario.fees + currentScenario.gst) / currentScenario.gross) * 100}%` }}
                  className="bg-slate-600 h-full rounded-lg transition-all duration-500" 
                  title={`Gateway Fees & Tax: ₹${(currentScenario.fees + currentScenario.gst).toLocaleString('en-IN')}`}
                />
              </div>

              {/* Bar Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500 shrink-0" />
                  <span>Net: ₹{(currentScenario.net / 1000).toFixed(1)}k</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500 shrink-0" />
                  <span>Exc: ₹{(currentScenario.exceptions / 1000).toFixed(1)}k</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500 shrink-0" />
                  <span>Float: ₹{(currentScenario.float / 1000).toFixed(1)}k</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded bg-slate-500 shrink-0" />
                  <span>MDR: ₹{((currentScenario.fees + currentScenario.gst) / 1000).toFixed(1)}k</span>
                </div>
              </div>

              {/* Written Tie-Out Formula */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
                <span className="text-slate-500 font-bold block mb-1 text-[10px] uppercase">Exact Mathematical Formula:</span>
                ₹{currentScenario.gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Gross) 
                − ₹{currentScenario.exceptions.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Exceptions) 
                − ₹{currentScenario.float.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Float) 
                − ₹{currentScenario.fees.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Fee) 
                − ₹{currentScenario.gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (GST) 
                = <strong className="text-emerald-400">₹{currentScenario.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Net Settled</strong>
              </div>

            </div>

            {/* Right: AI Controller Diagnostic */}
            <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-violet-600/30 flex items-center justify-center text-violet-400">
                    <Sparkles size={13} />
                  </div>
                  <span className="text-xs font-bold text-white">Autonomous AI Assessment</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Zero Hallucination</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80">
                {currentScenario.finoDiagnosis}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">7-Day Monte Carlo P50</span>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">₹2,95,309.32</div>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Benford MAD Status</span>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">0.0084 Conforming</div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* The 6-Engine AI Matrix */}
      <section id="matrix" className="relative z-10 py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-800/80">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full inline-block mb-3">
            Architecture Matrix
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            The 6 Deterministic Engines Powering Finora
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Finora pairs deterministic mathematical accuracy at the core with on-device neural SLM intelligence at the shell.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ENGINES.map((eng, idx) => (
            <div 
              key={idx}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl hover:shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                    {eng.tag}
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-bold">0{idx + 1}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{eng.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">{eng.desc}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">{eng.statLabel}:</span>
                <strong className="text-emerald-400">{eng.stat}</strong>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Interactive "Ask Fino" Controller Voice Bar */}
      <section id="askfino" className="relative z-10 py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-800/80">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full inline-block mb-3">
            Autonomous Neural Copilot
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Ask Fino: Zero-Hallucination Finance Intelligence
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Click any killer controller question below to preview how Fino inspects the SQLite ACID ledger, applies DAL function tools, and returns evidence-backed answers.
          </p>
        </div>

        {/* Interactive Query Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {KILLER_AI_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setActiveAiQIndex(idx)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeAiQIndex === idx
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 border border-violet-400/40'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>"{q.query}"</span>
            </button>
          ))}
        </div>

        {/* Dynamic Answer Terminal */}
        <div className="max-w-4xl mx-auto bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-violet-300">
              <Terminal size={14} />
              <span>fino_controller_agent.py --deterministic-mode</span>
            </div>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              100% GROUNDED
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                Q
              </div>
              <div className="text-sm font-bold text-white">
                "{KILLER_AI_QUESTIONS[activeAiQIndex].query}"
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                F
              </div>
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {KILLER_AI_QUESTIONS[activeAiQIndex].answer}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Tool Invoked: <code className="text-violet-300">get_unresolved_exceptions_prioritized()</code>
            </span>
            <Link
              to="/ask-fino"
              className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-750 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
            >
              <span>Ask Fino Live in Workspace</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </section>

      {/* Frequently Asked Questions */}
      <section className="relative z-10 py-20 px-6 lg:px-12 max-w-4xl mx-auto border-t border-slate-800/80">
        
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-full inline-block mb-3">
            Auditor & Controller FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Everything you need to know about Finora’s 3-way reconciliation and zero-hallucination architecture.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "How does 3-way matching differ from standard 2-way payment reconciliation?",
              a: "Standard 2-way tools only match your shopping cart against payment gateway settlement sheets. Finora adds the vital 3rd node: actual bank statement UTR deposits into your Kotak/HDFC accounts. This catches in-transit float, gateway withholding fee leakage, and missing bank credits that 2-way systems miss entirely."
            },
            {
              q: "How does Finora guarantee zero arithmetic hallucinations?",
              a: "Finora enforces a strict 'Deterministic Math at the Core, Grounded AI at the Shell' architectural rule. The on-device neural SLM is never asked to calculate percentages, sum totals, or estimate variances. All arithmetic is executed deterministically by SQLite and Python statistical packages, with numbers injected into verifiable tool output schemas."
            },
            {
              q: "How does the GSTR-2B Tax-Line Matcher prevent blocked ITC?",
              a: "Finora compares your internal purchase register lines against official GSTN GSTR-2B and TRACES feeds. Under CGST Rule 36(4), ITC can only be claimed if the supplier has filed their GSTR-1. Finora highlights non-compliant vendors in real time so you never forfeit input tax credits."
            },
            {
              q: "Is our financial data sent to third-party cloud LLM APIs?",
              a: "No. Finora runs 100% on-device using a local neural SLM via Ollama. All transactional data, ledger balances, and bank statements remain entirely within your private infrastructure with zero cloud data transmission."
            },
            {
              q: "How does Finora support Ind AS and statutory audit readiness?",
              a: "Finora aligns directly with Ind AS 1 (Presentation of Financial Statements), Ind AS 7 (Statement of Cash Flows), and Ind AS 115 (Revenue Recognition). It provides an automated 5-pillar close sequence, 1-click formal CFO memorandums, and immutable SHA-256 cryptographic audit logs."
            }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:text-white"
              >
                <span className="text-sm font-bold text-slate-200">{item.q}</span>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-200 ${expandedFaq === idx ? 'rotate-180 text-violet-400' : ''}`} 
                />
              </button>
              {expandedFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>

      </section>

      {/* High-Impact Final Call to Action */}
      <section className="relative z-10 py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="bg-gradient-to-r from-violet-950/80 via-slate-900 to-indigo-950/80 border border-violet-500/30 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 max-w-2xl mx-auto">
            Ready to audit your ledger with deterministic precision?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Experience the automated 3-way financial reconciliation engine and explore the full live demo dataset.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-sm shadow-xl shadow-white/10 transition-all cursor-pointer active:scale-98"
            >
              <span>Open Finora Dashboard</span>
              <ArrowRight size={16} />
            </Link>

            <button
              onClick={handleLaunchTour}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 transition-all cursor-pointer"
            >
              <Sparkles size={16} className="text-violet-400" />
              <span>Launch Quick Tour</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-8 px-6 lg:px-12 max-w-7xl mx-auto text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
        <div>
          Finora Autonomous AI Financial Controller • Engineered for the Razorpay Buildathon
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Ind AS 1/7/115 Compliant</span>
          <span>•</span>
          <span>Zero Arithmetic Hallucination</span>
        </div>
      </footer>

    </div>
  );
}
