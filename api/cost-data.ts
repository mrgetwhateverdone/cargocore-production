import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { CostKPIs, CostCenter, CostData, AIInsight } from "../client/types/api";

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
  const baseUrl = process.env.TINYBIRD_BASE_URL || 'https://api.us-east.aws.tinybird.co/v0/pipes/inbound_shipments_details_mv.json';
  const token = process.env.TINYBIRD_TOKEN;

  if (!token) {
    console.error("❌ Vercel API: TINYBIRD_TOKEN not found in environment");
    return [];
  }

  try {
    console.log("🔒 Phase 1: Fetching cost management data from TinyBird...");
    
    // This part of the code uses the exact same URL pattern as working APIs
    const url = `${baseUrl}?token=${token}&limit=1000&company_url=COMP002_packiyo`;
    console.log("🔒 Cost API: Fetching from:", url.replace(token, 'TOKEN_HIDDEN'));

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ Cost API: TinyBird request failed with status ${response.status}`);
      return [];
    }

    const result = await response.json();
    console.log(`✅ Cost API: Received ${result.data?.length || 0} shipment records`);
    
    return result.data || [];
  } catch (error) {
    console.error("❌ Cost API: Error fetching shipments:", error);
    return [];
  }
}

/**
 * This part of the code calculates basic cost KPIs from shipment data
 */
function calculateCostKPIs(shipments: ShipmentData[]): CostKPIs {
  if (shipments.length === 0) {
    return {
      totalWarehouses: 0,
      avgSLAPerformance: 0,
      monthlyThroughput: 0,
      activeCostCenters: 0,
    };
  }

  // This part of the code counts unique warehouses
  const uniqueWarehouses = new Set(
    shipments
      .filter(s => s.warehouse_id)
      .map(s => s.warehouse_id)
  ).size;

  // This part of the code calculates SLA performance (on-time delivery)
  const onTimeShipments = shipments.filter(s => 
    s.expected_quantity === s.received_quantity && 
    s.status !== "cancelled"
  ).length;
  const avgSLA = shipments.length > 0 ? Math.round((onTimeShipments / shipments.length) * 100) : 0;

  // This part of the code calculates monthly throughput
  const totalThroughput = shipments.reduce((sum, s) => sum + (s.received_quantity || 0), 0);

  // This part of the code counts active cost centers (warehouses with recent activity)
  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - 30); // Last 30 days
  
  const activeCenters = new Set(
    shipments
      .filter(s => s.warehouse_id && new Date(s.arrival_date) > recentDate)
      .map(s => s.warehouse_id)
  ).size;

  return {
    totalWarehouses: uniqueWarehouses,
    avgSLAPerformance: avgSLA,
    monthlyThroughput: totalThroughput,
    activeCostCenters: activeCenters,
  };
}

/**
 * This part of the code transforms shipments into cost center data by warehouse
 */
function calculateCostCenters(shipments: ShipmentData[]): CostCenter[] {
  if (shipments.length === 0) {
    return [];
  }

  // This part of the code groups shipments by warehouse
  const warehouseMap = new Map<string, {
    shipments: ShipmentData[];
    totalQuantity: number;
    onTimeCount: number;
  }>();

  shipments.forEach(shipment => {
    if (!shipment.warehouse_id) return;

    const warehouseId = shipment.warehouse_id;
    if (!warehouseMap.has(warehouseId)) {
      warehouseMap.set(warehouseId, {
        shipments: [],
        totalQuantity: 0,
        onTimeCount: 0,
      });
    }

    const warehouse = warehouseMap.get(warehouseId)!;
    warehouse.shipments.push(shipment);
    warehouse.totalQuantity += shipment.received_quantity || 0;
    
    // This part of the code counts on-time shipments
    if (shipment.expected_quantity === shipment.received_quantity && shipment.status !== "cancelled") {
      warehouse.onTimeCount++;
    }
  });

  // This part of the code converts warehouse data to cost centers
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

      return {
        warehouse_id: warehouseId,
        warehouse_name: `Warehouse ${warehouseId.slice(-4)}`, // Simple name from ID
        monthly_throughput: data.totalQuantity,
        sla_performance: slaPerformance,
        status: hasRecentActivity ? 'Active' as const : 'Inactive' as const,
        total_shipments: data.shipments.length,
        on_time_shipments: data.onTimeCount,
      };
    })
    .sort((a, b) => b.monthly_throughput - a.monthly_throughput); // Sort by throughput
}

/**
 * This part of the code generates simple cost management insights
 */
function generateCostInsights(
  shipments: ShipmentData[],
  kpis: CostKPIs,
  costCenters: CostCenter[]
): AIInsight[] {
  const insights: AIInsight[] = [];
  
  if (shipments.length === 0) {
    insights.push({
      id: "cost-insight-1",
      title: "Information Not Available",
      description: "Cost management data is not available. Data source connection required.",
      severity: "info" as const,
      dollarImpact: 0,
      suggestedActions: ["Check data source connection"],
      createdAt: new Date().toISOString(),
      source: "cost_agent" as const,
    });
    return insights;
  }

  // This part of the code generates SLA performance insight
  if (kpis.avgSLAPerformance < 85) {
    insights.push({
      id: "cost-insight-sla",
      title: "SLA Performance Below Target",
      description: `Average SLA performance is ${kpis.avgSLAPerformance}%, below the 85% target. Poor SLA performance increases operational costs through customer service overhead and potential contract penalties.`,
      severity: "warning" as const,
      dollarImpact: Math.round((85 - kpis.avgSLAPerformance) * 100), // Simple cost estimate
      suggestedActions: [
        "Review warehouse operational procedures",
        "Analyze delayed shipment patterns",
        "Implement performance improvement initiatives"
      ],
      createdAt: new Date().toISOString(),
      source: "cost_agent" as const,
    });
  }

  // This part of the code generates warehouse utilization insight
  const inactiveWarehouses = costCenters.filter(w => w.status === 'Inactive').length;
  if (inactiveWarehouses > 0) {
    insights.push({
      id: "cost-insight-utilization",
      title: "Underutilized Warehouse Capacity",
      description: `${inactiveWarehouses} of ${kpis.totalWarehouses} warehouses show minimal activity in the last 30 days. Underutilized facilities represent fixed costs without proportional revenue generation.`,
      severity: "warning" as const,
      dollarImpact: inactiveWarehouses * 5000, // Estimated monthly fixed costs
      suggestedActions: [
        "Review warehouse consolidation opportunities",
        "Analyze demand patterns by facility",
        "Consider cost reallocation strategies"
      ],
      createdAt: new Date().toISOString(),
      source: "cost_agent" as const,
    });
  }

  // This part of the code generates throughput efficiency insight
  if (kpis.monthlyThroughput > 0) {
    const avgThroughputPerWarehouse = Math.round(kpis.monthlyThroughput / kpis.totalWarehouses);
    insights.push({
      id: "cost-insight-efficiency",
      title: "Warehouse Throughput Analysis",
      description: `Current throughput averages ${avgThroughputPerWarehouse.toLocaleString()} units per warehouse monthly. Optimizing throughput distribution can reduce per-unit handling costs.`,
      severity: "info" as const,
      dollarImpact: 0,
      suggestedActions: [
        "Analyze throughput distribution patterns",
        "Identify high-performing warehouse practices",
        "Implement best practices across facilities"
      ],
      createdAt: new Date().toISOString(),
      source: "cost_agent" as const,
    });
  }

  return insights;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
          lastUpdated: new Date().toISOString(),
        },
        message: "No cost management data available",
        timestamp: new Date().toISOString(),
      });
    }

    // This part of the code calculates cost management metrics
    const kpis = calculateCostKPIs(shipments);
    const costCenters = calculateCostCenters(shipments);
    const insights = generateCostInsights(shipments, kpis, costCenters);

    const costData: CostData = {
      kpis,
      insights,
      costCenters,
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
