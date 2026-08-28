import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Layers, 
  Building2, 
  CreditCard, 
  TrendingUp, 
  Lock, 
  Clock, 
  Scale, 
  Compass, 
  Users, 
  BookOpen, 
  Search,
  ChevronRight,
  ChevronDown,
  Info,
  DollarSign,
  AlertTriangle,
  FileText,
  Workflow,
  Brain,
  Cpu,
  Database,
  LineChart,
  GitBranch
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { FinoraMark } from './ui/FinoraMark';

export default function AppInfoGuide() {
  const [activeSection, setActiveSection] = useState<'ai_engines' | 'walkthrough' | 'benefits' | 'features' | 'roadmap'>('ai_engines');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const steps = [
    {
      step: 1,
      title: "Link Your Financial Accounts",
      route: "/accounts",
      icon: <Building2 className="text-[#1E293B]" size={20} />,
      badge: "Setup & Connections",
      desc: "Connect your payment processors (Razorpay Gateway API key, PayPal Wallet) and your corporate bank accounts (Kotak Mahindra Bank, HDFC Bank). Finora sets up secure feeds and monitors sync SLA health every 15 minutes.",
      tips: "You can click 'Connect Integration' or 'Sync Now' anytime to pull the freshest transaction data."
    },
    {
      step: 2,
      title: "Automated 3-Way Reconciliation Ingestion",
      route: "/dashboard",
      icon: <Layers className="text-[#15803D]" size={20} />,
      badge: "4-Stage Match Engine",
      desc: "Finora automatically pulls and normalizes 3 sets of records: Internal Sales Orders (from your store/ERP), Gateway Settlements (gross charges minus MDR fees and GST), and Bank Statement Credits (bulk UTR deposits).",
      tips: "The matching engine runs Stage 1 Exact, Stage 2 Batched Net, Stage 3 Fee Tolerance, and Stage 4 Exception Triage in under 0.1 seconds."
    },
    {
      step: 3,
      title: "Monitor Health on the Executive Dashboard",
      route: "/dashboard",
      icon: <TrendingUp className="text-[#1D4ED8]" size={20} />,
      badge: "Real-time Command Center",
      desc: "Track top-line metrics: Total Gross Volume Processed, Settled Cash in Bank, Value Match Rate (%), and Open Exceptions. Read the AI Daily Briefing for a quick 60-second summary of your financial posture.",
      tips: "Click the 'Why?' button on any KPI to see the exact formula, contributing components, and mathematical explanation."
    },
    {
      step: 4,
      title: "Diagnose & Resolve Exceptions with AI",
      route: "/exceptions",
      icon: <AlertTriangle className="text-[#B45309]" size={20} />,
      badge: "Root-Cause Intelligence",
      desc: "Spot uncredited payments, fee variances, and timing delays ranked by a 100-point composite risk score. Click 'Investigate with AI' on any transaction to run a deterministic 4-step root cause analysis.",
      tips: "The AI checks for customer refunds, fee miscalculations, and expected T+2 bank transit timing to tell you exactly why a discrepancy occurred."
    },
    {
      step: 5,
      title: "Forecast Treasury & Simulate Cash Scenarios",
      route: "/cash-position",
      icon: <DollarSign className="text-slate-700" size={20} />,
      badge: "Monte Carlo Simulator",
      desc: "View 30-day cash projections and a 5-stage cash conversion waterfall. Use interactive What-If sliders to simulate the cash impact of gateway settlement delays (+N days), recovery rates, or sales volume shifts.",
      tips: "Monte Carlo simulates 1,000 stochastic trials to provide conservative (P10), expected (P50), and optimistic (P90) cash reserves."
    },
    {
      step: 6,
      title: "Execute Continuous Month-End Close",
      route: "/month-end-close",
      icon: <Lock className="text-[#B91C1C]" size={20} />,
      badge: "Statutory Compliance",
      desc: "Validate the 5-Pillar Statutory Checklist (Sales, Gateway, Bank, Suspense, and 3-Way Match). Click 'What's needed to clear?' for AI audit guidance, generate an executive closing memo, and apply a cryptographic period lock.",
      tips: "Complies with Indian Accounting Standards (Ind AS 1, 7, 115) and ICAI Internal Financial Controls."
    },
    {
      step: 7,
      title: "Ask Fino (AI Copilot) from Any Screen",
      route: "/ask_your_books",
      icon: <div className="w-5 h-5 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[10px] font-mono shrink-0">F</div>,
      badge: "Contextual AI Everywhere",
      desc: "Click the Fino launcher on the bottom-right of any page. Ask any question in plain English (e.g. 'Why did more money go to Kotak than HDFC?' or 'Show exceptions above ₹10,000').",
      tips: "Every answer includes inspectable reasoning steps and 100% mathematically verified citations backed by raw SQLite ledger records."
    }
  ];

  const faqs = [
    {
      q: "What is Finora in simple words?",
      a: "Think of Finora as your automated AI Financial Controller. When you sell goods online, payment processors (like Razorpay or PayPal) deduct transaction fees, withholding taxes (GST), and delay deposits by 2–3 days. Finora tracks every single rupee from checkout to your bank account, catches fee discrepancies, and eliminates manual spreadsheet work."
    },
    {
      q: "How does Finora help small businesses and startups?",
      a: "Small businesses often lose money to unnoticed gateway fee hikes, unrefunded customer charges, or delayed bank credits. Finora gives small business owners full visibility into their real cash float, verifies that fees match their contracted rates, and replaces hours of tedious Excel VLOOKUP matching with 1-click automation."
    },
    {
      q: "How does Finora help mid-size and large enterprises?",
      a: "For larger companies with multiple bank accounts and high transaction volumes, Finora provides multi-rail routing visibility (Razorpay + PayPal to Kotak/HDFC), strict Segregation of Duties (SoD) internal controls, 1,000-trial Monte Carlo cash forecasting, and automated Ind AS month-end close packages for statutory auditors."
    },
    {
      q: "How does Finora prevent AI hallucinations?",
      a: "Finora follows an architectural principle: 'Deterministic Math at the Core, Grounded AI at the Shell'. The AI is strictly prohibited from guessing or doing math in its head. All figures are computed directly in an ACID SQLite database, and an independent mathematical verifier validates every number before it is shown to you."
    },
    {
      q: "How do I link a new bank account or payment gateway?",
      a: "Go to the 'Linked Accounts' page (/accounts) and click the '+ Connect Integration' button in the top right. Select whether you are connecting a Payment Gateway (Razorpay/PayPal) or a Direct Bank Feed (Kotak/HDFC), enter your API key ID or Account number, and click 'Connect & Sync'."
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Hero Overview Card (Clean, High-Contrast Light Theme) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-full text-xs font-bold uppercase tracking-wider">
              <FinoraMark size={14} />
              Platform Guide &amp; User Manual
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              How Finora Works: Your Complete Guide
            </h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Finora is an Autonomous AI Financial Controller designed for merchants. It automatically reconciles internal orders, payment gateway fees, and bank deposits with 100% mathematical precision.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Open Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Quick Nav Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
          <button
            onClick={() => setActiveSection('ai_engines')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'ai_engines'
                ? 'bg-[#1E293B] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <FinoraMark size={14} />
            Where &amp; How AI Is Used (6 Core Engines)
          </button>
          <button
            onClick={() => setActiveSection('walkthrough')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'walkthrough'
                ? 'bg-[#1E293B] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            1. User Walkthrough
          </button>
          <button
            onClick={() => setActiveSection('benefits')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'benefits'
                ? 'bg-[#1E293B] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            2. Business Value &amp; ROI
          </button>
          <button
            onClick={() => setActiveSection('features')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'features'
                ? 'bg-[#1E293B] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            3. Core Feature Deep Dive
          </button>
          <button
            onClick={() => setActiveSection('roadmap')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'roadmap'
                ? 'bg-[#1E293B] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            4. Future Roadmap &amp; FAQs
          </button>
        </div>
      </div>

      {/* SECTION 0: WHERE & HOW AI IS USED (6 OPERATIONAL ENGINES) */}
      {activeSection === 'ai_engines' && (
        <div className="space-y-5 animate-in fade-in duration-200 ease-out">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-[#1E293B] text-white flex items-center justify-center text-[10px] font-mono font-bold">F</div>
                Where &amp; How AI Is Used in Finora
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every AI capability is live, grounded in verified ledger data, and verifiable through numbered evidence trails.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] self-start sm:self-auto">
              6 Active AI/ML Engines
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Engine 1: Fino Autonomous Copilot */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between hover:border-slate-300 transition-colors duration-150 ease-out">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-[#F1F5F9] text-[#1E293B] rounded-xl border border-[#E2E8F0]">
                    <Brain size={18} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[#1E293B] border border-slate-200 font-mono">
                    Multi-Step Tool Orchestration
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">1. Autonomous Ledger Copilot (Fino)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Natural language question-answering powered by multi-step tool orchestration over read-only SQLite ledger tables with route-aware page context and automated hallucination verification.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <div><strong>Where to see it:</strong> Floating Copilot button &amp; <code>/ask-your-books</code></div>
                <div><strong>Evidence:</strong> Inspectable tool execution chain with paired confidence scores.</div>
              </div>
            </div>

            {/* Engine 2: 4-Factor Deterministic Root-Cause Investigator */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between hover:border-slate-300 transition-colors duration-150 ease-out">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-[#F0FDF4] text-[#15803D] rounded-xl border border-[#BBF7D0]">
                    <ShieldCheck size={18} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#15803D] border border-emerald-200 font-mono">
                    Audit Verification
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">2. Deterministic Root-Cause Agent</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sequentially verifies contract MDR fee schedules (2.0%), T+2 bank transit timing, GST/TDS tax deductions, and bank deposit UTRs to explain exact rupee discrepancies.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <div><strong>Where to see it:</strong> <code>/exceptions</code> &amp; <code>/record/exception/:id</code></div>
                <div><strong>Output:</strong> 4-check audit trail with 1-click recommended resolution.</div>
              </div>
            </div>

            {/* Engine 3: Isolation Forest Machine Learning */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between hover:border-slate-300 transition-colors duration-150 ease-out">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-[#FFFBEB] text-[#B45309] rounded-xl border border-[#FEF3C7]">
                    <Cpu size={18} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-[#B45309] border border-amber-200 font-mono">
                    IsolationForest (scikit-learn)
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">3. Unsupervised ML Anomaly Detection</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Multi-dimensional feature isolation trees evaluate fee-to-gross ratio, transit delay, and transaction scale to catch non-obvious fraud or settlement drift without rigid rules.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <div><strong>Where to see it:</strong> Executive Dashboard (Unsupervised ML Signal Card)</div>
                <div><strong>Output:</strong> Anomaly score ranking with isolated feature explanations.</div>
              </div>
            </div>

            {/* Engine 4: Benford's Law Forensic Integrity */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between hover:border-slate-300 transition-colors duration-150 ease-out">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-[#EFF6FF] text-[#1D4ED8] rounded-xl border border-[#DBEAFE]">
                    <Scale size={18} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1D4ED8] border border-blue-200 font-mono">
                    MAD &lt; 0.012 Target
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">4. Forensic Statistical Verifier</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Evaluates leading digit 1–9 distributions against logarithmic authentic frequencies to mathematically prove ledger authenticity or detect synthetic data fabrication.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <div><strong>Where to see it:</strong> Executive Dashboard (Benford's Law Card)</div>
                <div><strong>Output:</strong> Conformity tier (Close Conformity, Non-Conformity).</div>
              </div>
            </div>

            {/* Engine 5: 1,000-Trial Monte Carlo Treasury Forecast */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between hover:border-slate-300 transition-colors duration-150 ease-out">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-slate-100 text-slate-800 rounded-xl border border-slate-200">
                    <LineChart size={18} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                    1,000 Stochastic Trials
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">5. Stochastic Treasury Simulator</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dynamic geometric Brownian bridge simulation models P10 (conservative downside), P50 (expected), and P90 (upside) liquidity under settlement delay or recovery shifts.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <div><strong>Where to see it:</strong> <code>/cash-position</code> (Interactive Fan Chart)</div>
                <div><strong>Output:</strong> 7-day fan forecast with real-time what-if scenario synthesis.</div>
              </div>
            </div>

            {/* Engine 6: Continuous Accounting Close Memo Drafter */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between hover:border-slate-300 transition-colors duration-150 ease-out">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-[#FEF2F2] text-[#B91C1C] rounded-xl border border-[#FECACA]">
                    <FileText size={18} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-[#B91C1C] border border-rose-200 font-mono">
                    Ind AS 1, 7, 115
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">6. Continuous Close &amp; Memo Drafter</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Calculates period-over-period delta variances, tracks 5 statutory checklist pillars, and synthesizes executive CFO closing memos ready for committee signature.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <div><strong>Where to see it:</strong> <code>/month-end-close</code></div>
                <div><strong>Output:</strong> Formatted memorandum for record &amp; cryptographic period freeze.</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SECTION 1: USER WALKTHROUGH (START TO FINISH) */}
      {activeSection === 'walkthrough' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Traversing Finora: Step-by-Step Customer Journey
            </h3>
            <span className="text-xs text-slate-500 font-medium">7 Simple Steps</span>
          </div>

          <div className="space-y-3">
            {steps.map((s) => (
              <div 
                key={s.step} 
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-800 text-sm shrink-0 border border-slate-200">
                      {s.step}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm">{s.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F1F5F9] text-[#1E293B] border border-[#E2E8F0] rounded-full">
                        {s.badge}
                      </span>
                    </div>
                  </div>

                  <Link 
                    to={s.route} 
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1E293B] hover:text-[#0F172A] self-start sm:self-auto"
                  >
                    Go to Page <ArrowRight size={13} />
                  </Link>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pl-0 sm:pl-11">
                  {s.desc}
                </p>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-700 flex items-start gap-2 ml-0 sm:ml-11">
                  <CheckCircle2 size={14} className="text-[#15803D] shrink-0 mt-0.5" />
                  <span><strong>Pro Tip:</strong> {s.tips}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: SMALL VS LARGE BUSINESS BENEFITS */}
      {activeSection === 'benefits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-150">
          
          {/* Small Business Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-[#F0FDF4] text-[#15803D] rounded-xl border border-[#BBF7D0]">
                <Workflow size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">For Startups &amp; Small Businesses</h3>
                <p className="text-xs text-slate-500">Fast, automated peace of mind without finance overhead.</p>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-[#15803D] shrink-0 mt-0.5" />
                <span><strong>Stop Hidden Fee Leakage:</strong> Verify that Razorpay fees (2.0% MDR) and GST (18%) are calculated exactly without overcharging.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-[#15803D] shrink-0 mt-0.5" />
                <span><strong>Track Your Real Bank Float:</strong> Know immediately how much money is sitting in your bank account versus what is still in transit (T+2).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-[#15803D] shrink-0 mt-0.5" />
                <span><strong>No More Excel Spreadsheets:</strong> Automated 3-way matching replaces hours of manual VLOOKUPs between CSV exports.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-[#15803D] shrink-0 mt-0.5" />
                <span><strong>Plain-English Answers:</strong> Ask questions like <em>"Why was my deposit lower today?"</em> and get clear, instant explanations.</span>
              </li>
            </ul>
          </div>

          {/* Large Enterprise Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-[#F1F5F9] text-[#1E293B] rounded-xl border border-[#E2E8F0]">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">For Mid-Market &amp; Large Enterprises</h3>
                <p className="text-xs text-slate-500">Robust internal controls, audit posture, and treasury modeling.</p>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-[#15803D] shrink-0 mt-0.5" />
                <span><strong>Multi-Rail Routing Visibility:</strong> Map inflows across multiple gateways (Razorpay, PayPal) and bank operating accounts (Kotak, HDFC).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-[#15803D] shrink-0 mt-0.5" />
                <span><strong>Ind AS–Aligned &amp; Statutory Audit Compliant:</strong> Generate certified month-end closing memos and freeze accounting periods with cryptographic logs.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-[#15803D] shrink-0 mt-0.5" />
                <span><strong>Segregation of Duties (SoD):</strong> Prevent internal fraud by strictly separating API key custody from exception resolution permissions.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-[#15803D] shrink-0 mt-0.5" />
                <span><strong>1,000-Trial Monte Carlo Modeling:</strong> Stress-test cash liquidity against delayed payouts and historical exception rates.</span>
              </li>
            </ul>
          </div>

        </div>
      )}

      {/* SECTION 3: CORE FEATURE DEEP DIVE */}
      {activeSection === 'features' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-150">
          
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="p-2 bg-[#F0FDF4] text-[#15803D] rounded-xl w-fit">
              <Layers size={18} />
            </div>
            <h4 className="text-xs font-bold text-slate-900">4-Stage Matching Engine</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Reconciles 1-to-1 exact transactions, batched subset-sum deposits, fee variance tolerances, and orphan anomalies with 100% record accuracy.
            </p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="p-2 bg-[#FFFBEB] text-[#B45309] rounded-xl w-fit">
              <AlertTriangle size={18} />
            </div>
            <h4 className="text-xs font-bold text-slate-900">AI Exception Root-Cause Agent</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Deterministically investigates missing credits, fee miscalculations, and refund deductions with an inspectable 4-step audit chain.
            </p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="p-2 bg-slate-100 text-slate-800 rounded-xl w-fit">
              <DollarSign size={18} />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Monte Carlo Cash Forecasting</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Simulates 1,000 cash flow scenarios with interactive sliders for settlement transit delay, recovery rates, and volume sensitivity.
            </p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="p-2 bg-[#EFF6FF] text-[#1D4ED8] rounded-xl w-fit">
              <Scale size={18} />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Forensic Integrity Forensics</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Runs Benford's Law leading-digit logarithmic checks and unsupervised Isolation Forest ML anomaly scoring to detect tampering.
            </p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="p-2 bg-[#FEF2F2] text-[#B91C1C] rounded-xl w-fit">
              <Lock size={18} />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Continuous Month-End Close</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              5-pillar statutory pre-lock checklist, automated AI closing memorandum generator, and permanent cryptographic ledger freeze.
            </p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="p-2 bg-[#F1F5F9] text-[#1E293B] rounded-xl w-fit font-mono font-bold text-xs">
              F
            </div>
            <h4 className="text-xs font-bold text-slate-900">Fino — AI Copilot</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Global, page-aware AI assistant with zero-hallucination mathematical verifiers cross-checking every answer against raw SQLite ledger data.
            </p>
          </div>

        </div>
      )}

      {/* SECTION 4: ROADMAP NOTE & FAQS */}
      {activeSection === 'roadmap' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          
          {/* Light Theme Roadmap Note */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass size={18} className="text-slate-800" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Future Direction &amp; Roadmap Note
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-800 rounded-full">
                Roadmap Note
              </span>
            </div>

            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              The same account-linking and grounded-AI-explanation architecture built for business reconciliation is designed to extend naturally to a personal-finance view for individual users — spend tracking, EMI monitoring, and savings goals — as a future direction, while keeping the current submission strictly focused on business finance operations.
            </p>
          </div>

          {/* Interactive FAQs Accordion */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Frequently Asked Questions</h4>
            
            <div className="space-y-2 pt-1">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className="border border-slate-200/90 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full p-3.5 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between text-left cursor-pointer transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-900">{faq.q}</span>
                    {expandedFaq === idx ? <ChevronDown size={15} className="text-slate-600 shrink-0" /> : <ChevronRight size={15} className="text-slate-400 shrink-0" />}
                  </button>
                  {expandedFaq === idx && (
                    <div className="p-3.5 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
