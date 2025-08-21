import { Layout } from "@/components/layout/Layout";
import { useWarehousesData } from "@/hooks/useWarehousesData";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import type { WarehousesData } from "@/types/api";

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
  
  // This part of the code ensures proper type safety for the data
  const warehousesData = data as WarehousesData | undefined;

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

        {/* This part of the code renders warehouse sections organized in logical groups for better visual hierarchy */}
        {warehousesData && (
          <div className="space-y-8">
            {/* KPI Cards - Essential performance metrics */}
            <WarehouseKPISection kpis={warehousesData.kpis} isLoading={isLoading} />

            {/* AI Insights - Warehouse Agent insights */}
            <InsightsSection insights={warehousesData.insights} isLoading={isLoading} />

            {/* Group 2: Warehouse Operations */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-6">
                <span className="text-2xl mr-3">🏭</span>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Warehouse Operations</h2>
                  <p className="text-sm text-gray-600">Individual warehouse performance and rankings</p>
                </div>
              </div>

              {/* Warehouse Cards - Individual warehouse performance */}
              <WarehouseCardsSection 
                warehouses={warehousesData.warehouses} 
                isLoading={isLoading} 
              />

              {/* Performance Rankings - Performance-based sorting */}
              <WarehousePerformanceSection 
                rankings={warehousesData.performanceRankings} 
                isLoading={isLoading} 
              />
            </div>

            {/* Group 3: AI Intelligence & Optimization */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center mb-6">
                <span className="text-2xl mr-3">🤖</span>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">AI Intelligence & Optimization</h2>
                  <p className="text-sm text-gray-600">Smart budget allocation, learning systems, and performance optimization</p>
                </div>
              </div>

              {/* Budget Allocation - AI-powered budget optimization */}
              <SmartBudgetAllocationSection 
                budgetAllocations={warehousesData.budgetAllocations} 
                isLoading={isLoading} 
              />

              {/* AI Learning System - User behavior analysis */}
              <AILearningSystemSection 
                userBehavior={warehousesData.userBehavior} 
                isLoading={isLoading} 
              />

              {/* Performance Optimization - AI-driven optimization recommendations */}
              <PerformanceOptimizationSection 
                optimizations={warehousesData.optimizations} 
                isLoading={isLoading} 
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}