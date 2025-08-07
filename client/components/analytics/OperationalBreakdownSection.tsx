import type { OperationalBreakdown } from "@/types/api";

interface OperationalBreakdownSectionProps {
  breakdown: OperationalBreakdown;
  isLoading?: boolean;
}

export function OperationalBreakdownSection({ breakdown, isLoading }: OperationalBreakdownSectionProps) {
  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Operational Breakdown
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex justify-between">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mt-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Operational Breakdown
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order Analysis Card */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-md font-semibold text-gray-900 mb-4">
            Order Analysis
          </h3>
          
          {/* This part of the code displays order metrics with color coding */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Orders</span>
              <span className="text-lg font-semibold text-gray-900">
                {breakdown.orderAnalysis.totalOrders.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">On-Time Orders</span>
              <span className="text-lg font-semibold text-green-600">
                {breakdown.orderAnalysis.onTimeOrders.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Delayed Orders</span>
              <span className="text-lg font-semibold text-red-600">
                {breakdown.orderAnalysis.delayedOrders.toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* This part of the code shows the calculated on-time rate */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              On-time rate: {(breakdown.orderAnalysis.onTimeRate || 0).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Inventory Analysis Card */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-md font-semibold text-gray-900 mb-4">
            Inventory Analysis
          </h3>
          
          {/* This part of the code displays inventory metrics with color coding */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total SKUs</span>
              <span className="text-lg font-semibold text-gray-900">
                {breakdown.inventoryAnalysis.totalSKUs.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">In Stock</span>
              <span className="text-lg font-semibold text-green-600">
                {breakdown.inventoryAnalysis.inStock.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Low Stock</span>
              <span className="text-lg font-semibold text-yellow-600">
                {breakdown.inventoryAnalysis.lowStock.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Out of Stock</span>
              <span className="text-lg font-semibold text-red-600">
                {breakdown.inventoryAnalysis.outOfStock.toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* This part of the code shows the average inventory level */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Avg inventory level: {breakdown.inventoryAnalysis.avgInventoryLevel.toLocaleString()} units
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
