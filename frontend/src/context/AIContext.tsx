import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface UIAction {
  type: string;
  screen?: string;
  filters?: any;
  record_id?: string;
}

interface ChatResponse {
  answer: string;
  evidence_ids: string[];
  evidence_data: any[];
  verifier_retries: number;
  ui_action?: UIAction;
  verifier_passed?: boolean;
  visual_data?: any;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  metadata?: any;
}

interface AIContextType {
  messages: ChatMessage[];
  sendMessage: (msg: string) => Promise<ChatResponse>;
  isLoading: boolean;
  bannerMessage: string | null;
  highlightedRecordId: string | null;
  clearBanner: () => void;
  clearHighlight: () => void;
  lastResponse: ChatResponse | null;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

const ALLOWED_SCREENS = ["dashboard", "exceptions", "reconciliation", "ask_your_books"];

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [highlightedRecordId, setHighlightedRecordId] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null);
  const navigate = useNavigate();

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
        date_range: dateRange
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
          if (ALLOWED_SCREENS.includes(data.ui_action.screen)) {
            setBannerMessage(`Navigated to ${data.ui_action.screen} via AI.`);
            if (data.ui_action.screen === 'dashboard') navigate('/');
            else navigate(`/${data.ui_action.screen}`);
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
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error connecting to the Finora backend.' }]);
      
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
      lastResponse
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
