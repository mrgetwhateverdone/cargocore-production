import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// This part of the code extends jsPDF with autoTable functionality
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

/**
 * This part of the code provides enhanced PDF generation with template-specific reports
 * Uses jsPDF for professional document generation with filtering and multi-page support
 */
export class EnhancedPDFService {
  private doc: jsPDF;
  private currentY: number = 20;
  private readonly pageWidth: number = 210; // A4 width in mm
  private readonly pageHeight: number = 297; // A4 height in mm
  private readonly margin: number = 20;
  private readonly primaryColor: string = '#2563eb'; // CargoCore blue
  private readonly secondaryColor: string = '#64748b';

  constructor() {
    this.doc = new jsPDF();
    this.setupAutoTable();
  }

  /**
   * This part of the code properly sets up autoTable functionality
   */
  private setupAutoTable(): void {
    try {
      if (typeof autoTable === 'function') {
        (this.doc as any).autoTable = autoTable;
        return;
      }
      
      if (autoTable && (autoTable as any).default && typeof (autoTable as any).default === 'function') {
        (this.doc as any).autoTable = (autoTable as any).default;
        return;
      }
      
      if (typeof (autoTable as any).__esModule !== 'undefined') {
        (this.doc as any).autoTable = (autoTable as any).default || autoTable;
        return;
      }
      
      console.error('autoTable setup failed - using fallback');
    } catch (error) {
      console.error('Error setting up autoTable:', error);
    }
  }

  /**
   * This part of the code generates the complete PDF report with template-specific content
   */
  public generateReport(reportData: any): void {
    try {
      this.doc = new jsPDF();
      this.setupAutoTable();
      this.currentY = 20;

      const template = reportData.template;
      
      // This part of the code generates header and title
      this.addHeader();
      
      if (template?.id && this.isTemplateSpecific(template.id)) {
        // This part of the code generates template-specific reports
        this.generateTemplateSpecificReport(reportData);
      } else {
        // This part of the code generates generic report
        this.generateGenericReport(reportData);
      }
      
      // This part of the code adds footer
      this.addFooter();
      
      // This part of the code saves the PDF
      const fileName = `${template?.name?.replace(/\s+/g, '_') || 'cargocore_report'}_${new Date().toISOString().split('T')[0]}.pdf`;
      this.doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw new Error('Failed to generate PDF report');
    }
  }

  /**
   * This part of the code checks if template has specific formatting
   */
  private isTemplateSpecific(templateId: string): boolean {
    return ['weekly-performance', 'inventory-health', 'sla-compliance', 'labor-forecast'].includes(templateId);
  }

  /**
   * This part of the code generates template-specific reports
   */
  private generateTemplateSpecificReport(reportData: any): void {
    const template = reportData.template;
    
    switch (template.id) {
      case 'weekly-performance':
        this.generateWeeklyPerformanceReport(reportData);
        break;
      case 'inventory-health':
        this.generateInventoryHealthReport(reportData);
        break;
      case 'sla-compliance':
        this.generateSLAComplianceReport(reportData);
        break;
      case 'labor-forecast':
        this.generateLaborForecastReport(reportData);
        break;
      default:
        this.generateGenericReport(reportData);
    }
  }

  /**
   * This part of the code generates generic report format
   */
  private generateGenericReport(reportData: any): void {
    this.addReportTitle(reportData);
    this.addDataSummary(reportData);
    
    if (reportData.data) {
      this.addDataTables(reportData);
    }
  }

  /**
   * This part of the code adds the CargoCore header with branding
   */
  private addHeader(): void {
    // CargoCore logo/title
    this.doc.setFontSize(24);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('CargoCore', this.pageWidth - this.margin, 25, { align: 'right' });
    
    // Subtitle
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFont(undefined, 'normal');
    this.doc.text('3PL Operations Platform', this.pageWidth - this.margin, 32, { align: 'right' });
    
    // Blue line separator
    this.doc.setDrawColor(this.primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, 40, this.pageWidth - this.margin, 40);
    
    this.currentY = 50;
  }

