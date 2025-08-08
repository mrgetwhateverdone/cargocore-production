import { Layout } from "@/components/layout/Layout";
import { useCostData } from "@/hooks/useCostData";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-display";

// Cost Management Components
import { CostKPISection } from "@/components/cost/CostKPISection";
import { InsightsSection } from "@/components/dashboard/InsightsSection";
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
        {/* This part of the code displays the cost management KPI cards */}
        <CostKPISection kpis={data.kpis} isLoading={isLoading} />

        {/* This part of the code displays AI insights for cost management */}
        <InsightsSection
          insights={data.insights}
          isLoading={isLoading}
          title="Cost Management Agent Insights"
          subtitle={`${data.insights.length} insights from Cost Management Agent`}
          loadingMessage="Cost Management Agent is analyzing warehouse performance and identifying cost optimization opportunities..."
        />

        {/* This part of the code displays the cost center analysis table */}
        <CostCenterTableSection
          costCenters={data.costCenters || []}
          isLoading={isLoading}
          onViewAll={handleViewAll}
        />
      </div>
    </Layout>
  );
}