import { useState } from "react";
import type { WarehouseOptimization } from "@/types/api";
import { WarehouseModal } from "./WarehouseModal";

interface PerformanceOptimizationSectionProps {
  optimizations: WarehouseOptimization[];
  isLoading?: boolean;
}

/**
 * This part of the code creates the Performance Optimization Engine section
 * AI-driven optimization recommendations with multi-dimensional analysis
 */
export function PerformanceOptimizationSection({ optimizations, isLoading }: PerformanceOptimizationSectionProps) {
  const [showAllModal, setShowAllModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  // This part of the code determines which optimizations to show by default (only high-priority opportunities)
  const highPriorityOptimizations = optimizations.filter(opt => 
    opt.riskLevel === "High" || 
    opt.opportunities.some(opp => opp.priority === "High") ||
    opt.roiPercentage >= 80
  ).slice(0, 5); // Show max 5 high-priority items

  // This part of the code handles modal search and filtering
  const filteredOptimizations = optimizations.filter(optimization => {
    const matchesSearch = optimization.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         optimization.warehouseId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = riskFilter === "all" || optimization.riskLevel === riskFilter;
    
    return matchesSearch && matchesRisk;
  });

  // This part of the code creates filter options with counts
  const riskCounts = optimizations.reduce((acc, optimization) => {
    acc[optimization.riskLevel] = (acc[optimization.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filters = [
    {
      label: "All Risk Levels",
      value: "all",
      count: optimizations.length,
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

  // This part of the code creates an optimization card component
  const renderOptimizationCard = (optimization: WarehouseOptimization) => (
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
  );

  return (
    <div className="mb-6">
      {/* Section Header with View All Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-orange-600 mr-2">⚡</span>
          <h2 className="text-lg font-medium text-gray-900">
            Performance Optimization Engine
          </h2>
          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
            AI-Driven
          </span>
        </div>
        {optimizations.length > highPriorityOptimizations.length && (
          <button
            onClick={() => setShowAllModal(true)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            View All Optimizations ({optimizations.length})
          </button>
        )}
      </div>

      {/* High Priority Banner */}
      {highPriorityOptimizations.length < optimizations.length && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <span className="font-medium">🎯 Showing {highPriorityOptimizations.length} high-priority optimization opportunities</span>
            <span className="mx-2">•</span>
            <span>Total potential savings: ${highPriorityOptimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0).toLocaleString()}</span>
          </p>
        </div>
      )}

      {optimizations.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500">
            No optimization recommendations available
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {highPriorityOptimizations.map(renderOptimizationCard)}
        </div>
      )}

      {/* Modal for All Optimizations */}
      <WarehouseModal
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
        title={`All Performance Optimizations (${optimizations.length})`}
        searchPlaceholder="Search by warehouse name or ID..."
        onSearch={setSearchTerm}
        filters={filters}
        showExport={true}
        onExport={() => {
          // This part of the code handles optimization data export
          const csvData = optimizations.map(o => ({
            Name: o.warehouseName,
            ID: o.warehouseId,
            ROI: o.roiPercentage,
            RiskLevel: o.riskLevel,
            SLA: o.performanceMetrics.slaPerformance,
            Throughput: o.performanceMetrics.throughput,
            Efficiency: o.performanceMetrics.efficiency,
            CapacityUsage: o.performanceMetrics.capacityUsage,
            TotalInvestment: o.totalInvestment,
            PotentialSavings: o.potentialSavings,
            Timeline: o.timeline
          }));
          
          const csv = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).join(','))
          ].join('\n');
          
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'performance-optimizations.csv';
          a.click();
        }}
      >
        {/* Modal Content */}
        <div className="space-y-4">
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredOptimizations.length} of {optimizations.length} optimizations
            </div>
            <div className="text-sm text-gray-600">
              Total Savings Potential: ${filteredOptimizations.reduce((sum, o) => sum + o.potentialSavings, 0).toLocaleString()}
            </div>
          </div>
          
          {/* All Optimization Cards in Modal */}
          <div className="space-y-6">
            {filteredOptimizations.map(renderOptimizationCard)}
          </div>
          
          {filteredOptimizations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No optimizations match your current filters.</p>
            </div>
          )}
        </div>
      </WarehouseModal>

      {/* Footer Information */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Optimization recommendations generated through AI analysis of performance metrics and operational data
        </p>
      </div>
    </div>
  );
}
