import { useState } from "react";
import type { SupplierPerformance } from "@/types/api";
import { ViewAllSuppliersModal } from "./ViewAllSuppliersModal";

interface SupplierPerformanceSectionProps {
  supplierPerformance: SupplierPerformance[];
  isLoading?: boolean;
}

export function SupplierPerformanceSection({ supplierPerformance, isLoading }: SupplierPerformanceSectionProps) {
  // This part of the code manages the View All modal state
  const [showViewAllModal, setShowViewAllModal] = useState(false);

  // This part of the code formats currency values
  const formatCurrency = (amount: number) => {
    const safeAmount = amount || 0;
    if (safeAmount >= 1000000) return `$${(safeAmount / 1000000).toFixed(1)}M`;
    if (safeAmount >= 1000) return `$${(safeAmount / 1000).toFixed(1)}K`;
    return `$${(safeAmount || 0).toLocaleString()}`;
  };

  // This part of the code determines status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Efficient':
        return { bgColor: "bg-green-100", textColor: "text-green-800" };
      case 'High Cost':
        return { bgColor: "bg-red-100", textColor: "text-red-800" };
      default:
        return { bgColor: "bg-yellow-100", textColor: "text-yellow-800" };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (supplierPerformance.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Supplier Cost Performance
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-500">No supplier performance data available</div>
        </div>
      </div>
    );
  }

  // This part of the code limits display to first 10 suppliers
  const displaySuppliers = supplierPerformance.slice(0, 10);

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Supplier Cost Performance
        </h3>
        
        {/* This part of the code displays supplier performance table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Efficiency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shipments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Cost/Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displaySuppliers.map((supplier, index) => {
              const statusBadge = getStatusBadge(supplier.status);
              
              return (
                <tr key={supplier.supplier_name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {supplier.supplier_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {formatCurrency(supplier.total_cost)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {supplier.efficiency_score}%
                      </div>
                      <div className={`ml-2 text-xs ${supplier.sla_performance >= 85 ? 'text-green-600' : supplier.sla_performance >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                        (SLA: {supplier.sla_performance}%)
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(supplier.shipment_count || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${(supplier.avg_cost_per_unit || 0).toFixed(2)}
                    </div>
                    {supplier.cost_variance !== 0 && (
                      <div className={`text-xs ${supplier.cost_variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {supplier.cost_variance > 0 ? '+' : ''}{supplier.cost_variance}% vs avg
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.bgColor} ${statusBadge.textColor}`}>
                      {supplier.status}
                    </span>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
        
        {/* This part of the code displays summary footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing {displaySuppliers.length} of {supplierPerformance.length} suppliers with real cost and efficiency analysis
            </span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-100 rounded-full mr-1"></div>
                <span>Efficient</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-100 rounded-full mr-1"></div>
                <span>Needs Attention</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-100 rounded-full mr-1"></div>
                <span>High Cost</span>
              </div>
            </div>
          </div>
        </div>

        {/* This part of the code displays the View All button when there are more than 10 suppliers */}
        {supplierPerformance.length > 10 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowViewAllModal(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-50 text-blue-700 text-sm font-medium rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors border border-blue-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View All {supplierPerformance.length} Suppliers
            </button>
          </div>
        )}
      </div>

      {/* This part of the code displays the View All Suppliers modal */}
      {showViewAllModal && (
        <ViewAllSuppliersModal
          suppliers={supplierPerformance}
          isOpen={showViewAllModal}
          onClose={() => setShowViewAllModal(false)}
        />
      )}
    </>
  );
}
