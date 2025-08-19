import type { EconomicKPIs } from "@/types/api";
import { formatNumber, formatPercentage } from "@/lib/utils";
import { Users, DollarSign, Truck, Activity } from "lucide-react";

interface EconomicIntelligenceKPISectionProps {
  kpis: EconomicKPIs;
  isLoading?: boolean;
}

export function EconomicIntelligenceKPISection({ kpis, isLoading }: EconomicIntelligenceKPISectionProps) {
  // This part of the code defines the KPI cards with their titles, values, and icons
  const kpiCards = [
    {
      title: "Supplier Performance",
      value: kpis.supplierPerformance,
      icon: Users,
      iconColor: "text-blue-600",
      format: (val: number | null) => val ? `${formatNumber(val)}/100` : "N/A",
      className: "bg-white",
    },
    {
      title: "Shipping Cost Impact",
      value: kpis.shippingCostImpact,
      icon: DollarSign,
      iconColor: "text-green-600",
      format: (val: number | null) => formatPercentage(val),
      className: "bg-white",
    },
    {
      title: "Transportation Costs",
      value: kpis.transportationCosts,
      icon: Truck,
      iconColor: "text-orange-600",
      format: (val: number | null) => formatPercentage(val),
      className: "bg-white",
    },
    {
      title: "Supply Chain Health",
      value: kpis.supplyChainHealth,
      icon: Activity,
      iconColor: "text-purple-600",
      format: (val: number | null) => val ? `${formatNumber(val)}/100` : "N/A",
      className: "bg-white",
    },
  ];

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
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    kpi.format(kpi.value)
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