  /**
   * This part of the code adds report title with filter information
   */
  private addReportTitle(reportData: any): void {
    this.doc.setFontSize(18);
    this.doc.setTextColor('#1f2937');
    this.doc.setFont(undefined, 'bold');
    
    const title = reportData.template?.name || 'CargoCore Data Report';
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 15;
    
    // Add generation date and report period
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFont(undefined, 'normal');
    this.doc.text(`Generated: ${new Date().toLocaleDateString()}`, this.margin, this.currentY);
    this.currentY += 8;
    
    // This part of the code adds development data period information
    if (reportData.reportPeriod) {
      this.doc.setTextColor('#666666'); // Grey color for development data info
      this.doc.text(`Period: ${reportData.reportPeriod}`, this.margin, this.currentY);
      this.currentY += 8;
      this.doc.setTextColor(this.secondaryColor); // Reset color
    }
    
    if (reportData.filters) {
      const filters = reportData.filters;
      if (filters.brands && filters.brands.length > 0) {
        this.doc.text(`Brands: ${filters.brands.join(', ')}`, this.margin, this.currentY);
        this.currentY += 8;
      }
      if (filters.warehouses && filters.warehouses.length > 0) {
        this.doc.text(`Warehouses: ${filters.warehouses.join(', ')}`, this.margin, this.currentY);
        this.currentY += 8;
      }
      if (filters.metrics && filters.metrics.length > 0) {
        this.doc.text(`Metrics: ${filters.metrics.join(', ')}`, this.margin, this.currentY);
        this.currentY += 8;
      }
      
      // This part of the code adds development data notice
      this.doc.setTextColor('#888888');
      this.doc.setFontSize(9);
      this.doc.text('Note: Date filtering unavailable for development dataset', this.margin, this.currentY);
      this.currentY += 6;
      this.doc.setFontSize(10);
      this.doc.setTextColor(this.secondaryColor);
    }
    
    this.currentY += 12;
  }

  /**
   * This part of the code adds comprehensive data summary section
   */
  private addDataSummary(reportData: any): void {
    this.doc.setFontSize(14);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('Data Summary', this.margin, this.currentY);
    this.currentY += 15;
    
    this.doc.setFontSize(10);
    this.doc.setTextColor('#000000');
    this.doc.setFont(undefined, 'normal');
    
    const data = reportData.data || reportData;
    const summary = [
      `• Products: ${data.products?.length || 0}`,
      `• Shipments: ${data.shipments?.length || 0}`,
      `• AI Insights: ${data.insights?.length || 0}`
    ];
    
    // This part of the code adds filter summary if available
    if (reportData.summary) {
      const s = reportData.summary;
      if (s.filtersApplied > 0) {
        summary.push(`• Active Filters: ${s.filtersApplied} (brand/warehouse only)`);
      }
    }
    
    // This part of the code adds development data notice
    summary.push(`• Dataset: Development data (last 250 relevant points)`);
    
    // This part of the code adds operational metrics
    if (data.shipments && data.shipments.length > 0) {
      const completedShipments = data.shipments.filter((s: any) => s.status === 'completed').length;
      const cancelledShipments = data.shipments.filter((s: any) => s.status === 'cancelled').length;
      summary.push(`• Completed Shipments: ${completedShipments}`);
      summary.push(`• Cancelled Shipments: ${cancelledShipments}`);
      if (data.shipments.length > 0) {
        summary.push(`• Success Rate: ${((completedShipments / data.shipments.length) * 100).toFixed(1)}%`);
      }
    }
    
    summary.forEach(line => {
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 6;
    });
    
    this.currentY += 15;
  }

  /**
   * This part of the code adds data tables with pagination support
   */
  private addDataTables(reportData: any, itemsPerPage: number = 50): void {
    const data = reportData.data || reportData;
    
    if (data.products && data.products.length > 0) {
      this.addProductsTable(data.products, itemsPerPage);
    }
    
    if (data.shipments && data.shipments.length > 0) {
      this.addShipmentsTable(data.shipments, itemsPerPage);
    }
    
    // This part of the code adds insights if available
    if (data.insights && data.insights.length > 0) {
      this.addInsightsSection(data.insights);
    }
  }

