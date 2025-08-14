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
 * This part of the code provides enhanced PDF generation with professional UI and multi-page support
 * Features: Better styling, automatic pagination, comprehensive data display, professional formatting
 */
export class EnhancedPDFServiceV2 {
  private doc: jsPDF;
  private currentY: number = 20;
  private readonly pageWidth: number = 210; // A4 width in mm
  private readonly pageHeight: number = 297; // A4 height in mm
  private readonly margin: number = 20;
  private readonly primaryColor: string = '#2563eb'; // CargoCore blue
  private readonly secondaryColor: string = '#64748b';
  private readonly successColor: string = '#10b981';
  private readonly warningColor: string = '#f59e0b';
  private readonly errorColor: string = '#ef4444';

  constructor() {
    this.doc = new jsPDF();
    this.setupAutoTable();
  }

  /**
   * This part of the code properly sets up autoTable functionality with robust error handling
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
      
      console.warn('autoTable setup using fallback method');
      (this.doc as any).autoTable = autoTable;
    } catch (error) {
      console.error('Error setting up autoTable:', error);
    }
  }

  /**
   * This part of the code generates enhanced multi-page PDF reports
   */
  public generateReport(reportData: any): void {
    try {
      this.doc = new jsPDF();
      this.setupAutoTable();
      this.currentY = 20;

      // This part of the code generates the first page with header and summary
      this.addProfessionalHeader();
      this.addReportTitle(reportData);
      this.addExecutiveSummary(reportData);
      
      // This part of the code adds comprehensive data sections
      if (reportData.data?.products && reportData.data.products.length > 0) {
        this.addProductsSection(reportData.data.products);
      }
      
      if (reportData.data?.shipments && reportData.data.shipments.length > 0) {
        this.addShipmentsSection(reportData.data.shipments);
      }
      
      if (reportData.data?.insights && reportData.data.insights.length > 0) {
        this.addInsightsSection(reportData.data.insights);
      }
      
      // This part of the code adds professional footer to all pages
      this.addMultiPageFooter();
      
      // This part of the code saves the PDF with descriptive filename
      const templateName = reportData.template?.name?.replace(/\s+/g, '_') || 'CargoCore_Report';
      const filename = `${templateName}_${new Date().toISOString().split('T')[0]}.pdf`;
      this.doc.save(filename);
      
    } catch (error) {
      console.error('Error generating enhanced PDF report:', error);
      throw new Error('Failed to generate PDF report');
    }
  }

  /**
   * This part of the code adds a professional header with improved CargoCore branding
   */
  private addProfessionalHeader(): void {
    // Background accent for header
    this.doc.setFillColor(248, 250, 252); // Very light blue-gray
    this.doc.rect(0, 0, this.pageWidth, 45, 'F');
    
    // CargoCore logo/title with enhanced styling
    this.doc.setFontSize(28);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('CargoCore', this.pageWidth - this.margin, 25, { align: 'right' });
    
    // Enhanced subtitle
    this.doc.setFontSize(11);
    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('3PL Operations Platform', this.pageWidth - this.margin, 33, { align: 'right' });
    
    // Professional separator line
    this.doc.setDrawColor(this.primaryColor);
    this.doc.setLineWidth(1);
    this.doc.line(this.margin, 40, this.pageWidth - this.margin, 40);
    
    this.currentY = 55;
  }

  /**
   * This part of the code adds an enhanced report title with comprehensive metadata
   */
  private addReportTitle(reportData: any): void {
    // Main report title
    this.doc.setFontSize(22);
    this.doc.setTextColor('#1f2937');
    this.doc.setFont('helvetica', 'bold');
    const title = reportData.template?.name || 'CargoCore Data Report';
    this.doc.text(title, this.margin, this.currentY);
    
    this.currentY += 25;
    
    // Report metadata section
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    
    // Generation date with enhanced formatting
    this.doc.setTextColor(this.secondaryColor);
    this.doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, this.margin, this.currentY);
    this.currentY += 10;
    
    // Development dataset notice with styling
    this.doc.setTextColor('#dc2626');
    this.doc.setFont('helvetica', 'italic');
    this.doc.text('⚠ Development Dataset - Limited Sample Data', this.margin, this.currentY);
    this.currentY += 8;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor('#666666');
    this.doc.text(`Period: ${reportData.reportPeriod || 'Last 250 relevant data points'}`, this.margin, this.currentY);
    this.currentY += 12;
    
    // Filter information in a styled box
    if (reportData.filters && this.hasActiveFilters(reportData.filters)) {
      this.addFilterInfoBox(reportData.filters);
    }
    
