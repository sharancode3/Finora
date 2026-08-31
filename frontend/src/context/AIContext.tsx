import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  timestamp?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  section: string; // 'Reconciliation' | 'Treasury' | 'Exceptions' | 'Close' | 'Statutory' | 'General'
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
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
  sessions: ChatSession[];
  currentSessionId: string | null;
  createNewSession: (title?: string, section?: string) => string;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  clearAllSessions: () => void;
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

const PRESEEDED_SESSIONS: ChatSession[] = [
  {
    id: "sess_treasury_waterfall",
    title: "Gross-to-Net Liquidity Bridge",
    section: "Treasury",
    createdAt: "Today, 3:45 PM",
    updatedAt: "Today, 3:47 PM",
    messages: [
      {
        role: "user",
        content: "Show Gross-to-Net Liquidity Bridge and explain in-transit float",
        timestamp: "3:45 PM"
      },
      {
        role: "ai",
        content: "### **Gross-to-Net Payout Reconciliation Analysis (August 2026)**\n\nFor the active August 2026 period, your bank deposit steps down from **₹2,98,603.50** gross checkout volume to **₹2,44,371.19** net usable cash through **4 verified statutory deductions**:\n\n| Step | Component | Amount | Impact Description |\n| :--- | :--- | :--- | :--- |\n| 1 | **Gross Processed Volume** | **₹2,98,603.50** | Total checkout revenue across 60 transactions |\n| 2 | **Payment Gateway MDR Fees** | **-₹7,262.07** | Contractual merchant acquiring fee (~2.43% effective) |\n| 3 | **18% GST on Gateway Fees** | **-₹1,307.16** | Statutory GST tax input (claimable via GSTR-2B ITC) |\n| 4 | **Trapped in Open Exceptions** | **-₹26,900.00** | 4 open discrepancies awaiting resolution |\n| 5 | **Unsettled In-Transit Float** | **-₹18,763.08** | Valid transactions clearing standard T+2 nodal pipeline |\n| 6 | **Verified Net Bank Cash** | **₹2,44,371.19** | Total liquidity deposited in Kotak & HDFC accounts |\n\n#### **Key Controller Takeaways**:\n- **Cash Conversion Rate**: **81.8%** of gross volume settled into bank cash.\n- **Recoverable Capital**: **₹26,900.00** can be recovered in the Exceptions Queue.\n- **Float Clearance**: **₹18,763.08** will credit within 2 business days under T+2 SLAs.",
        timestamp: "3:47 PM",
        metadata: {
          confidence: "HIGH",
          confidence_score: 0.99,
          confidence_rationale: "100% deterministic calculation from SQLite database ledger.",
          verifier_passed: true,
          visual_data: {
            type: "bar",
            title: "Liquidity Bridge Waterfall",
            data: [
              { name: "Gross", value: 298603.5 },
              { name: "Fees", value: -7262.07 },
              { name: "GST", value: -1307.16 },
              { name: "Exceptions", value: -26900 },
              { name: "Float", value: -18763.08 },
              { name: "Net Cash", value: 244371.19 }
            ]
          },
          reasoning_trail: [
            { step_number: 1, action: "Retrieved statutory Gross-to-Net waterfall", tool: "curated_finance_knowledge_base", input: {}, observation: "Decomposed gross-to-net waterfall under Ind AS 115." },
            { step_number: 2, action: "Calculated exact 4-factor reconciliation bridge", tool: "sqlite_acid_ledger_query", input: {}, observation: "Verified exact Rs 244,371.19 net cash with 0.00 variance." }
          ]
        }
      }
    ]
  },
  {
    id: "sess_match_rates",
    title: "Dual Match-Rate Discrepancy",
    section: "Reconciliation",
    createdAt: "Today, 2:15 PM",
    updatedAt: "Today, 2:16 PM",
    messages: [
      {
        role: "user",
        content: "Why are record and value match rates different?",
        timestamp: "2:15 PM"
      },
      {
        role: "ai",
        content: "### **Reconciliation Dual Match-Rate Analysis (August 2026)**\n\nYour **Record Match Rate (81.7%)** and **Statutory Value Match Rate (81.8%)** differ because financial reconciliation is value-weighted rather than purely count-weighted:\n\n| Metric Type | Value | Formula | Accounting Meaning |\n| :--- | :--- | :--- | :--- |\n| **Record Match Rate** | **81.7%** (49 / 60) | $\\frac{\\text{Settled Records}}{\\text{Total Orders}}$ | Proportion of individual transactions fully cleared. |\n| **Statutory Value Match Rate** | **81.8%** (₹2.44L / ₹2.98L) | $\\frac{\\text{Net Settled Cash}}{\\text{Gross Processed Volume}}$ | Proportion of total gross rupee volume deposited after fees. |\n\n#### **Why They Diverge**:\n1. **High-Value Skew**: Just **2 high-value open exceptions** (`exc_a17ebce376e6` ₹7,400.00 and `exc_b6eb43cc5acf` ₹6,200.00) represent **60.2%** of all trapped cash.\n2. **Gateway Deductions**: Contractual **MDR Fees (₹7,262.07)** and **GST (₹1,307.16)** reduce rupee payout without transaction failure.\n3. **In-Transit Float (T+2)**: **₹18,763.08** is within standard transit SLA awaiting batch deposit.",
        timestamp: "2:16 PM",
        metadata: {
          confidence: "HIGH",
          confidence_score: 0.98,
          confidence_rationale: "Mathematical decomposition of volume-weighted vs count-weighted reconciliation.",
          verifier_passed: true,
          reasoning_trail: [
            { step_number: 1, action: "Calculated Dual Match Rates", tool: "get_dual_match_rates", input: {}, observation: "Record: 81.7% (49/60). Value: 81.8% (Rs 2.44L/Rs 2.98L)." }
          ]
        }
      }
    ]
  },
  {
    id: "sess_close_blockers",
    title: "August 2026 Close Blockers",
    section: "Close",
    createdAt: "Yesterday, 6:10 PM",
    updatedAt: "Yesterday, 6:12 PM",
    messages: [
      {
        role: "user",
        content: "What is blocking month-end close for August 2026?",
        timestamp: "6:10 PM"
      },
      {
        role: "ai",
        content: "### **Month-End Close Blockers & Statutory Clearance Plan (August 2026)**\n\nYour close readiness is currently tracking at **80.0%**. **4 open discrepancies (₹26,900.00 total exposure)** currently prevent period locking under **Ind AS 115** and statutory audit controls:\n\n| Priority | Exception ID | Root Cause | Exposure | Next Best Action |\n| :--- | :--- | :--- | :--- | :--- |\n| **#1 High** | `exc_a17ebce376e6` | Amount Mismatch | ₹7,225.36 | Post adjusting journal entry for cart rounding |\n| **#2 High** | `exc_b6eb43cc5acf` | Duplicate Gateway Charge | ₹6,200.00 | Issue refund adjustment to prevent chargeback |\n| **#3 Med** | `exc_07790ca1bbec` | Ledger Only (Uncredited) | ₹4,800.00 | Match against pending Kotak batch credit |\n| **#4 Low** | `exc_8fefd903a5cd` | Contract MDR Fee Variance | ₹68.00 | Dispute 2.8% charged fee vs 2.0% agreement |",
        timestamp: "6:12 PM",
        metadata: {
          confidence: "HIGH",
          confidence_score: 0.99,
          verifier_passed: true
        }
      }
    ]
  }
];

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const stored = localStorage.getItem('finora_chat_sessions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return PRESEEDED_SESSIONS;
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    return PRESEEDED_SESSIONS[0]?.id || null;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return PRESEEDED_SESSIONS[0]?.messages || [];
  });

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

  // Save sessions to localStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem('finora_chat_sessions', JSON.stringify(sessions));
    } catch (e) {}
  }, [sessions]);

  const determineSection = (text: string): string => {
    const q = text.toLowerCase();
    if (q.includes('match rate') || q.includes('reconcil') || q.includes('discrepan')) return 'Reconciliation';
    if (q.includes('cash') || q.includes('float') || q.includes('waterfall') || q.includes('payout') || q.includes('bank') || q.includes('kotak') || q.includes('hdfc')) return 'Treasury';
    if (q.includes('exception') || q.includes('exc_') || q.includes('fix first') || q.includes('severity')) return 'Exceptions';
    if (q.includes('close') || q.includes('month end') || q.includes('signoff') || q.includes('lock')) return 'Close';
    if (q.includes('tds') || q.includes('gst') || q.includes('tax') || q.includes('194') || q.includes('ind as')) return 'Statutory';
    return 'General';
  };

  const createNewSession = (title?: string, section?: string): string => {
    const newId = `sess_${Date.now()}`;
    const newTitle = title || "New Inquiry";
    const newSection = section || "General";
    const nowStr = "Just now";
    
    const newSess: ChatSession = {
      id: newId,
      title: newTitle,
      section: newSection,
      createdAt: nowStr,
      updatedAt: nowStr,
      messages: []
    };

    setSessions(prev => [newSess, ...prev]);
    setCurrentSessionId(newId);
    setMessages([]);
    setLastResponse(null);
    return newId;
  };

  const loadSession = (sessionId: string) => {
    const sess = sessions.find(s => s.id === sessionId);
    if (sess) {
      setCurrentSessionId(sessionId);
      setMessages(sess.messages || []);
      const lastAi = sess.messages.slice().reverse().find(m => m.role === 'ai');
      if (lastAi && lastAi.metadata) {
        setLastResponse(lastAi.metadata);
      }
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      if (currentSessionId === sessionId) {
        if (updated.length > 0) {
          setCurrentSessionId(updated[0].id);
          setMessages(updated[0].messages || []);
        } else {
          setCurrentSessionId(null);
          setMessages([]);
        }
      }
      return updated;
    });
  };

  const clearAllSessions = () => {
    setSessions([]);
    setCurrentSessionId(null);
    setMessages([]);
    localStorage.removeItem('finora_chat_sessions');
  };

  const clearMessages = () => {
    setMessages([]);
    setLastResponse(null);
    if (currentSessionId) {
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [] } : s));
    }
  };

  const sendMessage = async (question: string) => {
    setIsLoading(true);
    setBannerMessage(null);
    setHighlightedRecordId(null);
    
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { role: 'user', content: question, timestamp: nowTime };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    // Ensure we have an active session or create one
    let targetSessionId = currentSessionId;
    const inferredSection = determineSection(question);
    const inferredTitle = question.length > 38 ? question.substring(0, 36) + '...' : question;

    if (!targetSessionId) {
      targetSessionId = `sess_${Date.now()}`;
      setCurrentSessionId(targetSessionId);
      const newSess: ChatSession = {
        id: targetSessionId,
        title: inferredTitle,
        section: inferredSection,
        createdAt: "Just now",
        updatedAt: "Just now",
        messages: updatedMessages
      };
      setSessions(prev => [newSess, ...prev]);
    } else {
      setSessions(prev => prev.map(s => {
        if (s.id === targetSessionId) {
          const isInitialTitle = s.title === 'New Inquiry' || s.messages.length === 0;
          return {
            ...s,
            title: isInitialTitle ? inferredTitle : s.title,
            section: isInitialTitle ? inferredSection : s.section,
            updatedAt: "Just now",
            messages: updatedMessages
          };
        }
        return s;
      }));
    }
    
    try {
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
      
      const conversationHistory = updatedMessages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      
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

      freshContext.user_name = 'Sharan';
      freshContext.page_name = activePageName;
      freshContext.route = currentPath;
      freshContext.screen = currentPath.replace('/', '') || 'dashboard';
      freshContext.conversation_history = conversationHistory;

      setLastSentContext(freshContext);

      const res = await api.post('/chat/ask', { question, context: freshContext });
      const data: any = res.data;
      setLastResponse(data);
      
      const aiMsg: ChatMessage = { 
        role: 'ai', 
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
          section: inferredSection,
          debug_page_context: freshContext
        }
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      
      // Update session with AI response
      setSessions(prev => prev.map(s => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            updatedAt: "Just now",
            messages: finalMessages
          };
        }
        return s;
      }));

      if (data.ui_action) {
        if (data.ui_action.type === 'navigate_to' && data.ui_action.screen) {
          const screenClean = data.ui_action.screen.toLowerCase().replace('_', '-');
          if (ALLOWED_SCREENS.includes(screenClean) || ALLOWED_SCREENS.includes(data.ui_action.screen)) {
            setBannerMessage(`Navigated to ${data.ui_action.screen} via AI.`);
            if (screenClean === 'dashboard') navigate('/');
            else navigate(`/${screenClean}`);
          }
        } else if (data.ui_action.type === 'highlight_record' && data.ui_action.record_id) {
          setHighlightedRecordId(data.ui_action.record_id);
        }
      }
      return data;
    } catch (err) {
      console.error(err);
      
      const errMsg: ChatMessage = { 
        role: 'ai', 
        content: 'Sorry, I encountered an error connecting to the Finora backend.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metadata: {
          confidence: 'LOW',
          confidence_score: 0.0,
          confidence_rationale: 'Backend connection failure.',
          escalation_recommendation: 'Check backend server status on port 8800.'
        }
      };
      
      setMessages(prev => [...prev, errMsg]);
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
      sessions,
      currentSessionId,
      createNewSession,
      loadSession,
      deleteSession,
      clearAllSessions,
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
