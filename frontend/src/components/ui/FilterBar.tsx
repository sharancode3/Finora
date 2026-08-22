import React from 'react';
import { X } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  options: FilterOption[];
  activeFilter: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

export const FilterBar = ({ options, activeFilter, onChange, className = '' }: FilterBarProps) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {options.map((opt) => {
        const isActive = activeFilter === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(isActive ? null : opt.value)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors border ${
              isActive 
                ? 'bg-primary-accent border-primary-accent text-white shadow-sm' 
                : 'bg-surface border-border text-slate-600 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
      
      {activeFilter && (
        <button
          onClick={() => onChange(null)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <X size={14} />
          Clear Filter
        </button>
      )}
    </div>
  );
};
