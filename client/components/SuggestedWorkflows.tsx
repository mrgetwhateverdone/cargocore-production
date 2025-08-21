import { TrendingUp, Plus } from "lucide-react";
import type { AIInsight } from "@/types/api";
import { useWorkflowCreation } from "../hooks/useWorkflows";
import { useSettingsIntegration } from "@/hooks/useSettingsIntegration";

interface SuggestedWorkflowsProps {
  insights: AIInsight[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  _loadingMessage?: string;
  pageType?: string; // Used for AI agent filtering
}

export function SuggestedWorkflows({ 
  insights, 
  isLoading, 
  title = "Suggested Workflows",
  subtitle,
  _loadingMessage = "Generating workflow suggestions...",
  pageType = "dashboard"
}: SuggestedWorkflowsProps) {
  
  const { createWorkflow, creating } = useWorkflowCreation();
  const { isPageAIEnabled, getAgentSettings } = useSettingsIntegration();
  
  // This part of the code filters insights based on agent settings
  const agentSettings = getAgentSettings();

  // This part of the code checks if AI insights should be shown for this page
  if (!isPageAIEnabled(pageType as any)) {
    return null;
  }
  const filteredInsights = insights.filter(insight => {
    // Only show insights if the corresponding agent is enabled
    if (insight.source === 'dashboard_agent' && !agentSettings.dashboard.enabled) {
      return false;
    }
    if (insight.source === 'orders_agent' && !agentSettings.orders.enabled) {
      return false;
    }
    if (insight.source === 'analytics_agent' && !agentSettings.analytics.enabled) {
      return false;
    }
    if (insight.source === 'inventory_agent' && !agentSettings.inventory.enabled) {
      return false;
    }
    if (insight.source === 'cost_agent' && !(agentSettings as any).cost?.enabled) {
      return false;
    }
    if (insight.source === 'economic_agent' && !(agentSettings as any).economic?.enabled) {
      return false;
    }
    return true;
  });

  // This part of the code handles adding workflows directly from the insight
  const handleAddToWorkflows = async (insight: AIInsight) => {
    try {
      await createWorkflow({
        action: {
          label: insight.title,
          type: 'create_workflow',
          target: getInsightCategory(insight),
          values: insight.suggestedActions || [],
          priority: insight.severity === 'critical' ? 'critical' : insight.severity === 'warning' ? 'high' : 'medium'
        },
        source: insight.source || 'ai_insight',
        sourceId: insight.id,
        insightTitle: insight.title,
      });
    } catch (error) {
      console.error('Failed to create workflow from insight:', error);
    }
  };

  // This part of the code determines the category based on insight properties
  const getInsightCategory = (insight: AIInsight): string => {
    if (insight.source?.includes('cost') || insight.title.toLowerCase().includes('cost')) return 'cost_optimization';
    if (insight.source?.includes('inventory') || insight.title.toLowerCase().includes('inventory')) return 'inventory_management';
    if (insight.source?.includes('orders') || insight.title.toLowerCase().includes('order')) return 'order_fulfillment';
    if (insight.source?.includes('economic') || insight.title.toLowerCase().includes('economic')) return 'strategic_planning';
    return 'operational_efficiency';
  };

  // This part of the code shows loading state with clean design
  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">
            {subtitle || "AI-powered workflow suggestions"}
          </p>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-pulse"
            >
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 bg-blue-200 rounded"></div>
                <div className="h-4 w-48 bg-blue-200 rounded"></div>
                <div className="ml-auto h-8 w-32 bg-blue-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // This part of the code shows empty state when no insights are available
  if (filteredInsights.length === 0) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">
            {subtitle || "No workflow suggestions available"}
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 text-blue-700">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm">Check OpenAI Connection - No workflow suggestions available</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">
          {subtitle || `${filteredInsights.length} workflow suggestions`}
        </p>
      </div>

      {/* This part of the code displays the clean, simple list UI as requested */}
      <div className="space-y-3">
        {filteredInsights.map((insight) => (
          <div
            key={insight.id}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 transition-all hover:bg-blue-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {/* This part of the code displays the trending up icon as requested */}
                <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
                
                {/* This part of the code displays simple text as requested */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-blue-900 truncate">
                    {insight.title}
                  </h3>
                  <p className="text-xs text-blue-700 mt-1 line-clamp-2">
                    {insight.description}
                  </p>
                </div>
              </div>

              {/* This part of the code displays the + Add to Workflows button as requested */}
              <button
                onClick={() => handleAddToWorkflows(insight)}
                disabled={creating}
                className="ml-4 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 flex-shrink-0"
                title="Add to workflows"
              >
                <Plus className="h-3 w-3" />
                <span>Add to Workflows</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
