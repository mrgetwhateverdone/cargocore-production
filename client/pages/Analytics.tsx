import { Layout } from "@/components/layout/Layout";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-display";

// Analytics Components
import { AnalyticsKPISection } from "@/components/analytics/AnalyticsKPISection";
import { InsightsSection } from "@/components/dashboard/InsightsSection";
import { PerformanceMetricsSection } from "@/components/analytics/PerformanceMetricsSection";
import { DataInsightsSection } from "@/components/analytics/DataInsightsSection";
import { OperationalBreakdownSection } from "@/components/analytics/OperationalBreakdownSection";
import { BrandPerformanceSection } from "@/components/analytics/BrandPerformanceSection";

export default function Analytics() {
  const { data, isLoading, error, refetch } = useAnalyticsData();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* This part of the code handles loading state for the entire analytics dashboard */}
        {isLoading && (
          <LoadingState message="Loading CargoCore analytics data..." />
        )}

        {/* This part of the code handles error state with retry functionality */}
        {error && (
          <ErrorDisplay
            message={
              error.message ||
              "Unable to load analytics data - Refresh to retry or check API connection"
            }
            onRetry={() => refetch()}
          />
        )}

        {/* This part of the code renders all analytics sections when data is available */}
        {data && (
          <>
            {/* KPI Section - Order Volume Growth, Return Rate, Fulfillment Efficiency, Inventory Health Score */}
            <AnalyticsKPISection kpis={data.kpis} isLoading={isLoading} />

            {/* AI Insights Section - Analytics Agent Insights */}
            <InsightsSection insights={data.insights} isLoading={isLoading} />

            {/* Performance Metrics Section - Order Volume Trend & Fulfillment Performance */}
            <PerformanceMetricsSection 
              metrics={data.performanceMetrics} 
              isLoading={isLoading} 
            />

            {/* Data Insights Dashboard - Total Data Points, Active Warehouses, Unique Brands, Inventory Health */}
            <DataInsightsSection 
              dataInsights={data.dataInsights} 
              isLoading={isLoading} 
            />

            {/* Operational Breakdown - Order Analysis & Inventory Analysis */}
            <OperationalBreakdownSection 
              breakdown={data.operationalBreakdown} 
              isLoading={isLoading} 
            />

            {/* Brand Performance - Brand rankings and performance metrics */}
            <BrandPerformanceSection 
              brandPerformance={data.brandPerformance} 
              isLoading={isLoading} 
            />
          </>
        )}
      </div>
    </Layout>
  );
}
