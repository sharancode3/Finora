import React from 'react';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-surface rounded-xl shadow-card hover:shadow-card-hover border border-border ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }: CardProps) => (
  <div className={`p-6 border-b border-border ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }: CardProps) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }: CardProps) => (
  <div className={`p-6 border-t border-border bg-muted/30 rounded-b-xl ${className}`}>
    {children}
  </div>
);
