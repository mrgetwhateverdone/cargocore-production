import type { DashboardKPIs } from "@/types/api";
import { useSettingsIntegration } from "@/hooks/useSettingsIntegration";
import { FormattedNumber } from "@/components/ui/formatted-value";

interface KPISectionProps {
  kpis: DashboardKPIs;
  isLoading?: boolean;
}

export function KPISection({ kpis, isLoading }: KPISectionProps) {
  const { formatNumber } = useSettingsIntegration();
  const kpiCards = [
    {
      title: "Total Orders Today",
      value: kpis.totalOrdersToday,
      className: "bg-white",
    },
    {
      title: "At-Risk Orders",
      value: kpis.atRiskOrders,
      className: "bg-white",
    },
    {
      title: "Open POs",
      value: kpis.openPOs,
      className: "bg-white",
    },
    {
      title: "Unfulfillable SKUs",
      value: kpis.unfulfillableSKUs,
      className: "bg-white",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpiCards.map((kpi, index) => (
        <div
          key={index}
          className={`${kpi.className} p-4 rounded-lg border border-gray-200 shadow-sm`}
        >
          <div className="text-sm font-medium text-gray-500 mb-1">
            {kpi.title}
          </div>
          <div className="text-2xl font-semibold text-gray-900">
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              formatNumber(kpi.value)
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
