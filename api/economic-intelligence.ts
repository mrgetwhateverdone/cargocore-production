import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * This part of the code provides economic intelligence data for Vercel serverless deployment
 * Uses real TinyBird data to calculate supplier performance, cost trends, and business impacts
 */

// Import safe formatters to prevent null reference crashes
import { safeCleanMarkdown, safeDollarFormat, safeFormatAIText } from '../lib/safe-formatters';

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
 * This part of the code generates real AI recommendations for Economic Intelligence KPIs
 * Uses OpenAI to analyze data and provide actionable insights for workflow creation
 */
async function generateAIRecommendations(
  kpiId: string,
  kpiData: any,
  contextData: { shipments: number; performance: number; suppliers: number }
): Promise<string[]> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    console.warn('🤖 OpenAI API key not available, using fallback recommendations');
    return [
      'Implement performance monitoring dashboard',
      'Review supplier contracts and SLAs',
      'Optimize delivery routes and schedules',
      'Establish backup supplier relationships'
    ];
  }

  // This part of the code creates specific prompts for each KPI type
  const prompts = {
    'supplier-performance': `Based on supplier performance data (${contextData.performance}% on-time delivery, ${contextData.shipments} shipments, ${contextData.suppliers} suppliers), provide 2-4 clear, actionable recommendations.

Rules:
- Each recommendation must be a single, clear action
- No bullet points, asterisks, or formatting
- No explanations or implementation details
- 10-15 words maximum per recommendation
- Focus on immediate, practical actions

Example format:
Schedule monthly supplier performance review meetings
Implement backup suppliers for critical delivery routes
Negotiate delivery time buffers in all contracts`,

    'shipping-cost-impact': `Based on shipping cost data (${contextData.performance}% cost impact, ${contextData.shipments} shipments), provide 2-4 clear, actionable recommendations.

Rules:
- Each recommendation must be a single, clear action
- No bullet points, asterisks, or formatting
- No explanations or implementation details
- 10-15 words maximum per recommendation
- Focus on cost reduction actions

Example format:
Consolidate shipments to achieve volume discounts
Negotiate regional carrier contracts for better rates
Implement route optimization software for delivery planning`,

    'transportation-costs': `Based on transportation data (${contextData.performance}% cost trend, ${contextData.shipments} shipments), provide 2-4 clear, actionable recommendations.

Rules:
- Each recommendation must be a single, clear action
- No bullet points, asterisks, or formatting
- No explanations or implementation details
- 10-15 words maximum per recommendation
- Focus on transportation efficiency

Example format:
Optimize load planning to reduce empty miles
Review carrier contracts for better rate negotiations
Implement freight consolidation for smaller shipments`,

    'supply-chain-health': `Based on supply chain health data (${contextData.performance}% health score, ${contextData.shipments} shipments, ${contextData.suppliers} suppliers), provide 2-4 clear, actionable recommendations.

Rules:
- Each recommendation must be a single, clear action
- No bullet points, asterisks, or formatting
- No explanations or implementation details
- 10-15 words maximum per recommendation
- Focus on supply chain improvements

Example format:
Diversify supplier base to reduce concentration risk
Implement real-time inventory tracking across all locations
Establish contingency plans for critical supplier disruptions`
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
            content: "You are an expert 3PL operations consultant. Provide 2-4 clean, actionable recommendations. CRITICAL: No bullet points, no asterisks, no formatting. Each recommendation should be one simple sentence. No explanations or implementation details. Keep each under 15 words."
          },
          {
            role: "user", 
            content: prompts[kpiId as keyof typeof prompts] || prompts['supplier-performance']
          }
        ],
        max_tokens: 400,
        temperature: 0.3
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

    // This part of the code parses AI response into clean actionable recommendations
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
      .filter(line => line.length > 5 && line.length < 100)  // Reasonable length
      .slice(0, 4);  // Max 4 recommendations

    const recommendations = lines.length > 0 ? lines : [
      'Schedule monthly supplier performance review meetings',
      'Implement backup suppliers for critical delivery routes',
      'Negotiate delivery time buffers in all contracts'
    ];

    return recommendations;

  } catch (error) {
    console.error('❌ AI recommendation generation failed:', error);
    
    // This part of the code provides fallback recommendations
    const fallbackRecs = {
      'supplier-performance': [
        'Implement supplier scorecards for performance tracking',
        'Negotiate delivery time buffers in contracts',
        'Establish backup suppliers for critical SKUs',
        'Review and optimize supplier communication processes'
      ],
      'shipping-cost-impact': [
        'Consolidate shipments to reduce per-unit costs',
        'Negotiate volume discounts with carriers',
        'Implement route optimization software',
        'Review shipping zone strategies'
      ],
      'transportation-costs': [
        'Optimize load planning and consolidation',
        'Negotiate better carrier rates',
        'Implement transportation management system',
        'Review delivery scheduling efficiency'
      ],
      'supply-chain-health': [
        'Implement end-to-end supply chain visibility',
        'Diversify supplier base to reduce risk',
        'Establish performance monitoring KPIs',
        'Create contingency plans for disruptions'
      ]
    };

    return fallbackRecs[kpiId as keyof typeof fallbackRecs] || fallbackRecs['supplier-performance'];
  }
}

