import { useState } from "react";
import type { UserBehaviorAnalysis } from "@/types/api";

interface AILearningSystemSectionProps {
  userBehavior: UserBehaviorAnalysis[];
  isLoading?: boolean;
}

/**
 * This part of the code creates the AI Learning System for user behavior analysis
 * Interactive warehouse selection with personalized insights and recommendations
 */
export function AILearningSystemSection({ userBehavior, isLoading }: AILearningSystemSectionProps) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<UserBehaviorAnalysis | null>(
    userBehavior.length > 0 ? userBehavior[0] : null
  );

  // This part of the code handles loading state
  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <span className="text-purple-600 mr-2">🧠</span>
          <h2 className="text-lg font-medium text-gray-900">
            AI Learning System (User Behavior Analysis)
          </h2>
          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
            Adaptive
          </span>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // This part of the code handles empty state
  if (userBehavior.length === 0) {
    return (
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <span className="text-purple-600 mr-2">🧠</span>
          <h2 className="text-lg font-medium text-gray-900">
            AI Learning System (User Behavior Analysis)
          </h2>
          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
            Adaptive
          </span>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500">
            No user behavior data available for analysis
          </p>
        </div>
      </div>
    );
  }

  // This part of the code calculates learning insights summary
  const totalEngagement = userBehavior.reduce((sum, w) => sum + w.engagementScore, 0);
  const avgEngagement = totalEngagement / userBehavior.length;
  const highEngagementWarehouses = userBehavior.filter(w => w.engagementScore > avgEngagement).length;
  const optimizationOpportunities = userBehavior.filter(w => w.engagementScore < 50).length;

  return (
    <div className="mb-6">
      {/* Section Header */}
      <div className="flex items-center mb-4">
        <span className="text-purple-600 mr-2">🧠</span>
        <h2 className="text-lg font-medium text-gray-900">
          AI Learning System (User Behavior Analysis)
        </h2>
        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
          Adaptive
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Left Side - Warehouse Selector */}
          <div className="lg:col-span-1 border-r border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Select Warehouse
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {userBehavior.map((warehouse) => (
                <button
                  key={warehouse.warehouseId}
                  onClick={() => setSelectedWarehouse(warehouse)}
                  className={`p-3 text-left border rounded-lg transition-all ${
                    selectedWarehouse?.warehouseId === warehouse.warehouseId
                      ? 'border-purple-300 bg-purple-50 text-purple-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xs font-medium truncate">
                    {warehouse.warehouseName.split('(')[0].trim()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Score: {warehouse.engagementScore}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Learning Insights Summary */}
          <div className="lg:col-span-2 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Learning Insights Summary
            </h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* High-Engagement Warehouses */}
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {highEngagementWarehouses}
                </div>
                <div className="text-xs text-gray-600">
                  High-engagement warehouses
                </div>
              </div>

              {/* Optimization Opportunities */}
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {optimizationOpportunities}
                </div>
                <div className="text-xs text-gray-600">
                  Optimization opportunities
                </div>
              </div>

              {/* Average Engagement Score */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {avgEngagement.toFixed(0)}
                </div>
                <div className="text-xs text-gray-600">
                  Average engagement score
                </div>
              </div>
            </div>

            {/* Detailed Analysis Panel (when warehouse selected) */}
            {selectedWarehouse && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  {selectedWarehouse.warehouseName} - Detailed Analysis
                </h4>

                {/* Usage Patterns */}
                <div className="mb-4">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Usage Patterns</h5>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedWarehouse.viewFrequency}
                      </div>
                      <div className="text-xs text-gray-600">View Frequency</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedWarehouse.timeSpent}m
                      </div>
                      <div className="text-xs text-gray-600">Time Spent</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedWarehouse.engagementScore}
                      </div>
                      <div className="text-xs text-gray-600">Engagement Score</div>
                    </div>
                  </div>

                  {/* Common Actions */}
                  <div className="mt-3">
                    <div className="text-xs text-gray-600 mb-2">Common Actions:</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedWarehouse.commonActions.map((action, index) => (
                        <span 
                          key={index}
                          className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-2">AI Recommendations</h5>
                  
                  {/* Next Best Action */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="text-xs font-medium text-blue-900 mb-1">
                      Next Best Action
                    </div>
                    <div className="text-xs text-blue-800">
                      {selectedWarehouse.nextBestAction}
                    </div>
                  </div>

                  {/* Personalized Tips */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-700">
                      Personalized Tips
                    </div>
                    {selectedWarehouse.personalizedTips.map((tip, index) => (
                      <div 
                        key={index}
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-2"
                      >
                        <div className="text-xs text-yellow-800">
                          💡 {tip}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Information */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          AI learning system adapts to user interaction patterns and provides personalized recommendations
        </p>
      </div>
    </div>
  );
}
