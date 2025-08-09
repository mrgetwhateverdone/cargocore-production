import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useEconomicData } from "@/hooks/useEconomicData";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-display";

// Economic Intelligence Components
import { EconomicKPISection } from "@/components/economic/EconomicKPISection";
import { InsightsSection } from "@/components/dashboard/InsightsSection";
import { GlobalEconomicSection } from "@/components/economic/GlobalEconomicSection";
import { BusinessImpactSection } from "@/components/economic/BusinessImpactSection";
import { EconomicForecastsSection } from "@/components/economic/EconomicForecastsSection";
import { RisksOpportunitiesSection } from "@/components/economic/RisksOpportunitiesSection";

export default function EconomicIntelligence() {
  const { data, isLoading, error, refetch } = useEconomicData();

  if (isLoading) {
    return (
      <Layout>
        <LoadingState message="Loading CargoCore economic intelligence data..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorDisplay
          message={
            error.message ||
            "Unable to load economic intelligence data - Refresh to retry or check API connection"
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
          message="No economic intelligence data available"
          onRetry={() => refetch()}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* This part of the code displays economic intelligence KPI cards */}
        <EconomicKPISection kpis={data.kpis} isLoading={isLoading} />

        {/* This part of the code displays AI insights for economic intelligence */}
        <InsightsSection
          insights={data.insights}
          isLoading={isLoading}
          title="Economic Intelligence Agent Insights"
          subtitle={`${data.insights.length} insights from Economic Intelligence Agent`}
          loadingMessage="Economic Intelligence Agent is analyzing global economic trends and business impact correlations..."
        />

        {/* This part of the code displays global economic intelligence metrics */}
        <GlobalEconomicSection
          metrics={data.globalMetrics}
          isLoading={isLoading}
        />

        {/* This part of the code displays business impact analysis */}
        <BusinessImpactSection
          businessImpact={data.businessImpact}
          isLoading={isLoading}
        />

        {/* This part of the code displays risks and opportunities analysis */}
        <RisksOpportunitiesSection
          risksOpportunities={data.risksOpportunities}
          isLoading={isLoading}
        />

        {/* This part of the code displays economic forecasts and predictions */}
        <EconomicForecastsSection
          forecasts={data.forecasts}
          isLoading={isLoading}
        />

        {/* This part of the code displays data correlation timestamp */}
        {data.lastUpdated && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-right">
              <span className="text-sm text-gray-500">
                Data correlation timestamp: {new Date(data.lastUpdated).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
