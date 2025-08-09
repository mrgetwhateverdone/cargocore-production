import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { 
  EconomicKPIs, 
  EconomicData, 
  AIInsight, 
  GlobalEconomicMetrics,
  BusinessImpactAnalysis,
  BusinessImpactCard,
  EconomicForecast,
  RiskOpportunityAnalysis,
  RiskItem,
  OpportunityItem
} from "../client/types/api";

/**
 * This part of the code provides economic intelligence data endpoint for Vercel serverless deployment
 * Uses OpenAI Web Search for real-time economic data and correlates with operational metrics
 */

// TinyBird Shipments API Response - reuse existing interface
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

/**
 * This part of the code fetches shipment data from TinyBird API using proven working pattern
 */
async function fetchShipments(): Promise<ShipmentData[]> {
  const baseUrl = process.env.WAREHOUSE_BASE_URL;
  const token = process.env.WAREHOUSE_TOKEN;

  if (!baseUrl || !token) {
    console.error("❌ Vercel API: WAREHOUSE_BASE_URL and WAREHOUSE_TOKEN environment variables are required");
    return [];
  }

  try {
    console.log("🔒 Vercel API: Fetching shipments data from TinyBird...");
    
    const url = `${baseUrl}/v0/pipes/inbound_shipments_details_mv.json?token=${token}&company_url=COMP002_3PL&limit=1000`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TinyBird API Error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    const shipments = result.data || [];
    
    console.log(`✅ Vercel API: Fetched ${shipments.length} shipments from TinyBird`);
    return shipments;
  } catch (error) {
    console.error("❌ Vercel API: Failed to fetch shipments data:", error);
    return [];
  }
}

/**
 * This part of the code fetches real-time economic data using OpenAI Web Search
 */
