import type { RiskOpportunityAnalysis } from "@/types/api";

interface RisksOpportunitiesSectionProps {
  risksOpportunities: RiskOpportunityAnalysis;
  isLoading?: boolean;
}

export function RisksOpportunitiesSection({ risksOpportunities, isLoading }: RisksOpportunitiesSectionProps) {
  // This part of the code determines severity/potential badge styling
  const getSeverityBadge = (severity: 'High' | 'Medium' | 'Low') => {
    switch (severity) {
      case 'High':
        return { bgColor: "bg-red-100", textColor: "text-red-800" };
      case 'Medium':
        return { bgColor: "bg-yellow-100", textColor: "text-yellow-800" };
      case 'Low':
        return { bgColor: "bg-green-100", textColor: "text-green-800" };
    }
  };

  const getPotentialBadge = (potential: 'High' | 'Medium' | 'Low') => {
    switch (potential) {
      case 'High':
        return { bgColor: "bg-green-100", textColor: "text-green-800" };
      case 'Medium':
        return { bgColor: "bg-blue-100", textColor: "text-blue-800" };
      case 'Low':
        return { bgColor: "bg-gray-100", textColor: "text-gray-800" };
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Risks Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Opportunities Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasRisks = risksOpportunities.risks && risksOpportunities.risks.length > 0;
  const hasOpportunities = risksOpportunities.opportunities && risksOpportunities.opportunities.length > 0;

  if (!hasRisks && !hasOpportunities) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Risks Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center mb-4">
            <span className="text-xl mr-2">⚠️</span>
            <h3 className="text-lg font-semibold text-gray-900">Key Risks</h3>
          </div>
          <div className="text-center py-4">
            <div className="text-gray-500">No risks identified</div>
          </div>
        </div>

        {/* Opportunities Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center mb-4">
            <span className="text-xl mr-2">💡</span>
            <h3 className="text-lg font-semibold text-gray-900">Opportunity Areas</h3>
          </div>
          <div className="text-center py-4">
            <div className="text-gray-500">No opportunities identified</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* This part of the code displays the risks analysis card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center mb-4">
          <span className="text-xl mr-2">⚠️</span>
          <h3 className="text-lg font-semibold text-gray-900">Key Risks</h3>
        </div>

        {hasRisks ? (
          <div className="space-y-4">
            {risksOpportunities.risks.map((risk, index) => {
              const severityBadge = getSeverityBadge(risk.severity);
              
              return (
                <div key={index} className="border border-red-200 bg-red-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-semibold text-gray-900">{risk.title}</h5>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${severityBadge.bgColor} ${severityBadge.textColor}`}>
                      {risk.severity}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2">{risk.description}</p>
                  
                  {risk.mitigation && risk.mitigation.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-700 mb-1">Mitigation:</div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {risk.mitigation.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start">
                            <span className="text-red-500 mr-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-gray-500">No risks identified</div>
          </div>
        )}
      </div>

      {/* This part of the code displays the opportunities analysis card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center mb-4">
          <span className="text-xl mr-2">💡</span>
          <h3 className="text-lg font-semibold text-gray-900">Opportunity Areas</h3>
        </div>

        {hasOpportunities ? (
          <div className="space-y-4">
            {risksOpportunities.opportunities.map((opportunity, index) => {
              const potentialBadge = getPotentialBadge(opportunity.potential);
              
              return (
                <div key={index} className="border border-green-200 bg-green-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-semibold text-gray-900">{opportunity.title}</h5>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${potentialBadge.bgColor} ${potentialBadge.textColor}`}>
                      {opportunity.potential}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2">{opportunity.description}</p>
                  
                  {opportunity.strategies && opportunity.strategies.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-700 mb-1">Strategies:</div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {opportunity.strategies.map((strategy, strategyIndex) => (
                          <li key={strategyIndex} className="flex items-start">
                            <span className="text-green-500 mr-1">•</span>
                            <span>{strategy}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-gray-500">No opportunities identified</div>
          </div>
        )}
      </div>
    </div>
  );
}
