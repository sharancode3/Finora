import React, { useEffect, useState, useRef } from 'react';

interface AmountDisplayProps {
  amount: number;
  className?: string;
  showSign?: boolean;
  animated?: boolean;
  duration?: number;
}

/**
 * AmountDisplay formats financial numbers using Indian numbering format (lakhs/crores)
 * with fixed-width tabular numerals (`font-mono tabular-nums`) to prevent vertical jitter.
 * When `animated={true}`, counts up smoothly from 0 to the target value over 600ms.
 */
export const AmountDisplay: React.FC<AmountDisplayProps> = ({ 
  amount, 
  className = '', 
  showSign = false,
  animated = false,
  duration = 600
}) => {
  const [displayValue, setDisplayValue] = useState<number>(amount);
  const prevValRef = useRef<number>(amount);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animated) {
      setDisplayValue(amount);
      prevValRef.current = amount;
      return;
    }

    const startVal = prevValRef.current;
    const targetVal = amount;

    if (startVal === targetVal) {
      setDisplayValue(targetVal);
      return;
    }

    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // Calm, controlled ease-out cubic (fintech standard)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (targetVal - startVal) * easeOut;
      
      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetVal);
        prevValRef.current = targetVal;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      prevValRef.current = displayValue;
    };
  }, [amount, animated, duration]);

  const isNegative = displayValue < 0;
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedAmount = formatter.format(Math.abs(displayValue)).replace('₹', '');
  const prefix = isNegative ? '-₹' : (showSign && displayValue > 0 ? '+₹' : '₹');

  return (
    <span className={`font-mono tabular-nums tracking-tight ${isNegative ? 'text-rose-600 font-bold' : 'text-inherit'} ${className}`}>
      {prefix}{formattedAmount}
    </span>
  );
};
