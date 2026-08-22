import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div 
      className={`bg-slate-200 animate-pulse rounded-md ${className}`} 
      style={{ animationDuration: '1.5s' }}
    />
  );
};
