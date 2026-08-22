import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

// Global state for simplicity without Context
let toastListeners: ((toasts: ToastMessage[]) => void)[] = [];
let toasts: ToastMessage[] = [];

export const toast = {
  add: (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    toasts = [...toasts, { id, type, message }];
    toastListeners.forEach(listener => listener(toasts));
    
    setTimeout(() => {
      toast.remove(id);
    }, 4000); // auto-dismiss 4s
  },
  remove: (id: string) => {
    toasts = toasts.filter(t => t.id !== id);
    toastListeners.forEach(listener => listener(toasts));
  },
  success: (msg: string) => toast.add(msg, 'success'),
  error: (msg: string) => toast.add(msg, 'error'),
  info: (msg: string) => toast.add(msg, 'info'),
};

export const ToastContainer = () => {
  const [currentToasts, setCurrentToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (newToasts: ToastMessage[]) => setCurrentToasts(newToasts);
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  return (
    <div className="fixed top-6 right-6 z-[1000] flex flex-col gap-2 pointer-events-none">
      {currentToasts.map(t => {
        let bgColor = '', Icon = Info;
        if (t.type === 'success') { bgColor = 'bg-success'; Icon = CheckCircle2; }
        if (t.type === 'error') { bgColor = 'bg-danger'; Icon = AlertCircle; }
        if (t.type === 'info') { bgColor = 'bg-info'; Icon = Info; }

        return (
          <div 
            key={t.id} 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-dropdown text-white pointer-events-auto animate-in slide-in-from-right-8 duration-200 ${bgColor}`}
          >
            <Icon size={18} />
            <span className="text-[14px] font-medium">{t.message}</span>
            <button 
              onClick={() => toast.remove(t.id)}
              className="ml-2 hover:bg-white/20 p-0.5 rounded transition-colors focus:outline-none"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
