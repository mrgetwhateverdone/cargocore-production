import { useEffect, useState } from 'react';
import { X, TrendingUp, Package, DollarSign, Loader2, CheckCircle2, Target } from 'lucide-react';
import { useWorkflowCreation } from '../hooks/useWorkflows';
import { ProgressBar } from './ui/progress-bar';
import type { BrandPerformance } from '@/types/api';

interface BrandInventoryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  brand: BrandPerformance | null;
  recommendations: string[];
  isLoadingRecommendations: boolean;
}

/**
 * This part of the code creates an overlay for displaying Brand Inventory Investment details with workflow integration
 * Shows detailed brand analysis and allows adding AI recommendations to workflows
 */
export function BrandInventoryOverlay({ 
  isOpen, 
  onClose, 
  brand, 
  recommendations,
  isLoadingRecommendations 
}: BrandInventoryOverlayProps) {
  const { createWorkflow } = useWorkflowCreation();
  const [processingActionId, setProcessingActionId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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

  // This part of the code handles adding recommendations to workflows
  const handleActionClick = async (recommendation: string, index: number) => {
    setProcessingActionId(index);
    
    try {
      await createWorkflow({
        action: {
          label: recommendation,
          type: 'create_workflow',
          target: 'brand_inventory',
          values: [recommendation],
          priority: (brand?.efficiency_score && brand.efficiency_score < 70 ? 'high' : 'medium') as 'low' | 'medium' | 'high' | 'critical',
        },
        source: 'ai_insight',
        sourceId: `brand-inventory-${brand?.brand_name || 'unknown'}`,
        insightTitle: `${brand?.brand_name} Brand Investment: ${recommendation}`,
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Failed to create workflow:', error);
      alert('Failed to create workflow. Please try again.');
    } finally {
      setProcessingActionId(null);
    }
  };

  // This part of the code determines the performance styling based on efficiency score
  const getPerformanceStyles = () => {
    if (!brand) return { container: 'bg-gray-50 border-gray-200', text: 'text-gray-700' };
    
    if (brand.efficiency_score >= 85) {
      return { container: 'bg-green-50 border-green-200', text: 'text-green-700' };
    } else if (brand.efficiency_score >= 70) {
      return { container: 'bg-blue-50 border-blue-200', text: 'text-blue-700' };
    } else if (brand.efficiency_score >= 50) {
      return { container: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' };
    } else {
      return { container: 'bg-red-50 border-red-200', text: 'text-red-700' };
    }
  };

  // This part of the code determines the performance icon based on efficiency score
  const getPerformanceIcon = () => {
    if (!brand) return null;
    
    if (brand.efficiency_score >= 85) {
      return <TrendingUp className="h-6 w-6 text-green-600" />;
    } else if (brand.efficiency_score >= 70) {
      return <Target className="h-6 w-6 text-blue-600" />;
    } else if (brand.efficiency_score >= 50) {
      return <Package className="h-6 w-6 text-yellow-600" />;
    } else {
      return <TrendingUp className="h-6 w-6 text-red-600 transform rotate-180" />;
    }
  };

  // This part of the code determines the investment classification
  const getInvestmentClass = () => {
    if (!brand) return "Standard Investment";
    
    if (brand.avg_value_per_sku > 50) return "Premium Portfolio";
    else if (brand.avg_value_per_sku > 20) return "High-Value Brand";
    else if (brand.avg_value_per_sku > 10) return "Mid-Tier Brand";
    else if (brand.avg_value_per_sku > 5) return "Value Brand";
    else return "Economy Brand";
  };

  // This part of the code formats currency values
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toLocaleString()}`;
  };

  if (!isOpen || !brand) return null;

  const styles = getPerformanceStyles();

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getPerformanceIcon()}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{brand.brand_name}</h2>
              <p className="text-sm text-gray-500">Brand Inventory Investment Analysis</p>
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
        <div className="p-6 space-y-6">
          {/* Performance Summary */}
          <div className={`rounded-lg border p-4 ${styles.container}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`text-sm font-medium ${styles.text}`}>
                  Investment Class: {getInvestmentClass()}
                </div>
                <div className={`text-sm ${styles.text}`}>
                  Efficiency: {brand.efficiency_score}%
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${styles.text}`}>
                  {formatCurrency(brand.total_value)}
                </div>
                <div className="text-xs text-gray-500">Total Investment</div>
              </div>
            </div>
          </div>

          {/* Investment Metrics */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Analysis</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              {brand.brand_name} represents {brand.portfolio_percentage}% of your total inventory portfolio with 
              {brand.sku_count} SKUs. This brand has an average value per SKU of {formatCurrency(brand.avg_value_per_sku)} 
              and maintains an efficiency score of {brand.efficiency_score}%.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span className="text-lg font-semibold text-blue-600">
                    {brand.sku_count}
                  </span>
                </div>
                <p className="text-sm text-blue-800 font-medium">SKUs in Portfolio</p>
                <p className="text-xs text-blue-600 mt-1">Product diversity</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-semibold text-green-600">
                    {formatCurrency(brand.total_value)}
                  </span>
                </div>
                <p className="text-sm text-green-800 font-medium">Total Investment</p>
                <p className="text-xs text-green-600 mt-1">Portfolio value</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span className="text-lg font-semibold text-purple-600">
                    {formatCurrency(brand.avg_value_per_sku)}
                  </span>
                </div>
                <p className="text-sm text-purple-800 font-medium">Avg Value/SKU</p>
                <p className="text-xs text-purple-600 mt-1">Investment density</p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span className="text-lg font-semibold text-orange-600">
                    {brand.portfolio_percentage}%
                  </span>
                </div>
                <p className="text-sm text-orange-800 font-medium">Portfolio Share</p>
                <p className="text-xs text-orange-600 mt-1">Investment weight</p>
              </div>
            </div>
          </div>

          {/* Efficiency Analysis */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Efficiency Analysis</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <ProgressBar
                value={brand.efficiency_score}
                label="Efficiency Score"
                showPercentage={true}
                size="md"
                className="mb-3"
              />
              <p className="text-sm text-gray-600">
                {brand.efficiency_score >= 85 ? 'Excellent performance - brand is maximizing ROI' :
                 brand.efficiency_score >= 70 ? 'Good performance - minor optimization opportunities' :
                 brand.efficiency_score >= 50 ? 'Moderate performance - improvement needed' :
                 'Poor performance - requires immediate attention'}
              </p>
            </div>
          </div>

          {/* Quantity Overview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Inventory Quantity</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-900">Total Units in Stock:</span>
                <span className="text-xl font-bold text-blue-600">
                  {brand.total_quantity.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Average {Math.round(brand.total_quantity / brand.sku_count)} units per SKU
              </p>
            </div>
          </div>

          {/* AI Recommendations with Add to Workflows */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Investment Recommendations</h3>
            <p className="text-sm text-gray-600 mb-4">Strategic optimization insights generated by AI analysis</p>
            
            {isLoadingRecommendations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">Generating brand investment optimization strategies...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <TrendingUp className="h-4 w-4 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700 flex-1">{recommendation}</span>
                      </div>
                      <button
                        onClick={() => handleActionClick(recommendation, index)}
                        disabled={processingActionId === index || showSuccess}
                        className="ml-4 inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingActionId === index ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Adding...
                          </>
                        ) : showSuccess ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Added
                          </>
                        ) : (
                          '+ Add to Workflows'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
