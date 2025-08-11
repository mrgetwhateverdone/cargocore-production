import { useQuery } from "@tanstack/react-query";
import { internalApi } from "@/services/internalApi";
import type { CostData } from "@/types/api";
import { useSettingsIntegration } from "./useSettingsIntegration";

/**
 * This part of the code creates a custom hook for cost management data fetching
 * Now with settings-aware caching to respect user preferences
 */
export function useCostData() {
  const { getQueryConfig } = useSettingsIntegration();
  const queryConfig = getQueryConfig();

  return useQuery<CostData>({
    queryKey: ["cost-data"],
    queryFn: () => internalApi.getCostData(),
    ...queryConfig, // This part of the code applies user's cache and refresh settings
  });
}
