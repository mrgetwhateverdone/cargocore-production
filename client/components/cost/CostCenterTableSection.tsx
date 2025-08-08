import { useState } from "react";
import type { CostCenter } from "@/types/api";

interface CostCenterTableSectionProps {
  costCenters: CostCenter[];
  isLoading?: boolean;
  onViewAll?: () => void;
}

export function CostCenterTableSection({ costCenters, isLoading, onViewAll }: CostCenterTableSectionProps) {
  // This part of the code formats numbers for display
  const formatNumber = (num: number) => {
    const safeNum = num || 0;
    if (safeNum >= 1000000) return `${(safeNum / 1000000).toFixed(1)}M`;
    if (safeNum >= 1000) return `${(safeNum / 1000).toFixed(1)}K`;
    return (safeNum || 0).toLocaleString();
  };

  // This part of the code determines status badge styling
  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'Active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Inactive':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Cost Center Analysis</h3>
          <p className="text-sm text-gray-500">Loading warehouse cost data...</p>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (costCenters.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Cost Center Analysis</h3>
          <p className="text-sm text-gray-500">Warehouse cost analysis by facility</p>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center">Information not in dataset.</p>
        </div>
      </div>
    );
  }

  // This part of the code limits display to first 10 cost centers
  const displayCostCenters = costCenters.slice(0, 10);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Cost Center Analysis</h3>
        <p className="text-sm text-gray-500">
          Showing {displayCostCenters.length} of {costCenters.length} warehouses
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Warehouse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Throughput
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SLA Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shipments
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayCostCenters.map((center) => (
              <tr key={center.warehouse_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {center.warehouse_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {center.warehouse_id}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatNumber(center.monthly_throughput)} units
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {center.sla_performance.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {center.on_time_shipments}/{center.total_shipments} on-time
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(center.status)}>
                    {center.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(center.total_shipments || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* This part of the code displays the View All button when there are more than 10 cost centers */}
      {costCenters.length > 10 && onViewAll && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="text-center">
            <button
              onClick={onViewAll}
              className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View All {costCenters.length} Cost Centers
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
