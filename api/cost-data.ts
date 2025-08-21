import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { CostKPIs, CostCenter, CostData, AIInsight, SupplierPerformance, HistoricalCostTrend } from "../client/types/api";
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
 * This part of the code provides cost management data endpoint for Vercel serverless deployment
 * Uses existing shipments data to calculate warehouse costs and performance metrics
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
 * This part of the code fetches shipment data from TinyBird API
 */
async function fetchShipments(): Promise<ShipmentData[]> {
  const baseUrl = process.env.WAREHOUSE_BASE_URL;
  const token = process.env.WAREHOUSE_TOKEN;

  if (!baseUrl || !token) {
    return [];
  }

  try {
    // This part of the code uses the exact same URL pattern as working dashboard API
    const url = `${baseUrl}?token=${token}&limit=1000&company_url=COMP002_3PL`;

    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    
    return result.data || [];
  } catch (error) {
    return [];
  }
}

/**
 * This part of the code calculates enhanced cost KPIs from real shipment data
 */
function calculateCostKPIs(shipments: ShipmentData[]): CostKPIs {
  if (shipments.length === 0) {
    return {
      // Enhanced metrics
      totalMonthlyCosts: 0,
      costEfficiencyRate: 0,
      topPerformingWarehouses: 0,
      totalCostCenters: 0,
      // Legacy metrics
      totalWarehouses: 0,
      avgSLAPerformance: 0,
      monthlyThroughput: 0,
      activeCostCenters: 0,
    };
  }

  // This part of the code calculates total monthly costs from real shipment data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyShipments = shipments.filter(s => {
    const arrivalDate = new Date(s.arrival_date);
    return arrivalDate.getMonth() === currentMonth && arrivalDate.getFullYear() === currentYear;
  });
  
  const totalMonthlyCosts = Math.round(monthlyShipments.reduce((sum, s) => {
    const cost = (s.unit_cost || 0) * s.received_quantity;
    return sum + cost;
  }, 0));

  // This part of the code calculates cost efficiency rate (expected vs received)
  const efficiencyRates = shipments
    .filter(s => s.expected_quantity > 0 && s.received_quantity > 0)
    .map(s => (s.received_quantity / s.expected_quantity) * 100);
  const costEfficiencyRate = efficiencyRates.length > 0 
    ? Math.round(efficiencyRates.reduce((sum, rate) => sum + rate, 0) / efficiencyRates.length)
    : 0;

  // This part of the code counts unique warehouses
  const uniqueWarehouses = new Set(
    shipments
      .filter(s => s.warehouse_id)
      .map(s => s.warehouse_id)
  ).size;

  // This part of the code counts top performing warehouses (>90% SLA)
  const warehousePerformance = new Map<string, { onTime: number, total: number }>();
  shipments.forEach(s => {
    if (!s.warehouse_id) return;
    if (!warehousePerformance.has(s.warehouse_id)) {
      warehousePerformance.set(s.warehouse_id, { onTime: 0, total: 0 });
    }
    const performance = warehousePerformance.get(s.warehouse_id)!;
    performance.total++;
    if (s.expected_quantity === s.received_quantity && s.status !== "cancelled") {
      performance.onTime++;
    }
  });
  
  const topPerformingWarehouses = Array.from(warehousePerformance.values())
    .filter(p => p.total > 0 && (p.onTime / p.total) >= 0.9)
    .length;

  // This part of the code calculates SLA performance (legacy metric)
  const onTimeShipments = shipments.filter(s => 
    s.expected_quantity === s.received_quantity && 
    s.status !== "cancelled"
  ).length;
  const avgSLA = shipments.length > 0 ? Math.round((onTimeShipments / shipments.length) * 100) : 0;

  // This part of the code calculates monthly throughput
  const totalThroughput = monthlyShipments.reduce((sum, s) => sum + (s.received_quantity || 0), 0);

  // This part of the code counts active cost centers (warehouses with recent activity)
  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - 30); // Last 30 days
  
  const activeCenters = new Set(
    shipments
      .filter(s => s.warehouse_id && new Date(s.arrival_date) > recentDate)
      .map(s => s.warehouse_id)
  ).size;

  return {
    // Enhanced Real Cost Metrics
    totalMonthlyCosts,
    costEfficiencyRate,
    topPerformingWarehouses,
    totalCostCenters: uniqueWarehouses,
    // Legacy metrics for compatibility
    totalWarehouses: uniqueWarehouses,
    avgSLAPerformance: avgSLA,
    monthlyThroughput: totalThroughput,
    activeCostCenters: activeCenters,
  };
}

