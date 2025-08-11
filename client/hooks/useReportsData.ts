import { useQuery } from "@tanstack/react-query";
import { internalApi } from "@/services/internalApi";
import type { ReportTemplatesResponse, ReportData, ReportFilters } from "@/types/api";
import { useSettingsIntegration } from "./useSettingsIntegration";

/**
 * This part of the code creates custom hooks for report data fetching
 * Follows the exact same pattern as other working hooks for consistency
 */

export function useReportTemplates() {
  const { getQueryConfig } = useSettingsIntegration();
  const queryConfig = getQueryConfig();

  return useQuery<ReportTemplatesResponse>({
    queryKey: ["report-templates"],
    queryFn: () => internalApi.getReportTemplates(),
    // This part of the code uses longer cache for templates since they rarely change
    staleTime: 30 * 60 * 1000, // 30 minutes - templates don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: false, // Never auto-refresh templates
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnMount: false, // Use cached templates
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useReportGeneration(filters: ReportFilters | null) {
  const { getQueryConfig } = useSettingsIntegration();
  const queryConfig = getQueryConfig();

  return useQuery<ReportData>({
    queryKey: ["report-generation", filters],
    queryFn: () => {
      if (!filters) {
        throw new Error("No filters provided for report generation");
      }
      return internalApi.generateReport(filters);
    },
    enabled: !!filters && !!filters.template, // Only run when filters are provided
    // This part of the code uses shorter cache for generated reports to ensure freshness
    staleTime: Math.min(queryConfig.staleTime || 2 * 60 * 1000, 2 * 60 * 1000), // Max 2 minutes for reports
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false, // Don't auto-refresh generated reports
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnMount: false, // Use cached reports
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
