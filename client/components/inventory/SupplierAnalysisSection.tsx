import { Globe, AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { SupplierAnalysis } from "@/types/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { SupplierCountriesOverlay } from "./SupplierCountriesOverlay";

interface SupplierAnalysisSectionProps {
  supplierAnalysis: SupplierAnalysis[];
  isLoading?: boolean;
}

export function SupplierAnalysisSection({ supplierAnalysis, isLoading }: SupplierAnalysisSectionProps) {
  // This part of the code manages overlay state for displaying country details
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierAnalysis | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // This part of the code formats currency values using the global utility

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

  // This part of the code handles opening the countries overlay
  const handleCountriesClick = (supplier: SupplierAnalysis) => {
    setSelectedSupplier(supplier);
    setIsOverlayOpen(true);
  };

  // This part of the code handles closing the overlay
  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
    setSelectedSupplier(null);
  };

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

        {/* This part of the code displays the supplier table in the same format as Top Supplier Analysis */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKUs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Countries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diversity Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Multi-Source SKUs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {supplierAnalysis.map((supplier, index) => {
                const risk = getRiskLevel(supplier.concentration_risk);
                
                return (
                  <tr key={supplier.supplier_name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {supplier.supplier_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {formatCurrency(supplier.total_value)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatNumber(supplier.sku_count)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleCountriesClick(supplier)}
                          className="flex items-center hover:bg-gray-100 rounded-md p-1 transition-colors group"
                          title="Click to view countries"
                        >
                          <Globe className="h-4 w-4 text-gray-400 group-hover:text-blue-600 mr-2 transition-colors" />
                          <div className="text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                            {formatNumber(supplier.countries.length)}
                          </div>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-center">
                        <div className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${
                          supplier.diversity_score >= 80 ? 'bg-green-100 text-green-800' :
                          supplier.diversity_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          supplier.diversity_score >= 40 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {supplier.diversity_score}/100
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {supplier.avg_lead_time !== null ? (
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${
                            supplier.avg_lead_time <= 7 ? 'bg-green-100 text-green-800' :
                            supplier.avg_lead_time <= 14 ? 'bg-yellow-100 text-yellow-800' :
                            supplier.avg_lead_time <= 30 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {supplier.avg_lead_time} days
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">No data</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-center">
                        <div className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${
                          supplier.multi_source_skus > 5 ? 'bg-green-100 text-green-800' :
                          supplier.multi_source_skus > 2 ? 'bg-yellow-100 text-yellow-800' :
                          supplier.multi_source_skus > 0 ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {formatNumber(supplier.multi_source_skus)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full border ${risk.bgColor}`}>
                        <div className={`text-sm font-medium ${risk.color}`}>
                          {supplier.concentration_risk}% {risk.level}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* This part of the code renders the countries overlay when a supplier is selected */}
      <SupplierCountriesOverlay
        isOpen={isOverlayOpen}
        onClose={handleCloseOverlay}
        supplier={selectedSupplier}
      />
    </div>
  );
}
