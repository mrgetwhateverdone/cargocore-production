import type { GlobalEconomicMetrics } from "@/types/api";

interface GlobalEconomicSectionProps {
  metrics: GlobalEconomicMetrics;
  isLoading?: boolean;
}

export function GlobalEconomicSection({ metrics, isLoading }: GlobalEconomicSectionProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Global Economic Intelligence</h3>
          {metrics.lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">Live Data</span>
        </div>
      </div>

      {/* This part of the code displays economic metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Port Congestion</span>
            <span className="text-xl">🚢</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {metrics.portCongestionIndex !== null ? `${metrics.portCongestionIndex}/100` : "N/A"}
          </div>
          <div className="text-xs text-gray-500">Shipping delay index</div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Freight Costs</span>
            <span className="text-xl">📈</span>
          </div>
          <div className={`text-2xl font-bold ${
            metrics.freightCostTrend !== null ? (
              metrics.freightCostTrend > 0 ? 'text-red-600' : 
              metrics.freightCostTrend < 0 ? 'text-green-600' : 'text-gray-900'
            ) : 'text-gray-900'
          }`}>
            {metrics.freightCostTrend !== null ? 
              `${metrics.freightCostTrend > 0 ? '+' : ''}${metrics.freightCostTrend.toFixed(1)}%` : 
              "N/A"
            }
          </div>
          <div className="text-xs text-gray-500">Cost trend</div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Fuel Prices</span>
            <span className="text-xl">⛽</span>
          </div>
          <div className={`text-2xl font-bold ${
            metrics.fuelPriceIndex !== null ? (
              metrics.fuelPriceIndex > 0 ? 'text-red-600' : 
              metrics.fuelPriceIndex < 0 ? 'text-green-600' : 'text-gray-900'
            ) : 'text-gray-900'
          }`}>
            {metrics.fuelPriceIndex !== null ? 
              `${metrics.fuelPriceIndex > 0 ? '+' : ''}${metrics.fuelPriceIndex.toFixed(1)}%` : 
              "N/A"
            }
          </div>
          <div className="text-xs text-gray-500">Transport impact</div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Trade Health</span>
            <span className="text-xl">🌍</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {metrics.globalTradeIndex !== null ? `${metrics.globalTradeIndex}/100` : "N/A"}
          </div>
          <div className="text-xs text-gray-500">Supply chain health</div>
        </div>
      </div>

      {/* This part of the code displays data sources disclaimer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          Real-time economic data sourced from global market intelligence
        </p>
      </div>
    </div>
  );
}
