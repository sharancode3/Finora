import React from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { AmountDisplay } from './AmountDisplay';
import { useTheme } from '../../context/ThemeContext';

interface BarChartProps {
  data: any[];
  xAxisKey: string;
  series: { key: string; name: string; color: string; }[];
  height?: number;
  className?: string;
  stacked?: boolean;
}

export const BarChart = ({ data, xAxisKey, series, height = 300, className = '', stacked = false }: BarChartProps) => {
  const { isDark, chartColors } = useTheme();
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
          <XAxis 
            dataKey={xAxisKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: isDark ? '#9CA3AF' : '#64748b', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: isDark ? '#9CA3AF' : '#64748b', fontSize: 12 }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            dx={-10}
          />
          <Tooltip 
            cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc' }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white dark:bg-[#151B24] border border-[#E4E4E7] dark:border-[#262D38] p-3 rounded-lg shadow-dropdown animate-in zoom-in-95 duration-200">
                    <p className="text-[12px] font-semibold text-slate-500 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 justify-between mt-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-[13px] text-slate-700 dark:text-slate-200">{entry.name}</span>
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
            <Bar 
              key={s.key}
              dataKey={s.key} 
              name={s.name} 
              fill={s.color} 
              radius={[4, 4, 0, 0]}
              stackId={stacked ? "stack" : undefined}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
