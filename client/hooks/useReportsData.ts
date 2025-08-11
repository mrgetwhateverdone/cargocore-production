import { useQuery } from "@tanstack/react-query";
import { internalApi } from "@/services/internalApi";
import type { ReportTemplatesResponse, ReportData, ReportFilters } from "@/types/api";

/**
 * This part of the code creates custom hooks for report data fetching
 * Follows the exact same pattern as other working hooks for consistency
 */

export function useReportTemplates() {
  return useQuery<ReportTemplatesResponse>({
    queryKey: ["report-templates"],
    queryFn: () => internalApi.getReportTemplates(),
    staleTime: 30 * 60 * 1000, // 30 minutes - templates don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useReportGeneration(filters: ReportFilters | null) {
  return useQuery<ReportData>({
    queryKey: ["report-generation", filters],
    queryFn: () => {
      if (!filters) {
        throw new Error("No filters provided for report generation");
      }
      return internalApi.generateReport(filters);
    },
    enabled: !!filters && !!filters.template, // Only run when filters are provided
    staleTime: 2 * 60 * 1000, // 2 minutes - reports should be fresh
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
