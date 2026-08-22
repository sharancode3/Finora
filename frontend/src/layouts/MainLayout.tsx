import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, MessageSquare, X } from 'lucide-react';
import { ChatPanel } from '../components/ui/ChatPanel';
import { Banner } from '../components/ui/Banner';
import { ToastContainer } from '../components/ui/Toast';
import { useAI } from '../context/AIContext';

const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`text-[14px] font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}
    >
      {children}
    </Link>
  );
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const { bannerMessage, clearBanner } = useAI();

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <ToastContainer />
      
      {/* Top Banner if exists */}
      {bannerMessage && (
        <Banner message={bannerMessage} onClose={clearBanner} />
      )}
      
      {/* Top Navigation */}
      <header className="bg-slate-900 text-white h-[56px] fixed top-0 w-full z-40 flex items-center justify-between px-6 border-b border-slate-800">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 mr-10">
            <div className="w-8 h-8 rounded bg-primary-accent flex items-center justify-center text-white font-bold text-lg">
              F
            </div>
            <span className="text-[18px] font-bold tracking-tight">Finora</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/exceptions">Exceptions</NavLink>
            <NavLink to="/ask_your_books">Ask Your Books</NavLink>
            <NavLink to="/cash-position">Cash Position</NavLink>
            <NavLink to="/data-sources">Data Sources</NavLink>
            <NavLink to="/month-end-close">Month-End Close</NavLink>
            <NavLink to="/settings">Settings</NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setChatOpen(!chatOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${chatOpen ? 'bg-primary-accent text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <MessageSquare size={16} />
            <span>AI Chat</span>
          </button>
          
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[13px] font-medium leading-tight">Razorpay Corp</span>
              <span className="text-[11px] text-slate-400">Finance Admin</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold border border-slate-600">
              RA
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex mt-[56px] h-[calc(100vh-56px)] overflow-hidden">
        
        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${chatOpen ? 'mr-[400px]' : 'mr-0'}`}>
          <div className="max-w-[1440px] mx-auto p-6 md:p-8 mt-4">
            {children}
          </div>
        </main>

        {/* Sliding Chat Panel */}
        <div 
          className={`fixed top-[56px] right-0 h-[calc(100vh-56px)] w-[400px] bg-surface border-l border-border transform transition-transform duration-300 ease-in-out z-30 flex flex-col shadow-2xl ${chatOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between p-4 border-b border-border bg-slate-50">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-primary-accent" />
              <h3 className="font-semibold text-slate-800 text-[15px]">Finora AI Assistant</h3>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-slate-700">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {/* We render a wrapper around ChatPanel that uses the context */}
            <ConnectedChatPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectedChatPanel() {
  const { messages, sendMessage, isLoading } = useAI();
  return (
    <div className="h-full relative">
      <ChatPanel 
        messages={messages as any} 
        onSendMessage={sendMessage} 
        className="h-full border-0" 
      />
      {isLoading && (
        <div className="absolute bottom-16 left-4 bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full shadow-sm animate-pulse border border-slate-200">
          Analyzing your books...
        </div>
      )}
    </div>
  );
}
