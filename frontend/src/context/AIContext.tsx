import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export interface UIAction {
  type: string;
  screen?: string;
  filters?: any;
  record_id?: string;
}

export interface ChatResponse {
  answer: string;
  evidence_ids: string[];
  evidence_data: any[];
  verifier_retries: number;
  ui_action?: UIAction;
  verifier_passed?: boolean;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_score?: number;
  confidence_rationale?: string;
  escalation_recommendation?: string | null;
  reasoning_trail?: Array<{
    step_number: number;
    action: string;
    tool: string;
    input: any;
    observation: string;
  }>;
  visual_data?: any;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  metadata?: any;
}

export interface PageContext {
  page_name: string;
  route: string;
  active_filters?: Record<string, any>;
  visible_metrics?: Record<string, any>;
  selected_record_id?: string;
  suggested_inquiries?: string[];
  extra_hints?: string;
}

interface AIContextType {
  messages: ChatMessage[];
  sendMessage: (msg: string) => Promise<ChatResponse>;
  isLoading: boolean;
  bannerMessage: string | null;
  highlightedRecordId: string | null;
  clearBanner: () => void;
  clearHighlight: () => void;
  clearMessages: () => void;
  lastResponse: ChatResponse | null;
  pageContext: PageContext | null;
  setPageContext: (ctx: PageContext) => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

const ALLOWED_SCREENS = ["dashboard", "exceptions", "reconciliation", "cash-position", "month-end-close", "linked-accounts", "ask-your-books"];

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [highlightedRecordId, setHighlightedRecordId] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null);
  const [pageContext, setPageContext] = useState<PageContext | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const navigate = useNavigate();

  const clearMessages = () => {
    setMessages([]);
    setLastResponse(null);
  };

  const sendMessage = async (question: string) => {
    setIsLoading(true);
    setBannerMessage(null);
    setHighlightedRecordId(null);
    
    // Add user message to UI immediately
    const userMsg: ChatMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    
    try {
      // Gather dynamic context
      const screen = window.location.pathname.replace('/', '') || 'landing';
      let dateRange = { start: '2026-08-01', end: '2026-08-31' };
      try {
        const storedRange = localStorage.getItem('finora_dashboard_range');
        if (storedRange) dateRange = JSON.parse(storedRange);
      } catch (e) {}
      
      const context = {
        screen,
        date_range: dateRange,
        ...(pageContext || {})
      };

      const res = await axios.post('http://127.0.0.1:8000/api/v1/chat/ask', { question, context });
      const data: any = res.data;
      setLastResponse(data);
      
      // Add AI response to UI
      const aiMsg: ChatMessage = { 
        role: 'ai', 
        content: data.answer,
        metadata: {
          verifier_passed: data.verifier_passed,
          confidence: data.confidence,
          confidence_score: data.confidence_score,
          confidence_rationale: data.confidence_rationale,
          escalation_recommendation: data.escalation_recommendation,
          reasoning_trail: data.reasoning_trail,
          evidence_record_ids: data.evidence_ids,
          visual_data: data.visual_data
        }
      };
      setMessages(prev => [...prev, aiMsg]);
      
      if (data.ui_action) {
        if (data.ui_action.type === 'navigate_to' && data.ui_action.screen) {
          const screenClean = data.ui_action.screen.toLowerCase().replace('_', '-');
          if (ALLOWED_SCREENS.includes(screenClean) || ALLOWED_SCREENS.includes(data.ui_action.screen)) {
            setBannerMessage(`Navigated to ${data.ui_action.screen} via AI.`);
            if (screenClean === 'dashboard') navigate('/');
            else navigate(`/${screenClean}`);
          } else {
            console.error(`AI tried to navigate to unauthorized screen: ${data.ui_action.screen}`);
          }
        } else if (data.ui_action.type === 'highlight_record' && data.ui_action.record_id) {
          setHighlightedRecordId(data.ui_action.record_id);
        }
      }
      return data;
    } catch (err) {
      console.error(err);
      
      // Add error message
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Sorry, I encountered an error connecting to the Finora backend.',
        metadata: {
          confidence: 'LOW',
          confidence_score: 0.0,
          confidence_rationale: 'Backend connection failure.',
          escalation_recommendation: 'Check backend server status on port 8000.'
        }
      }]);
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AIContext.Provider value={{
      messages,
      sendMessage,
      isLoading,
      bannerMessage,
      highlightedRecordId,
      clearBanner: () => setBannerMessage(null),
      clearHighlight: () => setHighlightedRecordId(null),
      clearMessages,
      lastResponse,
      pageContext,
      setPageContext,
      isCopilotOpen,
      setIsCopilotOpen
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
