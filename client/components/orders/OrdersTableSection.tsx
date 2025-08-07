import { useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import type { OrderData } from "@/types/api";
import { useOrderSuggestion } from "@/hooks/useOrdersData";

interface OrdersTableSectionProps {
  orders: OrderData[];
  totalCount: number;
  hasMore: boolean;
  isLoading?: boolean;
  onViewAll?: () => void;
}

export function OrdersTableSection({ 
  orders, 
  totalCount, 
  hasMore, 
  isLoading, 
  onViewAll 
}: OrdersTableSectionProps) {
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const orderSuggestionMutation = useOrderSuggestion();

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

  // This part of the code handles AI suggestion generation for specific orders
  const handleViewOrder = async (order: OrderData) => {
    setProcessingOrderId(order.order_id);
    try {
      await orderSuggestionMutation.mutateAsync(order);
    } finally {
      setProcessingOrderId(null);
    }
  };

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
          {hasMore && (
            <button
              onClick={onViewAll}
              className="ml-2 text-blue-600 hover:text-blue-800 underline"
            >
              View All
            </button>
          )}
        </p>
      </div>

      {/* This part of the code displays the orders table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Loading real order data from TinyBird...
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No orders found for the specified company and brand</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SLA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
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
                    
                    {/* This part of the code displays the AI suggestion action button */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewOrder(order)}
                        disabled={processingOrderId === order.order_id || orderSuggestionMutation.isPending}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingOrderId === order.order_id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
