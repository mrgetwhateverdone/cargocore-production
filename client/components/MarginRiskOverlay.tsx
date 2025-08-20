import React, { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown, AlertTriangle, Target, Loader2, CheckCircle2 } from 'lucide-react';
import { useWorkflowCreation } from '../hooks/useWorkflows';
import type { MarginRiskAlert } from '@/types/api';

interface MarginRiskOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  marginRisk: MarginRiskAlert | null;
  recommendations: string[];
  isLoadingRecommendations: boolean;
}

/**
 * This part of the code creates an overlay for displaying Margin Risk details with workflow integration
 * Shows detailed margin analysis and allows adding AI recommendations to workflows
 */
export function MarginRiskOverlay({ 
  isOpen, 
  onClose, 
  marginRisk, 
  recommendations,
  isLoadingRecommendations 
}: MarginRiskOverlayProps) {
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
          target: 'margin_risk',
          values: [recommendation],
          priority: (marginRisk?.riskLevel === 'High' ? 'critical' : 
                    marginRisk?.riskLevel === 'Medium' ? 'high' : 'medium') as 'low' | 'medium' | 'high' | 'critical',
        },
        source: 'ai_insight',
        sourceId: `margin-risk-${marginRisk?.brandName || 'unknown'}`,
        insightTitle: `${marginRisk?.brandName} Margin Risk: ${recommendation}`,
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

  // This part of the code determines the status styling based on risk level
  const getStatusStyles = () => {
    if (!marginRisk) return { container: 'bg-gray-50 border-gray-200', text: 'text-gray-700' };
    
    switch (marginRisk.riskLevel) {
      case 'High':
        return { container: 'bg-red-50 border-red-200', text: 'text-red-700' };
      case 'Medium':
        return { container: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' };
      case 'Low':
        return { container: 'bg-blue-50 border-blue-200', text: 'text-blue-700' };
      default:
        return { container: 'bg-gray-50 border-gray-200', text: 'text-gray-700' };
    }
  };

  // This part of the code determines the status icon based on risk level
  const getStatusIcon = () => {
    if (!marginRisk) return null;
    
    switch (marginRisk.riskLevel) {
      case 'High':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case 'Medium':
        return <TrendingDown className="h-6 w-6 text-yellow-600" />;
      case 'Low':
        return <Target className="h-6 w-6 text-blue-600" />;
      default:
        return <TrendingUp className="h-6 w-6 text-gray-600" />;
    }
  };

  if (!isOpen || !marginRisk) return null;

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
              <h2 className="text-xl font-semibold text-gray-900">{marginRisk.brandName} - Margin Risk Alert</h2>
              <p className="text-sm text-gray-500">Smart Margin Risk Analysis</p>
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
                  Risk Level: {marginRisk.riskLevel}
                </div>
                <div className={`text-sm ${styles.text}`}>
                  Score: {marginRisk.riskScore}/100
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${styles.text}`}>
                  {marginRisk.currentMargin}%
                </div>
                <div className="text-xs text-gray-500">Current Margin</div>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Risk Analysis</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Brand {marginRisk.brandName} is experiencing {marginRisk.riskLevel.toLowerCase()} margin risk with a current margin of {marginRisk.currentMargin}% 
              and a risk score of {marginRisk.riskScore}/100. This analysis is based on {marginRisk.skuCount} SKUs with an average unit cost of ${marginRisk.avgUnitCost.toFixed(2)}.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900">SKU Count</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {marginRisk.skuCount}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Total SKUs in portfolio</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900">Avg Unit Cost</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${marginRisk.avgUnitCost.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Average cost per unit</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900">Inactive SKUs</span>
                  <span className={`text-lg font-semibold ${marginRisk.inactivePercentage > 20 ? 'text-red-600' : 'text-gray-900'}`}>
                    {marginRisk.inactivePercentage}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">Percentage of inactive SKUs</p>
              </div>
            </div>
          </div>

          {/* Risk Drivers */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Risk Drivers</h3>
            <div className="flex flex-wrap gap-2">
              {marginRisk.primaryDrivers.map((driver, index) => (
                <span 
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    marginRisk.riskLevel === 'High' ? 'bg-red-100 text-red-800' : 
                    marginRisk.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-blue-100 text-blue-800'
                  }`}
                >
                  {driver}
                </span>
              ))}
            </div>
          </div>

          {/* Financial Impact */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Impact</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-red-900">Potential Annual Impact:</span>
                <span className="text-xl font-bold text-red-600">
                  ${marginRisk.financialImpact.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Estimated revenue at risk if margin issues are not addressed
              </p>
            </div>
          </div>

          {/* AI Recommendations with Add to Workflows */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Recommendations</h3>
            <p className="text-sm text-gray-600 mb-4">Margin optimization strategies generated by AI analysis</p>
            
            {isLoadingRecommendations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">Generating margin optimization recommendations...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <Target className="h-4 w-4 text-blue-600 mt-1 mr-3 flex-shrink-0" />
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
