import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, className = '', ...props }, ref) => {
    let variantStyles = '';
    
    switch (variant) {
      case 'primary':
        variantStyles = 'bg-primary-accent text-white hover:bg-primary-accent-hover shadow-sm';
        break;
      case 'secondary':
        variantStyles = 'bg-surface text-slate-700 border border-border hover:bg-slate-50 shadow-sm';
        break;
      case 'danger':
        variantStyles = 'bg-surface text-danger border border-danger hover:bg-danger/5 shadow-sm';
        break;
      case 'ghost':
        variantStyles = 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100';
        break;
      case 'outline':
        variantStyles = 'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm';
        break;
    }

    let sizeStyles = '';
    switch (size) {
      case 'sm':
        sizeStyles = 'px-3 py-1.5 text-xs';
        break;
      case 'md':
        sizeStyles = 'px-4 py-2.5 text-[14px]';
        break;
      case 'lg':
        sizeStyles = 'px-6 py-3 text-[15px]';
        break;
    }

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150 ease-out active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

