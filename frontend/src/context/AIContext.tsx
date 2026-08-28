import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import { api } from '../api/client';
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
  suggested_questions?: string[];
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
  date_range?: { start: string; end: string };
  [key: string]: any;
}

interface AIContextType {
  messages: ChatMessage[];
  sendMessage: (msg: string) => Promise<ChatResponse>;
  askAI: (question: string) => Promise<void>;
  askAboutElement: (question: string) => Promise<void>;
  isLoading: boolean;
  bannerMessage: string | null;
  setBannerMessage: (msg: string | null) => void;
  highlightedRecordId: string | null;
  clearBanner: () => void;
  clearHighlight: () => void;
  clearMessages: () => void;
  lastResponse: ChatResponse | null;
  pageContext: PageContext | null;
  setPageContext: (ctx: PageContext) => void;
  lastSentContext: PageContext | null;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  isReconciliationModalOpen: boolean;
  setIsReconciliationModalOpen: (open: boolean) => void;
  reconciliationTargetScope: string;
  setReconciliationTargetScope: (scope: string) => void;
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
  const [lastSentContext, setLastSentContext] = useState<PageContext | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isReconciliationModalOpen, setIsReconciliationModalOpen] = useState(false);
  const [reconciliationTargetScope, setReconciliationTargetScope] = useState("2026-08");
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
      // Dynamically resolve current route fresh at the exact moment of query submission
      const currentPath = window.location.pathname;
      
      const routeToPageName: Record<string, string> = {
        '/': 'Overview & Command Center',
        '/dashboard': 'Overview & Command Center',
        '/exceptions': 'Exceptions & Risk Command',
        '/reconciliation': 'Reconciliation Operations',
        '/cash-position': 'Cash Position & Treasury',
        '/month-end-close': 'Month-End Close & Statutory Lock',
        '/tax-matcher': 'Tax-Line Matcher (GSTR-2B & TDS)',
        '/document-assistant': 'Document Assistant',
        '/accounts': 'Linked Accounts & Money Movement',
        '/settings': 'Settings & Governance',
        '/ask_your_books': 'Ask Fino (Conversational Ledger)',
        '/ask-your-books': 'Ask Fino (Conversational Ledger)',
        '/ask-fino': 'Ask Fino (Conversational Ledger)'
      };

      const defaultPageName = routeToPageName[currentPath] || (currentPath.replace('/', '') || 'Executive Command Center');

      // Check if pageContext in state matches the active route; if not, discard stale context
      const isContextMatchingRoute = Boolean(
        pageContext && (
          pageContext.route === currentPath || 
          (currentPath === '/' && pageContext.route === '/dashboard') ||
          (currentPath === '/dashboard' && pageContext.route === '/')
        )
      );

      const activePageName = isContextMatchingRoute ? pageContext!.page_name : defaultPageName;
      const activeFilters = isContextMatchingRoute ? (pageContext!.active_filters || {}) : {};
      const activeMetrics = isContextMatchingRoute ? (pageContext!.visible_metrics || {}) : {};
      const activeRecordId = isContextMatchingRoute ? pageContext!.selected_record_id : undefined;

      let dateRange = { start: '2026-08-01', end: '2026-08-31' };
      try {
        const storedRange = localStorage.getItem('finora_dashboard_range');
        if (storedRange) dateRange = JSON.parse(storedRange);
      } catch (e) {}
      
      const conversationHistory = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      
      const freshContext: PageContext = {
        user_name: 'Sharan',
        page_name: activePageName,
        route: currentPath,
        screen: currentPath.replace('/', '') || 'dashboard',
        date_range: dateRange,
        active_filters: activeFilters,
        visible_metrics: activeMetrics,
        selected_record_id: activeRecordId,
        suggested_inquiries: isContextMatchingRoute ? pageContext!.suggested_inquiries : undefined,
        extra_hints: isContextMatchingRoute ? pageContext!.extra_hints : undefined,
        conversation_history: conversationHistory,
        ...(isContextMatchingRoute ? pageContext : {})
      };

      // Explicitly enforce current page_name and route to prevent any stale bleed
      freshContext.user_name = 'Sharan';
      freshContext.page_name = activePageName;
      freshContext.route = currentPath;
      freshContext.screen = currentPath.replace('/', '') || 'dashboard';
      freshContext.conversation_history = conversationHistory;

      setLastSentContext(freshContext);

      const res = await api.post('/chat/ask', { question, context: freshContext });
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
          suggested_questions: data.suggested_questions,
          modules_consulted: data.modules_consulted,
          visual_data: data.visual_data,
          knowledge_citation: data.knowledge_citation,
          debug_page_context: freshContext
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

  const askAI = async (question: string) => {
    setIsCopilotOpen(true);
    await sendMessage(question);
  };

  return (
    <AIContext.Provider value={{
      messages,
      sendMessage,
      askAI,
      askAboutElement: askAI,
      isLoading,
      bannerMessage,
      setBannerMessage,
      highlightedRecordId,
      clearBanner: () => setBannerMessage(null),
      clearHighlight: () => setHighlightedRecordId(null),
      clearMessages,
      lastResponse,
      pageContext,
      setPageContext,
      lastSentContext,
      isCopilotOpen,
      setIsCopilotOpen,
      isReconciliationModalOpen,
      setIsReconciliationModalOpen,
      reconciliationTargetScope,
      setReconciliationTargetScope
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