/**
 * This part of the code generates detailed KPI information for overlays with real AI recommendations
 */
async function generateKPIDetails(
  products: ProductData[],
  shipments: ShipmentData[],
  kpis: any,
  financialImpacts: any
) {
  const totalShipments = shipments.length;
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.active).length;
  
  // This part of the code generates AI recommendations for each KPI
  const supplierCount = new Set(shipments.map(s => s.supplier).filter(s => s)).size;
  
  const [
    supplierRecommendations,
    shippingRecommendations, 
    transportationRecommendations,
    supplyChainRecommendations,
    logisticsRecommendations,
    delayRecommendations
  ] = await Promise.all([
    generateAIRecommendations('supplier-performance', kpis, {
      shipments: totalShipments,
      performance: kpis.supplierPerformance,
      suppliers: supplierCount
    }),
    generateAIRecommendations('shipping-cost-impact', kpis, {
      shipments: totalShipments,
      performance: kpis.shippingCostImpact,
      suppliers: supplierCount
    }),
    generateAIRecommendations('transportation-costs', kpis, {
      shipments: totalShipments,
      performance: kpis.transportationCosts,
      suppliers: supplierCount
    }),
    generateAIRecommendations('supply-chain-health', kpis, {
      shipments: totalShipments,
      performance: kpis.supplyChainHealth,
      suppliers: supplierCount
    }),
    generateAIRecommendations('supplier-performance', kpis, {
      shipments: totalShipments,
      performance: kpis.logisticsCostEfficiency,
      suppliers: supplierCount
    }),
    generateAIRecommendations('supplier-performance', kpis, {
      shipments: totalShipments,
      performance: kpis.supplierDelayRate,
      suppliers: supplierCount
    })
  ]);

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
          value: supplierCount,
          description: 'Unique suppliers in your network'
        },
        {
          label: 'Average Delay',
          value: kpis.supplierDelayRate > 0 ? `${kpis.supplierDelayRate}%` : 'No delays',
          description: 'Percentage of shipments experiencing delays'
        }
      ],
      recommendations: supplierRecommendations
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
      recommendations: shippingRecommendations
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
      recommendations: supplyChainRecommendations
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
      recommendations: transportationRecommendations
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
      recommendations: logisticsRecommendations
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
      recommendations: delayRecommendations
    }
  };
}

/**
 * This part of the code generates AI-powered business impact analysis using real TinyBird data
 * Uses world-class prompts to provide actionable strategic insights
 */
