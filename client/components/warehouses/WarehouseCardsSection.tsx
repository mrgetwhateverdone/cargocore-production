import type { WarehouseData } from "@/types/api";

interface WarehouseCardsSectionProps {
  warehouses: WarehouseData[];
  isLoading?: boolean;
}

/**
 * This part of the code creates individual warehouse performance cards
 * Displays key metrics with color-coded status indicators and hover effects
 */
export function WarehouseCardsSection({ warehouses, isLoading }: WarehouseCardsSectionProps) {
  // This part of the code handles loading state with skeleton cards
  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Warehouses
        </h2>
        <div className="text-sm text-gray-500 mb-4">
          Loading real warehouse data from TinyBird...
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // This part of the code handles empty state
  if (warehouses.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Warehouses
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500">
            No warehouses found for the specified company and brand
          </p>
        </div>
      </div>
    );
  }

  // This part of the code determines status border colors
  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case "Excellent":
        return "border-green-200 hover:border-green-300";
      case "Good":
        return "border-blue-200 hover:border-blue-300";
      case "Needs Attention":
        return "border-red-200 hover:border-red-300";
      default:
        return "border-gray-200 hover:border-gray-300";
    }
  };

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
        Warehouses
      </h2>
      
      {/* This part of the code creates responsive grid layout for warehouse cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {warehouses.map((warehouse) => (
          <div
            key={warehouse.warehouseId}
            className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${getStatusBorderColor(warehouse.status)}`}
          >
            {/* Card Header - Warehouse name, ID, and status */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {warehouse.warehouseName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {warehouse.warehouseId}
                  </p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(warehouse.status)}`}>
                  {warehouse.status}
                </span>
              </div>
            </div>

            {/* Metrics Section - 5 key performance metrics */}
            <div className="space-y-3">
              {/* SLA Performance */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">SLA Performance</span>
                <div className="flex items-center">
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
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Active Orders</span>
                <span className="text-sm font-semibold text-gray-900">
                  {warehouse.activeOrders.toLocaleString()}
                </span>
              </div>

              {/* Average Fulfillment Time */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Avg Fulfillment</span>
                <span className="text-sm font-semibold text-gray-900">
                  {warehouse.avgFulfillmentTime.toFixed(1)}h
                </span>
              </div>

              {/* Total SKUs */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Total SKUs</span>
                <span className="text-sm font-semibold text-gray-900">
                  {warehouse.totalSKUs.toLocaleString()}
                </span>
              </div>

              {/* Throughput */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Throughput</span>
                <span className="text-sm font-semibold text-gray-900">
                  {warehouse.throughput.toLocaleString()}
                </span>
              </div>
            </div>

            {/* This part of the code shows location information if available */}
            {warehouse.location && (warehouse.location.city || warehouse.location.state || warehouse.location.country) && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center text-xs text-gray-500">
                  <span>📍</span>
                  <span className="ml-1 truncate">
                    {[warehouse.location.city, warehouse.location.state, warehouse.location.country]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              </div>
            )}

            {/* This part of the code shows performance score as a visual indicator */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Performance Score</span>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-gray-900 mr-2">
                    {warehouse.performanceScore}/100
                  </span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${
                        warehouse.performanceScore >= 80 ? 'bg-green-500' : 
                        warehouse.performanceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.max(warehouse.performanceScore, 0)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
