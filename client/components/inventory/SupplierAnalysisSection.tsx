import { Globe, AlertTriangle } from "lucide-react";
import type { SupplierAnalysis } from "@/types/api";

interface SupplierAnalysisSectionProps {
  supplierAnalysis: SupplierAnalysis[];
  isLoading?: boolean;
}

export function SupplierAnalysisSection({ supplierAnalysis, isLoading }: SupplierAnalysisSectionProps) {
  // This part of the code formats currency values for display
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toLocaleString()}`;
  };

  // This part of the code determines risk level based on concentration
  const getRiskLevel = (concentration: number) => {
    if (concentration >= 50) return { level: "Critical", color: "text-red-600", bgColor: "bg-red-50 border-red-200" };
    if (concentration >= 30) return { level: "High", color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200" };
    if (concentration >= 15) return { level: "Medium", color: "text-yellow-600", bgColor: "bg-yellow-50 border-yellow-200" };
    return { level: "Low", color: "text-green-600", bgColor: "bg-green-50 border-green-200" };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Supplier Analysis</h3>
          <p className="text-sm text-gray-500">Loading supplier analytics...</p>
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

  if (supplierAnalysis.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Supplier Analysis</h3>
          <p className="text-sm text-gray-500">Supply chain risk and geographic distribution</p>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center">Information not in dataset.</p>
        </div>
      </div>
    );
  }

  // This part of the code calculates high-risk suppliers
  const highRiskSuppliers = supplierAnalysis.filter(s => s.concentration_risk >= 30);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Supplier Analysis</h3>
        <p className="text-sm text-gray-500">
          Supply chain concentration risk and geographic distribution
        </p>
      </div>

      <div className="p-6">
        {/* This part of the code displays supplier risk summary */}
        {highRiskSuppliers.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Supply Chain Risk Alert</h4>
                <p className="text-sm text-amber-700 mt-1">
                  {highRiskSuppliers.length} supplier(s) represent high concentration risk (≥30% of inventory value)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* This part of the code displays supplier overview metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-semibold text-blue-600">
              {supplierAnalysis.length}
            </div>
            <div className="text-sm text-blue-800">Total Suppliers</div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-2xl font-semibold text-red-600">
              {highRiskSuppliers.length}
            </div>
            <div className="text-sm text-red-800">High Risk Suppliers</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-semibold text-green-600">
              {supplierAnalysis.reduce((acc, s) => acc + s.countries.length, 0)}
            </div>
            <div className="text-sm text-green-800">Source Countries</div>
          </div>
        </div>

        {/* This part of the code displays the supplier list */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {supplierAnalysis.map((supplier, index) => {
            const risk = getRiskLevel(supplier.concentration_risk);
            
            return (
              <div
                key={supplier.supplier_name}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{supplier.supplier_name}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {supplier.countries.length > 0 ? supplier.countries.join(', ') : 'Unknown origin'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(supplier.total_value)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {supplier.sku_count} SKUs
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full border ${risk.bgColor}`}>
                    <div className={`text-sm font-medium ${risk.color}`}>
                      {supplier.concentration_risk}%
                    </div>
                    <div className={`text-xs ${risk.color}`}>
                      {risk.level} Risk
                    </div>
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
