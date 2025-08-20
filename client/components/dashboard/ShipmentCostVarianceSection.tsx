import type { CostVarianceAnomaly } from "@/types/api";
import { AlertTriangle, Eye } from "lucide-react";
import { useState } from "react";
import { CostVarianceOverlay } from "../CostVarianceOverlay";

interface ShipmentCostVarianceSectionProps {
  costVariances: CostVarianceAnomaly[];
  isLoading?: boolean;
}

export function ShipmentCostVarianceSection({
  costVariances,
  isLoading,
}: ShipmentCostVarianceSectionProps) {
  const [selectedAnomaly, setSelectedAnomaly] = useState<CostVarianceAnomaly | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // This part of the code handles clicking on cost variance cards to get AI recommendations
  const handleAnomalyClick = async (anomaly: CostVarianceAnomaly) => {
    setSelectedAnomaly(anomaly);
    setIsOverlayOpen(true);
    setIsLoadingRecommendations(true);
    setRecommendations([]);

    try {
      // This part of the code calculates context data for AI recommendations
      const contextData = {
        totalAnomalies: costVariances.length,
        avgVariance: costVariances.reduce((sum, a) => sum + a.variance, 0) / costVariances.length,
        totalImpact: costVariances.reduce((sum, a) => sum + a.financialImpact, 0),
        supplierCount: new Set(costVariances.map(a => a.supplier).filter(s => s)).size,
        warehouseCount: new Set(costVariances.map(a => a.warehouseId).filter(w => w)).size
      };

      const response = await fetch('/api/cost-variance-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          anomaly,
          contextData
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data.data.recommendations);
    } catch (error) {
      console.error('Failed to load cost variance recommendations:', error);
      // Set fallback recommendations
      setRecommendations([
        'Review supplier contracts and negotiate volume discounts',
        'Implement cost monitoring alerts for future variances',
        'Establish approval workflows for non-standard pricing',
        'Conduct supplier performance audit and optimization review'
      ]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // This part of the code handles closing the overlay
  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
    setSelectedAnomaly(null);
    setRecommendations([]);
  };
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-red-50 border-red-200";
      case "Medium":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getSeverityTextStyles = (severity: string) => {
    switch (severity) {
      case "High":
        return "text-red-800";
      case "Medium":
        return "text-yellow-800";
      default:
        return "text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">
            Shipment Cost Variance Detection
          </h2>
          <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            Live Data
          </span>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700 flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            AI analyzing real-time cost patterns from all COMP002_packiyo warehouses...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        {/* This part of the code displays the alert triangle icon to indicate cost anomaly detection */}
        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
        <h2 className="text-lg font-medium text-gray-900">
          Shipment Cost Variance Detection
        </h2>
        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
          Live Data
        </span>
      </div>

      {costVariances.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-700 flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            No cost anomalies detected - all warehouses operating within normal parameters
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {costVariances.map((anomaly, index) => (
            <div
              key={`cost-variance-${index}`}
              onClick={() => handleAnomalyClick(anomaly)}
              className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all hover:scale-[1.01] ${getSeverityStyles(anomaly.severity)}`}
              title="Click for AI cost optimization recommendations"
            >
              <div className="flex justify-between items-start">
                {/* This part of the code displays alert details on the left side */}
                <div className="flex-1">
                  <h3 className={`font-medium ${getSeverityTextStyles(anomaly.severity)}`}>
                    {anomaly.title}
                  </h3>
                  <p className={`text-sm ${getSeverityTextStyles(anomaly.severity)}`}>
                    {anomaly.description}
                  </p>
                  
                  {/* This part of the code displays risk factors as tags */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {anomaly.riskFactors.map((factor, factorIndex) => (
                      <span 
                        key={factorIndex}
                        className={`text-xs px-2 py-1 rounded ${anomaly.severity === "High" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* This part of the code displays cost comparison on the right side */}
                <div className="text-right ml-4">
                  <div className={`text-lg font-semibold ${anomaly.severity === "High" ? "text-red-800" : "text-yellow-800"}`}>
                    ${anomaly.currentValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    vs ${anomaly.expectedValue.toLocaleString()} avg
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    +{anomaly.variance}% variance
                  </div>
                  <div className="text-xs text-gray-600">
                    Impact: ${anomaly.financialImpact.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* This part of the code displays footer timestamp */}
      <div className="text-xs text-gray-500 text-center pt-2">
        Last updated: {new Date().toLocaleTimeString()}
      </div>

      {/* This part of the code renders the cost variance overlay with AI recommendations */}
      <CostVarianceOverlay
        isOpen={isOverlayOpen}
        onClose={handleCloseOverlay}
        anomaly={selectedAnomaly}
        recommendations={recommendations}
        isLoadingRecommendations={isLoadingRecommendations}
      />
    </div>
  );
}
