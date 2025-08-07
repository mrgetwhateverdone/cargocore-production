import { useQuery, useQueryClient } from "@tanstack/react-query";
import { internalApi } from "@/services/internalApi";
import type { AnalyticsData } from "@/types/api";

/**
 * Main analytics data hook with real-time updates
 * 5-minute auto-refresh, 2-minute stale time
 * 🔒 SECURE: Uses internal API - NO external keys exposed
 */
export const useAnalyticsData = () => {
  return useQuery({
    queryKey: ["analytics-data"],
    queryFn: async (): Promise<AnalyticsData> => {
      console.log(
        "🔒 Client: Fetching optimized analytics data (limited payload)...",
      );

      // This part of the code calls the server to fetch analytics data securely
      // Server handles all external API calls securely with LIMIT parameters
      const analyticsData = await internalApi.getAnalyticsData();

      console.log("✅ Client: Analytics data loaded securely:", {
        kpis: analyticsData.kpis ? Object.keys(analyticsData.kpis).length : 0,
        insights: analyticsData.insights?.length || 0,
        brandRankings: analyticsData.brandPerformance?.brandRankings?.length || 0,
      });

      return analyticsData;
    },
    staleTime: 2 * 60 * 1000, // This part of the code sets 2 minutes - data considered fresh
    refetchInterval: 5 * 60 * 1000, // This part of the code sets 5 minutes - auto refresh
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // This part of the code implements exponential backoff
    meta: {
      errorMessage:
        "Unable to load analytics data - Refresh to retry or check API connection",
    },
  });
};

/**
 * Manual refresh function for all analytics data
 */
export const useRefreshAnalytics = () => {
  const queryClient = useQueryClient();

  return {
    refreshAll: () => {
      // This part of the code invalidates and refetches all analytics-related queries
      console.log("🔄 Refreshing all analytics data...");
      queryClient.invalidateQueries({ queryKey: ["analytics-data"] });
    },
  };
};

/**
 * Get real-time analytics connection status
 * 🔒 SECURE: Monitors internal API connection status
 */
export const useAnalyticsConnectionStatus = () => {
  const analyticsQuery = useAnalyticsData();

  return {
    isConnected: !analyticsQuery.isError && !analyticsQuery.isPending,
    isLoading: analyticsQuery.isPending,
    hasError: analyticsQuery.isError,
    error: analyticsQuery.error,
    lastUpdated: analyticsQuery.data?.lastUpdated,
    retry: analyticsQuery.refetch,
  };
};
