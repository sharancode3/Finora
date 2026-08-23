import React, { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  format?: (val: number) => string;
  duration?: number;
  className?: string;
}

/**
 * AnimatedNumber smoothly interpolates between previous value and new value over ~600ms
 * using an ease-out curve. Never resets to zero on filter/date range updates.
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  format = (val) => val.toLocaleString('en-IN'),
  duration = 600,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const prevValueRef = useRef<number>(value);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prevValueRef.current;
    const to = value;

    if (from === to) {
      setDisplayValue(to);
      return;
    }

    startTimeRef.current = null;

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // Calm, controlled ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(to);
        prevValueRef.current = to;
      }
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      prevValueRef.current = displayValue;
    };
  }, [value, duration]);

  return (
    <span className={`font-mono tabular-nums tracking-tight ${className}`}>
      {format(displayValue)}
    </span>
  );
};
