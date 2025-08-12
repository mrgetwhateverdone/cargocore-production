import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useEconomicIntelligenceData } from "@/hooks/useEconomicIntelligenceData";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { useSettingsIntegration } from "@/hooks/useSettingsIntegration";
import { FormattedCurrency } from "@/components/ui/formatted-value";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EconomicKPIOverlay } from "@/components/EconomicKPIOverlay";
import type { EconomicKPIDetail } from "@/types/api";
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
  const [selectedKPI, setSelectedKPI] = useState<EconomicKPIDetail | null>(null);

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
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Economic Intelligence Agent</h2>
                  <span className="text-sm text-gray-500">
                    {data.insights.length} insights from Economic Intelligence Agent
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.insights.map((insight) => (
                    <Card
                      key={insight.id}
                      className={`${
                        insight.severity === 'critical' 
                          ? 'bg-red-50 border-red-200' 
                          : insight.severity === 'warning'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <CardContent className="p-4">
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
                        
                        <p className="text-sm text-gray-900 mb-3 leading-relaxed font-medium">
                          {insight.description}
                        </p>
                        
                        <div className="flex items-center text-sm font-medium text-red-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <FormattedCurrency value={insight.dollarImpact} /> impact
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Global Economic Intelligence Grid */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Global Economic Intelligence</h2>
                <span className="text-sm text-gray-500">
                  Last updated: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'N/A'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className={`${data.kpis.supplierPerformance < 70 ? 'bg-red-50 border-red-200' : data.kpis.supplierPerformance < 90 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm text-gray-900">Supplier Performance Index</h3>
                      <Badge className={getStatusColor(data.kpis.supplierPerformance, 'performance')}>
                        {getStatusText(data.kpis.supplierPerformance, 'performance')}
                      </Badge>
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${data.kpis.supplierPerformance < 70 ? 'text-red-600' : data.kpis.supplierPerformance < 90 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {data.kpis.supplierPerformance}/100
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Your supplier delivery performance and reliability metrics
                    </p>
                    <div className={`w-full rounded-full h-2 mb-2 ${data.kpis.supplierPerformance < 70 ? 'bg-red-200' : data.kpis.supplierPerformance < 90 ? 'bg-yellow-200' : 'bg-green-200'}`}>
                      <div 
                        className={`h-2 rounded-full ${data.kpis.supplierPerformance < 70 ? 'bg-red-600' : data.kpis.supplierPerformance < 90 ? 'bg-yellow-600' : 'bg-green-600'}`}
                        style={{ width: `${data.kpis.supplierPerformance}%` }}
                      ></div>
                    </div>
                    <button 
                      onClick={() => setSelectedKPI(data.kpiDetails?.supplierPerformance || null)}
                      className={`text-xs hover:underline ${data.kpis.supplierPerformance < 70 ? 'text-red-600' : data.kpis.supplierPerformance < 90 ? 'text-yellow-600' : 'text-green-600'}`}
                    >
                      Click for details
                    </button>
                  </CardContent>
                </Card>

                <Card className={`${data.kpis.shippingCostImpact > 130 ? 'bg-red-50 border-red-200' : data.kpis.shippingCostImpact > 110 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm text-gray-900">Shipping Cost Impact</h3>
                      <Badge className={getStatusColor(data.kpis.shippingCostImpact, 'cost')}>
                        {getStatusText(data.kpis.shippingCostImpact, 'cost')}
                      </Badge>
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${data.kpis.shippingCostImpact > 130 ? 'text-red-600' : data.kpis.shippingCostImpact > 110 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {data.kpis.shippingCostImpact}%
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Impact of shipping costs on your operational expenses
                    </p>
                    <div className={`w-full rounded-full h-2 mb-2 ${data.kpis.shippingCostImpact > 130 ? 'bg-red-200' : data.kpis.shippingCostImpact > 110 ? 'bg-yellow-200' : 'bg-green-200'}`}>
                      <div 
                        className={`h-2 rounded-full ${data.kpis.shippingCostImpact > 130 ? 'bg-red-600' : data.kpis.shippingCostImpact > 110 ? 'bg-yellow-600' : 'bg-green-600'}`}
                        style={{ width: `${Math.min(data.kpis.shippingCostImpact, 200) / 2}%` }}
                      ></div>
                    </div>
                    <button 
                      onClick={() => setSelectedKPI(data.kpiDetails?.shippingCostImpact || null)}
                      className={`text-xs hover:underline ${data.kpis.shippingCostImpact > 130 ? 'text-red-600' : data.kpis.shippingCostImpact > 110 ? 'text-yellow-600' : 'text-green-600'}`}
                    >
                      Click for details
                    </button>
                  </CardContent>
                </Card>

                <Card className={`${data.kpis.transportationCosts > 130 ? 'bg-red-50 border-red-200' : data.kpis.transportationCosts > 110 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm text-gray-900">Transportation Cost Index</h3>
                      <Badge className={getStatusColor(data.kpis.transportationCosts, 'cost')}>
                        {getStatusText(data.kpis.transportationCosts, 'cost')}
                      </Badge>
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${data.kpis.transportationCosts > 130 ? 'text-red-600' : data.kpis.transportationCosts > 110 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {data.kpis.transportationCosts}%
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Transportation cost trends affecting your deliveries
                    </p>
                    <div className={`w-full rounded-full h-2 mb-2 ${data.kpis.transportationCosts > 130 ? 'bg-red-200' : data.kpis.transportationCosts > 110 ? 'bg-yellow-200' : 'bg-green-200'}`}>
                      <div 
                        className={`h-2 rounded-full ${data.kpis.transportationCosts > 130 ? 'bg-red-600' : data.kpis.transportationCosts > 110 ? 'bg-yellow-600' : 'bg-green-600'}`}
                        style={{ width: `${Math.min(data.kpis.transportationCosts, 200) / 2}%` }}
                      ></div>
                    </div>
                    <button 
                      onClick={() => setSelectedKPI(data.kpiDetails?.transportationCosts || null)}
                      className={`text-xs hover:underline ${data.kpis.transportationCosts > 130 ? 'text-red-600' : data.kpis.transportationCosts > 110 ? 'text-yellow-600' : 'text-green-600'}`}
                    >
                      Click for details
                    </button>
                  </CardContent>
                </Card>

                <Card className={`${data.kpis.supplyChainHealth < 70 ? 'bg-red-50 border-red-200' : data.kpis.supplyChainHealth < 90 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm text-gray-900">Supply Chain Health</h3>
                      <Badge className={getStatusColor(data.kpis.supplyChainHealth, 'health')}>
                        {getStatusText(data.kpis.supplyChainHealth, 'health')}
                      </Badge>
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${data.kpis.supplyChainHealth < 70 ? 'text-red-600' : data.kpis.supplyChainHealth < 90 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {data.kpis.supplyChainHealth}/100
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Overall health of your supply chain operations
                    </p>
                    <div className={`w-full rounded-full h-2 mb-2 ${data.kpis.supplyChainHealth < 70 ? 'bg-red-200' : data.kpis.supplyChainHealth < 90 ? 'bg-yellow-200' : 'bg-green-200'}`}>
                      <div 
                        className={`h-2 rounded-full ${data.kpis.supplyChainHealth < 70 ? 'bg-red-600' : data.kpis.supplyChainHealth < 90 ? 'bg-yellow-600' : 'bg-green-600'}`}
                        style={{ width: `${data.kpis.supplyChainHealth}%` }}
                      ></div>
                    </div>
                    <button 
                      onClick={() => setSelectedKPI(data.kpiDetails?.supplyChainHealth || null)}
                      className={`text-xs hover:underline ${data.kpis.supplyChainHealth < 70 ? 'text-red-600' : data.kpis.supplyChainHealth < 90 ? 'text-yellow-600' : 'text-green-600'}`}
                    >
                      Click for details
                    </button>
                  </CardContent>
                </Card>

                <Card className={`${data.kpis.logisticsCostEfficiency > 130 ? 'bg-red-50 border-red-200' : data.kpis.logisticsCostEfficiency > 110 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm text-gray-900">Logistics Cost Efficiency</h3>
                      <Badge className={getStatusColor(data.kpis.logisticsCostEfficiency, 'cost')}>
                        {getStatusText(data.kpis.logisticsCostEfficiency, 'cost')}
                      </Badge>
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${data.kpis.logisticsCostEfficiency > 130 ? 'text-red-600' : data.kpis.logisticsCostEfficiency > 110 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {data.kpis.logisticsCostEfficiency}%
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Efficiency of your logistics and shipping operations
                    </p>
                    <div className={`w-full rounded-full h-2 mb-2 ${data.kpis.logisticsCostEfficiency > 130 ? 'bg-red-200' : data.kpis.logisticsCostEfficiency > 110 ? 'bg-yellow-200' : 'bg-green-200'}`}>
                      <div 
                        className={`h-2 rounded-full ${data.kpis.logisticsCostEfficiency > 130 ? 'bg-red-600' : data.kpis.logisticsCostEfficiency > 110 ? 'bg-yellow-600' : 'bg-green-600'}`}
                        style={{ width: `${Math.min(data.kpis.logisticsCostEfficiency, 200) / 2}%` }}
                      ></div>
                    </div>
                    <button 
                      onClick={() => setSelectedKPI(data.kpiDetails?.logisticsCostEfficiency || null)}
                      className={`text-xs hover:underline ${data.kpis.logisticsCostEfficiency > 130 ? 'text-red-600' : data.kpis.logisticsCostEfficiency > 110 ? 'text-yellow-600' : 'text-green-600'}`}
                    >
                      Click for details
                    </button>
                  </CardContent>
                </Card>

                <Card className={`${data.kpis.supplierDelayRate > 20 ? 'bg-red-50 border-red-200' : data.kpis.supplierDelayRate > 10 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm text-gray-900">Supplier Delay Rate</h3>
                      <Badge className={`${data.kpis.supplierDelayRate > 20 ? 'bg-red-100 text-red-800' : data.kpis.supplierDelayRate > 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {data.kpis.supplierDelayRate > 20 ? 'CRITICAL' : data.kpis.supplierDelayRate > 10 ? 'WARNING' : 'GOOD'}
                      </Badge>
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${data.kpis.supplierDelayRate > 20 ? 'text-red-600' : data.kpis.supplierDelayRate > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {data.kpis.supplierDelayRate}%
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Percentage of suppliers experiencing delays
                    </p>
                    <div className={`w-full rounded-full h-2 mb-2 ${data.kpis.supplierDelayRate > 20 ? 'bg-red-200' : data.kpis.supplierDelayRate > 10 ? 'bg-yellow-200' : 'bg-green-200'}`}>
                      <div 
                        className={`h-2 rounded-full ${data.kpis.supplierDelayRate > 20 ? 'bg-red-600' : data.kpis.supplierDelayRate > 10 ? 'bg-yellow-600' : 'bg-green-600'}`}
                        style={{ width: `${data.kpis.supplierDelayRate}%` }}
                      ></div>
                    </div>
                    <button 
                      onClick={() => setSelectedKPI(data.kpiDetails?.supplierDelayRate || null)}
                      className={`text-xs hover:underline ${data.kpis.supplierDelayRate > 20 ? 'text-red-600' : data.kpis.supplierDelayRate > 10 ? 'text-yellow-600' : 'text-green-600'}`}
                    >
                      Click for details
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* How This Affects Your Business Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How This Affects Your Business</h2>
              
              {/* Executive Summary */}
              <Card className="bg-blue-50 border-blue-200 mb-6">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 font-semibold">Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-900 leading-relaxed font-medium">
                    {data.businessImpact.executiveSummary}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Key Risks */}
                <Card className="bg-red-50 border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900 font-semibold">Key Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.businessImpact.keyRisks.map((risk, index) => (
                        <div key={index} className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-900 font-medium">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Opportunity Areas */}
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900 font-semibold">Opportunity Areas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.businessImpact.opportunityAreas.map((opportunity, index) => (
                        <div key={index} className="flex items-start">
                          <Target className="h-4 w-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-900 font-medium">{opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Economic KPI Detail Overlay */}
        <EconomicKPIOverlay
          isOpen={!!selectedKPI}
          onClose={() => setSelectedKPI(null)}
          kpi={selectedKPI}
        />
      </div>
    </Layout>
  );
}