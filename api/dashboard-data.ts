import type { VercelRequest, VercelResponse } from "@vercel/node";

// Inlined types and utilities to resolve Vercel import issues
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

// Inlined API config
const API_LIMITS = {
  PRODUCTS: 500,
  SHIPMENTS: 500,
  REPORTS: 1000,
  DEV_PRODUCTS: 100,
  DEV_SHIPMENTS: 150,
} as const;

function getApiLimits() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return {
    products: isDevelopment ? API_LIMITS.DEV_PRODUCTS : API_LIMITS.PRODUCTS,
    shipments: isDevelopment ? API_LIMITS.DEV_SHIPMENTS : API_LIMITS.SHIPMENTS,
    reports: API_LIMITS.REPORTS,
  };
}

function buildProductsUrl(baseUrl: string, token: string, companyUrl: string, brandId?: string): string {
  const limits = getApiLimits();
  let url = `${baseUrl}?token=${token}&limit=${limits.products}&company_url=${companyUrl}`;
  if (brandId) {
    url += `&brand_id=${brandId}`;
  }
  return url;
}

function buildShipmentsUrl(baseUrl: string, token: string, companyUrl: string): string {
  const limits = getApiLimits();
  return `${baseUrl}?token=${token}&limit=${limits.shipments}&company_url=${companyUrl}`;
}

const COMPANY_CONFIG = {
  PRODUCTS_COMPANY: process.env.COMPANY_PRODUCTS_URL || 'COMP002_packiyo',
  WAREHOUSE_COMPANY: process.env.COMPANY_WAREHOUSE_URL || 'COMP002_3PL',
  DEFAULT_BRAND_ID: process.env.DEFAULT_BRAND_ID || '561bdd14-630a-4a0c-9493-50a513bbb946',
} as const;

// Simplified logger for production
const logger = {
  info: (message: string, context?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, context || '');
    }
  },
  error: (message: string, error?: Error, context?: any) => {
    console.error(`[ERROR] ${message}`, error, context || '');
  },
  debug: (message: string, context?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  }
};

const logApiCall = (endpoint: string, method: string) => {
  return async <T>(fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      logger.info(`API ${method} ${endpoint} (${duration.toFixed(2)}ms)`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`API ${method} ${endpoint} failed (${duration.toFixed(2)}ms)`, error as Error);
      throw error;
    }
  };
};

/**
 * This part of the code standardizes the data interfaces to match the server implementation
 * Ensuring consistency between local development and Vercel production environments
 */



/**
 * This part of the code fetches products data from TinyBird API using standardized parameters
 * Matches the server implementation to ensure consistent data structure
 */
