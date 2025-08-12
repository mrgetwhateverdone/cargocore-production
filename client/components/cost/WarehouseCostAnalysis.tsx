import { useState } from "react";
import type { CostCenter } from "@/types/api";
import { ViewAllWarehousesModal } from "./ViewAllWarehousesModal";

interface WarehouseCostAnalysisProps {
  costCenters: CostCenter[];
  isLoading?: boolean;
}

export function WarehouseCostAnalysis({ costCenters, isLoading }: WarehouseCostAnalysisProps) {
  // This part of the code manages expanded warehouse details
  const [expandedWarehouse, setExpandedWarehouse] = useState<string | null>(null);
  
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
  const getStatusBadge = (center: CostCenter) => {
    const isEfficient = center.cost_efficiency >= 90 && center.sla_performance >= 85;
    const needsAttention = center.cost_efficiency < 75 || center.sla_performance < 70;
    
    if (isEfficient) {
      return { text: "Efficient", bgColor: "bg-green-100", textColor: "text-green-800" };
    } else if (needsAttention) {
      return { text: "Needs Optimization", bgColor: "bg-red-100", textColor: "text-red-800" };
    } else {
      return { text: "Monitoring", bgColor: "bg-yellow-100", textColor: "text-yellow-800" };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (costCenters.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Cost Center Analysis by Warehouse
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-500">No warehouse cost data available</div>
        </div>
      </div>
    );
  }

  // This part of the code sorts warehouses by monthly cost and limits to 10
  const sortedCostCenters = [...costCenters]
    .sort((a, b) => (b.monthly_costs || 0) - (a.monthly_costs || 0));
  const displayCostCenters = sortedCostCenters.slice(0, 10);

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cost Center Analysis by Warehouse
        </h3>
        
        <div className="space-y-4">
          {displayCostCenters.map((center) => {
          const statusBadge = getStatusBadge(center);
          const isExpanded = expandedWarehouse === center.warehouse_id;
          
          return (
            <div key={center.warehouse_id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* This part of the code displays warehouse summary header */}
              <div 
                className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setExpandedWarehouse(isExpanded ? null : center.warehouse_id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{center.warehouse_name}</h4>
                      <p className="text-sm text-gray-500">ID: {center.warehouse_id}</p>
                    </div>
                    
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.bgColor} ${statusBadge.textColor}`}>
                      {statusBadge.text}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{formatCurrency(center.monthly_costs)}</div>
                      <div className="text-gray-500">Monthly Costs</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{center.cost_efficiency.toFixed(1)}%</div>
                      <div className="text-gray-500">Efficiency</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{formatCurrency(center.cost_per_shipment)}</div>
                      <div className="text-gray-500">Cost per Shipment</div>
                    </div>
                    
                    {/* This part of the code displays expand/collapse icon */}
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* This part of the code displays detailed cost breakdown when expanded */}
              {isExpanded && (
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Performance Metrics */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Performance Metrics</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Operating Margin</span>
                          <span className={`text-sm font-medium ${center.cost_efficiency >= 90 ? 'text-green-600' : center.cost_efficiency >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {(center.cost_efficiency || 0).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">SLA Performance</span>
                          <span className={`text-sm font-medium ${center.sla_performance >= 85 ? 'text-green-600' : center.sla_performance >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {(center.sla_performance || 0).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Utilization Rate</span>
                          <span className="text-sm font-medium text-gray-900">
                            {(center.utilization_rate || 0).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Monthly Throughput</span>
                          <span className="text-sm font-medium text-gray-900">
                            {(center.monthly_throughput || 0).toLocaleString()} units
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Cost Breakdown */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Cost Centers (from real data)</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Receiving</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(center.cost_breakdown.receiving)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Storage</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(center.cost_breakdown.storage)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Processing</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(center.cost_breakdown.processing)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Overhead</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(center.cost_breakdown.overhead)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* This part of the code displays shipment summary */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Total Shipments: <span className="font-medium text-gray-900">{center.total_shipments}</span>
                      </span>
                      <span className="text-gray-500">
                        On-Time: <span className="font-medium text-green-600">{center.on_time_shipments}</span>
                      </span>
                      <span className="text-gray-500">
                        Status: <span className={`font-medium ${center.status === 'Active' ? 'text-green-600' : 'text-gray-600'}`}>
                          {center.status}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
          })}
        </div>
        
        {/* This part of the code displays summary footer with View All button */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing {displayCostCenters.length} of {costCenters.length} warehouses ranked by monthly cost
            </span>
            
            {/* This part of the code displays the View All button when there are more than 10 warehouses */}
            {costCenters.length > 10 && (
              <button
                onClick={() => setShowViewAllModal(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-50 text-blue-700 text-sm font-medium rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors border border-blue-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                View All {costCenters.length} Warehouses
              </button>
            )}
          </div>
        </div>
      </div>

      {/* This part of the code displays the View All Warehouses modal */}
      {showViewAllModal && (
        <ViewAllWarehousesModal
          costCenters={sortedCostCenters}
          isOpen={showViewAllModal}
          onClose={() => setShowViewAllModal(false)}
        />
      )}
    </>
  );
}
