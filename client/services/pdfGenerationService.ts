import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ReportData, ReportKPIs } from '@/types/api';

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
 * This part of the code generates PDF reports with CargoCore branding
 * Uses jsPDF for professional document generation
 */
export class PDFGenerationService {
  private doc: jsPDF;
  private currentY: number = 20;
  private readonly pageWidth: number = 210; // A4 width in mm
  private readonly pageHeight: number = 297; // A4 height in mm
  private readonly margin: number = 20;
  private readonly primaryColor: string = '#2563eb'; // CargoCore blue
  private readonly secondaryColor: string = '#64748b';

  constructor() {
    this.doc = new jsPDF();
    // This part of the code ensures autoTable is properly attached to the jsPDF instance
    this.setupAutoTable();
  }

  /**
   * This part of the code properly sets up autoTable functionality
   */
  private setupAutoTable(): void {
    // This part of the code sets up autoTable with multiple fallback methods
    try {
      // Method 1: Direct assignment
      if (typeof autoTable === 'function') {
        (this.doc as any).autoTable = autoTable;
        return;
      }
      
      // Method 2: Default export
      if (autoTable && (autoTable as any).default && typeof (autoTable as any).default === 'function') {
        (this.doc as any).autoTable = (autoTable as any).default;
        return;
      }
      
      // Method 3: Call autoTable directly on the doc
      if (typeof (autoTable as any).__esModule !== 'undefined') {
        (this.doc as any).autoTable = (autoTable as any).default || autoTable;
        return;
      }
      
      console.error('autoTable setup failed - using fallback');
      // Don't crash, just log error
    } catch (error) {
      console.error('Error setting up autoTable:', error);
    }
  }