/**
 * This part of the code transforms shipments into enhanced cost center data by warehouse
 */
function calculateCostCenters(shipments: ShipmentData[]): CostCenter[] {
  if (shipments.length === 0) {
    return [];
  }

  // This part of the code groups shipments by warehouse with cost calculations
  const warehouseMap = new Map<string, {
    shipments: ShipmentData[];
    totalQuantity: number;
    onTimeCount: number;
    totalCosts: number;
  }>();

  shipments.forEach(shipment => {
    if (!shipment.warehouse_id) return;

    const warehouseId = shipment.warehouse_id;
    if (!warehouseMap.has(warehouseId)) {
      warehouseMap.set(warehouseId, {
        shipments: [],
        totalQuantity: 0,
        onTimeCount: 0,
        totalCosts: 0,
      });
    }

    const warehouse = warehouseMap.get(warehouseId)!;
    warehouse.shipments.push(shipment);
    warehouse.totalQuantity += shipment.received_quantity || 0;
    
    // This part of the code calculates real costs from shipment data
    const shipmentCost = (shipment.unit_cost || 0) * shipment.received_quantity;
    warehouse.totalCosts += shipmentCost;
    
    // This part of the code counts on-time shipments
    if (shipment.expected_quantity === shipment.received_quantity && shipment.status !== "cancelled") {
      warehouse.onTimeCount++;
    }
  });

  // This part of the code converts warehouse data to enhanced cost centers
  return Array.from(warehouseMap.entries())
    .map(([warehouseId, data]) => {
      const slaPerformance = data.shipments.length > 0 
        ? Math.round((data.onTimeCount / data.shipments.length) * 100) 
        : 0;

      // This part of the code determines warehouse status based on recent activity
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 30);
      const hasRecentActivity = data.shipments.some(s => 
        new Date(s.arrival_date) > recentDate
      );

      // This part of the code calculates enhanced cost metrics
      const monthlyCosts = Math.round(data.totalCosts);
      const costPerShipment = data.shipments.length > 0 
        ? Math.round(monthlyCosts / data.shipments.length) 
        : 0;
      
      // This part of the code calculates cost efficiency (expected vs received ratio)
      const efficiencyRates = data.shipments
        .filter(s => s.expected_quantity > 0)
        .map(s => (s.received_quantity / s.expected_quantity) * 100);
      const costEfficiency = efficiencyRates.length > 0
        ? Math.round(efficiencyRates.reduce((sum, rate) => sum + rate, 0) / efficiencyRates.length)
        : 0;

      // This part of the code calculates utilization rate (recent activity vs total)
      const recentShipments = data.shipments.filter(s => new Date(s.arrival_date) > recentDate).length;
      const utilizationRate = data.shipments.length > 0
        ? Math.round((recentShipments / data.shipments.length) * 100)
        : 0;

      // This part of the code calculates cost breakdown using industry standards
      const costBreakdown = {
        receiving: Math.round(monthlyCosts * 0.40), // 40% for receiving operations
        storage: Math.round(monthlyCosts * 0.30),   // 30% for storage costs
        processing: Math.round(monthlyCosts * 0.20), // 20% for processing
        overhead: Math.round(monthlyCosts * 0.10),   // 10% for overhead
      };

      return {
        warehouse_id: warehouseId,
        warehouse_name: `Warehouse ${warehouseId.slice(-4)}`, // Simple name from ID
        monthly_throughput: data.totalQuantity,
        sla_performance: slaPerformance,
        status: hasRecentActivity ? 'Active' as const : 'Inactive' as const,
        total_shipments: data.shipments.length,
        on_time_shipments: data.onTimeCount,
        // Enhanced cost metrics
        monthly_costs: monthlyCosts,
        cost_per_shipment: costPerShipment,
        cost_efficiency: costEfficiency,
        utilization_rate: utilizationRate,
        cost_breakdown: costBreakdown,
      };
    })
    .sort((a, b) => b.monthly_costs - a.monthly_costs); // Sort by total costs
}

