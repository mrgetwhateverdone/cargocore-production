import { useState, useMemo } from "react";
import type { BrandPerformance } from "@/types/api";

interface ViewAllBrandsModalProps {
  brands: BrandPerformance[];
  isOpen: boolean;
  onClose: () => void;
}

export function ViewAllBrandsModal({ brands, isOpen, onClose }: ViewAllBrandsModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // This part of the code formats currency values for display
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toLocaleString()}`;
  };

  // This part of the code filters brands based on search term
  const filteredBrands = useMemo(() => {
    if (!searchTerm) return brands;
    
    return brands.filter(brand =>
      brand.brand_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [brands, searchTerm]);

  // This part of the code determines investment classification based on value efficiency
  const getInvestmentClass = (brand: BrandPerformance, index: number) => {
    const avgValue = brand.avg_value_per_sku;
    if (index === 0) return "Premium Portfolio";
    else if (avgValue > 50) return "High-Value Brand";
    else if (avgValue > 20) return "Mid-Tier Brand";
    else if (avgValue > 10) return "Value Brand";
    else return "Economy Brand";
  };

  // This part of the code determines rank badge styling
  const getRankBadgeClass = (index: number) => {
    if (index === 0) return "bg-yellow-100 text-yellow-800"; // Gold
    else if (index === 1) return "bg-gray-300 text-gray-800"; // Silver
    else if (index === 2) return "bg-orange-100 text-orange-800"; // Bronze
    return "bg-gray-100 text-gray-800";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* This part of the code displays the modal header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                All Brand Investment Rankings
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Complete financial analysis of all {brands.length} brands by inventory value
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* This part of the code provides search functionality */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* This part of the code displays the scrollable brand list */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-3">
            {filteredBrands.map((brand, index) => {
              const originalIndex = brands.findIndex(b => b.brand_name === brand.brand_name);
              
              return (
                <div
                  key={brand.brand_name}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {/* This part of the code displays the rank badge */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRankBadgeClass(originalIndex)}`}>
                      #{originalIndex + 1}
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-900">{brand.brand_name}</div>
                      <div className="text-sm text-gray-500">
                        {getInvestmentClass(brand, originalIndex)}
                      </div>
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

          {/* This part of the code displays message when no brands match search */}
          {filteredBrands.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No brands found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
