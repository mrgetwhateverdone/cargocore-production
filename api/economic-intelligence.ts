import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * This part of the code provides economic intelligence data for Vercel serverless deployment
 * Uses real TinyBird data to calculate supplier performance, cost trends, and business impacts
 */

// TinyBird Product API Response - standardized interface
interface ProductData {
  company_id: string;
  company_url: string;
  brand_id: string | null;
  brand_name: string;
  brand_domain: string | null;
  created_date: string;
  sku: string;
  title: string;
  description: string | null;
  unit_quantity: number;
  unit_cost: number | null;
  active: boolean;
  supplier_name: string | null;
  supplier_id: string | null;
  supplier_external_id: string | null;
  updated_date: string | null;
}

// TinyBird Shipments API Response - standardized interface
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
  meta: Array<{ name: string; type: string }>;
  data: T[];
  rows: number;
  statistics: {
    elapsed: number;
    rows_read: number;
    bytes_read: number;
  };
}

/**
 * This part of the code fetches products data from TinyBird API
 */
async function fetchProducts(): Promise<ProductData[]> {
  const baseUrl = process.env.WAREHOUSE_BASE_URL;
  const token = process.env.WAREHOUSE_TOKEN;

  if (!baseUrl || !token) {
    console.error("❌ Missing TinyBird environment variables");
    return [];
  }

  try {
    const response = await fetch(`${baseUrl}/v0/pipes/product_details_mv.json?token=${token}&limit=500`);
    
    if (!response.ok) {
      throw new Error(`TinyBird API error: ${response.status}`);
    }

    const result: TinyBirdResponse<ProductData> = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("❌ Failed to fetch products:", error);
    return [];
  }
}

/**
 * This part of the code fetches shipments data from TinyBird API
 */
async function fetchShipments(): Promise<ShipmentData[]> {
  const baseUrl = process.env.WAREHOUSE_BASE_URL;
  const token = process.env.WAREHOUSE_TOKEN;

  if (!baseUrl || !token) {
    console.error("❌ Missing TinyBird environment variables");
    return [];
  }

  try {
    const response = await fetch(`${baseUrl}/v0/pipes/inbound_shipments_details_mv.json?token=${token}&limit=500`);
    
    if (!response.ok) {
      throw new Error(`TinyBird API error: ${response.status}`);
    }

    const result: TinyBirdResponse<ShipmentData> = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("❌ Failed to fetch shipments:", error);
    return [];
  }
}

/**
 * This part of the code calculates economic KPIs from real operational data
 */
function calculateEconomicKPIs(products: ProductData[], shipments: ShipmentData[]) {
  if (shipments.length === 0) {
    return {
      supplierPerformance: 0,
      shippingCostImpact: 0,
      transportationCosts: 0,
      supplyChainHealth: 0,
      logisticsCostEfficiency: 0,
      supplierDelayRate: 0
    };
  }

  // This part of the code calculates supplier performance from delivery accuracy
  const onTimeDeliveries = shipments.filter(s => {
    if (!s.expected_arrival_date || !s.arrival_date) return false;
    const expected = new Date(s.expected_arrival_date);
    const actual = new Date(s.arrival_date);
    return actual <= expected;
  }).length;
  const supplierPerformance = Math.round((onTimeDeliveries / shipments.length) * 100);

  // This part of the code calculates supply chain health from quantity accuracy
  const accurateShipments = shipments.filter(s => s.expected_quantity === s.received_quantity).length;
  const supplyChainHealth = Math.round((accurateShipments / shipments.length) * 100);

  // This part of the code calculates cost trends from unit cost variations
  const currentMonth = new Date().getMonth();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  
  const currentMonthShipments = shipments.filter(s => new Date(s.arrival_date).getMonth() === currentMonth);
  const previousMonthShipments = shipments.filter(s => new Date(s.arrival_date).getMonth() === previousMonth);
  
  const currentAvgCost = currentMonthShipments.length > 0 
    ? currentMonthShipments.reduce((sum, s) => sum + (s.unit_cost || 0), 0) / currentMonthShipments.length
    : 0;
  const previousAvgCost = previousMonthShipments.length > 0 
    ? previousMonthShipments.reduce((sum, s) => sum + (s.unit_cost || 0), 0) / previousMonthShipments.length
    : currentAvgCost;

  const shippingCostImpact = previousAvgCost > 0 ? Math.round((currentAvgCost / previousAvgCost) * 100) : 100;
  const transportationCosts = shippingCostImpact; // Similar calculation for now

  // This part of the code calculates logistics efficiency from cost per unit
  const totalCost = shipments.reduce((sum, s) => sum + ((s.unit_cost || 0) * s.received_quantity), 0);
  const totalUnits = shipments.reduce((sum, s) => sum + s.received_quantity, 0);
  const avgCostPerUnit = totalUnits > 0 ? totalCost / totalUnits : 0;
  const logisticsCostEfficiency = avgCostPerUnit > 0 ? Math.round((avgCostPerUnit / 10) * 100) : 100; // Normalized

  // This part of the code calculates supplier delay rate
  const delayedShipments = shipments.filter(s => {
    if (!s.expected_arrival_date || !s.arrival_date) return false;
    const expected = new Date(s.expected_arrival_date);
    const actual = new Date(s.arrival_date);
    return actual > expected;
  }).length;
  const supplierDelayRate = Math.round((delayedShipments / shipments.length) * 100);

  return {
    supplierPerformance,
    shippingCostImpact,
    transportationCosts,
    supplyChainHealth,
    logisticsCostEfficiency,
    supplierDelayRate
  };
}