/**
 * This part of the code calculates supplier performance metrics from real shipment data
 */
function calculateSupplierPerformance(shipments: ShipmentData[]): SupplierPerformance[] {
  if (shipments.length === 0) {
    return [];
  }

  // This part of the code groups shipments by supplier with cost calculations
  const supplierMap = new Map<string, {
    shipments: ShipmentData[];
    totalCost: number;
    onTimeCount: number;
  }>();

  shipments.forEach(shipment => {
    const supplier = shipment.supplier || 'Unknown Supplier';
    
    if (!supplierMap.has(supplier)) {
      supplierMap.set(supplier, {
        shipments: [],
        totalCost: 0,
        onTimeCount: 0,
      });
    }

    const supplierData = supplierMap.get(supplier)!;
    supplierData.shipments.push(shipment);
    
    // This part of the code calculates real costs from shipment data
    const shipmentCost = (shipment.unit_cost || 0) * shipment.received_quantity;
    supplierData.totalCost += shipmentCost;
    
    // This part of the code counts on-time shipments
    if (shipment.expected_quantity === shipment.received_quantity && shipment.status !== "cancelled") {
      supplierData.onTimeCount++;
    }
  });

  // This part of the code calculates average cost for variance analysis
  const allSupplierData = Array.from(supplierMap.values());
  const totalCosts = allSupplierData.reduce((sum, data) => sum + data.totalCost, 0);
  const totalShipments = allSupplierData.reduce((sum, data) => sum + data.shipments.length, 0);
  const avgCostPerShipment = totalShipments > 0 ? totalCosts / totalShipments : 0;

  // This part of the code converts supplier data to performance metrics
  return Array.from(supplierMap.entries())
    .map(([supplierName, data]) => {
      const avgCostPerUnit = data.shipments.length > 0
        ? data.totalCost / data.shipments.reduce((sum, s) => sum + s.received_quantity, 0)
        : 0;
      
      const slaPerformance = data.shipments.length > 0 
        ? Math.round((data.onTimeCount / data.shipments.length) * 100) 
        : 0;

      const supplierAvgCostPerShipment = data.shipments.length > 0 
        ? data.totalCost / data.shipments.length 
        : 0;
      
      const costVariance = avgCostPerShipment > 0 
        ? Math.round(((supplierAvgCostPerShipment - avgCostPerShipment) / avgCostPerShipment) * 100)
        : 0;

      // This part of the code calculates efficiency score based on SLA and cost variance
      const efficiencyScore = Math.round((slaPerformance * 0.7) + ((100 - Math.abs(costVariance)) * 0.3));

      // This part of the code determines supplier status
      let status: 'Efficient' | 'Needs Attention' | 'High Cost';
      if (efficiencyScore >= 80 && costVariance <= 10) {
        status = 'Efficient';
      } else if (efficiencyScore < 60 || costVariance > 25) {
        status = 'High Cost';
      } else {
        status = 'Needs Attention';
      }

      return {
        supplier_name: supplierName,
        total_cost: Math.round(data.totalCost),
        avg_cost_per_unit: Math.round(avgCostPerUnit * 100) / 100,
        sla_performance: slaPerformance,
        shipment_count: data.shipments.length,
        cost_variance: costVariance,
        efficiency_score: efficiencyScore,
        status,
      };
    })
    .sort((a, b) => b.total_cost - a.total_cost); // Sort by total cost
}

