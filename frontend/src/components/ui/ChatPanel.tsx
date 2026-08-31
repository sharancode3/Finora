import React, { useState } from 'react';
import { Bot, User, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { FormattedMarkdown } from './FormattedMarkdown';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  evidenceCount?: number;
  sourceChips?: string[];
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  className?: string;
}

export const ChatPanel = ({ messages, onSendMessage, className = '' }: ChatPanelProps) => {
  const [input, setInput] = useState('');
  const [expandedEvidence, setExpandedEvidence] = useState<Record<string, boolean>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const toggleEvidence = (id: string) => {
    setExpandedEvidence(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={`flex flex-col bg-surface border-l border-border h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 text-slate-900 flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[#1E293B] text-white flex items-center justify-center font-bold text-[9px] font-mono shrink-0">F</div>
        <h3 className="font-bold text-sm">Ask Fino (Conversational Books)</h3>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-background">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-10 text-sm">
            Ask me anything about your finances, exceptions, or match rates.
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary-accent text-white' : 'bg-slate-200 text-slate-700'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-lg text-[14px] ${msg.role === 'user' ? 'bg-primary-accent text-white rounded-tr-none' : 'bg-surface border border-border text-slate-700 rounded-tl-none shadow-sm'}`}>
                <FormattedMarkdown content={msg.content} isUser={msg.role === 'user'} className={msg.role === 'user' ? 'text-white' : 'text-slate-800'} />
              </div>
              
              {/* Evidence Expandable */}
              {msg.role === 'assistant' && msg.evidenceCount !== undefined && msg.evidenceCount > 0 && (
                <div className="mt-2 w-full">
                  <button 
                    onClick={() => toggleEvidence(msg.id)}
                    className="flex items-center gap-1 text-[12px] font-semibold text-info hover:underline focus:outline-none"
                  >
                    <ShieldCheck size={14} className="text-success" />
                    Evidence: {msg.evidenceCount} records {expandedEvidence[msg.id] ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                  </button>
                  
                  {expandedEvidence[msg.id] && msg.sourceChips && (
                    <div className="mt-2 flex flex-wrap gap-1.5 p-2 bg-slate-100 rounded border border-slate-200 animate-in fade-in duration-200">
                      {msg.sourceChips.map((chip, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono text-slate-600 shadow-sm">
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-border bg-surface">
        <form onSubmit={handleSubmit} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your books..." 
            className="w-full bg-slate-50 border border-border rounded-lg pl-3 pr-12 py-2.5 text-[14px] focus:outline-none focus:border-primary-accent focus:ring-1 focus:ring-primary-accent shadow-sm"
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary-accent hover:bg-slate-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Bot size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
