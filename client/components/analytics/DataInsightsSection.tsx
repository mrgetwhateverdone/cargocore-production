import { Database, Building2, Package, TrendingUp } from "lucide-react";
import type { DataInsightsDashboard } from "@/types/api";

interface DataInsightsSectionProps {
  dataInsights: DataInsightsDashboard;
  isLoading?: boolean;
}

export function DataInsightsSection({ dataInsights, isLoading }: DataInsightsSectionProps) {
  // This part of the code defines the data insight cards with icons and colors
  const insightCards = [
    {
      title: "Total Data Points",
      value: dataInsights.totalDataPoints,
      description: "Records from all endpoints",
      icon: Database,
      colorClass: "text-blue-600",
      bgClass: "bg-blue-50",
    },
    {
      title: "Active Warehouses",
      value: dataInsights.activeWarehouses.count,
      description: `Avg SLA: ${dataInsights.activeWarehouses.avgSLA}%`,
      icon: Building2,
      colorClass: "text-green-600",
      bgClass: "bg-green-50",
    },
    {
      title: "Unique Brands",
      value: dataInsights.uniqueBrands,
      description: "Brands in inventory",
      icon: Package,
      colorClass: "text-purple-600",
      bgClass: "bg-purple-50",
    },
    {
      title: "Inventory Health",
      value: `${dataInsights.inventoryHealth.percentage}%`,
      description: `${dataInsights.inventoryHealth.skusInStock} SKUs in stock`,
      icon: TrendingUp,
      colorClass: "text-orange-600",
      bgClass: "bg-orange-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Data Insights Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mr-3" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Data Insights Dashboard
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insightCards.map((card, index) => {
          const IconComponent = card.icon;
          
          return (
            <div
              key={index}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
            >
              {/* This part of the code creates the icon and title row */}
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-lg ${card.bgClass} mr-3`}>
                  <IconComponent className={`h-4 w-4 ${card.colorClass}`} />
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {card.title}
                </div>
              </div>
              
              {/* This part of the code displays the large metric value */}
              <div className={`text-2xl font-bold mb-1 ${card.colorClass}`}>
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </div>
              
              {/* This part of the code shows the description */}
              <div className="text-sm text-gray-500">
                {card.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
