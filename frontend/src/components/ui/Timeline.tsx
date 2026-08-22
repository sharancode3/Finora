import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface TimelineNode {
  id: string;
  title: string;
  subtitle?: string;
  timestamp: string;
  icon?: LucideIcon;
  statusColor?: string; // e.g. 'bg-success', 'bg-alert'
}

interface TimelineProps {
  nodes: TimelineNode[];
  className?: string;
}

export const Timeline = ({ nodes, className = '' }: TimelineProps) => {
  if (!nodes || nodes.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Vertical line connecting nodes */}
      <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-border z-0" />
      
      <div className="space-y-6 relative z-10">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          const isLast = index === nodes.length - 1;
          
          return (
            <div key={node.id} className="flex items-start gap-4">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-surface border-2 border-border shrink-0`}>
                  {Icon && <Icon size={18} className="text-slate-500" />}
                </div>
                {node.statusColor && (
                  <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-surface ${node.statusColor}`} />
                )}
              </div>
              
              <div className="flex-1 pt-2 pb-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-[14px] font-semibold text-slate-900">{node.title}</h4>
                    {node.subtitle && <p className="text-[13px] text-slate-500 mt-0.5">{node.subtitle}</p>}
                  </div>
                  <span className="text-[12px] font-medium text-slate-400 whitespace-nowrap">{node.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
