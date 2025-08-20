import React, { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Loader2, CheckCircle2 } from 'lucide-react';
import { useWorkflowCreation } from './hooks/useWorkflows';
import type { CostVarianceAnomaly } from '@/types/api';

interface CostVarianceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  anomaly: CostVarianceAnomaly | null;
  recommendations: string[];
  isLoadingRecommendations: boolean;
}

/**
 * This part of the code creates an overlay for displaying Cost Variance details with workflow integration
 * Shows detailed cost analysis and allows adding AI recommendations to workflows
 */
export function CostVarianceOverlay({ 
  isOpen, 
  onClose, 
  anomaly, 
  recommendations,
  isLoadingRecommendations 
}: CostVarianceOverlayProps) {
  const { createWorkflow, creating } = useWorkflowCreation();
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
          target: 'cost_variance',
          values: [recommendation],
          priority: (anomaly?.severity === 'High' ? 'critical' : 'high') as 'low' | 'medium' | 'high' | 'critical',
        },
        source: 'ai_insight',
        sourceId: `cost-variance-${anomaly?.warehouseId || 'unknown'}`,
        insightTitle: `${anomaly?.title}: ${recommendation}`,
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

  // This part of the code determines the status styling based on severity
  const getStatusStyles = () => {
    if (!anomaly) return { container: 'bg-gray-50 border-gray-200', text: 'text-gray-700' };
    
    switch (anomaly.severity) {
      case 'High':
        return { container: 'bg-red-50 border-red-200', text: 'text-red-700' };
      case 'Medium':
        return { container: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' };
      default:
        return { container: 'bg-gray-50 border-gray-200', text: 'text-gray-700' };
    }
  };

  // This part of the code determines the status icon based on severity
  const getStatusIcon = () => {
    if (!anomaly) return null;
    
    switch (anomaly.severity) {
      case 'High':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case 'Medium':
        return <TrendingUp className="h-6 w-6 text-yellow-600" />;
      default:
        return <DollarSign className="h-6 w-6 text-gray-600" />;
    }
  };

  if (!isOpen || !anomaly) return null;

  const styles = getStatusStyles();

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{anomaly.title}</h2>
              <p className="text-sm text-gray-500">Cost Variance Analysis</p>
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
          {/* Status Banner */}
          <div className={`rounded-lg border p-4 ${styles.container}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`text-sm font-medium ${styles.text}`}>
                  Severity: {anomaly.severity} Impact
                </div>
                <div className={`text-sm ${styles.text}`}>
                  {anomaly.type}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${styles.text}`}>
                  ${anomaly.currentValue.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Current Cost</div>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Cost Analysis</h3>
            <p className="text-gray-700 leading-relaxed mb-4">{anomaly.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900">Expected Cost</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${anomaly.expectedValue.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Baseline cost expectation</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900">Cost Variance</span>
                  <span className={`text-lg font-semibold ${anomaly.variance > 20 ? 'text-red-600' : 'text-yellow-600'}`}>
                    +{anomaly.variance}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">Above expected range</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900">Financial Impact</span>
                  <span className="text-lg font-semibold text-red-600">
                    ${anomaly.financialImpact.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Additional cost incurred</p>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Risk Factors</h3>
            <div className="flex flex-wrap gap-2">
              {anomaly.riskFactors.map((factor, index) => (
                <span 
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    anomaly.severity === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>

          {/* Warehouse & Supplier Info */}
          {(anomaly.warehouseId || anomaly.supplier) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Location Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {anomaly.warehouseId && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="font-medium text-gray-900">Warehouse:</span>
                    <span className="ml-2 text-gray-700">{anomaly.warehouseId}</span>
                  </div>
                )}
                {anomaly.supplier && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="font-medium text-gray-900">Supplier:</span>
                    <span className="ml-2 text-gray-700">{anomaly.supplier}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Recommendations with Add to Workflows */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Recommendations</h3>
            <p className="text-sm text-gray-600 mb-4">Cost reduction strategies generated by AI analysis</p>
            
            {isLoadingRecommendations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">Generating cost optimization recommendations...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <DollarSign className="h-4 w-4 text-blue-600 mt-1 mr-3 flex-shrink-0" />
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