  /**
   * This part of the code generates a simple PDF report
   */
  public generateReport(reportData: any): void {
    this.doc = new jsPDF();
    // This part of the code ensures autoTable is properly attached to the new jsPDF instance
    this.setupAutoTable();
    this.currentY = 20;

    // Add header with CargoCore branding
    this.addHeader();
    
    // Add simple report title
    this.addSimpleTitle(reportData);
    
    // Add simple data summary
    this.addSimpleDataSummary(reportData);
    
    // Add simple data tables
    this.addSimpleDataTables(reportData);
    
    // Add footer
    this.addFooter();
    
    // Download the PDF
    const filename = `CargoCore_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    this.doc.save(filename);
  }

  /**
   * This part of the code adds the CargoCore header with branding
   */
  private addHeader(): void {
    // CargoCore logo/title
    this.doc.setFontSize(24);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('CargoCore', this.pageWidth - this.margin, 25, { align: 'right' });
    
    // Subtitle
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('3PL Operations Platform', this.pageWidth - this.margin, 32, { align: 'right' });
    
    // Blue line separator
    this.doc.setDrawColor(this.primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, 40, this.pageWidth - this.margin, 40);
    
    this.currentY = 50;
  }

  /**
   * This part of the code adds the report title and metadata section
   */
  private addReportTitle(_reportData: ReportData): void {
    // Report title
    this.doc.setFontSize(20);
    this.doc.setTextColor('#1f2937');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(reportData.template.name, this.margin, this.currentY);
    
    this.currentY += 15;
    
    // Report metadata
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFont('helvetica', 'normal');
    
    const metadata = [
      `Report Period: ${reportData.reportPeriod}`,
      `Generated: ${new Date(reportData.generatedAt).toLocaleString()}`,
      `Template: ${reportData.template.description}`,
      `Estimated Read Time: ${reportData.template.estimatedReadTime}`
    ];
    
    metadata.forEach((item, index) => {
      this.doc.text(item, this.margin, this.currentY + (index * 6));
    });
    
    this.currentY += 35;
  }

  /**
   * This part of the code adds the KPIs section with formatted metrics
   */
  private addKPIsSection(_kpis: ReportKPIs): void {
    this.addSectionTitle('Key Performance Indicators');
    
    const kpiData = [
      ['Total Products', this.formatNumber(kpis.totalProducts)],
      ['Active Products', this.formatNumber(kpis.activeProducts)],
      ['Total Shipments', this.formatNumber(kpis.totalShipments)],
      ['Completed Shipments', this.formatNumber(kpis.completedShipments)],
      ['Total Inventory Value', this.formatCurrency(kpis.totalInventoryValue)],
      ['SLA Compliance', kpis.slaCompliance ? `${kpis.slaCompliance}%` : 'N/A'],
      ['Fulfillment Rate', kpis.fulfillmentRate ? `${kpis.fulfillmentRate}%` : 'N/A'],
    ];

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Metric', 'Value']],
      body: kpiData,
      theme: 'grid',
      headStyles: {
        fillColor: this.primaryColor,
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: '#374151'
      },
      alternateRowStyles: {
        fillColor: '#f9fafb'
      },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 20;
  }

  /**
   * This part of the code adds data tables based on the report template type
   */
  private addDataTables(_reportData: ReportData): void {
    const templateId = reportData.template.id;
    
    switch (templateId) {
      case 'inventory-health':
        this.addInventoryTable(reportData.data.products);
        break;
      case 'fulfillment-performance':
        this.addShipmentsTable(reportData.data.shipments);
        break;
      case 'supplier-analysis':
        this.addSupplierTable(reportData.data.shipments);
        break;
      case 'warehouse-efficiency':
        this.addWarehouseTable(reportData.data.shipments);
        break;
      case 'brand-performance':
        this.addBrandTable(reportData.data.products);
        break;
      default:
        this.addGenericDataTable(reportData);
    }
  }

  /**
   * This part of the code adds inventory-specific data table
   */
  private addInventoryTable(products: any[]): void {
    this.addSectionTitle('Inventory Details');
    
    if (!products || products.length === 0) {
      this.addNoDataMessage();
      return;
    }

    const tableData = products.slice(0, 20).map(product => [
      product.product_sku || 'N/A',
      product.product_name || 'Unknown Product',
      product.brand_name || 'Unknown Brand',
      this.formatNumber(product.unit_quantity || 0),
      this.formatCurrency(product.unit_cost || 0),
      this.formatCurrency((product.unit_cost || 0) * (product.unit_quantity || 0)),
      product.supplier_name || 'Unknown Supplier'
    ]);

    this.doc.autoTable({
      startY: this.currentY,
      head: [['SKU', 'Product Name', 'Brand', 'Quantity', 'Unit Cost', 'Total Value', 'Supplier']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: this.primaryColor,
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7,
        textColor: '#374151'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
        6: { cellWidth: 30 }
      },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
    
    if (products.length > 20) {
      this.doc.setFontSize(8);
      this.doc.setTextColor(this.secondaryColor);
      this.doc.text(`Showing first 20 of ${products.length} products`, this.margin, this.currentY);
      this.currentY += 10;
    }
  }

  /**
   * This part of the code adds shipments-specific data table
   */
  private addShipmentsTable(shipments: any[]): void {
    this.addSectionTitle('Shipment Performance');
    
    if (!shipments || shipments.length === 0) {
      this.addNoDataMessage();
      return;
    }

    const tableData = shipments.slice(0, 15).map(shipment => [
      shipment.shipment_id || 'N/A',
      shipment.brand_name || 'Unknown Brand',
      shipment.status || 'Unknown',
      shipment.supplier || 'Unknown Supplier',
      this.formatDate(shipment.created_date),
      this.formatDate(shipment.expected_arrival_date),
      this.formatDate(shipment.arrival_date),
      this.formatNumber(shipment.expected_quantity || 0)
    ]);

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Shipment ID', 'Brand', 'Status', 'Supplier', 'Created', 'Expected', 'Arrived', 'Quantity']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: this.primaryColor,
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7,
        textColor: '#374151'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 15 }
      },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  /**
   * This part of the code adds supplier analysis table
   */
  private addSupplierTable(shipments: any[]): void {
    this.addSectionTitle('Supplier Performance Analysis');
    
    if (!shipments || shipments.length === 0) {
      this.addNoDataMessage();
      return;
    }

    // Aggregate supplier data
    const supplierStats = this.aggregateSupplierData(shipments);
    const tableData = Object.entries(supplierStats).slice(0, 15).map(([supplier, stats]: [string, any]) => [
      supplier,
      this.formatNumber(stats.totalShipments),
      this.formatNumber(stats.completedShipments),
      `${Math.round((stats.completedShipments / stats.totalShipments) * 100)}%`,
      this.formatNumber(stats.avgDeliveryDays),
      this.formatCurrency(stats.avgCost)
    ]);

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Supplier', 'Total Shipments', 'Completed', 'Success Rate', 'Avg Delivery Days', 'Avg Cost']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: this.primaryColor,
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: '#374151'
      },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  /**
   * This part of the code adds warehouse efficiency table
   */
  private addWarehouseTable(shipments: any[]): void {
    this.addSectionTitle('Warehouse Efficiency Metrics');
    
    if (!shipments || shipments.length === 0) {
      this.addNoDataMessage();
      return;
    }

    // Aggregate warehouse data
    const warehouseStats = this.aggregateWarehouseData(shipments);
    const tableData = Object.entries(warehouseStats).slice(0, 10).map(([warehouse, stats]: [string, any]) => [
      warehouse,
      this.formatNumber(stats.totalShipments),
      this.formatNumber(stats.throughput),
      this.formatCurrency(stats.avgCostPerShipment),
      `${Math.round(stats.efficiency)}%`,
      this.formatNumber(stats.avgProcessingDays)
    ]);

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Warehouse', 'Total Shipments', 'Monthly Throughput', 'Avg Cost/Shipment', 'Efficiency', 'Avg Processing']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: this.primaryColor,
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: '#374151'
      },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  /**
   * This part of the code adds brand performance table
   */
  private addBrandTable(products: any[]): void {
    this.addSectionTitle('Brand Performance Analysis');
    
    if (!products || products.length === 0) {
      this.addNoDataMessage();
      return;
    }

    // Aggregate brand data
    const brandStats = this.aggregateBrandData(products);
    const tableData = Object.entries(brandStats).slice(0, 15).map(([brand, stats]: [string, any]) => [
      brand,
      this.formatNumber(stats.totalProducts),
      this.formatNumber(stats.totalQuantity),
      this.formatCurrency(stats.totalValue),
      this.formatCurrency(stats.avgUnitCost),
      `${Math.round(stats.portfolioPercentage)}%`
    ]);

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Brand', 'Total SKUs', 'Total Quantity', 'Total Value', 'Avg Unit Cost', 'Portfolio %']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: this.primaryColor,
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: '#374151'
      },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  /**
   * This part of the code adds generic data table for other templates
   */
  private addGenericDataTable(reportData: ReportData): void {
    this.addSectionTitle('Data Summary');
    
    const summaryData = [
      ['Products Analyzed', this.formatNumber(reportData.data.products.length)],
      ['Shipments Analyzed', this.formatNumber(reportData.data.shipments.length)],
      ['Report Period', reportData.reportPeriod],
      ['Analysis Date', new Date(reportData.generatedAt).toLocaleDateString()]
    ];

    this.doc.autoTable({
      startY: this.currentY,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: {
        fillColor: this.primaryColor,
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: '#374151'
      },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  /**
   * This part of the code adds AI insights section at the bottom
   */
  private addAIInsights(_insights: any[]): void {
    if (!insights || insights.length === 0) {
      return;
    }

    // Check if we need a new page
    if (this.currentY > this.pageHeight - 100) {
      this.doc.addPage();
      this.currentY = 20;
    }

    this.addSectionTitle('AI-Powered Strategic Insights');
    
    insights.forEach((insight, index) => {
      // Check if we need a new page for this insight
      if (this.currentY > this.pageHeight - 60) {
        this.doc.addPage();
        this.currentY = 20;
      }

      // Insight title
      this.doc.setFontSize(11);
      this.doc.setTextColor('#1f2937');
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${index + 1}. ${insight.title}`, this.margin, this.currentY);
      this.currentY += 8;

