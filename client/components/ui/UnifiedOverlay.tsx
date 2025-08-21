// This part of the code creates a unified overlay system that consolidates all overlay patterns
// Replaces 7+ duplicate overlay components with one standardized, configurable component

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { X, AlertTriangle, TrendingUp, DollarSign, Loader2, CheckCircle, Package, Target } from 'lucide-react';
import { useWorkflowCreation } from '../../hooks/useWorkflows';
import { BrainIcon } from './BrainIcon';
import { Button } from './button';
import { Badge } from './badge';

// This part of the code defines the flexible data structure for any overlay type
interface UnifiedOverlayData {
  id: string;
  title: string;
  description?: string;
  severity?: 'critical' | 'warning' | 'info' | 'good';
  dollarImpact?: number;
  source?: string;
  createdAt?: string;
  // Extended fields for different overlay types
  metadata?: Record<string, any>;
  metrics?: Array<{
    label: string;
    value: string | number;
    description?: string;
    icon?: ReactNode;
  }>;
}

// This part of the code defines the standardized overlay configuration
interface OverlaySection {
  title: string;
  content: ReactNode;
  className?: string;
}

interface UnifiedOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  data: UnifiedOverlayData | null;
  agentName?: string;
  overlayType: 'insight' | 'brand' | 'cost-variance' | 'margin-risk' | 'economic-kpi' | 'warehouse' | 'reorder';
  
  // This part of the code allows custom sections to be added for specific overlay types
  customSections?: OverlaySection[];
  
  // This part of the code handles recommendations and loading states
  recommendations?: string[];
  isLoadingRecommendations?: boolean;
  onFetchRecommendations?: () => Promise<string[]>;
  
  // This part of the code allows custom context data for AI generation
  contextData?: Record<string, any>;
}

