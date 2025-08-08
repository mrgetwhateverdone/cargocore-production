import { useQuery } from "@tanstack/react-query";
import { internalApi } from "@/services/internalApi";
import type { CostData } from "@/types/api";

/**
 * This part of the code creates a custom hook for cost management data fetching
 * Follows the exact same pattern as useInventoryData for consistency
 */
export function useCostData() {
  return useQuery<CostData>({
    queryKey: ["cost-data"],
    queryFn: () => internalApi.getCostData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
