import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, AlertTriangle, MessageSquare, Wallet, 
  Link as LinkIcon, CalendarCheck, Settings as SettingsIcon, 
  Bell, ChevronLeft, ChevronRight, CheckCircle2, Info,
  Layers, Play, Sun, Moon, FileText, Receipt, Compass
} from 'lucide-react';
import { Banner } from '../components/ui/Banner';
import { ToastContainer } from '../components/ui/Toast';
import { useAI } from '../context/AIContext';
import { useTheme } from '../context/ThemeContext';
import { LedgerCopilotPanel } from '../components/LedgerCopilotPanel';
import { ReconciliationRunModal } from '../components/ReconciliationRunModal';
import { QuickOrientationTour } from '../components/ui/QuickOrientationTour';
import { FinoraMark, FinoraBrandLockup } from '../components/ui/FinoraMark';

interface NavItem {
  to: string;
  icon: any;
  label: string;
  badge?: string;
  isPrimary?: boolean;
}

interface NavSection {
  title: string;
  badge?: string;
  priority: 'primary' | 'secondary' | 'system';
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Control Center',
    badge: 'Core',
    priority: 'primary',
    items: [
      { to: '/dashboard', icon: LayoutGrid, label: 'Overview', isPrimary: true },
      { to: '/ask_your_books', icon: MessageSquare, label: 'AI Controller', isPrimary: true },
      { to: '/exceptions', icon: AlertTriangle, label: 'Exceptions', isPrimary: true },
      { to: '/reconciliation', icon: Layers, label: 'Reconciliation', isPrimary: true },
    ]
  },
  {
    title: 'Treasury',
    priority: 'primary',
    items: [
      { to: '/cash-position', icon: Wallet, label: 'Cash Position' },
    ]
  },
  {
    title: 'Close',
    priority: 'primary',
    items: [
      { to: '/month-end-close', icon: CalendarCheck, label: 'Month-End Close' },
    ]
  },
  {
    title: 'Specialized',
    badge: 'Deep-Dive',
    priority: 'secondary',
    items: [
      { to: '/tax-matcher', icon: Receipt, label: 'Tax-Line Matcher' },
      { to: '/document-assistant', icon: FileText, label: 'Document Assistant' },
    ]
  },
  {
    title: 'Data & Configuration',
    priority: 'system',
    items: [
      { to: '/accounts', icon: LinkIcon, label: 'Linked Accounts' },
      { to: '/settings', icon: SettingsIcon, label: 'Settings & Governance' },
    ]
  }
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { bannerMessage, clearBanner, setIsCopilotOpen, setIsReconciliationModalOpen } = useAI();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('finora_sidebar_collapsed');
    return saved === 'true';
  });
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      title: 'New Exceptions Detected',
      message: '3 fee variances identified in August batch.',
      time: '10 mins ago',
      type: 'critical',
      read: false
    },
    {
      id: 'notif_2',
      title: 'Settlement Batch Synced',
      message: 'Razorpay batch PAY-00293 settled into HDFC.',
      time: '2 hours ago',
      type: 'success',
      read: false
    },
    {
      id: 'notif_3',
      title: 'Month-End Close Ready',
      message: 'August 2026 books ready for controller review.',
      time: 'Today, 10:00 AM',
      type: 'info',
      read: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    localStorage.setItem('finora_sidebar_collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#FAFAFA] font-sans antialiased text-slate-900">
      <ToastContainer />
      <QuickOrientationTour />
      
      {bannerMessage && (
        <Banner message={bannerMessage} onClose={clearBanner} />
      )}
      
      {/* Top Bar (Fixed Modern White Header) */}
      <header className="bg-white text-slate-900 h-14 shrink-0 relative z-50 flex items-center justify-between px-5 border-b border-[#E4E4E7] shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <FinoraBrandLockup size="md" />
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Run Reconciliation Engine Global Action Button */}
          <button
            onClick={() => setIsReconciliationModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-bold transition-all duration-150 ease-out cursor-pointer shadow-xs active:scale-98"
            title="Execute 3-Way Reconciliation Batch"
          >
            <Play size={13} fill="currentColor" />
            <span>Run Reconciliation</span>
          </button>

          {/* Ask Fino Top Trigger */}
          {!['/ask-your-books', '/ask_your_books', '/ask-fino'].includes(location.pathname) && (
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E4E4E7] hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-all duration-150 ease-out cursor-pointer shadow-2xs"
              title="Open Global Ask Fino Panel"
            >
              <FinoraMark size={16} />
              <span>Ask Fino</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100 focus:outline-none cursor-pointer"
            title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            aria-label="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun size={18} className="text-[#FBBF24]" /> : <Moon size={18} />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100 focus:outline-none cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B91C1C] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B91C1C] ring-2 ring-white dark:ring-[#151B24]"></span>
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-[#E4E4E7] z-[60] overflow-hidden text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead} 
                      className="text-[11px] font-bold text-[#1E293B] hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${n.read ? 'opacity-60 bg-white' : 'bg-slate-50/50'}`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <div className={`flex items-center gap-1.5 font-semibold ${
                          n.type === 'critical' ? 'text-[#B91C1C]' : n.type === 'success' ? 'text-[#15803D]' : 'text-[#1D4ED8]'
                        }`}>
                          {n.type === 'critical' ? <AlertTriangle size={13} /> : n.type === 'success' ? <CheckCircle2 size={13} /> : <CalendarCheck size={13} />}
                          <span>{n.title}</span>
                        </div>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1E293B]"></span>
                        )}
                      </div>
                      <p className="text-slate-600">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="h-5 w-px bg-slate-200"></div>
          
          {/* User Profile */}
          <Link to="/settings" className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">Sharan</div>
              <div className="text-[10px] font-semibold text-slate-400 leading-tight">Finance Controller</div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#1E293B] border border-slate-300 flex items-center justify-center text-xs font-bold text-white shadow-xs">
              S
            </div>
          </Link>
        </div>
      </header>

      {/* Main Body: Locked Sidebar + Scrollable Viewport */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* Collapsible Left Sidebar (Locked in Viewport) */}
        <aside 
          className={`bg-white border-r border-[#E4E4E7] h-full flex flex-col justify-between shrink-0 select-none transition-all duration-200 z-30 shadow-xs relative ${isCollapsed ? 'w-[72px]' : 'w-64'}`}
        >
          {/* Collapse/Expand Toggle Button */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-5 bg-white border border-slate-200 rounded-full p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-md z-40 transition-transform active:scale-95 cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>

          {/* Grouped Navigation Sections */}
          <div className="py-3 px-3 space-y-4 overflow-y-auto">
            {NAV_SECTIONS.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <div className={`px-2 pb-1 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between ${isCollapsed ? 'text-center' : ''} ${section.priority === 'secondary' ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span>{isCollapsed ? '•••' : section.title}</span>
                  {!isCollapsed && section.badge && (
                    <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded font-mono ${
                      section.badge === 'Core' 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200/80'
                    }`}>
                      {section.badge}
                    </span>
                  )}
                </div>
                
                {section.items.map((link) => {
                  const isActive = location.pathname === link.to;
                  const Icon = link.icon;
                  return (
                    <Link 
                      key={link.to} 
                      to={link.to}
                      className={`flex items-center h-9 rounded-xl transition-all font-medium text-xs group relative
                        ${isActive 
                          ? 'bg-[#F1F5F9] text-[#1E293B] font-bold border border-[#E2E8F0] shadow-2xs' 
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                        ${isCollapsed ? 'justify-center px-0' : 'px-3 gap-3'}
                      `}
                      title={isCollapsed ? link.label : undefined}
                    >
                      <Icon size={17} className={`shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-[#1E293B]' : 'text-slate-400'}`} />
                      {!isCollapsed && (
                        <span className={`truncate ${link.isPrimary ? 'font-semibold' : ''}`}>{link.label}</span>
                      )}
                      {isActive && !isCollapsed && (
                        <span className="ml-auto w-1.5 h-3.5 bg-[#1E293B] rounded-full"></span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/70 space-y-2">
            {!isCollapsed ? (
              <>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('finora-open-quick-tour'))}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs group"
                  title="Re-open guided orientation tour"
                >
                  <div className="flex items-center gap-1.5">
                    <Compass size={13} className="text-[#1E293B] group-hover:rotate-45 transition-transform" />
                    <span>Quick Tour</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-[#15803D] bg-[#F0FDF4] px-1.5 py-0.2 rounded border border-[#BBF7D0]">3 Steps</span>
                </button>

                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
                      Audit-Ready
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Ind AS</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Fino AI Engine • v2.4
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('finora-open-quick-tour'))}
                  className="p-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer shadow-2xs"
                  title="Open Quick Orientation Tour"
                >
                  <Compass size={14} className="text-[#1E293B]" />
                </button>
                <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" title="Audit-Ready Local Engine"></span>
              </div>
            )}
          </div>
          
        </aside>

        {/* Main Content Viewport (Only this scrolls) */}
        <main className="flex-1 h-full overflow-y-auto bg-[#FAFAFA] relative z-10">
          <div 
            key={location.pathname} 
            className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6 animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out"
          >
            {children}
          </div>
        </main>

        {/* Global Contextual Ledger Copilot */}
        <LedgerCopilotPanel />

        {/* Explicit Reconciliation Run Modal */}
        <ReconciliationRunModal />

      </div>
    </div>
  );
}
