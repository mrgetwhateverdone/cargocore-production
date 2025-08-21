import { RequestHandler } from "express";

/**
 * This part of the code creates server-side warehouse data routes
 * Following the same patterns as dashboard.ts for consistency and security
 */

interface ProductData {
  product_id: string;
  company_url: string;
  brand_id: string | null;
  brand_name: string;
  brand_domain: string | null;
  created_date: string;
  product_name: string;
  product_sku: string | null;
  gtin: string | null;
  is_kit: boolean;
  active: boolean;
  product_supplier: string | null;
  country_of_origin: string | null;
  harmonized_code: string | null;
  product_external_url: string | null;
  inventory_item_id: string;
  unit_quantity: number;
  supplier_name: string;
  unit_cost: number | null;
  supplier_external_id: string | null;
  updated_date: string | null;
}

interface ShipmentData {
  company_url: string;
  shipment_id: string;
  brand_id: string | null;
  brand_name: string;
  brand_domain: string | null;
  created_date: string;
  purchase_order_number: string | null;
  status: string;
  supplier: string | null;
  expected_arrival_date: string | null;
  warehouse_id: string | null;
  ship_from_city: string | null;
  ship_from_state: string | null;
  ship_from_postal_code: string | null;
  ship_from_country: string | null;
  external_system_url: string | null;
  inventory_item_id: string;
  sku: string | null;
  expected_quantity: number;
  received_quantity: number;
  unit_cost: number | null;
  external_id: string | null;
  receipt_id: string;
  arrival_date: string;
  receipt_inventory_item_id: string;
  receipt_quantity: number;
  tracking_number: string[];
  notes: string;
}

interface TinyBirdResponse<T> {
  meta: Array<{
    name: string;
    type: string;
  }>;
  data: T[];
}

/**
 * This part of the code creates warehouse naming mapping following the hybrid approach
 * Provides business-friendly warehouse names while maintaining data traceability
 */
function getWarehouseName(supplierName: string | null): string {
  const warehouseMapping: Record<string, string> = {
    'Jackson-Tran': 'Distribution Center Alpha (Jackson-Tran)',
    'Hill Group': 'Fulfillment Hub Beta (Hill Group)',
    'Morton Group': 'Logistics Center Gamma (Morton)',
    'Rowe-Pearson': 'Operations Center Delta (Rowe-Pearson)',
    'Ramirez-Davies': 'Supply Chain Hub Epsilon (Ramirez-Davies)',
    'Clark-Davis': 'Distribution Center Zeta (Clark-Davis)',
    'Huang, Smith and Navarro': 'Fulfillment Hub Eta (Huang Smith)',
    'Maddox, Matthews and Garcia': 'Logistics Center Theta (Maddox Matthews)',
    'Grant, Wiley and Byrd': 'Operations Center Iota (Grant Wiley)',
    'Ruiz PLC': 'Distribution Center Kappa (Ruiz PLC)',
  };

  return warehouseMapping[supplierName || ''] || `Warehouse ${supplierName || 'Unknown'}`;
}

/**
 * This part of the code calculates comprehensive warehouse performance metrics
 * Uses the same calculation patterns as existing supplier and inventory analysis
 */