async function fetchProducts(): Promise<ProductData[]> {
  const baseUrl = process.env.TINYBIRD_BASE_URL;
  const token = process.env.TINYBIRD_TOKEN;

  if (!baseUrl || !token) {
    throw new Error(
      "TINYBIRD_BASE_URL and TINYBIRD_TOKEN environment variables are required",
    );
  }

  // This part of the code fetches from product_details_mv API with centralized config
  const url = buildProductsUrl(baseUrl, token, COMPANY_CONFIG.PRODUCTS_COMPANY);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * This part of the code fetches shipments data from TinyBird API using standardized parameters
 * Matches the server implementation to ensure consistent data structure
 */
async function fetchShipments(): Promise<ShipmentData[]> {
  const baseUrl = process.env.WAREHOUSE_BASE_URL;
  const token = process.env.WAREHOUSE_TOKEN;

  if (!baseUrl || !token) {
    throw new Error(
      "WAREHOUSE_BASE_URL and WAREHOUSE_TOKEN environment variables are required",
    );
  }

  // This part of the code fetches from inbound_shipments_details_mv API with centralized config
  const url = buildShipmentsUrl(baseUrl, token, COMPANY_CONFIG.WAREHOUSE_COMPANY);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * This part of the code calculates real financial impact from operational data
 * Uses actual unit costs and quantity discrepancies for accurate dollar amounts
 */
function calculateFinancialImpacts(products: ProductData[], shipments: ShipmentData[]) {
  // Calculate impact from quantity discrepancies
  const quantityDiscrepancyImpact = shipments
    .filter(s => s.expected_quantity !== s.received_quantity && s.unit_cost)
    .reduce((sum, shipment) => {
      const quantityDiff = Math.abs(shipment.expected_quantity - shipment.received_quantity);
      return sum + (quantityDiff * (shipment.unit_cost || 0));
    }, 0);

  // Calculate impact from cancelled shipments
  const cancelledShipmentsImpact = shipments
    .filter(s => s.status === "cancelled" && s.unit_cost)
    .reduce((sum, shipment) => {
      return sum + (shipment.expected_quantity * (shipment.unit_cost || 0));
    }, 0);

  // Calculate lost revenue from inactive products
  const inactiveProductsValue = products
    .filter(p => !p.active && p.unit_cost)
    .reduce((sum, product) => {
      // Estimate monthly lost revenue potential
      return sum + ((product.unit_cost || 0) * product.unit_quantity * 30);
    }, 0);

  // Calculate total inventory value at risk
  const atRiskInventoryValue = shipments
    .filter(s => s.expected_quantity !== s.received_quantity || s.status === "cancelled")
    .reduce((sum, shipment) => {
      return sum + (shipment.received_quantity * (shipment.unit_cost || 0));
    }, 0);

  return {
    quantityDiscrepancyImpact: Math.round(quantityDiscrepancyImpact),
    cancelledShipmentsImpact: Math.round(cancelledShipmentsImpact),
    inactiveProductsValue: Math.round(inactiveProductsValue),
    atRiskInventoryValue: Math.round(atRiskInventoryValue),
    totalFinancialRisk: Math.round(quantityDiscrepancyImpact + cancelledShipmentsImpact + inactiveProductsValue)
  };
}

// Safe formatters to prevent null reference crashes - inline to avoid import issues
function safeCleanMarkdown(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\*/g, '')
    .replace(/^Executive Summary:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function safeDollarFormat(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  return text
    .replace(/\$([0-9,]+)\.00impact/g, '$$$1 impact')
    .replace(/\$([0-9,]+\.[0-9]{1,2})impact/g, '$$$1 impact')
    .replace(/\$([0-9,]+)impact/g, '$$$1 impact')
    .replace(/\$([0-9,]+)\.00\s+impact/g, '$$$1 impact');
}

function safeFormatAIText(text: string | null | undefined): string {
  return safeDollarFormat(safeCleanMarkdown(text));
}

/**
 * This part of the code generates AI insights using real financial data
 * Matches the server implementation calculations for consistent results
 */
interface InsightData {
  type: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  dollarImpact?: number;
}

async function generateInsights(
  products: ProductData[],
  shipments: ShipmentData[],
): Promise<InsightData[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OpenAI API key not available - no dashboard insights generated');
    return []; // Return empty array - UI will show "Check OpenAI Connection"
  }

  try {
    const financialImpacts = calculateFinancialImpacts(products, shipments);
    
    // This part of the code calculates enhanced operational intelligence metrics
    const atRiskShipments = shipments.filter(s => s.expected_quantity !== s.received_quantity).length;
    const cancelledShipments = shipments.filter(s => s.status === "cancelled").length;
    const inactiveProducts = products.filter(p => !p.active).length;
    const activeProducts = products.filter(p => p.active).length;
    const totalShipmentValue = shipments.reduce((sum, s) => sum + (s.received_quantity * (s.unit_cost || 0)), 0);
    
    // Enhanced analytics calculations
    const uniqueBrands = new Set(products.map(p => p.brand_name)).size;
    const uniqueSuppliers = new Set(products.map(p => p.supplier_name)).size;
    const skuUtilization = activeProducts / products.length * 100;
    const onTimeShipments = shipments.filter(s => s.status === "completed" || s.status === "delivered").length;
    const delayedShipments = shipments.filter(s => s.status.includes("delayed") || s.status === "late").length;
    const quantityAccuracy = shipments.length > 0 ? (shipments.filter(s => s.expected_quantity === s.received_quantity).length / shipments.length) * 100 : 100;
    const avgOrderValue = totalShipmentValue / shipments.length;
    const costPerShipment = totalShipmentValue / shipments.length;
    
    // Geographic and supplier risk analysis
    const geoRiskCountries = shipments.filter(s => s.ship_from_country && ['China', 'Russia', 'Ukraine', 'Taiwan'].includes(s.ship_from_country)).length;
    const geoRiskPercent = shipments.length > 0 ? (geoRiskCountries / shipments.length) * 100 : 0;
    const topRiskCountries = Array.from(new Set(shipments.filter(s => s.ship_from_country && ['China', 'Russia', 'Ukraine', 'Taiwan'].includes(s.ship_from_country)).map(s => s.ship_from_country))).slice(0, 3);
    
    // Supplier concentration analysis
    const supplierCounts = shipments.reduce((acc, s) => {
      const supplier = s.supplier || 'Unknown';
      acc[supplier] = (acc[supplier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topSuppliers = Object.entries(supplierCounts).sort(([,a], [,b]) => b - a).slice(0, 3);
    const supplierConcentration = topSuppliers.reduce((sum, [,count]) => sum + count, 0) / shipments.length * 100;
    
    const openaiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
    const response = await fetch(openaiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `You are a senior 3PL operations analyst. Analyze this comprehensive logistics data and provide strategic insights with quantified financial impact.

OPERATIONAL INTELLIGENCE:
=========================

INVENTORY & PRODUCT ANALYSIS:
- Total Products: ${products.length} (${activeProducts} active, ${inactiveProducts} inactive)
- Product Diversity: ${uniqueBrands} brands across ${uniqueSuppliers} suppliers
- SKU Utilization: ${skuUtilization.toFixed(1)}% active portfolio
- Inactive Product Value: $${financialImpacts.inactiveProductsValue.toLocaleString()}/month lost opportunity

SHIPMENT & FULFILLMENT PERFORMANCE:
- Total Shipments: ${shipments.length} (${onTimeShipments} on-time, ${delayedShipments} delayed)
- Quantity Accuracy: ${quantityAccuracy.toFixed(1)}% (${atRiskShipments} with variances)
- Financial Impact of Delays: $${financialImpacts.quantityDiscrepancyImpact.toLocaleString()}
- Cancelled Shipment Impact: $${financialImpacts.cancelledShipmentsImpact.toLocaleString()}

RISK & FINANCIAL EXPOSURE:
- At-Risk Shipment Value: $${Math.round(totalShipmentValue).toLocaleString()}
- Geographic Risk Concentration: ${geoRiskPercent.toFixed(1)}% from ${topRiskCountries.join(', ')}
- Supplier Concentration Risk: ${supplierConcentration.toFixed(1)}% (top 3 suppliers)
- Total Financial Risk: $${financialImpacts.totalFinancialRisk.toLocaleString()}

EFFICIENCY & OPTIMIZATION OPPORTUNITIES:
- Average Order Value: $${avgOrderValue.toFixed(2)}
- Cost Per Shipment: $${costPerShipment.toFixed(2)}
- Processing Efficiency: ${quantityAccuracy.toFixed(1)}% accuracy rate
- Portfolio Optimization: ${((inactiveProducts / products.length) * 100).toFixed(1)}% inactive SKUs

PROVIDE STRATEGIC ANALYSIS (2-4 insights based on data significance):
Focus on the most critical operational issues with >$50K impact potential.

Each insight must include:
- Specific dollar impact (calculated from real data)
- Timeline for implementation (30/60/90 days)
- Success metrics to track progress
- Actionable next steps (1-4 actions based on complexity)

FORMAT AS ACTIONABLE JSON:
[
  {
    "type": "warning",
    "title": "Strategic Issue Title",
    "description": "Detailed analysis with financial impact, timeline, and specific recommendations for operational improvement",
    "severity": "critical|warning|info",
    "dollarImpact": actual_calculated_dollar_amount,
    "suggestedActions": ["Review supplier contracts with XYZ Corp", "Implement inventory cycle counting for inactive SKUs", "Schedule leadership review of geographic risk exposure"]
  }
]

CRITICAL: suggestedActions must be:
- Specific, actionable tasks (not generic placeholders)
- Ordered by priority (most important first, least important last)
- Relevant to the actual data analyzed
- Between 1-4 actions based on insight complexity
- Include specific company names, SKU categories, or process names when available`,
          },
        ],
        max_tokens: 800,
        temperature: 0.2,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        return JSON.parse(content);
      }
    }
  } catch (error) {
    console.error("OpenAI analysis failed:", error);
  }

  // NO FALLBACK DATA - Return empty array if AI fails
  // Frontend will display "Check OpenAI Connection" message
  return [];
}

/**
 * This part of the code analyzes real margin risks using actual brand and cost data
 * Calculates risk factors based on brand performance, SKU complexity, and cost pressures
 */
interface MarginRiskAlert {
  brandName: string;
  currentMargin: number;
  riskLevel: "High" | "Medium" | "Low";
  riskScore: number;
  primaryDrivers: string[];
  financialImpact: number;
  skuCount: number;
  avgUnitCost: number;
  inactivePercentage: number;
}

function calculateMarginRisks(products: ProductData[], shipments: ShipmentData[]): MarginRiskAlert[] {
  // This part of the code groups products by brand for real margin analysis
  const brandGroups = new Map<string, {
    products: ProductData[];
    shipments: ShipmentData[];
    totalValue: number;
    avgCost: number;
  }>();

  // Group products by brand with real data
  products.forEach(product => {
    const brandName = product.brand_name || 'Unknown Brand';
    if (!brandGroups.has(brandName)) {
      brandGroups.set(brandName, {
        products: [],
        shipments: [],
        totalValue: 0,
        avgCost: 0
      });
    }
    brandGroups.get(brandName)!.products.push(product);
  });

  // Associate shipments with brands
  shipments.forEach(shipment => {
    const brandName = shipment.brand_name || 'Unknown Brand';
    if (brandGroups.has(brandName)) {
      brandGroups.get(brandName)!.shipments.push(shipment);
    }
  });

  // This part of the code calculates real risk factors for each brand
  const marginRisks: MarginRiskAlert[] = [];
  
  brandGroups.forEach((data, brandName) => {
    if (data.products.length === 0) return;

    const avgUnitCost = data.products
      .filter(p => p.unit_cost !== null)
      .reduce((sum, p) => sum + (p.unit_cost || 0), 0) / data.products.filter(p => p.unit_cost !== null).length;
    
    const skuCount = data.products.length;
    const inactiveCount = data.products.filter(p => !p.active).length;
    const inactivePercentage = (inactiveCount / skuCount) * 100;
    
    // Calculate real financial impact from brand shipments
    const brandShipmentImpact = data.shipments
      .filter(s => s.expected_quantity !== s.received_quantity && s.unit_cost)
      .reduce((sum, s) => {
        const diff = Math.abs(s.expected_quantity - s.received_quantity);
        return sum + (diff * (s.unit_cost || 0));
      }, 0);

    // This part of the code calculates risk score based on real operational factors
    let riskScore = 0;
    const riskFactors: string[] = [];

    // SKU complexity pressure (more SKUs = higher operational risk)
    if (skuCount > 50) {
      riskScore += 25;
      riskFactors.push("High SKU complexity");
    } else if (skuCount > 20) {
      riskScore += 15;
      riskFactors.push("Moderate SKU complexity");
    }

    // Cost pressure analysis (higher costs = margin pressure)
    if (avgUnitCost > 50) {
      riskScore += 30;
      riskFactors.push("High unit costs");
    } else if (avgUnitCost > 20) {
      riskScore += 15;
      riskFactors.push("Elevated unit costs");
    }

    // Inactive inventory pressure
    if (inactivePercentage > 30) {
      riskScore += 25;
      riskFactors.push("High inactive inventory");
    } else if (inactivePercentage > 15) {
      riskScore += 10;
      riskFactors.push("Growing inactive inventory");
    }

    // Shipment performance pressure
    if (brandShipmentImpact > 5000) {
      riskScore += 20;
      riskFactors.push("Shipment discrepancies");
    }

    // Only include brands with meaningful risk
    if (riskScore > 0 && data.products.length > 5) {
      const currentMargin = Math.max(0, 100 - (avgUnitCost / 100 * 100)); // Simplified margin calculation
      
      marginRisks.push({
        brandName,
        currentMargin: Math.round(currentMargin),
        riskLevel: riskScore >= 60 ? "High" : riskScore >= 30 ? "Medium" : "Low",
        riskScore,
        primaryDrivers: riskFactors,
        financialImpact: Math.round(brandShipmentImpact + (inactiveCount * avgUnitCost * 12)), // Annual impact estimate
        skuCount,
        avgUnitCost: Math.round(avgUnitCost),
        inactivePercentage: Math.round(inactivePercentage)
      });
    }
  });

  // Return top risk brands, sorted by risk score
  return marginRisks
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5); // Limit to top 5 risk brands
}

/**
 * This part of the code detects real cost variances in shipment data
 * Analyzes unit costs across suppliers and warehouses to identify anomalies
 */
interface CostVarianceAnomaly {
  type: "Cost Spike" | "Quantity Discrepancy" | "Supplier Variance";
  title: string;
  description: string;
  severity: "High" | "Medium";
  warehouseId: string | null;
  supplier: string | null;
  currentValue: number;
  expectedValue: number;
  variance: number;
  riskFactors: string[];
  financialImpact: number;
  // Optional MA context fields (backward compatible)
  trendContext?: string;
  adaptiveThreshold?: number;
  maBaseline?: number;
}

function detectCostVariances(products: ProductData[], shipments: ShipmentData[]): CostVarianceAnomaly[] {
  const anomalies: CostVarianceAnomaly[] = [];

  // This part of the code calculates enhanced baseline costs using moving averages for adaptive thresholds
  const supplierBaselines = new Map<string, { 
    avgCost: number; 
    shipmentCount: number; 
    costHistory: number[];
    emaBaseline: number;
    adaptiveThreshold: number;
    confidence: number;
  }>();
  
  // This part of the code groups shipments by supplier and calculates cost history
  const supplierShipments = new Map<string, ShipmentData[]>();
  shipments.forEach(shipment => {
    if (!shipment.unit_cost || !shipment.supplier) return;
    
    if (!supplierShipments.has(shipment.supplier)) {
      supplierShipments.set(shipment.supplier, []);
    }
    supplierShipments.get(shipment.supplier)!.push(shipment);
  });

  // This part of the code calculates adaptive baselines using EMA for each supplier
  supplierShipments.forEach((shipments, supplier) => {
    // Sort by date to get chronological cost history
    const sortedShipments = shipments.sort((a, b) => 
      new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
    );
    
    const costHistory = sortedShipments.map(s => s.unit_cost!);
    const avgCost = costHistory.reduce((sum, cost) => sum + cost, 0) / costHistory.length;

    // This part of the code calculates adaptive thresholds using our moving averages utility
    let emaBaseline = avgCost;
    let adaptiveThreshold = avgCost * 1.4; // Default 40% threshold
    let confidence = 50;

    try {
      // Import our moving averages utility safely for serverless
      const { calculateAdaptiveThreshold } = require('../../lib/movingAverages');
      
      const thresholdData = calculateAdaptiveThreshold(costHistory, 14, 1.25);
      if (thresholdData.baseline > 0) {
        emaBaseline = thresholdData.baseline;
        adaptiveThreshold = thresholdData.upperThreshold;
        confidence = thresholdData.confidence;
      }
    } catch (error) {
      console.warn('Adaptive threshold calculation failed for supplier', supplier, ':', error);
      // Fallback to static calculation
    }

    supplierBaselines.set(supplier, {
      avgCost,
      shipmentCount: costHistory.length,
      costHistory,
      emaBaseline,
      adaptiveThreshold,
      confidence,
    });
  });

  // This part of the code detects cost spikes using adaptive thresholds
  shipments.forEach(shipment => {
    if (!shipment.unit_cost || !shipment.supplier) return;
    
    const baseline = supplierBaselines.get(shipment.supplier);
    if (!baseline || baseline.shipmentCount < 3) return; // Need sufficient baseline data
    
    // This part of the code uses adaptive threshold instead of static 40%
    const isAdaptiveAnomaly = shipment.unit_cost > baseline.adaptiveThreshold;
    const staticVariance = Math.abs(shipment.unit_cost - baseline.avgCost) / baseline.avgCost;
    const adaptiveVariance = Math.abs(shipment.unit_cost - baseline.emaBaseline) / baseline.emaBaseline;
    
    // This part of the code triggers alert if either adaptive or static threshold is exceeded
    if (isAdaptiveAnomaly || staticVariance > 0.4) {
      const financialImpact = Math.abs(shipment.unit_cost - baseline.emaBaseline) * shipment.received_quantity;
      
      if (financialImpact > 1000) { // Only flag significant financial impact
        const trendContext = baseline.confidence > 70 
          ? `High confidence (${baseline.confidence}%) adaptive threshold`
          : `Medium confidence (${baseline.confidence}%) adaptive threshold`;

        anomalies.push({
          type: "Cost Spike",
          title: `${shipment.supplier} Cost Anomaly`,
          description: `Unit cost of $${shipment.unit_cost} exceeds ${isAdaptiveAnomaly ? 'adaptive' : 'static'} threshold of $${Math.round(baseline.adaptiveThreshold)} (EMA baseline: $${Math.round(baseline.emaBaseline)})`,
          severity: adaptiveVariance > 0.8 ? "High" : "Medium",
          warehouseId: shipment.warehouse_id,
          supplier: shipment.supplier,
          currentValue: shipment.unit_cost,
          expectedValue: Math.round(baseline.emaBaseline),
          variance: Math.round(adaptiveVariance * 100),
          riskFactors: [
            adaptiveVariance > 0.8 ? "Extreme cost deviation" : "Significant cost increase",
            financialImpact > 5000 ? "High financial impact" : "Material financial impact",
            isAdaptiveAnomaly ? "Adaptive threshold exceeded" : "Static threshold exceeded"
          ],
          financialImpact: Math.round(financialImpact),
          // This part of the code adds optional moving average context fields
          trendContext,
          adaptiveThreshold: Math.round(baseline.adaptiveThreshold),
          maBaseline: Math.round(baseline.emaBaseline),
        });
      }
    }
  });

  // This part of the code detects quantity discrepancy patterns
  const warehouseDiscrepancies = new Map<string, { discrepancies: number; totalShipments: number; impact: number }>();
  
  shipments.forEach(shipment => {
    if (!shipment.warehouse_id) return;
    
    if (!warehouseDiscrepancies.has(shipment.warehouse_id)) {
      warehouseDiscrepancies.set(shipment.warehouse_id, { discrepancies: 0, totalShipments: 0, impact: 0 });
    }
    
    const data = warehouseDiscrepancies.get(shipment.warehouse_id)!;
    data.totalShipments += 1;
    
    if (shipment.expected_quantity !== shipment.received_quantity) {
      data.discrepancies += 1;
      const diff = Math.abs(shipment.expected_quantity - shipment.received_quantity);
      data.impact += diff * (shipment.unit_cost || 0);
    }
  });

  // Flag warehouses with high discrepancy rates
  warehouseDiscrepancies.forEach((data, warehouseId) => {
    const discrepancyRate = data.discrepancies / data.totalShipments;
    
    if (discrepancyRate > 0.3 && data.impact > 2000 && data.totalShipments > 5) { // 30% discrepancy rate threshold
      anomalies.push({
        type: "Quantity Discrepancy",
        title: `Warehouse ${warehouseId} Processing Issues`,
        description: `${Math.round(discrepancyRate * 100)}% of shipments have quantity discrepancies with $${Math.round(data.impact)} financial impact`,
        severity: discrepancyRate > 0.5 ? "High" : "Medium",
        warehouseId,
        supplier: null,
        currentValue: Math.round(discrepancyRate * 100),
        expectedValue: 5, // 5% expected discrepancy rate
        variance: Math.round((discrepancyRate - 0.05) * 100),
        riskFactors: [
          discrepancyRate > 0.5 ? "Critical processing accuracy" : "Poor processing accuracy",
          data.impact > 10000 ? "High financial impact" : "Material financial impact"
        ],
        financialImpact: Math.round(data.impact)
      });
    }
  });

  // Return anomalies sorted by financial impact
  return anomalies
    .sort((a, b) => b.financialImpact - a.financialImpact)
    .slice(0, 8); // Limit to top 8 most impactful anomalies
}

/**
 * This part of the code generates world-class AI recommendations for cost variance anomalies
 * Uses advanced prompts to provide specific, actionable cost reduction strategies
 */
async function generateCostVarianceRecommendations(
  anomaly: CostVarianceAnomaly,
  contextData: { 
    totalAnomalies: number; 
    avgVariance: number; 
    totalImpact: number;
    supplierCount: number;
    warehouseCount: number;
  }
): Promise<string[]> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    console.warn('🤖 OpenAI API key not available, using fallback cost recommendations');
    return [
      'Review supplier contracts and negotiate volume discounts',
      'Implement cost monitoring alerts for future variances',
      'Establish approval workflows for non-standard pricing',
      'Conduct supplier performance audit and optimization review'
    ];
  }

  // This part of the code creates world-class prompts specific to each cost variance type
  const prompts = {
    'Cost Spike': `COST SPIKE ANALYSIS & MITIGATION:

Current Situation:
- Supplier: ${anomaly.supplier}
- Cost Variance: +${anomaly.variance}% (${anomaly.currentValue} vs expected ${anomaly.expectedValue})
- Financial Impact: $${anomaly.financialImpact.toLocaleString()}
- Risk Factors: ${anomaly.riskFactors.join(', ')}
- Severity: ${anomaly.severity}

Context:
- Total cost anomalies detected: ${contextData.totalAnomalies}
- Network-wide variance average: ${contextData.avgVariance}%
- Total impact across operations: $${contextData.totalImpact.toLocaleString()}

Generate 3-4 specific, immediately actionable cost reduction strategies. Focus on:
1. Immediate cost containment actions
2. Supplier negotiation tactics  
3. Process improvements to prevent recurrence
4. Alternative sourcing strategies

Requirements:
- Each recommendation must be implementable within 30 days
- Include specific cost-saving potential when possible
- Focus on measurable outcomes
- No generic advice - be specific to this cost spike scenario`,

    'Quantity Discrepancy': `QUANTITY DISCREPANCY COST CONTROL:

Warehouse Issue:
- Location: ${anomaly.warehouseId}
- Discrepancy Rate: ${anomaly.currentValue}% (expected: ${anomaly.expectedValue}%)
- Financial Impact: $${anomaly.financialImpact.toLocaleString()}
- Processing Issues: ${anomaly.riskFactors.join(', ')}

Operations Context:
- Multiple warehouses affected: ${contextData.warehouseCount}
- Supply chain variance: ${contextData.avgVariance}%
- Total operational impact: $${contextData.totalImpact.toLocaleString()}

Generate 3-4 operational excellence recommendations focusing on:
1. Immediate process controls to reduce discrepancies
2. Technology solutions for accuracy improvement
3. Training and accountability measures
4. Cost recovery and prevention strategies

Requirements:
- Actionable within 2 weeks for maximum impact
- Include ROI potential for each recommendation
- Address both immediate fixes and long-term prevention
- Specific to warehouse operations and inventory accuracy`,

    'Supplier Variance': `SUPPLIER COST VARIANCE OPTIMIZATION:

Supplier Performance Issue:
- Supplier: ${anomaly.supplier}
- Cost Deviation: ${anomaly.variance}% above baseline
- Expected Cost: $${anomaly.expectedValue} | Actual: $${anomaly.currentValue}
- Financial Impact: $${anomaly.financialImpact.toLocaleString()}

Supply Chain Context:
- Active suppliers in network: ${contextData.supplierCount}
- Average cost variance: ${contextData.avgVariance}%
- Total supplier-related cost impact: $${contextData.totalImpact.toLocaleString()}

Generate 3-4 strategic supplier management recommendations:
1. Contract renegotiation strategies with specific terms
2. Alternative supplier evaluation and onboarding
3. Performance-based pricing mechanisms
4. Supply chain diversification tactics

Requirements:
- Focus on sustainable cost reduction (6+ month impact)
- Include specific negotiation leverage points
- Address supplier relationship management
- Provide implementation timeline and expected savings`
  };

  try {
    const openaiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
    
    const response = await fetch(openaiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a world-class supply chain cost optimization expert with 20+ years of experience in 3PL operations. Provide specific, actionable recommendations that drive measurable cost savings. Each recommendation should be a single, clear action (15-20 words max). No explanations or bullet points - just the actionable steps."
          },
          {
            role: "user", 
            content: prompts[anomaly.type as keyof typeof prompts] || prompts['Cost Spike']
          }
        ],
        max_tokens: 500,
        temperature: 0.2  // Lower temperature for more focused, practical recommendations
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from OpenAI");
    }

    // This part of the code parses AI response into clean, actionable cost recommendations
    const lines = aiResponse.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Remove any formatting characters and numbers
        return line
          .replace(/^\d+\.\s*/, '')    // Remove "1. "
          .replace(/^[•-]\s*/, '')     // Remove "• " or "- "
          .replace(/^\*+/, '')         // Remove asterisks
          .replace(/\*+$/, '')         // Remove trailing asterisks
          .replace(/\*\*/g, '')        // Remove **bold** formatting
          .replace(/^\s*-\s*/, '')     // Remove leading dashes
          .trim();
      })
      .filter(line => line.length > 10 && line.length < 150)  // Reasonable length for cost actions
      .slice(0, 4);  // Max 4 recommendations

    const recommendations = lines.length > 0 ? lines : [
      'Negotiate emergency pricing review with supplier within 48 hours',
      'Implement cost variance alert system at 20% threshold',
      'Establish backup supplier relationships for critical SKUs',
      'Review and update standard cost baselines monthly'
    ];

    return recommendations;

  } catch (error) {
    console.error('❌ Cost variance AI recommendation generation failed:', error);
    
    // This part of the code provides high-quality fallback recommendations based on anomaly type
    const fallbackRecs = {
      'Cost Spike': [
        'Contact supplier immediately to understand pricing justification',
        'Negotiate temporary price freeze while investigating cost drivers',
        'Identify alternative suppliers for price comparison analysis',
        'Implement expedited approval process for high-variance orders'
      ],
      'Quantity Discrepancy': [
        'Implement double-verification process for receiving operations',
        'Install automated counting technology for high-value shipments',
        'Create daily discrepancy reporting dashboard for managers',
        'Establish supplier charge-back process for quantity variances'
      ],
      'Supplier Variance': [
        'Schedule quarterly business review with supplier executives',
        'Benchmark supplier pricing against market alternatives',
        'Implement performance-based pricing incentive structure',
        'Develop supplier diversification strategy for cost leverage'
      ]
    };

    return fallbackRecs[anomaly.type as keyof typeof fallbackRecs] || fallbackRecs['Cost Spike'];
  }
}

