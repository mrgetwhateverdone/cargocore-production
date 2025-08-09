import { useState, useMemo } from "react";
import type { CostCenter } from "@/types/api";

interface ViewAllCostCentersModalProps {
  costCenters: CostCenter[];
  isOpen: boolean;
  onClose: () => void;
}

type SortDirection = 'asc' | 'desc' | null;

export function ViewAllCostCentersModal({ costCenters, isOpen, onClose }: ViewAllCostCentersModalProps) {
  // This part of the code manages search and sorting state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof CostCenter | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

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
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* This part of the code displays the modal header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">All Cost Centers - Warehouse Analysis</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredAndSortedCostCenters.length} of {costCenters.length} cost centers shown
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

        {/* This part of the code displays the cost centers table */}
        <div className="overflow-auto max-h-[60vh]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('warehouse_name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Warehouse</span>
                    {getSortIcon('warehouse_name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('monthly_throughput')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Throughput</span>
                    {getSortIcon('monthly_throughput')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('sla_performance')}
                >
                  <div className="flex items-center space-x-1">
                    <span>SLA Performance</span>
                    {getSortIcon('sla_performance')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    {getSortIcon('status')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('total_shipments')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Shipments</span>
                    {getSortIcon('total_shipments')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedCostCenters.map((center) => (
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
                      {(center.sla_performance || 0).toFixed(1)}%
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

        {/* This part of the code displays the modal footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Real-time warehouse cost analysis with performance metrics
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