/**
 * This part of the code calculates financial impacts using existing methodology
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

  // Calculate brand concentration risk
  const brandCounts = new Map<string, number>();
  shipments.forEach(s => {
    if (s.brand_name) {
      brandCounts.set(s.brand_name, (brandCounts.get(s.brand_name) || 0) + 1);
    }
  });
  
  const totalOrders = shipments.length;
  const topBrands = Array.from(brandCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  const top3BrandPercentage = topBrands.reduce((sum, [, count]) => sum + count, 0) / totalOrders * 100;
  const brandConcentrationRisk = top3BrandPercentage > 70 ? Math.round(quantityDiscrepancyImpact * 0.5) : 0;

  return {
    quantityDiscrepancyImpact: Math.round(quantityDiscrepancyImpact),
    cancelledShipmentsImpact: Math.round(cancelledShipmentsImpact),
    brandConcentrationRisk: Math.round(brandConcentrationRisk),
    totalFinancialRisk: Math.round(quantityDiscrepancyImpact + cancelledShipmentsImpact + brandConcentrationRisk),
    top3BrandPercentage: Math.round(top3BrandPercentage)
  };
}

/**
 * This part of the code generates economic intelligence insights
 */
function generateEconomicInsights(
  products: ProductData[], 
  shipments: ShipmentData[], 
  kpis: any, 
  financialImpacts: any
) {
  const insights = [];

  // Supply Chain Cost Escalation Impact
  if (financialImpacts.quantityDiscrepancyImpact > 0) {
    insights.push({
      id: "supply-chain-cost-escalation",
      title: "Supply Chain Cost Escalation Impact",
      description: "Rising operational costs and delivery discrepancies are impacting current inventory shortfalls and performance metrics",
      dollarImpact: financialImpacts.quantityDiscrepancyImpact,
      severity: "critical" as const,
      type: "cost_escalation"
    });
  }

  // Brand Concentration Risk
  if (financialImpacts.brandConcentrationRisk > 0) {
    insights.push({
      id: "brand-concentration-risk",
      title: "Brand Concentration Risk Amplification", 
      description: `Economic volatility increases risk exposure from brand concentration, particularly with supply chain disruptions`,
      dollarImpact: financialImpacts.brandConcentrationRisk,
      severity: "warning" as const,
      type: "concentration_risk"
    });
  }

  return insights;
}

/**
 * This part of the code generates business impact analysis
 */
function generateBusinessImpactAnalysis(
  products: ProductData[],
  shipments: ShipmentData[],
  kpis: any,
  financialImpacts: any
) {
  const unfulfillableSkus = products.filter(p => !p.active).length;
  const delayedShipments = shipments.filter(s => {
    if (!s.expected_arrival_date || !s.arrival_date) return false;
    return new Date(s.arrival_date) > new Date(s.expected_arrival_date);
  }).length;

  return {
    executiveSummary: `Critical Correlation Alert: External economic pressures are directly amplifying our current operational challenges. With ${kpis.shippingCostImpact}% shipping cost impact and ${kpis.supplierDelayRate}% supplier delays, our ${unfulfillableSkus} inactive SKUs and ${kpis.supplierPerformance}% supplier performance represent operational challenges requiring strategic intervention.`,
    
    keyRisks: [
      `Inventory management challenges compound with ${kpis.shippingCostImpact}% shipping cost increases`,
      `${kpis.supplierPerformance}% supplier performance creates operational inefficiencies`,
      `Brand concentration risk escalates with ${kpis.supplierDelayRate}% supplier delay rates`,
      `Operational costs impact efficiency while fulfillment optimization continues`
    ],
    
    opportunityAreas: [
      "Leverage market conditions to negotiate better supplier terms",
      "Implement AI-driven demand forecasting to prevent future stockouts", 
      "Consolidate shipping volumes for better freight rates",
      "Diversify product portfolio during market volatility"
    ]
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🌍 Economic Intelligence API: Fetching operational data...");

    const [products, shipments] = await Promise.all([
      fetchProducts(),
      fetchShipments()
    ]);

    if (products.length === 0 && shipments.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          kpis: {
            supplierPerformance: 0,
            shippingCostImpact: 0,
            transportationCosts: 0,
            supplyChainHealth: 0,
            logisticsCostEfficiency: 0,
            supplierDelayRate: 0
          },
          insights: [],
          businessImpact: {
            executiveSummary: "Economic intelligence data is not available. Data source connection required.",
            keyRisks: [],
            opportunityAreas: []
          },
          lastUpdated: new Date().toISOString()
        },
        message: "No economic intelligence data available",
        timestamp: new Date().toISOString()
      });
    }

    // This part of the code calculates all economic intelligence metrics
    const kpis = calculateEconomicKPIs(products, shipments);
    const financialImpacts = calculateFinancialImpacts(products, shipments);
    const insights = generateEconomicInsights(products, shipments, kpis, financialImpacts);
    const businessImpact = generateBusinessImpactAnalysis(products, shipments, kpis, financialImpacts);

    const economicData = {
      kpis,
      insights,
      businessImpact,
      financialImpacts,
      lastUpdated: new Date().toISOString()
    };

    console.log("✅ Economic Intelligence API: Data compiled successfully");
    res.status(200).json({
      success: true,
      data: economicData,
      message: "Economic intelligence data retrieved successfully",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Economic Intelligence API Error:", error);
    res.status(500).json({
      error: "Failed to fetch economic intelligence data",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
}
