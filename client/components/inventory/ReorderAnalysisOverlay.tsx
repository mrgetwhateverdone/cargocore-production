import { useEffect } from 'react';
import { X, Package, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface ReorderAnalysisData {
  sku: string;
  product_name: string;
  current_stock: number;
  available_stock: number;
  supplier: string;
  unit_cost: number;
  daily_usage_rate: number;
  lead_time_days: number;
  reorder_date: string;
  recommended_quantity: number;
  reorder_cost: number;
  days_until_stockout: number;
  safety_stock: number;
  status: 'critical' | 'warning' | 'good';
}

interface ReorderAnalysisOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  reorderData: ReorderAnalysisData | null;
}

/**
 * This part of the code creates a reorder analysis overlay matching the Economic Intelligence design
 * Shows detailed reorder recommendations with the same layout and functionality
 */
export function ReorderAnalysisOverlay({ isOpen, onClose, reorderData }: ReorderAnalysisOverlayProps) {
  // This part of the code handles escape key and prevents body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // This part of the code determines the status icon based on urgency
  const getStatusIcon = () => {
    if (!reorderData) return null;
    
    switch (reorderData.status) {
      case 'critical':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case 'warning':
        return <Clock className="h-6 w-6 text-yellow-600" />;
      default:
        return <CheckCircle className="h-6 w-6 text-green-600" />;
    }
  };

  // This part of the code gets status-based styling for the overlay
  const getStatusStyles = () => {
    if (!reorderData) return { container: 'bg-gray-50 border-gray-200', text: 'text-gray-700' };
    
    switch (reorderData.status) {
      case 'critical':
        return { container: 'bg-red-50 border-red-200', text: 'text-red-700' };
      case 'warning':
        return { container: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' };
      default:
        return { container: 'bg-green-50 border-green-200', text: 'text-green-700' };
    }
  };

  // This part of the code generates status-appropriate messages
  const getStatusMessage = () => {
    if (!reorderData) return "No data available";
    
    if (reorderData.days_until_stockout <= 0) {
      return "Out of stock - immediate reorder required";
    } else if (reorderData.days_until_stockout <= 7) {
      return `${reorderData.days_until_stockout} days until stockout`;
    } else if (reorderData.days_until_stockout <= 14) {
      return `${reorderData.days_until_stockout} days until reorder needed`;
    } else {
      return `Stock sufficient for ${reorderData.days_until_stockout} days`;
    }
  };

  // This part of the code generates actionable recommendations
  const getRecommendations = () => {
    if (!reorderData) return [];
    
    const recommendations = [];
    
    if (reorderData.days_until_stockout <= 7) {
      recommendations.push(`Contact ${reorderData.supplier} immediately for expedited delivery`);
      recommendations.push(`Order ${formatNumber(reorderData.recommended_quantity)} units to prevent stockout`);
    }
    
    if (reorderData.lead_time_days > 14) {
      recommendations.push("Consider alternative suppliers with shorter lead times");
    }
    
    if (reorderData.daily_usage_rate > 5) {
      recommendations.push("High usage product - consider increasing safety stock levels");
    }
    
    recommendations.push("Set up automated reorder alerts for this SKU");
    recommendations.push("Review demand forecasting to optimize inventory levels");
    
    return recommendations;
  };

  if (!isOpen || !reorderData) return null;

  const styles = getStatusStyles();
  const recommendations = getRecommendations();

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Reorder Analysis: {reorderData.sku}</h2>
              <p className="text-sm text-gray-500">{reorderData.product_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Status */}
          <div className={`rounded-lg border p-4 mb-6 ${styles.container}`}>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon()}
              </div>
              <div className={`text-2xl font-bold ${styles.text} mb-1`}>
                {getStatusMessage()}
              </div>
              <p className="text-sm text-gray-600">
                Current Stock: {formatNumber(reorderData.current_stock)} | Available: {formatNumber(reorderData.available_stock)}
              </p>
            </div>
          </div>

          {/* Reorder Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Reorder Recommendation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {reorderData.reorder_date}
                  </div>
                  <p className="text-sm text-blue-800">Recommended Reorder Date</p>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(reorderData.recommended_quantity)}
                  </div>
                  <p className="text-sm text-green-800">Recommended Quantity</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Metrics</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900">Supplier</span>
                  <span className="text-lg font-semibold text-gray-900">{reorderData.supplier}</span>
                </div>
                <p className="text-sm text-gray-600">Primary supplier for this SKU</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900">Lead Time</span>
                  <span className="text-lg font-semibold text-gray-900">{reorderData.lead_time_days} days</span>
                </div>
                <p className="text-sm text-gray-600">Average delivery time from supplier</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900">Daily Usage Rate</span>
                  <span className="text-lg font-semibold text-gray-900">{reorderData.daily_usage_rate} units/day</span>
                </div>
                <p className="text-sm text-gray-600">Average consumption based on historical data</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900">Reorder Cost</span>
                  <span className="text-lg font-semibold text-gray-900">{formatCurrency(reorderData.reorder_cost)}</span>
                </div>
                <p className="text-sm text-gray-600">Total cost for recommended quantity</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900">Safety Stock</span>
                  <span className="text-lg font-semibold text-gray-900">{formatNumber(reorderData.safety_stock)} units</span>
                </div>
                <p className="text-sm text-gray-600">Buffer stock to prevent stockouts</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
            <div className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start">
                  <TrendingUp className="h-4 w-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
