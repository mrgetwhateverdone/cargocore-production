import type { AnalyticsKPIs } from "@/types/api";
import { formatPercentage } from "@/lib/utils";
import { TrendingUp, RotateCcw, Package, Activity } from "lucide-react";

interface AnalyticsKPISectionProps {
  kpis: AnalyticsKPIs;
  isLoading?: boolean;
}

export function AnalyticsKPISection({ kpis, isLoading }: AnalyticsKPISectionProps) {
  // This part of the code defines the KPI cards with their titles and formatting
  const kpiCards = [
    {
      title: "Order Volume Growth",
      value: kpis.orderVolumeGrowth,
      format: "percentage",
      showIndicator: true,
      icon: TrendingUp,
      iconColor: "text-blue-600",
      className: "bg-white",
    },
    {
      title: "Return Rate",
      value: kpis.returnRate,
      format: "percentage",
      showIndicator: false,
      icon: RotateCcw,
      iconColor: "text-orange-600",
      className: "bg-white",
    },
    {
      title: "Fulfillment Efficiency",
      value: kpis.fulfillmentEfficiency,
      format: "percentage",
      showIndicator: false,
      icon: Package,
      iconColor: "text-green-600",
      className: "bg-white",
    },
    {
      title: "Inventory Health Score",
      value: kpis.inventoryHealthScore,
      format: "percentage",
      showIndicator: false,
      icon: Activity,
      iconColor: "text-purple-600",
      className: "bg-white",
    },
  ];

  // This part of the code formats percentage values with proper indicators
  const formatValue = (value: number | null, format: string, showIndicator: boolean) => {
    if (value === null || value === undefined) return "N/A";
    
    if (format === "percentage") {
      return formatPercentage(value || 0, showIndicator);
    }
    
    return value.toString();
  };

  // This part of the code determines color based on KPI type and value
  const getValueColor = (value: number | null, _title: string, showIndicator: boolean) => {
    if (value === null || value === undefined) return "text-gray-500";
    
    if (showIndicator) {
      // This part of the code colors growth indicators (green for positive, red for negative)
      return value >= 0 ? "text-green-600" : "text-red-600";
    }
    
    // This part of the code uses standard coloring for other KPIs
    return "text-gray-900";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpiCards.map((kpi, index) => {
        const IconComponent = kpi.icon;
        return (
          <div
            key={index}
            className={`${kpi.className} p-4 rounded-lg border border-gray-200 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                <p className={`text-2xl font-bold ${getValueColor(kpi.value, kpi.title, kpi.showIndicator)}`}>
                  {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    formatValue(kpi.value, kpi.format, kpi.showIndicator)
                  )}
                </p>
              </div>
              <IconComponent className={`h-8 w-8 ${kpi.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
