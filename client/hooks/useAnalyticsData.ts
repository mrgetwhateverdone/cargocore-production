import { useQuery, useQueryClient } from "@tanstack/react-query";
import { internalApi } from "@/services/internalApi";
import type { AnalyticsData } from "@/types/api";
import { useSettingsIntegration } from "./useSettingsIntegration";

/**
 * Main analytics data hook with settings-aware caching
 * Respects user's refresh interval preferences and cache settings
 * 🔒 SECURE: Uses internal API - NO external keys exposed
 */
export const useAnalyticsData = () => {
  const { getQueryConfig } = useSettingsIntegration();
  const queryConfig = getQueryConfig();

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
    ...queryConfig, // This part of the code applies user's cache and refresh settings
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
