import type { BrandPerformance } from "@/types/api";

interface BrandPerformanceSectionProps {
  brandPerformance: BrandPerformance;
  isLoading?: boolean;
}

export function BrandPerformanceSection({ brandPerformance, isLoading }: BrandPerformanceSectionProps) {
  // This part of the code determines badge colors based on ranking position
  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 text-white"; // Gold for #1
    if (rank === 2) return "bg-gray-400 text-white";   // Silver for #2
    if (rank === 3) return "bg-amber-600 text-white";  // Bronze for #3
    return "bg-blue-500 text-white";                   // Blue for others
  };

  // This part of the code determines performance level colors
  const getPerformanceLevelColor = (level: string) => {
    switch (level) {
      case "Leading Brand":
        return "text-green-700 bg-green-100";
      case "Top Performer":
        return "text-blue-700 bg-blue-100";
      case "Strong Performer":
        return "text-purple-700 bg-purple-100";
      case "Average Performer":
        return "text-gray-700 bg-gray-100";
      case "Developing Brand":
        return "text-orange-700 bg-orange-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Brand Performance
        </h2>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Summary Stats Loading */}
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center p-3 rounded-lg bg-gray-50">
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Brand Rankings Loading */}
          <div className="p-4">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center">
                    <div className="h-6 w-6 bg-gray-200 rounded animate-pulse mr-3" />
                    <div>
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1" />
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Brand Performance
      </h2>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Summary Stats Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* This part of the code displays total brands count */}
            <div className="text-center p-3 rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">
                {brandPerformance.totalBrands}
              </div>
              <div className="text-sm text-blue-700 font-medium">
                Total Brands
              </div>
            </div>
            
            {/* This part of the code displays top brand information */}
            <div className="text-center p-3 rounded-lg bg-green-50">
              <div className="text-lg font-bold text-green-600 truncate">
                {brandPerformance.topBrand.name}
              </div>
              <div className="text-sm text-green-700 font-medium">
                Top Brand
              </div>
            </div>
            
            {/* This part of the code displays top brand SKU count */}
            <div className="text-center p-3 rounded-lg bg-orange-50">
              <div className="text-2xl font-bold text-orange-600">
                {brandPerformance.topBrand.skuCount.toLocaleString()}
              </div>
              <div className="text-sm text-orange-700 font-medium">
                Top Brand SKUs
              </div>
            </div>
          </div>
        </div>

        {/* Brand Rankings Section */}
        <div className="p-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4">
            Complete brand ranking by inventory volume:
          </h3>
          
          {/* This part of the code creates a scrollable list of brand rankings */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {brandPerformance.brandRankings.map((brand) => (
              <div
                key={brand.rank}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
              >
                <div className="flex items-center">
                  {/* This part of the code displays the rank badge */}
                  <div className={`w-8 h-6 rounded flex items-center justify-center text-sm font-bold mr-3 ${getRankBadgeColor(brand.rank)}`}>
                    #{brand.rank}
                  </div>
                  
                  <div>
                    {/* This part of the code displays brand name and performance level */}
                    <div className="font-semibold text-gray-900 mb-1">
                      {brand.brandName}
                    </div>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPerformanceLevelColor(brand.performanceLevel)}`}>
                      {brand.performanceLevel}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {/* This part of the code displays SKU count and inventory percentage */}
                  <div className="font-semibold text-gray-900">
                    {brand.skuCount.toLocaleString()} SKUs
                  </div>
                  <div className="text-sm text-gray-500">
                    {(brand.inventoryPercentage || 0).toFixed(1)}% of inventory
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
