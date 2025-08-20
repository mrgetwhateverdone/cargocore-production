import type { DashboardKPIs } from "@/types/api";
import { formatNumber } from "@/lib/utils";
import { Package, AlertTriangle, FileText, XCircle } from "lucide-react";
import { evaluateKPIStatus, renderKPIWarningIcon } from "@/lib/kpiThresholds";

interface KPISectionProps {
  kpis: DashboardKPIs;
  isLoading?: boolean;
}

export function KPISection({ kpis, isLoading }: KPISectionProps) {
  const kpiCards = [
    {
      title: "Total Orders Today",
      value: kpis.totalOrdersToday,
      icon: Package,
      iconColor: "text-blue-600",
      className: "bg-white",
      thresholdKey: null, // No threshold for this metric
    },
    {
      title: "At-Risk Orders",
      value: kpis.atRiskOrders,
      icon: AlertTriangle,
      iconColor: "text-red-600",
      className: "bg-white",
      thresholdKey: "at_risk_orders",
    },
    {
      title: "Open POs",
      value: kpis.openPOs,
      icon: FileText,
      iconColor: "text-green-600",
      className: "bg-white",
      thresholdKey: null, // No threshold for this metric
    },
    {
      title: "Unfulfillable SKUs",
      value: kpis.unfulfillableSKUs,
      icon: XCircle,
      iconColor: "text-orange-600",
      className: "bg-white",
      thresholdKey: "unfulfillable_skus",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpiCards.map((kpi, index) => {
        const IconComponent = kpi.icon;
        const status = kpi.thresholdKey ? evaluateKPIStatus(kpi.thresholdKey, kpi.value) : 'normal';
        
        return (
          <div
            key={index}
            className={`${kpi.className} p-4 rounded-lg border border-gray-200 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {kpi.title}
                  {!isLoading && renderKPIWarningIcon(status)}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    formatNumber(kpi.value)
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
