import type { CostKPIs, CostCenter } from "@/types/api";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ExecutiveSummarySectionProps {
  kpis: CostKPIs;
  costCenters: CostCenter[];
  isLoading?: boolean;
}

export function ExecutiveSummarySection({ kpis, costCenters, isLoading }: ExecutiveSummarySectionProps) {
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // This part of the code fetches AI-generated executive summary
  useEffect(() => {
    if (!isLoading && kpis && costCenters.length > 0) {
      generateAIExecutiveSummary();
    }
  }, [isLoading, kpis, costCenters]);

  const generateAIExecutiveSummary = async () => {
    setIsLoadingAI(true);
    
    try {
      const contextData = {
        totalFacilities: kpis.totalCostCenters || 0,
        avgEfficiency: kpis.costEfficiencyRate || 0,
        topPerformers: kpis.topPerformingWarehouses || 0,
        activeFacilities: costCenters.filter(c => c.status === 'Active').length,
        totalMonthlyCosts: kpis.totalMonthlyCosts || 0,
        needsAttention: (kpis.totalCostCenters || 0) - (kpis.topPerformingWarehouses || 0)
      };

      const response = await fetch('/api/cost-data?aiSummary=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contextData })
      });

      if (response.ok) {
        const data = await response.json();
        setAiSummary(data.summary);
      } else {
        throw new Error('Failed to generate AI summary');
      }
    } catch (error) {
      console.error('Failed to generate AI executive summary:', error);
      // Fallback to calculated summary
      setAiSummary("");
    } finally {
      setIsLoadingAI(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    );
  }

  // This part of the code calculates summary metrics for the narrative
  const totalFacilities = kpis.totalCostCenters || 0;
  const avgEfficiency = kpis.costEfficiencyRate || 0;
  const topPerformers = kpis.topPerformingWarehouses || 0;
  const activeFacilities = costCenters.filter(c => c.status === 'Active').length;
  const needsAttention = totalFacilities - topPerformers;

  // This part of the code determines efficiency status
  const getEfficiencyStatus = (rate: number) => {
    if (rate >= 90) return { text: "excellent", color: "text-green-600" };
    if (rate >= 75) return { text: "good", color: "text-blue-600" };
    if (rate >= 60) return { text: "moderate", color: "text-yellow-600" };
    return { text: "needs improvement", color: "text-red-600" };
  };

  const efficiencyStatus = getEfficiencyStatus(avgEfficiency);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-start">
        <div className="p-2 bg-blue-100 rounded-lg">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Executive Summary
          </h3>
          
          {/* This part of the code displays AI-generated executive summary */}
          {isLoadingAI ? (
            <div className="flex items-center space-x-2 py-4">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">Generating strategic cost analysis...</span>
            </div>
          ) : (
            <div className="text-sm text-gray-700 space-y-2">
              {aiSummary ? (
                <div className="whitespace-pre-line leading-relaxed">
                  {aiSummary}
                </div>
              ) : (
                <>
                  <p>
                    Cost optimization analysis reveals performance across{" "}
                    <span className="font-semibold text-gray-900">{totalFacilities}</span> facilities.{" "}
                    Average cost efficiency of{" "}
                    <span className={`font-semibold ${efficiencyStatus.color}`}>
                      {avgEfficiency.toFixed(1)}%
                    </span>{" "}
                    indicates {efficiencyStatus.text} operational performance across all operations.
                  </p>
                  
                  <p>
                    <span className="font-semibold text-green-600">{topPerformers}</span> warehouses 
                    performing above efficiency targets, while{" "}
                    <span className="font-semibold text-orange-600">{needsAttention}</span> facilities 
                    need operational attention.{" "}
                    <span className="font-semibold text-blue-600">{activeFacilities}</span> cost centers 
                    show recent activity from live warehouse throughput and shipment processing.
                  </p>

                  <p>
                    Monthly operational costs of{" "}
                    <span className="font-semibold text-gray-900">
                      ${(kpis.totalMonthlyCosts || 0).toLocaleString()}
                    </span>{" "}
                    reflect current operational scale and efficiency levels.
                  </p>
                </>
              )}
            </div>
          )}

            {/* This part of the code shows performance breakdown */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {topPerformers}
                  </div>
                  <div className="text-gray-500">High Performers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {activeFacilities}
                  </div>
                  <div className="text-gray-500">Active Facilities</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-semibold ${efficiencyStatus.color}`}>
                    {avgEfficiency.toFixed(1)}%
                  </div>
                  <div className="text-gray-500">Avg Efficiency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
