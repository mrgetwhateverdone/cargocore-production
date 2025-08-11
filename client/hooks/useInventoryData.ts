import { useQuery, useQueryClient } from "@tanstack/react-query";
import { internalApi } from "@/services/internalApi";
import type { InventoryData } from "@/types/api";
import { useSettingsIntegration } from "./useSettingsIntegration";

/**
 * Main inventory data hook with settings-aware caching
 * Respects user's refresh interval preferences and cache settings
 * 🔒 SECURE: Uses internal API - NO external keys exposed
 */
export const useInventoryData = () => {
  const { getQueryConfig } = useSettingsIntegration();
  const queryConfig = getQueryConfig();

  return useQuery({
    queryKey: ["inventory-data"],
    queryFn: async (): Promise<InventoryData> => {
      console.log(
        "🔒 Client: Fetching optimized inventory data (limited payload)...",
      );

      // This part of the code calls the server to fetch inventory data securely
      // Server transforms product data into inventory structure with proper mappings
      const inventoryData = await internalApi.getInventoryData();

      console.log("✅ Client: Inventory data loaded securely:", {
        inventory: inventoryData.inventory?.length || 0,
        kpis: inventoryData.kpis ? Object.keys(inventoryData.kpis).length : 0,
        insights: inventoryData.insights?.length || 0,
      });

      return inventoryData;
    },
    ...queryConfig, // This part of the code applies user's cache and refresh settings
    meta: {
      errorMessage:
        "Unable to load inventory data - Refresh to retry or check API connection",
    },
  });
};

/**
 * Inventory table hook for pagination and view management
 * 🔒 SECURE: Client-side data management for table display
 */
export const useInventoryTable = (inventory: any[] = [], pageSize: number = 15) => {
  return useQuery({
    queryKey: ["inventory-table", inventory.length, pageSize],
    queryFn: () => {
      // This part of the code processes inventory data for table display
      const displayInventory = inventory.slice(0, pageSize);
      const hasMore = inventory.length > pageSize;

      console.log(
        `🔒 Client: Inventory table prepared - showing ${displayInventory.length} of ${inventory.length} SKUs`,
      );

      return {
        displayInventory,
        hasMore,
        totalCount: inventory.length,
      };
    },
    enabled: true,
    staleTime: Infinity, // This part of the code keeps data fresh as long as source data hasn't changed
    retry: 1,
  });
};

/**
 * Get real-time inventory connection status
 * 🔒 SECURE: Monitors internal API connection status
 */
export const useInventoryConnectionStatus = () => {
  const inventoryQuery = useInventoryData();

  return {
    isConnected: !inventoryQuery.isError,
    isLoading: inventoryQuery.isLoading,
    error: inventoryQuery.error,
    lastUpdated: inventoryQuery.dataUpdatedAt,
    refetch: inventoryQuery.refetch,
  };
};

/**
 * Inventory query invalidation utility
 * 🔒 SECURE: Cache management for inventory data
 */
export const useInventoryRefresh = () => {
  const queryClient = useQueryClient();

  return {
    refreshInventory: () => {
      console.log("🔒 Client: Forcing inventory data refresh...");
      queryClient.invalidateQueries({ queryKey: ["inventory-data"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-table"] });
    },
    clearInventoryCache: () => {
      console.log("🔒 Client: Clearing inventory cache...");
      queryClient.removeQueries({ queryKey: ["inventory-data"] });
      queryClient.removeQueries({ queryKey: ["inventory-table"] });
    },
  };
};
