import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useReportTemplates, useReportGeneration } from "@/hooks/useReportsData";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { InsightsSection } from "@/components/dashboard/InsightsSection";
import { Button } from "@/components/ui/button";
import { Calendar, Download, FileText, Clock, TrendingUp, Package, Truck, Building, Tag, RotateCcw, Users, BarChart3 } from "lucide-react";
import type { ReportFilters, ReportTemplate } from "@/types/api";

export default function Reports() {
  const { data: templatesData, isLoading: templatesLoading, error: templatesError } = useReportTemplates();
  const [selectedFilters, setSelectedFilters] = useState<ReportFilters | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const { 
    data: reportData, 
    isLoading: reportLoading, 
    error: reportError,
    refetch: generateReport 
  } = useReportGeneration(selectedFilters);

  // This part of the code gets the appropriate icon for each template
  const getTemplateIcon = (templateId: string) => {
    const iconMap = {
      'inventory-health': Package,
      'fulfillment-performance': Truck,
      'supplier-analysis': Building,
      'warehouse-efficiency': TrendingUp,
      'brand-performance': Tag,
      'returns-analysis': RotateCcw,
      'employee-productivity': Users,
      'labor-forecast': BarChart3,
    };
    return iconMap[templateId as keyof typeof iconMap] || FileText;
  };

  // This part of the code handles template selection
  const handleTemplateSelect = (template: ReportTemplate) => {
    if (!template.available) {
      return;
    }
    
    setSelectedFilters({
      template: template.id,
      startDate: undefined,
      endDate: undefined,
      brands: undefined,
      warehouses: undefined,
    });
    setShowFilters(true);
  };

  // This part of the code handles report generation
  const handleGenerateReport = () => {
    if (selectedFilters) {
      generateReport();
    }
  };

  // This part of the code handles PDF download
  const handleDownloadPDF = () => {
    if (reportData) {
      // TODO: Implement PDF generation
      console.log("Generating PDF for report:", reportData);
      alert("PDF generation will be implemented next!");
    }
  };

  if (templatesLoading) {
    return (
      <Layout>
        <LoadingState message="Loading CargoCore report templates..." />
      </Layout>
    );
  }

  if (templatesError) {
    return (
      <Layout>
        <ErrorDisplay
          message={templatesError.message || "Unable to load report templates"}
          onRetry={() => window.location.reload()}
        />
      </Layout>
    );
  }

  const templates = templatesData?.templates || [];
  const availableTemplates = templates.filter(t => t.available);
  const comingSoonTemplates = templates.filter(t => !t.available);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Report Insights - Show at top if available */}
        {reportData?.data.insights && reportData.data.insights.length > 0 && (
          <InsightsSection
            insights={reportData.data.insights}
            isLoading={reportLoading}
            title="Report Analytics Agent Insights"
            subtitle={`${reportData.data.insights.length} insights from Report Analytics Agent`}
            loadingMessage="Report Agent is analyzing data and generating strategic recommendations..."
          />
        )}

        {/* Available Report Templates Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Quick Start Templates
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Select a template to generate comprehensive operational reports
              </p>
            </div>
            {reportData && (
              <Button 
                onClick={handleDownloadPDF}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableTemplates.map((template) => {
              const IconComponent = getTemplateIcon(template.id);
              return (
                <div
                  key={template.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">{template.name}</h3>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {template.estimatedReadTime}
                        </div>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Available
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.metrics.slice(0, 3).map((metric) => (
                      <span key={metric} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {metric}
                      </span>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateSelect(template);
                    }}
                  >
                    Use Template
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coming Soon Templates Section */}
        {comingSoonTemplates.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Labor & Cost Management Reports
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Advanced workforce and cost analysis reports coming soon
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comingSoonTemplates.map((template) => {
                const IconComponent = getTemplateIcon(template.id);
                return (
                  <div
                    key={template.id}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-60"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <IconComponent className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-700 text-sm">{template.name}</h3>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {template.estimatedReadTime}
                          </div>
                        </div>
                      </div>
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.metrics.slice(0, 3).map((metric) => (
                        <span key={metric} className="bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded">
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Configuration Panel */}
        {showFilters && selectedFilters && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Custom Configuration</h2>
              <p className="text-gray-600 text-sm mt-1">
                Configure your report parameters and generate with real data
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                    onClick={() => {
                      const endDate = new Date().toISOString().split('T')[0];
                      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      setSelectedFilters(prev => prev ? {...prev, startDate, endDate} : null);
                    }}
                  >
                    <Calendar className="w-3 h-3 mr-2" />
                    Last 7 days
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                    onClick={() => {
                      const endDate = new Date().toISOString().split('T')[0];
                      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      setSelectedFilters(prev => prev ? {...prev, startDate, endDate} : null);
                    }}
                  >
                    <Calendar className="w-3 h-3 mr-2" />
                    Last 30 days
                  </Button>
                </div>
                {selectedFilters.startDate && selectedFilters.endDate && (
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedFilters.startDate} to {selectedFilters.endDate}
                  </p>
                )}
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  All Brands
                </Button>
              </div>

              {/* Warehouse Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse
                </label>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  All Warehouses
                </Button>
              </div>

              {/* Generate Button */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generate Report
                </label>
                <Button 
                  onClick={handleGenerateReport}
                  disabled={reportLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  {reportLoading ? "Generating..." : "Generate Report"}
                </Button>
              </div>
            </div>

            {/* Status Messages */}
            {reportLoading && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-blue-800 text-sm">Generating report with AI insights...</span>
                </div>
              </div>
            )}

            {reportError && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-800 text-sm">
                  Error generating report: {reportError.message}
                </p>
              </div>
            )}

            {reportData && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-800 font-medium text-sm">
                      Report generated successfully!
                    </p>
                    <p className="text-green-700 text-sm">
                      {reportData.template.name} • {reportData.reportPeriod}
                    </p>
                    <p className="text-green-600 text-xs">
                      Generated on: {new Date(reportData.generatedAt).toLocaleString()}
                    </p>
                  </div>
                  <Button 
                    onClick={handleDownloadPDF}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Ready to Generate Reports</h2>
            <p className="text-gray-600 text-sm mt-1">
              Select a template above or choose custom metrics to get started
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-900 text-sm">Real-time Data</h4>
              <p className="text-blue-700 text-xs mt-1">
                Reports generated from your actual business data
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Download className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-900 text-sm">Multiple Formats</h4>
              <p className="text-green-700 text-xs mt-1">
                PDF reports with professional CargoCore branding
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 text-purple-600 mx-auto mb-2 flex items-center justify-center font-bold text-sm">
                AI
              </div>
              <h4 className="font-medium text-purple-900 text-sm">AI Insights</h4>
              <p className="text-purple-700 text-xs mt-1">
                Intelligent analysis and actionable recommendations
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
