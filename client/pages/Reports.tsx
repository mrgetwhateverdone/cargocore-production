import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Download, 
  FileText, 
  BarChart3, 
  Package, 
  Clock, 
  Users, 
  TrendingUp, 
  FileSpreadsheet,
  DollarSign,
  Building,
  Activity,
  Share,
  Mail,
  Filter,
  Settings
} from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { enhancedPdfServiceV2 } from "@/services/enhancedPdfServiceV2";
import { useDashboardData } from "@/hooks/useDashboardData";

/**
 * This part of the code creates an enhanced Reports page with template selection
 * Matches the screenshot design while preserving PDF functionality
 */
export default function Reports() {
  const { data, isLoading, error } = useDashboardData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);

  // This part of the code creates sample brand and warehouse data for the dropdowns
  const availableBrands = data?.products ? 
    Array.from(new Set(data.products.map((p: any) => p.brand_name).filter(Boolean)))
      .slice(0, 10) // Limit to first 10 for demo
      .map(brand => ({ name: brand, value: brand })) : 
    [
      { name: "Brand A", value: "brand-a" },
      { name: "Brand B", value: "brand-b" },
      { name: "Brand C", value: "brand-c" }
    ];

  const availableWarehouses = data?.shipments ? 
    Array.from(new Set(data.shipments.map((s: any) => s.warehouse_id).filter(Boolean)))
      .slice(0, 10) // Limit to first 10 for demo
      .map(warehouse => ({ name: `Warehouse ${warehouse}`, value: warehouse })) :
    [
      { name: "Warehouse East", value: "warehouse-east" },
      { name: "Warehouse West", value: "warehouse-west" },
      { name: "Warehouse Central", value: "warehouse-central" }
    ];

  // This part of the code defines the template configurations matching the screenshot
  const quickStartTemplates = [
    {
      id: "weekly-performance",
      name: "Weekly Performance",
      description: "Summary of key metrics from the past 7 days",
      icon: <BarChart3 className="w-6 h-6" />,
      metrics: ["Orders", "Inventory", "Returns", "SLA", "Insights"],
      timeframe: "Last 7 Days",
      readTime: "3 min read",
      available: true,
      color: "blue"
    },
    {
      id: "inventory-health",
      name: "Inventory Health", 
      description: "Stock levels, reorder points, and turnover rates",
      icon: <Package className="w-6 h-6" />,
      metrics: ["Inventory", "Insights"],
      timeframe: "Last 30 Days",
      readTime: "2 min read",
      available: true,
      color: "green"
    },
    {
      id: "sla-compliance",
      name: "SLA Compliance",
      description: "Fulfillment performance against SLAs by warehouse",
      icon: <Clock className="w-6 h-6" />,
      metrics: ["SLA", "Insights"],
      timeframe: "Last 14 Days", 
      readTime: "2 min read",
      available: true,
      color: "purple"
    }
  ];

  // This part of the code defines the labor & cost management templates
  const laborCostTemplates = [
    {
      id: "employee-productivity",
      name: "Employee Productivity Report",
      description: "Individual performance tracking by job function and account",
      icon: <Users className="w-6 h-6" />,
      available: false,
      color: "orange"
    },
    {
      id: "labor-forecast",
      name: "Labor Forecast System", 
      description: "Advanced workforce planning with transaction factor analysis and man-hour calculations",
      icon: <TrendingUp className="w-6 h-6" />,
      available: true,
      color: "green"
    },
    {
      id: "account-activity",
      name: "Account Activity Report",
      description: "Activity tracking and productivity analysis by account",
      icon: <Activity className="w-6 h-6" />,
      available: false,
      color: "orange"
    },
    {
      id: "account-profitability",
      name: "Account Profitability Review",
      description: "Expected vs actual profitability analysis",
      icon: <DollarSign className="w-6 h-6" />,
      available: false,
      color: "orange"
    },
    {
      id: "facility-activity",
      name: "Facility Activity Report",
      description: "Warehouse productivity and efficiency analysis",
      icon: <Building className="w-6 h-6" />,
      available: false,
      color: "orange"
    },
    {
      id: "company-profitability",
      name: "Company Profitability Report",
      description: "Comprehensive financial and operational performance",
      icon: <FileSpreadsheet className="w-6 h-6" />,
      available: false,
      color: "orange"
    }
  ];

  // This part of the code applies filters to the data based on user selections
  // Note: Date filtering is disabled for development data - uses last 250 data points instead
  const applyFilters = (products: any[], shipments: any[]) => {
    let filteredProducts = [...products];
    let filteredShipments = [...shipments];
    
    // This part of the code applies brand filtering
    if (selectedBrands.length > 0) {
      filteredProducts = filteredProducts.filter(p => 
        p.brand_name && selectedBrands.includes(p.brand_name)
      );
      filteredShipments = filteredShipments.filter(s => 
        s.brand_name && selectedBrands.includes(s.brand_name)
      );
    }
    
    // This part of the code applies warehouse filtering
    if (selectedWarehouses.length > 0) {
      filteredShipments = filteredShipments.filter(s => 
        s.warehouse_id && selectedWarehouses.includes(s.warehouse_id)
      );
    }
    
    // This part of the code limits to last 250 relevant data points instead of date filtering
    // Date filtering disabled for development data
    const maxDataPoints = 250;
    
    // Take the most recent/relevant data points
    if (filteredProducts.length > maxDataPoints) {
      filteredProducts = filteredProducts.slice(0, maxDataPoints);
    }
    
    if (filteredShipments.length > maxDataPoints) {
      filteredShipments = filteredShipments.slice(0, maxDataPoints);
    }
    
    return { filteredProducts, filteredShipments };
  };
  
  // This part of the code handles template-specific PDF generation with filtering
  const handleGeneratePDF = () => {
    if (!data) return;
    
    setIsGenerating(true);
    
    try {
      // This part of the code gets the selected template or creates a default one
      const template = selectedTemplate ? 
        [...quickStartTemplates, ...laborCostTemplates].find(t => t.id === selectedTemplate) :
        {
          id: "custom-report",
          name: "Custom CargoCore Report",
          description: "Custom report with selected filters and metrics"
        };
      
      // This part of the code applies all selected filters
      const { filteredProducts, filteredShipments } = applyFilters(
        data.products || [], 
        data.shipments || []
      );
      
      // This part of the code logs data for development tracking
      console.log('📄 CargoCore Reports: Generating PDF with', {
        template: template?.name || 'Custom Report',
        products: filteredProducts.length,
        shipments: filteredShipments.length,
        brandFilters: selectedBrands.length,
        warehouseFilters: selectedWarehouses.length
      });
      
      // This part of the code creates filtered insights based on selected metrics
      let filteredInsights = data.insights || [];
      if (selectedMetrics.length > 0) {
        // Filter insights to match selected metrics (simple keyword matching)
        filteredInsights = filteredInsights.filter((insight: any) => 
          selectedMetrics.some(metric => 
            insight.content?.toLowerCase().includes(metric.toLowerCase()) ||
            insight.title?.toLowerCase().includes(metric.toLowerCase())
          )
        );
      }
      
      // This part of the code creates the report data structure
      const reportData = {
        template,
        filters: {
          dateRange: selectedDateRange,
          brands: selectedBrands,
          warehouses: selectedWarehouses,
          metrics: selectedMetrics
        },
        data: {
          products: filteredProducts,
          shipments: filteredShipments,
          kpis: data.kpis || {},
          insights: filteredInsights
        },
        availableBrands,
        availableWarehouses,
        generatedAt: new Date().toISOString(),
        reportPeriod: "Last 250 relevant data points (Development dataset)",
        summary: {
          totalProducts: filteredProducts.length,
          totalShipments: filteredShipments.length,
          totalInsights: filteredInsights.length,
          filtersApplied: selectedBrands.length + selectedWarehouses.length + (selectedDateRange !== "all" ? 1 : 0)
        }
      };

      // This part of the code generates the enhanced PDF with professional styling and multi-page support
      enhancedPdfServiceV2.generateReport(reportData);
      
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

  // This part of the code renders a template card with enhanced styling and selection animation
  const renderTemplateCard = (template: any, isQuickStart: boolean = true) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      green: "bg-green-50 text-green-600 border-green-200", 
      purple: "bg-purple-50 text-purple-600 border-purple-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200"
    };

    const isSelected = selectedTemplate === template.id;
    const cardClasses = `bg-white shadow-md border transition-all duration-300 h-full ${
      isSelected 
        ? "border-blue-500 shadow-lg ring-2 ring-blue-200 scale-105" 
        : "border-gray-200 hover:shadow-lg hover:border-blue-300"
    }`;

    return (
      <Card key={template.id} className={cardClasses}>
        <CardContent className="p-6 h-full flex flex-col">
          {/* Icon and Status Badge */}
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[template.color] || colorClasses.blue}`}>
              {template.icon}
            </div>
            {template.available ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">Available</Badge>
            ) : (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">Coming Soon</Badge>
            )}
          </div>
          
          {/* Title and Description */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
          <p className="text-gray-600 text-sm mb-4 flex-grow">{template.description}</p>
          
          {/* Metrics (for Quick Start templates) */}
          {isQuickStart && template.metrics && (
            <div className="flex flex-wrap gap-2 mb-4">
              {template.metrics.map((metric: string) => (
                <Badge key={metric} variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-300">
                  {metric}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Meta info (for Quick Start templates) */}
          {isQuickStart && (
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>{template.timeframe}</span>
              <span>• {template.readTime}</span>
            </div>
          )}
          
          {/* Use Template Button */}
          <Button 
            className={`w-full mt-auto transition-all duration-200 ${
              template.available 
                ? isSelected
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-gray-100 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!template.available}
            onClick={() => template.available && setSelectedTemplate(isSelected ? null : template.id)}
          >
            {isSelected ? "✓ Selected" : "Use Template"}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-8 p-6">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Reports</h1>
            <p className="text-gray-600">Create comprehensive operational reports with AI-powered insights</p>
          </div>

          {/* Quick Start Templates */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Quick Start Templates</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickStartTemplates.map(template => renderTemplateCard(template, true))}
            </div>
          </div>

          {/* Labor & Cost Management Reports */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">Labor & Cost Management Reports</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {laborCostTemplates.map(template => renderTemplateCard(template, false))}
            </div>
          </div>

          {/* Custom Configuration */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Custom Configuration</h2>
            </div>

            {/* Filters */}
            <Card className="bg-white shadow-lg border border-gray-200">
              <CardHeader className="bg-white">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-blue-600" />
                  Filters
                </h3>
              </CardHeader>
              <CardContent className="bg-white space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Date Range</label>
                    <Select value={selectedDateRange} onValueChange={setSelectedDateRange} disabled>
                      <SelectTrigger className="bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed">
                        <SelectValue placeholder="Development Data - Last 250 Points" />
                      </SelectTrigger>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1 italic">
                      Information not available in data set, please update information to use date feature.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                    <MultiSelect
                      options={availableBrands}
                      selected={selectedBrands}
                      onSelectionChange={setSelectedBrands}
                      placeholder="All Brands"
                      getOptionValue={(option) => option.value}
                      getOptionLabel={(option) => option.name}
                      maxDisplay={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse</label>
                    <MultiSelect
                      options={availableWarehouses}
                      selected={selectedWarehouses}
                      onSelectionChange={setSelectedWarehouses}
                      placeholder="All Warehouses"
                      getOptionValue={(option) => option.value}
                      getOptionLabel={(option) => option.name}
                      maxDisplay={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metrics to Include */}
            <Card className="bg-white shadow-lg border border-gray-200">
              <CardHeader className="bg-white">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Metrics to Include
                </h3>
              </CardHeader>
              <CardContent className="bg-white">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {['Orders', 'Inventory', 'Returns', 'SLA Performance', 'Insights'].map(metric => (
                    <label key={metric} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox 
                        className="border-gray-300"
                        checked={selectedMetrics.includes(metric)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMetrics([...selectedMetrics, metric]);
                          } else {
                            setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                          }
                        }}
                      />
                      <span className="text-sm text-gray-700">{metric}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card className="bg-white shadow-lg border border-gray-200">
              <CardHeader className="bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Download className="w-5 h-5 mr-2 text-blue-600" />
                    Export Options
                  </h3>
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    PDF Available
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="bg-white space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* PDF Export - Available */}
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      className="w-full h-20 bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 flex flex-col items-center justify-center gap-2"
                      onClick={handleGeneratePDF}
                      disabled={isGenerating || !data}
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                          <span className="text-sm font-medium">Generating...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-6 h-6" />
                          <div className="text-center">
                            <div className="font-medium">PDF Report</div>
                            <div className="text-xs text-gray-500">Comprehensive PDF export</div>
                          </div>
                        </>
                      )}
                    </Button>
                    <Badge className="absolute -top-2 -right-2 bg-green-100 text-green-800 border-green-200 text-xs">
                      Available
                    </Badge>
                  </div>

                  {/* Excel Export - Coming Soon */}
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      className="w-full h-20 bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed flex flex-col items-center justify-center gap-2"
                      disabled
                    >
                      <FileSpreadsheet className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium">Excel Export</div>
                        <div className="text-xs">Spreadsheet format</div>
                      </div>
                    </Button>
                    <Badge className="absolute -top-2 -right-2 bg-orange-100 text-orange-800 border-orange-200 text-xs">
                      Coming Soon
                    </Badge>
                  </div>

                  {/* Share Link - Coming Soon */}
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      className="w-full h-20 bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed flex flex-col items-center justify-center gap-2"
                      disabled
                    >
                      <Share className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium">Share Link</div>
                        <div className="text-xs">Generate shareable URL</div>
                      </div>
                    </Button>
                    <Badge className="absolute -top-2 -right-2 bg-orange-100 text-orange-800 border-orange-200 text-xs">
                      Coming Soon
                    </Badge>
                  </div>

                  {/* Schedule Email - Coming Soon */}
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      className="w-full h-20 bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed flex flex-col items-center justify-center gap-2"
                      disabled
                    >
                      <Mail className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium">Schedule Email</div>
                        <div className="text-xs">Automated delivery</div>
                      </div>
                    </Button>
                    <Badge className="absolute -top-2 -right-2 bg-orange-100 text-orange-800 border-orange-200 text-xs">
                      Coming Soon
                    </Badge>
                  </div>
                </div>

                {/* Export Notes */}
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="text-sm text-gray-700">
                      <div className="font-medium mb-1">Export Information</div>
                      <ul className="space-y-1 text-gray-600">
                        <li>• PDF reports include all selected metrics and data visualizations</li>
                        <li>• Reports are generated with your current filter selections</li>
                        <li>• Additional export formats coming soon</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ready to Generate Section */}
          <Card className="bg-white shadow-lg border border-gray-200">
            <CardContent className="bg-white text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Generate Reports</h3>
                <p className="text-gray-600 mb-6">Select a template above or choose custom metrics to get started</p>
                
                {/* Data Availability Indicator */}
                {data && (
                  <div className="bg-green-50 rounded-lg p-3 mb-6">
                    <div className="flex items-center justify-center gap-4 text-sm text-green-700">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{data.products?.length || 0} Products</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{data.shipments?.length || 0} Shipments</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{data.insights?.length || 0} Insights</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Current Selection Summary */}
                {(selectedTemplate || selectedMetrics.length > 0 || selectedBrands.length > 0 || selectedWarehouses.length > 0) && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                    <h4 className="font-medium text-gray-900 mb-2">Current Selection:</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      {selectedTemplate && (
                        <div>• Template: <span className="font-medium">{quickStartTemplates.find(t => t.id === selectedTemplate)?.name || selectedTemplate}</span></div>
                      )}
                      <div>• Date Range: <span className="font-medium text-gray-500 italic">Last 250 data points (Development dataset)</span></div>
                      {selectedBrands.length > 0 && (
                        <div>• Brands: <span className="font-medium">{selectedBrands.length} selected</span></div>
                      )}
                      {selectedWarehouses.length > 0 && (
                        <div>• Warehouses: <span className="font-medium">{selectedWarehouses.length} selected</span></div>
                      )}
                      {selectedMetrics.length > 0 && (
                        <div>• Metrics: <span className="font-medium">{selectedMetrics.join(', ')}</span></div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Feature highlights */}
                <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Real-time data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Multiple formats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share className="w-4 h-4" />
                    <span>Team sharing</span>
                  </div>
                </div>

                {/* Quick Generate Button */}
                <Button 
                  onClick={handleGeneratePDF}
                  disabled={isGenerating || !data}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Generate Report Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}