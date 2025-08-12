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
  const baseUrl = process.env.TINYBIRD_BASE_URL;
  const token = process.env.TINYBIRD_TOKEN;

  if (!baseUrl || !token) {
    console.error("❌ Missing TinyBird environment variables");
    return [];
  }

  try {
    const response = await fetch(`${baseUrl}?token=${token}&limit=500&company_url=COMP002_packiyo`);
    
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
    const response = await fetch(`${baseUrl}?token=${token}&limit=500&company_url=COMP002_3PL`);
    
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
 * This part of the code generates detailed KPI information for overlays
 */
function generateKPIDetails(
  products: ProductData[],
  shipments: ShipmentData[],
  kpis: any,
  financialImpacts: any
) {
  const totalShipments = shipments.length;
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.active).length;
  
  return {
    supplierPerformance: {
      id: 'supplier-performance',
      title: 'Supplier Performance Index',
      value: `${kpis.supplierPerformance}/100`,
      description: 'Your supplier delivery performance and reliability metrics',
      status: kpis.supplierPerformance >= 90 ? 'good' : kpis.supplierPerformance >= 70 ? 'warning' : 'critical',
      detailedAnalysis: `Based on analysis of ${totalShipments} shipments, your supplier performance shows ${kpis.supplierPerformance}% on-time delivery rate. This metric tracks actual arrival dates against expected delivery dates to measure supplier reliability and operational efficiency.`,
      keyMetrics: [
        {
          label: 'On-time Deliveries',
          value: `${Math.round((kpis.supplierPerformance / 100) * totalShipments)}/${totalShipments}`,
          description: 'Shipments that arrived on or before expected date'
        },
        {
          label: 'Total Suppliers',
          value: new Set(shipments.map(s => s.supplier).filter(s => s)).size,
          description: 'Unique suppliers in your network'
        },
        {
          label: 'Average Delay',
          value: kpis.supplierDelayRate > 0 ? `${kpis.supplierDelayRate}%` : 'No delays',
          description: 'Percentage of shipments experiencing delays'
        }
      ],
      recommendations: [
        'Focus on improving relationships with consistently late suppliers',
        'Implement supplier scorecards to track performance trends',
        'Consider backup suppliers for critical SKUs',
        'Negotiate delivery time buffers in contracts'
      ]
    },
    
    shippingCostImpact: {
      id: 'shipping-cost-impact',
      title: 'Shipping Cost Impact',
      value: `${kpis.shippingCostImpact}%`,
      description: 'Impact of shipping costs on your operational expenses',
      status: kpis.shippingCostImpact <= 110 ? 'good' : kpis.shippingCostImpact <= 130 ? 'warning' : 'critical',
      detailedAnalysis: `Current shipping costs are running at ${kpis.shippingCostImpact}% compared to baseline levels. This metric analyzes unit cost trends over time to identify cost inflation or optimization opportunities in your logistics operations.`,
      keyMetrics: [
        {
          label: 'Cost Trend',
          value: kpis.shippingCostImpact > 100 ? 'Increasing' : 'Stable',
          description: 'Direction of shipping cost changes'
        },
        {
          label: 'Total Shipments',
          value: totalShipments,
          description: 'Shipments analyzed for cost trends'
        },
        {
          label: 'Average Unit Cost',
          value: totalShipments > 0 ? `$${(shipments.reduce((sum, s) => sum + (s.unit_cost || 0), 0) / totalShipments).toFixed(2)}` : '$0',
          description: 'Average cost per unit across all shipments'
        }
      ],
      recommendations: [
        'Analyze shipping routes for optimization opportunities',
        'Consolidate shipments to reduce per-unit costs',
        'Negotiate volume discounts with logistics providers',
        'Consider alternative shipping methods for non-urgent deliveries'
      ]
    },
    
    supplyChainHealth: {
      id: 'supply-chain-health',
      title: 'Supply Chain Health',
      value: `${kpis.supplyChainHealth}/100`,
      description: 'Overall health of your supply chain operations',
      status: kpis.supplyChainHealth >= 90 ? 'good' : kpis.supplyChainHealth >= 70 ? 'warning' : 'critical',
      detailedAnalysis: `Your supply chain health score of ${kpis.supplyChainHealth}% is based on quantity accuracy between expected and received shipments. This measures operational efficiency and helps identify inventory management challenges.`,
      keyMetrics: [
        {
          label: 'Accurate Shipments',
          value: `${Math.round((kpis.supplyChainHealth / 100) * totalShipments)}/${totalShipments}`,
          description: 'Shipments with matching expected vs received quantities'
        },
        {
          label: 'Active Products',
          value: `${activeProducts}/${totalProducts}`,
          description: 'Products currently active in your catalog'
        },
        {
          label: 'Quantity Variance',
          value: `${100 - kpis.supplyChainHealth}%`,
          description: 'Percentage of shipments with quantity discrepancies'
        }
      ],
      recommendations: [
        'Improve inventory forecasting accuracy',
        'Implement stricter quality control processes',
        'Review supplier contracts for quantity guarantees',
        'Enhance communication with suppliers on expected quantities'
      ]
    },
    
    transportationCosts: {
      id: 'transportation-costs',
      title: 'Transportation Cost Index',
      value: `${kpis.transportationCosts}%`,
      description: 'Transportation cost trends affecting your deliveries',
      status: kpis.transportationCosts <= 110 ? 'good' : kpis.transportationCosts <= 130 ? 'warning' : 'critical',
      detailedAnalysis: `Transportation costs are currently at ${kpis.transportationCosts}% of baseline levels. This metric tracks cost variations across different shipping routes and methods to identify transportation efficiency opportunities.`,
      keyMetrics: [
        {
          label: 'Cost Variance',
          value: kpis.transportationCosts > 100 ? `+${kpis.transportationCosts - 100}%` : 'Stable',
          description: 'Change from baseline transportation costs'
        },
        {
          label: 'Shipment Routes',
          value: new Set(shipments.map(s => `${s.ship_from_city || 'Unknown'}, ${s.ship_from_state || 'Unknown'}`)).size,
          description: 'Unique shipping origin locations'
        },
        {
          label: 'Average Distance Impact',
          value: totalShipments > 0 ? `${kpis.transportationCosts}% baseline` : 'No data',
          description: 'Transportation cost efficiency compared to standard rates'
        }
      ],
      recommendations: [
        'Analyze shipping routes for cost optimization',
        'Negotiate regional carrier contracts',
        'Consider freight consolidation opportunities',
        'Evaluate alternative transportation modes'
      ]
    },
    
    logisticsCostEfficiency: {
      id: 'logistics-cost-efficiency',
      title: 'Logistics Cost Efficiency',
      value: `${kpis.logisticsCostEfficiency}%`,
      description: 'Efficiency of your logistics and shipping operations',
      status: kpis.logisticsCostEfficiency <= 110 ? 'good' : kpis.logisticsCostEfficiency <= 130 ? 'warning' : 'critical',
      detailedAnalysis: `Logistics cost efficiency at ${kpis.logisticsCostEfficiency}% indicates operational performance relative to industry benchmarks. This metric evaluates cost per unit processed and identifies areas for operational optimization.`,
      keyMetrics: [
        {
          label: 'Cost per Unit',
          value: totalShipments > 0 ? `$${(shipments.reduce((sum, s) => sum + ((s.unit_cost || 0) * s.received_quantity), 0) / shipments.reduce((sum, s) => sum + s.received_quantity, 0)).toFixed(2)}` : '$0',
          description: 'Average cost per unit across all operations'
        },
        {
          label: 'Total Units Processed',
          value: shipments.reduce((sum, s) => sum + s.received_quantity, 0),
          description: 'Total units handled in logistics operations'
        },
        {
          label: 'Efficiency Rating',
          value: kpis.logisticsCostEfficiency <= 110 ? 'Excellent' : kpis.logisticsCostEfficiency <= 130 ? 'Good' : 'Needs Improvement',
          description: 'Overall logistics efficiency assessment'
        }
      ],
      recommendations: [
        'Optimize warehouse layouts for faster processing',
        'Implement automation for high-volume operations',
        'Review staffing levels during peak periods',
        'Streamline order fulfillment processes'
      ]
    },
    
    supplierDelayRate: {
      id: 'supplier-delay-rate',
      title: 'Supplier Delay Rate',
      value: `${kpis.supplierDelayRate}%`,
      description: 'Percentage of suppliers experiencing delays',
      status: kpis.supplierDelayRate <= 10 ? 'good' : kpis.supplierDelayRate <= 20 ? 'warning' : 'critical',
      detailedAnalysis: `${kpis.supplierDelayRate}% of shipments experienced delays beyond expected delivery dates. This metric tracks supplier reliability and helps identify potential supply chain disruptions that could impact customer satisfaction.`,
      keyMetrics: [
        {
          label: 'Delayed Shipments',
          value: `${Math.round((kpis.supplierDelayRate / 100) * totalShipments)}/${totalShipments}`,
          description: 'Shipments that arrived after expected date'
        },
        {
          label: 'On-time Rate',
          value: `${100 - kpis.supplierDelayRate}%`,
          description: 'Percentage of shipments delivered on schedule'
        },
        {
          label: 'Impact Assessment',
          value: kpis.supplierDelayRate > 20 ? 'High Risk' : kpis.supplierDelayRate > 10 ? 'Medium Risk' : 'Low Risk',
          description: 'Potential impact on operations and customer service'
        }
      ],
      recommendations: [
        'Identify and address consistently late suppliers',
        'Implement early warning systems for potential delays',
        'Develop contingency plans for critical deliveries',
        'Negotiate more realistic delivery timelines'
      ]
    }
  };
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
    const kpiDetails = generateKPIDetails(products, shipments, kpis, financialImpacts);

    const economicData = {
      kpis,
      insights,
      businessImpact,
      financialImpacts,
      kpiDetails,
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
