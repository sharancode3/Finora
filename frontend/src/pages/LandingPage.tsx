import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, BookOpen, CreditCard, Building2, ShieldCheck, CheckCircle2, 
  Sparkles, Activity, TrendingUp, AlertTriangle, ChevronRight, HelpCircle, 
  Lock, RefreshCw, Zap, Sliders, FileText, ChevronDown, Check, Database,
  Eye, BarChart3, Layers, Compass, ArrowUpRight, Cpu, Search, CheckCircle,
  FileCheck2, GitCommit, Scale, LineChart, Terminal, Play, ArrowDownRight,
  Shield, CheckCheck, Clock, UserCheck, FileSpreadsheet, ArrowLeftRight,
  DollarSign, PiggyBank, Receipt, Banknote, ShieldAlert
} from 'lucide-react';
import { FinoraBrandLockup, FinoraMark } from '../components/ui/FinoraMark';
import { InstitutionLogo } from '../components/ui/InstitutionLogo';
import { api } from '../api/client';

// Interactive Sample Trace Transaction for Section 06
interface SampleTrace {
  id: string;
  orderId: string;
  gatewayId: string;
  bankUtr: string;
  grossAmount: number;
  netSettled: number;
  mdrFee: number;
  gstAmount: number;
  varianceAmount: number;
  status: 'EXACT_MATCH' | 'AMOUNT_MISMATCH' | 'POSSIBLE_DUPLICATE' | 'FEE_VARIANCE';
  bank: 'Kotak Mahindra' | 'HDFC Bank' | 'Pending Deposit';
  paperTrail: string;
}

const SAMPLE_TRACES: SampleTrace[] = [
  {
    id: 'txn_36b76cdc67e0',
    orderId: 'ORD_2026_8912',
    gatewayId: 'pay_rzp_9841',
    bankUtr: 'KOTAK_UTR_778102',
    grossAmount: 8500.00,
    netSettled: 8299.40,
    mdrFee: 170.00,
    gstAmount: 30.60,
    varianceAmount: 0.00,
    status: 'EXACT_MATCH',
    bank: 'Kotak Mahindra',
    paperTrail: 'Internal invoice matches Razorpay gateway capture. 2.0% MDR (₹170) and 18% GST (₹30.60) verified against Kotak Bank UTR credit.'
  },
  {
    id: 'exc_a17ebce376e6',
    orderId: 'ORD_2026_3391',
    gatewayId: 'pay_rzp_4412',
    bankUtr: 'HDFC_UTR_190442',
    grossAmount: 12500.00,
    netSettled: 5274.64,
    mdrFee: 250.00,
    gstAmount: 45.00,
    varianceAmount: 7225.36,
    status: 'AMOUNT_MISMATCH',
    bank: 'HDFC Bank',
    paperTrail: '₹7,225.36 monetary shortfall detected between expected gross invoice (₹12,500) and settled bank deposit (₹5,274.64). Highest priority item.'
  },
  {
    id: 'exc_b6eb43cc5acf',
    orderId: 'ORD_2026_7721',
    gatewayId: 'pay_rzp_6610',
    bankUtr: 'PENDING_CREDIT',
    grossAmount: 6200.00,
    netSettled: 0.00,
    mdrFee: 124.00,
    gstAmount: 22.32,
    varianceAmount: 6200.00,
    status: 'POSSIBLE_DUPLICATE',
    bank: 'Pending Deposit',
    paperTrail: 'Potential duplicate transaction hash detected. Identical card fingerprint matches prior settled batch. Suspended from bank credit.'
  },
  {
    id: 'exc_8fefd903a5cd',
    orderId: 'ORD_2026_5502',
    gatewayId: 'pay_rzp_3190',
    bankUtr: 'KOTAK_UTR_883291',
    grossAmount: 8500.00,
    netSettled: 8129.40,
    mdrFee: 340.00,
    gstAmount: 61.20,
    varianceAmount: 170.00,
    status: 'FEE_VARIANCE',
    bank: 'Kotak Mahindra',
    paperTrail: 'Gateway fee rate deduction was 4.0% (₹340.00) instead of contractual 2.0% standard (₹170.00), creating ₹170.00 fee leakage.'
  }
];

// 7-Day Cash Forecast Data Points
const FORECAST_POINTS = [
  { day: 'Day 1 (Aug 29)', base: 2.44, delayed: 2.44 },
  { day: 'Day 2 (Aug 30)', base: 2.52, delayed: 2.46 },
  { day: 'Day 3 (Aug 31)', base: 2.58, delayed: 2.48 },
  { day: 'Day 4 (Sep 01)', base: 2.63, delayed: 2.38 },
  { day: 'Day 5 (Sep 02)', base: 2.67, delayed: 2.29 },
  { day: 'Day 6 (Sep 03)', base: 2.70, delayed: 2.23 },
  { day: 'Day 7 (Sep 04)', base: 2.71, delayed: 2.18 }
];

// Lightweight scroll reveal hook conforming to Finora motion rules (150-250ms, ease-out, no bounce/glow)
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