// This part of the code creates the unified overlay component that replaces all existing overlays
export function UnifiedOverlay({
  isOpen,
  onClose,
  data,
  agentName = "AI Agent",
  overlayType,
  customSections = [],
  recommendations = [],
  isLoadingRecommendations = false,
  onFetchRecommendations,
  contextData = {}
}: UnifiedOverlayProps) {
  const { createWorkflow } = useWorkflowCreation();
  const [processingActionId, setProcessingActionId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>(recommendations);
  const [loadingRecs, setLoadingRecs] = useState(isLoadingRecommendations);

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

  // This part of the code fetches AI recommendations when overlay opens
  const fetchRecommendations = useCallback(async () => {
    if (!onFetchRecommendations || !data) return;
    
    setLoadingRecs(true);
    try {
      const recs = await onFetchRecommendations();
      setAiRecommendations(recs);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      // This part of the code provides fallback recommendations based on overlay type
      const fallbackRecs = getFallbackRecommendations(overlayType, data.severity || 'info');
      setAiRecommendations(fallbackRecs);
    } finally {
      setLoadingRecs(false);
    }
  }, [onFetchRecommendations, data, overlayType]);

  useEffect(() => {
    if (isOpen && data && onFetchRecommendations) {
      fetchRecommendations();
    } else if (isOpen && recommendations.length > 0) {
      setAiRecommendations(recommendations);
    }
  }, [isOpen, data, onFetchRecommendations, recommendations, fetchRecommendations]);

  // This part of the code handles workflow creation with standardized patterns
  const handleActionClick = async (action: string, index: number) => {
    if (!data) return;
    
    setProcessingActionId(index);
    
    try {
      await createWorkflow({
        action: {
          label: action,
          type: 'create_workflow',
          target: getWorkflowTarget(overlayType),
          values: [action],
          priority: getSeverityPriority(data.severity || 'info'),
        },
        source: `ai_${overlayType}`,
        sourceId: data.id,
        insightTitle: data.title,
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

  if (!isOpen || !data) return null;

  const severityConfig = getSeverityConfig(data.severity || 'info');
  const typeConfig = getOverlayTypeConfig(overlayType);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* This part of the code renders the unified header with dynamic icons and styling */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {typeConfig.icon}
            <div>
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-gray-900">{data.title}</h2>
                <BrainIcon className="h-6 w-6 ml-3 text-blue-600" />
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className={severityConfig.badge}>
                  {typeConfig.label}
                </Badge>
                <span className="text-sm text-gray-500">
                  Generated by {agentName} • ID: {data.id}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* This part of the code shows success state when workflow is created */}
        {showSuccess && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-700 font-medium">✓ Workflow created successfully!</span>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* This part of the code displays the main content with severity-based styling */}
          {data.description && (
            <div className={`border rounded-lg p-4 ${severityConfig.container}`}>
              <div className="flex items-start justify-between mb-3">
                <h3 className={`font-semibold ${severityConfig.text}`}>{typeConfig.summaryTitle}</h3>
                {data.severity && (
                  <Badge className={severityConfig.badge}>
                    {data.severity.charAt(0).toUpperCase() + data.severity.slice(1)}
                  </Badge>
                )}
              </div>
              <p className={`text-sm leading-relaxed ${severityConfig.text}`}>
                {data.description}
              </p>
            </div>
          )}

          {/* This part of the code shows financial impact if available */}
          {data.dollarImpact && data.dollarImpact > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-700">Financial Impact</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">
                ${data.dollarImpact.toLocaleString()}
              </p>
              <p className="text-sm text-green-600">Estimated impact if addressed</p>
            </div>
          )}

          {/* This part of the code displays metrics if available */}
          {data.metrics && data.metrics.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Key Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.metrics.map((metric, index) => (
                  <div key={index} className="flex items-start">
                    {metric.icon && <div className="mr-3 mt-1">{metric.icon}</div>}
                    <div>
                      <div className="flex items-baseline">
                        <span className="text-lg font-semibold text-gray-900">{metric.value}</span>
                        <span className="ml-2 text-sm text-gray-600">{metric.label}</span>
                      </div>
                      {metric.description && (
                        <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* This part of the code renders custom sections for specific overlay types */}
          {customSections.map((section, index) => (
            <div key={index} className={section.className || "bg-gray-50 border border-gray-200 rounded-lg p-4"}>
              <h3 className="font-semibold text-gray-900 mb-3">{section.title}</h3>
              {section.content}
            </div>
          ))}

          {/* This part of the code renders AI recommendations with unified blue UI */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Recommendations</h3>
            <p className="text-sm text-gray-600 mb-4">Strategic optimization insights generated by AI analysis</p>
            
            {loadingRecs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">Generating strategic recommendations...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {aiRecommendations.map((recommendation, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <TrendingUp className="h-4 w-4 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700 flex-1">{recommendation}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleActionClick(recommendation, index)}
                        disabled={processingActionId === index || showSuccess}
                        className="ml-4 text-blue-600 bg-blue-100 border-blue-300 hover:bg-blue-200"
                      >
                        {processingActionId === index ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Adding...
                          </>
                        ) : showSuccess ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Added
                          </>
                        ) : (
                          '+ Add to Workflows'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* This part of the code provides metadata footer */}
          <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
            {data.createdAt && <p>Created: {new Date(data.createdAt).toLocaleString()}</p>}
            {data.source && <p>Source: {data.source.replace('_', ' ')} • Type: AI Analysis</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// This part of the code provides configuration for different overlay types
function getOverlayTypeConfig(type: UnifiedOverlayProps['overlayType']) {
  const configs = {
    'insight': {
      icon: <AlertTriangle className="h-6 w-6 text-blue-600" />,
      label: 'AI Generated Insight',
      summaryTitle: 'Insight Summary'
    },
    'brand': {
      icon: <Package className="h-6 w-6 text-purple-600" />,
      label: 'Brand Analysis',
      summaryTitle: 'Brand Performance Summary'
    },
    'cost-variance': {
      icon: <DollarSign className="h-6 w-6 text-red-600" />,
      label: 'Cost Variance Analysis',
      summaryTitle: 'Cost Analysis Summary'
    },
    'margin-risk': {
      icon: <AlertTriangle className="h-6 w-6 text-orange-600" />,
      label: 'Margin Risk Analysis',
      summaryTitle: 'Risk Assessment Summary'
    },
    'economic-kpi': {
      icon: <TrendingUp className="h-6 w-6 text-green-600" />,
      label: 'Economic Intelligence',
      summaryTitle: 'KPI Analysis Summary'
    },
    'warehouse': {
      icon: <Package className="h-6 w-6 text-indigo-600" />,
      label: 'Warehouse Optimization',
      summaryTitle: 'Optimization Summary'
    },
    'reorder': {
      icon: <Target className="h-6 w-6 text-teal-600" />,
      label: 'Reorder Analysis',
      summaryTitle: 'Reorder Analysis Summary'
    }
  };
  
  return configs[type] || configs['insight'];
}

// This part of the code provides severity-based styling configurations
function getSeverityConfig(severity: NonNullable<UnifiedOverlayData['severity']>) {
  const configs = {
    'critical': {
      container: 'bg-red-50 border-red-200',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-700'
    },
    'warning': {
      container: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-700',
      badge: 'bg-yellow-100 text-yellow-700'
    },
    'info': {
      container: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-700'
    },
    'good': {
      container: 'bg-green-50 border-green-200',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-700'
    }
  };
  
  return configs[severity] || configs['info'];
}

// This part of the code maps overlay types to workflow targets
function getWorkflowTarget(overlayType: UnifiedOverlayProps['overlayType']): string {
  const targets = {
    'insight': 'insight_management',
    'brand': 'brand_optimization',
    'cost-variance': 'cost_management',
    'margin-risk': 'risk_management',
    'economic-kpi': 'economic_intelligence',
    'warehouse': 'warehouse_optimization',
    'reorder': 'inventory_management'
  };
  
  return targets[overlayType] || 'general';
}

// This part of the code converts severity to workflow priority
function getSeverityPriority(severity: NonNullable<UnifiedOverlayData['severity']>): 'low' | 'medium' | 'high' | 'critical' {
  const priorities = {
    'critical': 'critical' as const,
    'warning': 'high' as const,
    'info': 'medium' as const,
    'good': 'low' as const
  };
  
  return priorities[severity] || 'medium';
}

// This part of the code provides fallback recommendations based on overlay type and severity
function getFallbackRecommendations(overlayType: UnifiedOverlayProps['overlayType'], severity: NonNullable<UnifiedOverlayData['severity']>): string[] {
  const fallbacks = {
    'insight': {
      'critical': [
        'Activate emergency response protocol and assemble crisis management team',
        'Implement immediate containment measures to prevent further impact',
        'Conduct urgent root cause analysis with all stakeholders'
      ],
      'warning': [
        'Establish proactive monitoring and early warning alert systems',
        'Optimize resource allocation and capacity management protocols',
        'Implement process standardization and performance benchmarking'
      ],
      'info': [
        'Deploy advanced analytics and performance optimization tools',
        'Implement best practice sharing and knowledge management systems',
        'Establish innovation labs for testing operational improvements'
      ],
      'good': [
        'Continue current optimization strategies and expand to other areas',
        'Document best practices for knowledge sharing across teams',
        'Set up monitoring to maintain current performance levels'
      ]
    },
    'brand': {
      'critical': ['Immediate brand portfolio review', 'Emergency supplier negotiation', 'Critical inventory rebalancing'],
      'warning': ['Brand performance optimization', 'Supplier relationship enhancement', 'Inventory strategy refinement'],
      'info': ['Brand growth strategy development', 'Market expansion analysis', 'Performance benchmarking'],
      'good': ['Success pattern replication', 'Growth acceleration planning', 'Market leadership consolidation']
    },
    'cost-variance': {
      'critical': ['Emergency cost containment', 'Immediate supplier renegotiation', 'Crisis budget revision'],
      'warning': ['Cost optimization initiative', 'Supplier performance review', 'Budget adjustment planning'],
      'info': ['Cost structure analysis', 'Efficiency improvement program', 'Benchmark comparison study'],
      'good': ['Cost advantage leverage', 'Efficiency model expansion', 'Competitive pricing strategy']
    },
    'margin-risk': {
      'critical': ['Immediate margin protection', 'Emergency pricing review', 'Risk mitigation activation'],
      'warning': ['Margin optimization program', 'Pricing strategy adjustment', 'Risk monitoring enhancement'],
      'info': ['Margin improvement initiative', 'Competitive analysis update', 'Strategy refinement planning'],
      'good': ['Margin advantage expansion', 'Success strategy scaling', 'Market position strengthening']
    },
    'economic-kpi': {
      'critical': ['Economic impact assessment', 'Strategic response planning', 'Stakeholder communication'],
      'warning': ['Economic trend monitoring', 'Strategy adjustment planning', 'Risk assessment update'],
      'info': ['Economic opportunity analysis', 'Market positioning review', 'Strategic planning enhancement'],
      'good': ['Economic advantage leverage', 'Growth opportunity capture', 'Market leadership expansion']
    },
    'warehouse': {
      'critical': ['Immediate capacity optimization', 'Emergency logistics coordination', 'Critical process review'],
      'warning': ['Warehouse efficiency improvement', 'Process optimization initiative', 'Capacity planning review'],
      'info': ['Operational excellence program', 'Technology integration planning', 'Performance benchmarking'],
      'good': ['Excellence model replication', 'Innovation implementation', 'Competitive advantage expansion']
    },
    'reorder': {
      'critical': ['Emergency stock replenishment', 'Critical supplier activation', 'Demand fulfillment prioritization'],
      'warning': ['Inventory optimization review', 'Reorder strategy adjustment', 'Supplier performance evaluation'],
      'info': ['Inventory planning enhancement', 'Demand forecasting improvement', 'Supply chain optimization'],
      'good': ['Inventory efficiency scaling', 'Optimal performance maintenance', 'Strategic advantage preservation']
    }
  };
  
  return fallbacks[overlayType]?.[severity] || fallbacks['insight'][severity] || [];
}