  /**
   * This part of the code adds products table with improved SKU display
   */
  private addProductsTable(products: any[], limit: number = 50): void {
    if (!products || products.length === 0) {
      this.doc.text('No products available in filtered dataset', this.margin, this.currentY);
      this.currentY += 15;
      return;
    }

    this.doc.setFontSize(14);
    this.doc.setTextColor(this.primaryColor);
    const actualCount = Math.min(products.length, limit);
    this.doc.text(`Products (Showing ${actualCount} of ${products.length} filtered results)`, this.margin, this.currentY);
    this.currentY += 15;

    try {
      if ((this.doc as any).autoTable && typeof (this.doc as any).autoTable === 'function') {
        const limitedProducts = products.slice(0, limit);
        const tableData = limitedProducts.map(product => [
          product.product_sku || product.sku || 'N/A',
          product.product_name || 'N/A',
          product.brand_name || 'N/A',
          `$${(product.unit_cost || 0).toFixed(2)}`
        ]);

        (this.doc as any).autoTable({
          startY: this.currentY,
          head: [['SKU', 'Product Name', 'Brand', 'Unit Cost']],
          body: tableData,
          theme: 'striped',
          styles: { fontSize: 10 },
          margin: { left: this.margin, right: this.margin }
        });

        this.currentY = (this.doc as any).lastAutoTable?.finalY + 20 || this.currentY + 100;
        
        // This part of the code handles page breaks for large datasets
        if (this.currentY > this.pageHeight - 50) {
          this.addPageBreak();
        }
      } else {
        throw new Error('autoTable not available');
      }
    } catch (error) {
      console.warn('autoTable failed, using simple text fallback:', error);
      this.addSimpleProductsList(limitedProducts);
    }
  }

  /**
   * This part of the code adds shipments table with enhanced information
   */
  private addShipmentsTable(shipments: any[], limit: number = 50): void {
    if (!shipments || shipments.length === 0) {
      this.doc.text('No shipments available in filtered dataset', this.margin, this.currentY);
      this.currentY += 15;
      return;
    }

    this.doc.setFontSize(14);
    this.doc.setTextColor(this.primaryColor);
    const actualCount = Math.min(shipments.length, limit);
    this.doc.text(`Shipments (Showing ${actualCount} of ${shipments.length} filtered results)`, this.margin, this.currentY);
    this.currentY += 15;

    try {
      if ((this.doc as any).autoTable && typeof (this.doc as any).autoTable === 'function') {
        const limitedShipments = shipments.slice(0, limit);
        const tableData = limitedShipments.map(shipment => [
          shipment.shipment_id || 'N/A',
          shipment.status || 'N/A',
          shipment.warehouse_id || 'N/A',
          `${shipment.expected_quantity || 0}`
        ]);

        (this.doc as any).autoTable({
          startY: this.currentY,
          head: [['Shipment ID', 'Status', 'Warehouse', 'Quantity']],
          body: tableData,
          theme: 'striped',
          styles: { fontSize: 9 },
          margin: { left: this.margin, right: this.margin }
        });

        this.currentY = (this.doc as any).lastAutoTable?.finalY + 20 || this.currentY + 100;
        
        // This part of the code handles page breaks for large datasets
        if (this.currentY > this.pageHeight - 50) {
          this.addPageBreak();
        }
      } else {
        throw new Error('autoTable not available');
      }
    } catch (error) {
      console.warn('autoTable failed, using simple text fallback:', error);
      this.addSimpleShipmentsList(limitedShipments);
    }
  }

  /**
   * This part of the code adds insights section
   */
  private addInsightsSection(insights: any[]): void {
    if (!insights || insights.length === 0) return;

    this.doc.setFontSize(14);
    this.doc.setTextColor(this.primaryColor);
    this.doc.text('AI Insights', this.margin, this.currentY);
    this.currentY += 15;

    this.doc.setFontSize(10);
    this.doc.setTextColor('#000000');

    insights.slice(0, 5).forEach((insight, index) => {
      const title = insight.title || `Insight ${index + 1}`;
      const content = insight.content || insight.message || 'No details available';

      this.doc.setFont(undefined, 'bold');
      this.doc.text(`${index + 1}. ${title}`, this.margin, this.currentY);
      this.currentY += 8;

      this.doc.setFont(undefined, 'normal');
      const lines = this.doc.splitTextToSize(content, this.pageWidth - 2 * this.margin);
      lines.forEach((line: string) => {
        this.doc.text(line, this.margin + 5, this.currentY);
        this.currentY += 6;
      });

      this.currentY += 8;

      // This part of the code handles page breaks
      if (this.currentY > this.pageHeight - 50) {
        this.addPageBreak();
      }
    });

    this.currentY += 10;
  }

