import { Layout } from "@/components/layout/Layout";
import { useEconomicIntelligenceData } from "@/hooks/useEconomicIntelligenceData";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { useSettingsIntegration } from "@/hooks/useSettingsIntegration";
import { FormattedCurrency } from "@/components/ui/formatted-value";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, 
  Info, 
  DollarSign,
  Target,
  Globe
} from "lucide-react";

/**
 * This part of the code creates the Economic Intelligence page with real data analysis
 * Matches the UI from screenshots while using actual TinyBird calculations
 */
export default function EconomicIntelligence() {
  const { data, isLoading, error, refetch } = useEconomicIntelligenceData();
  const { isPageAIEnabled } = useSettingsIntegration();

  // This part of the code determines status badge color based on performance value
  const getStatusColor = (value: number, type: 'performance' | 'cost' | 'health') => {
    if (type === 'performance' || type === 'health') {
      if (value >= 90) return 'bg-green-100 text-green-800';
      if (value >= 70) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    } else if (type === 'cost') {
      if (value <= 110) return 'bg-green-100 text-green-800';
      if (value <= 130) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  // This part of the code determines status text for KPI cards
  const getStatusText = (value: number, type: 'performance' | 'cost' | 'health') => {
    if (type === 'performance' || type === 'health') {
      if (value >= 90) return 'GOOD';
      if (value >= 70) return 'WARNING';
      return 'CRITICAL';
    } else if (type === 'cost') {
      if (value <= 110) return 'GOOD';
      if (value <= 130) return 'WARNING';
      return 'CRITICAL';
    }
    return 'UNKNOWN';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Globe className="h-6 w-6 text-blue-600" />
              Economic Intelligence
            </h1>
            <p className="text-gray-600 text-sm">
              Real-time economic analysis and business impact intelligence
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'N/A'}
          </div>
        </div>

        {isLoading && (
          <LoadingState message="Loading economic intelligence data..." />
        )}

        {error && (
          <ErrorDisplay
            message={error.message || "Unable to load economic intelligence data"}
            onRetry={() => refetch()}
          />
        )}

        {data && (
          <>
            {/* Top Economic KPIs Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Supplier Performance
                  </div>
                  <div className="text-2xl font-semibold text-gray-900 mb-2">
                    {data.kpis.supplierPerformance}/100
                  </div>
                  <Badge className={getStatusColor(data.kpis.supplierPerformance, 'performance')}>
                    {getStatusText(data.kpis.supplierPerformance, 'performance')}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Shipping Cost Impact
                  </div>
                  <div className="text-2xl font-semibold text-gray-900 mb-2">
                    {data.kpis.shippingCostImpact}%
                  </div>
                  <Badge className={getStatusColor(data.kpis.shippingCostImpact, 'cost')}>
                    {getStatusText(data.kpis.shippingCostImpact, 'cost')}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Transportation Costs
                  </div>
                  <div className="text-2xl font-semibold text-gray-900 mb-2">
                    {data.kpis.transportationCosts}%
                  </div>
                  <Badge className={getStatusColor(data.kpis.transportationCosts, 'cost')}>
                    {getStatusText(data.kpis.transportationCosts, 'cost')}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Supply Chain Health
                  </div>
                  <div className="text-2xl font-semibold text-gray-900 mb-2">
                    {data.kpis.supplyChainHealth}/100
                  </div>
                  <Badge className={getStatusColor(data.kpis.supplyChainHealth, 'health')}>
                    {getStatusText(data.kpis.supplyChainHealth, 'health')}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Economic Intelligence Agent Section */}
            {isPageAIEnabled('liveIntelligence') && data.insights.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Economic Intelligence Agent</span>
                    <span className="text-sm font-normal text-gray-500">
                      {data.insights.length} insights from Economic Intelligence Agent
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.insights.map((insight) => (
                      <div
                        key={insight.id}
                        className={`p-4 rounded-lg border ${
                          insight.severity === 'critical' 
                            ? 'bg-red-50 border-red-200' 
                            : insight.severity === 'warning'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            {insight.severity === 'critical' ? (
                              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                            ) : (
                              <Info className="h-5 w-5 text-blue-600 mr-2" />
                            )}
                            <h3 className="font-semibold text-sm text-gray-900">
                              {insight.title}
                            </h3>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                          {insight.description}
                        </p>
                        
                        <div className="flex items-center text-sm font-medium text-red-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <FormattedCurrency value={insight.dollarImpact} /> impact
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* How This Affects Your Business Section */}
            <Card>
              <CardHeader>
                <CardTitle>How This Affects Your Business</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Executive Summary */}
                <Card className="bg-blue-50 border-blue-200 mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {data.businessImpact.executiveSummary}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Key Risks */}
                  <Card className="bg-red-50 border-red-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-red-800">Key Risks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.businessImpact.keyRisks.map((risk, index) => (
                          <div key={index} className="flex items-start">
                            <AlertTriangle className="h-4 w-4 text-red-600 mt-1 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{risk}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Opportunity Areas */}
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-green-800">Opportunity Areas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.businessImpact.opportunityAreas.map((opportunity, index) => (
                          <div key={index} className="flex items-start">
                            <Target className="h-4 w-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{opportunity}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}