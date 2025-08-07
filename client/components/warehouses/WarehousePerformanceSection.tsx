import type { WarehousePerformanceRanking } from "@/types/api";

interface WarehousePerformanceSectionProps {
  rankings: WarehousePerformanceRanking[];
  isLoading?: boolean;
}

/**
 * This part of the code creates warehouse performance rankings table
 * Shows comprehensive performance-based sorting with interactive hover effects
 */
export function WarehousePerformanceSection({ rankings, isLoading }: WarehousePerformanceSectionProps) {
  // This part of the code handles loading state
  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Warehouse Performance Rankings
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="animate-pulse p-4">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // This part of the code determines status badge colors
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Excellent":
        return "bg-green-100 text-green-800";
      case "Good":
        return "bg-blue-100 text-blue-800";
      case "Needs Attention":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Warehouse Performance Rankings
      </h2>
      
      {rankings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500">
            No performance rankings available
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="grid grid-cols-7 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
              <div>Rank</div>
              <div className="col-span-2">Warehouse</div>
              <div className="text-right">SLA %</div>
              <div className="text-right">Active Orders</div>
              <div className="text-right">Avg Time</div>
              <div className="text-center">Status</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {rankings.map((warehouse) => (
              <div
                key={warehouse.warehouseId}
                className="px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="grid grid-cols-7 gap-4 items-center">
                  {/* Rank */}
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      #{warehouse.rank}
                    </span>
                    {/* This part of the code adds trophy icons for top performers */}
                    {warehouse.rank === 1 && (
                      <span className="ml-2 text-yellow-500">🏆</span>
                    )}
                    {warehouse.rank === 2 && (
                      <span className="ml-2 text-gray-400">🥈</span>
                    )}
                    {warehouse.rank === 3 && (
                      <span className="ml-2 text-yellow-600">🥉</span>
                    )}
                  </div>

                  {/* Warehouse ID and Name */}
                  <div className="col-span-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {warehouse.warehouseName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {warehouse.warehouseId}
                      </span>
                    </div>
                  </div>

                  {/* SLA Performance */}
                  <div className="text-right">
                    <div className="flex items-center justify-end">
                      <span className="text-sm font-semibold text-gray-900">
                        {warehouse.slaPerformance.toFixed(1)}%
                      </span>
                      <div 
                        className={`w-2 h-2 rounded-full ml-2 ${
                          warehouse.slaPerformance >= 95 ? 'bg-green-500' : 
                          warehouse.slaPerformance >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      ></div>
                    </div>
                  </div>

                  {/* Active Orders */}
                  <div className="text-right">
                    <span className="text-sm text-gray-900">
                      {warehouse.activeOrders.toLocaleString()}
                    </span>
                  </div>

                  {/* Average Fulfillment Time */}
                  <div className="text-right">
                    <span className="text-sm text-gray-900">
                      {warehouse.avgFulfillmentTime.toFixed(1)}h
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(warehouse.status)}`}>
                      {warehouse.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer with summary */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>
                Showing {rankings.length} warehouse{rankings.length !== 1 ? 's' : ''} sorted by performance score
              </span>
              <span>
                Performance rankings updated in real-time
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
