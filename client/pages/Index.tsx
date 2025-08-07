import { Layout } from "@/components/layout/Layout";
import { useDashboardData } from "@/hooks/useDashboardData";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-display";

// Dashboard Components
import { KPISection } from "@/components/dashboard/KPISection";
import { InsightsSection } from "@/components/dashboard/InsightsSection";
import { QuickOverviewSection } from "@/components/dashboard/QuickOverviewSection";
import { WarehouseInventorySection } from "@/components/dashboard/WarehouseInventorySection";
import { AnomalyDetectorSection } from "@/components/dashboard/AnomalyDetectorSection";
import { MinimalWorkflowTest } from "@/components/MinimalWorkflowTest";

export default function Index() {
  const { data, isLoading, error, refetch } = useDashboardData();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {isLoading && (
          <LoadingState message="Loading CargoCore dashboard data..." />
        )}

        {error && (
          <ErrorDisplay
            message={
              error.message ||
              "Unable to load data - Refresh to retry or check API connection"
            }
            onRetry={() => refetch()}
          />
        )}

        {data && (
          <>
            {/* Debug Test - Remove after fixing */}
            <MinimalWorkflowTest />
            
            {/* KPI Section */}
            <KPISection kpis={data.kpis} isLoading={isLoading} />

            {/* AI Insights Section */}
            <InsightsSection insights={data.insights} isLoading={isLoading} />

            {/* Quick Overview Section */}
            <QuickOverviewSection
              metrics={data.quickOverview}
              isLoading={isLoading}
            />

            {/* Warehouse Inventory Section */}
            <WarehouseInventorySection
              warehouses={data.warehouseInventory}
              isLoading={isLoading}
            />

            {/* Anomaly Detector Section */}
            <AnomalyDetectorSection
              anomalies={data.anomalies}
              isLoading={isLoading}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