async function fetchEconomicDataWithWebSearch(): Promise<GlobalEconomicMetrics> {
  const openaiApiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1/responses";
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    console.error("❌ Vercel API: OPENAI_API_KEY environment variable is required");
    return {
      portCongestionIndex: 0,
      freightCostTrend: 0,
      fuelPriceIndex: 0,
      globalTradeIndex: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    console.log("🔒 Vercel API: Fetching real-time economic data via OpenAI Web Search...");

    // This part of the code creates the economic intelligence web search query
    const economicQuery = `
      Current global economic indicators for logistics and supply chain December 2024:
      1. Global port congestion index and shipping delays percentage
      2. Freight shipping cost trends and percentage changes this month  
      3. Current fuel price impact on transportation costs percentage
      4. Global supply chain health and trade disruption levels index
      
      Provide specific numerical data for each metric.
    `;

    const response = await fetch(openaiApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        tools: [{
          type: "web_search_preview",
          search_context_size: "high"
        }],
        input: economicQuery
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const economicData = result.output_text || "";
    
    console.log("✅ Vercel API: Economic data received from OpenAI Web Search");
    
    // This part of the code parses economic data from AI response
    return parseEconomicDataFromAI(economicData);
    
  } catch (error) {
    console.error("❌ Vercel API: Failed to fetch economic data:", error);
    // Return safe defaults with current timestamp
    return {
      portCongestionIndex: 0,
      freightCostTrend: 0,
      fuelPriceIndex: 0,
      globalTradeIndex: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * This part of the code parses economic metrics from AI web search response
 */
function parseEconomicDataFromAI(aiResponse: string): GlobalEconomicMetrics {
  // This part of the code extracts numeric values from AI response using regex patterns
  const portCongestionMatch = aiResponse.match(/port\s+congestion.+?(\d+(?:\.\d+)?)/i);
  const freightCostMatch = aiResponse.match(/freight.+?cost.+?(\-?\d+(?:\.\d+)?)\%?/i);
  const fuelPriceMatch = aiResponse.match(/fuel.+?price.+?(\-?\d+(?:\.\d+)?)\%?/i);
  const tradeHealthMatch = aiResponse.match(/trade.+?health.+?(\d+(?:\.\d+)?)/i);

  return {
    portCongestionIndex: portCongestionMatch ? Math.min(100, Math.max(0, parseFloat(portCongestionMatch[1]))) : 45,
    freightCostTrend: freightCostMatch ? Math.min(50, Math.max(-50, parseFloat(freightCostMatch[1]))) : 2.1,
    fuelPriceIndex: fuelPriceMatch ? Math.min(50, Math.max(-50, parseFloat(fuelPriceMatch[1]))) : 1.8,
    globalTradeIndex: tradeHealthMatch ? Math.min(100, Math.max(0, parseFloat(tradeHealthMatch[1]))) : 72,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * This part of the code calculates economic KPIs based on web search data
 */
function calculateEconomicKPIs(globalMetrics: GlobalEconomicMetrics): EconomicKPIs {
  return {
    supplierPerformance: globalMetrics.portCongestionIndex,
    shippingCostImpact: globalMetrics.freightCostTrend,
    transportationCosts: globalMetrics.fuelPriceIndex,
    supplyChainHealth: globalMetrics.globalTradeIndex,
  };
}

/**
 * This part of the code generates business impact analysis using economic and operational data
 */
async function generateBusinessImpactAnalysis(
  globalMetrics: GlobalEconomicMetrics,
  shipments: ShipmentData[]
): Promise<BusinessImpactAnalysis> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const openaiApiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";

  if (!openaiApiKey) {
    return {
      executiveSummary: "Business impact analysis requires OpenAI API configuration",
      impactCards: []
    };
  }

  try {
    // This part of the code calculates operational metrics for correlation
    const totalShipments = shipments.length;
    const avgCost = shipments.reduce((sum, s) => sum + (s.unit_cost || 0), 0) / Math.max(totalShipments, 1);
    const delayedShipments = shipments.filter(s => {
      if (!s.expected_arrival_date || !s.arrival_date) return false;
      return new Date(s.arrival_date) > new Date(s.expected_arrival_date);
    }).length;
    const delayRate = (delayedShipments / Math.max(totalShipments, 1)) * 100;

    const businessAnalysisPrompt = `
    As an Economic Intelligence Agent, analyze current economic conditions and their business impact:
    
    Economic Data:
    - Port Congestion Index: ${globalMetrics.portCongestionIndex}/100
    - Freight Cost Trend: ${globalMetrics.freightCostTrend}%
    - Fuel Price Impact: ${globalMetrics.fuelPriceIndex}%
    - Global Trade Health: ${globalMetrics.globalTradeIndex}/100
    
    Operational Context:
    - Total Shipments: ${totalShipments}
    - Average Unit Cost: $${avgCost.toFixed(2)}
    - Delayed Shipments: ${delayedShipments} (${delayRate.toFixed(1)}%)
    
    Provide:
    1. Executive Summary (2-3 sentences on overall economic impact)
    2. 2-3 Business Impact Cards with specific dollar amounts and timeframes
    
    Format as JSON:
    {
      "executiveSummary": "string",
      "impactCards": [
        {
          "title": "string",
          "impact": "High|Medium|Low",
          "costImpact": number,
          "timeframe": "string",
          "description": "string",
          "recommendations": ["string", "string"]
        }
      ]
    }
    `;

    const response = await fetch(openaiApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an Economic Intelligence Agent that correlates global economic trends with operational logistics performance. Provide specific, actionable business impact analysis with realistic cost estimates."
          },
          {
            role: "user",
            content: businessAnalysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const result = await response.json();
    const aiContent = result.choices?.[0]?.message?.content || "";
    
    try {
      const parsed = JSON.parse(aiContent);
      return {
        executiveSummary: parsed.executiveSummary || "",
        impactCards: parsed.impactCards || []
      };
    } catch (parseError) {
      console.error("❌ Failed to parse AI response as JSON:", parseError);
      return {
        executiveSummary: "Economic conditions show mixed signals with potential supply chain impacts requiring operational adjustments.",
        impactCards: []
      };
    }

  } catch (error) {
    console.error("❌ Vercel API: Failed to generate business impact analysis:", error);
    return {
      executiveSummary: "Economic analysis temporarily unavailable. Monitor key metrics and maintain operational flexibility.",
      impactCards: []
    };
  }
}

/**
 * This part of the code generates economic insights using OpenAI
 */
async function generateEconomicInsights(
  globalMetrics: GlobalEconomicMetrics,
  shipments: ShipmentData[]
): Promise<AIInsight[]> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const openaiApiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";

  if (!openaiApiKey) {
    return [{
      id: "economic_insight_1",
      type: "economic_analysis",
      title: "Economic Intelligence Configuration Required",
      description: "OpenAI API key required for real-time economic intelligence analysis",
      severity: "medium" as const,
      dollarImpact: 0,
      source: "economic_agent" as const,
      suggestedActions: ["Configure OpenAI API key for economic analysis"],
      timestamp: new Date().toISOString(),
    }];
  }

  try {
    const totalShipments = shipments.length;
    const avgCost = shipments.reduce((sum, s) => sum + (s.unit_cost || 0), 0) / Math.max(totalShipments, 1);

    const insightPrompt = `
    As an Economic Intelligence Agent, generate 2-3 strategic insights based on:
    
    Economic Conditions:
    - Port Congestion: ${globalMetrics.portCongestionIndex}/100
    - Freight Costs: ${globalMetrics.freightCostTrend}% trend
    - Fuel Prices: ${globalMetrics.fuelPriceIndex}% impact
    - Trade Health: ${globalMetrics.globalTradeIndex}/100
    
    Operational Data:
    - Shipments: ${totalShipments}
    - Avg Cost: $${avgCost.toFixed(2)}
    
    Format as JSON array:
    [
      {
        "title": "string",
        "description": "string", 
        "severity": "high|medium|low",
        "dollarImpact": number,
        "suggestedActions": ["action1", "action2", "action3"]
      }
    ]
    `;

    const response = await fetch(openaiApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system", 
            content: "You are an Economic Intelligence Agent providing strategic logistics insights. Focus on actionable recommendations with realistic financial impacts."
          },
          {
            role: "user",
            content: insightPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const result = await response.json();
    const aiContent = result.choices?.[0]?.message?.content || "";
    
    try {
      const parsed = JSON.parse(aiContent);
      return parsed.map((insight: any, index: number) => ({
        id: `economic_insight_${index + 1}`,
        type: "economic_analysis",
        title: insight.title || "Economic Analysis",
        description: insight.description || "",
        severity: insight.severity || "medium",
        dollarImpact: insight.dollarImpact || 0,
        source: "economic_agent" as const,
        suggestedActions: insight.suggestedActions || [],
        timestamp: new Date().toISOString(),
      }));
    } catch (parseError) {
      console.error("❌ Failed to parse AI insights response:", parseError);
      return [];
    }

  } catch (error) {
    console.error("❌ Vercel API: Failed to generate economic insights:", error);
    return [];
  }
}

/**
 * This part of the code generates placeholder forecasts and risk analysis
 */
function generateForecastsAndRisks(globalMetrics: GlobalEconomicMetrics): {
  forecasts: EconomicForecast[];
  risksOpportunities: RiskOpportunityAnalysis;
} {
  const forecasts: EconomicForecast[] = [
    {
      id: "forecast_1",
      title: "Freight Cost Projection",
      forecast: `Based on current ${globalMetrics.freightCostTrend}% freight cost trend, expect continued pressure on shipping rates through Q1 2025.`,
      confidence: globalMetrics.freightCostTrend > 5 ? "High" : "Medium",
      timeframe: "Next 3 months",
      impactLevel: Math.abs(globalMetrics.freightCostTrend) > 10 ? "High" : "Medium",
      contextualActions: [
        "Review freight contracts for rate escalation clauses",
        "Evaluate alternative shipping routes",
        "Consider freight consolidation strategies"
      ]
    },
    {
      id: "forecast_2", 
      title: "Port Congestion Outlook",
      forecast: `Current congestion index of ${globalMetrics.portCongestionIndex}/100 suggests ${globalMetrics.portCongestionIndex > 70 ? 'continued delays' : 'improving conditions'} at major ports.`,
      confidence: "Medium",
      timeframe: "Next 6 weeks", 
      impactLevel: globalMetrics.portCongestionIndex > 70 ? "High" : "Low",
      contextualActions: [
        "Monitor alternative port options",
        "Adjust inventory planning for delays",
        "Communicate timeline changes to customers"
      ]
    }
  ];

  const risks: RiskItem[] = [];
  const opportunities: OpportunityItem[] = [];

  // This part of the code adds dynamic risks based on economic conditions
  if (globalMetrics.portCongestionIndex > 60) {
    risks.push({
      title: "Port Congestion Impact",
      description: `High port congestion (${globalMetrics.portCongestionIndex}/100) may cause significant shipping delays`,
      severity: globalMetrics.portCongestionIndex > 80 ? "High" : "Medium",
      mitigation: [
        "Diversify port usage across regions",
        "Increase safety stock levels",
        "Implement early warning systems"
      ]
    });
  }

  if (globalMetrics.freightCostTrend > 5) {
    risks.push({
      title: "Rising Freight Costs",
      description: `Freight costs trending up ${globalMetrics.freightCostTrend}% may impact margins`,
      severity: globalMetrics.freightCostTrend > 15 ? "High" : "Medium", 
      mitigation: [
        "Negotiate fixed-rate contracts",
        "Optimize shipment consolidation",
        "Review pricing strategies"
      ]
    });
  } else if (globalMetrics.freightCostTrend < -3) {
    opportunities.push({
      title: "Favorable Freight Rates",
      description: `Declining freight costs (${globalMetrics.freightCostTrend}%) create margin expansion opportunities`,
      potential: Math.abs(globalMetrics.freightCostTrend) > 10 ? "High" : "Medium",
      strategies: [
        "Lock in favorable long-term rates",
        "Expand shipping volume",
        "Explore new market opportunities"
      ]
    });
  }

  return {
    forecasts,
    risksOpportunities: { risks, opportunities }
  };
}

/**
 * Main API handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // This part of the code handles CORS and method validation
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    console.log("🔒 Vercel API: Economic Intelligence endpoint called");

    // This part of the code fetches all required data in parallel
    const [shipments, globalMetrics] = await Promise.all([
      fetchShipments(),
      fetchEconomicDataWithWebSearch()
    ]);

    // This part of the code calculates economic KPIs
    const kpis = calculateEconomicKPIs(globalMetrics);

    // This part of the code generates AI analysis
    const [businessImpact, insights] = await Promise.all([
      generateBusinessImpactAnalysis(globalMetrics, shipments),
      generateEconomicInsights(globalMetrics, shipments)
    ]);

    // This part of the code generates forecasts and risks
    const { forecasts, risksOpportunities } = generateForecastsAndRisks(globalMetrics);

    // This part of the code assembles the complete economic data response
    const economicData: EconomicData = {
      kpis,
      insights,
      globalMetrics,
      businessImpact,
      forecasts,
      risksOpportunities,
      lastUpdated: new Date().toISOString(),
    };

    console.log("✅ Vercel API: Economic intelligence data assembled successfully");

    return res.status(200).json({
      success: true,
      data: economicData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("❌ Vercel API: Economic intelligence endpoint error:", error);
    
    return res.status(500).json({
      success: false,
      error: "Failed to generate economic intelligence data",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}
