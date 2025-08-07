import { Layout } from "@/components/layout/Layout";
import { useWarehousesData } from "@/hooks/useWarehousesData";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-display";

// Warehouse Components  
import { WarehouseKPISection } from "@/components/warehouses/WarehouseKPISection";
import { InsightsSection } from "@/components/dashboard/InsightsSection";
import { WarehouseCardsSection } from "@/components/warehouses/WarehouseCardsSection";
import { WarehousePerformanceSection } from "@/components/warehouses/WarehousePerformanceSection";
import { SmartBudgetAllocationSection } from "@/components/warehouses/SmartBudgetAllocationSection";
import { AILearningSystemSection } from "@/components/warehouses/AILearningSystemSection";
import { PerformanceOptimizationSection } from "@/components/warehouses/PerformanceOptimizationSection";

/**
 * This part of the code creates the comprehensive warehouse management dashboard
 * Following the scalable architecture approach with shared components and patterns
 */
export default function Warehouses() {
  const { data, isLoading, error, refetch } = useWarehousesData();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* This part of the code handles loading state for the entire warehouse dashboard */}
        {isLoading && (
          <LoadingState message="Loading warehouse data from TinyBird..." />
        )}

        {/* This part of the code handles error state with retry functionality */}
        {error && (
          <ErrorDisplay
            message={
              error.message ||
              "Unable to load warehouse data - Check WMS connection or refresh to retry"
            }
            onRetry={() => refetch()}
          />
        )}

        {/* This part of the code renders all warehouse sections when data is available */}
        {data && (
          <>
            {/* Top-Level KPI Cards Section - SLA %, Active Orders, Avg Fulfillment Time, Inbound Throughput */}
            <WarehouseKPISection kpis={data.kpis} isLoading={isLoading} />

            {/* AI Insights Section - Warehouse Agent Insights */}
            <InsightsSection insights={data.insights} isLoading={isLoading} />

            {/* Warehouse Cards Section - Individual warehouse performance cards */}
            <WarehouseCardsSection 
              warehouses={data.warehouses} 
              isLoading={isLoading} 
            />

            {/* Warehouse Performance Rankings Table - Performance-based sorting */}
            <WarehousePerformanceSection 
              rankings={data.performanceRankings} 
              isLoading={isLoading} 
            />

            {/* Smart Budget Allocation Engine - AI-powered budget optimization */}
            <SmartBudgetAllocationSection 
              budgetAllocations={data.budgetAllocations} 
              isLoading={isLoading} 
            />

            {/* AI Learning System - User behavior analysis */}
            <AILearningSystemSection 
              userBehavior={data.userBehavior} 
              isLoading={isLoading} 
            />

            {/* Performance Optimization Engine - AI-driven optimization recommendations */}
            <PerformanceOptimizationSection 
              optimizations={data.optimizations} 
              isLoading={isLoading} 
            />
          </>
        )}
      </div>
    </Layout>
  );
}