import { useQuery, useQueryClient } from "@tanstack/react-query";
import { internalApi } from "@/services/internalApi";
import type { DashboardData } from "@/types/api";

/**
 * Main dashboard data hook with real-time updates
 * 5-minute auto-refresh, 2-minute stale time
 * 🔒 SECURE: Uses internal API - NO external keys exposed
 */
export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async (): Promise<DashboardData> => {
      console.log(
        "🔒 Client: Fetching optimized dashboard data (limited payload)...",
      );

      // Server handles all external API calls securely with LIMIT parameters
      const dashboardData = await internalApi.getDashboardData();

      console.log("✅ Client: Dashboard data loaded securely:", {
        products: dashboardData.products?.length || 0,
        shipments: dashboardData.shipments?.length || 0,
        insights: dashboardData.insights?.length || 0,
        anomalies: dashboardData.anomalies?.length || 0,
        marginRisks: dashboardData.marginRisks?.length || 0,
        costVariances: dashboardData.costVariances?.length || 0,
      });

      return dashboardData;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - data considered fresh
    refetchInterval: 5 * 60 * 1000, // 5 minutes - auto refresh
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    meta: {
      errorMessage:
        "Unable to load dashboard data - Refresh to retry or check API connection",
    },
  });
};

/**
 * Products data only (for pages that only need product info)
 * 🔒 SECURE: Uses internal API - NO external keys exposed
 */
export const useProductData = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => internalApi.getProductsData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    meta: {
      errorMessage:
        "Unable to load product data - Refresh to retry or check API connection",
    },
  });
};

/**
 * Shipments data only (for pages that only need shipment info)
 * 🔒 SECURE: Uses internal API - NO external keys exposed
 */
export const useShipmentData = () => {
  return useQuery({
    queryKey: ["shipments"],
    queryFn: () => internalApi.getShipmentsData(),
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    meta: {
      errorMessage:
        "Unable to load shipment data - Refresh to retry or check API connection",
    },
  });
};

/**
 * AI Insights generation (uses dashboard data for analysis)
 * 🔒 SECURE: Uses internal API - NO OpenAI keys exposed
 */
export const useAIInsights = () => {
  const { data: dashboardData } = useDashboardData();

  return useQuery({
    queryKey: ["ai-insights", dashboardData?.lastUpdated],
    queryFn: async () => {
      if (!dashboardData) {
        throw new Error("Dashboard data not available for AI analysis");
      }

      return internalApi.generateInsights({
        warehouseInventory: dashboardData.warehouseInventory,
        kpis: dashboardData.kpis,
        products: dashboardData.products,
        shipments: dashboardData.shipments,
      });
    },
    enabled: !!dashboardData, // Only run when dashboard data is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Fewer retries for AI insights
    meta: {
      errorMessage:
        "Unable to generate AI insights - Refresh to retry or check API connection",
    },
  });
};

/**
 * Manual refresh function for all dashboard data
 */
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();

  return {
    refreshAll: async () => {
      console.log("🔄 Manually refreshing all dashboard data...");

      // Invalidate all queries to force fresh fetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard-data"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["shipments"] }),
        queryClient.invalidateQueries({ queryKey: ["ai-insights"] }),
      ]);

      console.log("✅ All dashboard data refresh initiated");
    },

    refreshProducts: () => {
      return queryClient.invalidateQueries({ queryKey: ["products"] });
    },

    refreshShipments: () => {
      return queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },

    refreshInsights: () => {
      return queryClient.invalidateQueries({ queryKey: ["ai-insights"] });
    },
  };
};

/**
 * Get real-time connection status
 * 🔒 SECURE: Monitors internal API connection status
 */
export const useConnectionStatus = () => {
  const dashboardQuery = useDashboardData();

  return {
    isConnected: !dashboardQuery.isError && !dashboardQuery.isPending,
    isLoading: dashboardQuery.isPending,
    hasError: dashboardQuery.isError,
    error: dashboardQuery.error,
    lastUpdated: dashboardQuery.data?.lastUpdated,
    retry: dashboardQuery.refetch,
  };
};

/**
 * Server health check hook
 * 🔒 SECURE: Checks internal server status only
 */
export const useServerHealth = () => {
  return useQuery({
    queryKey: ["server-health"],
    queryFn: () => internalApi.healthCheck(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
    retry: 1, // Single retry for health checks
    meta: {
      errorMessage: "Unable to connect to server",
    },
  });
};
