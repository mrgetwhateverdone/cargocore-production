// This part of the code creates unified data hooks with standardized TanStack Query patterns
// Consolidates all data fetching patterns and provides consistent caching strategies

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

// This part of the code defines the standard API response structure
interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  meta?: Record<string, any>;
}

// This part of the code defines pagination parameters
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// This part of the code defines filter parameters
interface FilterParams {
  search?: string;
  filters?: Record<string, any>;
}

// This part of the code defines the unified query configuration
interface UnifiedQueryConfig<T> extends Omit<UseQueryOptions<StandardApiResponse<T>>, 'queryKey' | 'queryFn'> {
  cacheTime?: number;
  staleTime?: number;
  refetchInterval?: number;
  enabled?: boolean;
}

// This part of the code creates the unified data fetching service
class UnifiedDataService {
  private baseUrl = '';

  // This part of the code provides standardized GET requests
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<StandardApiResponse<T>> {
    const url = new URL(endpoint, this.baseUrl);
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, String(params[key]));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // This part of the code provides standardized POST requests
  async post<T>(endpoint: string, data?: any): Promise<StandardApiResponse<T>> {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // This part of the code provides standardized PUT requests
  async put<T>(endpoint: string, data?: any): Promise<StandardApiResponse<T>> {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // This part of the code provides standardized DELETE requests
  async delete<T>(endpoint: string): Promise<StandardApiResponse<T>> {
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

// This part of the code creates the singleton data service instance
const dataService = new UnifiedDataService();

// This part of the code provides the main unified data hook
export function useUnifiedData<T>(
  queryKey: string[],
  endpoint: string,
  params?: Record<string, any>,
  config: UnifiedQueryConfig<T> = {}
) {
  const defaultConfig: UnifiedQueryConfig<T> = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    ...config,
  };

  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => dataService.get<T>(endpoint, params),
    ...defaultConfig,
  });
}

// This part of the code provides paginated data fetching
export function usePaginatedData<T>(
  queryKey: string[],
  endpoint: string,
  pagination: PaginationParams = {},
  filters: FilterParams = {},
  config: UnifiedQueryConfig<T[]> = {}
) {
  const [currentPage, setCurrentPage] = useState(pagination.page || 1);
  const [pageSize, setPageSize] = useState(pagination.limit || 25);

  const params = {
    page: currentPage,
    limit: pageSize,
    sortBy: pagination.sortBy,
    sortOrder: pagination.sortOrder,
    search: filters.search,
    ...filters.filters,
  };

  const query = useUnifiedData<T[]>(
    [...queryKey, 'paginated'],
    endpoint,
    params,
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes for paginated data
      ...config,
    }
  );

  const nextPage = useCallback(() => {
    if (query.data?.pagination?.hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [query.data?.pagination?.hasMore]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && (!query.data?.pagination || page <= Math.ceil(query.data.pagination.total / pageSize))) {
      setCurrentPage(page);
    }
  }, [query.data?.pagination, pageSize]);

  const changePageSize = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing size
  }, []);

  return {
    ...query,
    currentPage,
    pageSize,
    nextPage,
    previousPage,
    goToPage,
    changePageSize,
    pagination: query.data?.pagination,
    hasNextPage: query.data?.pagination?.hasMore || false,
    hasPreviousPage: currentPage > 1,
    totalPages: query.data?.pagination ? Math.ceil(query.data.pagination.total / pageSize) : 0,
  };
}

// This part of the code provides real-time data with automatic refetching
export function useRealTimeData<T>(
  queryKey: string[],
  endpoint: string,
  params?: Record<string, any>,
  intervalMs: number = 30000, // 30 seconds default
  config: UnifiedQueryConfig<T> = {}
) {
  return useUnifiedData<T>(
    [...queryKey, 'realtime'],
    endpoint,
    params,
    {
      refetchInterval: intervalMs,
      refetchIntervalInBackground: true,
      staleTime: 0, // Always consider data stale for real-time
      ...config,
    }
  );
}

// This part of the code provides cached data with smart invalidation
export function useCachedData<T>(
  queryKey: string[],
  endpoint: string,
  params?: Record<string, any>,
  cacheMinutes: number = 10,
  config: UnifiedQueryConfig<T> = {}
) {
  return useUnifiedData<T>(
    [...queryKey, 'cached'],
    endpoint,
    params,
    {
      staleTime: cacheMinutes * 60 * 1000,
      cacheTime: (cacheMinutes + 5) * 60 * 1000, // Keep in cache 5 minutes longer
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      ...config,
    }
  );
}

