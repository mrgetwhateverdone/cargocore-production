import { useState } from "react";
import type { BudgetAllocation } from "@/types/api";
import { WarehouseModal } from "./WarehouseModal";

interface SmartBudgetAllocationSectionProps {
  budgetAllocations: BudgetAllocation[];
  isLoading?: boolean;
}

/**
 * This part of the code creates the Smart Budget Allocation Engine section
 * AI-powered budget optimization system with performance-based recommendations
 */
export function SmartBudgetAllocationSection({ budgetAllocations, isLoading }: SmartBudgetAllocationSectionProps) {
  const [showAllModal, setShowAllModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  // This part of the code determines which allocations to show by default (top 5 high-impact)
  const highImpactAllocations = budgetAllocations
    .sort((a, b) => Math.abs(b.changeAmount) - Math.abs(a.changeAmount)) // Sort by impact size
    .slice(0, 5);

  // This part of the code handles modal search and filtering
  const filteredAllocations = budgetAllocations.filter(allocation => {
    const matchesSearch = allocation.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         allocation.warehouseId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = riskFilter === "all" || allocation.riskLevel === riskFilter;
    
    return matchesSearch && matchesRisk;
  });

  // This part of the code creates filter options with counts
  const riskCounts = budgetAllocations.reduce((acc, allocation) => {
    acc[allocation.riskLevel] = (acc[allocation.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filters = [
    {
      label: "All Risk Levels",
      value: "all",
      count: budgetAllocations.length,
      active: riskFilter === "all",
      onClick: () => setRiskFilter("all")
    },
    {
      label: "High Risk",
      value: "High",
      count: riskCounts["High"] || 0,
      active: riskFilter === "High",
      onClick: () => setRiskFilter("High")
    },
    {
      label: "Medium Risk",
      value: "Medium", 
      count: riskCounts["Medium"] || 0,
      active: riskFilter === "Medium",
      onClick: () => setRiskFilter("Medium")
    },
    {
      label: "Low Risk",
      value: "Low",
      count: riskCounts["Low"] || 0,
      active: riskFilter === "Low",
      onClick: () => setRiskFilter("Low")
    }
  ];

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

  // This part of the code creates a budget allocation card component
  const renderAllocationCard = (allocation: BudgetAllocation) => (
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
  );

  return (
    <div className="mb-6">
      {/* Section Header with View All Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-green-600 mr-2">💰</span>
          <h2 className="text-lg font-medium text-gray-900">
            Smart Budget Allocation Engine
          </h2>
          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            AI-Optimized
          </span>
        </div>
        {budgetAllocations.length > highImpactAllocations.length && (
          <button
            onClick={() => setShowAllModal(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-50 text-blue-700 text-sm font-medium rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors border border-blue-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View All Recommendations ({budgetAllocations.length})
          </button>
        )}
      </div>

      {/* High Impact Banner */}
      {budgetAllocations.length > 5 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <span className="font-medium">💡 Showing top 5 highest-impact budget recommendations</span>
            <span className="mx-2">•</span>
            <span>Total impact: ${highImpactAllocations.reduce((sum, a) => sum + Math.abs(a.changeAmount), 0).toLocaleString()}</span>
          </p>
        </div>
      )}

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

      {/* High-Impact Budget Allocation Cards */}
      {budgetAllocations.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500">
            No budget allocation data available
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {highImpactAllocations.map(renderAllocationCard)}
        </div>
      )}

      {/* Modal for All Budget Allocations */}
      <WarehouseModal
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
        title={`All Budget Recommendations (${budgetAllocations.length})`}
        searchPlaceholder="Search by warehouse name or ID..."
        onSearch={setSearchTerm}
        filters={filters}
        showExport={true}
        onExport={() => {
          // This part of the code handles budget allocation data export
          const csvData = budgetAllocations.map(a => ({
            Name: a.warehouseName,
            ID: a.warehouseId,
            CurrentBudget: a.currentBudget,
            RecommendedBudget: a.recommendedBudget,
            Change: a.changeAmount,
            ChangePercent: a.changePercentage,
            ExpectedROI: a.expectedROI,
            RiskLevel: a.riskLevel,
            PerformanceScore: a.performanceScore
          }));
          
          const csv = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).join(','))
          ].join('\n');
          
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'budget-allocations.csv';
          a.click();
        }}
      >
        {/* Modal Content */}
        <div className="space-y-4">
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredAllocations.length} of {budgetAllocations.length} recommendations
            </div>
            <div className="text-sm text-gray-600">
              Total Budget Impact: ${filteredAllocations.reduce((sum, a) => sum + Math.abs(a.changeAmount), 0).toLocaleString()}
            </div>
          </div>
          
          {/* Summary Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  Total Annual Budget
                </h3>
                <p className="text-xl font-bold text-blue-900">
                  ${filteredAllocations.reduce((sum, a) => sum + a.recommendedBudget, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  Avg Expected ROI
                </h3>
                <p className="text-xl font-bold text-blue-900">
                  {filteredAllocations.length > 0 ? 
                    (filteredAllocations.reduce((sum, a) => sum + a.expectedROI, 0) / filteredAllocations.length).toFixed(1) : 
                    0}%
                </p>
              </div>
            </div>
          </div>
          
          {/* All Budget Allocation Cards in Modal */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredAllocations.map(renderAllocationCard)}
          </div>
          
          {filteredAllocations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No budget allocations match your current filters.</p>
            </div>
          )}
        </div>
      </WarehouseModal>

      {/* Footer Information */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Budget recommendations based on real-time performance data and AI optimization algorithms
        </p>
      </div>
    </div>
  );
}
