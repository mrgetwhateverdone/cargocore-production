import { useState, useMemo } from "react";
import { X, ChevronUp, ChevronDown, ArrowUpDown, Search } from "lucide-react";
import type { InventoryItem } from "@/types/api";

interface ViewAllInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  totalCount: number;
}

type SortField = 'sku' | 'product_name' | 'brand_name' | 'on_hand' | 'committed' | 'available' | 'status';
type SortDirection = 'asc' | 'desc' | 'default';

export function ViewAllInventoryModal({ isOpen, onClose, inventory, totalCount }: ViewAllInventoryModalProps) {
  const [sortField, setSortField] = useState<SortField>('sku');
  const [sortDirection, setSortDirection] = useState<SortDirection>('default');
  const [searchTerm, setSearchTerm] = useState('');

  // This part of the code handles column sorting with 3-state cycle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through states: desc -> asc -> default
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else if (sortDirection === 'asc') {
        setSortDirection('default');
        setSortField('sku'); // Reset to default sort
      } else {
        setSortDirection('desc');
      }
    } else {
      setSortField(field);
      setSortDirection('desc'); // Always start with highest/most first
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

  // This part of the code filters inventory based on search term
  const filteredInventory = useMemo(() => {
    if (!searchTerm.trim()) return inventory;
    
    const searchLower = searchTerm.toLowerCase();
    return inventory.filter(item =>
      item.sku.toLowerCase().includes(searchLower) ||
      item.product_name.toLowerCase().includes(searchLower) ||
      item.brand_name.toLowerCase().includes(searchLower) ||
      item.status.toLowerCase().includes(searchLower) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchLower))
    );
  }, [inventory, searchTerm]);

  // This part of the code sorts the filtered inventory
  const sortedInventory = useMemo(() => {
    if (sortDirection === 'default') {
      return filteredInventory;
    }

    return [...filteredInventory].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle null/undefined values
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      // This part of the code handles different data types for sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [filteredInventory, sortField, sortDirection]);

  // This part of the code determines the color for inventory status badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      case 'Overstocked':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">All Inventory</h2>
            <p className="text-sm text-gray-500 mt-1">
              Showing {sortedInventory.length} of {totalCount} SKUs
              {searchTerm && ` (filtered from ${inventory.length})`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by SKU, product name, brand, status, or supplier..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('sku')}
                >
                  <div className="flex items-center space-x-1">
                    <span>SKU</span>
                    {getSortIcon('sku')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('product_name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Product Name</span>
                    {getSortIcon('product_name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('brand_name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Brand</span>
                    {getSortIcon('brand_name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('on_hand')}
                >
                  <div className="flex items-center space-x-1">
                    <span>On Hand</span>
                    {getSortIcon('on_hand')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('committed')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Committed</span>
                    {getSortIcon('committed')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('available')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Available</span>
                    {getSortIcon('available')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
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
              {sortedInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <p className="text-gray-500">Information not in dataset.</p>
                  </td>
                </tr>
              ) : (
                sortedInventory.map((item, index) => (
                  <tr key={`${item.sku}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.brand_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.on_hand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.committed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.available}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {sortedInventory.length} of {totalCount} SKUs shown
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
