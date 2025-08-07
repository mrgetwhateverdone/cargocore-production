import type { BudgetAllocation } from "@/types/api";

interface SmartBudgetAllocationSectionProps {
  budgetAllocations: BudgetAllocation[];
  isLoading?: boolean;
}

/**
 * This part of the code creates the Smart Budget Allocation Engine section
 * AI-powered budget optimization system with performance-based recommendations
 */
export function SmartBudgetAllocationSection({ budgetAllocations, isLoading }: SmartBudgetAllocationSectionProps) {
  // This part of the code handles loading state
  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <span className="text-green-600 mr-2">💰</span>
          <h2 className="text-lg font-medium text-gray-900">
            Smart Budget Allocation Engine
          </h2>
          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            AI-Optimized
          </span>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // This part of the code calculates summary metrics
  const totalAnnualBudget = budgetAllocations.reduce((sum, allocation) => sum + allocation.recommendedBudget, 0);
  const avgExpectedROI = budgetAllocations.length > 0 
    ? budgetAllocations.reduce((sum, allocation) => sum + allocation.expectedROI, 0) / budgetAllocations.length 
    : 0;

  // This part of the code determines card color coding based on change percentage
  const getCardColor = (changePercentage: number) => {
    if (changePercentage > 10) return "border-green-200 bg-green-50";
    if (changePercentage < -10) return "border-red-200 bg-red-50";
    return "border-gray-200 bg-gray-50";
  };

  // This part of the code determines change indicator colors
  const getChangeColor = (changePercentage: number) => {
    if (changePercentage > 0) return "text-green-600";
    if (changePercentage < 0) return "text-red-600";
    return "text-gray-600";
  };

  // This part of the code determines risk level badge colors
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="mb-6">
      {/* Section Header */}
      <div className="flex items-center mb-4">
        <span className="text-green-600 mr-2">💰</span>
        <h2 className="text-lg font-medium text-gray-900">
          Smart Budget Allocation Engine
        </h2>
        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          AI-Optimized
        </span>
      </div>

      {/* Summary Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              Total Annual Budget
            </h3>
            <p className="text-2xl font-bold text-blue-900">
              ${totalAnnualBudget.toLocaleString()}
            </p>
            <p className="text-xs text-blue-700">
              Calculated sum of all recommended budgets
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              Avg Expected ROI
            </h3>
            <p className="text-2xl font-bold text-blue-900">
              {avgExpectedROI.toFixed(1)}%
            </p>
            <p className="text-xs text-blue-700">
              Average ROI across all warehouses
            </p>
          </div>
        </div>
      </div>

      {/* Budget Allocation Cards */}
      {budgetAllocations.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500">
            No budget allocation data available
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgetAllocations.map((allocation) => (
            <div
              key={allocation.warehouseId}
              className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${getCardColor(allocation.changePercentage)}`}
            >
              {/* Card Header */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                  {allocation.warehouseName}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Performance Score: {allocation.performanceScore}/100
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(allocation.riskLevel)}`}>
                    {allocation.riskLevel} Risk
                  </span>
                </div>
              </div>

              {/* Budget Comparison */}
              <div className="mb-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Current Budget</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${allocation.currentBudget.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Recommended</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${allocation.recommendedBudget.toLocaleString()}
                  </span>
                </div>
                
                {/* Change Amount and Percentage */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Change</span>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${getChangeColor(allocation.changePercentage)}`}>
                        {allocation.changeAmount >= 0 ? '+' : ''}${allocation.changeAmount.toLocaleString()}
                      </div>
                      <div className={`text-xs ${getChangeColor(allocation.changePercentage)}`}>
                        {allocation.changePercentage >= 0 ? '+' : ''}{allocation.changePercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expected ROI */}
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Expected ROI</span>
                  <span className="text-sm font-semibold text-green-600">
                    {allocation.expectedROI}%
                  </span>
                </div>
              </div>

              {/* Justification */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <h4 className="text-xs font-medium text-gray-900 mb-2">
                  AI Recommendation
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {allocation.justification}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Information */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Budget recommendations based on real-time performance data and AI optimization algorithms
        </p>
      </div>
    </div>
  );
}
