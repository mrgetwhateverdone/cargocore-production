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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Orders",
      value: kpis.totalActiveOrders,
      unit: "",
      description: "Total active orders across all warehouses",
      icon: Package,
      color: "text-green-600", 
      bgColor: "bg-green-50",
    },
    {
      title: "Avg Fulfillment Time",
      value: kpis.avgFulfillmentTime,
      unit: "h",
      description: "Average fulfillment time in hours",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Inbound Throughput",
      value: kpis.totalInboundThroughput,
      unit: "",
      description: "Total inbound throughput across warehouses", 
      icon: Truck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
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
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
            </div>

            {/* This part of the code adds visual indicators for different KPI types */}
            {kpi.title === "SLA % by Warehouse" && kpi.value !== null && !isLoading && (
              <div className="mt-2">
                <div className="flex items-center text-xs">
                  <div 
                    className={`w-2 h-2 rounded-full mr-1 ${
                      kpi.value >= 95 ? 'bg-green-500' : 
                      kpi.value >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  ></div>
                  <span className={
                    kpi.value >= 95 ? 'text-green-600' : 
                    kpi.value >= 85 ? 'text-yellow-600' : 'text-red-600'
                  }>
                    {kpi.value >= 95 ? 'Excellent' : 
                     kpi.value >= 85 ? 'Good' : 'Needs Attention'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* This part of the code shows real-time data timestamp */}
      <div className="mt-4 text-right">
        <p className="text-xs text-gray-500">
          Real-time data from TinyBird warehouse operations
        </p>
      </div>
    </div>
  );
}
