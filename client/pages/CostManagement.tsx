import { Layout } from "@/components/layout/Layout";
import { useCostData } from "@/hooks/useCostData";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-display";

// Cost Management Components
import { CostKPISection } from "@/components/cost/CostKPISection";
import { InsightsSection } from "@/components/dashboard/InsightsSection";
import { ExecutiveSummarySection } from "@/components/cost/ExecutiveSummarySection";
import { WarehouseCostAnalysis } from "@/components/cost/WarehouseCostAnalysis";
import { SupplierPerformanceSection } from "@/components/cost/SupplierPerformanceSection";
import { HistoricalTrendsSection } from "@/components/cost/HistoricalTrendsSection";
import { CostCenterTableSection } from "@/components/cost/CostCenterTableSection";

export default function CostManagement() {
  const { data, isLoading, error, refetch } = useCostData();

  // This part of the code handles opening view all modal (placeholder for Phase 2)
  const handleViewAll = () => {
    console.log("View All Cost Centers - Phase 2 feature");
    // TODO: Implement ViewAllCostCentersModal in Phase 2
  };

  if (isLoading) {
    return (
      <Layout>
        <LoadingState message="Loading CargoCore cost management data..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorDisplay
          message={
            error.message ||
            "Unable to load cost management data - Refresh to retry or check API connection"
          }
          onRetry={() => refetch()}
        />
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <ErrorDisplay
          message="No cost management data available"
          onRetry={() => refetch()}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* This part of the code displays enhanced cost management KPI cards */}
        <CostKPISection kpis={data.kpis} isLoading={isLoading} />

        {/* This part of the code displays executive summary with real data narrative */}
        <ExecutiveSummarySection 
          kpis={data.kpis}
          costCenters={data.costCenters || []}
          isLoading={isLoading}
        />

        {/* This part of the code displays AI insights for cost management */}
        <InsightsSection
          insights={data.insights}
          isLoading={isLoading}
          title="Cost Management Agent Insights"
          subtitle={`${data.insights.length} insights from Cost Management Agent`}
          loadingMessage="Cost Management Agent is analyzing warehouse performance and identifying cost optimization opportunities..."
        />

        {/* This part of the code displays detailed warehouse cost analysis */}
        <WarehouseCostAnalysis
          costCenters={data.costCenters || []}
          isLoading={isLoading}
        />

        {/* This part of the code displays supplier performance analysis */}
        <SupplierPerformanceSection
          supplierPerformance={data.supplierPerformance || []}
          isLoading={isLoading}
        />

        {/* This part of the code displays historical cost trends */}
        <HistoricalTrendsSection
          historicalTrends={data.historicalTrends || []}
          isLoading={isLoading}
        />

        {/* This part of the code displays the basic cost center table for legacy compatibility */}
        <CostCenterTableSection
          costCenters={data.costCenters || []}
          isLoading={isLoading}
          onViewAll={handleViewAll}
        />
      </div>
    </Layout>
  );
}