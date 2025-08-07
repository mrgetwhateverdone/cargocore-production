import { useState, useMemo } from "react";
import { Eye, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import type { OrderData } from "@/types/api";

interface OrdersTableSectionProps {
  orders: OrderData[];
  totalCount: number;
  hasMore: boolean;
  isLoading?: boolean;
  onViewAll?: () => void;
  onViewOrder?: (order: OrderData) => void;
}

type SortField = 'order_id' | 'created_date' | 'brand_name' | 'status' | 'sla_status';
type SortDirection = 'asc' | 'desc' | 'default';

export function OrdersTableSection({ 
  orders, 
  totalCount, 
  hasMore, 
  isLoading, 
  onViewAll,
  onViewOrder 
}: OrdersTableSectionProps) {
  const [sortField, setSortField] = useState<SortField>('created_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc'); // Default to most recent first

  // This part of the code determines the color for order status badges
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed') || statusLower.includes('delivered')) return 'bg-green-100 text-green-800';
    if (statusLower.includes('shipped') || statusLower.includes('transit')) return 'bg-blue-100 text-blue-800';
    if (statusLower.includes('processing') || statusLower.includes('pending')) return 'bg-yellow-100 text-yellow-800';
    if (statusLower.includes('delayed') || statusLower.includes('at_risk')) return 'bg-red-100 text-red-800';
    if (statusLower.includes('cancelled')) return 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };

  // This part of the code determines the color for SLA status badges
  const getSLAColor = (slaStatus: string) => {
    const slaLower = slaStatus.toLowerCase();
    if (slaLower.includes('on_time') || slaLower.includes('on time')) return 'bg-green-100 text-green-800';
    if (slaLower.includes('at_risk') || slaLower.includes('at risk')) return 'bg-yellow-100 text-yellow-800';
    if (slaLower.includes('breach') || slaLower.includes('late')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  // This part of the code handles opening the AI explanation modal for specific orders
  const handleViewOrder = (order: OrderData) => {
    if (onViewOrder) {
      onViewOrder(order);
    }
  };

  // This part of the code handles column sorting with 3-state cycle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through states: desc -> asc -> default
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else if (sortDirection === 'asc') {
        setSortDirection('default');
        setSortField('created_date'); // Reset to default sort
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

  // This part of the code sorts the orders based on current sort settings
  const sortedOrders = useMemo(() => {
    if (sortDirection === 'default') {
      return [...orders]; // Return original order
    }

    return [...orders].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortField) {
        case 'created_date':
          valueA = new Date(a.created_date).getTime();
          valueB = new Date(b.created_date).getTime();
          break;
        case 'order_id':
          valueA = a.order_id.toLowerCase();
          valueB = b.order_id.toLowerCase();
          break;
        case 'brand_name':
          valueA = a.brand_name.toLowerCase();
          valueB = b.brand_name.toLowerCase();
          break;
        case 'status':
          valueA = a.status.toLowerCase();
          valueB = b.status.toLowerCase();
          break;
        case 'sla_status':
          valueA = a.sla_status.toLowerCase();
          valueB = b.sla_status.toLowerCase();
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, sortField, sortDirection]);

  // This part of the code formats dates for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Orders</h2>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* This part of the code displays the table header with record count */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Orders</h2>
        <p className="text-sm text-gray-500">
          Showing {orders.length} of {totalCount} orders
        </p>
      </div>

      {/* This part of the code displays the orders table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">


        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">Information not in dataset.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    onClick={() => handleSort('order_id')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Order ID</span>
                      {getSortIcon('order_id')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('created_date')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      {getSortIcon('created_date')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('brand_name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Brand</span>
                      {getSortIcon('brand_name')}
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
                    onClick={() => handleSort('sla_status')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div className="flex items-center space-x-1">
                      <span>SLA</span>
                      {getSortIcon('sla_status')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedOrders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-gray-50">
                    {/* This part of the code displays the order ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.order_id}
                      </div>
                    </td>
                    
                    {/* This part of the code displays the order date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.created_date)}
                      </div>
                    </td>
                    
                    {/* This part of the code displays the brand name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {order.brand_name}
                      </div>
                    </td>
                    
                    {/* This part of the code displays the order status with color coding */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    
                    {/* This part of the code displays the SLA status with color coding */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSLAColor(order.sla_status)}`}>
                        {order.sla_status.replace('_', ' ')}
                      </span>
                    </td>
                    
                    {/* This part of the code displays the view order action button */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mx-auto"
                        title="View order details and AI analysis"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* This part of the code displays the bubble View All button at the bottom */}
        {hasMore && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
            <button
              onClick={onViewAll}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              View All Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
