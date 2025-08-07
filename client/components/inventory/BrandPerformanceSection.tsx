import type { BrandPerformance } from "@/types/api";

interface BrandPerformanceSectionProps {
  brandPerformance: BrandPerformance[];
  isLoading?: boolean;
}

export function BrandPerformanceSection({ brandPerformance, isLoading }: BrandPerformanceSectionProps) {
  // This part of the code formats currency values for display
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Brand Performance</h3>
          <p className="text-sm text-gray-500">Loading brand analytics...</p>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (brandPerformance.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Brand Performance</h3>
          <p className="text-sm text-gray-500">Brand analysis by inventory value</p>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center">Information not in dataset.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Brand Inventory Investment</h3>
        <p className="text-sm text-gray-500">
          Financial analysis of {brandPerformance.length} brands by inventory value and efficiency
        </p>
      </div>

      <div className="p-6">
        {/* This part of the code displays inventory investment summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-semibold text-blue-600">
              {brandPerformance.length}
            </div>
            <div className="text-sm text-blue-800">Brands in Portfolio</div>
          </div>
          
          {brandPerformance[0] && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-lg font-semibold text-green-600 truncate">
                {brandPerformance[0].brand_name}
              </div>
              <div className="text-sm text-green-800">Highest Investment</div>
            </div>
          )}
          
          {brandPerformance[0] && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-lg font-semibold text-purple-600">
                {formatCurrency(brandPerformance[0].total_value)}
              </div>
              <div className="text-sm text-purple-800">Top Brand Value</div>
            </div>
          )}
          
          {brandPerformance[0] && (
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="text-lg font-semibold text-orange-600">
                {formatCurrency(brandPerformance[0].avg_value_per_sku)}
              </div>
              <div className="text-sm text-orange-800">Avg Value/SKU</div>
            </div>
          )}
        </div>

        {/* This part of the code displays the brand ranking list */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {brandPerformance.map((brand, index) => {
            // This part of the code determines rank badge styling
            let rankBadgeClass = "bg-gray-100 text-gray-800";
            if (index === 0) rankBadgeClass = "bg-yellow-100 text-yellow-800"; // Gold
            else if (index === 1) rankBadgeClass = "bg-gray-300 text-gray-800"; // Silver
            else if (index === 2) rankBadgeClass = "bg-orange-100 text-orange-800"; // Bronze

            // This part of the code determines investment classification based on value efficiency
            let investmentClass = "Value Investment";
            const avgValue = brand.avg_value_per_sku;
            if (index === 0) investmentClass = "Premium Portfolio";
            else if (avgValue > 50) investmentClass = "High-Value Brand";
            else if (avgValue > 20) investmentClass = "Mid-Tier Brand";
            else if (avgValue > 10) investmentClass = "Value Brand";
            else investmentClass = "Economy Brand";

            return (
              <div
                key={brand.brand_name}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {/* This part of the code displays the rank badge */}
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${rankBadgeClass}`}>
                    #{index + 1}
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900">{brand.brand_name}</div>
                    <div className="text-sm text-gray-500">{investmentClass}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {formatCurrency(brand.total_value)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {brand.sku_count} SKUs • {formatCurrency(brand.avg_value_per_sku)}/SKU • {brand.portfolio_percentage}% of portfolio
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