  /**
   * This part of the code generates Weekly Performance Report
   */
  private generateWeeklyPerformanceReport(reportData: any): void {
    this.addReportTitle(reportData);
    
    // This part of the code adds executive summary for weekly performance
    this.addSection('Executive Summary', () => {
      const data = reportData.data;
      const summary = [
        `Total Products in Dataset: ${data?.products?.length || 0}`,
        `Active Shipments: ${data?.shipments?.filter((s: any) => s.status !== 'completed' && s.status !== 'cancelled')?.length || 0}`,
        `Completed Orders: ${data?.shipments?.filter((s: any) => s.status === 'completed')?.length || 0}`,
        `Order Fulfillment Rate: ${this.calculateFulfillmentRate(data?.shipments || [])}%`,
        `Note: Based on development dataset (limited sample)`
      ];
      
      summary.forEach(line => {
        this.doc.text(`• ${line}`, this.margin + 5, this.currentY);
        this.currentY += 8;
      });
    });
    
    // This part of the code adds filtered data tables
    if (reportData.data) {
      this.addDataTables(reportData, 75);
    }
  }

  /**
   * This part of the code generates Inventory Health Report
   */
  private generateInventoryHealthReport(reportData: any): void {
    this.addReportTitle(reportData);
    
    // This part of the code adds inventory-specific metrics
    this.addSection('Inventory Overview', () => {
      const products = reportData.data?.products || [];
      const activeProducts = products.filter((p: any) => p.active);
      const inactiveProducts = products.filter((p: any) => !p.active);
      
      const overview = [
        `Total SKUs in Dataset: ${products.length}`,
        `Active SKUs: ${activeProducts.length}`,
        `Inactive SKUs: ${inactiveProducts.length}`,
        `Stock Health: ${this.getStockHealthStatus(activeProducts.length, products.length)}`,
        `Note: Development dataset - limited sample size`
      ];
      
      overview.forEach(line => {
        this.doc.text(`• ${line}`, this.margin + 5, this.currentY);
        this.currentY += 8;
      });
    });
    
    // This part of the code adds product data with inventory focus
    if (reportData.data?.products) {
      this.addProductsTable(reportData.data.products, 100);
    }
  }

  /**
   * This part of the code generates SLA Compliance Report
   */
  private generateSLAComplianceReport(reportData: any): void {
    this.addReportTitle(reportData);
    
    // This part of the code adds SLA-specific metrics
    this.addSection('SLA Performance', () => {
      const shipments = reportData.data?.shipments || [];
      const completedShipments = shipments.filter((s: any) => s.status === 'completed');
      const cancelledShipments = shipments.filter((s: any) => s.status === 'cancelled');
      
      const slaMetrics = [
        `Total Shipments in Dataset: ${shipments.length}`,
        `Completed: ${completedShipments.length}`,
        `Cancelled: ${cancelledShipments.length}`,
        `Success Rate: ${shipments.length > 0 ? ((completedShipments.length / shipments.length) * 100).toFixed(1) : 0}%`,
        `Note: Metrics based on development dataset`
      ];
      
      slaMetrics.forEach(line => {
        this.doc.text(`• ${line}`, this.margin + 5, this.currentY);
        this.currentY += 8;
      });
    });
    
    // This part of the code adds shipment performance data
    if (reportData.data?.shipments) {
      this.addShipmentsTable(reportData.data.shipments, 100);
    }
  }

  /**
   * This part of the code generates Labor Forecast Report
   */
  private generateLaborForecastReport(reportData: any): void {
    this.addReportTitle(reportData);
    
    // This part of the code adds labor-specific analysis
    this.addSection('Workforce Analysis', () => {
      const shipments = reportData.data?.shipments || [];
      const products = reportData.data?.products || [];
      
      const laborMetrics = [
        `Processing Volume: ${shipments.length} shipments (sample)`,
        `Product Complexity: ${products.length} SKUs (sample)`,
        `Estimated Labor Hours: ${this.estimateLaborHours(shipments, products)} (projected)`,
        `Recommended Staffing: ${this.recommendStaffing(shipments, products)} FTE (projected)`,
        `Note: Projections based on development dataset`
      ];
      
      laborMetrics.forEach(line => {
        this.doc.text(`• ${line}`, this.margin + 5, this.currentY);
        this.currentY += 8;
      });
    });
    
    // This part of the code adds operational data
    if (reportData.data) {
      this.addDataTables(reportData, 75);
    }
  }