      // Insight description
      this.doc.setFontSize(9);
      this.doc.setTextColor('#374151');
      this.doc.setFont('helvetica', 'normal');
      const descriptionLines = this.doc.splitTextToSize(insight.description, this.pageWidth - (this.margin * 2));
      this.doc.text(descriptionLines, this.margin, this.currentY);
      this.currentY += descriptionLines.length * 4 + 5;

      // Suggested actions
      if (insight.suggestedActions && insight.suggestedActions.length > 0) {
        this.doc.setFontSize(8);
        this.doc.setTextColor(this.primaryColor);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Recommended Actions:', this.margin, this.currentY);
        this.currentY += 5;

        insight.suggestedActions.forEach((action: string, _actionIndex: number) => {
          this.doc.setFontSize(8);
          this.doc.setTextColor('#4b5563');
          this.doc.setFont('helvetica', 'normal');
          const actionText = `• ${action}`;
          const actionLines = this.doc.splitTextToSize(actionText, this.pageWidth - (this.margin * 2) - 10);
          this.doc.text(actionLines, this.margin + 5, this.currentY);
          this.currentY += actionLines.length * 3 + 2;
        });
      }

      this.currentY += 10;
    });
  }

  /**
   * This part of the code adds section titles with consistent formatting
   */
  private addSectionTitle(title: string): void {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 40) {
      this.doc.addPage();
      this.currentY = 20;
    }

    this.doc.setFontSize(14);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    
    // Add underline
    const textWidth = this.doc.getTextWidth(title);
    this.doc.setDrawColor(this.primaryColor);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, this.currentY + 2, this.margin + textWidth, this.currentY + 2);
    
    this.currentY += 15;
  }

  /**
   * This part of the code adds a no data message
   */
  private addNoDataMessage(): void {
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text('No data available for this section', this.margin, this.currentY);
    this.currentY += 20;
  }

  /**
   * This part of the code adds the footer with page numbers
   */
  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.setDrawColor('#e5e7eb');
      this.doc.setLineWidth(0.3);
      this.doc.line(this.margin, this.pageHeight - 20, this.pageWidth - this.margin, this.pageHeight - 20);
      
      // Page number
      this.doc.setFontSize(8);
      this.doc.setTextColor(this.secondaryColor);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth - this.margin,
        this.pageHeight - 10,
        { align: 'right' }
      );
      
      // Company info
      this.doc.text(
        'Generated by CargoCore - 3PL Operations Platform',
        this.margin,
        this.pageHeight - 10
      );
    }
  }

  // Helper methods for data aggregation and formatting
  private aggregateSupplierData(shipments: any[]): any {
    const stats: any = {};
    
    shipments.forEach(shipment => {
      const supplier = shipment.supplier || 'Unknown Supplier';
      if (!stats[supplier]) {
        stats[supplier] = {
          totalShipments: 0,
          completedShipments: 0,
          totalDeliveryDays: 0,
          totalCost: 0,
          deliveryDaysCount: 0
        };
      }
      
      stats[supplier].totalShipments++;
      
      if (shipment.status === 'completed' || shipment.status === 'receiving') {
        stats[supplier].completedShipments++;
      }
      
      if (shipment.expected_arrival_date && shipment.arrival_date) {
        const expected = new Date(shipment.expected_arrival_date);
        const actual = new Date(shipment.arrival_date);
        const deliveryDays = Math.abs((actual.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24));
        stats[supplier].totalDeliveryDays += deliveryDays;
        stats[supplier].deliveryDaysCount++;
      }
      
      if (shipment.unit_cost) {
        stats[supplier].totalCost += shipment.unit_cost * (shipment.expected_quantity || 1);
      }
    });
    
    // Calculate averages
    Object.keys(stats).forEach(supplier => {
      const data = stats[supplier];
      data.avgDeliveryDays = data.deliveryDaysCount > 0 ? data.totalDeliveryDays / data.deliveryDaysCount : 0;
      data.avgCost = data.totalShipments > 0 ? data.totalCost / data.totalShipments : 0;
    });
    
    return stats;
  }

  private aggregateWarehouseData(shipments: any[]): any {
    const stats: any = {};
    
    shipments.forEach(shipment => {
      const warehouse = shipment.warehouse_id || 'Unknown Warehouse';
      if (!stats[warehouse]) {
        stats[warehouse] = {
          totalShipments: 0,
          completedShipments: 0,
          totalCost: 0,
          totalProcessingDays: 0,
          processingDaysCount: 0
        };
      }
      
      stats[warehouse].totalShipments++;
      
      if (shipment.status === 'completed' || shipment.status === 'receiving') {
        stats[warehouse].completedShipments++;
      }
      
      if (shipment.unit_cost) {
        stats[warehouse].totalCost += shipment.unit_cost * (shipment.expected_quantity || 1);
      }
      
      if (shipment.created_date && shipment.arrival_date) {
        const created = new Date(shipment.created_date);
        const arrived = new Date(shipment.arrival_date);
        const processingDays = Math.abs((arrived.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        stats[warehouse].totalProcessingDays += processingDays;
        stats[warehouse].processingDaysCount++;
      }
    });
    
    // Calculate metrics
    Object.keys(stats).forEach(warehouse => {
      const data = stats[warehouse];
      data.throughput = Math.round(data.totalShipments * 30 / 7); // Weekly to monthly estimate
      data.avgCostPerShipment = data.totalShipments > 0 ? data.totalCost / data.totalShipments : 0;
      data.efficiency = data.totalShipments > 0 ? (data.completedShipments / data.totalShipments) * 100 : 0;
      data.avgProcessingDays = data.processingDaysCount > 0 ? data.totalProcessingDays / data.processingDaysCount : 0;
    });
    
    return stats;
  }

  private aggregateBrandData(products: any[]): any {
    const stats: any = {};
    let totalValue = 0;
    
    // Calculate total value first
    products.forEach(product => {
      totalValue += (product.unit_cost || 0) * (product.unit_quantity || 0);
    });
    
    products.forEach(product => {
      const brand = product.brand_name || 'Unknown Brand';
      if (!stats[brand]) {
        stats[brand] = {
          totalProducts: 0,
          totalQuantity: 0,
          totalValue: 0,
          totalCost: 0
        };
      }
      
      stats[brand].totalProducts++;
      stats[brand].totalQuantity += product.unit_quantity || 0;
      const productValue = (product.unit_cost || 0) * (product.unit_quantity || 0);
      stats[brand].totalValue += productValue;
      stats[brand].totalCost += product.unit_cost || 0;
    });
    
    // Calculate averages and percentages
    Object.keys(stats).forEach(brand => {
      const data = stats[brand];
      data.avgUnitCost = data.totalProducts > 0 ? data.totalCost / data.totalProducts : 0;
      data.portfolioPercentage = totalValue > 0 ? (data.totalValue / totalValue) * 100 : 0;
    });
    
    return stats;
  }

  // Utility formatting methods
  private formatNumber(num: number | null | undefined): string {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  }

  private formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return 'N/A';
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  }

  /**
   * This part of the code adds a simple report title
   */
  private addSimpleTitle(_reportData: any): void {
    this.currentY += 10;
    
    // Report title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('CargoCore Data Report', this.margin, this.currentY);
    
    this.currentY += 15;
    
    // Generation date
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Generated: ${new Date().toLocaleDateString()}`, this.margin, this.currentY);
    
    this.currentY += 20;
  }

  /**
   * This part of the code adds a simple data summary
   */
  private addSimpleDataSummary(reportData: any): void {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Data Summary', this.margin, this.currentY);
    
    this.currentY += 15;
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    
    const productsCount = reportData.data?.products?.length || 0;
    const shipmentsCount = reportData.data?.shipments?.length || 0;
    const insightsCount = reportData.data?.insights?.length || 0;
    
    this.doc.text(`• Products: ${productsCount}`, this.margin, this.currentY);
    this.currentY += 8;
    this.doc.text(`• Shipments: ${shipmentsCount}`, this.margin, this.currentY);
    this.currentY += 8;
    this.doc.text(`• AI Insights: ${insightsCount}`, this.margin, this.currentY);
    
    this.currentY += 20;
  }

  /**
   * This part of the code adds simple data tables
   */
  private addSimpleDataTables(reportData: any): void {
    const products = reportData.data?.products || [];
    const shipments = reportData.data?.shipments || [];
    
    // Add products table if we have products
    if (products.length > 0) {
      this.addSimpleProductsTable(products.slice(0, 10)); // Only first 10
    }
    
    // Add shipments table if we have shipments
    if (shipments.length > 0) {
      this.addSimpleShipmentsTable(shipments.slice(0, 10)); // Only first 10
    }
  }

  /**
   * This part of the code adds a simple products table
   */
  private addSimpleProductsTable(products: any[]): void {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Products (First 10)', this.margin, this.currentY);
    this.currentY += 15;

    // This part of the code tries autoTable first, falls back to simple text if it fails
    try {
      if ((this.doc as any).autoTable && typeof (this.doc as any).autoTable === 'function') {
        const tableData = products.map(product => [
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
      } else {
        throw new Error('autoTable not available');
      }
    } catch (error) {
      console.warn('autoTable failed, using simple text fallback:', error);
      this.addSimpleProductsList(products);
    }
  }

  /**
   * This part of the code adds a simple shipments table
   */
  private addSimpleShipmentsTable(shipments: any[]): void {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Shipments (First 10)', this.margin, this.currentY);
    this.currentY += 15;

    // This part of the code tries autoTable first, falls back to simple text if it fails
    try {
      if ((this.doc as any).autoTable && typeof (this.doc as any).autoTable === 'function') {
        const tableData = shipments.map(shipment => [
          shipment.shipment_id || 'N/A',
          shipment.status || 'N/A',
          shipment.supplier || 'N/A',
          `${shipment.expected_quantity || 0}`
        ]);

        (this.doc as any).autoTable({
          startY: this.currentY,
          head: [['Shipment ID', 'Status', 'Supplier', 'Quantity']],
          body: tableData,
          theme: 'striped',
          styles: { fontSize: 10 },
          margin: { left: this.margin, right: this.margin }
        });

        this.currentY = (this.doc as any).lastAutoTable?.finalY + 20 || this.currentY + 100;
      } else {
        throw new Error('autoTable not available');
      }
    } catch (error) {
      console.warn('autoTable failed, using simple text fallback:', error);
      this.addSimpleShipmentsList(shipments);
    }
  }

  /**
   * This part of the code adds a simple products list as fallback when autoTable fails
   */
  private addSimpleProductsList(products: any[]): void {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    products.slice(0, 10).forEach((product, index) => {
      const text = `${index + 1}. ${product.product_sku || product.sku || 'N/A'} - ${product.product_name || 'N/A'} (${product.brand_name || 'N/A'}) - $${(product.unit_cost || 0).toFixed(2)}`;
      this.doc.text(text, this.margin, this.currentY);
      this.currentY += 6;
    });
    
    this.currentY += 15;
  }

  /**
   * This part of the code adds a simple shipments list as fallback when autoTable fails
   */
  private addSimpleShipmentsList(shipments: any[]): void {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    shipments.slice(0, 10).forEach((shipment, index) => {
      const text = `${index + 1}. ${shipment.shipment_id || 'N/A'} - ${shipment.status || 'N/A'} - ${shipment.supplier || 'N/A'} (Qty: ${shipment.expected_quantity || 0})`;
      this.doc.text(text, this.margin, this.currentY);
      this.currentY += 6;
    });
    
    this.currentY += 15;
  }
}

// Export singleton instance
export const pdfGenerationService = new PDFGenerationService();
