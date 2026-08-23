import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, AlertTriangle, MessageSquare, Wallet, 
  Link as LinkIcon, CalendarCheck, Settings as SettingsIcon, 
  Bell, ChevronLeft, ChevronRight, CheckCircle2, Info
} from 'lucide-react';
import { Banner } from '../components/ui/Banner';
import { ToastContainer } from '../components/ui/Toast';
import { useAI } from '../context/AIContext';
import { LedgerCopilotPanel } from '../components/LedgerCopilotPanel';

const SIDEBAR_LINKS = [
  { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { to: '/exceptions', icon: AlertTriangle, label: 'Exceptions' },
  { to: '/ask_your_books', icon: MessageSquare, label: 'Ask Your Books' },
  { to: '/cash-position', icon: Wallet, label: 'Cash Position' },
  { to: '/accounts', icon: LinkIcon, label: 'Linked Accounts' },
  { to: '/month-end-close', icon: CalendarCheck, label: 'Month-End Close' },
  { to: '/settings', icon: SettingsIcon, label: 'Settings' },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { bannerMessage, clearBanner } = useAI();
  const location = useLocation();
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('finora_sidebar_collapsed');
    return saved === 'true';
  });
  
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    localStorage.setItem('finora_sidebar_collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-50 font-sans antialiased text-slate-800">
      <ToastContainer />
      
      {bannerMessage && (
        <Banner message={bannerMessage} onClose={clearBanner} />
      )}
      
      {/* Top Bar (Fixed Modern White Header) */}
      <header className="bg-white text-slate-900 h-14 shrink-0 relative z-50 flex items-center justify-between px-5 border-b border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-base shadow-xs">
              F
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight leading-none text-slate-900">Finora</span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">AI Financial Controller</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100 focus:outline-none cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>
            
            {showNotifications && (
              <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[60] overflow-hidden text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700">Recent Notifications</span>
                  <button onClick={() => setShowNotifications(false)} className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer">Mark all read</button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                  <div className="p-3.5 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-1.5 text-rose-600 font-semibold mb-0.5">
                      <AlertTriangle size={13} />
                      <span>New Exceptions Detected</span>
                    </div>
                    <p className="text-slate-600">3 fee variances identified in August batch.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">10 mins ago</span>
                  </div>
                  <div className="p-3.5 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-semibold mb-0.5">
                      <CheckCircle2 size={13} />
                      <span>Settlement Batch Synced</span>
                    </div>
                    <p className="text-slate-600">Razorpay batch PAY-00293 settled into HDFC.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">2 hours ago</span>
                  </div>
                  <div className="p-3.5 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-1.5 text-indigo-600 font-semibold mb-0.5">
                      <CalendarCheck size={13} />
                      <span>Month-End Close Ready</span>
                    </div>
                    <p className="text-slate-600">August 2026 books ready for controller review.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Today, 10:00 AM</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="h-5 w-px bg-slate-200"></div>
          
          {/* User Profile */}
          <Link to="/settings" className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">Razorpay Corp</div>
              <div className="text-[10px] font-semibold text-slate-400 leading-tight">Finance Admin</div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-indigo-600 border border-indigo-200 flex items-center justify-center text-xs font-bold text-white shadow-xs">
              RA
            </div>
          </Link>
        </div>
      </header>

      {/* Main Body: Locked Sidebar + Scrollable Viewport */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* Collapsible Left Sidebar (Locked in Viewport) */}
        <aside 
          className={`bg-white border-r border-slate-200/90 h-full flex flex-col justify-between shrink-0 select-none transition-all duration-200 z-30 shadow-xs relative ${isCollapsed ? 'w-[72px]' : 'w-64'}`}
        >
          {/* Collapse/Expand Toggle Button */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-5 bg-white border border-slate-200 rounded-full p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-md z-40 transition-transform active:scale-95 cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>

          {/* Navigation Links */}
          <div className="py-4 px-3 space-y-1 overflow-y-auto">
            <div className={`px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${isCollapsed ? 'text-center' : ''}`}>
              {isCollapsed ? '•••' : 'Finance Operations'}
            </div>
            {SIDEBAR_LINKS.map((link) => {
              const isActive = location.pathname === link.to;
              const Icon = link.icon;
              return (
                <Link 
                  key={link.to} 
                  to={link.to}
                  className={`flex items-center h-10 rounded-xl transition-all font-medium text-xs group relative
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700 font-bold shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                    ${isCollapsed ? 'justify-center px-0' : 'px-3 gap-3'}
                  `}
                  title={isCollapsed ? link.label : undefined}
                >
                  <Icon size={18} className={`shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  {!isCollapsed && (
                    <span className="truncate">{link.label}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <span className="ml-auto w-1.5 h-4 bg-indigo-600 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/70">
            {!isCollapsed ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Audit-Ready
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Ind AS</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  Local Gemma 3 Engine • v2.4
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Audit-Ready Local Engine"></span>
              </div>
            )}
          </div>
          
        </aside>

        {/* Main Content Viewport (Only this scrolls) */}
        <main className="flex-1 h-full overflow-y-auto bg-slate-50/80 relative z-10">
          <div 
            key={location.pathname} 
            className="max-w-7xl mx-auto p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            {children}
          </div>
        </main>

        {/* Global Contextual Ledger Copilot */}
        <LedgerCopilotPanel />

      </div>
    </div>
  );
}
