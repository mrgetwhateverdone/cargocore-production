import React, { useEffect, useState } from 'react';
import { X, TrendingUp, Warehouse, Activity, CheckCircle, Loader2, CheckCircle2, Target, AlertTriangle } from 'lucide-react';
import { useWorkflowCreation } from '../hooks/useWorkflows';
import type { WarehouseData } from '@/types/api';

interface WarehouseOptimizationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse: WarehouseData | null;
  recommendations: string[];
  isLoadingRecommendations: boolean;
}

/**
 * This part of the code creates an overlay for displaying Warehouse Optimization details with workflow integration
 * Shows detailed warehouse analysis and allows adding AI recommendations to workflows
 */
export function WarehouseOptimizationOverlay({ 
  isOpen, 
  onClose, 
  warehouse, 
  recommendations,
  isLoadingRecommendations 
}: WarehouseOptimizationOverlayProps) {
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
          target: 'warehouse_optimization',
          values: [recommendation],
          priority: (warehouse?.status === 'Needs Attention' ? 'critical' : 
                    warehouse?.status === 'Good' ? 'high' : 'medium') as 'low' | 'medium' | 'high' | 'critical',
        },
        source: 'ai_insight',
        sourceId: `warehouse-${warehouse?.warehouseId || 'unknown'}`,
        insightTitle: `${warehouse?.warehouseName} Optimization: ${recommendation}`,
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

  // This part of the code determines the performance styling based on status
  const getPerformanceStyles = () => {
    if (!warehouse) return { container: 'bg-gray-50 border-gray-200', text: 'text-gray-700' };
    
    switch (warehouse.status) {
      case 'Excellent':
        return { container: 'bg-green-50 border-green-200', text: 'text-green-700' };
      case 'Good':
        return { container: 'bg-blue-50 border-blue-200', text: 'text-blue-700' };
      case 'Needs Attention':
        return { container: 'bg-red-50 border-red-200', text: 'text-red-700' };
      default:
        return { container: 'bg-gray-50 border-gray-200', text: 'text-gray-700' };
    }
  };

  // This part of the code determines the performance icon based on status
  const getPerformanceIcon = () => {
    if (!warehouse) return null;
    
    switch (warehouse.status) {
      case 'Excellent':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'Good':
        return <Target className="h-6 w-6 text-blue-600" />;
      case 'Needs Attention':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      default:
        return <Warehouse className="h-6 w-6 text-gray-600" />;
    }
  };

  // This part of the code formats location display
  const formatLocation = () => {
    if (!warehouse?.location) return "Location not specified";
    
    const parts = [
      warehouse.location.city,
      warehouse.location.state,
      warehouse.location.country
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : "Location not specified";
  };

  if (!isOpen || !warehouse) return null;

  const styles = getPerformanceStyles();

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getPerformanceIcon()}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{warehouse.warehouseName}</h2>
              <p className="text-sm text-gray-500">Warehouse Performance Optimization</p>
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
          {/* Performance Status Banner */}
          <div className={`rounded-lg border p-4 ${styles.container}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`text-sm font-medium ${styles.text}`}>
                  Status: {warehouse.status}
                </div>
                <div className={`text-sm ${styles.text}`}>
                  Score: {warehouse.performanceScore}/100
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${styles.text}`}>
                  {warehouse.slaPerformance}%
                </div>
                <div className="text-xs text-gray-500">SLA Performance</div>
              </div>
            </div>
          </div>

          {/* Warehouse Overview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Warehouse Overview</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              {warehouse.warehouseName} (ID: {warehouse.warehouseId}) is currently performing at {warehouse.status.toLowerCase()} level 
              with a performance score of {warehouse.performanceScore}/100. This facility manages {warehouse.totalSKUs} SKUs 
              and processes {warehouse.throughput.toLocaleString()} units monthly.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span className="text-lg font-semibold text-blue-600">
                    {warehouse.activeOrders}
                  </span>
                </div>
                <p className="text-sm text-blue-800 font-medium">Active Orders</p>
                <p className="text-xs text-blue-600 mt-1">Current workload</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-semibold text-green-600">
                    {warehouse.slaPerformance}%
                  </span>
                </div>
                <p className="text-sm text-green-800 font-medium">SLA Performance</p>
                <p className="text-xs text-green-600 mt-1">Service level achievement</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span className="text-lg font-semibold text-purple-600">
                    {warehouse.avgFulfillmentTime}h
                  </span>
                </div>
                <p className="text-sm text-purple-800 font-medium">Avg Fulfillment</p>
                <p className="text-xs text-purple-600 mt-1">Time to process</p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <Warehouse className="h-5 w-5 text-orange-600" />
                  <span className="text-lg font-semibold text-orange-600">
                    {warehouse.totalSKUs}
                  </span>
                </div>
                <p className="text-sm text-orange-800 font-medium">Total SKUs</p>
                <p className="text-xs text-orange-600 mt-1">Managed products</p>
              </div>
            </div>
          </div>

          {/* Operational Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Operational Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Facility Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Warehouse ID:</span>
                    <span className="font-medium">{warehouse.warehouseId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Supplier Name:</span>
                    <span className="font-medium">{warehouse.supplierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{formatLocation()}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Performance Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Throughput:</span>
                    <span className="font-medium">{warehouse.throughput.toLocaleString()} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Performance Score:</span>
                    <span className={`font-medium ${
                      warehouse.performanceScore >= 85 ? 'text-green-600' :
                      warehouse.performanceScore >= 70 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {warehouse.performanceScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status Classification:</span>
                    <span className={`font-medium ${
                      warehouse.status === 'Excellent' ? 'text-green-600' :
                      warehouse.status === 'Good' ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {warehouse.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Analysis</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Overall Performance Score</span>
                <span className={`text-xl font-bold ${
                  warehouse.performanceScore >= 85 ? 'text-green-600' :
                  warehouse.performanceScore >= 70 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {warehouse.performanceScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    warehouse.performanceScore >= 85 ? 'bg-green-500' :
                    warehouse.performanceScore >= 70 ? 'bg-blue-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${warehouse.performanceScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {warehouse.performanceScore >= 85 ? 'Excellent performance - warehouse is operating at optimal efficiency' :
                 warehouse.performanceScore >= 70 ? 'Good performance - minor optimization opportunities available' :
                 'Needs attention - significant improvement opportunities identified'}
              </p>
            </div>
          </div>

          {/* AI Optimization Recommendations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Optimization Recommendations</h3>
            <p className="text-sm text-gray-600 mb-4">Strategic improvements generated by warehouse optimization AI</p>
            
            {isLoadingRecommendations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">Generating warehouse optimization strategies...</span>
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
