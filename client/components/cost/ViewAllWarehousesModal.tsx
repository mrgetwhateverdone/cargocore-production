import { useState, useMemo } from "react";
import type { CostCenter } from "@/types/api";

interface ViewAllWarehousesModalProps {
  costCenters: CostCenter[];
  isOpen: boolean;
  onClose: () => void;
}

type SortDirection = 'asc' | 'desc' | null;

export function ViewAllWarehousesModal({ costCenters, isOpen, onClose }: ViewAllWarehousesModalProps) {
  // This part of the code manages search, sorting, and expansion state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof CostCenter | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [expandedWarehouse, setExpandedWarehouse] = useState<string | null>(null);

  // This part of the code handles sorting logic
  const handleSort = (field: keyof CostCenter) => {
    if (sortField === field) {
      // This part of the code cycles through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // This part of the code filters and sorts the cost centers
  const filteredAndSortedCostCenters = useMemo(() => {
    let filtered = costCenters.filter(center =>
      center.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.warehouse_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        // This part of the code handles string sorting
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [costCenters, searchTerm, sortField, sortDirection]);

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

  // This part of the code renders sort icons
  const getSortIcon = (field: keyof CostCenter) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      );
    }
    
    if (sortDirection === 'asc') {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    } else if (sortDirection === 'desc') {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
      </svg>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* This part of the code displays the modal header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">All Warehouses - Cost Analysis</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredAndSortedCostCenters.length} of {costCenters.length} warehouses shown • Click rows to expand details
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* This part of the code displays the search input */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search warehouses by name, ID, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* This part of the code displays sorting options */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600 font-medium">Sort by:</span>
            <button
              onClick={() => handleSort('monthly_costs')}
              className={`px-3 py-1 rounded-md transition-colors ${
                sortField === 'monthly_costs' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Monthly Cost {getSortIcon('monthly_costs')}
            </button>
            <button
              onClick={() => handleSort('cost_efficiency')}
              className={`px-3 py-1 rounded-md transition-colors ${
                sortField === 'cost_efficiency' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Efficiency {getSortIcon('cost_efficiency')}
            </button>
            <button
              onClick={() => handleSort('warehouse_name')}
              className={`px-3 py-1 rounded-md transition-colors ${
                sortField === 'warehouse_name' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Name {getSortIcon('warehouse_name')}
            </button>
          </div>
        </div>

        {/* This part of the code displays the warehouses with expandable details */}
        <div className="overflow-auto max-h-[55vh] p-6">
          <div className="space-y-4">
            {filteredAndSortedCostCenters.map((center) => {
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
                          <div className="font-semibold text-gray-900">{(center.cost_efficiency || 0).toFixed(1)}%</div>
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
        </div>

        {/* This part of the code displays the modal footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Real-time warehouse cost analysis with expandable performance details
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
