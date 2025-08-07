import type { WarehouseOptimization } from "@/types/api";

interface PerformanceOptimizationSectionProps {
  optimizations: WarehouseOptimization[];
  isLoading?: boolean;
}

/**
 * This part of the code creates the Performance Optimization Engine section
 * AI-driven optimization recommendations with multi-dimensional analysis
 */
export function PerformanceOptimizationSection({ optimizations, isLoading }: PerformanceOptimizationSectionProps) {
  // This part of the code handles loading state
  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <span className="text-orange-600 mr-2">⚡</span>
          <h2 className="text-lg font-medium text-gray-900">
            Performance Optimization Engine
          </h2>
          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
            AI-Driven
          </span>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // This part of the code determines risk level colors
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // This part of the code determines priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="mb-6">
      {/* Section Header */}
      <div className="flex items-center mb-4">
        <span className="text-orange-600 mr-2">⚡</span>
        <h2 className="text-lg font-medium text-gray-900">
          Performance Optimization Engine
        </h2>
        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
          AI-Driven
        </span>
      </div>

      {optimizations.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500">
            No optimization recommendations available
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {optimizations.map((optimization) => (
            <div
              key={optimization.warehouseId}
              className={`border rounded-lg shadow-sm overflow-hidden ${getRiskLevelColor(optimization.riskLevel).replace('text-', 'border-').replace('bg-', 'border-')}`}
            >
              {/* Card Header */}
              <div className="bg-white p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {optimization.warehouseName}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-green-600">
                      {optimization.roiPercentage}% ROI
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(optimization.riskLevel)}`}>
                      {optimization.riskLevel} Risk
                    </span>
                  </div>
                </div>

                {/* Performance Metrics Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">
                      {optimization.performanceMetrics.slaPerformance.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">SLA Performance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">
                      {optimization.performanceMetrics.throughput.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Throughput</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">
                      {optimization.performanceMetrics.efficiency}%
                    </div>
                    <div className="text-xs text-gray-600">Efficiency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">
                      {optimization.performanceMetrics.capacityUsage}%
                    </div>
                    <div className="text-xs text-gray-600">Capacity Usage</div>
                  </div>
                </div>
              </div>

              {/* Optimization Opportunities */}
              {optimization.opportunities.length > 0 && (
                <div className="bg-gray-50 p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Optimization Opportunities
                  </h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {optimization.opportunities.map((opportunity, index) => (
                      <div 
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg p-3"
                      >
                        {/* Opportunity Header */}
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-xs font-medium text-gray-900">
                            {opportunity.area}
                          </h5>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(opportunity.priority)}`}>
                            {opportunity.priority}
                          </span>
                        </div>

                        {/* Current vs Target */}
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Current:</span>
                            <span className="font-medium">
                              {opportunity.currentValue}
                              {opportunity.area.includes('Performance') || opportunity.area.includes('Efficiency') ? '%' : ''}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Target:</span>
                            <span className="font-medium text-green-600">
                              {opportunity.targetValue}
                              {opportunity.area.includes('Performance') || opportunity.area.includes('Efficiency') ? '%' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Investment and Savings */}
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Investment:</span>
                            <span className="font-medium text-red-600">
                              ${opportunity.investment.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Savings:</span>
                            <span className="font-medium text-green-600">
                              ${opportunity.potentialSavings.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Timeline:</span>
                            <span className="font-medium text-blue-600">
                              {opportunity.timeline}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary Footer */}
              <div className="bg-white p-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm font-semibold text-red-600">
                      ${optimization.totalInvestment.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Total Investment</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-green-600">
                      ${optimization.potentialSavings.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Potential Savings</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-blue-600">
                      {optimization.timeline}
                    </div>
                    <div className="text-xs text-gray-600">Timeline</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Information */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Optimization recommendations generated through AI analysis of performance metrics and operational data
        </p>
      </div>
    </div>
  );
}
