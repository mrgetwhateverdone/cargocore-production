import { useQuery } from "@tanstack/react-query";
import { internalApi } from "@/services/internalApi";
import type { WarehousesData } from "@/types/api";
import { useSettingsIntegration } from "./useSettingsIntegration";

/**
 * This part of the code creates a TanStack Query hook for warehouse data management
 * Now properly integrated with caching and settings like all other data hooks
 */

export function useWarehousesData() {
  const { getQueryConfig } = useSettingsIntegration();
  const queryConfig = getQueryConfig();

  return useQuery<WarehousesData>({
    queryKey: ["warehouses-data"],
    queryFn: async (): Promise<WarehousesData> => {
      console.log("🏭 Client: Fetching warehouse data from secure API...");

      // This part of the code fetches comprehensive warehouse data via internal API
      const warehousesData = await internalApi.getWarehousesData();

      console.log("✅ Client: Warehouse data loaded successfully:", {
        warehouses: warehousesData.warehouses?.length || 0,
        insights: warehousesData.insights?.length || 0,
        optimizations: warehousesData.optimizations?.length || 0,
      });

      return warehousesData;
    },
    ...queryConfig, // This part of the code applies user's cache and refresh settings
    meta: {
      errorMessage:
        "Unable to load warehouse data - Refresh to retry or check API connection",
    },
  });
}