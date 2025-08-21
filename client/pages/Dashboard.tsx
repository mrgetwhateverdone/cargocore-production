import React from "react";
import { Layout } from "@/components/layout/Layout";
import { useDashboardData } from "@/hooks/useDashboardData";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-display";

// Dashboard Components
import { KPISection } from "@/components/dashboard/KPISection";
import { SuggestedWorkflows } from "@/components/SuggestedWorkflows";
import { QuickOverviewSection } from "@/components/dashboard/QuickOverviewSection";
import { AnomalyDetectorSection } from "@/components/dashboard/AnomalyDetectorSection";
import { SmartMarginRiskSection } from "@/components/dashboard/SmartMarginRiskSection";
import { ShipmentCostVarianceSection } from "@/components/dashboard/ShipmentCostVarianceSection";


export default function Dashboard() {
  const { data, isLoading, error, refetch } = useDashboardData();

  // Authentication is now handled by Clerk in App.tsx

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
            {/* KPI Section */}
            <KPISection kpis={data.kpis} isLoading={isLoading} />

            {/* Suggested Workflows Section - New unified UI */}
            <SuggestedWorkflows 
              insights={data.insights} 
              isLoading={isLoading}
              title="Suggested Workflows"
              subtitle={`${data.insights?.length || 0} workflow suggestions from Dashboard Agent`}
              loadingMessage="Generating workflow suggestions..."
              pageType="dashboard"
            />

            {/* Quick Overview Section */}
            <QuickOverviewSection
              metrics={data.quickOverview}
              isLoading={isLoading}
            />

            {/* Anomaly Detector Section */}
            <AnomalyDetectorSection
              anomalies={data.anomalies}
              isLoading={isLoading}
            />

            {/* Smart Margin Risk Analysis Section */}
            <SmartMarginRiskSection
              marginRisks={data.marginRisks}
              isLoading={isLoading}
            />

            {/* Shipment Cost Variance Detection Section */}
            <ShipmentCostVarianceSection
              costVariances={data.costVariances}
              isLoading={isLoading}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
