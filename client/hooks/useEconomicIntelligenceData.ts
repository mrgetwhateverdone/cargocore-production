import { useQuery } from "@tanstack/react-query";
import { internalApi } from "@/services/internalApi";
import type { EconomicIntelligenceData } from "@/types/api";
import { useSettingsIntegration } from "./useSettingsIntegration";

/**
 * This part of the code creates a hook for economic intelligence data fetching
 * Uses real TinyBird data to analyze economic impacts and supplier performance
 */
export function useEconomicIntelligenceData() {
  const { getQueryConfig } = useSettingsIntegration();
  const queryConfig = getQueryConfig();

  return useQuery<EconomicIntelligenceData>({
    queryKey: ["economic-intelligence-data"],
    queryFn: async (): Promise<EconomicIntelligenceData> => {
      console.log("🌍 Client: Fetching economic intelligence data...");

      // This part of the code calls the server to fetch economic intelligence data securely
      const economicData = await internalApi.getEconomicIntelligenceData();

      console.log("✅ Client: Economic intelligence data loaded securely:", {
        kpis: economicData.kpis ? Object.keys(economicData.kpis).length : 0,
        insights: economicData.insights?.length || 0,
        businessImpact: economicData.businessImpact ? "Available" : "Not Available",
      });

      return economicData;
    },
    ...queryConfig, // This part of the code applies user's cache and refresh settings
    meta: {
      errorMessage:
        "Unable to load economic intelligence data - Refresh to retry or check API connection",
    },
  });
}
