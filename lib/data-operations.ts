// This part of the code creates optimized data operations for performance
// Replaces heavy array operations with efficient alternatives

// This part of the code defines pagination parameters
interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// This part of the code defines pagination result
interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    hasPrevious: boolean;
  };
}

// This part of the code defines filter configuration
interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in';
  value: any;
}

// This part of the code provides optimized data operations
export class DataProcessor {
  // This part of the code implements efficient pagination without loading entire dataset
  static paginate<T>(
    data: T[],
    params: PaginationParams
  ): PaginatedResult<T> {
    const { page = 1, limit = 25, sortBy, sortOrder = 'asc' } = params;
    
    // This part of the code calculates pagination bounds
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    
    // This part of the code sorts data if sortBy is provided
    let processedData = data;
    if (sortBy) {
      processedData = this.sortData(data, sortBy, sortOrder);
    }
    
    // This part of the code extracts the page slice
    const pageData = processedData.slice(startIndex, endIndex);
    
    return {
      data: pageData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
        hasPrevious: page > 1
      }
    };
  }

  // This part of the code implements efficient sorting with type safety
  static sortData<T>(
    data: T[],
    sortBy: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): T[] {
    return [...data].sort((a, b) => {
      const aValue = this.getNestedValue(a, sortBy);
      const bValue = this.getNestedValue(b, sortBy);
      
      // This part of the code handles different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        const comparison = aValue.getTime() - bValue.getTime();
        return sortOrder === 'asc' ? comparison : -comparison;
      }
      
      // This part of the code handles mixed types
      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.localeCompare(bStr);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  // This part of the code implements efficient filtering with multiple conditions
  static filterData<T>(
    data: T[],
    filters: FilterConfig[]
  ): T[] {
    if (filters.length === 0) return data;
    
    return data.filter(item => {
      return filters.every(filter => {
        const value = this.getNestedValue(item, filter.field);
        return this.applyFilter(value, filter.operator, filter.value);
      });
    });
  }

  // This part of the code implements search functionality with performance optimization
  static searchData<T>(
    data: T[],
    searchTerm: string,
    searchFields: string[]
  ): T[] {
    if (!searchTerm.trim()) return data;
    
    const normalizedTerm = searchTerm.toLowerCase().trim();
    
    return data.filter(item => {
      return searchFields.some(field => {
        const value = this.getNestedValue(item, field);
        const normalizedValue = String(value).toLowerCase();
        return normalizedValue.includes(normalizedTerm);
      });
    });
  }

  // This part of the code implements efficient grouping operations
  static groupBy<T>(
    data: T[],
    groupField: string
  ): Map<string, T[]> {
    const groups = new Map<string, T[]>();
    
    for (const item of data) {
      const key = String(this.getNestedValue(item, groupField));
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      
      groups.get(key)!.push(item);
    }
    
    return groups;
  }

  // This part of the code implements efficient aggregation operations
  static aggregate<T>(
    data: T[],
    aggregations: {
      field: string;
      operation: 'sum' | 'avg' | 'min' | 'max' | 'count';
    }[]
  ): Record<string, number> {
    const results: Record<string, number> = {};
    
    for (const agg of aggregations) {
      const values = data
        .map(item => this.getNestedValue(item, agg.field))
        .filter(value => typeof value === 'number' && !isNaN(value));
      
      switch (agg.operation) {
        case 'sum':
          results[`${agg.field}_sum`] = values.reduce((sum, val) => sum + val, 0);
          break;
        case 'avg':
          results[`${agg.field}_avg`] = values.length > 0 
            ? values.reduce((sum, val) => sum + val, 0) / values.length 
            : 0;
          break;
        case 'min':
          results[`${agg.field}_min`] = values.length > 0 ? Math.min(...values) : 0;
          break;
        case 'max':
          results[`${agg.field}_max`] = values.length > 0 ? Math.max(...values) : 0;
          break;
        case 'count':
          results[`${agg.field}_count`] = values.length;
          break;
      }
    }
    
    return results;
  }

  // This part of the code implements data deduplication
  static deduplicate<T>(
    data: T[],
    uniqueField: string
  ): T[] {
    const seen = new Set<string>();
    const result: T[] = [];
    
    for (const item of data) {
      const key = String(this.getNestedValue(item, uniqueField));
      
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }
    
    return result;
  }

  // This part of the code implements efficient data transformation
  static transform<T, R>(
    data: T[],
    transformer: (item: T, index: number) => R
  ): R[] {
    const result: R[] = new Array(data.length);
    
    for (let i = 0; i < data.length; i++) {
      result[i] = transformer(data[i], i);
    }
    
    return result;
  }

  // This part of the code implements batch processing for large datasets
  static async processBatches<T, R>(
    data: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<R[]>
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
    }
    
    return results;
  }

  // This part of the code safely gets nested object values
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // This part of the code applies filter operations
  private static applyFilter(value: any, operator: FilterConfig['operator'], filterValue: any): boolean {
    switch (operator) {
      case 'eq':
        return value === filterValue;
      case 'ne':
        return value !== filterValue;
      case 'gt':
        return typeof value === 'number' && value > filterValue;
      case 'gte':
        return typeof value === 'number' && value >= filterValue;
      case 'lt':
        return typeof value === 'number' && value < filterValue;
      case 'lte':
        return typeof value === 'number' && value <= filterValue;
      case 'contains':
        return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
      case 'startsWith':
        return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
      case 'endsWith':
        return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
      case 'in':
        return Array.isArray(filterValue) && filterValue.includes(value);
      default:
        return false;
    }
  }
}

// This part of the code provides caching utilities for data operations
export class DataCache {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  // This part of the code sets cached data with TTL
  static set(key: string, data: any, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    });
  }

  // This part of the code gets cached data if not expired
  static get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  // This part of the code clears specific cache entries
  static clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // This part of the code gets cache statistics
  static getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // This part of the code creates cache keys
  static createKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    
    return `${prefix}:${sortedParams}`;
  }
}

// This part of the code provides performance monitoring utilities
export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  // This part of the code starts a performance timer
  static start(label: string): void {
    this.timers.set(label, performance.now());
  }

  // This part of the code ends a performance timer and returns duration
  static end(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.timers.delete(label);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  // This part of the code measures function execution time
  static async measure<T>(label: string, fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    this.start(label);
    const result = await fn();
    const duration = this.end(label);
    
    return { result, duration };
  }
}

// This part of the code exports types and interfaces
export type { PaginationParams, PaginatedResult, FilterConfig };
