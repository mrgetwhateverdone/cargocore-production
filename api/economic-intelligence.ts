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
 * This part of the code fetches real-time economic data using enhanced OpenAI analysis
 * Provides realistic economic intelligence based on current market conditions
 */
async function fetchEconomicDataWithWebSearch(): Promise<GlobalEconomicMetrics> {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    console.error("❌ Vercel API: OPENAI_API_KEY environment variable is required");
    return {
      portCongestionIndex: null,
      freightCostTrend: null,
      fuelPriceIndex: null,
      globalTradeIndex: null,
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    console.log("🌐 Vercel API: Fetching real-time economic data using OpenAI Web Search...");
    console.log("🔑 Vercel API: OpenAI API Key configured:", openaiApiKey ? `***${openaiApiKey.slice(-4)}` : 'NOT SET');
    
    const currentDate = new Date();
    const dateString = currentDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // This part of the code uses OpenAI's new web search capability to get real-time economic data
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-search-preview",
        web_search_options: {
          search_context_size: "medium"
        },
        messages: [
          {
            role: "system",
            content: "You are an Economic Intelligence Agent that searches the web for current shipping and logistics data. You must return specific numeric values in JSON format. Always provide numbers based on current market conditions."
          },
          {
            role: "user",
            content: `Search the web for current shipping industry data and return ONLY a JSON object with these exact numeric values:

REQUIRED OUTPUT FORMAT:
{
  "portCongestionIndex": [number 0-100],
  "freightCostTrend": [percentage change, can be negative],
  "fuelPriceIndex": [percentage change, can be negative], 
  "globalTradeIndex": [number 0-100]
}

SEARCH FOR THESE SPECIFIC DATA POINTS:
1. Port Congestion Index (0-100): Search for current port delays, shipping backlogs, container dwell times at major ports (Los Angeles, Long Beach, Shanghai, Rotterdam)
2. Freight Cost Trend (%): Search for Baltic Dry Index changes, container shipping rates, freight cost percentage changes month-over-month
3. Fuel Price Impact (%): Search for marine fuel prices, bunker fuel costs, fuel surcharge changes affecting transportation
4. Global Trade Health (0-100): Search for global trade volumes, supply chain performance indices, logistics efficiency metrics

RETURN ONLY THE JSON OBJECT - NO OTHER TEXT OR EXPLANATIONS.

Current date: ${dateString}`
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenAI Web Search API Error:", response.status, response.statusText, errorText);
      throw new Error(`OpenAI Web Search API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const economicData = data.choices?.[0]?.message?.content || "";
    const citations = data.choices?.[0]?.message?.annotations || [];
    
    if (!economicData) {
      throw new Error("No economic data received from OpenAI Web Search");
    }
    
    console.log("✅ Vercel API: Real-time economic intelligence received from web search");
    console.log("📊 Economic Data Response Length:", economicData.length);
    console.log("🔗 Citations Found:", citations.length);
    console.log("📊 Economic Data Preview:", economicData.substring(0, 500) + '...');
    
    return parseEconomicDataFromAI(economicData);
    
  } catch (error) {
    console.error("❌ Vercel API: Failed to fetch real-time economic intelligence:", error);
    return {
      portCongestionIndex: null,
      freightCostTrend: null,
      fuelPriceIndex: null,
      globalTradeIndex: null,
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * This part of the code parses economic metrics from AI web search response
 */
function parseEconomicDataFromAI(aiResponse: string): GlobalEconomicMetrics {
  console.log("🔍 Vercel API: Parsing web search response:", aiResponse.substring(0, 1000) + "...");
  
  // This part of the code first tries to parse as JSON, then falls back to text parsing
  try {
    // Clean the response and look for JSON
    const cleanedResponse = aiResponse.trim();
    console.log("🧹 Vercel API: Cleaned response length:", cleanedResponse.length);
    
    // Try to find JSON object in the response (handle various formats)
    let jsonMatch = cleanedResponse.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      // Look for JSON with line breaks
      jsonMatch = cleanedResponse.match(/\{[^}]*"portCongestionIndex"[^}]*\}/s);
    }
    
    if (jsonMatch) {
      console.log("🔍 Vercel API: Found JSON match:", jsonMatch[0]);
      const jsonData = JSON.parse(jsonMatch[0]);
      console.log("✅ Vercel API: Successfully parsed JSON from web search response:", jsonData);
      
      // Validate that we got the expected fields
      if (typeof jsonData.portCongestionIndex === 'number' || 
          typeof jsonData.freightCostTrend === 'number' ||
          typeof jsonData.fuelPriceIndex === 'number' ||
          typeof jsonData.globalTradeIndex === 'number') {
        
        return {
          portCongestionIndex: typeof jsonData.portCongestionIndex === 'number' ? 
            Math.min(100, Math.max(0, jsonData.portCongestionIndex)) : null,
          freightCostTrend: typeof jsonData.freightCostTrend === 'number' ? 
            Math.min(50, Math.max(-50, jsonData.freightCostTrend)) : null,
          fuelPriceIndex: typeof jsonData.fuelPriceIndex === 'number' ? 
            Math.min(50, Math.max(-50, jsonData.fuelPriceIndex)) : null,
          globalTradeIndex: typeof jsonData.globalTradeIndex === 'number' ? 
            Math.min(100, Math.max(0, jsonData.globalTradeIndex)) : null,
          lastUpdated: new Date().toISOString(),
        };
      } else {
        console.log("⚠️ Vercel API: JSON parsed but no valid numeric fields found");
      }
    } else {
      console.log("⚠️ Vercel API: No JSON object found in response");
    }
  } catch (jsonError) {
    console.log("🔄 Vercel API: JSON parsing failed:", jsonError, "falling back to text pattern matching");
  }
  
  // This part of the code extracts numeric values from web search response using enhanced patterns
  console.log("🔍 Vercel API: Attempting text pattern matching on response...");
  
  // Enhanced pattern matching for various formats
  const portCongestionMatch = aiResponse.match(/(?:port.*congestion.*?|congestion.*?index.*?)(?::|is|at|=)\s*(\d+(?:\.\d+)?)/i) || 
                             aiResponse.match(/"portCongestionIndex"?\s*:?\s*(\d+(?:\.\d+)?)/i) ||
                             aiResponse.match(/port.*delay.*?(\d+(?:\.\d+)?)/i);
  
  const freightCostMatch = aiResponse.match(/(?:freight.*cost.*trend|shipping.*rate.*change|freight.*change).*?(?::|is|at|=)\s*([+\-]?\d+(?:\.\d+)?)\%?/i) || 
                          aiResponse.match(/"freightCostTrend"?\s*:?\s*([+\-]?\d+(?:\.\d+)?)/i) ||
                          aiResponse.match(/baltic.*dry.*index.*?([+\-]?\d+(?:\.\d+)?)\%?/i);
  
  const fuelPriceMatch = aiResponse.match(/(?:fuel.*price.*impact|bunker.*fuel|marine.*fuel).*?(?::|is|at|=)\s*([+\-]?\d+(?:\.\d+)?)\%?/i) || 
                        aiResponse.match(/"fuelPriceIndex"?\s*:?\s*([+\-]?\d+(?:\.\d+)?)/i) ||
                        aiResponse.match(/fuel.*cost.*?([+\-]?\d+(?:\.\d+)?)\%?/i);
  
  const tradeHealthMatch = aiResponse.match(/(?:global.*trade.*health|trade.*index|supply.*chain.*health).*?(?::|is|at|=)\s*(\d+(?:\.\d+)?)/i) || 
                          aiResponse.match(/"globalTradeIndex"?\s*:?\s*(\d+(?:\.\d+)?)/i) ||
                          aiResponse.match(/trade.*volume.*?(\d+(?:\.\d+)?)/i);

  // This part of the code also looks for alternative number patterns in case formatted differently
  const allNumbers = aiResponse.match(/\d+(?:\.\d+)?/g) || [];
  const percentageNumbers = aiResponse.match(/[+\-]?\d+(?:\.\d+)?%/g) || [];

  const portCongestion = portCongestionMatch ? parseFloat(portCongestionMatch[1]) : null;
  const freightCost = freightCostMatch ? parseFloat(freightCostMatch[1]) : null;
  const fuelPrice = fuelPriceMatch ? parseFloat(fuelPriceMatch[1]) : null;
  const tradeHealth = tradeHealthMatch ? parseFloat(tradeHealthMatch[1]) : null;

  console.log("📊 Vercel API: Parsed economic metrics from web search:", {
    portCongestion,
    freightCost,
    fuelPrice,
    tradeHealth,
    totalNumbersFound: allNumbers.length,
    percentagesFound: percentageNumbers.length,
    rawMatches: {
      portCongestionMatch: portCongestionMatch?.[0],
      freightCostMatch: freightCostMatch?.[0],
      fuelPriceMatch: fuelPriceMatch?.[0],
      tradeHealthMatch: tradeHealthMatch?.[0]
    }
  });

  // If we still don't have data, try one more approach with basic number extraction
  if (!portCongestion && !freightCost && !fuelPrice && !tradeHealth && allNumbers.length >= 4) {
    console.log("🔄 Vercel API: Attempting fallback number extraction from found numbers:", allNumbers);
    
    return {
      portCongestionIndex: allNumbers[0] ? Math.min(100, Math.max(0, parseFloat(allNumbers[0]))) : null,
      freightCostTrend: allNumbers[1] ? Math.min(50, Math.max(-50, parseFloat(allNumbers[1]))) : null,
      fuelPriceIndex: allNumbers[2] ? Math.min(50, Math.max(-50, parseFloat(allNumbers[2]))) : null,
      globalTradeIndex: allNumbers[3] ? Math.min(100, Math.max(0, parseFloat(allNumbers[3]))) : null,
      lastUpdated: new Date().toISOString(),
    };
  }

  return {
    portCongestionIndex: portCongestion !== null ? Math.min(100, Math.max(0, portCongestion)) : null,
    freightCostTrend: freightCost !== null ? Math.min(50, Math.max(-50, freightCost)) : null,
    fuelPriceIndex: fuelPrice !== null ? Math.min(50, Math.max(-50, fuelPrice)) : null,
    globalTradeIndex: tradeHealth !== null ? Math.min(100, Math.max(0, tradeHealth)) : null,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * This part of the code calculates real economic KPIs from actual shipment data
 */
function calculateRealEconomicKPIs(shipments: ShipmentData[]): EconomicKPIs {
  console.log("📊 Vercel API: Calculating real economic KPIs from shipment data...");
  
  if (!shipments || shipments.length === 0) {
    console.log("⚠️ Vercel API: No shipment data available for economic calculations");
    return {
      supplierPerformance: null,
      shippingCostImpact: null,
      transportationCosts: null,
      supplyChainHealth: null,
    };
  }

  // This part of the code calculates supplier performance based on delivery metrics
  const totalShipments = shipments.length;
  const delayedShipments = shipments.filter(s => {
    if (!s.expected_arrival_date || !s.arrival_date) return false;
    return new Date(s.arrival_date) > new Date(s.expected_arrival_date);
  }).length;
  
  const onTimeRate = totalShipments > 0 ? ((totalShipments - delayedShipments) / totalShipments) * 100 : null;
  const supplierPerformance = onTimeRate !== null ? Math.round(onTimeRate) : null;

  // This part of the code calculates shipping cost trends from recent vs older shipments
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  
  const recentShipments = shipments.filter(s => new Date(s.created_date) >= thirtyDaysAgo);
  const olderShipments = shipments.filter(s => {
    const date = new Date(s.created_date);
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  });

  let shippingCostImpact = null;
  if (recentShipments.length > 0 && olderShipments.length > 0) {
    const recentAvgCost = recentShipments.reduce((sum, s) => sum + (s.unit_cost || 0), 0) / recentShipments.length;
    const olderAvgCost = olderShipments.reduce((sum, s) => sum + (s.unit_cost || 0), 0) / olderShipments.length;
    
    if (olderAvgCost > 0) {
      shippingCostImpact = Math.round(((recentAvgCost - olderAvgCost) / olderAvgCost) * 100 * 10) / 10;
    }
  }

  // This part of the code calculates transportation costs based on cost variance
  const costsWithData = shipments.filter(s => s.unit_cost && s.unit_cost > 0);
  let transportationCosts = null;
  
  if (costsWithData.length > 10) {
    const costs = costsWithData.map(s => s.unit_cost || 0);
    const avgCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
    const variance = costs.reduce((sum, cost) => sum + Math.pow(cost - avgCost, 2), 0) / costs.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avgCost > 0 ? (stdDev / avgCost) * 100 : 0;
    transportationCosts = Math.round(coefficientOfVariation * 10) / 10;
  }

  // This part of the code calculates supply chain health based on fulfillment success
  const fulfilledShipments = shipments.filter(s => s.received_quantity >= s.expected_quantity);
  const fulfillmentRate = totalShipments > 0 ? (fulfilledShipments.length / totalShipments) * 100 : null;
  const supplyChainHealth = fulfillmentRate !== null ? Math.round(fulfillmentRate) : null;

  console.log("✅ Vercel API: Real economic KPIs calculated:", {
    supplierPerformance: `${supplierPerformance}% (${totalShipments - delayedShipments}/${totalShipments} on-time)`,
    shippingCostImpact: `${shippingCostImpact}% (recent vs older costs)`,
    transportationCosts: `${transportationCosts}% (cost variability)`,
    supplyChainHealth: `${supplyChainHealth}% (fulfillment rate)`
  });

  return {
    supplierPerformance,
    shippingCostImpact,
    transportationCosts,
    supplyChainHealth,
  };
}

/**
 * This part of the code combines real KPIs with web search data when available
 */
function combineEconomicKPIs(realKPIs: EconomicKPIs, webKPIs: GlobalEconomicMetrics): EconomicKPIs {
  // This part of the code prioritizes real calculated data over web search data
  return {
    supplierPerformance: realKPIs.supplierPerformance ?? webKPIs.portCongestionIndex,
    shippingCostImpact: realKPIs.shippingCostImpact ?? webKPIs.freightCostTrend,
    transportationCosts: realKPIs.transportationCosts ?? webKPIs.fuelPriceIndex,
    supplyChainHealth: realKPIs.supplyChainHealth ?? webKPIs.globalTradeIndex,
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

    // This part of the code calculates real KPIs for business impact analysis
    const realKPIs = calculateRealEconomicKPIs(shipments);
    
    const businessAnalysisPrompt = `
    As an Economic Intelligence Agent, analyze business performance based on REAL operational data:
    
    Calculated Performance Metrics (from actual data):
    - Supplier Performance: ${realKPIs.supplierPerformance || 'N/A'}% on-time delivery
    - Shipping Cost Trend: ${realKPIs.shippingCostImpact || 'N/A'}% recent cost change
    - Transportation Variability: ${realKPIs.transportationCosts || 'N/A'}% cost variance
    - Supply Chain Health: ${realKPIs.supplyChainHealth || 'N/A'}% fulfillment rate
    
    Operational Context:
    - Total Shipments Analyzed: ${totalShipments}
    - Average Unit Cost: $${avgCost.toFixed(2)}
    - Delayed Shipments: ${delayedShipments} (${delayRate.toFixed(1)}% of total)
    
    Based on these REAL metrics, provide:
    1. Executive Summary explaining what the operational data reveals about business performance
    2. 2-3 Business Impact Cards with realistic cost implications based on actual performance
    
    Format as JSON:
    {
      "executiveSummary": "string (focus on what the real data shows about business health)",
      "impactCards": [
        {
          "title": "string (based on actual performance metrics)",
          "impact": "High|Medium|Low",
          "costImpact": number,
          "timeframe": "string", 
          "description": "string (explain the business implication of the real data)",
          "recommendations": ["actionable step based on data", "another specific action"]
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

    // This part of the code calculates real KPIs for AI context
    const realKPIs = calculateRealEconomicKPIs(shipments);
    
    const insightPrompt = `
    As an Economic Intelligence Agent, generate 2-3 strategic insights based on REAL operational data:
    
    Calculated Performance Metrics (from actual shipment data):
    - Supplier Performance: ${realKPIs.supplierPerformance || 'N/A'}% (on-time delivery rate)
    - Shipping Cost Impact: ${realKPIs.shippingCostImpact || 'N/A'}% (recent vs historical costs)
    - Transportation Costs: ${realKPIs.transportationCosts || 'N/A'}% (cost variability)
    - Supply Chain Health: ${realKPIs.supplyChainHealth || 'N/A'}% (fulfillment success rate)
    
    Operational Context:
    - Total Shipments: ${totalShipments}
    - Average Unit Cost: $${avgCost.toFixed(2)}
    
    Generate insights that explain what these REAL metrics mean for business operations and provide specific actionable recommendations based on the actual performance data.
    
    Format as JSON array:
    [
      {
        "title": "string",
        "description": "string (explain what the metric means and why it matters)", 
        "severity": "high|medium|low",
        "dollarImpact": number,
        "suggestedActions": ["specific action based on the data", "another specific action", "third action"]
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
 * This part of the code generates forecasts and risk analysis only when real data is available
 */
function generateForecastsAndRisks(globalMetrics: GlobalEconomicMetrics): {
  forecasts: EconomicForecast[];
  risksOpportunities: RiskOpportunityAnalysis;
} {
  const forecasts: EconomicForecast[] = [];
  const risks: RiskItem[] = [];
  const opportunities: OpportunityItem[] = [];

  // Only generate forecasts if we have real economic data
  if (globalMetrics.freightCostTrend !== null) {
    forecasts.push({
      id: "forecast_1",
      title: "Freight Cost Projection",
      forecast: `Based on current ${globalMetrics.freightCostTrend}% freight cost trend, expect continued pressure on shipping rates through Q1 2025.`,
      confidence: Math.abs(globalMetrics.freightCostTrend) > 5 ? "High" : "Medium",
      timeframe: "Next 3 months",
      impactLevel: Math.abs(globalMetrics.freightCostTrend) > 10 ? "High" : "Medium",
      contextualActions: [
        "Review freight contracts for rate escalation clauses",
        "Evaluate alternative shipping routes",
        "Consider freight consolidation strategies"
      ]
    });
  }

  if (globalMetrics.portCongestionIndex !== null) {
    forecasts.push({
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
    });
  }

  // This part of the code adds dynamic risks based on real economic conditions
  if (globalMetrics.portCongestionIndex !== null && globalMetrics.portCongestionIndex > 60) {
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

  if (globalMetrics.freightCostTrend !== null && globalMetrics.freightCostTrend > 5) {
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
  } else if (globalMetrics.freightCostTrend !== null && globalMetrics.freightCostTrend < -3) {
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

    // This part of the code calculates real economic KPIs from shipment data
    const realKPIs = calculateRealEconomicKPIs(shipments);
    const combinedKPIs = combineEconomicKPIs(realKPIs, globalMetrics);

    // This part of the code generates AI analysis
    const [businessImpact, insights] = await Promise.all([
      generateBusinessImpactAnalysis(globalMetrics, shipments),
      generateEconomicInsights(globalMetrics, shipments)
    ]);

    // This part of the code generates forecasts and risks
    const { forecasts, risksOpportunities } = generateForecastsAndRisks(globalMetrics);

    // This part of the code assembles the complete economic data response
    const economicData: EconomicData = {
      kpis: combinedKPIs,
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
