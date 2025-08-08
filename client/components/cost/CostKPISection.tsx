import type { CostKPIs } from "@/types/api";

interface CostKPISectionProps {
  kpis: CostKPIs;
  isLoading?: boolean;
}

export function CostKPISection({ kpis, isLoading }: CostKPISectionProps) {
  // This part of the code formats numbers for display
  const formatNumber = (num: number) => {
    const safeNum = num || 0;
    if (safeNum >= 1000000) return `${(safeNum / 1000000).toFixed(1)}M`;
    if (safeNum >= 1000) return `${(safeNum / 1000).toFixed(1)}K`;
    return (safeNum || 0).toLocaleString();
  };

  // This part of the code formats percentage values
  const formatPercentage = (num: number) => `${(num || 0).toFixed(1)}%`;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* This part of the code displays total monthly costs metric */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Monthly Costs</p>
            <p className="text-2xl font-semibold text-gray-900">
              ${kpis.totalMonthlyCosts ? formatNumber(kpis.totalMonthlyCosts) : "—"}
            </p>
            <p className="text-xs text-gray-500">Current month operations</p>
          </div>
        </div>
      </div>

      {/* This part of the code displays cost efficiency rate metric */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${kpis.costEfficiencyRate >= 90 ? 'bg-green-100' : kpis.costEfficiencyRate >= 75 ? 'bg-yellow-100' : 'bg-red-100'}`}>
            <svg className={`w-6 h-6 ${kpis.costEfficiencyRate >= 90 ? 'text-green-600' : kpis.costEfficiencyRate >= 75 ? 'text-yellow-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Cost Efficiency Rate</p>
            <p className="text-2xl font-semibold text-gray-900">
              {kpis.costEfficiencyRate ? formatPercentage(kpis.costEfficiencyRate) : "—"}
            </p>
            <p className="text-xs text-gray-500">Expected vs received ratio</p>
          </div>
        </div>
      </div>

      {/* This part of the code displays top performing warehouses metric */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Top Performing Warehouses</p>
            <p className="text-2xl font-semibold text-gray-900">
              {kpis.topPerformingWarehouses || "—"}/{kpis.totalCostCenters || "—"}
            </p>
            <p className="text-xs text-gray-500">Above 90% SLA performance</p>
          </div>
        </div>
      </div>

      {/* This part of the code displays total cost centers metric */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Cost Centers</p>
            <p className="text-2xl font-semibold text-gray-900">
              {kpis.totalCostCenters || "—"}
            </p>
            <p className="text-xs text-gray-500">Active warehouse facilities</p>
          </div>
        </div>
      </div>
    </div>
  );
}
