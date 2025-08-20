import type { MarginRiskAlert } from "@/types/api";
import { BrainIcon } from "../ui/BrainIcon";
import { useState } from "react";
import { MarginRiskOverlay } from "../MarginRiskOverlay";

interface SmartMarginRiskSectionProps {
  marginRisks: MarginRiskAlert[];
  isLoading?: boolean;
}

export function SmartMarginRiskSection({
  marginRisks,
  isLoading,
}: SmartMarginRiskSectionProps) {
  const [selectedMarginRisk, setSelectedMarginRisk] = useState<MarginRiskAlert | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // This part of the code handles clicking on margin risk cards to get AI recommendations
  const handleMarginRiskClick = async (marginRisk: MarginRiskAlert) => {
    setSelectedMarginRisk(marginRisk);
    setIsOverlayOpen(true);
    setIsLoadingRecommendations(true);
    setRecommendations([]);

    try {
      // This part of the code calculates context data for AI recommendations
      const contextData = {
        totalBrands: marginRisks.length,
        avgMargin: marginRisks.reduce((sum, m) => sum + m.currentMargin, 0) / marginRisks.length,
        totalImpact: marginRisks.reduce((sum, m) => sum + m.financialImpact, 0),
        highRiskBrands: marginRisks.filter(m => m.riskLevel === 'High').length,
        totalSKUs: marginRisks.reduce((sum, m) => sum + m.skuCount, 0)
      };

      const response = await fetch(`/api/dashboard-data?marginRecommendations=true&marginRisk=${encodeURIComponent(JSON.stringify(marginRisk))}&contextData=${encodeURIComponent(JSON.stringify(contextData))}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data.data.recommendations);
    } catch (error) {
      console.error('Failed to load margin risk recommendations:', error);
      // Set fallback recommendations
      setRecommendations([
        'Review pricing strategy and implement margin-based pricing tiers',
        'Optimize product mix by focusing on high-margin SKUs',
        'Negotiate better supplier terms and volume discounts',
        'Implement SKU rationalization to eliminate low-margin products'
      ]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // This part of the code handles closing the overlay
  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
    setSelectedMarginRisk(null);
    setRecommendations([]);
  };
  const getRiskStyles = (riskLevel: string) => {
    switch (riskLevel) {
      case "High":
        return "bg-red-50 text-red-800 border-red-200";
      case "Medium":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-blue-50 text-blue-800 border-blue-200";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  const getRiskBadgeStyles = (riskLevel: string) => {
    switch (riskLevel) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <BrainIcon className="h-5 w-5 text-purple-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">
            Smart Margin Risk Analysis
          </h2>
          <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            Analysis
          </span>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-purple-700">AI analyzing margin risks across brand portfolio...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        {/* This part of the code displays the brain icon to indicate AI-powered margin analysis */}
        <BrainIcon className="h-5 w-5 text-purple-600 mr-2" />
        <h2 className="text-lg font-medium text-gray-900">
          Smart Margin Risk Analysis
        </h2>
        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
          Analysis
        </span>
      </div>

      {marginRisks.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-700">✓ No margin risks detected for brand portfolio</div>
        </div>
      ) : (
        <div className="space-y-3">
          {marginRisks.map((alert, index) => (
            <div
              key={`margin-risk-${index}`}
              onClick={() => handleMarginRiskClick(alert)}
              className={`p-4 rounded-lg border cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] hover:z-10 relative ${getRiskStyles(alert.riskLevel)}`}
              title="Click for AI margin optimization recommendations"
            >
              {/* This part of the code displays brand name and risk level badge */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium">{alert.brandName} - Margin Risk Alert</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getRiskBadgeStyles(alert.riskLevel)}`}>
                  {alert.riskLevel} risk
                </span>
              </div>

              {/* This part of the code displays 3-column metrics grid */}
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-500">Current Margin</div>
                  <div className="font-semibold">{alert.currentMargin}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Risk Score</div>
                  <div className={`font-semibold ${alert.riskLevel === "High" ? "text-red-600" : alert.riskLevel === "Medium" ? "text-yellow-600" : "text-blue-600"}`}>
                    {alert.riskScore}/100
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">SKU Count</div>
                  <div className="font-semibold">{alert.skuCount}</div>
                </div>
              </div>

              {/* This part of the code displays risk drivers as tags */}
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">Primary Risk Drivers:</div>
                <div className="flex flex-wrap gap-1">
                  {alert.primaryDrivers.map((driver, driverIndex) => (
                    <span 
                      key={driverIndex}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {driver}
                    </span>
                  ))}
                </div>
              </div>

              {/* This part of the code displays financial impact */}
              <div className="text-xs text-gray-600">
                Potential annual impact: ${alert.financialImpact.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        Real-time margin risk analysis based on brand performance and cost data
      </div>

      {/* This part of the code renders the margin risk overlay with AI recommendations */}
      <MarginRiskOverlay
        isOpen={isOverlayOpen}
        onClose={handleCloseOverlay}
        marginRisk={selectedMarginRisk}
        recommendations={recommendations}
        isLoadingRecommendations={isLoadingRecommendations}
      />
    </div>
  );
}