/**
 * This part of the code generates world-class AI recommendations for margin risk alerts
 * Uses advanced prompts to provide specific, actionable margin optimization strategies
 */
async function generateMarginRiskRecommendations(
  marginRisk: MarginRiskAlert,
  contextData: { 
    totalBrands: number; 
    avgMargin: number; 
    totalImpact: number;
    highRiskBrands: number;
    totalSKUs: number;
  }
): Promise<string[]> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    console.warn('🤖 OpenAI API key not available, using fallback margin recommendations');
    return [
      'Review pricing strategy and implement margin-based pricing tiers',
      'Optimize product mix by focusing on high-margin SKUs',
      'Negotiate better supplier terms and volume discounts',
      'Implement SKU rationalization to eliminate low-margin products'
    ];
  }

  // This part of the code creates world-class prompts specific to margin risk levels
  const prompts = {
    'High': `HIGH MARGIN RISK OPTIMIZATION:

Brand Performance Crisis:
- Brand: ${marginRisk.brandName}
- Current Margin: ${marginRisk.currentMargin}% (Critical Level)
- Risk Score: ${marginRisk.riskScore}/100
- Financial Impact: $${marginRisk.financialImpact.toLocaleString()}
- SKU Portfolio: ${marginRisk.skuCount} SKUs, $${marginRisk.avgUnitCost.toFixed(2)} avg cost
- Inactive Rate: ${marginRisk.inactivePercentage}%
- Risk Drivers: ${marginRisk.primaryDrivers.join(', ')}

Portfolio Context:
- Total brands under management: ${contextData.totalBrands}
- Portfolio average margin: ${contextData.avgMargin}%
- High-risk brands requiring intervention: ${contextData.highRiskBrands}
- Total impact across portfolio: $${contextData.totalImpact.toLocaleString()}

URGENT: Generate 4 immediate margin recovery strategies focusing on:
1. Emergency pricing adjustments and cost reduction
2. SKU portfolio optimization and rationalization
3. Supplier renegotiation and cost management
4. Revenue optimization and product mix strategy

Requirements:
- Implement within 2 weeks for maximum impact
- Target minimum 5-10% margin improvement
- Focus on high-velocity, high-impact actions
- Include specific financial targets and timelines`,

    'Medium': `MEDIUM MARGIN RISK PREVENTION:

Brand Performance Warning:
- Brand: ${marginRisk.brandName}
- Current Margin: ${marginRisk.currentMargin}% (Warning Level)
- Risk Score: ${marginRisk.riskScore}/100
- Potential Impact: $${marginRisk.financialImpact.toLocaleString()}
- SKU Analysis: ${marginRisk.skuCount} SKUs, $${marginRisk.avgUnitCost.toFixed(2)} avg cost
- Portfolio Health: ${marginRisk.inactivePercentage}% inactive SKUs
- Contributing Factors: ${marginRisk.primaryDrivers.join(', ')}

Strategic Context:
- Brand portfolio size: ${contextData.totalBrands} brands
- Benchmark margin: ${contextData.avgMargin}%
- At-risk brands: ${contextData.highRiskBrands}
- Portfolio risk exposure: $${contextData.totalImpact.toLocaleString()}

Generate 4 proactive margin protection strategies:
1. Pricing optimization and margin enhancement
2. Cost structure analysis and supplier management
3. Product portfolio mix optimization
4. Operational efficiency improvements

Requirements:
- Prevent margin erosion before it becomes critical
- Target 3-5% margin improvement over 90 days
- Balance growth with profitability
- Include measurable KPIs and success metrics`,

    'Low': `LOW MARGIN RISK OPTIMIZATION:

Brand Performance Monitoring:
- Brand: ${marginRisk.brandName}
- Current Margin: ${marginRisk.currentMargin}% (Stable Level)
- Risk Score: ${marginRisk.riskScore}/100
- Optimization Opportunity: $${marginRisk.financialImpact.toLocaleString()}
- SKU Metrics: ${marginRisk.skuCount} SKUs, $${marginRisk.avgUnitCost.toFixed(2)} avg cost
- Portfolio Efficiency: ${marginRisk.inactivePercentage}% inactive rate
- Enhancement Areas: ${marginRisk.primaryDrivers.join(', ')}

Portfolio Leadership Context:
- Total brand portfolio: ${contextData.totalBrands}
- Average margin benchmark: ${contextData.avgMargin}%
- Optimization potential: $${contextData.totalImpact.toLocaleString()}

Generate 4 margin enhancement strategies for sustained growth:
1. Strategic pricing and value-based positioning
2. Advanced cost optimization and efficiency gains
3. Portfolio expansion and premium product development
4. Competitive advantage and market positioning

Requirements:
- Focus on sustainable competitive advantage
- Target 2-3% additional margin improvement
- Long-term strategic value creation (6+ months)
- Include innovation and growth opportunities`
  };

  try {
    const openaiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
    
    const response = await fetch(openaiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a world-class margin optimization expert with 20+ years of experience in retail and 3PL profitability management. Provide specific, actionable recommendations that drive measurable margin improvements. Each recommendation should be a single, clear action (15-20 words max). No explanations or bullet points - just the actionable steps that deliver financial results."
          },
          {
            role: "user", 
            content: prompts[marginRisk.riskLevel as keyof typeof prompts] || prompts['Medium']
          }
        ],
        max_tokens: 500,
        temperature: 0.2  // Lower temperature for more focused, practical recommendations
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from OpenAI");
    }

    // This part of the code parses AI response into clean, actionable margin recommendations
    const lines = aiResponse.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Remove any formatting characters and numbers
        return line
          .replace(/^\d+\.\s*/, '')    // Remove "1. "
          .replace(/^[•-]\s*/, '')     // Remove "• " or "- "
          .replace(/^\*+/, '')         // Remove asterisks
          .replace(/\*+$/, '')         // Remove trailing asterisks
          .replace(/\*\*/g, '')        // Remove **bold** formatting
          .replace(/^\s*-\s*/, '')     // Remove leading dashes
          .trim();
      })
      .filter(line => line.length > 10 && line.length < 150)  // Reasonable length for margin actions
      .slice(0, 4);  // Max 4 recommendations

    const recommendations = lines.length > 0 ? lines : [
      'Implement dynamic pricing strategy based on margin thresholds',
      'Conduct SKU profitability analysis and eliminate low-margin products',
      'Negotiate volume-based supplier discounts and payment terms',
      'Develop premium product lines to improve overall margin mix'
    ];

    return recommendations;

  } catch (error) {
    console.error('❌ Margin risk AI recommendation generation failed:', error);
    
    // This part of the code provides high-quality fallback recommendations based on risk level
    const fallbackRecs = {
      'High': [
        'Implement emergency pricing increases on highest-volume SKUs',
        'Suspend orders for negative-margin products immediately',
        'Renegotiate supplier terms with 30-day deadline',
        'Conduct urgent SKU profitability audit and rationalization'
      ],
      'Medium': [
        'Review and optimize pricing strategy across product portfolio',
        'Implement ABC analysis to focus on high-margin SKU growth',
        'Negotiate annual supplier contracts with better terms',
        'Develop margin improvement roadmap with quarterly targets'
      ],
      'Low': [
        'Enhance value-based pricing for premium product positioning',
        'Explore operational efficiency gains to reduce costs',
        'Investigate new supplier partnerships for cost advantages',
        'Develop higher-margin product line extensions'
      ]
    };

    return fallbackRecs[marginRisk.riskLevel as keyof typeof fallbackRecs] || fallbackRecs['Medium'];
  }
}

