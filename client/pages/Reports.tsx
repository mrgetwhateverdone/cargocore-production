import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { pdfGenerationService } from "@/services/pdfGenerationService";
import { useDashboardData } from "@/hooks/useDashboardData";

/**
 * This part of the code creates a super simple Reports page
 * Just fetches dashboard data and generates a basic PDF report
 */
export default function Reports() {
  const { data, isLoading, error } = useDashboardData();
  const [isGenerating, setIsGenerating] = useState(false);

  // This part of the code handles simple PDF generation
  const handleGeneratePDF = () => {
    if (!data) return;
    
    setIsGenerating(true);
    
    try {
      // This part of the code creates a simple report data structure
      const simpleReportData = {
        template: {
          id: "simple-report",
          name: "CargoCore Data Report",
          description: "Simple data export from CargoCore dashboard"
        },
        filters: {},
        data: {
          products: data.products || [],
          shipments: data.shipments || [],
          kpis: data.kpis || {},
          insights: data.insights || []
        },
        availableBrands: [],
        availableWarehouses: [],
        generatedAt: new Date().toISOString(),
        reportPeriod: "All available data"
      };

      // This part of the code generates the PDF
      pdfGenerationService.generateReport(simpleReportData);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <LoadingState message="Loading CargoCore data..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorDisplay
          message={error.message || "Unable to load data"}
          onRetry={() => window.location.reload()}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Simple Report Generation Section */}
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-center">
            <FileText className="mx-auto h-16 w-16 text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Generate Report
            </h1>
            <p className="text-gray-600 mb-8">
              Generate a simple PDF report with your CargoCore data
            </p>
            
            {/* Data Summary */}
            {data && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Available Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {data.products?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Products</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {data.shipments?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Shipments</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {data.insights?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">AI Insights</div>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <Button 
              onClick={handleGeneratePDF}
              disabled={isGenerating || !data}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF Report
                </>
              )}
            </Button>
            
            {!data && (
              <p className="text-red-600 mt-4">
                No data available for report generation
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}