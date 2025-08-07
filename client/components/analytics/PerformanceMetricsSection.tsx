import type { PerformanceMetrics } from "@/types/api";

interface PerformanceMetricsSectionProps {
  metrics: PerformanceMetrics;
  isLoading?: boolean;
}

export function PerformanceMetricsSection({ metrics, isLoading }: PerformanceMetricsSectionProps) {
  // This part of the code determines the color for progress bars based on percentage values
  const getProgressColor = (percentage: number, type: 'growth' | 'efficiency') => {
    if (type === 'growth') {
      // This part of the code colors growth rates (red for negative, green for positive)
      return percentage >= 0 ? 'bg-green-500' : 'bg-red-500';
    }
    
    if (type === 'efficiency') {
      // This part of the code colors efficiency rates (green >80%, yellow 60-80%, red <60%)
      if (percentage >= 80) return 'bg-green-500';
      if (percentage >= 60) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    
    return 'bg-blue-500';
  };

  // This part of the code formats growth rate with proper sign indicator
  const formatGrowthRate = (rate: number) => {
    const sign = rate >= 0 ? '+' : '';
    return `${sign}${(rate || 0).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Performance Metrics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-2 w-full bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Performance Metrics
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order Volume Trend Card */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Order Volume Trend
          </div>
          <div className={`text-xl font-bold mb-2 ${metrics.orderVolumeTrend.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatGrowthRate(metrics.orderVolumeTrend.growthRate)}
          </div>
          {/* This part of the code creates a progress bar showing growth rate magnitude */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full ${getProgressColor(metrics.orderVolumeTrend.growthRate, 'growth')}`}
              style={{ width: `${Math.min(Math.abs(metrics.orderVolumeTrend.growthRate), 100)}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-500">
            {metrics.orderVolumeTrend.totalOrdersAnalyzed.toLocaleString()} total orders analyzed
          </div>
        </div>

        {/* Fulfillment Performance Card */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Fulfillment Performance
          </div>
          <div className="text-xl font-bold mb-2 text-gray-900">
            {(metrics.fulfillmentPerformance.efficiencyRate || 0).toFixed(1)}%
          </div>
          {/* This part of the code creates a progress bar showing efficiency rate */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full ${getProgressColor(metrics.fulfillmentPerformance.efficiencyRate, 'efficiency')}`}
              style={{ width: `${Math.min(metrics.fulfillmentPerformance.efficiencyRate, 100)}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-500">
            {metrics.fulfillmentPerformance.onTimeOrders.toLocaleString()} on-time orders
          </div>
        </div>
      </div>
    </div>
  );
}