function calculateWarehouseData(products: ProductData[], shipments: ShipmentData[]) {
  // This part of the code groups shipments by warehouse_id to aggregate performance data
  const warehouseGroups = new Map<string, {
    supplierName: string;
    shipments: ShipmentData[];
    products: ProductData[];
    location: { city: string | null; state: string | null; country: string | null };
  }>();

  // Group shipments by warehouse_id
  shipments.forEach(shipment => {
    if (!shipment.warehouse_id) return;

    if (!warehouseGroups.has(shipment.warehouse_id)) {
      warehouseGroups.set(shipment.warehouse_id, {
        supplierName: shipment.supplier || 'Unknown Supplier',
        shipments: [],
        products: [],
        location: {
          city: shipment.ship_from_city,
          state: shipment.ship_from_state,
          country: shipment.ship_from_country
        }
      });
    }

    warehouseGroups.get(shipment.warehouse_id)!.shipments.push(shipment);
  });

  // Associate products with warehouses through shipments
  products.forEach(product => {
    const relatedShipments = shipments.filter(s => s.inventory_item_id === product.inventory_item_id);
    relatedShipments.forEach(shipment => {
      if (shipment.warehouse_id && warehouseGroups.has(shipment.warehouse_id)) {
        const existing = warehouseGroups.get(shipment.warehouse_id)!.products.find(p => p.product_id === product.product_id);
        if (!existing) {
          warehouseGroups.get(shipment.warehouse_id)!.products.push(product);
        }
      }
    });
  });

  // This part of the code calculates performance metrics for each warehouse
  const warehousesData: any[] = [];

  warehouseGroups.forEach((data, warehouseId) => {
    const { supplierName, shipments: warehouseShipments, products: warehouseProducts, location } = data;

    // Calculate SLA Performance (on-time shipment percentage)
    const onTimeShipments = warehouseShipments.filter(s => {
      if (!s.expected_arrival_date || !s.arrival_date) return false;
      const expected = new Date(s.expected_arrival_date);
      const actual = new Date(s.arrival_date);
      return actual <= expected;
    }).length;
    const slaPerformance = warehouseShipments.length > 0 ? (onTimeShipments / warehouseShipments.length) * 100 : 0;

    // Calculate Active Orders (processing/in-transit status)
    const activeOrders = warehouseShipments.filter(s => 
      s.status.toLowerCase().includes('processing') || 
      s.status.toLowerCase().includes('in-transit') ||
      s.status.toLowerCase().includes('pending')
    ).length;

    // Calculate Average Fulfillment Time
    const fulfillmentTimes = warehouseShipments
      .filter(s => s.created_date && s.arrival_date)
      .map(s => {
        const created = new Date(s.created_date);
        const arrived = new Date(s.arrival_date);
        return (arrived.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
      });
    const avgFulfillmentTime = fulfillmentTimes.length > 0 
      ? fulfillmentTimes.reduce((sum, time) => sum + time, 0) / fulfillmentTimes.length 
      : 0;

    // Calculate Total SKUs
    const totalSKUs = warehouseProducts.length;

    // Calculate Monthly Throughput (received quantity over time period)
    const totalThroughput = warehouseShipments.reduce((sum, s) => sum + s.received_quantity, 0);

    // Determine Status based on SLA performance
    let status: "Excellent" | "Good" | "Needs Attention";
    if (slaPerformance >= 95) status = "Excellent";
    else if (slaPerformance >= 85) status = "Good";
    else status = "Needs Attention";

    // Calculate Performance Score (composite metric)
    const performanceScore = Math.round(
      (slaPerformance * 0.4) + // 40% weight on SLA
      (Math.min(totalThroughput / 100, 100) * 0.3) + // 30% weight on throughput (normalized)
      (Math.min((48 / Math.max(avgFulfillmentTime, 1)) * 100, 100) * 0.3) // 30% weight on speed (normalized to 48h target)
    );

    warehousesData.push({
      warehouseId,
      warehouseName: getWarehouseName(supplierName),
      supplierName,
      slaPerformance: Math.round(slaPerformance * 10) / 10,
      activeOrders,
      avgFulfillmentTime: Math.round(avgFulfillmentTime * 10) / 10,
      totalSKUs,
      throughput: totalThroughput,
      status,
      performanceScore,
      location
    });
  });

  return warehousesData.sort((a, b) => b.performanceScore - a.performanceScore);
}

/**
 * This part of the code calculates warehouse KPIs following existing dashboard patterns
 */
function calculateWarehouseKPIs(warehouses: any[]) {
  if (warehouses.length === 0) {
    return {
      avgSLAPercentage: null,
      totalActiveOrders: null,
      avgFulfillmentTime: null,
      totalInboundThroughput: null,
    };
  }

  const avgSLAPercentage = warehouses.reduce((sum, w) => sum + w.slaPerformance, 0) / warehouses.length;
  const totalActiveOrders = warehouses.reduce((sum, w) => sum + w.activeOrders, 0);
  const avgFulfillmentTime = warehouses.reduce((sum, w) => sum + w.avgFulfillmentTime, 0) / warehouses.length;
  const totalInboundThroughput = warehouses.reduce((sum, w) => sum + w.throughput, 0);

  return {
    avgSLAPercentage: Math.round(avgSLAPercentage * 10) / 10,
    totalActiveOrders,
    avgFulfillmentTime: Math.round(avgFulfillmentTime * 10) / 10,
    totalInboundThroughput,
  };
}

/**
 * This part of the code generates AI-powered warehouse insights
 */
function generateWarehouseInsights(warehouses: any[], kpis: any) {
  const insights = [];
  
  // This part of the code creates performance-based insights
  const poorPerformers = warehouses.filter(w => w.status === "Needs Attention");
  if (poorPerformers.length > 0) {
    const totalImpact = poorPerformers.reduce((sum, w) => sum + (w.throughput * 50), 0);
    
    insights.push({
      id: `warehouse-performance-${Date.now()}`,
      title: "Warehouse Performance Issues Detected",
      description: `${poorPerformers.length} warehouse${poorPerformers.length > 1 ? 's' : ''} showing suboptimal performance. ${poorPerformers.map(w => w.warehouseName).join(', ')} require immediate attention to improve SLA metrics and operational efficiency.`,
      severity: "critical",
      dollarImpact: totalImpact,
      suggestedActions: [
        "Review operational procedures at underperforming warehouses",
        "Implement performance monitoring dashboards",
        "Consider staff training or resource reallocation",
        "Analyze root causes of fulfillment delays"
      ],
      createdAt: new Date().toISOString(),
      source: "warehouse_agent"
    });
  }

  // This part of the code creates SLA-based insights
  if (kpis.avgSLAPercentage && kpis.avgSLAPercentage < 90) {
    insights.push({
      id: `warehouse-sla-${Date.now()}`,
      title: "Overall SLA Performance Below Target",
      description: `Average SLA performance across all warehouses is ${kpis.avgSLAPercentage.toFixed(1)}%, below the recommended 90% threshold. This indicates systemic issues in fulfillment processes that require strategic intervention.`,
      severity: "warning",
      dollarImpact: Math.round((kpis.totalInboundThroughput || 0) * 25),
      suggestedActions: [
        "Implement automated SLA monitoring systems",
        "Review and optimize fulfillment workflows",
        "Establish performance benchmarks and targets",
        "Consider supplier/warehouse partnership improvements"
      ],
      createdAt: new Date().toISOString(),
      source: "warehouse_agent"
    });
  }

  return insights;
}

/**
 * This part of the code calculates performance rankings for warehouse comparison
 */
function calculatePerformanceRankings(warehouses: any[]) {
  return warehouses
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .map((warehouse, index) => ({
      rank: index + 1,
      warehouseId: warehouse.warehouseId,
      warehouseName: warehouse.warehouseName,
      slaPerformance: warehouse.slaPerformance,
      activeOrders: warehouse.activeOrders,
      avgFulfillmentTime: warehouse.avgFulfillmentTime,
      status: warehouse.status
    }));
}

/**
 * This part of the code generates smart budget allocation recommendations
 */
function generateBudgetAllocations(warehouses: any[]) {
  const baseBudgetPerUnit = 100;
  
  return warehouses.map(warehouse => {
    const currentBudget = warehouse.throughput * baseBudgetPerUnit;
    const performanceMultiplier = warehouse.performanceScore / 100;
    const efficiencyBonus = warehouse.status === "Excellent" ? 1.2 : 
                           warehouse.status === "Good" ? 1.0 : 0.8;
    
    const recommendedBudget = Math.round(currentBudget * performanceMultiplier * efficiencyBonus);
    const changeAmount = recommendedBudget - currentBudget;
    const changePercentage = currentBudget > 0 ? (changeAmount / currentBudget) * 100 : 0;
    
    const expectedROI = warehouse.status === "Excellent" ? 15 : 
                       warehouse.status === "Good" ? 10 : 25;
    
    let justification = "";
    if (changePercentage > 10) {
      justification = `High-performing warehouse with ${warehouse.slaPerformance}% SLA. Increased investment will maximize returns through capacity expansion.`;
    } else if (changePercentage < -10) {
      justification = `Underperforming warehouse needs operational improvements before additional investment. Focus on efficiency gains first.`;
    } else {
      justification = `Well-balanced warehouse maintaining optimal performance. Budget allocation supports steady operational excellence.`;
    }
    
    const riskLevel = warehouse.status === "Needs Attention" ? "High" : 
                     warehouse.status === "Good" ? "Medium" : "Low";

    return {
      warehouseId: warehouse.warehouseId,
      warehouseName: warehouse.warehouseName,
      currentBudget,
      recommendedBudget,
      changeAmount,
      changePercentage: Math.round(changePercentage * 10) / 10,
      expectedROI,
      justification,
      riskLevel,
      performanceScore: warehouse.performanceScore
    };
  }).sort((a, b) => b.expectedROI - a.expectedROI);
}

/**
 * This part of the code generates simulated user behavior analysis
 */
function generateUserBehaviorAnalysis(warehouses: any[]) {
  return warehouses.slice(0, 4).map(warehouse => {
    const baseEngagement = warehouse.performanceScore;
    const viewFrequency = Math.round(baseEngagement / 10) + Math.floor(Math.random() * 5);
    const timeSpent = Math.round((baseEngagement / 100) * 30) + Math.floor(Math.random() * 10);
    const engagementScore = Math.round((viewFrequency * 10 + timeSpent * 2) / 12);
    
    const commonActions = [
      "View performance metrics",
      "Check SLA reports", 
      "Review throughput data",
      "Analyze cost reports",
      "Export performance data"
    ].slice(0, 3 + Math.floor(Math.random() * 3));
    
    const nextBestAction = warehouse.status === "Needs Attention" 
      ? "Review operational bottlenecks and improvement opportunities"
      : "Explore capacity expansion and optimization strategies";
    
    const personalizedTips = [
      `Set up automated alerts for ${warehouse.warehouseName} SLA performance`,
      `Consider benchmarking against top performer best practices`,
      `Schedule quarterly review of warehouse operational metrics`
    ];

    return {
      warehouseId: warehouse.warehouseId,
      warehouseName: warehouse.warehouseName,
      viewFrequency,
      timeSpent,
      engagementScore,
      commonActions,
      nextBestAction,
      personalizedTips
    };
  });
}

/**
 * This part of the code generates performance optimization recommendations
 */
function generateOptimizationRecommendations(warehouses: any[]) {
  return warehouses.map(warehouse => {
    const opportunities = [];
    
    if (warehouse.slaPerformance < 95) {
      opportunities.push({
        area: "SLA Performance",
        priority: warehouse.slaPerformance < 80 ? "High" : "Medium",
        currentValue: warehouse.slaPerformance,
        targetValue: 95,
        investment: 25000,
        potentialSavings: 50000,
        timeline: "3-6 months"
      });
    }
    
    if (warehouse.throughput < 1000) {
      opportunities.push({
        area: "Throughput Capacity",
        priority: "Medium",
        currentValue: warehouse.throughput,
        targetValue: Math.round(warehouse.throughput * 1.5),
        investment: 40000,
        potentialSavings: 75000,
        timeline: "6-12 months"
      });
    }
    
    if (warehouse.avgFulfillmentTime > 48) {
      opportunities.push({
        area: "Fulfillment Speed",
        priority: warehouse.avgFulfillmentTime > 72 ? "High" : "Medium",
        currentValue: warehouse.avgFulfillmentTime,
        targetValue: 24,
        investment: 15000,
        potentialSavings: 35000,
        timeline: "2-4 months"
      });
    }

    const totalInvestment = opportunities.reduce((sum, opp) => sum + opp.investment, 0);
    const potentialSavings = opportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0);
    const roiPercentage = totalInvestment > 0 ? Math.round(((potentialSavings - totalInvestment) / totalInvestment) * 100) : 0;
    
    return {
      warehouseId: warehouse.warehouseId,
      warehouseName: warehouse.warehouseName,
      roiPercentage,
      riskLevel: warehouse.status === "Needs Attention" ? "High" : 
                 warehouse.status === "Good" ? "Medium" : "Low",
      performanceMetrics: {
        slaPerformance: warehouse.slaPerformance,
        throughput: warehouse.throughput,
        efficiency: Math.round((warehouse.performanceScore / 100) * 90 + 10),
        capacityUsage: Math.round(Math.min((warehouse.throughput / 2000) * 100, 100))
      },
      opportunities,
      totalInvestment,
      potentialSavings,
      timeline: opportunities.length > 0 ? "2-12 months" : "No immediate changes needed"
    };
  });
}

