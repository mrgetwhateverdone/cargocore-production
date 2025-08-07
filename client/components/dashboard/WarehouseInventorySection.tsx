import type { WarehouseInventory } from "@/types/api";

interface WarehouseInventorySectionProps {
  warehouses: WarehouseInventory[];
  isLoading?: boolean;
}

export function WarehouseInventorySection({
  warehouses,
  isLoading,
}: WarehouseInventorySectionProps) {
  // Color rotation system matching the original spec
  const colorClasses = [
    "bg-blue-50 text-blue-600", // Warehouse 1
    "bg-green-50 text-green-600", // Warehouse 2
    "bg-purple-50 text-purple-600", // Warehouse 3
    "bg-orange-50 text-orange-600", // Warehouse 4
    "bg-pink-50 text-pink-600", // Warehouse 5
    "bg-indigo-50 text-indigo-600", // Warehouse 6
  ];

  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Inventory by Warehouse
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="text-center p-4 rounded-lg bg-gray-100">
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show top 6 warehouses or all if less than 6
  const displayWarehouses = warehouses.slice(0, 6);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Inventory by Warehouse
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {displayWarehouses?.map((warehouse, index) => {
          const colorClass = colorClasses[index % colorClasses.length];
          const warehouseShortId =
            warehouse.warehouseId?.substring(0, 8) || "Unknown";

          return (
            <div
              key={warehouse.warehouseId}
              className={`text-center p-4 rounded-lg transition-all hover:shadow-md ${colorClass}`}
            >
              <div className="text-2xl font-bold mb-1">
                {(warehouse.totalInventory || 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                Warehouse {warehouseShortId}
              </div>
              <div className="text-xs text-gray-500">
                {warehouse.warehouseId}
              </div>
            </div>
          );
        })}
      </div>

      {warehouses.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500">
            No warehouse inventory data available
          </p>
        </div>
      )}

      {warehouses.length > 6 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Showing top 6 warehouses by inventory volume
          </p>
        </div>
      )}
    </div>
  );
}
