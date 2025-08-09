import type { EconomicKPIs } from "@/types/api";

interface EconomicKPISectionProps {
  kpis: EconomicKPIs;
  isLoading?: boolean;
}

export function EconomicKPISection({ kpis, isLoading }: EconomicKPISectionProps) {
  // This part of the code defines the KPI cards configuration
  const kpiCards = [
    {
      title: "Supplier Performance",
      value: kpis.supplierPerformance !== null ? `${kpis.supplierPerformance}/100` : "N/A",
      subtitle: "Port congestion index",
      trend: null,
      icon: "📦",
    },
    {
      title: "Shipping Cost Impact", 
      value: kpis.shippingCostImpact !== null ? `${kpis.shippingCostImpact.toFixed(1)}%` : "N/A",
      subtitle: "Freight cost trend",
      trend: kpis.shippingCostImpact !== null ? (kpis.shippingCostImpact > 0 ? "up" : kpis.shippingCostImpact < 0 ? "down" : null) : null,
      icon: "🚢",
    },
    {
      title: "Transportation Costs",
      value: kpis.transportationCosts !== null ? `${kpis.transportationCosts.toFixed(1)}%` : "N/A",
      subtitle: "Fuel price impact", 
      trend: kpis.transportationCosts !== null ? (kpis.transportationCosts > 0 ? "up" : kpis.transportationCosts < 0 ? "down" : null) : null,
      icon: "⛽",
    },
    {
      title: "Supply Chain Health",
      value: kpis.supplyChainHealth !== null ? `${kpis.supplyChainHealth}/100` : "N/A",
      subtitle: "Global trade index",
      trend: null,
      icon: "🌍",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpiCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpiCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          {/* This part of the code displays the card header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
            <span className="text-2xl">{card.icon}</span>
          </div>
          
          {/* This part of the code displays the main value */}
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">
              {card.value}
            </p>
            {card.trend && (
              <span className={`ml-2 text-sm font-medium ${
                card.trend === 'up' ? 'text-red-600' : 'text-green-600'
              }`}>
                {card.trend === 'up' ? '↗' : '↘'}
              </span>
            )}
          </div>
          
          {/* This part of the code displays the subtitle */}
          <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
}
