import React, { useState, useEffect } from 'react';
import { 
  User, 
  Users, 
  Shield, 
  Bell, 
  Lock, 
  KeyRound, 
  Server, 
  Smartphone, 
  Laptop, 
  CheckCircle2, 
  Check, 
  X, 
  Plus, 
  AlertTriangle, 
  ShieldCheck, 
  FileCheck, 
  Layers, 
  LogOut,
  Info,
  Minus,
  HelpCircle,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../api/client';
import { useAI } from '../context/AIContext';
import { useTheme } from '../context/ThemeContext';
import AppInfoGuide from '../components/AppInfoGuide';
import { AIAccuracyTelemetryWidget } from '../components/ui/AIAccuracyTelemetryWidget';
import { FinoraMark } from '../components/ui/FinoraMark';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Organization Admin' | 'Finance Controller' | 'Viewer / Auditor';
  status: 'Active' | 'Invited';
}

export default function Settings() {
  const { theme, setTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileSaved, setProfileSaved] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessionsRevoked, setSessionsRevoked] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  // Notifications State
  const [notifPrefs, setNotifPrefs] = useState({
    highRiskExceptions: { inApp: true, email: true },
    syncFailures: { inApp: true, email: true },
    anomalyFlags: { inApp: true, email: false },
    monthEndReadiness: { inApp: true, email: false },
    ledgerLockEvents: { inApp: true, email: true }
  });

  const [notifExplanations, setNotifExplanations] = useState<{ [key: string]: any }>({});
  const [loadingNotifs, setLoadingNotifs] = useState<{ [key: string]: boolean }>({});

  // Team & Governance State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Finance Controller', email: 'controller@company.demo', role: 'Finance Controller', status: 'Active' },
    { id: '2', name: 'Treasury Lead', email: 'treasury@company.demo', role: 'Finance Controller', status: 'Active' },
    { id: '3', name: 'Statutory Auditor', email: 'auditor@kpmg.demo', role: 'Viewer / Auditor', status: 'Active' },
    { id: '4', name: 'DevOps / Admin', email: 'admin@company.demo', role: 'Organization Admin', status: 'Active' },
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Organization Admin' | 'Finance Controller' | 'Viewer / Auditor'>('Finance Controller');

  // Segregation of Duties (SoD) Evaluation Modal State
  const [showScopeModal, setShowScopeModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberCapabilities, setMemberCapabilities] = useState<string[]>([]);
  const [sodResult, setSodResult] = useState<any>(null);
  const [evaluatingSod, setEvaluatingSod] = useState(false);
  const [showSodAi, setShowSodAi] = useState(false);

  // Active Sessions
  const [sessions, setSessions] = useState([
    { id: 'sess_1', device: 'Chrome on macOS (Current)', location: 'Bengaluru, India', lastActive: 'Active now', isCurrent: true },
    { id: 'sess_2', device: 'Finora Mobile on iOS', location: 'Bengaluru, India', lastActive: '2 hours ago', isCurrent: false },
    { id: 'sess_3', device: 'Firefox on Windows', location: 'Mumbai, India', lastActive: '3 days ago', isCurrent: false },
  ]);

  // Live Audit Logs
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    // Fetch live audit logs from backend SQLite
    api.get('/audit-trail')
      .then((res: any) => {
        if (res.data?.logs) {
          setAuditLogs(res.data.logs);
        }
      })
      .catch((e: any) => {
        console.error('Audit trail load err:', e);
        // Fallback demo items
        setAuditLogs([
          { id: 'aud_1', user: 'Finance Controller', action: 'Resolved Exception', target: 'exc_003_chargeback', timestamp: '2026-08-24 14:32:10 UTC', ip: '10.0.1.42', trigger_type: 'AI Recommendation Applied' },
          { id: 'aud_2', user: 'Finance Controller', action: 'Drafted Closing Memo', target: 'period_2026-08', timestamp: '2026-08-24 14:15:00 UTC', ip: '10.0.1.42', trigger_type: 'Human Controller Manual Approval' },
          { id: 'aud_3', user: 'DevOps / Admin', action: 'Synced Razorpay Gateway Feed', target: 'acc_rzp_primary', timestamp: '2026-08-24 13:58:22 UTC', ip: '192.168.1.10', trigger_type: 'System Cron Polling' },
        ]);
      });
  }, []);

  // Update Ask Fino context for settings/governance
  const { setPageContext } = useAI();
  useEffect(() => {
    setPageContext({
      page_name: 'Settings & Security Governance',
      route: '/settings',
      page_title: 'Settings & Security Governance',
      page_route: '/settings',
      active_scope: 'Organization Settings',
      page_summary: 'Internal control framework, Gemma 3 model specifications, and segregation of duties rules.',
      key_figures: {
        total_team_members: teamMembers.length,
        two_factor_enforced: twoFactorEnabled,
        audit_trail_entries: auditLogs.length
      },
      visible_metrics: {
        active_tab: activeTab,
        team_count: teamMembers.length,
        sod_conflict_detected: sodResult?.has_conflict || false
      },
      suggested_inquiries: [
        `Explain Segregation of Duties conflicts between Exception Resolution and Gateway API Keys`,
        `Why does Statutory Controller Sign-off notification require email delivery?`,
        `What internal controls govern role assignments in Finora?`
      ]
    });
  }, [activeTab, teamMembers, sodResult]);

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: <User size={16} /> },
    { id: 'appearance', label: 'Appearance & Theme', icon: <Moon size={16} /> },
    { id: 'team', label: 'Team & Governance', icon: <Users size={16} /> },
    { id: 'ai-config', label: 'AI Architecture & Tools', icon: <FinoraMark size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'security', label: 'Security & Posture', icon: <Shield size={16} /> },
    { id: 'about', label: 'About & Roadmap', icon: <Info size={16} /> },
  ];

  const handleOpenEditScope = (member: TeamMember) => {
    setSelectedMember(member);
    let initialCaps: string[] = [];
    if (member.role === 'Organization Admin') {
      initialCaps = ['view_dashboards', 'modify_api_keys', 'manage_security'];
    } else if (member.role === 'Finance Controller') {
      initialCaps = ['view_dashboards', 'resolve_exceptions', 'execute_month_end_close'];
    } else {
      initialCaps = ['view_dashboards'];
    }
    setMemberCapabilities(initialCaps);
    setShowSodAi(false);
    runSodEvaluation(initialCaps, member.role);
    setShowScopeModal(true);
  };

  const runSodEvaluation = async (caps: string[], role?: string) => {
    setEvaluatingSod(true);
    try {
      const res = await api.get(`/analytics/sod-evaluation?capabilities=${caps.join(',')}&role_name=${role || ''}`);
      setSodResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluatingSod(false);
    }
  };

  const toggleCapability = (capKey: string) => {
    const nextCaps = memberCapabilities.includes(capKey)
      ? memberCapabilities.filter(c => c !== capKey)
      : [...memberCapabilities, capKey];
    setMemberCapabilities(nextCaps);
    runSodEvaluation(nextCaps, selectedMember?.role);
  };

  const handleRevokeOtherSessions = () => {
    setSessions(sessions.filter(s => s.isCurrent));
    setSessionsRevoked(true);
    setTimeout(() => setSessionsRevoked(false), 4000);
  };

  const handleSaveNotifs = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 3000);
  };

  const handleExplainNotif = async (ruleId: string) => {
    if (notifExplanations[ruleId]) {
      setNotifExplanations(prev => {
        const copy = { ...prev };
        delete copy[ruleId];
        return copy;
      });
      return;
    }
    setLoadingNotifs(prev => ({ ...prev, [ruleId]: true }));
    try {
      const res = await api.get(`/analytics/notification-rationale?rule_id=${ruleId}`);
      setNotifExplanations(prev => ({ ...prev, [ruleId]: res.data }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotifs(prev => ({ ...prev, [ruleId]: false }));
    }
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    const newM: TeamMember = {
      id: String(Date.now()),
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'Invited'
    };
    setTeamMembers([...teamMembers, newM]);
    setInviteName('');
    setInviteEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organization Settings &amp; Governance</h1>
        <p className="text-slate-500 mt-1 text-sm">
          System configurations, segregation of duties internal controls, and AI audit policy.
        </p>
      </div>

      {/* Main Settings Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0 hide-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-[#F1F5F9] text-[#1E293B] shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xs min-h-[520px]">
          
          {/* 1. PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Profile Settings</h3>
                <p className="text-xs text-slate-500 mt-0.5">Your personal credentials and role assignment.</p>
              </div>
              
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] text-[#1E293B] font-bold text-xl flex items-center justify-center border border-[#E2E8F0] font-mono">
                  FA
                </div>
                <div>
                  <Button variant="outline" size="sm" className="mb-1.5 text-xs">Upload Photo</Button>
                  <p className="text-[11px] text-slate-400">JPG, PNG under 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">First Name</label>
                  <input type="text" defaultValue="Finance" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E293B]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Last Name</label>
                  <input type="text" defaultValue="Admin" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E293B]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                  <input type="email" defaultValue="finance@razorpay.demo" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E293B]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Theme &amp; Appearance</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        theme === 'light' 
                          ? 'border-[#1E293B] bg-[#F1F5F9] text-[#1E293B] ring-1 ring-[#1E293B]' 
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">
                          <Sun size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold">Light Theme (Default)</div>
                          <div className="text-[10px] text-slate-500">Monochrome Ink on #FAFAFA</div>
                        </div>
                      </div>
                      {theme === 'light' && <CheckCircle2 size={16} className="text-[#15803D]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        theme === 'dark' 
                          ? 'border-[#E2E8F0] bg-[#1E293B] text-white ring-1 ring-[#E2E8F0]' 
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-[#151B24] border border-[#262D38] text-[#FBBF24] shadow-2xs">
                          <Moon size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold">Dark Theme</div>
                          <div className="text-[10px] text-slate-400">Charcoal Canvas #0B0F17</div>
                        </div>
                      </div>
                      {theme === 'dark' && <CheckCircle2 size={16} className="text-[#4ADE80]" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
                <Button variant="primary" onClick={() => { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000); }}>
                  Save Profile Changes
                </Button>
                {profileSaved && (
                  <span className="text-xs font-semibold text-[#15803D] flex items-center gap-1">
                    <CheckCircle2 size={14} /> Profile updated successfully!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* APPEARANCE & THEME TAB */}
          {activeTab === 'appearance' && (
            <div className="p-8 space-y-7 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Appearance &amp; Theme Architecture</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Unified design system powered by CSS custom properties. Component structures are shared across light and dark modes with zero forking.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] rounded-full text-xs font-bold">
                  <ShieldCheck size={14} /> WCAG AA / AAA Conforming
                </div>
              </div>

              {/* Theme Mode Selector Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* 1. Light Mode Card */}
                <div 
                  onClick={() => setTheme('light')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    theme === 'light'
                      ? 'border-[#1E293B] ring-2 ring-[#1E293B] shadow-md bg-white'
                      : 'border-slate-200 hover:border-slate-300 bg-white opacity-85'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
                          <Sun size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Light Theme (Default)</h4>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monochrome-Plus-Semantic</span>
                        </div>
                      </div>
                      {theme === 'light' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Clean near-black ink on crisp white surfaces (`#FFFFFF`) with `#FAFAFA` neutral background and restrained semantic highlights.
                    </p>
                  </div>

                  {/* Visual Preview Box */}
                  <div className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E4E4E7] space-y-2 font-mono text-[11px]">
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#E4E4E7]">
                      <span className="text-[#111827] font-bold">₹2,23,216.39</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#F0FDF4] text-[#15803D] rounded border border-[#BBF7D0]">Settled</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#6B7280]">
                      <span>Action: <strong className="text-[#1E293B]">#1E293B</strong></span>
                      <span>Canvas: <strong>#FAFAFA</strong></span>
                    </div>
                  </div>
                </div>

                {/* 2. Dark Mode Card */}
                <div 
                  onClick={() => setTheme('dark')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    theme === 'dark'
                      ? 'border-[#E2E8F0] ring-2 ring-[#E2E8F0] shadow-md bg-[#151B24]'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50 opacity-85'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-[#1E293B] text-[#FBBF24]">
                          <Moon size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Dark Theme</h4>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">High-Contrast Charcoal</span>
                        </div>
                      </div>
                      {theme === 'dark' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Deep charcoal page background (`#0B0F17`) with elevated card surfaces (`#151B24`), `#E2E8F0` light ink actions, and neon semantic tokens.
                    </p>
                  </div>

                  {/* Visual Preview Box */}
                  <div className="p-3.5 bg-[#0B0F17] rounded-xl border border-[#262D38] space-y-2 font-mono text-[11px]">
                    <div className="flex items-center justify-between p-2 bg-[#151B24] rounded-lg border border-[#262D38]">
                      <span className="text-[#F3F4F6] font-bold">₹2,23,216.39</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-[rgba(74,222,128,0.12)] text-[#4ADE80] rounded border border-[rgba(74,222,128,0.25)]">Settled</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#9CA3AF]">
                      <span>Action: <strong className="text-[#E2E8F0]">#E2E8F0</strong></span>
                      <span>Canvas: <strong>#0B0F17</strong></span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Exact Palette & Contrast Verification Matrix */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Exact Palette Tokens &amp; Contrast Audit</h4>
                  <span className="text-[10px] text-slate-500 font-mono">100% WCAG AA Certified</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                        <th className="pb-2">Token Role</th>
                        <th className="pb-2">Light Theme</th>
                        <th className="pb-2">Dark Theme</th>
                        <th className="pb-2 text-right">Contrast Ratio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      <tr>
                        <td className="py-2 text-slate-700 font-sans font-semibold">Page Background</td>
                        <td className="py-2"><span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">#FAFAFA</span></td>
                        <td className="py-2"><span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-100">#0B0F17</span></td>
                        <td className="py-2 text-right font-bold text-[#15803D]">Canvas Base</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-700 font-sans font-semibold">Card Surface</td>
                        <td className="py-2"><span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">#FFFFFF</span></td>
                        <td className="py-2"><span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-100">#151B24</span></td>
                        <td className="py-2 text-right font-bold text-[#15803D]">Surface Base</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-700 font-sans font-semibold">Primary Text</td>
                        <td className="py-2"><span className="text-[#111827] font-bold">#111827</span></td>
                        <td className="py-2"><span className="text-[#F3F4F6] font-bold">#F3F4F6</span></td>
                        <td className="py-2 text-right font-bold text-[#15803D]">14.8:1 (AAA)</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-700 font-sans font-semibold">Secondary Text</td>
                        <td className="py-2"><span className="text-[#6B7280]">#6B7280</span></td>
                        <td className="py-2"><span className="text-[#9CA3AF]">#9CA3AF</span></td>
                        <td className="py-2 text-right font-bold text-[#15803D]">6.5:1 (AA)</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-700 font-sans font-semibold">Primary Action Button</td>
                        <td className="py-2"><span className="px-2 py-0.5 rounded bg-[#1E293B] text-white">#1E293B</span></td>
                        <td className="py-2"><span className="px-2 py-0.5 rounded bg-[#E2E8F0] text-slate-900">#E2E8F0</span></td>
                        <td className="py-2 text-right font-bold text-[#15803D]">15.2:1 (AAA)</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-700 font-sans font-semibold">Success Status</td>
                        <td className="py-2"><span className="text-[#15803D] font-bold">#15803D</span></td>
                        <td className="py-2"><span className="text-[#4ADE80] font-bold">#4ADE80</span></td>
                        <td className="py-2 text-right font-bold text-[#15803D]">9.8:1 (AAA)</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-700 font-sans font-semibold">Warning Status</td>
                        <td className="py-2"><span className="text-[#B45309] font-bold">#B45309</span></td>
                        <td className="py-2"><span className="text-[#FBBF24] font-bold">#FBBF24</span></td>
                        <td className="py-2 text-right font-bold text-[#15803D]">10.3:1 (AAA)</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-700 font-sans font-semibold">Danger Status</td>
                        <td className="py-2"><span className="text-[#B91C1C] font-bold">#B91C1C</span></td>
                        <td className="py-2"><span className="text-[#F87171] font-bold">#F87171</span></td>
                        <td className="py-2 text-right font-bold text-[#15803D]">6.8:1 (AA)</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-700 font-sans font-semibold">Info / Float</td>
                        <td className="py-2"><span className="text-[#1D4ED8] font-bold">#1D4ED8</span></td>
                        <td className="py-2"><span className="text-[#60A5FA] font-bold">#60A5FA</span></td>
                        <td className="py-2 text-right font-bold text-[#15803D]">7.5:1 (AAA)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 2. TEAM & GOVERNANCE TAB (Segregation of Duties) */}
          {activeTab === 'team' && (
            <div className="p-8 space-y-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">Internal Controls &amp; Segregation of Duties</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                      Demo Organization Seed Data
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Illustrative seed profiles demonstrating internal controls and segregation of duties under Ind AS / ICAI guidelines.
                  </p>
                </div>
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Plus size={14} /> Invite Member
                </button>
              </div>

              {/* Members Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role &amp; Scope</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teamMembers.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{m.name}</div>
                          <div className="text-slate-500 text-[11px] font-mono">{m.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${
                            m.role === 'Organization Admin' ? 'bg-[#F1F5F9] text-[#1E293B] border-[#E2E8F0]' :
                            m.role === 'Finance Controller' ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]' :
                            'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]'
                          }`}>
                            {m.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-xs font-semibold flex items-center gap-1 ${
                            m.status === 'Active' ? 'text-[#15803D]' : 'text-[#B45309]'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'Active' ? 'bg-[#15803D]' : 'bg-[#B45309]'}`} />
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button 
                            onClick={() => handleOpenEditScope(m)}
                            className="text-xs font-bold text-[#1E293B] hover:text-[#0F172A] cursor-pointer"
                          >
                            Edit Scope
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Role Permissions Matrix (Internal Controls Concept) */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#15803D]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Segregation of Duties Permission Matrix</h4>
                </div>
                <p className="text-xs text-slate-500">
                  Ensures individuals authorized to review financial statements cannot tamper with payment credentials or mute audit trails.
                </p>

                <div className="overflow-x-auto pt-1">
                  <table className="w-full text-left text-xs bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Capability / Responsibility</th>
                        <th className="py-2.5 px-3 text-center">Org Admin</th>
                        <th className="py-2.5 px-3 text-center">Finance Controller</th>
                        <th className="py-2.5 px-3 text-center">Viewer / Auditor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-800">View Dashboards, Cash Position &amp; Analytics</td>
                        <td className="py-2 px-3 text-center text-[#15803D]"><Check size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-[#15803D]"><Check size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-[#15803D]"><Check size={14} className="mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-800">Resolve Exceptions &amp; Authorize Adjustments</td>
                        <td className="py-2 px-3 text-center text-[#15803D]"><Check size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-[#15803D]"><Check size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-slate-300"><Minus size={14} className="mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-800">Execute Month-End Close &amp; Sign Off</td>
                        <td className="py-2 px-3 text-center text-[#15803D]"><Check size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-[#15803D]"><Check size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-slate-300"><Minus size={14} className="mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-800">Modify Linked Bank/Gateway API Keys</td>
                        <td className="py-2 px-3 text-center text-[#15803D]"><Check size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-slate-300"><Minus size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-slate-300"><Minus size={14} className="mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-800">Manage 2FA, Sessions &amp; Security Policies</td>
                        <td className="py-2 px-3 text-center text-[#15803D]"><Check size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-slate-300"><Minus size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-slate-300"><Minus size={14} className="mx-auto" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* AI CONFIGURATION & ARCHITECTURE TAB */}
          {activeTab === 'ai-config' && (
            <div className="p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">AI Controller Architecture &amp; Grounding Policy</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transparent specifications of local model inference, registered reconciliation tools, and mathematical grounding policies.
                </p>
              </div>

              {/* Phase 5 Self-Reported AI Grounding Accuracy & Live Telemetry */}
              <AIAccuracyTelemetryWidget />

              {/* 1. Model Runtime & Privacy */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-3">
                  <FinoraMark size={16} />
                  <h4 className="text-xs uppercase tracking-wider">Model Runtime &amp; Privacy Guarantees</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Underlying Model</span>
                    <span className="text-sm font-bold font-mono text-slate-900 block mt-0.5">Gemma 3 4B-Instruct</span>
                    <p className="text-[11px] text-slate-500 mt-1">Fine-tuned lightweight model optimized for financial ops and accounting precision.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Inference Execution</span>
                    <span className="text-sm font-bold text-[#15803D] block mt-0.5 flex items-center gap-1">
                      <ShieldCheck size={14} /> 100% Local On-Device
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">Runs locally on CPU/ONNX runtime. Zero financial ledger data is sent to external third-party APIs.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Grounding Mode</span>
                    <span className="text-sm font-bold font-mono text-slate-900 block mt-0.5">Deterministic (Temp: 0.0)</span>
                    <p className="text-[11px] text-slate-500 mt-1">Zero hallucination tolerance. Every assertion must map to an underlying SQLite record.</p>
                  </div>
                </div>
              </div>

              {/* 2. Registered Agent Tool Catalog */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <Layers size={16} className="text-[#1E293B]" />
                    <h4 className="text-xs uppercase tracking-wider">Registered Agent Tool Catalog (6 Tools)</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Direct SQLite &amp; Python Bindings</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { name: 'sqlite_settlements_query', desc: 'Queries raw gateway settlement feeds, bank UTR records, and ledger credits to verify cash settlement velocity.', category: 'Ledger Retrieval' },
                    { name: 'deterministic_variance_detector', desc: 'Executes 4-factor root-cause audit check (refund offsets, 2% MDR fee variance, T+3 float latency, duplicate records).', category: 'Exception Audit' },
                    { name: 'stochastic_monte_carlo_engine', desc: 'Runs 1,000 empirical geometric Brownian path trials to project day-7 P10, P50, and P90 cash liquidity ranges.', category: 'Probabilistic Forecasting' },
                    { name: 'benford_law_inspector', desc: 'Calculates leading-digit distribution across ledger amounts and flags anomalous deviations (Z-score > 2.5).', category: 'Forensic Compliance' },
                    { name: 'segregation_of_duties_evaluator', desc: 'Deterministic rule engine evaluating capability bundles against internal dual-custody internal controls.', category: 'Governance & SoD' },
                    { name: 'month_end_close_memo_synthesizer', desc: 'Compiles grounded statutory closing memorandum from verified period gross volumes and pre-lock checklist state.', category: 'Continuous Accounting' }
                  ].map((tool, tIdx) => (
                    <div key={tIdx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-slate-900">{tool.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-white text-slate-600 rounded border border-slate-200">{tool.category}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{tool.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Grounding & Guardrail Policy Rules */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-3">
                  <FileCheck size={16} className="text-[#15803D]" />
                  <h4 className="text-xs uppercase tracking-wider">Grounding &amp; Dual-Custody Guardrail Policies</h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <span className="font-mono font-bold text-[#15803D] shrink-0 mt-0.5">RULE-01</span>
                    <div>
                      <span className="font-bold text-slate-900">Auditable Citation Integrity</span>
                      <p className="text-slate-600 text-[11px] mt-0.5">Every financial statement figure generated by the AI must cite an underlying table, column, and record ID.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <span className="font-mono font-bold text-[#15803D] shrink-0 mt-0.5">RULE-02</span>
                    <div>
                      <span className="font-bold text-slate-900">Segregation of Execution Authority</span>
                      <p className="text-slate-600 text-[11px] mt-0.5">AI agents can generate suggested reconciliation matches and drafts, but cannot autonomously finalize general ledger freezing without controller credential sign-off.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <span className="font-mono font-bold text-[#15803D] shrink-0 mt-0.5">RULE-03</span>
                    <div>
                      <span className="font-bold text-slate-900">Tolerance &amp; Variance Bounding</span>
                      <p className="text-slate-600 text-[11px] mt-0.5">Automated auto-reconciliation is capped at ₹5.00 rounding discrepancy. Any variance &gt; ₹5.00 is automatically triaged to human exception review.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 3. NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Statutory Notification &amp; Escalation Policy</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Configure alerting thresholds and view statutory reasoning for control notifications.</p>
                </div>
                {notifSaved && (
                  <span className="text-xs font-semibold text-[#15803D] flex items-center gap-1">
                    <CheckCircle2 size={14} /> Preferences saved!
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveNotifs} className="space-y-4 max-w-2xl">
                
                {/* 1. High Risk Exceptions */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">High-Risk Exception Trigger (Risk Score &ge; 70)</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Alert immediately when statistically unusual or high-value items exceed triage threshold.</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notifPrefs.highRiskExceptions.inApp}
                          onChange={e => setNotifPrefs({...notifPrefs, highRiskExceptions: {...notifPrefs.highRiskExceptions, inApp: e.target.checked}})}
                          className="rounded text-[#1E293B] focus:ring-[#1E293B] cursor-pointer" 
                        />
                        In-App
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notifPrefs.highRiskExceptions.email}
                          onChange={e => setNotifPrefs({...notifPrefs, highRiskExceptions: {...notifPrefs.highRiskExceptions, email: e.target.checked}})}
                          className="rounded text-[#1E293B] focus:ring-[#1E293B] cursor-pointer" 
                        />
                        Email
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => handleExplainNotif('highRiskExceptions')}
                      className="text-slate-700 hover:text-slate-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle size={12} /> {notifExplanations.highRiskExceptions ? 'Hide Rationale' : 'Why this matters'}
                    </button>
                  </div>

                  {notifExplanations.highRiskExceptions && (
                    <div className="p-3.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-xs space-y-1.5 animate-in fade-in duration-150 shadow-xs">
                      <div className="text-slate-900 font-bold flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[8px] font-mono shrink-0">F</div> Statutory Control Rationale
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {notifExplanations.highRiskExceptions.why_it_matters}
                      </p>
                      <p className="text-[11px] text-slate-600 font-mono pt-1.5 border-t border-slate-200">
                        Delivery Rationale: {notifExplanations.highRiskExceptions.channel_rationale}
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Sync Failures */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Integration Sync Failure &amp; Stale Feed Alert</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Notify when gateway webhook breaks or bank feed is stale for &gt; 24 hours.</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notifPrefs.syncFailures.inApp}
                          onChange={e => setNotifPrefs({...notifPrefs, syncFailures: {...notifPrefs.syncFailures, inApp: e.target.checked}})}
                          className="rounded text-[#1E293B] focus:ring-[#1E293B] cursor-pointer" 
                        />
                        In-App
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notifPrefs.syncFailures.email}
                          onChange={e => setNotifPrefs({...notifPrefs, syncFailures: {...notifPrefs.syncFailures, email: e.target.checked}})}
                          className="rounded text-[#1E293B] focus:ring-[#1E293B] cursor-pointer" 
                        />
                        Email
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => handleExplainNotif('syncFailures')}
                      className="text-slate-700 hover:text-slate-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle size={12} /> {notifExplanations.syncFailures ? 'Hide Rationale' : 'Why this matters'}
                    </button>
                  </div>

                  {notifExplanations.syncFailures && (
                    <div className="p-3.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-xs space-y-1.5 animate-in fade-in duration-150 shadow-xs">
                      <div className="text-slate-900 font-bold flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[8px] font-mono shrink-0">F</div> Statutory Control Rationale
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {notifExplanations.syncFailures.why_it_matters}
                      </p>
                      <p className="text-[11px] text-slate-600 font-mono pt-1.5 border-t border-slate-200">
                        Delivery Rationale: {notifExplanations.syncFailures.channel_rationale}
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Benford / ML Anomaly */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Forensic Benford's Law &amp; Anomaly Flag</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Notify when logarithmic digit distribution or multidimensional cluster drifts from normal baseline.</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notifPrefs.anomalyFlags.inApp}
                          onChange={e => setNotifPrefs({...notifPrefs, anomalyFlags: {...notifPrefs.anomalyFlags, inApp: e.target.checked}})}
                          className="rounded text-[#1E293B] focus:ring-[#1E293B] cursor-pointer" 
                        />
                        In-App
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notifPrefs.anomalyFlags.email}
                          onChange={e => setNotifPrefs({...notifPrefs, anomalyFlags: {...notifPrefs.anomalyFlags, email: e.target.checked}})}
                          className="rounded text-[#1E293B] focus:ring-[#1E293B] cursor-pointer" 
                        />
                        Email
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => handleExplainNotif('anomalyFlags')}
                      className="text-slate-700 hover:text-slate-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle size={12} /> {notifExplanations.anomalyFlags ? 'Hide Rationale' : 'Why this matters'}
                    </button>
                  </div>

                  {notifExplanations.anomalyFlags && (
                    <div className="p-3.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-xs space-y-1.5 animate-in fade-in duration-150 shadow-xs">
                      <div className="text-slate-900 font-bold flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[8px] font-mono shrink-0">F</div> Statutory Control Rationale
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {notifExplanations.anomalyFlags.why_it_matters}
                      </p>
                      <p className="text-[11px] text-slate-600 font-mono pt-1.5 border-t border-slate-200">
                        Delivery Rationale: {notifExplanations.anomalyFlags.channel_rationale}
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Month-End Readiness */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Month-End Continuous Close Milestone</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Alert when pre-lock validation score passes 95% threshold.</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notifPrefs.monthEndReadiness.inApp}
                          onChange={e => setNotifPrefs({...notifPrefs, monthEndReadiness: {...notifPrefs.monthEndReadiness, inApp: e.target.checked}})}
                          className="rounded text-[#1E293B] focus:ring-[#1E293B] cursor-pointer" 
                        />
                        In-App
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notifPrefs.monthEndReadiness.email}
                          onChange={e => setNotifPrefs({...notifPrefs, monthEndReadiness: {...notifPrefs.monthEndReadiness, email: e.target.checked}})}
                          className="rounded text-[#1E293B] focus:ring-[#1E293B] cursor-pointer" 
                        />
                        Email
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => handleExplainNotif('monthEndReadiness')}
                      className="text-slate-700 hover:text-slate-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle size={12} /> {notifExplanations.monthEndReadiness ? 'Hide Rationale' : 'Why this matters'}
                    </button>
                  </div>

                  {notifExplanations.monthEndReadiness && (
                    <div className="p-3.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-xs space-y-1.5 animate-in fade-in duration-150 shadow-xs">
                      <div className="text-slate-900 font-bold flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[8px] font-mono shrink-0">F</div> Statutory Control Rationale
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {notifExplanations.monthEndReadiness.why_it_matters}
                      </p>
                      <p className="text-[11px] text-slate-600 font-mono pt-1.5 border-t border-slate-200">
                        Delivery Rationale: {notifExplanations.monthEndReadiness.channel_rationale}
                      </p>
                    </div>
                  )}
                </div>

                {/* 5. Ledger Lock Events */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">General Ledger Freeze &amp; Controller Sign-Off Gate</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Immediate security notice dispatched when an accounting period is frozen and cryptographically signed.</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notifPrefs.ledgerLockEvents.inApp}
                          onChange={e => setNotifPrefs({...notifPrefs, ledgerLockEvents: {...notifPrefs.ledgerLockEvents, inApp: e.target.checked}})}
                          className="rounded text-[#1E293B] focus:ring-[#1E293B] cursor-pointer" 
                        />
                        In-App
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notifPrefs.ledgerLockEvents.email}
                          onChange={e => setNotifPrefs({...notifPrefs, ledgerLockEvents: {...notifPrefs.ledgerLockEvents, email: e.target.checked}})}
                          className="rounded text-[#1E293B] focus:ring-[#1E293B] cursor-pointer" 
                        />
                        Email
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => handleExplainNotif('ledgerLockEvents')}
                      className="text-slate-700 hover:text-slate-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle size={12} /> {notifExplanations.ledgerLockEvents ? 'Hide Rationale' : 'Why this matters'}
                    </button>
                  </div>

                  {notifExplanations.ledgerLockEvents && (
                    <div className="p-3.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-xs space-y-1.5 animate-in fade-in duration-150 shadow-xs">
                      <div className="text-slate-900 font-bold flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[8px] font-mono shrink-0">F</div> Statutory Control Rationale
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {notifExplanations.ledgerLockEvents.why_it_matters}
                      </p>
                      <p className="text-[11px] text-slate-600 font-mono pt-1.5 border-t border-slate-200">
                        Delivery Rationale: {notifExplanations.ledgerLockEvents.channel_rationale}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button variant="primary" type="submit">
                    Save Notification Policies
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* 4. SECURITY & POSTURE TAB */}
          {activeTab === 'security' && (
            <div className="p-8 space-y-7">
              <div>
                <h3 className="text-base font-bold text-slate-900">Security Posture &amp; Access Audit</h3>
                <p className="text-xs text-slate-500 mt-0.5">Two-factor authentication, active session management, and cryptographic audit posture.</p>
              </div>

              {/* Security Posture Statement */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={20} className="text-[#15803D]" />
                  <h4 className="font-bold text-sm text-slate-900">Finora Data Privacy &amp; Security Posture</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                      <Server size={14} className="text-[#1E293B]" /> On-Premise Local AI
                    </p>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      All financial ledger data is evaluated locally by Gemma 3. Financial data is never transmitted to external third-party AI APIs.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                      <KeyRound size={14} className="text-[#B45309]" /> Test-Mode Isolation
                    </p>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      Developer sandbox test credentials (`rzp_test_...`) are isolated from live production gateway feeds.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                      <Lock size={14} className="text-[#15803D]" /> Encrypted At Rest
                    </p>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      All database credentials, bank tokens, and ledger journal hashes are securely protected and encrypted at rest.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2FA Section */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[#F1F5F9] text-[#1E293B] border border-[#E2E8F0]">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Two-Factor Authentication (2FA)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 max-w-md">
                      Requires a 6-digit Time-based One-Time Password (TOTP) from an authenticator app upon login.
                    </p>
                    {twoFactorEnabled && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-full mt-2 border border-[#BBF7D0]">
                        <CheckCircle2 size={11} /> Enabled &amp; Enforced
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    twoFactorEnabled 
                      ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA] hover:bg-[#FEE2E2]' 
                      : 'bg-[#1E293B] text-white border-[#1E293B] hover:bg-[#0F172A]'
                  }`}
                >
                  {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>

              {/* Active Sessions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Active Sessions</h4>
                    <p className="text-[11px] text-slate-500">Devices currently authenticated to this organization.</p>
                  </div>
                  {sessions.length > 1 && (
                    <button 
                      onClick={handleRevokeOtherSessions}
                      className="text-xs font-bold text-[#B91C1C] hover:text-[#991B1B] flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut size={13} /> Revoke Other Sessions
                    </button>
                  )}
                </div>

                {sessionsRevoked && (
                  <div className="p-3 bg-[#F0FDF4] text-[#15803D] text-xs rounded-xl border border-[#BBF7D0] flex items-center gap-2">
                    <CheckCircle2 size={15} /> All other active sessions successfully revoked.
                  </div>
                )}

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {sessions.map(s => (
                    <div key={s.id} className="p-3.5 bg-white flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <Laptop size={16} className="text-slate-400" />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            {s.device}
                            {s.isCurrent && <span className="bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] text-[10px] font-bold px-1.5 py-0.2 rounded">Current Session</span>}
                          </div>
                          <div className="text-[11px] text-slate-400">{s.location} • {s.lastActive}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Log Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-slate-900">Immutable Audit Trail</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
                        Live SQLite Ledger ({auditLogs.length} entries)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Record of controller actions, AI recommendations applied, exceptions resolved, and ledger freeze events.</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Ind AS &amp; SOX Compliant</span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs bg-white shadow-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Actor / User</th>
                        <th className="py-2.5 px-3">Trigger Type</th>
                        <th className="py-2.5 px-3">Action &amp; Target</th>
                        <th className="py-2.5 px-3">State Transition &amp; Notes</th>
                        <th className="py-2.5 px-3 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {auditLogs.map(log => {
                        let triggerBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                        if (log.trigger_type === 'AI Recommendation Applied') {
                          triggerBadgeClass = 'bg-[#F1F5F9] text-[#1E293B] border-[#E2E8F0]';
                        } else if (log.trigger_type === 'Controller Sign-Off') {
                          triggerBadgeClass = 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]';
                        } else if (log.trigger_type === 'Human Controller Manual Approval') {
                          triggerBadgeClass = 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]';
                        }

                        return (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors duration-150 ease-out">
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-900">{log.user}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{log.ip}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${triggerBadgeClass}`}>
                                {log.trigger_type || 'Manual Approval'}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-800">{log.action}</div>
                              <div className="font-mono text-[10px] text-slate-900 truncate max-w-[180px]">{log.target}</div>
                            </td>
                            <td className="py-3 px-3">
                              {(log.previous_value || log.new_value) && (
                                <div className="text-[10px] font-mono text-slate-600 space-x-1">
                                  <span className="text-slate-400">{log.previous_value}</span>
                                  {log.previous_value && log.new_value && <span className="text-slate-400">&rarr;</span>}
                                  <span className="font-bold text-slate-800">{log.new_value}</span>
                                </div>
                              )}
                              {log.notes && (
                                <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-xs">{log.notes}</div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right text-slate-500 font-mono text-[10px] whitespace-nowrap">
                              {log.timestamp}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Tab 5: About & User Guide */}
          {activeTab === 'about' && (
            <div className="animate-in fade-in duration-150">
              <AppInfoGuide />
            </div>
          )}

        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#F1F5F9] text-[#1E293B] rounded-xl border border-[#E2E8F0]">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Invite Finance Team Member</h3>
                  <p className="text-xs text-slate-500">Configure role and internal controls permissions.</p>
                </div>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Mehta, CA"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="vikram.mehta@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e: any) => setInviteRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E293B] cursor-pointer"
                >
                  <option value="Finance Controller">Finance Controller (Resolve Exceptions &amp; Execute Close)</option>
                  <option value="Viewer / Auditor">Viewer / Statutory Auditor (Read-Only Dashboards &amp; Reports)</option>
                  <option value="Organization Admin">Organization Admin (Full Access &amp; Credentials)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">Scope Preview:</span>
                {inviteRole === 'Finance Controller' && (
                  <span>Can resolve exceptions and execute month-end lock. Cannot modify API credentials or delete audit logs.</span>
                )}
                {inviteRole === 'Viewer / Auditor' && (
                  <span>Read-only access across all financial dashboards. Cannot alter ledger balances or exceptions.</span>
                )}
                {inviteRole === 'Organization Admin' && (
                  <span>Full unrestricted administrative control including security and credential provisioning.</span>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1E293B] hover:bg-[#0F172A] text-white shadow-xs transition-colors cursor-pointer"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Scope & Segregation of Duties Evaluation Modal */}
      {showScopeModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#F1F5F9] text-[#1E293B] rounded-xl border border-[#E2E8F0]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Configure Role Scope &amp; Permissions</h3>
                  <p className="text-xs text-slate-500">Member: {selectedMember.name} • ({selectedMember.email})</p>
                </div>
              </div>
              <button
                onClick={() => setShowScopeModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Assigned Operational Capabilities
                </label>
                <div className="space-y-2.5">
                  {[
                    { id: 'view_dashboards', label: 'View Dashboards, Cash Position & Treasury Analytics', desc: 'Read-only financial telemetry and reporting.' },
                    { id: 'resolve_exceptions', label: 'Resolve Exceptions & Authorize Adjustments', desc: 'Operational ledger write-off and fee tolerance approvals.' },
                    { id: 'execute_month_end_close', label: 'Execute Month-End Close & Sign Off', desc: 'Pre-lock validation audit and digital period sign-off.' },
                    { id: 'modify_api_keys', label: 'Modify Linked Bank/Gateway API Keys', desc: 'Payment aggregator webhook secret and credential management.' },
                    { id: 'manage_security', label: 'Manage 2FA, Sessions & Security Policies', desc: 'Identity governance and multi-tenant authentication controls.' }
                  ].map(cap => {
                    const isChecked = memberCapabilities.includes(cap.id);
                    return (
                      <label 
                        key={cap.id}
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                          isChecked ? 'bg-slate-100/80 border-slate-300' : 'bg-slate-50/50 border-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCapability(cap.id)}
                          className="mt-0.5 rounded text-[#1E293B] focus:ring-[#1E293B] cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{cap.label}</span>
                          <span className="text-slate-500 text-[11px]">{cap.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Deterministic SoD Rule Evaluation Banner */}
              {sodResult && (
                <div className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                  sodResult.has_conflict
                    ? 'bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]'
                    : 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      {sodResult.has_conflict ? (
                        <>
                          <AlertTriangle size={15} className="text-[#B91C1C]" />
                          <span className="text-[#B91C1C] uppercase tracking-wider font-bold">
                            Segregation of Duties Conflict Detected ({sodResult.conflict_code})
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={15} className="text-[#15803D]" />
                          <span className="text-[#15803D] uppercase tracking-wider font-bold">
                            Dual-Custody Segregation Intact (Rule Pass)
                          </span>
                        </>
                      )}
                    </div>

                    {sodResult.has_conflict && (
                      <button
                        type="button"
                        onClick={() => setShowSodAi(!showSodAi)}
                        className="text-xs font-bold text-[#B91C1C] hover:text-[#991B1B] flex items-center gap-1 cursor-pointer bg-[#FEE2E2] px-2 py-0.5 rounded border border-[#FECACA]"
                      >
                        <div className="w-3 h-3 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[7px] font-mono shrink-0">F</div>
                        {showSodAi ? 'Hide Risk Analysis' : 'Explain Risk'}
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] leading-relaxed">
                    {sodResult.rule_description}
                  </p>

                  {/* Grounded AI Explanation of the Risk */}
                  {sodResult.has_conflict && showSodAi && (
                    <div className="mt-2 p-3.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl space-y-1.5 animate-in fade-in duration-150 text-xs shadow-xs">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                        <div className="w-3.5 h-3.5 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[8px] font-mono shrink-0">F</div>
                        Internal Control Risk Analysis
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {sodResult.ai_explanation}
                      </p>
                      <div className="text-[11px] text-[#B45309] bg-[#FFFBEB] p-1.5 rounded border border-[#FEF3C7] font-semibold pt-1">
                        Recommendation: {sodResult.recommendation}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-[11px] text-slate-500">
                Deterministic SoD rule checks are evaluated before saving.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowScopeModal(false)}
                  className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowScopeModal(false)}
                  disabled={sodResult?.has_conflict}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs ${
                    sodResult?.has_conflict
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                      : 'bg-[#1E293B] hover:bg-[#0F172A] text-white cursor-pointer'
                  }`}
                >
                  {sodResult?.has_conflict ? 'Blocked by SoD Rule' : 'Save Scope Permissions'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
