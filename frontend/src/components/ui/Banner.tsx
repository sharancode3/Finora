import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface BannerProps {
  message: string;
  onClose: () => void;
  className?: string;
}

export const Banner = ({ message, onClose, className = '' }: BannerProps) => {
  return (
    <div className={`fixed top-0 left-0 right-0 z-[600] bg-[#15803D] text-white px-4 py-2 flex items-center justify-between shadow-md animate-in slide-in-from-top duration-300 ${className}`}>
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full px-4">
        <CheckCircle2 size={16} className="text-white/90" />
        <span className="text-[14px] font-medium">{message}</span>
        <div className="flex-1" />
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-md transition-colors focus:outline-none cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
