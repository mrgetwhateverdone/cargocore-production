import { useState, useMemo } from "react";
import { X, ChevronUp, ChevronDown, ArrowUpDown, Search, Globe } from "lucide-react";
import type { OrderData } from "@/types/api";

interface ViewAllShipmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipments: OrderData[];
  title: string;
}

type SortField = 'product_sku' | 'supplier' | 'ship_from_country' | 'expected_date' | 'status' | 'value' | 'expected_quantity';
type SortDirection = 'asc' | 'desc' | 'default';

export function ViewAllShipmentsModal({ isOpen, onClose, shipments, title }: ViewAllShipmentsModalProps) {
  const [sortField, setSortField] = useState<SortField>('expected_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc'); // Default to most recent first
  const [searchTerm, setSearchTerm] = useState('');

  // This part of the code handles column sorting with 3-state cycle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through states: desc -> asc -> default
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else if (sortDirection === 'asc') {
        setSortDirection('default');
        setSortField('expected_date'); // Reset to default sort
      } else {
        setSortDirection('desc');
      }
    } else {
      setSortField(field);
      setSortDirection('desc'); // Always start with most recent/highest first
    }
  };

  // This part of the code gets the appropriate sort icon for column headers
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
    
    switch (sortDirection) {
      case 'desc':
        return <ChevronDown className="h-4 w-4" />;
      case 'asc':
        return <ChevronUp className="h-4 w-4" />;
      default:
        return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
  };

  // This part of the code filters shipments based on search term
  const filteredShipments = useMemo(() => {
    if (!searchTerm) return shipments;
    
    return shipments.filter(shipment =>
      shipment.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shipment.product_sku && shipment.product_sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (shipment.supplier && shipment.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (shipment.ship_from_country && shipment.ship_from_country.toLowerCase().includes(searchTerm.toLowerCase())) ||
      shipment.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [shipments, searchTerm]);

  // This part of the code sorts the filtered shipments based on current sort settings
  const sortedShipments = useMemo(() => {
    if (sortDirection === 'default') {
      return [...filteredShipments]; // Return original order
    }

    return [...filteredShipments].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortField) {
        case 'expected_date':
          valueA = new Date(a.expected_date || 0).getTime();
          valueB = new Date(b.expected_date || 0).getTime();
          break;
        case 'product_sku':
          valueA = (a.product_sku || '').toLowerCase();
          valueB = (b.product_sku || '').toLowerCase();
          break;
        case 'supplier':
          valueA = (a.supplier || '').toLowerCase();
          valueB = (b.supplier || '').toLowerCase();
          break;
        case 'ship_from_country':
          valueA = (a.ship_from_country || '').toLowerCase();
          valueB = (b.ship_from_country || '').toLowerCase();
          break;
        case 'status':
          valueA = a.status.toLowerCase();
          valueB = b.status.toLowerCase();
          break;
        case 'value':
          valueA = (a.unit_cost || 0) * a.expected_quantity;
          valueB = (b.unit_cost || 0) * b.expected_quantity;
          break;
        case 'expected_quantity':
          valueA = a.expected_quantity;
          valueB = b.expected_quantity;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredShipments, sortField, sortDirection]);

  // This part of the code formats currency values
  const formatCurrency = (value: number | null) => {
    if (!value) return '$0';
    return `$${value.toLocaleString()}`;
  };

  // This part of the code formats dates for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // This part of the code handles backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // This part of the code handles escape key press to close modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* This part of the code creates the dark backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      />
      
      {/* This part of the code creates the modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-7xl bg-white rounded-lg shadow-xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Showing {sortedShipments.length} of {shipments.length} total shipments
                {searchTerm && ` (filtered)`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search PO numbers, suppliers, origins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {sortedShipments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Information not in dataset.</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th 
                        onClick={() => handleSort('product_sku')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Product SKU</span>
                          {getSortIcon('product_sku')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('supplier')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Supplier</span>
                          {getSortIcon('supplier')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('ship_from_country')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Origin</span>
                          {getSortIcon('ship_from_country')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('expected_date')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Expected Date</span>
                          {getSortIcon('expected_date')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('status')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          {getSortIcon('status')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('value')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Value</span>
                          {getSortIcon('value')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('expected_quantity')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Items</span>
                          {getSortIcon('expected_quantity')}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedShipments.map((item, index) => (
                      <tr key={`${item.order_id}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.product_sku || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.supplier || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 text-gray-400 mr-2" />
                            {item.ship_from_country || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(item.expected_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency((item.unit_cost || 0) * item.expected_quantity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.expected_quantity} / {item.received_quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