async function generateBusinessImpactAnalysis(
  products: ProductData[],
  shipments: ShipmentData[],
  kpis: any,
  financialImpacts: any
) {
  const unfulfillableSkus = products.filter(p => !p.active).length;
  const totalProducts = products.length;
  const totalShipments = shipments.length;
  
  const delayedShipments = shipments.filter(s => {
    if (!s.expected_arrival_date || !s.arrival_date) return false;
    return new Date(s.arrival_date) > new Date(s.expected_arrival_date);
  }).length;

  // This part of the code analyzes supplier concentration risk
  const supplierCounts = shipments.reduce((acc, s) => {
    if (s.supplier) acc[s.supplier] = (acc[s.supplier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topSuppliers = Object.entries(supplierCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  const top3SupplierPercentage = topSuppliers.reduce((sum, [, count]) => sum + count, 0) / totalShipments * 100;

  // This part of the code analyzes brand concentration
  const brandCounts = products.reduce((acc, p) => {
    if (p.brand_name) acc[p.brand_name] = (acc[p.brand_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalBrands = Object.keys(brandCounts).length;
  const topBrands = Object.entries(brandCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  const top3BrandPercentage = topBrands.reduce((sum, [, count]) => sum + count, 0) / totalProducts * 100;

  // This part of the code calculates average costs for optimization opportunities
  const avgUnitCost = shipments.reduce((sum, s) => sum + (s.unit_cost || 0), 0) / totalShipments;
  const highCostShipments = shipments.filter(s => (s.unit_cost || 0) > avgUnitCost * 1.2).length;
  const highCostPercentage = (highCostShipments / totalShipments) * 100;

  // This part of the code generates dynamic key risks based on actual data analysis
  const keyRisks = [];
  
  if (kpis.shippingCostImpact > 120) {
    keyRisks.push(`Inventory management challenges compound with ${kpis.shippingCostImpact}% shipping cost increases`);
  }
  
  if (kpis.supplierPerformance < 80) {
    keyRisks.push(`${kpis.supplierPerformance}% supplier performance creates operational inefficiencies with ${delayedShipments}/${totalShipments} delayed shipments`);
  }
  
  if (top3SupplierPercentage > 60) {
    keyRisks.push(`Supplier concentration risk: Top 3 suppliers represent ${top3SupplierPercentage.toFixed(1)}% of shipments with ${kpis.supplierDelayRate}% delay rates`);
  }
  
  if (unfulfillableSkus > totalProducts * 0.1) {
    keyRisks.push(`Product availability crisis: ${unfulfillableSkus}/${totalProducts} SKUs inactive, impacting fulfillment capacity`);
  }
  
  if (kpis.logisticsCostEfficiency > 140) {
    keyRisks.push(`Operational cost surge: ${kpis.logisticsCostEfficiency}% logistics efficiency indicates process optimization needs`);
  }

  // This part of the code generates dynamic opportunity areas based on data insights
  const opportunityAreas = [];
  
  if (kpis.supplierDelayRate > 15) {
    opportunityAreas.push(`Negotiate supplier SLA improvements: ${kpis.supplierDelayRate}% delay rate provides leverage for better terms`);
  }
  
  if (unfulfillableSkus > 0) {
    opportunityAreas.push(`Implement AI-driven demand forecasting: ${unfulfillableSkus} inactive SKUs suggest inventory optimization potential`);
  }
  
  if (highCostPercentage > 20) {
    opportunityAreas.push(`Consolidate high-cost shipments: ${highCostPercentage.toFixed(1)}% of shipments exceed average costs by 20%+`);
  }
  
  if (totalBrands > 10 && top3BrandPercentage < 50) {
    opportunityAreas.push(`Optimize product portfolio: ${totalBrands} brands present diversification advantages during market volatility`);
  }
  
  if (kpis.transportationCosts > 130) {
    opportunityAreas.push(`Explore alternative shipping routes: ${kpis.transportationCosts}% transportation costs indicate route optimization opportunities`);
  }
  
  // This part of the code ensures we always have actionable opportunities
  if (opportunityAreas.length < 3) {
    opportunityAreas.push("Leverage data analytics to identify cost reduction patterns across operations");
    if (opportunityAreas.length < 3) {
      opportunityAreas.push("Establish performance benchmarks to track operational efficiency improvements");
    }
  }

  // This part of the code generates AI-powered executive summary and strategic insights
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (openaiApiKey) {
    try {
      const contextData = {
        totalProducts,
        totalShipments,
        unfulfillableSkus,
        delayedShipments,
        top3SupplierPercentage: Math.round(top3SupplierPercentage),
        top3BrandPercentage: Math.round(top3BrandPercentage),
        highCostPercentage: Math.round(highCostPercentage),
        totalBrands,
        avgUnitCost: Math.round(avgUnitCost),
        ...kpis,
        ...financialImpacts
      };

      const businessAnalysisPrompt = `
WORLD-CLASS ECONOMIC INTELLIGENCE ANALYSIS

You are a senior management consultant with 20+ years of experience in 3PL operations and economic intelligence. Analyze the following real operational data and provide strategic business impact analysis.

OPERATIONAL DATA:
- Total Products: ${totalProducts} SKUs (${unfulfillableSkus} inactive)
- Total Shipments: ${totalShipments} (${delayedShipments} delayed)
- Supplier Performance: ${kpis.supplierPerformance}%
- Shipping Cost Impact: ${kpis.shippingCostImpact}%
- Transportation Costs: ${kpis.transportationCosts}%
- Supply Chain Health: ${kpis.supplyChainHealth}%
- Logistics Cost Efficiency: ${kpis.logisticsCostEfficiency}%
- Financial Impact: $${financialImpacts.totalFinancialRisk.toLocaleString()}
- Brand Portfolio: ${totalBrands} brands (top 3: ${Math.round(top3BrandPercentage)}%)
- Supplier Concentration: Top 3 suppliers represent ${Math.round(top3SupplierPercentage)}%
- High-Cost Shipments: ${Math.round(highCostPercentage)}% exceed average cost

PROVIDE:
1. EXECUTIVE_SUMMARY: 3-4 sentences analyzing the overall operational health, critical risks, and strategic priorities (150-200 words)
2. KEY_RISKS: 3-4 specific operational risks with quantified impact and urgency (each 15-25 words)
3. OPPORTUNITY_AREAS: 3-4 actionable opportunities with potential value creation (each 15-25 words)

FORMAT:
Use | as delimiter:
EXECUTIVE_SUMMARY|[summary]|KEY_RISKS|[risk1]|[risk2]|[risk3]|OPPORTUNITY_AREAS|[opp1]|[opp2]|[opp3]

REQUIREMENTS:
- Reference specific metrics and percentages from the data
- Focus on financial impact and ROI potential
- Provide actionable insights for C-level executives
- Include urgency indicators for risks
- Quantify opportunities where possible`;

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
              content: "You are a world-class management consultant specializing in 3PL operations and economic intelligence. Provide data-driven strategic analysis with specific recommendations."
            },
            {
              role: "user",
              content: businessAnalysisPrompt
            }
          ],
          max_tokens: 800,
          temperature: 0.2
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content;
        
        if (aiResponse) {
          const parts = aiResponse.split('|');
          
          // Parse AI response
          let aiExecutiveSummary = '';
          let aiKeyRisks: string[] = [];
          let aiOpportunityAreas: string[] = [];
          
          for (let i = 0; i < parts.length; i++) {
            if (parts[i] === 'EXECUTIVE_SUMMARY' && parts[i + 1]) {
              aiExecutiveSummary = parts[i + 1].trim();
            } else if (parts[i] === 'KEY_RISKS') {
              for (let j = i + 1; j < parts.length && parts[j] !== 'OPPORTUNITY_AREAS'; j++) {
                if (parts[j].trim() && parts[j] !== 'KEY_RISKS') {
                  aiKeyRisks.push(parts[j].trim());
                }
              }
            } else if (parts[i] === 'OPPORTUNITY_AREAS') {
              for (let j = i + 1; j < parts.length; j++) {
                if (parts[j].trim() && parts[j] !== 'OPPORTUNITY_AREAS') {
                  aiOpportunityAreas.push(parts[j].trim());
                }
              }
            }
          }
          
          // Use AI-generated content if available, otherwise fallback to calculated values
          return {
            executiveSummary: safeFormatAIText(aiExecutiveSummary) || `Real-time Analysis: Current operational data reveals ${keyRisks.length} critical risk factors requiring attention. With ${kpis.shippingCostImpact}% shipping cost impact and ${kpis.supplierPerformance}% supplier performance across ${totalShipments} shipments, strategic intervention can address ${unfulfillableSkus} inactive SKUs and optimize ${totalBrands} brand portfolio for enhanced operational resilience.`,
            keyRisks: aiKeyRisks.length > 0 ? aiKeyRisks.map(risk => safeFormatAIText(risk)) : keyRisks,
            opportunityAreas: aiOpportunityAreas.length > 0 ? aiOpportunityAreas.map(opp => safeFormatAIText(opp)) : opportunityAreas
          };
        }
      }
    } catch (error) {
      console.error('AI business analysis generation failed:', error);
    }
  }

  // Fallback to calculated values if AI generation fails
  return {
    executiveSummary: `Real-time Analysis: Current operational data reveals ${keyRisks.length} critical risk factors requiring attention. With ${kpis.shippingCostImpact}% shipping cost impact and ${kpis.supplierPerformance}% supplier performance across ${totalShipments} shipments, strategic intervention can address ${unfulfillableSkus} inactive SKUs and optimize ${totalBrands} brand portfolio for enhanced operational resilience.`,
    keyRisks: keyRisks.map(risk => safeFormatAIText(risk)),
    opportunityAreas: opportunityAreas.map(opp => safeFormatAIText(opp))
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
    const businessImpact = await generateBusinessImpactAnalysis(products, shipments, kpis, financialImpacts);
    const kpiDetails = await generateKPIDetails(products, shipments, kpis, financialImpacts);

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
