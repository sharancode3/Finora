import React from 'react';

export interface ProgressRingData {
  label: string;
  value: number;
  color: string; // e.g., '#10B981'
}

interface ProgressRingProps {
  data: ProgressRingData[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
  className?: string;
}

export const ProgressRing = ({ 
  data, 
  size = 200, 
  strokeWidth = 16, 
  centerLabel,
  centerValue,
  className = '' 
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  
  let currentOffset = 0;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Ring */}
        <svg width={size} height={size} className="transform -rotate-90 absolute top-0 left-0">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#e2e8f0" /* border slate-200 */
            strokeWidth={strokeWidth}
          />
        </svg>
        
        {/* Data Rings */}
        <svg width={size} height={size} className="transform -rotate-90 absolute top-0 left-0">
          {data.map((item, index) => {
            const strokeDasharray = circumference;
            const strokeDashoffset = total > 0 ? circumference - (item.value / total) * circumference : circumference;
            const offset = currentOffset;
            
            // Advance offset for next segment
            currentOffset += total > 0 ? (item.value / total) * circumference : 0;
            
            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap={item.value === total ? 'round' : 'butt'}
                style={{
                  transformOrigin: '50% 50%',
                  transform: `rotate(${(offset / circumference) * 360}deg)`,
                  transition: 'stroke-dashoffset 0.5s ease-in-out'
                }}
              />
            );
          })}
        </svg>
        
        {/* Center Text */}
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {centerValue && <div className="text-3xl font-bold font-mono text-slate-900">{centerValue}</div>}
            {centerLabel && <div className="text-sm font-semibold uppercase tracking-wider text-slate-500">{centerLabel}</div>}
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[13px] text-slate-600 font-medium">{item.label}</span>
            <span className="text-[13px] font-mono text-slate-900 ml-1">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