/**
 * This part of the code calculates historical cost trends from real shipment data
 */
function calculateHistoricalTrends(shipments: ShipmentData[]): HistoricalCostTrend[] {
  if (shipments.length === 0) {
    return [];
  }

  // This part of the code groups shipments by month
  const monthlyData = new Map<string, {
    totalCost: number;
    shipmentCount: number;
  }>();

  shipments.forEach(shipment => {
    const arrivalDate = new Date(shipment.arrival_date);
    const monthKey = `${arrivalDate.getFullYear()}-${(arrivalDate.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, {
        totalCost: 0,
        shipmentCount: 0,
      });
    }

    const monthData = monthlyData.get(monthKey)!;
    const shipmentCost = (shipment.unit_cost || 0) * shipment.received_quantity;
    monthData.totalCost += shipmentCost;
    monthData.shipmentCount++;
  });

  // This part of the code converts to trend data with month-over-month calculations
  const sortedEntries = Array.from(monthlyData.entries())
    .sort(([a], [b]) => a.localeCompare(b));

  return sortedEntries.map(([month, data], index) => {
    const avgCostPerShipment = data.shipmentCount > 0 
      ? Math.round(data.totalCost / data.shipmentCount) 
      : 0;

    // This part of the code calculates month-over-month percentage change
    let costChangePercentage = 0;
    if (index > 0) {
      const prevData = sortedEntries[index - 1][1];
      const prevAvgCost = prevData.shipmentCount > 0 ? prevData.totalCost / prevData.shipmentCount : 0;
      if (prevAvgCost > 0) {
        costChangePercentage = Math.round(((avgCostPerShipment - prevAvgCost) / prevAvgCost) * 100);
      }
    }

    return {
      month,
      total_cost: Math.round(data.totalCost),
      shipment_count: data.shipmentCount,
      avg_cost_per_shipment: avgCostPerShipment,
      cost_change_percentage: costChangePercentage,
    };
  }).slice(-12); // This part of the code returns last 12 months
}

/**
 * This part of the code generates real AI insights for cost management
 * Uses OpenAI to analyze cost data and provide actionable insights
 */
async function generateRealCostInsights(
  shipments: ShipmentData[],
  kpis: CostKPIs,
  costCenters: CostCenter[]
): Promise<AIInsight[]> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    console.warn('🤖 OpenAI API key not available for cost insights');
    return [];
  }

  try {
    const totalCostCenters = costCenters.length;
    const totalShipments = shipments.length;
    const highCostCenters = costCenters.filter(c => c.cost_efficiency < 70).length;
    const inactiveCenters = costCenters.filter(c => c.status === 'Inactive').length;
    const avgCostPerShipment = totalShipments > 0 ? costCenters.reduce((sum, c) => sum + c.cost_per_shipment, 0) / totalCostCenters : 0;

    const costAnalysisPrompt = `
WORLD-CLASS COST MANAGEMENT INSIGHT ANALYSIS

You are a senior operations consultant specializing in 3PL cost optimization. Analyze the following cost management data and generate 2-3 critical insights with specific financial impact.

COST MANAGEMENT DATA:
- Total Monthly Costs: $${kpis.totalMonthlyCosts.toLocaleString()}
- Cost Efficiency Rate: ${kpis.costEfficiencyRate}%
- Top Performing Warehouses: ${kpis.topPerformingWarehouses}/${kpis.totalCostCenters}
- Total Cost Centers: ${kpis.totalCostCenters}
- Active Facilities: ${kpis.activeCostCenters}
- Inactive Facilities: ${inactiveCenters}
- Monthly Throughput: ${kpis.monthlyThroughput} units
- High-Cost Centers: ${highCostCenters}
- Average Cost per Shipment: $${avgCostPerShipment.toFixed(2)}
- Total Shipments: ${totalShipments}

REQUIREMENTS:
Generate 2-3 insights in JSON format with:
- title: Clear, specific problem or opportunity (8-12 words)
- description: Detailed analysis with metrics (40-60 words)
- severity: "critical" | "warning" | "info"
- dollarImpact: Estimated financial impact (number)
- suggestedActions: Array of 2-3 specific actions (10-15 words each)

Focus on:
1. Cost efficiency optimization opportunities
2. Underperforming warehouse facilities
3. Process improvement recommendations
4. Financial impact quantification

FORMAT: Return valid JSON array only, no additional text.

Example:
[{
  "title": "High-Cost Warehouse Operations Impacting Margins",
  "description": "Analysis reveals 3 warehouses operating at 45% efficiency below industry standards, contributing to $125,000 monthly cost overruns.",
  "severity": "critical",
  "dollarImpact": 125000,
  "suggestedActions": ["Implement lean operations audit for underperforming facilities", "Renegotiate supplier contracts for volume discounts", "Deploy automated inventory management systems"]
}]`;

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
            content: "You are a world-class cost management consultant. Generate specific, actionable insights with quantified financial impact. Return only valid JSON array."
          },
          {
            role: "user",
            content: costAnalysisPrompt
          }
        ],
        max_tokens: 1200,
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

    // Parse the JSON response
    try {
      const parsed = JSON.parse(aiResponse);
      
      if (Array.isArray(parsed)) {
        return parsed.map((insight: any, index: number) => ({
          id: `cost-insight-${Date.now()}-${index}`,
          type: "cost_optimization",
          title: safeFormatAIText(insight.title) || "Cost Optimization Opportunity",
          description: safeFormatAIText(insight.description) || "",
          severity: insight.severity || "info",
          dollarImpact: typeof insight.dollarImpact === 'number' ? insight.dollarImpact : 0,
          suggestedActions: insight.suggestedActions ? insight.suggestedActions.map((action: string) => safeFormatAIText(action)) : [],
          createdAt: new Date().toISOString(),
          source: "cost_agent" as const,
        }));
      }
    } catch (parseError) {
      console.error('❌ Failed to parse AI cost insights response:', parseError);
    }

    return [];

  } catch (error) {
    console.error('❌ Cost Management AI insight generation failed:', error);
    return [];
  }
}

/**
 * Legacy function kept for compatibility 
 */
function generateCostInsights(
  shipments: ShipmentData[],
  kpis: CostKPIs,
  costCenters: CostCenter[]
): AIInsight[] {
  // NO FALLBACK DATA - Return empty array, real insights come from generateRealCostInsights
  return [];
}

/**
 * This part of the code cleans up markdown formatting from AI responses
 * Removes bold markers and other formatting that shouldn't be displayed literally
 */
function cleanMarkdownFormatting(text: string): string {
  return text
    // Remove bold markers
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove italic markers  
    .replace(/\*(.*?)\*/g, '$1')
    // Remove any remaining asterisks
    .replace(/\*/g, '')
    // Remove "Executive Summary:" prefix (case insensitive)
    .replace(/^Executive Summary:\s*/i, '')
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * This part of the code generates AI-powered executive summary for cost management
 * Uses world-class prompts to provide strategic cost analysis
 */
async function generateAIExecutiveSummary(contextData: any): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    console.warn('🤖 OpenAI API key not available, using fallback summary');
    return '';
  }

  try {
    const executiveSummaryPrompt = `
WORLD-CLASS COST MANAGEMENT EXECUTIVE SUMMARY

You are a senior CFO with 20+ years of experience in 3PL operations and cost optimization. Analyze the following operational cost data and provide a strategic executive summary for the board of directors.

OPERATIONAL COST DATA:
- Total Facilities: ${contextData.totalFacilities}
- Average Cost Efficiency: ${contextData.avgEfficiency}%
- Top Performing Warehouses: ${contextData.topPerformers}
- Active Facilities: ${contextData.activeFacilities}
- Facilities Needing Attention: ${contextData.needsAttention}
- Monthly Operational Costs: $${contextData.totalMonthlyCosts.toLocaleString()}

REQUIREMENTS:
Generate a compelling executive summary (200-250 words) that:
1. Opens with the most critical cost insight or opportunity
2. Quantifies financial impact and operational efficiency
3. Identifies specific cost optimization opportunities
4. Provides strategic recommendations with ROI potential
5. Includes urgency indicators for immediate action items
6. Uses data-driven language appropriate for C-level executives

FORMAT:
Write in paragraph form with specific metrics woven naturally into the narrative. Focus on actionable insights that drive business value and cost optimization.

TONE: Professional, strategic, data-driven, and focused on financial performance and operational excellence.`;

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
            content: "You are a world-class CFO and operations consultant specializing in 3PL cost optimization and financial performance analysis. Provide strategic, data-driven executive summaries."
          },
          {
            role: "user",
            content: executiveSummaryPrompt
          }
        ],
        max_tokens: 400,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiSummary = data.choices?.[0]?.message?.content;

    if (!aiSummary) {
      throw new Error("No response from OpenAI");
    }

    return safeCleanMarkdown(aiSummary);

  } catch (error) {
    console.error('❌ Cost Management AI summary generation failed:', error);
    return '';
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST" && req.query.aiSummary === 'true') {
    try {
      console.log("🤖 Cost Management API: Generating AI executive summary...");
      
      const { contextData } = req.body;
      
      if (!contextData) {
        return res.status(400).json({
          success: false,
          error: "Context data is required for AI summary generation",
          timestamp: new Date().toISOString(),
        });
      }

      const aiSummary = await generateAIExecutiveSummary(contextData);
      
      console.log("✅ Cost Management AI summary generated successfully");
      
      return res.status(200).json({
        success: true,
        summary: aiSummary,
        generatedAt: new Date().toISOString(),
        message: "AI executive summary generated successfully"
      });

    } catch (error) {
      console.error("❌ Cost Management AI Summary Error:", error);
      
      return res.status(500).json({
        success: false,
        error: "Failed to generate AI executive summary",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🔒 Phase 1: Building simple cost management dashboard...");

    // This part of the code fetches real data and calculates cost metrics
    const shipments = await fetchShipments();
    
    if (shipments.length === 0) {
      // This part of the code returns clean empty state when no data is available
      return res.status(200).json({
        success: true,
        data: {
          kpis: {
            // Enhanced metrics
            totalMonthlyCosts: 0,
            costEfficiencyRate: 0,
            topPerformingWarehouses: 0,
            totalCostCenters: 0,
            // Legacy metrics
            totalWarehouses: 0,
            avgSLAPerformance: 0,
            monthlyThroughput: 0,
            activeCostCenters: 0,
          },
          insights: [{
            id: "cost-insight-1",
            title: "Information Not Available",
            description: "Cost management data is not available. Data source connection required.",
            severity: "info" as const,
            dollarImpact: 0,
            suggestedActions: ["Check data source connection"],
            createdAt: new Date().toISOString(),
            source: "cost_agent" as const,
          }],
          costCenters: [],
          supplierPerformance: [],
          historicalTrends: [],
          lastUpdated: new Date().toISOString(),
        },
        message: "No cost management data available",
        timestamp: new Date().toISOString(),
      });
    }

    // This part of the code calculates enhanced cost management metrics
    const kpis = calculateCostKPIs(shipments);
    const costCenters = calculateCostCenters(shipments);
    const supplierPerformance = calculateSupplierPerformance(shipments);
    const historicalTrends = calculateHistoricalTrends(shipments);
    const insights = await generateRealCostInsights(shipments, kpis, costCenters);

    const costData: CostData = {
      kpis,
      insights,
      costCenters,
      supplierPerformance,
      historicalTrends,
      lastUpdated: new Date().toISOString(),
    };

    console.log("✅ Vercel API: Cost management data compiled successfully");
    res.status(200).json({
      success: true,
      data: costData,
      message: "Cost management data loaded successfully",
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("❌ Vercel API: Cost management error:", error);
    res.status(500).json({
      success: false,
      error: "Internal API Error",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString(),
    });
  }
}
