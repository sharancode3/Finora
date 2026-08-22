import React from 'react';

interface AmountDisplayProps {
  amount: number;
  className?: string;
  showSign?: boolean;
}

export const AmountDisplay = ({ amount, className = '', showSign = false }: AmountDisplayProps) => {
  const isNegative = amount < 0;
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedAmount = formatter.format(Math.abs(amount)).replace('₹', '');
  const prefix = isNegative ? '-₹' : (showSign && amount > 0 ? '+₹' : '₹');

  return (
    <span className={`font-mono ${isNegative ? 'text-danger font-semibold' : 'text-slate-900'} ${className}`}>
      {prefix}{formattedAmount}
    </span>
  );
};
