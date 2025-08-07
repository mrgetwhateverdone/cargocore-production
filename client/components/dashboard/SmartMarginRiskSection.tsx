import type { MarginRiskAlert } from "@/types/api";
import { BrainIcon } from "../ui/BrainIcon";

interface SmartMarginRiskSectionProps {
  marginRisks: MarginRiskAlert[];
  isLoading?: boolean;
}

export function SmartMarginRiskSection({
  marginRisks,
  isLoading,
}: SmartMarginRiskSectionProps) {
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
              className={`p-4 rounded-lg border ${getRiskStyles(alert.riskLevel)}`}
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
    </div>
  );
}
