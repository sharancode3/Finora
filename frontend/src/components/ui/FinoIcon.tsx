import React from 'react';

interface FinoIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const FinoIcon: React.FC<FinoIconProps> = ({ size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'w-3.5 h-3.5 text-[8px] rounded-md',
    sm: 'w-4 h-4 text-[9px] rounded-md',
    md: 'w-5 h-5 text-[10px] rounded-lg',
    lg: 'w-6 h-6 text-xs rounded-xl'
  };

  return (
    <div 
      className={`bg-[#1E293B] text-white flex items-center justify-center font-bold font-mono select-none shrink-0 shadow-2xs ${sizeClasses[size]} ${className}`}
      aria-label="Finora AI Intelligence Indicator"
    >
      F
    </div>
  );
};