/**
 * This part of the code generates world-class AI recommendations for dashboard insights
 * Uses advanced prompts to provide specific, actionable operational strategies
 */
async function generateDashboardInsightRecommendations(
  insight: any,
  contextData: { 
    totalShipments: number; 
    totalProducts: number; 
    totalWarehouses: number;
    totalOrders: number;
    atRiskOrders: number;
    unfulfillableSKUs: number;
  }
): Promise<string[]> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    console.warn('🤖 OpenAI API key not available, using fallback dashboard insight recommendations');
    return [
      'Implement real-time performance monitoring and alerting systems',
      'Establish emergency response protocols for critical issues',
      'Create standardized operational procedures and documentation',
      'Deploy predictive analytics for proactive issue prevention'
    ];
  }

  // This part of the code creates world-class prompts specific to insight severity and type
  const getPromptBySeverity = () => {
    const baseContext = `
OPERATIONAL INTELLIGENCE ANALYSIS:

Current Insight: ${insight.title}
Description: ${insight.description}
Severity: ${insight.severity.toUpperCase()}
Financial Impact: ${insight.dollarImpact ? `$${insight.dollarImpact.toLocaleString()}` : 'Not quantified'}
Source: ${insight.source}
Created: ${new Date(insight.createdAt).toLocaleDateString()}

OPERATIONAL CONTEXT:
- Active Shipments: ${contextData.totalShipments.toLocaleString()}
- Product Catalog: ${contextData.totalProducts.toLocaleString()} SKUs
- Warehouse Network: ${contextData.totalWarehouses} facilities
- Daily Orders: ${contextData.totalOrders}
- At-Risk Orders: ${contextData.atRiskOrders} (${((contextData.atRiskOrders / Math.max(contextData.totalOrders, 1)) * 100).toFixed(1)}% risk rate)
- Unfulfillable SKUs: ${contextData.unfulfillableSKUs}`;

    if (insight.severity === 'critical') {
      return `${baseContext}

CRITICAL OPERATIONAL CRISIS RESPONSE:

This is a CRITICAL operational issue requiring immediate executive intervention. The financial impact of $${insight.dollarImpact?.toLocaleString() || 'significant amount'} demands urgent action to prevent business disruption.

CRISIS MANAGEMENT PROTOCOL:
Generate 4 emergency response strategies focusing on:
1. Immediate containment and damage control (0-24 hours)
2. Root cause identification and elimination (24-72 hours)  
3. Systematic process improvement (1-2 weeks)
4. Long-term prevention and monitoring (30+ days)

Requirements:
- Each action must be executable within specified timeframes
- Include specific personnel/department responsibilities
- Provide measurable success criteria and KPIs
- Focus on business continuity and risk mitigation
- Address both immediate fixes and systemic improvements`;

    } else if (insight.severity === 'warning') {
      return `${baseContext}

PREVENTIVE OPERATIONAL OPTIMIZATION:

This warning-level insight indicates potential operational inefficiencies that could escalate if not addressed. The $${insight.dollarImpact?.toLocaleString() || 'estimated'} impact suggests proactive intervention opportunities.

OPTIMIZATION STRATEGY:
Generate 4 proactive improvement strategies focusing on:
1. Process optimization and efficiency enhancement
2. Performance monitoring and early warning systems
3. Resource allocation and capacity management
4. Stakeholder communication and coordination

Requirements:
- Target 2-4 week implementation timeline
- Include specific metrics and monitoring approaches
- Balance operational efficiency with cost management
- Provide clear ROI justification for each recommendation
- Address process standardization and documentation`;

    } else {
      return `${baseContext}

STRATEGIC OPERATIONAL ENHANCEMENT:

This informational insight presents opportunities for operational excellence and competitive advantage. Focus on sustainable improvements that enhance overall performance.

STRATEGIC IMPROVEMENT:
Generate 4 enhancement strategies focusing on:
1. Operational excellence and best practice implementation
2. Technology integration and automation opportunities
3. Performance optimization and efficiency gains
4. Innovation and competitive differentiation

Requirements:
- Focus on sustainable long-term improvements (30-90 days)
- Include technology and process innovation opportunities
- Provide strategic value beyond immediate operational gains
- Balance innovation with operational stability
- Include change management and adoption strategies`;
    }
  };

  try {
    const openaiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
    
    const response = await fetch(openaiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a world-class operations consultant with 20+ years of experience in 3PL and supply chain management. Provide specific, actionable recommendations that drive measurable operational improvements. Each recommendation should be a single, clear action (15-20 words max). No explanations or bullet points - just the actionable strategies that deliver operational excellence and business results."
          },
          {
            role: "user", 
            content: getPromptBySeverity()
          }
        ],
        max_tokens: 500,
        temperature: 0.2  // Lower temperature for more focused, practical recommendations
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from OpenAI");
    }

    // This part of the code parses AI response into clean, actionable dashboard recommendations
    const lines = aiResponse.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Remove any formatting characters and numbers
        return line
          .replace(/^\d+\.\s*/, '')    // Remove "1. "
          .replace(/^[•-]\s*/, '')     // Remove "• " or "- "
          .replace(/^\*+/, '')         // Remove asterisks
          .replace(/\*+$/, '')         // Remove trailing asterisks
          .replace(/\*\*/g, '')        // Remove **bold** formatting
          .replace(/^\s*-\s*/, '')     // Remove leading dashes
          .trim();
      })
      .filter(line => line.length > 10 && line.length < 150)  // Reasonable length for dashboard actions
      .slice(0, 4);  // Max 4 recommendations

    const recommendations = lines.length > 0 ? lines : [
      'Implement real-time performance monitoring dashboard for key operational metrics',
      'Establish standardized escalation procedures for critical issues and alerts',
      'Deploy predictive analytics to identify and prevent operational bottlenecks',
      'Create cross-functional response teams for rapid issue resolution'
    ];

    return recommendations;

  } catch (error) {
    console.error('❌ Dashboard insight AI recommendation generation failed:', error);
    
    // NO FALLBACK RECOMMENDATIONS - Return empty array if AI fails
    console.log('❌ Dashboard insight AI recommendation generation failed - no fallback provided');
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // This part of the code handles cost variance recommendation requests
  if (req.query.recommendations === 'true') {
    try {
      console.log("💰 Dashboard API: Processing cost variance recommendation request...");
      
      const { anomaly, contextData } = req.query;
      
      if (!anomaly || !contextData) {
        return res.status(400).json({
          success: false,
          error: "Anomaly and context data are required for recommendations",
          timestamp: new Date().toISOString(),
        });
      }

      const parsedAnomaly = JSON.parse(anomaly as string);
      const parsedContextData = JSON.parse(contextData as string);

      console.log(`🎯 Generating cost recommendations for: ${parsedAnomaly.type} - ${parsedAnomaly.title}`);
      
      // Generate AI-powered cost variance recommendations using existing function
      const recommendations = await generateCostVarianceRecommendations(parsedAnomaly, parsedContextData);
      
      console.log(`✅ Generated ${recommendations.length} cost optimization recommendations successfully`);
      
      return res.status(200).json({
        success: true,
        data: {
          recommendations,
          anomaly: parsedAnomaly.title,
          generatedAt: new Date().toISOString(),
          context: {
            type: parsedAnomaly.type,
            severity: parsedAnomaly.severity,
            financialImpact: parsedAnomaly.financialImpact
          }
        },
        message: "Cost variance recommendations generated successfully"
      });

    } catch (error) {
      console.error("❌ Dashboard API Cost Recommendations Error:", error);
      
      return res.status(500).json({
        success: false,
        error: "Failed to generate cost variance recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // This part of the code handles margin risk recommendation requests
  if (req.query.marginRecommendations === 'true') {
    try {
      console.log("💰 Dashboard API: Processing margin risk recommendation request...");
      
      const { marginRisk, contextData } = req.query;
      
      if (!marginRisk || !contextData) {
        return res.status(400).json({
          success: false,
          error: "Margin risk and context data are required for recommendations",
          timestamp: new Date().toISOString(),
        });
      }

      const parsedMarginRisk = JSON.parse(marginRisk as string);
      const parsedContextData = JSON.parse(contextData as string);

      console.log(`🎯 Generating margin recommendations for: ${parsedMarginRisk.brandName} - ${parsedMarginRisk.riskLevel} risk`);
      
      // Generate AI-powered margin risk recommendations
      const recommendations = await generateMarginRiskRecommendations(parsedMarginRisk, parsedContextData);
      
      console.log(`✅ Generated ${recommendations.length} margin optimization recommendations successfully`);
      
      return res.status(200).json({
        success: true,
        data: {
          recommendations,
          brand: parsedMarginRisk.brandName,
          generatedAt: new Date().toISOString(),
          context: {
            riskLevel: parsedMarginRisk.riskLevel,
            currentMargin: parsedMarginRisk.currentMargin,
            financialImpact: parsedMarginRisk.financialImpact
          }
        },
        message: "Margin risk recommendations generated successfully"
      });

    } catch (error) {
      console.error("❌ Dashboard API Margin Recommendations Error:", error);
      
      return res.status(500).json({
        success: false,
        error: "Failed to generate margin risk recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // This part of the code handles dashboard insight recommendation requests
  if (req.query.insightRecommendations === 'true') {
    try {
      console.log("📊 Dashboard API: Processing insight recommendation request...");
      
      const { insight, contextData } = req.query;
      
      if (!insight || !contextData) {
        return res.status(400).json({
          success: false,
          error: "Insight and context data are required for recommendations",
          timestamp: new Date().toISOString(),
        });
      }

      const parsedInsight = JSON.parse(insight as string);
      const parsedContextData = JSON.parse(contextData as string);

      console.log(`🎯 Generating insight recommendations for: ${parsedInsight.title} - ${parsedInsight.severity} severity`);
      
      // Generate AI-powered dashboard insight recommendations
      const recommendations = await generateDashboardInsightRecommendations(parsedInsight, parsedContextData);
      
      console.log(`✅ Generated ${recommendations.length} dashboard insight recommendations successfully`);
      
      return res.status(200).json({
        success: true,
        data: {
          recommendations,
          insight: parsedInsight.title,
          generatedAt: new Date().toISOString(),
          context: {
            severity: parsedInsight.severity,
            dollarImpact: parsedInsight.dollarImpact,
            source: parsedInsight.source
          }
        },
        message: "Dashboard insight recommendations generated successfully"
      });

    } catch (error) {
      console.error("❌ Dashboard API Insight Recommendations Error:", error);
      
      return res.status(500).json({
        success: false,
        error: "Failed to generate dashboard insight recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  try {
    console.log(
      "📊 Vercel API: Fetching dashboard data with split environment variables...",
    );

    const [products, shipments] = await Promise.all([
      fetchProducts(),
      fetchShipments(),
    ]);

    const insights = await generateInsights(products, shipments);

    // This part of the code calculates new real-data analysis features
    const marginRisks = calculateMarginRisks(products, shipments);
    const costVariances = detectCostVariances(products, shipments);

    // This part of the code calculates KPIs using standardized logic matching server implementation
    const today = new Date().toISOString().split("T")[0];
    
    const totalOrdersToday = shipments.filter(
      (shipment) => shipment.created_date === today,
    ).length;

    const atRiskOrders = shipments.filter(
      (shipment) =>
        shipment.expected_quantity !== shipment.received_quantity ||
        shipment.status === "cancelled",
    ).length;

    const openPOs = new Set(
      shipments
        .filter(
          (shipment) =>
            shipment.purchase_order_number &&
            shipment.status !== "completed" &&
            shipment.status !== "cancelled",
        )
        .map((shipment) => shipment.purchase_order_number),
    ).size;

    const unfulfillableSKUs = products.filter(
      (product) => !product.active,
    ).length;

    const dashboardData = {
      products,
      shipments,
      kpis: {
        totalOrdersToday: totalOrdersToday > 0 ? totalOrdersToday : null,
        atRiskOrders: atRiskOrders > 0 ? atRiskOrders : null,
        openPOs: openPOs > 0 ? openPOs : null,
        unfulfillableSKUs,
      },
      quickOverview: {
        topIssues: atRiskOrders,
        whatsWorking: shipments.filter(
          (shipment) =>
            shipment.expected_quantity === shipment.received_quantity &&
            shipment.status !== "cancelled",
        ).length,
        dollarImpact: Math.round(shipments
          .filter(
            (shipment) => shipment.expected_quantity !== shipment.received_quantity,
          )
          .reduce((sum, shipment) => {
            const quantityDiff = Math.abs(
              shipment.expected_quantity - shipment.received_quantity,
            );
            const cost = shipment.unit_cost || 0;
            return sum + quantityDiff * cost;
          }, 0)),
        completedWorkflows: new Set(
          shipments
            .filter(
              (shipment) =>
                shipment.status === "receiving" || shipment.status === "completed",
            )
            .map((shipment) => shipment.purchase_order_number),
        ).size,
      },
      warehouseInventory: (() => {
        // This part of the code provides proper warehouse deduplication using Map
        const warehouseMap = new Map();
        shipments.forEach((s) => {
          if (s.warehouse_id && !warehouseMap.has(s.warehouse_id)) {
            warehouseMap.set(s.warehouse_id, {
              id: s.warehouse_id,
              name: s.supplier, // Use supplier as warehouse name to match server logic
            });
          }
        });
        
        return Array.from(warehouseMap.values());
      })().map((warehouse) => {
        // This part of the code calculates real warehouse inventory from actual shipment data
        const warehouseShipments = shipments.filter(s => s.warehouse_id === warehouse.id);
        const warehouseProducts = products.filter(p => 
          warehouseShipments.some(s => s.inventory_item_id === p.inventory_item_id)
        );
        
        const totalInventory = warehouseShipments.reduce((sum, shipment) => 
          sum + shipment.received_quantity, 0
        );
        
        const averageCost = warehouseShipments.length > 0 
          ? warehouseShipments
              .filter(s => s.unit_cost !== null)
              .reduce((sum, shipment, _, arr) => sum + (shipment.unit_cost || 0), 0) / 
            warehouseShipments.filter(s => s.unit_cost !== null).length
          : 0;
        
        return {
          warehouseId: warehouse.id,
          totalInventory,
          productCount: warehouseProducts.length,
          averageCost: Math.round(averageCost || 0),
        };
      }),
      insights: insights.map((insight, index) => ({
        id: `insight-${index}`,
        title: safeFormatAIText(insight.title),
        description: safeFormatAIText(insight.description),
        severity:
          insight.severity === "critical"
            ? ("critical" as const)
            : insight.severity === "warning"
              ? ("warning" as const)
              : ("info" as const),
        dollarImpact: insight.dollarImpact || 0, // This part of the code uses real financial impact from AI or calculations
        suggestedActions: [
          `Review ${insight.title.toLowerCase()}`,
          "Take corrective action",
        ],
        createdAt: new Date().toISOString(),
        source: "dashboard_agent" as const,
      })),
      anomalies: [
        ...(unfulfillableSKUs > 100
          ? [
              {
                id: "anomaly-1",
                type: "high_unfulfillable_skus" as const,
                title: "High Unfulfillable SKUs",
                description: `${unfulfillableSKUs} SKUs cannot be fulfilled`,
                severity: "critical" as const,
                icon: "⚠️",
                createdAt: new Date().toISOString(),
              },
            ]
          : []),
        ...(totalOrdersToday === 0
          ? [
              {
                id: "anomaly-2",
                type: "low_order_volume" as const,
                title: "Low Order Volume",
                description: "No orders detected today",
                severity: "info" as const,
                icon: "📊",
                createdAt: new Date().toISOString(),
              },
            ]
          : []),
      ],
      marginRisks, // This part of the code adds real margin risk analysis data
      costVariances, // This part of the code adds real cost variance detection data
      lastUpdated: new Date().toISOString(),
    };

    console.log("✅ Vercel API: Dashboard data compiled successfully");
    res.status(200).json({
      success: true,
      data: dashboardData,
      message: "Dashboard data retrieved successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Vercel API Error:", error);
    res.status(500).json({
      error: "Failed to fetch dashboard data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
