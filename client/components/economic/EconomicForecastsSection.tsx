import type { EconomicForecast } from "@/types/api";

interface EconomicForecastsSectionProps {
  forecasts: EconomicForecast[];
  isLoading?: boolean;
}

export function EconomicForecastsSection({ forecasts, isLoading }: EconomicForecastsSectionProps) {
  // This part of the code determines confidence badge styling
  const getConfidenceBadge = (confidence: 'High' | 'Medium' | 'Low') => {
    switch (confidence) {
      case 'High':
        return { bgColor: "bg-green-100", textColor: "text-green-800", icon: "🟢" };
      case 'Medium':
        return { bgColor: "bg-yellow-100", textColor: "text-yellow-800", icon: "🟡" };
      case 'Low':
        return { bgColor: "bg-red-100", textColor: "text-red-800", icon: "🔴" };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!forecasts || forecasts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Economic Forecasts & Predictions
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-500">Economic forecasts will appear here</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Economic Forecasts & Predictions
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {forecasts.map((forecast) => {
          const confidenceBadge = getConfidenceBadge(forecast.confidence);
          
          return (
            <div key={forecast.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              {/* This part of the code displays the forecast header */}
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-md font-semibold text-gray-900">{forecast.title}</h5>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${confidenceBadge.bgColor} ${confidenceBadge.textColor}`}>
                  {confidenceBadge.icon} {forecast.confidence}
                </span>
              </div>

              {/* This part of the code displays the forecast content */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {forecast.forecast}
              </p>

              {/* This part of the code displays timeframe and impact */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{forecast.timeframe}</span>
                <span className={`font-medium ${
                  forecast.impactLevel === 'High' ? 'text-red-600' :
                  forecast.impactLevel === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {forecast.impactLevel} Impact
                </span>
              </div>

              {/* This part of the code displays contextual actions */}
              {forecast.contextualActions && forecast.contextualActions.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-700 mb-1">Key Actions:</div>
                  <div className="text-xs text-gray-600">
                    {forecast.contextualActions.slice(0, 2).map((action, index) => (
                      <div key={index} className="flex items-start mb-1">
                        <span className="text-blue-500 mr-1">•</span>
                        <span className="line-clamp-1">{action}</span>
                      </div>
                    ))}
                    {forecast.contextualActions.length > 2 && (
                      <div className="text-blue-600 font-medium">
                        +{forecast.contextualActions.length - 2} more actions
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
