import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface WhyButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const WhyButton = ({ children, onClick, className = '' }: WhyButtonProps) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick();
    if (children) {
      setExpanded(!expanded);
    }
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <button 
        onClick={handleClick}
        className="inline-flex items-center gap-1 text-[12px] font-semibold text-info hover:text-sky-700 hover:underline transition-colors focus:outline-none"
      >
        <HelpCircle size={12} />
        Why?
      </button>
      
      {expanded && children && (
        <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};
