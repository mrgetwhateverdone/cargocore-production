import { X } from "lucide-react";
import type { OrderData } from "@/types/api";

interface ViewAllOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderData[];
  totalCount: number;
}

export function ViewAllOrdersModal({ isOpen, onClose, orders, totalCount }: ViewAllOrdersModalProps) {
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

  // This part of the code formats dates for display
  const formatDate = (dateString: string) => {
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
        <div className="relative w-full max-w-6xl bg-white rounded-lg shadow-xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">All Orders</h2>
              <p className="text-sm text-gray-500 mt-1">
                Showing {orders.length} of {totalCount} total orders
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
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
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
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expected
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order, index) => (
                      <tr key={`${order.order_id}-${index}`} className="hover:bg-gray-50">
                        {/* Order ID */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.order_id}
                          </div>
                        </td>
                        
                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(order.created_date)}
                          </div>
                        </td>
                        
                        {/* Brand */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.brand_name}
                          </div>
                        </td>
                        
                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        
                        {/* SLA Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSLAColor(order.sla_status)}`}>
                            {order.sla_status.replace('_', ' ')}
                          </span>
                        </td>
                        
                        {/* Supplier */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.supplier || 'N/A'}
                          </div>
                        </td>
                        
                        {/* Expected Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.expected_date ? formatDate(order.expected_date) : 'N/A'}
                          </div>
                        </td>
                        
                        {/* Quantity */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.received_quantity} / {order.expected_quantity}
                          </div>
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
