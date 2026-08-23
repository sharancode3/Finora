import React, { useState } from 'react';
import { 
  User, 
  Users, 
  Bell, 
  Shield, 
  ShieldCheck, 
  Smartphone, 
  Laptop, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  KeyRound,
  FileCheck,
  Info,
  Server,
  Plus,
  X,
  Eye,
  Check,
  Minus,
  Sparkles,
  Layers,
  Clock
} from 'lucide-react';
import { Button } from '../components/ui/Button';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Organization Admin' | 'Finance Controller' | 'Viewer / Auditor';
  status: 'Active' | 'Invited';
}

interface AuditLogEntry {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  ip: string;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('team');
  
  // Profile State
  const [profileSaved, setProfileSaved] = useState(false);
  
  // Notification Preferences State (Granular Event Channels)
  const [notifSaved, setNotifSaved] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    highRiskExceptions: { inApp: true, email: true },
    syncFailures: { inApp: true, email: true },
    anomalyFlags: { inApp: true, email: false },
    monthEndReadiness: { inApp: true, email: false },
    ledgerLockEvents: { inApp: true, email: true },
  });

  // Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessions, setSessions] = useState([
    { id: '1', device: 'Windows PC • Chrome 124', location: 'Bengaluru, India', isCurrent: true, lastActive: 'Active now' },
    { id: '2', device: 'MacBook Pro • Safari 17', location: 'Mumbai, India', isCurrent: false, lastActive: '2 hours ago' },
    { id: '3', device: 'iPhone 15 • Finora Mobile App', location: 'Bengaluru, India', isCurrent: false, lastActive: 'Yesterday' }
  ]);
  const [sessionsRevoked, setSessionsRevoked] = useState(false);

  // Team Management State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Finance Admin', email: 'finance@razorpay.demo', role: 'Organization Admin', status: 'Active' },
    { id: '2', name: 'Sarah Jenkins, CPA', email: 'sarah.j@razorpay.demo', role: 'Finance Controller', status: 'Active' },
    { id: '3', name: 'Statutory Audit Partner (EY)', email: 'audit.partner@ey.demo', role: 'Viewer / Auditor', status: 'Active' }
  ]);

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Organization Admin' | 'Finance Controller' | 'Viewer / Auditor'>('Finance Controller');

  // Audit Logs
  const [auditLogs] = useState<AuditLogEntry[]>([
    { id: 'log-1', user: 'Sarah Jenkins, CPA', action: 'Authorized Period Close', target: 'August 2026 Books', timestamp: 'Today, 17:05', ip: '103.21.14.82' },
    { id: 'log-2', user: 'Finance Admin', action: 'Connected Bank Feed', target: 'HDFC Corporate Current', timestamp: 'Today, 16:52', ip: '103.21.14.82' },
    { id: 'log-3', user: 'Sarah Jenkins, CPA', action: 'Resolved Exception', target: 'EXC-88291 (Fee Discrepancy)', timestamp: 'Today, 14:15', ip: '103.21.14.82' },
    { id: 'log-4', user: 'Statutory Audit Partner (EY)', action: 'Exported Reconciliation Package', target: 'July 2026 Audit Report', timestamp: 'Yesterday, 11:30', ip: '49.207.201.12' },
  ]);

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: <User size={16} /> },
    { id: 'team', label: 'Team & Governance', icon: <Users size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'security', label: 'Security & Posture', icon: <Shield size={16} /> },
  ];

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

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    setTeamMembers([
      ...teamMembers,
      {
        id: `mem-${Date.now()}`,
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
        status: 'Invited'
      }
    ]);
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Organization & Governance Settings</h2>
        <p className="text-slate-500 mt-1 text-sm">Internal controls, segregation of duties, granular alert triggers, and statutory security posture.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0 hide-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs' 
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
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-700 font-bold text-xl flex items-center justify-center border border-indigo-200">
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
                  <input type="text" defaultValue="Finance" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Last Name</label>
                  <input type="text" defaultValue="Admin" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                  <input type="email" defaultValue="finance@razorpay.demo" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assigned Role</label>
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    Organization Admin (Full Access)
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
                <Button variant="primary" onClick={() => { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000); }}>
                  Save Profile Changes
                </Button>
                {profileSaved && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Profile updated successfully!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 2. TEAM & GOVERNANCE TAB (Segregation of Duties) */}
          {activeTab === 'team' && (
            <div className="p-8 space-y-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Internal Controls & Segregation of Duties</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Enforce role separation so auditors and reviewers cannot modify payment credentials.</p>
                </div>
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
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
                      <th className="py-3 px-4">Role & Scope</th>
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
                            m.role === 'Organization Admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            m.role === 'Finance Controller' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {m.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-xs font-semibold flex items-center gap-1 ${
                            m.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button className="text-xs font-bold text-slate-500 hover:text-indigo-600 cursor-pointer">Edit Scope</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Role Permissions Matrix (Internal Controls Concept) */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-600" />
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
                        <td className="py-2 px-3 font-medium text-slate-800">View Dashboards, Cash Position & Analytics</td>
                        <td className="py-2 px-3 text-center text-emerald-600"><Check size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-emerald-600"><Check size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-emerald-600"><Check size={14} className="mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-800">Resolve Exceptions & Authorize Adjustments</td>
                        <td className="py-2 px-3 text-center text-emerald-600"><Check size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-emerald-600"><Check size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-slate-300"><Minus size={14} className="mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-800">Execute Month-End Close & Sign Off</td>
                        <td className="py-2 px-3 text-center text-emerald-600"><Check size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-emerald-600"><Check size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-slate-300"><Minus size={14} className="mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-800">Modify Linked Bank/Gateway API Keys</td>
                        <td className="py-2 px-3 text-center text-emerald-600"><Check size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-slate-300"><Minus size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-slate-300"><Minus size={14} className="mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-800">Manage 2FA, Sessions & Security Policies</td>
                        <td className="py-2 px-3 text-center text-emerald-600"><Check size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-slate-300"><Minus size={14} className="mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-slate-300"><Minus size={14} className="mx-auto" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 3. NOTIFICATIONS TAB (Granular Event Rules) */}
          {activeTab === 'notifications' && (
            <div className="p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Granular Notification Triggers</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select specific event criteria to avoid alert fatigue. (Persistent notification bell lives in the persistent top bar).
                </p>
              </div>

              <form onSubmit={handleSaveNotifs} className="space-y-4 max-w-2xl">
                
                {/* 1. High Risk Exceptions */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4">
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
                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                      />
                      In-App
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifPrefs.highRiskExceptions.email}
                        onChange={e => setNotifPrefs({...notifPrefs, highRiskExceptions: {...notifPrefs.highRiskExceptions, email: e.target.checked}})}
                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                      />
                      Email
                    </label>
                  </div>
                </div>

                {/* 2. Sync Failures */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Integration Sync Failure & Stale Feed Alert</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Notify when gateway webhook breaks or bank feed is stale for &gt; 24 hours.</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifPrefs.syncFailures.inApp}
                        onChange={e => setNotifPrefs({...notifPrefs, syncFailures: {...notifPrefs.syncFailures, inApp: e.target.checked}})}
                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                      />
                      In-App
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifPrefs.syncFailures.email}
                        onChange={e => setNotifPrefs({...notifPrefs, syncFailures: {...notifPrefs.syncFailures, email: e.target.checked}})}
                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                      />
                      Email
                    </label>
                  </div>
                </div>

                {/* 3. Benford / ML Anomaly */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Forensic Benford's Law & Isolation Forest Anomaly Flag</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Notify when logarithmic digit distribution or multidimensional cluster drifts from normal baseline.</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifPrefs.anomalyFlags.inApp}
                        onChange={e => setNotifPrefs({...notifPrefs, anomalyFlags: {...notifPrefs.anomalyFlags, inApp: e.target.checked}})}
                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                      />
                      In-App
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifPrefs.anomalyFlags.email}
                        onChange={e => setNotifPrefs({...notifPrefs, anomalyFlags: {...notifPrefs.anomalyFlags, email: e.target.checked}})}
                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                      />
                      Email
                    </label>
                  </div>
                </div>

                {/* 4. Month-End Daily Readiness */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Month-End Continuous Close SLA Degradation</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Daily digest when active month close readiness falls below 90% SLA.</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifPrefs.monthEndReadiness.inApp}
                        onChange={e => setNotifPrefs({...notifPrefs, monthEndReadiness: {...notifPrefs.monthEndReadiness, inApp: e.target.checked}})}
                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                      />
                      In-App
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifPrefs.monthEndReadiness.email}
                        onChange={e => setNotifPrefs({...notifPrefs, monthEndReadiness: {...notifPrefs.monthEndReadiness, email: e.target.checked}})}
                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                      />
                      Email
                    </label>
                  </div>
                </div>

                {/* 5. Ledger Lock Events */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Statutory Controller Sign-off & Ledger Lock</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Security notification when general ledger period is frozen or unlocked.</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifPrefs.ledgerLockEvents.inApp}
                        onChange={e => setNotifPrefs({...notifPrefs, ledgerLockEvents: {...notifPrefs.ledgerLockEvents, inApp: e.target.checked}})}
                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                      />
                      In-App
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifPrefs.ledgerLockEvents.email}
                        onChange={e => setNotifPrefs({...notifPrefs, ledgerLockEvents: {...notifPrefs.ledgerLockEvents, email: e.target.checked}})}
                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                      />
                      Email
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <Button variant="primary" type="submit">Save Granular Preferences</Button>
                  {notifSaved && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Preferences updated!
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* 4. SECURITY & POSTURE TAB */}
          {activeTab === 'security' && (
            <div className="p-8 space-y-7">
              <div>
                <h3 className="text-base font-bold text-slate-900">Security Posture & Access Audit</h3>
                <p className="text-xs text-slate-500 mt-0.5">Two-factor authentication, active session management, and cryptographic audit posture.</p>
              </div>

              {/* Security Posture Statement */}
              <div className="bg-white rounded-2xl p-6 border border-indigo-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900">Finora Data Privacy & Security Posture</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                      <Server size={14} className="text-indigo-600" /> On-Premise Local AI
                    </p>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      All financial ledger data is evaluated locally by Gemma 3. Financial data is never transmitted to external third-party AI APIs.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                      <KeyRound size={14} className="text-amber-600" /> Test-Mode Isolation
                    </p>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      Developer sandbox test credentials (`rzp_test_...`) are isolated from live production gateway feeds.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                      <Lock size={14} className="text-emerald-600" /> AES-256 GCM At Rest
                    </p>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      All database credentials, bank account IDs, and journal hashes are encrypted at rest using AES-256 GCM.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2FA Section */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Two-Factor Authentication (2FA)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 max-w-md">
                      Requires a 6-digit Time-based One-Time Password (TOTP) from an authenticator app upon login.
                    </p>
                    {twoFactorEnabled && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 border border-emerald-200">
                        <CheckCircle2 size={11} /> Enabled & Enforced
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    twoFactorEnabled 
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                      : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500'
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
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut size={13} /> Revoke Other Sessions
                    </button>
                  )}
                </div>

                {sessionsRevoked && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
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
                            {s.isCurrent && <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">Current Session</span>}
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
                    <h4 className="font-bold text-xs text-slate-900">Immutable Audit Trail</h4>
                    <p className="text-[11px] text-slate-500">Record of all controller actions and ledger modifications.</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Ind AS & SOX Compliant</span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">User</th>
                        <th className="py-2.5 px-3">Action</th>
                        <th className="py-2.5 px-3">Target</th>
                        <th className="py-2.5 px-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {auditLogs.map(log => (
                        <tr key={log.id}>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{log.user}</td>
                          <td className="py-2.5 px-3 text-slate-700">{log.action}</td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-indigo-700">{log.target}</td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono text-[10px]">{log.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

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
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e: any) => setInviteRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Finance Controller">Finance Controller (Resolve Exceptions & Execute Close)</option>
                  <option value="Viewer / Auditor">Viewer / Statutory Auditor (Read-Only Dashboards & Reports)</option>
                  <option value="Organization Admin">Organization Admin (Full Access & Credentials)</option>
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
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
