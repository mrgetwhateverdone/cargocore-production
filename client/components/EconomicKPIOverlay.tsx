import { useEffect, useState } from 'react';
import { X, TrendingUp, AlertTriangle, CheckCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useWorkflowCreation } from '../hooks/useWorkflows';

interface EconomicKPIOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  kpi: {
    id: string;
    title: string;
    value: string | number;
    description: string;
    status: 'critical' | 'warning' | 'good';
    detailedAnalysis: string;
    keyMetrics: Array<{
      label: string;
      value: string | number;
      description: string;
    }>;
    recommendations: string[];
  } | null;
}

/**
 * This part of the code creates an overlay for displaying Economic KPI details with workflow integration
 * Shows detailed analysis and allows adding AI recommendations to workflows
 */
export function EconomicKPIOverlay({ isOpen, onClose, kpi }: EconomicKPIOverlayProps) {
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

  // This part of the code determines the status icon based on KPI performance
  const getStatusIcon = () => {
    if (!kpi) return null;
    
    switch (kpi.status) {
      case 'critical':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      default:
        return <CheckCircle className="h-6 w-6 text-green-600" />;
    }
  };

  // This part of the code gets status-based styling for the overlay
  const getStatusStyles = () => {
    if (!kpi) return { container: 'bg-gray-50 border-gray-200', text: 'text-gray-700' };
    
    switch (kpi.status) {
      case 'critical':
        return { container: 'bg-red-50 border-red-200', text: 'text-red-700' };
      case 'warning':
        return { container: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' };
      default:
        return { container: 'bg-green-50 border-green-200', text: 'text-green-700' };
    }
  };

  // This part of the code handles adding recommendations to workflows (copied from Dashboard pattern)
  const handleActionClick = async (recommendation: string, index: number) => {
    setProcessingActionId(index);
    
    try {
      // This part of the code creates workflow from the specific recommendation clicked
      await createWorkflow({
        action: {
          label: recommendation,
          type: 'create_workflow',
          target: 'economic_intelligence',
          values: [recommendation],
          priority: (kpi?.status === 'critical' ? 'critical' :
                    kpi?.status === 'warning' ? 'high' : 'medium') as 'low' | 'medium' | 'high' | 'critical',
        },
        source: 'ai_insight',
        sourceId: kpi?.id || `economic-kpi-${Date.now()}`,
        insightTitle: `${kpi?.title}: ${recommendation}`,
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

  if (!isOpen || !kpi) return null;

  const styles = getStatusStyles();

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{kpi.title}</h2>
              <p className="text-sm text-gray-500">{kpi.description}</p>
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
          {/* Current Value */}
          <div className={`rounded-lg border p-4 mb-6 ${styles.container}`}>
            <div className="text-center">
              <div className={`text-3xl font-bold ${styles.text}`}>
                {kpi.value}
              </div>
              <p className="text-sm text-gray-600 mt-1">Current Performance</p>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Analysis</h3>
            <p className="text-gray-700 leading-relaxed">{kpi.detailedAnalysis}</p>
          </div>

          {/* Key Metrics */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Metrics</h3>
            <div className="space-y-3">
              {kpi.keyMetrics.map((metric, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-900">{metric.label}</span>
                    <span className="text-lg font-semibold text-gray-900">{metric.value}</span>
                  </div>
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations with Add to Workflows */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Recommendations</h3>
            <p className="text-sm text-gray-600 mb-4">Actionable insights generated by AI analysis</p>
            <div className="space-y-3">
              {kpi.recommendations.map((recommendation, index) => (
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
          </div>
        </div>
      </div>
    </div>
  );
}
