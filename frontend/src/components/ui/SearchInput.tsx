import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
}

export const SearchInput = ({ value, onChange, onClear, className = '', ...props }: SearchInputProps) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 text-secondary" size={16} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface border border-border rounded-lg pl-9 pr-9 py-2 text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-accent focus:ring-1 focus:ring-primary-accent transition-colors shadow-sm"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
