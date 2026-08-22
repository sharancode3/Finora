import React, { useState } from 'react';
import { User, Users, Bell, Key, Shield, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: <User size={16} /> },
    { id: 'team', label: 'Team Management', icon: <Users size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'api', label: 'API Keys', icon: <Key size={16} /> },
    { id: 'security', label: 'Security', icon: <Shield size={16} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Organization Settings</h2>
        <p className="text-slate-500 mt-1 text-sm">Manage your account, team members, and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0 hide-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-indigo-50 text-primary-accent' 
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
        <div className="flex-1 bg-white rounded-xl border border-border shadow-sm min-h-[500px]">
          
          {activeTab === 'profile' && (
            <div className="p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Profile Settings</h3>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                  <span className="text-2xl font-bold text-slate-400">RA</span>
                </div>
                <div>
                  <Button variant="outline" size="sm" className="mb-2">Upload new avatar</Button>
                  <p className="text-xs text-slate-500">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                  <input type="text" defaultValue="Finance" className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 px-3 text-sm focus:border-primary-accent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input type="text" defaultValue="Admin" className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 px-3 text-sm focus:border-primary-accent outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input type="email" defaultValue="finance@razorpay.demo" className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 px-3 text-sm focus:border-primary-accent outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-500 text-sm">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    Organization Admin
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border">
                <Button variant="primary">Save Changes</Button>
              </div>
            </div>
          )}

          {activeTab !== 'profile' && (
            <div className="p-8 h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                {tabs.find(t => t.id === activeTab)?.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{tabs.find(t => t.id === activeTab)?.label}</h3>
              <p className="text-sm">This section is not required for the current demo phase.</p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