async function fetchProductsInternal() {
  const baseUrl = process.env.TINYBIRD_BASE_URL!;
  const token = process.env.TINYBIRD_TOKEN!;
  const url = `${baseUrl}?token=${token}&limit=100&company_url=COMP002_packiyo`;
  
  console.log("🏭 Server: Fetching products from product_details_mv API with COMP002_packiyo filter");
  
  const response = await fetch(url);
  if (!response.ok) throw new Error("TinyBird Products API Error");
  const result: TinyBirdResponse<ProductData> = await response.json();
  return { data: result.data };
}

async function fetchShipmentsInternal() {
  const baseUrl = process.env.WAREHOUSE_BASE_URL!;
  const token = process.env.WAREHOUSE_TOKEN!;
  const url = `${baseUrl}?token=${token}&limit=150&company_url=COMP002_3PL`;
  
  console.log("🏭 Server: Fetching shipments from inbound_shipments_details_mv API with COMP002_3PL filter");
  
  const response = await fetch(url);
  if (!response.ok) throw new Error("TinyBird Shipments API Error");
  const result: TinyBirdResponse<ShipmentData> = await response.json();
  return { data: result.data };
}

/**
 * Main warehouse data endpoint
 * This part of the code orchestrates all warehouse analytics and returns comprehensive data
 */
