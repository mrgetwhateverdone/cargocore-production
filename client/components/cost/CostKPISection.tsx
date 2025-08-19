import type { CostKPIs } from "@/types/api";
import { useSettingsIntegration } from "@/hooks/useSettingsIntegration";
import { FormattedCurrency, FormattedPercentage } from "@/components/ui/formatted-value";
import { DollarSign, BarChart3, CheckCircle, Building } from "lucide-react";

interface CostKPISectionProps {
  kpis: CostKPIs;
  isLoading?: boolean;
}

export function CostKPISection({ kpis, isLoading }: CostKPISectionProps) {
  const { formatCurrency, formatPercentage: formatPercent } = useSettingsIntegration();

  // This part of the code formats large numbers with M/K suffixes for display
  const formatLargeNumber = (num: number) => {
    const safeNum = num || 0;
    if (safeNum >= 1000000) return `${(safeNum / 1000000).toFixed(1)}M`;
    if (safeNum >= 1000) return `${(safeNum / 1000).toFixed(1)}K`;
    return formatCurrency(safeNum);
  };

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
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Monthly Costs</p>
            <p className="text-2xl font-bold text-gray-900">
              <FormattedCurrency value={kpis.totalMonthlyCosts} />
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      {/* This part of the code displays cost efficiency rate metric */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Cost Efficiency Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              <FormattedPercentage value={kpis.costEfficiencyRate} />
            </p>
          </div>
          <BarChart3 className="h-8 w-8 text-yellow-600" />
        </div>
      </div>

      {/* This part of the code displays top performing warehouses metric */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Top Performing Warehouses</p>
            <p className="text-2xl font-bold text-gray-900">
              {kpis.topPerformingWarehouses || "—"}/{kpis.totalCostCenters || "—"}
            </p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>

      {/* This part of the code displays total cost centers metric */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Cost Centers</p>
            <p className="text-2xl font-bold text-gray-900">
              {kpis.totalCostCenters || "—"}
            </p>
          </div>
          <Building className="h-8 w-8 text-purple-600" />
        </div>
      </div>
    </div>
  );
}
