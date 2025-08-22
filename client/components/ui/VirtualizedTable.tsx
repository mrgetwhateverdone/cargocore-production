// This part of the code creates a virtualized table component for large datasets
// Renders only visible rows to maintain performance with thousands of records

import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loading-spinner';
import { Button } from './button';
import { ChevronUp, ChevronDown, Search, Filter } from 'lucide-react';

// This part of the code defines the column configuration
interface VirtualizedColumn<T> {
  key: string;
  title: string;
  width: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  accessor?: (row: T) => any;
}

// This part of the code defines the table configuration
interface VirtualizedTableProps<T> {
  data: T[];
  columns: VirtualizedColumn<T>[];
  height?: number;
  rowHeight?: number;
  isLoading?: boolean;
  onRowClick?: (row: T, index: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, string>) => void;
  className?: string;
  stickyHeader?: boolean;
  zebra?: boolean;
  searchable?: boolean;
  filterable?: boolean;
}

// This part of the code defines the sort state
interface SortState {
  column: string | null;
  direction: 'asc' | 'desc';
}

// This part of the code creates the virtualized table component
export function VirtualizedTable<T>({
  data,
  columns,
  height = 400,
  rowHeight = 48,
  isLoading = false,
  onRowClick,
  onSort,
  onFilter,
  className,
  stickyHeader = true,
  zebra = true,
  searchable = false,
  filterable = false
}: VirtualizedTableProps<T>) {
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: 'asc' });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const listRef = useRef<List>(null);

  // This part of the code calculates total table width
  const totalWidth = useMemo(() => {
    return columns.reduce((sum, col) => sum + col.width, 0);
  }, [columns]);

  // This part of the code filters and sorts data
  const processedData = useMemo(() => {
    let result = [...data];

    // This part of the code applies search filter
    if (searchTerm && searchable) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(row => {
        return columns.some(col => {
          const value = col.accessor ? col.accessor(row) : (row as any)[col.key];
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    // This part of the code applies column filters
    if (filterable && Object.keys(filters).length > 0) {
      result = result.filter(row => {
        return Object.entries(filters).every(([key, filterValue]) => {
          if (!filterValue) return true;
          const column = columns.find(col => col.key === key);
          if (!column) return true;
          
          const value = column.accessor ? column.accessor(row) : (row as any)[key];
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        });
      });
    }

    // This part of the code applies sorting
    if (sortState.column) {
      const column = columns.find(col => col.key === sortState.column);
      if (column) {
        result.sort((a, b) => {
          const aValue = column.accessor ? column.accessor(a) : (a as any)[column.key];
          const bValue = column.accessor ? column.accessor(b) : (b as any)[column.key];
          
          let comparison = 0;
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
          } else if (aValue instanceof Date && bValue instanceof Date) {
            comparison = aValue.getTime() - bValue.getTime();
          } else {
            comparison = String(aValue).localeCompare(String(bValue));
          }
          
          return sortState.direction === 'asc' ? comparison : -comparison;
        });
      }
    }

    return result;
  }, [data, columns, sortState, filters, searchTerm, searchable, filterable]);

  // This part of the code handles column sorting
  const handleSort = useCallback((columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    const newDirection = sortState.column === columnKey && sortState.direction === 'asc' ? 'desc' : 'asc';
    const newSortState = { column: columnKey, direction: newDirection };
    
    setSortState(newSortState);
    onSort?.(columnKey, newDirection);
  }, [columns, sortState, onSort]);

  // This part of the code handles filter changes
  const handleFilterChange = useCallback((columnKey: string, value: string) => {
    const newFilters = { ...filters, [columnKey]: value };
    if (!value) {
      delete newFilters[columnKey];
    }
    
    setFilters(newFilters);
    onFilter?.(newFilters);
  }, [filters, onFilter]);

  // This part of the code renders table rows
  const Row = useCallback(({ index, style }: ListChildComponentProps) => {
    const row = processedData[index];
    if (!row) return null;

    return (
      <div
        style={style}
        className={cn(
          'flex items-center border-b border-gray-200 hover:bg-gray-50 cursor-pointer',
          zebra && index % 2 === 1 && 'bg-gray-25',
          onRowClick && 'hover:bg-blue-50'
        )}
        onClick={() => onRowClick?.(row, index)}
      >
        {columns.map((column, colIndex) => {
          const value = column.accessor ? column.accessor(row) : (row as any)[column.key];
          
          return (
            <div
              key={column.key}
              className="flex items-center px-4 py-3 text-sm text-gray-900 truncate"
              style={{ width: column.width, minWidth: column.width }}
            >
              {column.render ? column.render(value, row, index) : String(value || '')}
            </div>
          );
        })}
      </div>
    );
  }, [processedData, columns, zebra, onRowClick]);

  // This part of the code renders the table header
  const renderHeader = () => (
    <div
      className={cn(
        'flex bg-gray-50 border-b border-gray-200',
        stickyHeader && 'sticky top-0 z-10'
      )}
      style={{ width: totalWidth }}
    >
      {columns.map(column => (
        <div
          key={column.key}
          className="flex items-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
          style={{ width: column.width, minWidth: column.width }}
        >
          <div
            className={cn(
              'flex items-center',
              column.sortable && 'cursor-pointer hover:text-gray-700'
            )}
            onClick={() => column.sortable && handleSort(column.key)}
          >
            <span className="truncate">{column.title}</span>
            {column.sortable && (
              <div className="ml-1 flex flex-col">
                <ChevronUp 
                  className={cn(
                    'h-3 w-3',
                    sortState.column === column.key && sortState.direction === 'asc'
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  )}
                />
                <ChevronDown 
                  className={cn(
                    'h-3 w-3 -mt-1',
                    sortState.column === column.key && sortState.direction === 'desc'
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  )}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // This part of the code renders filter inputs
  const renderFilters = () => {
    if (!filterable) return null;

    return (
      <div className="flex bg-white border-b border-gray-200" style={{ width: totalWidth }}>
        {columns.map(column => (
          <div
            key={`filter-${column.key}`}
            className="px-4 py-2"
            style={{ width: column.width, minWidth: column.width }}
          >
            {column.filterable && (
              <input
                type="text"
                placeholder={`Filter ${column.title.toLowerCase()}...`}
                value={filters[column.key] || ''}
                onChange={(e) => handleFilterChange(column.key, e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // This part of the code renders search input
  const renderSearch = () => {
    if (!searchable) return null;

    return (
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search across all columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    );
  };

  // This part of the code renders loading state
  if (isLoading) {
    return (
      <div className={cn('border border-gray-200 rounded-lg', className)} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading data...</span>
        </div>
      </div>
    );
  }

  // This part of the code renders empty state
  if (processedData.length === 0) {
    return (
      <div className={cn('border border-gray-200 rounded-lg', className)} style={{ height }}>
        {renderSearch()}
        {renderHeader()}
        {renderFilters()}
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-2">No data available</div>
            <div className="text-gray-500 text-sm">
              {data.length === 0 ? 'No records found' : 'No records match your filters'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('border border-gray-200 rounded-lg overflow-hidden', className)}>
      {renderSearch()}
      
      <div style={{ height: height - (searchable ? 72 : 0) - (filterable ? 44 : 0) }}>
        {renderHeader()}
        {renderFilters()}
        
        <List
          ref={listRef}
          height={height - (searchable ? 72 : 0) - (filterable ? 44 : 0) - 48} // Subtract header height
          itemCount={processedData.length}
          itemSize={rowHeight}
          width={totalWidth}
          overscanCount={10} // Render extra rows for smooth scrolling
        >
          {Row}
        </List>
      </div>

      {/* This part of the code renders data summary */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        Showing {processedData.length} of {data.length} records
        {Object.keys(filters).length > 0 && ' (filtered)'}
        {searchTerm && ' (searched)'}
      </div>
    </div>
  );
}

// This part of the code provides a simplified virtualized list component
interface VirtualizedListProps<T> {
  data: T[];
  height?: number;
  itemHeight?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  isLoading?: boolean;
  className?: string;
  onItemClick?: (item: T, index: number) => void;
}

export function VirtualizedList<T>({
  data,
  height = 400,
  itemHeight = 64,
  renderItem,
  isLoading = false,
  className,
  onItemClick
}: VirtualizedListProps<T>) {
  const ListItem = useCallback(({ index, style }: ListChildComponentProps) => {
    const item = data[index];
    if (!item) return null;

    return (
      <div
        style={style}
        className={cn(
          'border-b border-gray-200 hover:bg-gray-50',
          onItemClick && 'cursor-pointer hover:bg-blue-50'
        )}
        onClick={() => onItemClick?.(item, index)}
      >
        {renderItem(item, index)}
      </div>
    );
  }, [data, renderItem, onItemClick]);

  if (isLoading) {
    return (
      <div className={cn('border border-gray-200 rounded-lg flex items-center justify-center', className)} style={{ height }}>
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('border border-gray-200 rounded-lg flex items-center justify-center', className)} style={{ height }}>
        <div className="text-center text-gray-500">
          <div className="text-lg mb-1">No items found</div>
          <div className="text-sm">There are no items to display</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('border border-gray-200 rounded-lg overflow-hidden', className)}>
      <List
        height={height}
        itemCount={data.length}
        itemSize={itemHeight}
        overscanCount={5}
      >
        {ListItem}
      </List>
    </div>
  );
}

// This part of the code exports utility functions for virtualization
export const VirtualizationUtils = {
  // This part of the code calculates optimal row height
  calculateOptimalRowHeight(contentHeight: number, padding: number = 16): number {
    return Math.max(contentHeight + padding, 32); // Minimum 32px height
  },

  // This part of the code calculates visible range
  calculateVisibleRange(scrollTop: number, containerHeight: number, itemHeight: number): { start: number; end: number } {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = start + visibleCount;
    
    return { start, end };
  },

  // This part of the code creates column configurations for common data types
  createColumn<T>(
    key: string,
    title: string,
    width: number,
    options: {
      sortable?: boolean;
      filterable?: boolean;
      format?: 'currency' | 'percentage' | 'date' | 'number';
      render?: (value: any, row: T, index: number) => React.ReactNode;
    } = {}
  ): VirtualizedColumn<T> {
    const formatters = {
      currency: (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0),
      percentage: (value: number) => `${(value || 0).toFixed(1)}%`,
      date: (value: string | Date) => new Date(value).toLocaleDateString(),
      number: (value: number) => (value || 0).toLocaleString(),
    };

    return {
      key,
      title,
      width,
      sortable: options.sortable ?? true,
      filterable: options.filterable ?? true,
      render: options.render || (options.format ? (value) => formatters[options.format!](value) : undefined),
    };
  }
};

// This part of the code exports types for external use
export type { VirtualizedColumn, VirtualizedTableProps, VirtualizedListProps };
