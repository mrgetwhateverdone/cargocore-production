import type { OrdersKPIs } from "@/types/api";
import { formatNumber } from "@/lib/utils";
import { ShoppingCart, AlertTriangle, FileText, XCircle } from "lucide-react";

interface OrdersKPISectionProps {
  kpis: OrdersKPIs;
  isLoading?: boolean;
}

export function OrdersKPISection({ kpis, isLoading }: OrdersKPISectionProps) {
  // This part of the code defines the KPI cards with their titles and status indicators
  const kpiCards = [
    {
      title: "Orders Today",
      value: kpis.ordersToday,
      description: "New orders received today",
      icon: ShoppingCart,
      iconColor: "text-blue-600",
      className: "bg-white",
      colorClass: "text-blue-600",
    },
    {
      title: "At-Risk Orders",
      value: kpis.atRiskOrders,
      description: "Orders with delays or issues",
      icon: AlertTriangle,
      iconColor: "text-red-600",
      className: "bg-white",
      colorClass: kpis.atRiskOrders > 0 ? "text-red-600" : "text-gray-600",
    },
    {
      title: "Open POs",
      value: kpis.openPOs,
      description: "Active purchase orders",
      icon: FileText,
      iconColor: "text-green-600",
      className: "bg-white",
      colorClass: "text-green-600",
    },
    {
      title: "Unfulfillable SKUs",
      value: kpis.unfulfillableSKUs,
      description: "SKUs with fulfillment issues",
      icon: XCircle,
      iconColor: "text-orange-600",
      className: "bg-white",
      colorClass: kpis.unfulfillableSKUs > 0 ? "text-orange-600" : "text-gray-600",
    },
  ];

  // This part of the code handles the display logic for different states
  const formatValue = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "N/A";
    if (value === 0) return "—";
    return formatNumber(value);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="text-sm font-medium text-gray-500 mb-1">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="text-2xl font-semibold mb-1">
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="text-sm text-gray-500">
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

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
                <p className={`text-2xl font-bold ${kpi.colorClass}`}>
                  {formatValue(kpi.value)}
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
