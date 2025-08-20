import type { WarehouseKPIs } from "@/types/api";
import { formatPercentage, formatNumber } from "@/lib/utils";
import { BarChart3, Package, Clock, Truck } from "lucide-react";

interface WarehouseKPISectionProps {
  kpis: WarehouseKPIs;
  isLoading?: boolean;
}

/**
 * This part of the code creates warehouse KPI cards following existing dashboard patterns
 * Displays top-level metrics: SLA %, Active Orders, Avg Fulfillment Time, Inbound Throughput
 */
export function WarehouseKPISection({ kpis, isLoading }: WarehouseKPISectionProps) {
  // This part of the code defines the KPI configuration with icons and formatting
  const kpiCards = [
    {
      title: "SLA % by Warehouse",
      value: kpis.avgSLAPercentage,
      unit: "%",
      description: "Average SLA percentage across all warehouses",
      icon: BarChart3,
      color: "text-gray-900",
      iconColor: "text-blue-600",
    },
    {
      title: "Active Orders",
      value: kpis.totalActiveOrders,
      unit: "",
      description: "Total active orders across all warehouses",
      icon: Package,
      color: "text-gray-900", 
      iconColor: "text-green-600",
    },
    {
      title: "Avg Fulfillment Time",
      value: kpis.avgFulfillmentTime,
      unit: "h",
      description: "Average fulfillment time in hours",
      icon: Clock,
      color: "text-gray-900",
      iconColor: "text-orange-600",
    },
    {
      title: "Inbound Throughput",
      value: kpis.totalInboundThroughput,
      unit: "",
      description: "Total inbound throughput across warehouses", 
      icon: Truck,
      color: "text-gray-900",
      iconColor: "text-purple-600",
    },
  ];

  // This part of the code formats KPI values with proper fallbacks for loading/error states
  const formatKPIValue = (value: number | null, unit: string) => {
    if (isLoading) return "—";
    if (value === null || value === undefined) return "N/A";
    
    // This part of the code handles different number formatting based on type
    if (typeof value === "number") {
      if (unit === "%") {
        return formatPercentage(value);
      } else if (unit === "h") {
        // This part of the code keeps hours with one decimal for precision
        return `${value.toFixed(1)}`;
      }
      return formatNumber(value);
    }
    
    return "Check WMS Connection";
  };

  return (
    <div className="mb-6">
      {/* This part of the code creates responsive grid layout for KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.title}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>
                  {formatKPIValue(kpi.value, kpi.unit)}{kpi.unit}
                </p>
              </div>
              <kpi.icon className={`h-8 w-8 ${kpi.iconColor}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
