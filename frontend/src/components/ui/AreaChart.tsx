import React from 'react';
import { 
  AreaChart as RechartsAreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { AmountDisplay } from './AmountDisplay';

interface AreaChartProps {
  data: any[];
  xAxisKey: string;
  series: { key: string; name: string; color: string; fillOpacity?: number }[];
  height?: number;
  className?: string;
}

export const AreaChart = ({ data, xAxisKey, series, height = 300, className = '' }: AreaChartProps) => {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey={xAxisKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            dx={-10}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-surface border border-border p-3 rounded-lg shadow-dropdown animate-in zoom-in-95 duration-200">
                    <p className="text-[12px] font-semibold text-slate-500 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 justify-between mt-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-[13px] text-slate-700">{entry.name}</span>
                        </div>
                        <AmountDisplay amount={entry.value} />
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }}
          />
          {series.map((s) => (
            <Area 
              key={s.key}
              type="monotone" 
              dataKey={s.key} 
              name={s.name} 
              stroke={s.color} 
              fill={s.color} 
              fillOpacity={s.fillOpacity || 0.1} 
              strokeWidth={2}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};
