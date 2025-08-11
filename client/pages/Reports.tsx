import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useReportTemplates, useReportGeneration } from "@/hooks/useReportsData";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, Filter, FileText, Clock } from "lucide-react";
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
      <div className="p-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Generate Reports</h1>
              <p className="text-gray-600 mt-2">
                Create comprehensive operational reports with AI-powered insights
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
        </div>

        {/* Report Insights */}
        {reportData?.data.insights && reportData.data.insights.length > 0 && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Report Insights
              </CardTitle>
              <CardDescription className="text-blue-700">
                {reportData.data.insights.length} insights from Report Analytics Agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.data.insights.map((insight) => (
                  <div key={insight.id} className="border-l-4 border-blue-400 pl-4">
                    <h4 className="font-semibold text-blue-900">{insight.title}</h4>
                    <p className="text-blue-800 text-sm mt-1">{insight.description}</p>
                    {insight.suggestedActions && insight.suggestedActions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-blue-600 font-medium">Recommended Actions:</p>
                        <ul className="text-xs text-blue-700 mt-1 space-y-1">
                          {insight.suggestedActions.map((action, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Templates */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Quick Start Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{template.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Available
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {template.estimatedReadTime}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.metrics.map((metric) => (
                        <Badge key={metric} variant="outline" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplateSelect(template);
                      }}
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Coming Soon Templates */}
        {comingSoonTemplates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Labor & Cost Management Reports
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoonTemplates.map((template) => (
                <Card 
                  key={template.id} 
                  className="opacity-60 border-l-4 border-l-gray-300"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{template.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        Coming Soon
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {template.estimatedReadTime}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {template.metrics.map((metric) => (
                          <Badge key={metric} variant="outline" className="text-xs opacity-60">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Filter Configuration */}
        {showFilters && selectedFilters && (
          <Card className="mb-8 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Custom Configuration
              </CardTitle>
              <CardDescription>
                Configure your report parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        const endDate = new Date().toISOString().split('T')[0];
                        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        setSelectedFilters(prev => prev ? {...prev, startDate, endDate} : null);
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Last 7 days
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => {
                        const endDate = new Date().toISOString().split('T')[0];
                        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        setSelectedFilters(prev => prev ? {...prev, startDate, endDate} : null);
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Last 30 days
                    </Button>
                  </div>
                  {selectedFilters.startDate && selectedFilters.endDate && (
                    <p className="text-xs text-gray-600 mt-2">
                      {selectedFilters.startDate} to {selectedFilters.endDate}
                    </p>
                  )}
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    All Brands
                  </Button>
                </div>

                {/* Warehouse Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warehouse
                  </label>
                  <Button variant="outline" size="sm" className="w-full justify-start">
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
                  >
                    {reportLoading ? "Generating..." : "Generate Report"}
                  </Button>
                </div>
              </div>

              {/* Status Messages */}
              {reportLoading && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-blue-800">Generating report with AI insights...</span>
                  </div>
                </div>
              )}

              {reportError && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg">
                  <p className="text-red-800">
                    Error generating report: {reportError.message}
                  </p>
                </div>
              )}

              {reportData && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-800 font-medium">
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
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Ready to Generate Reports</CardTitle>
            <CardDescription>
              Select a template above or choose custom metrics to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-blue-900">Real-time Data</h4>
                <p className="text-blue-700 text-sm">
                  Reports generated from your actual business data
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <Download className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-green-900">Multiple Formats</h4>
                <p className="text-green-700 text-sm">
                  PDF reports with professional CargoCore branding
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 text-purple-600 mx-auto mb-2 flex items-center justify-center font-bold">
                  AI
                </div>
                <h4 className="font-medium text-purple-900">AI Insights</h4>
                <p className="text-purple-700 text-sm">
                  Intelligent analysis and actionable recommendations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