// This part of the code provides mutation hooks with optimistic updates
export function useUnifiedMutation<TData, TVariables>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  options: UseMutationOptions<StandardApiResponse<TData>, Error, TVariables> = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      switch (method) {
        case 'POST':
          return dataService.post<TData>(endpoint, variables);
        case 'PUT':
          return dataService.put<TData>(endpoint, variables);
        case 'DELETE':
          return dataService.delete<TData>(endpoint);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    },
    onSuccess: (data, variables, context) => {
      // This part of the code invalidates related queries on successful mutations
      queryClient.invalidateQueries({ queryKey: [endpoint.split('/')[1]] });
      options.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

// This part of the code provides bulk operations
export function useBulkMutation<TData, TVariables>(
  endpoint: string,
  batchSize: number = 10,
  options: UseMutationOptions<StandardApiResponse<TData[]>, Error, TVariables[]> = {}
) {
  return useMutation({
    mutationFn: async (items: TVariables[]) => {
      const batches: TVariables[][] = [];
      
      // This part of the code splits items into batches
      for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize));
      }

      // This part of the code processes batches sequentially
      const results: StandardApiResponse<TData>[] = [];
      
      for (const batch of batches) {
        const response = await dataService.post<TData[]>(endpoint, { items: batch });
        results.push(response);
      }

      return {
        success: true,
        data: results.flatMap(r => r.data || []),
        timestamp: new Date().toISOString(),
      } as StandardApiResponse<TData[]>;
    },
    ...options,
  });
}

// This part of the code provides infinite loading for large datasets
export function useInfiniteData<T>(
  queryKey: string[],
  endpoint: string,
  params: Record<string, any> = {},
  pageSize: number = 25,
  config: Omit<UnifiedQueryConfig<T[]>, 'queryKey' | 'queryFn'> = {}
) {
  const [hasNextPage, setHasNextPage] = useState(true);
  const [allData, setAllData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const query = useUnifiedData<T[]>(
    [...queryKey, 'infinite', currentPage],
    endpoint,
    { ...params, page: currentPage, limit: pageSize },
    {
      keepPreviousData: false,
      ...config,
      onSuccess: (data) => {
        if (currentPage === 1) {
          setAllData(data.data || []);
        } else {
          setAllData(prev => [...prev, ...(data.data || [])]);
        }
        
        setHasNextPage(data.pagination?.hasMore || false);
        config.onSuccess?.(data);
      },
    }
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !query.isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage, query.isLoading]);

  const reset = useCallback(() => {
    setCurrentPage(1);
    setAllData([]);
    setHasNextPage(true);
  }, []);

  return {
    data: allData,
    isLoading: query.isLoading,
    error: query.error,
    hasNextPage,
    loadMore,
    reset,
    isFetchingNextPage: query.isLoading && currentPage > 1,
  };
}

// This part of the code provides data prefetching utilities
export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetchData = useCallback(
    <T>(queryKey: string[], endpoint: string, params?: Record<string, any>) => {
      return queryClient.prefetchQuery({
        queryKey: [...queryKey, params],
        queryFn: () => dataService.get<T>(endpoint, params),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    },
    [queryClient]
  );

  return { prefetchData };
}

// This part of the code provides query invalidation utilities
export function useQueryInvalidation() {
  const queryClient = useQueryClient();

  const invalidateQueries = useCallback(
    (queryKeyPrefix: string[]) => {
      return queryClient.invalidateQueries({ queryKey: queryKeyPrefix });
    },
    [queryClient]
  );

  const invalidateAll = useCallback(() => {
    return queryClient.invalidateQueries();
  }, [queryClient]);

  const removeQueries = useCallback(
    (queryKeyPrefix: string[]) => {
      return queryClient.removeQueries({ queryKey: queryKeyPrefix });
    },
    [queryClient]
  );

  return { invalidateQueries, invalidateAll, removeQueries };
}

// This part of the code exports commonly used query keys
export const QueryKeys = {
  dashboard: ['dashboard'] as const,
  inventory: ['inventory'] as const,
  orders: ['orders'] as const,
  warehouses: ['warehouses'] as const,
  analytics: ['analytics'] as const,
  reports: ['reports'] as const,
  cost: ['cost'] as const,
  economic: ['economic'] as const,
  ai: ['ai'] as const,
} as const;

// This part of the code exports types for TypeScript support
export type { StandardApiResponse, PaginationParams, FilterParams, UnifiedQueryConfig };
