import type { QuickOverviewMetrics } from "@/types/api";

interface QuickOverviewSectionProps {
  metrics: QuickOverviewMetrics;
  isLoading?: boolean;
}

export function QuickOverviewSection({
  metrics,
  isLoading,
}: QuickOverviewSectionProps) {
  const overviewItems = [
    {
      title: "Top Issues",
      value: metrics.topIssues,
      description: "At-risk orders need attention",
      colorClass: "text-red-600",
    },
    {
      title: "What's Working",
      value: metrics.whatsWorking,
      description: "Orders on track today",
      colorClass: "text-green-600",
    },
    {
      title: "$ Impact",
      value: `$${(metrics.dollarImpact || 0).toLocaleString()}`,
      description: "Potential revenue at risk",
      colorClass: "text-blue-600",
    },
    {
      title: "Completed Workflows",
      value: metrics.completedWorkflows,
      description: "Active purchase orders",
      colorClass: "text-purple-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Quick Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewItems.map((item, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="text-sm font-medium text-gray-700 mb-2">
              {item.title}
            </div>
            <div className={`text-2xl font-bold mb-1 ${item.colorClass}`}>
              {item.value}
            </div>
            <div className="text-sm text-gray-500">{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