    this.currentY += 15;
  }

  /**
   * This part of the code checks if there are active filters applied
   */
  private hasActiveFilters(filters: any): boolean {
    return (filters.brands && filters.brands.length > 0) ||
           (filters.warehouses && filters.warehouses.length > 0) ||
           (filters.metrics && filters.metrics.length > 0);
  }

  /**
   * This part of the code adds a styled filter information box
   */
  private addFilterInfoBox(filters: any): void {
    const boxHeight = 25;
    
    // Light blue background for filter box
    this.doc.setFillColor(239, 246, 255);
    this.doc.setDrawColor(147, 197, 253);
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight, 3, 3, 'FD');
    
    this.currentY += 8;
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Active Filters:', this.margin + 5, this.currentY);
    
    this.currentY += 6;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor('#374151');
    
    let filterText = '';
    if (filters.brands && filters.brands.length > 0) {
      filterText += `Brands: ${filters.brands.join(', ')}`;
    }
    if (filters.warehouses && filters.warehouses.length > 0) {
      if (filterText) filterText += ' | ';
      filterText += `Warehouses: ${filters.warehouses.join(', ')}`;
    }
    if (filters.metrics && filters.metrics.length > 0) {
      if (filterText) filterText += ' | ';
      filterText += `Metrics: ${filters.metrics.join(', ')}`;
    }
    
    this.doc.text(filterText, this.margin + 5, this.currentY);
    this.currentY += boxHeight - 8;
  }

  /**
   * This part of the code adds a comprehensive executive summary with KPI boxes
   */
  private addExecutiveSummary(reportData: any): void {
    this.checkPageBreak(80);
    
    // Section header
    this.doc.setFontSize(18);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Executive Summary', this.margin, this.currentY);
    
    this.currentY += 20;
    
    const data = reportData.data || reportData;
    
    // Create KPI summary boxes in a grid layout
    const boxWidth = (this.pageWidth - 2 * this.margin - 20) / 3; // 3 boxes per row with spacing
    let boxX = this.margin;
    let boxRow = 0;
    
    const kpis = [
      {
        title: 'Products',
        value: (data.products?.length || 0).toString(),
        subtitle: 'SKUs in dataset',
        color: this.primaryColor
      },
      {
        title: 'Shipments',
        value: (data.shipments?.length || 0).toString(),
        subtitle: 'Records processed',
        color: this.successColor
      },
      {
        title: 'AI Insights',
        value: (data.insights?.length || 0).toString(),
        subtitle: 'Generated insights',
        color: this.warningColor
      }
    ];
    
    // Add operational metrics if available
    if (data.shipments && data.shipments.length > 0) {
      const completedShipments = data.shipments.filter((s: any) => s.status === 'completed').length;
      const successRate = ((completedShipments / data.shipments.length) * 100).toFixed(1);
      
      kpis.push({
        title: 'Success Rate',
        value: `${successRate}%`,
        subtitle: `${completedShipments} completed`,
        color: parseFloat(successRate) >= 80 ? this.successColor : 
               parseFloat(successRate) >= 60 ? this.warningColor : this.errorColor
      });
    }
    
    // Draw KPI boxes
    kpis.forEach((kpi, index) => {
      if (index > 0 && index % 3 === 0) {
        boxRow++;
        boxX = this.margin;
        this.currentY += 50;
      }
      
      this.addKPIBox(boxX, this.currentY, boxWidth, kpi);
      boxX += boxWidth + 10;
    });
    
    this.currentY += 60;
  }

  /**
   * This part of the code adds individual KPI boxes with professional styling
   */
  private addKPIBox(x: number, y: number, width: number, kpi: any): void {
    const height = 40;
    
    // Box background and border
    this.doc.setFillColor(255, 255, 255);
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(x, y, width, height, 3, 3, 'FD');
    
    // Colored accent bar
    this.doc.setFillColor(...this.hexToRgb(kpi.color));
    this.doc.rect(x, y, width, 3, 'F');
    
    // KPI value
    this.doc.setFontSize(16);
    this.doc.setTextColor(kpi.color);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(kpi.value, x + width/2, y + 18, { align: 'center' });
    
    // KPI title
    this.doc.setFontSize(9);
    this.doc.setTextColor('#374151');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(kpi.title, x + width/2, y + 26, { align: 'center' });
    
    // KPI subtitle
    this.doc.setFontSize(8);
    this.doc.setTextColor('#6b7280');
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(kpi.subtitle, x + width/2, y + 33, { align: 'center' });
  }

  /**
   * This part of the code adds an enhanced products section with better table formatting
   */
  private addProductsSection(products: any[]): void {
    this.checkPageBreak(60);
    
    // Section header
    this.addSectionHeader('Product Analysis', `Showing ${Math.min(products.length, 50)} of ${products.length} products`);
    
    // Enhanced table with better styling
    try {
      if ((this.doc as any).autoTable && typeof (this.doc as any).autoTable === 'function') {
        const tableData = products.slice(0, 50).map((product, index) => [
          (index + 1).toString(),
          product.product_sku || product.sku || 'N/A',
          product.product_name || 'N/A',
          product.brand_name || 'N/A',
          `$${(product.unit_cost || 0).toFixed(2)}`,
          product.active ? '✓ Active' : '✗ Inactive'
        ]);

        (this.doc as any).autoTable({
          startY: this.currentY,
          head: [['#', 'SKU', 'Product Name', 'Brand', 'Unit Cost', 'Status']],
          body: tableData,
          theme: 'grid',
          styles: { 
            fontSize: 9,
            cellPadding: 3,
            overflow: 'linebreak',
            halign: 'left'
          },
          headStyles: {
            fillColor: [37, 99, 235], // Primary blue
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252]
          },
          columnStyles: {
            0: { halign: 'center', cellWidth: 15 }, // #
            1: { cellWidth: 25 }, // SKU
            2: { cellWidth: 60 }, // Product Name
            3: { cellWidth: 35 }, // Brand
            4: { halign: 'right', cellWidth: 25 }, // Unit Cost
            5: { halign: 'center', cellWidth: 25 } // Status
          },
          margin: { left: this.margin, right: this.margin }
        });

        this.currentY = (this.doc as any).lastAutoTable?.finalY + 15 || this.currentY + 100;
      } else {
        this.addSimpleProductsList(products.slice(0, 20));
      }
    } catch (error) {
      console.warn('Enhanced table failed, using simple list:', error);
      this.addSimpleProductsList(products.slice(0, 20));
    }
  }

  /**
   * This part of the code adds an enhanced shipments section with better table formatting
   */
  private addShipmentsSection(shipments: any[]): void {
    this.checkPageBreak(60);
    
    // Section header
    this.addSectionHeader('Shipment Analysis', `Showing ${Math.min(shipments.length, 50)} of ${shipments.length} shipments`);
    
    // Enhanced table with better styling
    try {
      if ((this.doc as any).autoTable && typeof (this.doc as any).autoTable === 'function') {
        const tableData = shipments.slice(0, 50).map((shipment, index) => [
          (index + 1).toString(),
          shipment.shipment_id?.substring(0, 12) || 'N/A',
          this.formatShipmentStatus(shipment.status),
          shipment.warehouse_id || shipment.supplier || 'N/A',
          (shipment.expected_quantity || 0).toString(),
          (shipment.received_quantity || 0).toString(),
          this.formatDate(shipment.created_date)
        ]);

        (this.doc as any).autoTable({
          startY: this.currentY,
          head: [['#', 'Shipment ID', 'Status', 'Warehouse/Supplier', 'Expected', 'Received', 'Date']],
          body: tableData,
          theme: 'grid',
          styles: { 
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak',
            halign: 'left'
          },
          headStyles: {
            fillColor: [16, 185, 129], // Success green
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252]
          },
          columnStyles: {
            0: { halign: 'center', cellWidth: 12 }, // #
            1: { cellWidth: 30 }, // Shipment ID
            2: { halign: 'center', cellWidth: 20 }, // Status
            3: { cellWidth: 40 }, // Warehouse
            4: { halign: 'center', cellWidth: 20 }, // Expected
            5: { halign: 'center', cellWidth: 20 }, // Received
            6: { halign: 'center', cellWidth: 25 } // Date
          },
          margin: { left: this.margin, right: this.margin }
        });

        this.currentY = (this.doc as any).lastAutoTable?.finalY + 15 || this.currentY + 100;
      } else {
        this.addSimpleShipmentsList(shipments.slice(0, 20));
      }
    } catch (error) {
      console.warn('Enhanced table failed, using simple list:', error);
      this.addSimpleShipmentsList(shipments.slice(0, 20));
    }
  }

  /**
   * This part of the code adds an insights section with professional formatting
   */
  private addInsightsSection(insights: any[]): void {
    this.checkPageBreak(60);
    
    // Section header
    this.addSectionHeader('AI-Generated Insights', `${insights.length} actionable insights discovered`);
    
    insights.slice(0, 5).forEach((insight, index) => {
      this.checkPageBreak(40);
      
      // Insight box
      const boxHeight = 30;
      
      // Background box
      this.doc.setFillColor(254, 252, 232); // Light yellow
      this.doc.setDrawColor(251, 191, 36); // Yellow border
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight, 2, 2, 'FD');
      
      // Insight number badge
      this.doc.setFillColor(251, 191, 36);
      this.doc.circle(this.margin + 8, this.currentY + 8, 5, 'F');
      this.doc.setFontSize(10);
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text((index + 1).toString(), this.margin + 8, this.currentY + 10, { align: 'center' });
      
      // Insight title
      this.doc.setFontSize(11);
      this.doc.setTextColor('#92400e');
      this.doc.setFont('helvetica', 'bold');
      const title = insight.title || `Insight ${index + 1}`;
      this.doc.text(title, this.margin + 18, this.currentY + 10);
      
      // Insight content
      this.doc.setFontSize(9);
      this.doc.setTextColor('#451a03');
      this.doc.setFont('helvetica', 'normal');
      const content = insight.content || insight.message || 'No details available';
      const lines = this.doc.splitTextToSize(content, this.pageWidth - 2 * this.margin - 25);
      
      let lineY = this.currentY + 18;
      lines.slice(0, 2).forEach((line: string) => { // Limit to 2 lines
        this.doc.text(line, this.margin + 18, lineY);
        lineY += 6;
      });
      
      this.currentY += boxHeight + 8;
    });
  }

  /**
   * This part of the code adds professional section headers
   */
  private addSectionHeader(title: string, subtitle?: string): void {
    this.doc.setFontSize(16);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    
    if (subtitle) {
      this.doc.setFontSize(10);
      this.doc.setTextColor(this.secondaryColor);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, this.margin, this.currentY + 8);
      this.currentY += 20;
    } else {
      this.currentY += 15;
    }
  }

  /**
   * This part of the code checks if a new page is needed and adds one if necessary
   */
  private checkPageBreak(requiredSpace: number = 50): void {
    if (this.currentY + requiredSpace > this.pageHeight - 30) {
      this.doc.addPage();
      this.currentY = 30;
      this.addProfessionalHeader();
    }
  }

  /**
   * This part of the code adds professional footer to all pages
   */
  private addMultiPageFooter(): void {
    const totalPages = this.doc.getNumberOfPages();
    
    // Add footer to all pages
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      
      // Footer background
      this.doc.setFillColor(248, 250, 252);
      this.doc.rect(0, this.pageHeight - 20, this.pageWidth, 20, 'F');
      
      this.doc.setFontSize(8);
      this.doc.setTextColor(this.secondaryColor);
      
      // Left side - generation info
      this.doc.text(
        `Generated by CargoCore • ${new Date().toLocaleDateString()}`,
        this.margin,
        this.pageHeight - 8
      );
      
      // Right side - page numbers
      this.doc.text(
        `Page ${i} of ${totalPages}`,
        this.pageWidth - this.margin,
        this.pageHeight - 8,
        { align: 'right' }
      );
    }
  }

  /**
   * This part of the code provides utility functions for formatting
   */
  private formatShipmentStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'completed': '✓ Completed',
      'cancelled': '✗ Cancelled',
      'receiving': '⏳ Receiving',
      'pending': '⌛ Pending'
    };
    return statusMap[status?.toLowerCase()] || status || 'Unknown';
  }

  private formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  }

  /**
   * This part of the code provides fallback methods for simple text rendering
   */
  private addSimpleProductsList(products: any[]): void {
    this.doc.setFontSize(10);
    this.doc.setTextColor('#000000');
    
    products.slice(0, 10).forEach((product, index) => {
      this.checkPageBreak(8);
      const text = `${index + 1}. ${product.product_sku || product.sku || 'N/A'} - ${product.product_name || 'N/A'} (${product.brand_name || 'N/A'}) - $${(product.unit_cost || 0).toFixed(2)}`;
      this.doc.text(text, this.margin, this.currentY);
      this.currentY += 6;
    });
    
    this.currentY += 15;
  }

  private addSimpleShipmentsList(shipments: any[]): void {
    this.doc.setFontSize(10);
    this.doc.setTextColor('#000000');
    
    shipments.slice(0, 10).forEach((shipment, index) => {
      this.checkPageBreak(8);
      const text = `${index + 1}. ${shipment.shipment_id || 'N/A'} - ${shipment.status || 'N/A'} - ${shipment.warehouse_id || shipment.supplier || 'N/A'} (Qty: ${shipment.expected_quantity || 0})`;
      this.doc.text(text, this.margin, this.currentY);
      this.currentY += 6;
    });
    
    this.currentY += 15;
  }
}

// This part of the code creates a singleton instance for use throughout the app
export const enhancedPdfServiceV2 = new EnhancedPDFServiceV2();
