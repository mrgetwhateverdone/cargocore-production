import type { BusinessImpactAnalysis } from "@/types/api";

interface BusinessImpactSectionProps {
  businessImpact: BusinessImpactAnalysis;
  isLoading?: boolean;
}

export function BusinessImpactSection({ businessImpact, isLoading }: BusinessImpactSectionProps) {
  // This part of the code determines impact badge styling
  const getImpactBadge = (impact: 'High' | 'Medium' | 'Low') => {
    switch (impact) {
      case 'High':
        return { bgColor: "bg-red-100", textColor: "text-red-800", icon: "🔴" };
      case 'Medium':
        return { bgColor: "bg-yellow-100", textColor: "text-yellow-800", icon: "🟡" };
      case 'Low':
        return { bgColor: "bg-green-100", textColor: "text-green-800", icon: "🟢" };
    }
  };

  // This part of the code formats currency values
  const formatCurrency = (amount: number) => {
    const safeAmount = amount || 0;
    if (safeAmount >= 1000000) return `$${(safeAmount / 1000000).toFixed(1)}M`;
    if (safeAmount >= 1000) return `$${(safeAmount / 1000).toFixed(1)}K`;
    return `$${(safeAmount || 0).toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          
          {/* Executive Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
          
          {/* Impact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!businessImpact.executiveSummary && (!businessImpact.impactCards || businessImpact.impactCards.length === 0)) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          How This Affects Your Business
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-500">Business impact analysis will appear here</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        How This Affects Your Business
      </h3>

      {/* This part of the code displays the executive summary */}
      {businessImpact.executiveSummary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="text-md font-semibold text-blue-900 mb-3">Executive Summary</h4>
          <p className="text-sm text-blue-800 leading-relaxed">
            {businessImpact.executiveSummary}
          </p>
        </div>
      )}

      {/* This part of the code displays business impact cards */}
      {businessImpact.impactCards && businessImpact.impactCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businessImpact.impactCards.map((card, index) => {
            const impactBadge = getImpactBadge(card.impact);
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {/* This part of the code displays the card header */}
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-md font-semibold text-gray-900">{card.title}</h5>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${impactBadge.bgColor} ${impactBadge.textColor}`}>
                      {impactBadge.icon} {card.impact}
                    </span>
                  </div>
                </div>

                {/* This part of the code displays cost impact and timeframe */}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(card.costImpact)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {card.timeframe}
                  </div>
                </div>

                {/* This part of the code displays the description */}
                <p className="text-sm text-gray-600 mb-3">
                  {card.description}
                </p>

                {/* This part of the code displays recommendations */}
                {card.recommendations && card.recommendations.length > 0 && (
                  <div>
                    <h6 className="text-xs font-semibold text-gray-700 mb-2">Recommendations:</h6>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {card.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
