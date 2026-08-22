import React, { useState } from 'react';
import { ChevronUp, ChevronDown, FolderOpen } from 'lucide-react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  expandable?: boolean;
  renderExpandedRow?: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T extends { id: string | number }>({ 
  columns, 
  data, 
  loading = false, 
  expandable = false, 
  renderExpandedRow,
  onRowClick,
  className = '' 
}: DataTableProps<T>) {
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a: any, b: any) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  if (loading) {
    return (
      <div className={`w-full overflow-hidden rounded-xl border border-border bg-surface ${className}`}>
        <div className="w-full">
          {/* Header Skeleton */}
          <div className="flex bg-muted/50 border-b border-border py-3 px-4">
            {columns.map(c => (
              <div key={c.key} className={`flex-1 ${c.align === 'right' ? 'flex justify-end' : ''}`}>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
          {/* Row Skeletons */}
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex border-b border-border py-4 px-4">
              {columns.map((c, idx) => (
                <div key={`${i}-${c.key}`} className={`flex-1 flex items-center ${c.align === 'right' ? 'justify-end' : ''}`}>
                  <Skeleton className={`h-5 ${idx === 0 ? 'w-32' : 'w-24'}`} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`w-full border border-border rounded-xl bg-surface ${className}`}>
        <EmptyState 
          icon={FolderOpen} 
          title="No records found" 
          description="There is no data available to display in this table."
        />
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-border bg-surface ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-background border-b border-border">
            {columns.map((col) => (
              <th 
                key={col.key} 
                className={`px-4 py-3 label ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.sortable ? 'cursor-pointer select-none hover:bg-slate-100' : ''}`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                  {col.header}
                  {col.sortable && (
                    <div className="flex flex-col text-slate-300">
                      <ChevronUp size={10} className={sortConfig?.key === col.key && sortConfig.direction === 'asc' ? 'text-slate-600' : ''} />
                      <ChevronDown size={10} className={sortConfig?.key === col.key && sortConfig.direction === 'desc' ? 'text-slate-600' : ''} />
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedData.map((item) => (
            <React.Fragment key={item.id}>
              <tr 
                className={`bg-surface hover:bg-background transition-colors ${expandable || onRowClick ? 'cursor-pointer' : ''} ${expandedId === item.id ? 'bg-background' : ''}`}
                onClick={() => {
                  if (onRowClick) onRowClick(item);
                  if (expandable) setExpandedId(expandedId === item.id ? null : item.id);
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-4 text-[14px] text-slate-600 ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
              {expandable && expandedId === item.id && renderExpandedRow && (
                <tr className="bg-muted/30 border-t border-border shadow-inner">
                  <td colSpan={columns.length} className="p-0">
                    <div className="overflow-hidden animate-in slide-in-from-top-4 duration-200">
                      {renderExpandedRow(item)}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