export default function LandingPage() {
  const navigate = useNavigate();
  
  // Section Scroll-Reveal Observers (200ms ease-out)
  const lineageReveal = useScrollReveal();
  const threeSourcesReveal = useScrollReveal();
  const problemReveal = useScrollReveal();
  const traceReveal = useScrollReveal();
  const forecastReveal = useScrollReveal();
  const custodyReveal = useScrollReveal();
  
  // Interactive States
  const [selectedTrace, setSelectedTrace] = useState<SampleTrace>(SAMPLE_TRACES[0]);
  const [approvalState, setApprovalState] = useState<'pending' | 'approved' | 'audited'>('pending');
  const [delayDays, setDelayDays] = useState<number>(0);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [chartHoverIndex, setChartHoverIndex] = useState<number | null>(null);

  // Mouse Parallax for Hero
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 12;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Live Canonical Numbers from Backend SQLite
  const [liveStats, setLiveStats] = useState({
    txCount: 60,
    accountCount: 4,
    exceptionCount: 4,
    exceptionAmount: 26900,
    grossVolume: 298603.50,
    netSettled: 244371.19,
    matchRate: 81.8,
    floatAmount: 18763.08,
    mdrFees: 7262.07,
    gstAmount: 1307.16
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
            matchRate: res.data.value_reconciliation_rate || 81.8,
            floatAmount: res.data.in_transit_float || 18763.08,
            mdrFees: res.data.mdr_fees || 7262.07,
            gstAmount: res.data.gst_amount || 1307.16
          });
        }
      } catch (e) {
        // Fallback to verified canonical numbers
      }
    };

    fetchLiveTelemetry();
  }, []);

  const handleLaunchTour = () => {
    localStorage.removeItem('finora_quick_tour_dismissed');
    window.dispatchEvent(new CustomEvent('finora-open-quick-tour'));
    navigate('/dashboard');
  };

  // Dynamic Cash calculation based on delay slider
  const dynamicProjectedCash = delayDays === 0 ? 2.71 : delayDays === 1 ? 2.45 : 2.18;
  const dynamicCashRisk = delayDays === 0 ? 'LOW' : delayDays === 1 ? 'LOW' : 'MEDIUM';

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#0F172A] font-sans antialiased selection:bg-[#5B45F5] selection:text-white">
      
      {/* =========================================================================
          1. PREMIUM NAVIGATION
      ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-6 lg:px-12 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Left Brand Lockup */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold font-mono text-sm shadow-2xs">
              F
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-[#0F172A] tracking-tight">Finora</span>
                <span className="text-[9px] font-mono font-bold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] px-1.5 py-0.2 rounded">
                  AI FINANCE CONTROLLER
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#64748B]">
            <a href="#three-sources" className="hover:text-[#0F172A] transition-colors">3-Way Flow</a>
            <a href="#problem-story" className="hover:text-[#0F172A] transition-colors">The Problem</a>
            <a href="#how-it-works" className="hover:text-[#0F172A] transition-colors">How It Works</a>
            <a href="#evidence" className="hover:text-[#0F172A] transition-colors">Evidence Trail</a>
            <a href="#intelligence" className="hover:text-[#0F172A] transition-colors">AI & Governance</a>
            <a href="#cash-forecast" className="hover:text-[#0F172A] transition-colors">Cash Intelligence</a>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLaunchTour}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] bg-[#F8F9FA] hover:bg-[#F1F5F9] px-3 py-2 rounded-lg border border-[#E2E8F0] transition-all cursor-pointer"
            >
              <Sparkles size={13} className="text-[#5B45F5]" />
              <span>Tour</span>
            </button>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] px-4.5 py-2 rounded-lg shadow-2xs transition-all cursor-pointer active:scale-98"
            >
              <span>Enter Controller</span>
              <ArrowRight size={13} />
            </Link>
          </div>

        </div>
      </header>

      {/* =========================================================================
          2. HERO: FINANCIAL CONTROL STATEMENT & INTERACTIVE FLOW SYSTEM
      ========================================================================= */}
      <section 
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="pt-20 pb-24 px-6 lg:px-12 max-w-6xl mx-auto flex flex-col items-center text-center relative"
      >
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E5E7EB] text-[#475569] text-xs font-semibold mb-8 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          <span className="text-[#0F172A] font-bold">CONTINUOUS 3-WAY RECONCILIATION</span>
          <span className="text-[#CBD5E1]">•</span>
          <span className="text-[#64748B]">Ind AS–Aligned</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#0F172A] max-w-4xl leading-[1.08] mb-6">
          Know where every <br className="hidden sm:inline" />
          rupee went.
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-xl text-[#64748B] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Finora reconciles your <strong>internal books</strong>, <strong>payment settlements</strong>, and <strong>bank credits</strong> — then explains what does not tie out.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] font-bold text-sm shadow-xs transition-all cursor-pointer active:scale-98"
          >
            <span>Enter Controller Workspace</span>
            <ArrowRight size={16} />
          </Link>

          <a
            href="#three-sources"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-[#F8F9FA] text-[#334155] font-semibold text-sm border border-[#E2E8F0] shadow-2xs transition-all cursor-pointer"
          >
            <span>Explore 3-Way Reconciliation</span>
            <ChevronDown size={15} className="text-[#94A3B8]" />
          </a>
        </div>

        {/* HERO VISUAL: Editorial Interactive Financial Lineage Flow */}
        <div 
          id="financial-lineage"
          ref={lineageReveal.ref}
          style={{
            transform: `perspective(1000px) rotateX(${-mousePos.y * 0.15}deg) rotateY(${mousePos.x * 0.15}deg) translate3d(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px, 0)`
          }}
          className={`w-full max-w-4xl bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xs text-left transition-all duration-200 ease-out relative ${
            lineageReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4 mb-6">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748B]">
              Active Financial Lineage • August 2026 Batch
            </span>
            <span className="text-xs font-mono font-bold text-[#16A34A] bg-[#F0FDF4] px-2.5 py-0.5 rounded border border-[#BBF7D0]">
              81.8% Value Reconciled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            
            {/* Step 1: Internal Books */}
            <div 
              onMouseEnter={() => setHoveredNode('books')}
              onMouseLeave={() => setHoveredNode(null)}
              className={`p-5 rounded-xl border transition-all cursor-default ${
                hoveredNode === 'books' ? 'bg-[#F8F9FA] border-[#0F172A] shadow-xs' : 'bg-[#F8F9FA] border-[#E2E8F0]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
                  01 • INTERNAL BOOKS
                </span>
                <BookOpen size={14} className="text-[#64748B]" />
              </div>
              <div className="text-2xl font-extrabold text-[#0F172A] font-mono">
                ₹2,98,603.50
              </div>
              <p className="text-xs text-[#64748B] mt-2">
                Expected gross revenue across 60 sales invoices.
              </p>
            </div>

            {/* Step 2: Payment Gateway */}
            <div 
              onMouseEnter={() => setHoveredNode('gateway')}
              onMouseLeave={() => setHoveredNode(null)}
              className={`p-5 rounded-xl border transition-all cursor-default ${
                hoveredNode === 'gateway' ? 'bg-[#F8F9FA] border-[#5B45F5] shadow-xs' : 'bg-[#F8F9FA] border-[#E2E8F0]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
                  02 • RAZORPAY SETTLEMENTS
                </span>
                <InstitutionLogo name="Razorpay" size={18} />
              </div>
              <div className="text-2xl font-extrabold text-[#0F172A] font-mono">
                ₹2,71,273.11
              </div>
              <p className="text-xs text-[#64748B] mt-2">
                Net of ₹7,262 MDR (2%) and ₹1,307 GST (18%).
              </p>
            </div>

            {/* Step 3: Bank Credits */}
            <div 
              onMouseEnter={() => setHoveredNode('bank')}
              onMouseLeave={() => setHoveredNode(null)}
              className={`p-5 rounded-xl border transition-all cursor-default ${
                hoveredNode === 'bank' ? 'bg-[#F0FDF4] border-[#16A34A] shadow-xs' : 'bg-[#F8F9FA] border-[#E2E8F0]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-[#16A34A] uppercase tracking-wider">
                  03 • BANK STATEMENT VAULTS
                </span>
                <div className="flex items-center gap-1">
                  <InstitutionLogo name="Kotak" size={16} />
                  <InstitutionLogo name="HDFC" size={16} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-[#16A34A] font-mono">
                ₹2,44,371.19
              </div>
              <p className="text-xs text-[#64748B] mt-2">
                Net cash deposited in Kotak and HDFC UTR batches.
              </p>
            </div>

          </div>

          {/* Discrepancy Notification Strip */}
          <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#B91C1C]">
              <AlertTriangle size={14} className="shrink-0" />
              <span><strong>₹26,900.00 trapped in 4 open exceptions</strong> (isolated for review)</span>
            </div>
            <div className="text-[#64748B]">
              In-Transit Float: <strong className="text-[#0F172A]">₹18,763.08 (T+2 SLA)</strong>
            </div>
          </div>

        </div>

      </section>

      {/* =========================================================================
          3. 3-WAY FINANCIAL FLOW: THREE SOURCES, ONE FINANCIAL TRUTH
      ========================================================================= */}
      <section 
        id="three-sources" 
        ref={threeSourcesReveal.ref}
        className={`py-24 px-6 lg:px-12 max-w-6xl mx-auto border-t border-[#E5E7EB] transition-all duration-200 ease-out ${
          threeSourcesReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#5B45F5] block mb-2">
            Continuous 3-Way Lineage
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">
            Three sources. One financial truth.
          </h2>
          <p className="text-base text-[#64748B] leading-relaxed">
            Most finance software stops at 2-way payment gateway matching. Finora proves the full 3-node loop from customer invoice to bank deposit.
          </p>
        </div>

        {/* 3 Visual Connected Cards with Restrained Ink-Tone Fintech Geometry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Source 01: Internal Books */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-2xs hover:border-[#CBD5E1] transition-all flex flex-col justify-between group">
            {/* Ink-Tone Architectural Header */}
            <div className="h-32 bg-[#0F172A] p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#94A3B8_1px,transparent_1px)] [background-size:12px_12px]" />
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded border border-white/10">
                  01 • SOURCE OF TRUTH
                </span>
                <BookOpen size={16} className="text-slate-300" />
              </div>
              <div className="z-10 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                <span>Capture Hash: #INV-2026-AUG</span>
                <span className="text-emerald-400 font-bold">100% Ingested</span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-1.5">Internal Books</h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-5">
                  Cart checkouts, ERP invoices, and billing entries recording expected gross revenue.
                </p>
                
                <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] font-mono text-xs space-y-1">
                  <div className="flex justify-between text-[#64748B]">
                    <span>Expected Gross:</span>
                    <strong className="text-[#0F172A]">₹2,98,603.50</strong>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Batch Volume:</span>
                    <strong className="text-[#0F172A]">60 Invoices</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#F1F5F9] text-xs font-bold text-[#16A34A] flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>Recognized Revenue</span>
              </div>
            </div>
          </div>

          {/* Source 02: Razorpay Settlement */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-2xs hover:border-[#CBD5E1] transition-all flex flex-col justify-between group">
            {/* Ink-Tone Architectural Header */}
            <div className="h-32 bg-[#0B132B] p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#60A5FA_1px,transparent_1px)] [background-size:12px_12px]" />
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded border border-white/10 flex items-center gap-1.5">
                  <InstitutionLogo name="Razorpay" size={13} />
                  02 • PAYMENT GATEWAY
                </span>
                <span className="text-[10px] font-mono text-blue-300 font-bold bg-blue-500/20 px-2 py-0.5 rounded">
                  2.0% MDR + 18% GST
                </span>
              </div>
              <div className="z-10 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                <span>Contract SLA: T+2 Rolling</span>
                <span className="text-blue-300 font-bold">Auto-Reconciled</span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-1.5 flex items-center gap-2">
                  <span>Razorpay Settlement</span>
                  <InstitutionLogo name="Razorpay" size={18} />
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-5">
                  Settlement feeds detailing gross amounts, contractual 2.0% MDR fees, and 18% statutory GST.
                </p>
                
                <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] font-mono text-xs space-y-1">
                  <div className="flex justify-between text-[#64748B]">
                    <span>MDR Fee (2.0%):</span>
                    <strong className="text-[#B91C1C]">-₹7,262.07</strong>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>GST (18% on Fee):</span>
                    <strong className="text-[#B91C1C]">-₹1,307.16</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#F1F5F9] text-xs font-bold text-[#5B45F5] flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>Contractual Rates Verified</span>
              </div>
            </div>
          </div>

          {/* Source 03: Bank Statement Vaults */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-2xs hover:border-[#CBD5E1] transition-all flex flex-col justify-between group">
            {/* Ink-Tone Architectural Header */}
            <div className="h-32 bg-[#062018] p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4ADE80_1px,transparent_1px)] [background-size:12px_12px]" />
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-mono font-bold text-emerald-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded border border-white/10 flex items-center gap-1.5">
                  <Building2 size={13} />
                  03 • BANK STATEMENT VAULTS
                </span>
                <div className="flex items-center gap-1">
                  <InstitutionLogo name="Kotak" size={14} />
                  <InstitutionLogo name="HDFC" size={14} />
                </div>
              </div>
              <div className="z-10 font-mono text-[11px] text-emerald-200 flex items-center justify-between">
                <span>Vault Tie-Out: ₹0.00 Variance</span>
                <span className="text-emerald-400 font-bold">Verified Net</span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-1.5 flex items-center gap-2">
                  <span>Bank Statement</span>
                  <InstitutionLogo name="Kotak" size={16} />
                  <InstitutionLogo name="HDFC" size={16} />
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-5">
                  Actual deposited cash verified in Kotak Mahindra and HDFC Bank statements via UTR batches.
                </p>
                
                <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] font-mono text-xs space-y-1">
                  <div className="flex justify-between text-[#64748B]">
                    <span>Net Settled Cash:</span>
                    <strong className="text-[#16A34A]">₹2,44,371.19</strong>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>In-Transit Float (T+2 SLA):</span>
                    <strong className="text-[#B45309]">₹18,763.08</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#F1F5F9] text-xs font-bold text-[#16A34A] flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>Verified Cash-in-Hand</span>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* =========================================================================
          4. THE RECONCILIATION PROBLEM STORY
      ========================================================================= */}
      <section id="problem-story" ref={problemReveal.ref} className={`py-24 px-6 lg:px-12 max-w-6xl mx-auto border-t border-[#E5E7EB] transition-all duration-200 ease-out ${problemReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>

        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#B91C1C] block">
              The Reconciliation Problem
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
              Money moves through systems. <br />
              The truth rarely arrives in one place.
            </h2>
            <p className="text-base text-[#64748B] leading-relaxed">
              When transaction volumes scale, spreadsheets break. Orders get captured in your cart, gateway fees get deducted silently, and bank settlements arrive days later in batched UTR lumps.
            </p>
            <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#0F172A] shadow-2xs">
              "Manual reconciliation finds the difference. Finora explains it."
            </div>
          </div>

          {/* The Multi-System Asymmetry Diagram */}
          <div className="lg:col-span-6 bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Sample Multi-System Asymmetry
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs font-mono">
              <span className="text-[#64748B]">Internal Order Ledger</span>
              <strong className="text-[#0F172A]">₹10,000.00 (Captured)</strong>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <InstitutionLogo name="Razorpay" size={14} />
                <span className="text-[#64748B]">Razorpay Settlement Feed</span>
              </div>
              <strong className="text-[#0F172A]">₹9,800.00 (Net of Fee)</strong>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#FEF2F2] rounded-xl border border-[#FECACA] text-xs font-mono text-[#B91C1C]">
              <div className="flex items-center gap-1.5">
                <InstitutionLogo name="Kotak" size={14} />
                <span>Bank Statement Deposit</span>
              </div>
              <strong>₹0.00 (Uncredited)</strong>
            </div>

            <div className="p-4 bg-[#FFFBEB] rounded-xl border border-[#FEF3C7] text-xs text-[#B45309] leading-relaxed">
              <strong>Root Cause:</strong> T+2 settlement window latency + missing UTR batch aggregation. Finora tags this immediately as In-Transit Float rather than permanent loss.
            </div>
          </div>

        </div>

      </section>

      {/* =========================================================================
          5. HOW FINORA WORKS: CONTINUOUS PIPELINE
      ========================================================================= */}
      <section id="how-it-works" className="py-24 px-6 lg:px-12 max-w-6xl mx-auto border-t border-[#E5E7EB]">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#5B45F5] block mb-2">
            The Continuous Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">
            From transaction to verified financial truth.
          </h2>
          <p className="text-base text-[#64748B]">
            A single continuous 4-stage pipeline that operates without human fatigue or manual formulas.
          </p>
        </div>

        {/* 4-Step Continuous Sequence */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xs space-y-3">
            <div className="text-xs font-mono font-bold text-[#5B45F5] uppercase tracking-wider">
              01 • COLLECT
            </div>
            <h4 className="text-base font-bold text-[#0F172A]">Multi-Source Ingestion</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Ingests sales orders, Razorpay settlement feeds, and bank statement CSV/UTR logs.
            </p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xs space-y-3">
            <div className="text-xs font-mono font-bold text-[#5B45F5] uppercase tracking-wider">
              02 • RECONCILE
            </div>
            <h4 className="text-base font-bold text-[#0F172A]">Deterministic Matching</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Executes exact 1:1 matching, fuzzy batch aggregation, fee rate checks, and GST verification.
            </p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xs space-y-3">
            <div className="text-xs font-mono font-bold text-[#5B45F5] uppercase tracking-wider">
              03 • INVESTIGATE
            </div>
            <h4 className="text-base font-bold text-[#0F172A]">4-Factor Root Cause</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Audits customer refunds, fee variances, duplicate records, and settlement delays.
            </p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xs space-y-3">
            <div className="text-xs font-mono font-bold text-[#5B45F5] uppercase tracking-wider">
              04 • ACT
            </div>
            <h4 className="text-base font-bold text-[#0F172A]">Closed-Loop Resolution</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Presents actionable recommendations for human approval and generates immutable audit trails.
            </p>
          </div>

        </div>

      </section>

      {/* =========================================================================
          6. INTERACTIVE EVIDENCE VISUALIZATION
      ========================================================================= */}
      <section id="evidence" className="py-24 px-6 lg:px-12 max-w-6xl mx-auto border-t border-[#E5E7EB]">
        
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#5B45F5] block mb-2">
            Verifiable Lineage
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">
            Every discrepancy has a trail.
          </h2>
          <p className="text-base text-[#64748B] leading-relaxed">
            Click across real transactions from our demo batch to inspect the complete 3-way lineage graph and mathematical proof.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Transaction Selector */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B] block mb-1">
              Select Transaction Record:
            </span>

            {SAMPLE_TRACES.map((trace) => (
              <button
                key={trace.id}
                onClick={() => setSelectedTrace(trace)}
                className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTrace.id === trace.id
                    ? 'bg-white border-[#0F172A] ring-1 ring-[#0F172A] shadow-xs'
                    : 'bg-white/60 border-[#E5E7EB] hover:border-[#CBD5E1] text-[#64748B]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-[#0F172A]">{trace.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    trace.status === 'EXACT_MATCH' ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]' :
                    trace.status === 'AMOUNT_MISMATCH' ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]' :
                    trace.status === 'POSSIBLE_DUPLICATE' ? 'bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]' :
                    'bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE]'
                  }`}>
                    {trace.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span>Gross: <strong className="text-[#0F172A]">₹{trace.grossAmount.toLocaleString('en-IN')}</strong></span>
                  <span>Net: <strong className={trace.netSettled > 0 ? 'text-[#15803D]' : 'text-[#64748B]'}>₹{trace.netSettled.toLocaleString('en-IN')}</strong></span>
                  <div className="flex items-center gap-1">
                    <InstitutionLogo name={trace.bank} size={14} />
                    <span className="text-[#64748B]">{trace.bank}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Selected Evidence Detail Card */}
          <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-2xl p-7 shadow-xs">
            
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748B] block">
                  3-Way Evidence Inspector
                </span>
                <h4 className="text-base font-bold text-[#0F172A] font-mono mt-0.5">
                  {selectedTrace.id}
                </h4>
              </div>

              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                selectedTrace.status === 'EXACT_MATCH' ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]' :
                'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
              }`}>
                {selectedTrace.status === 'EXACT_MATCH' ? '✓ RECONCILED' : '⚠ DISCREPANCY DETECTED'}
              </span>
            </div>

            {/* 3-Step Node Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 font-mono text-xs">
              <div className="p-3.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] block mb-1">1. INTERNAL ORDER</span>
                <div className="font-bold text-[#0F172A] truncate">{selectedTrace.orderId}</div>
                <div className="text-[#334155] mt-1 font-bold">₹{selectedTrace.grossAmount.toLocaleString('en-IN')}</div>
              </div>

              <div className="p-3.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center gap-1 text-[10px] text-[#64748B] mb-1">
                  <InstitutionLogo name="Razorpay" size={12} />
                  <span>2. RAZORPAY GATEWAY</span>
                </div>
                <div className="font-bold text-[#5B45F5] truncate">{selectedTrace.gatewayId}</div>
                <div className="text-[#B91C1C] mt-1 font-bold">-₹{(selectedTrace.mdrFee + selectedTrace.gstAmount).toFixed(2)}</div>
              </div>

              <div className="p-3.5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center gap-1 text-[10px] text-[#64748B] mb-1">
                  <InstitutionLogo name={selectedTrace.bank} size={12} />
                  <span>3. BANK CREDIT</span>
                </div>
                <div className="font-bold text-[#15803D] truncate">{selectedTrace.bankUtr}</div>
                <div className="text-[#15803D] mt-1 font-bold">₹{selectedTrace.netSettled.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Evidence Explanation */}
            <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] text-xs text-[#334155] leading-relaxed">
              <strong>Paper Trail Analysis:</strong> {selectedTrace.paperTrail}
            </div>

            <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-mono text-[#64748B]">
              <span>Audit Hash: <strong className="text-[#0F172A]">sha256:7f9a...{selectedTrace.id.substring(4, 10)}</strong></span>
              <Link to="/reconciliation" className="text-[#5B45F5] font-bold hover:underline">
                View in Ledger →
              </Link>
            </div>

          </div>

        </div>

      </section>

      {/* =========================================================================
          7. AI CONTROLLER SHOWCASE (ZERO-HALLUCINATION EVIDENCE)
      ========================================================================= */}
      <section id="intelligence" className="py-24 px-6 lg:px-12 max-w-6xl mx-auto border-t border-[#E5E7EB]">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Structured AI Verification Dialog */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#5B45F5] block mb-2">
                Autonomous Investigation
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">
                When the numbers don't tie, Finora investigates.
              </h2>
              <p className="text-base text-[#64748B] leading-relaxed">
                No conversational fluff or hallucinated guesses. Finora runs structured verification checks directly against the SQLite financial ledger.
              </p>
            </div>

            {/* Structured AI Dialog Mockup */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-7 shadow-xs space-y-6">
              
              {/* User Question */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] text-[#475569] font-bold font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                  U
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-[#64748B] block">Finance Controller</span>
                  <p className="text-sm font-bold text-[#0F172A] mt-0.5">
                    "Why is ₹7,225.36 on transaction txn_a17ebce376e6 still unresolved?"
                  </p>
                </div>
              </div>

              {/* Fino AI Answer */}
              <div className="p-6 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#5B45F5] text-white font-bold font-mono text-xs flex items-center justify-center">
                    F
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0F172A]">Fino Verification Engine</span>
                  <span className="text-[10px] font-mono text-[#15803D] bg-[#F0FDF4] px-2 py-0.2 rounded border border-[#BBF7D0] ml-auto">
                    0 Math Violations
                  </span>
                </div>

                <p className="text-xs text-[#334155] leading-relaxed">
                  I executed 4 deterministic checks for exception record <code className="font-mono font-bold text-[#0F172A]">exc_a17ebce376e6</code>:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-white rounded-lg border border-[#E5E7EB] text-[#15803D] flex items-center gap-2">
                    <Check size={14} /> <span>Internal order validated (₹12,500.00)</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-[#E5E7EB] text-[#15803D] flex items-center gap-2">
                    <Check size={14} /> <span>MDR fee verified at 2.0% standard</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-[#E5E7EB] text-[#B91C1C] flex items-center gap-2">
                    <AlertTriangle size={14} /> <span>Shortfall detected in HDFC deposit</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-[#E5E7EB] text-[#15803D] flex items-center gap-2">
                    <Check size={14} /> <span>Aging SLA check: 3.2 days elapsed</span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-[#334155] leading-relaxed">
                  <strong>Conclusion:</strong> Bank deposit received ₹5,274.64 against expected ₹12,500.00 invoice. ₹7,225.36 remains unmatched.
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-[#0F172A]">
                    Recommended Action: <strong>Escalate batch to Gateway Ops</strong>
                  </span>
                  <Link
                    to="/record/exception/exc_a17ebce376e6"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] px-3.5 py-1.5 rounded-lg shadow-2xs"
                  >
                    <span>Review Evidence Trail</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Editorial Finance Controller Imagery */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white shadow-xs group min-h-[460px] flex flex-col justify-end">
            <img 
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80" 
              alt="Finance Controller Oversight" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 brightness-[0.92]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/95 via-[#0F172A]/40 to-transparent" />
            
            <div className="relative z-10 p-6 text-white space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#BBF7D0] bg-[#16A34A]/30 border border-[#16A34A]/50 px-2 py-0.5 rounded backdrop-blur-sm">
                Human-in-the-Loop Governance
              </span>
              <h3 className="text-lg font-bold leading-snug">
                Accountable Decision Making
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                AI recommends root causes and resolutions, but human finance controllers maintain final approval authority with cryptographic SHA-256 audit logging.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* =========================================================================
          8. HUMAN APPROVAL & GOVERNANCE
      ========================================================================= */}
      <section className="py-24 px-6 lg:px-12 max-w-6xl mx-auto border-t border-[#E5E7EB]">
        
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#5B45F5] block mb-2">
            Governance & Segregation of Duties
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">
            Automation should move fast. <br />
            Financial decisions should remain accountable.
          </h2>
          <p className="text-base text-[#64748B] leading-relaxed">
            AI recommends, human controllers approve. Every status mutation generates an immutable, tamper-proof audit record.
          </p>
        </div>

        {/* Interactive Lifecycle Card */}
        <div className="max-w-3xl bg-white border border-[#E5E7EB] rounded-2xl p-7 shadow-xs">
          
          <div className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider mb-6">
            Interactive Exception Lifecycle Simulation
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono text-center mb-8">
            <div className={`p-3 rounded-xl border ${approvalState === 'pending' ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA] font-bold' : 'bg-[#F8F9FA] text-[#64748B] border-[#E2E8F0]'}`}>
              1. OPEN (₹7,225)
            </div>
            <div className={`p-3 rounded-xl border ${approvalState === 'pending' ? 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7] font-bold' : 'bg-[#F8F9FA] text-[#64748B] border-[#E2E8F0]'}`}>
              2. AI RECOMMENDS
            </div>
            <div className={`p-3 rounded-xl border ${approvalState === 'approved' ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#DBEAFE] font-bold' : 'bg-[#F8F9FA] text-[#64748B] border-[#E2E8F0]'}`}>
              3. CONTROLLER APPROVES
            </div>
            <div className={`p-3 rounded-xl border ${approvalState === 'audited' ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0] font-bold' : 'bg-[#F8F9FA] text-[#64748B] border-[#E2E8F0]'}`}>
              4. VERIFIED & RECORDED
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0]">
            <div>
              <span className="text-xs font-mono text-[#64748B] block">Current State:</span>
              <strong className="text-sm text-[#0F172A] font-mono">
                {approvalState === 'pending' && 'Pending Controller Action (Risk: High)'}
                {approvalState === 'approved' && 'Approved by Sharan (Finance Controller)'}
                {approvalState === 'audited' && 'Dual-Custody Audit Record Recorded in SQLite'}
              </strong>
            </div>

            <div className="flex items-center gap-2">
              {approvalState === 'pending' && (
                <button
                  onClick={() => setApprovalState('approved')}
                  className="px-4 py-2 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Approve Escalation
                </button>
              )}

              {approvalState === 'approved' && (
                <button
                  onClick={() => setApprovalState('audited')}
                  className="px-4 py-2 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Generate Audit Proof
                </button>
              )}

              {approvalState === 'audited' && (
                <button
                  onClick={() => setApprovalState('pending')}
                  className="px-4 py-2 rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#F8F9FA] text-[#475569] text-xs font-bold transition-all cursor-pointer"
                >
                  Reset Demo State
                </button>
              )}
            </div>
          </div>

        </div>

      </section>

      {/* =========================================================================
          9. CASH INTELLIGENCE SHOWCASE (WITH INTERACTIVE SVG CHART & SLIDER)
      ========================================================================= */}
      <section id="cash-forecast" ref={forecastReveal.ref} className={`py-24 px-6 lg:px-12 max-w-6xl mx-auto border-t border-[#E5E7EB] transition-all duration-200 ease-out ${forecastReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>

        
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#5B45F5] block mb-2">
            Treasury & Forward Liquidity
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">
            Know what today's discrepancies mean for tomorrow's cash.
          </h2>
          <p className="text-base text-[#64748B] leading-relaxed">
            Finora connects 3-way reconciliation directly to forward liquidity forecasting using a 1,000-trial Monte Carlo stochastic engine.
          </p>
        </div>

        {/* Forecast Visual & Interactive Delay Slider */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-7 shadow-xs space-y-8">
          
          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase">Verified Bank Cash</span>
              <div className="text-2xl font-extrabold text-[#15803D] font-mono">₹2.44L</div>
              <span className="text-xs text-[#64748B]">Confirmed in Kotak & HDFC</span>
            </div>

            <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase">Projected 7-Day Cash</span>
              <div className="text-2xl font-extrabold text-[#0F172A] font-mono">₹{dynamicProjectedCash}L</div>
              <span className="text-xs text-[#64748B]">Monte Carlo P50 median path</span>
            </div>

            <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase">Cash at Risk</span>
              <div className="text-2xl font-extrabold text-[#B91C1C] font-mono">₹26.9K</div>
              <span className="text-xs text-[#B91C1C]">Trapped in 4 open items</span>
            </div>
          </div>

          {/* SVG Financial Line Chart with Tooltip */}
          <div className="p-5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-[#0F172A]">7-Day Forward Stochastic Liquidity Curve</span>
              <span className="text-[#64748B]">
                {chartHoverIndex !== null 
                  ? `${FORECAST_POINTS[chartHoverIndex].day}: ₹${delayDays === 0 ? FORECAST_POINTS[chartHoverIndex].base : FORECAST_POINTS[chartHoverIndex].delayed}L`
                  : 'Hover nodes to inspect values'}
              </span>
            </div>

            <div className="w-full h-36 relative">
              <svg viewBox="0 0 600 120" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5B45F5" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#5B45F5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="30" x2="600" y2="30" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="600" y2="70" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="110" x2="600" y2="110" stroke="#E2E8F0" strokeWidth="1" />

                {/* Area Fill */}
                <path
                  d={delayDays === 0 
                    ? "M 0 110 L 0 95 C 100 80, 200 65, 300 50 C 400 40, 500 35, 600 25 L 600 110 Z"
                    : "M 0 110 L 0 95 C 100 85, 200 80, 300 95 C 400 100, 500 105, 600 110 Z"
                  }
                  fill="url(#cashGrad)"
                  className="transition-all duration-700 ease-out"
                />

                {/* Main Curve Line */}
                <path
                  d={delayDays === 0
                    ? "M 0 95 C 100 80, 200 65, 300 50 C 400 40, 500 35, 600 25"
                    : "M 0 95 C 100 85, 200 80, 300 95 C 400 100, 500 105, 600 110"
                  }
                  fill="none"
                  stroke={delayDays === 0 ? "#5B45F5" : "#D97706"}
                  strokeWidth="2.5"
                  className="transition-all duration-700 ease-out"
                />

                {/* Interactive Points */}
                {FORECAST_POINTS.map((pt, idx) => {
                  const cx = (idx / (FORECAST_POINTS.length - 1)) * 600;
                  const cy = delayDays === 0
                    ? 95 - (idx / (FORECAST_POINTS.length - 1)) * 70
                    : 95 + (idx > 2 ? (idx - 2) * 4 : 0);
                  
                  return (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r={chartHoverIndex === idx ? 5 : 3.5}
                      fill={chartHoverIndex === idx ? "#0F172A" : delayDays === 0 ? "#5B45F5" : "#D97706"}
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setChartHoverIndex(idx)}
                      onMouseLeave={() => setChartHoverIndex(null)}
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Interactive Scenario Interaction */}
          <div className="p-5 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#0F172A]">Simulate Settlement Latency (+Days)</h4>
                <p className="text-xs text-[#64748B]">Slide to stress-test bank deposit delays on available working capital</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${
                dynamicCashRisk === 'LOW' ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]' : 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]'
              }`}>
                RISK: {dynamicCashRisk}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-mono font-bold text-[#64748B]">0 Days (SLA)</span>
              <input
                type="range"
                min="0"
                max="2"
                step="1"
                value={delayDays}
                onChange={(e) => setDelayDays(Number(e.target.value))}
                className="flex-1 accent-[#0F172A] cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-[#0F172A] bg-white px-3 py-1 rounded border border-[#E2E8F0]">
                +{delayDays} {delayDays === 1 ? 'Day' : 'Days'} Delay
              </span>
            </div>

            <div className="text-xs font-mono text-[#64748B]">
              {delayDays === 0 && 'Base case: 7-day liquidity projection holds comfortably at ₹2.71L.'}
              {delayDays === 1 && '1-Day Delay: In-transit float expands to ₹38.5k; working capital remains solvent.'}
              {delayDays === 2 && '2-Day Delay: Cash buffer drops to ₹2.18L (-₹53.1k drop). Treasury risk elevated to Medium.'}
            </div>
          </div>

        </div>

      </section>

      {/* =========================================================================
          10. MEASURED OUTCOMES (HONESTY DESIGN)
      ========================================================================= */}
      <section id="outcomes" className="py-24 px-6 lg:px-12 max-w-6xl mx-auto border-t border-[#E5E7EB]">
        
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#5B45F5] block mb-2">
            Honest Financial Metrics
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">
            Good financial control doesn't hide uncertainty. <br />
            It isolates it.
          </h2>
          <p className="text-base text-[#64748B] leading-relaxed">
            Finora does not pretend every discrepancy can be resolved automatically. It separates clean matches from genuine exposure and hands controllers the proof.
          </p>
        </div>

        {/* 4 Measured Outcome Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase">Processed Batch</span>
            <div className="text-3xl font-extrabold text-[#0F172A] font-mono">60 Records</div>
            <span className="text-xs text-[#64748B]">₹2,98,603.50 Gross Volume</span>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase">Record Match Rate</span>
            <div className="text-3xl font-extrabold text-[#0F172A] font-mono">81.7%</div>
            <span className="text-xs text-[#64748B]">49 / 60 Exact Settled Txns</span>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#15803D] font-mono">81.8%</span>
            <div className="text-xs text-[#15803D]">₹2,44,371.19 Settled Cash</div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase">Unresolved Exceptions</span>
            <div className="text-3xl font-extrabold text-[#B91C1C] font-mono">4 Items</div>
            <span className="text-xs text-[#B91C1C]">₹26,900.00 Exposed</span>
          </div>

        </div>

        <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono shadow-2xs">
          <div className="flex items-center gap-2 text-[#334155]">
            <CheckCheck size={16} className="text-[#15803D]" />
            <span><strong>Zero Arithmetic Residual:</strong> Gross − Exceptions − Float − Fees − GST = Settled Cash ($0.00 Variance)</span>
          </div>
          <span className="text-[#15803D] font-bold bg-[#F0FDF4] px-2.5 py-1 rounded border border-[#BBF7D0] self-start sm:self-auto">
            100% AUDIT TIE-OUT
          </span>
        </div>

      </section>

      {/* =========================================================================
          11. FINAL CTA
      ========================================================================= */}
      <section className="py-24 px-6 lg:px-12 max-w-4xl mx-auto text-center border-t border-[#E5E7EB]">
        <div className="space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
            Ready to see where your money went?
          </h2>
          <p className="text-base text-[#64748B] max-w-xl mx-auto leading-relaxed">
            Run the controller against the current financial batch.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] font-bold text-sm shadow-sm transition-all cursor-pointer active:scale-98"
            >
              <span>Enter Controller Workspace</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/reconciliation"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-[#F8F9FA] text-[#334155] font-semibold text-sm border border-[#E2E8F0] shadow-2xs transition-all cursor-pointer"
            >
              <span>Explore Reconciliation</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          12. MINIMAL FOOTER
      ========================================================================= */}
      <footer className="border-t border-[#E5E7EB] bg-white py-10 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#64748B]">
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#0F172A] text-white font-bold font-mono text-xs flex items-center justify-center">
              F
            </div>
            <span className="font-bold text-[#0F172A]">Finora</span>
            <span className="text-[#94A3B8]">•</span>
            <span>AI Finance Controller</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <Link to="/dashboard" className="hover:text-[#0F172A] transition-colors">Workspace</Link>
            <Link to="/reconciliation" className="hover:text-[#0F172A] transition-colors">Reconciliation</Link>
            <Link to="/exceptions" className="hover:text-[#0F172A] transition-colors">Exceptions</Link>
            <Link to="/cash-position" className="hover:text-[#0F172A] transition-colors">Cash Position</Link>
          </div>

          <div className="text-[11px] font-mono text-[#94A3B8]">
            Continuous 3-Way Reconciliation • Ind AS 1, 7, 115 Aligned
          </div>

        </div>
      </footer>

    </div>
  );
}
