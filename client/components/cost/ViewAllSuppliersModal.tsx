import { useState, useMemo } from "react";
import type { SupplierPerformance } from "@/types/api";

interface ViewAllSuppliersModalProps {
  suppliers: SupplierPerformance[];
  isOpen: boolean;
  onClose: () => void;
}

type SortDirection = 'asc' | 'desc' | null;

export function ViewAllSuppliersModal({ suppliers, isOpen, onClose }: ViewAllSuppliersModalProps) {
  // This part of the code manages search and sorting state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof SupplierPerformance | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // This part of the code handles sorting logic
  const handleSort = (field: keyof SupplierPerformance) => {
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

  // This part of the code filters and sorts the suppliers
  const filteredAndSortedSuppliers = useMemo(() => {
    let filtered = suppliers.filter(supplier =>
      supplier.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.status.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [suppliers, searchTerm, sortField, sortDirection]);

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

  // This part of the code renders sort icons
  const getSortIcon = (field: keyof SupplierPerformance) => {
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
            <h2 className="text-xl font-semibold text-gray-900">All Suppliers - Cost Performance</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredAndSortedSuppliers.length} of {suppliers.length} suppliers shown
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
              placeholder="Search suppliers by name or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* This part of the code displays the suppliers table */}
        <div className="overflow-auto max-h-[60vh]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('supplier_name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Supplier</span>
                    {getSortIcon('supplier_name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('total_cost')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Monthly Cost</span>
                    {getSortIcon('total_cost')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('efficiency_score')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Efficiency</span>
                    {getSortIcon('efficiency_score')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('shipment_count')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Shipments</span>
                    {getSortIcon('shipment_count')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('avg_cost_per_unit')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Avg Cost/Unit</span>
                    {getSortIcon('avg_cost_per_unit')}
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedSuppliers.map((supplier, index) => {
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

        {/* This part of the code displays the modal footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
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