  /**
   * This part of the code adds page breaks with proper header continuation
   */
  private addPageBreak(): void {
    this.doc.addPage();
    this.currentY = 20;
    this.addHeader();
  }

  /**
   * This part of the code adds a section with title and content
   */
  private addSection(title: string, contentCallback: () => void): void {
    this.currentY += 10;
    this.doc.setFontSize(12);
    this.doc.setTextColor(this.primaryColor);
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 12;
    
    this.doc.setFontSize(10);
    this.doc.setTextColor('#000000');
    contentCallback();
    this.currentY += 10;
  }

  /**
   * This part of the code adds simple products list as fallback
   */
  private addSimpleProductsList(products: any[]): void {
    this.doc.setFontSize(10);
    this.doc.setTextColor('#000000');
    
    products.slice(0, 10).forEach((product, index) => {
      const text = `${index + 1}. ${product.product_sku || product.sku || 'N/A'} - ${product.product_name || 'N/A'} (${product.brand_name || 'N/A'}) - $${(product.unit_cost || 0).toFixed(2)}`;
      this.doc.text(text, this.margin, this.currentY);
      this.currentY += 6;
    });
    
    this.currentY += 15;
  }

  /**
   * This part of the code adds simple shipments list as fallback
   */
  private addSimpleShipmentsList(shipments: any[]): void {
    this.doc.setFontSize(10);
    this.doc.setTextColor('#000000');
    
    shipments.slice(0, 10).forEach((shipment, index) => {
      const text = `${index + 1}. ${shipment.shipment_id || 'N/A'} - ${shipment.status || 'N/A'} - ${shipment.warehouse_id || 'N/A'} (Qty: ${shipment.expected_quantity || 0})`;
      this.doc.text(text, this.margin, this.currentY);
      this.currentY += 6;
    });
    
    this.currentY += 15;
  }

  /**
   * This part of the code adds footer
   */
  private addFooter(): void {
    this.doc.setFontSize(8);
    this.doc.setTextColor(this.secondaryColor);
    this.doc.text(
      `Generated by CargoCore - ${new Date().toLocaleString()}`,
      this.margin,
      this.pageHeight - 10
    );
    this.doc.text(
      'Page 1 of 1',
      this.pageWidth - this.margin,
      this.pageHeight - 10,
      { align: 'right' }
    );
  }

  /**
   * This part of the code calculates fulfillment rate
   */
  private calculateFulfillmentRate(shipments: any[]): number {
    if (!shipments || shipments.length === 0) return 0;
    const completed = shipments.filter(s => s.status === 'completed').length;
    return Math.round((completed / shipments.length) * 100);
  }

  /**
   * This part of the code gets stock health status
   */
  private getStockHealthStatus(activeCount: number, totalCount: number): string {
    if (totalCount === 0) return 'No Data';
    const ratio = activeCount / totalCount;
    if (ratio >= 0.95) return 'Excellent';
    if (ratio >= 0.85) return 'Good';
    if (ratio >= 0.70) return 'Fair';
    return 'Needs Attention';
  }

  /**
   * This part of the code estimates labor hours for operations
   */
  private estimateLaborHours(shipments: any[], products: any[]): number {
    const baseHoursPerShipment = 0.5;
    const complexityMultiplier = Math.min(products.length / 1000, 2);
    return Math.round(shipments.length * baseHoursPerShipment * (1 + complexityMultiplier));
  }

  /**
   * This part of the code recommends staffing levels
   */
  private recommendStaffing(shipments: any[], products: any[]): number {
    const hoursPerWeek = this.estimateLaborHours(shipments, products);
    const hoursPerFTE = 40;
    return Math.ceil(hoursPerWeek / hoursPerFTE);
  }
}

// This part of the code creates a singleton instance for use throughout the app
export const enhancedPdfService = new EnhancedPDFService();
