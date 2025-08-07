import { TriangleAlert, Info, Target, DollarSign } from "lucide-react";
import type { AIInsight } from "@/types/api";

interface InsightsSectionProps {
  insights: AIInsight[];
  isLoading?: boolean;
}

export function InsightsSection({ insights, isLoading }: InsightsSectionProps) {
  const getInsightIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <TriangleAlert className="h-5 w-5" />;
      case "warning":
        return <TriangleAlert className="h-5 w-5" />;
      case "info":
        return <Info className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getInsightStyles = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Insights</h2>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Insights</h2>
        <p className="text-sm text-gray-500">
          {insights.length} insights from Dashboard Agent
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights?.map((insight) => (
          <div
            key={insight.id}
            className={`w-full border rounded-lg p-4 transition-colors hover:opacity-80 ${getInsightStyles(insight.severity)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                {getInsightIcon(insight.severity)}
                <h3 className="ml-2 font-semibold text-sm">{insight.title}</h3>
              </div>
            </div>

            <p className="text-sm mb-3 leading-relaxed">
              {insight.description}
            </p>

            {insight.dollarImpact > 0 && (
              <div className="flex items-center text-sm font-medium mb-3">
                <DollarSign className="h-4 w-4 mr-1" />$
                {(insight.dollarImpact || 0).toLocaleString()} impact
              </div>
            )}

            <button className="flex items-center text-sm font-medium hover:underline">
              <Target className="h-4 w-4 mr-1" />
              Track
            </button>
          </div>
        ))}
      </div>

      {insights.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            No insights available. AI analysis will appear here when data is
            processed.
          </p>
        </div>
      )}
    </div>
  );
}