export const getWarehousesData: RequestHandler = async (_req, res) => {
  try {
    console.log("🏭 Server: Starting comprehensive warehouse data fetch...");

    const [productsResult, shipmentsResult] = await Promise.all([
      fetchProductsInternal(),
      fetchShipmentsInternal(),
    ]);

    const products = productsResult.data;
    const shipments = shipmentsResult.data;

    console.log(`🏭 Server: Fetched ${products.length} products and ${shipments.length} shipments`);

    // This part of the code calculates all warehouse analytics
    const warehouses = calculateWarehouseData(products, shipments);
    const kpis = calculateWarehouseKPIs(warehouses);
    const insights = generateWarehouseInsights(warehouses, kpis);
    const performanceRankings = calculatePerformanceRankings(warehouses);
    const budgetAllocations = generateBudgetAllocations(warehouses);
    const userBehavior = generateUserBehaviorAnalysis(warehouses);
    const optimizations = generateOptimizationRecommendations(warehouses);

    const warehousesData = {
      warehouses,
      kpis,
      insights,
      performanceRankings,
      budgetAllocations,
      userBehavior,
      optimizations,
      lastUpdated: new Date().toISOString(),
    };

    console.log(`✅ Server: Generated data for ${warehouses.length} warehouses with ${insights.length} insights`);

    res.json({
      success: true,
      data: warehousesData,
      count: warehouses.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("❌ Server: Warehouse data fetch failed:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch warehouse data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
