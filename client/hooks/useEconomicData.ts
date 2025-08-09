import { useQuery } from "@tanstack/react-query";
import { internalApi } from "@/services/internalApi";
import type { EconomicData } from "@/types/api";

/**
 * This part of the code creates a custom hook for economic intelligence data fetching
 * Follows the exact same pattern as useCostData for consistency
 */
export function useEconomicData() {
  return useQuery<EconomicData>({
    queryKey: ["economic-data"],
    queryFn: () => internalApi.getEconomicData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
