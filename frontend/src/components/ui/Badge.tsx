import React from 'react';

type BadgeVariant = 'default' | 'outline' | 'success' | 'warning' | 'error';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ children, variant = 'default', className = '', ...props }: BadgeProps) {
  let variantStyles = '';
  
  switch (variant) {
    case 'default':
      variantStyles = 'bg-slate-100 text-slate-800';
      break;
    case 'outline':
      variantStyles = 'border border-slate-200 text-slate-800 bg-transparent';
      break;
    case 'success':
      variantStyles = 'bg-emerald-100 text-emerald-800';
      break;
    case 'warning':
      variantStyles = 'bg-amber-100 text-amber-800';
      break;
    case 'error':
      variantStyles = 'bg-rose-100 text-rose-800';
      break;
  }

  return (
    <span 
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
