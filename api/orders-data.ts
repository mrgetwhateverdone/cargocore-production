import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * This part of the code provides orders data endpoint for Vercel serverless deployment
 * Uses shipments data as orders since shipments have order-like fields (PO numbers, status, dates)
 */

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

// Order data derived from shipment structure
interface OrderData {
  order_id: string;
  created_date: string;
  brand_name: string;
  status: string;
  sla_status: string;
  expected_date: string | null;
  arrival_date: string;
  supplier: string | null;
  warehouse_id: string | null;
  product_sku: string | null;
  expected_quantity: number;
  received_quantity: number;
  unit_cost: number | null;
  ship_from_country: string | null;
  notes: string;
  shipment_id: string;
  inventory_item_id: string;
}

/**
 * This part of the code fetches shipments data from TinyBird API to use as orders
 * Matches the existing implementation to ensure consistent data structure
 */
async function fetchShipments(): Promise<ShipmentData[]> {
  const baseUrl = process.env.WAREHOUSE_BASE_URL;
  const token = process.env.WAREHOUSE_TOKEN;

  if (!baseUrl || !token) {
    throw new Error(
      "WAREHOUSE_BASE_URL and WAREHOUSE_TOKEN environment variables are required",
    );
  }

  // This part of the code fetches from inbound_shipments_details_mv API with COMP002_3PL company filter
  const url = `${baseUrl}?token=${token}&limit=200&company_url=COMP002_3PL`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * This part of the code transforms shipment data into order-like structure
 * Maps shipment fields to order fields for consistent interface
 */
function transformShipmentsToOrders(shipments: ShipmentData[]): OrderData[] {
  return shipments.map(shipment => {
    const orderId = shipment.purchase_order_number || shipment.shipment_id;
    const slaStatus = calculateSLAStatus(shipment.expected_arrival_date, shipment.arrival_date, shipment.status);
    
    return {
      order_id: orderId,
      created_date: shipment.created_date,
      brand_name: shipment.brand_name,
      status: mapShipmentStatusToOrderStatus(shipment.status),
      sla_status: slaStatus,
      expected_date: shipment.expected_arrival_date,
      arrival_date: shipment.arrival_date,
      supplier: shipment.supplier,
      warehouse_id: shipment.warehouse_id,
      product_sku: shipment.sku,
      expected_quantity: shipment.expected_quantity,
      received_quantity: shipment.received_quantity,
      unit_cost: shipment.unit_cost,
      ship_from_country: shipment.ship_from_country,
      notes: shipment.notes,
      shipment_id: shipment.shipment_id,
      inventory_item_id: shipment.inventory_item_id,
    };
  });
}

/**
 * This part of the code maps shipment status to order-friendly status terms
 */
function mapShipmentStatusToOrderStatus(status: string): string {
  const statusLower = status.toLowerCase();
  
  // Map shipment statuses to order statuses
  if (statusLower.includes('completed') || statusLower.includes('delivered')) return 'completed';
  if (statusLower.includes('shipped') || statusLower.includes('transit')) return 'shipped';
  if (statusLower.includes('receiving') || statusLower.includes('processing')) return 'processing';
  if (statusLower.includes('pending') || statusLower.includes('open')) return 'pending';
  if (statusLower.includes('cancelled')) return 'cancelled';
  if (statusLower.includes('delayed') || statusLower.includes('late')) return 'delayed';
  
  return status; // Return original if no mapping found
}

/**
 * This part of the code calculates SLA status based on dates and current status
 */
function calculateSLAStatus(expectedDate: string | null, arrivalDate: string, status: string): string {
  if (!expectedDate) return 'unknown';
  
  const expected = new Date(expectedDate);
  const actual = new Date(arrivalDate);
  const now = new Date();
  
  // If completed and on time
  if (status.toLowerCase().includes('completed') || status.toLowerCase().includes('delivered')) {
    return actual <= expected ? 'on_time' : 'late';
  }
  
  // If still pending/processing
  if (status.toLowerCase().includes('pending') || status.toLowerCase().includes('processing')) {
    const daysDiff = (now.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 2) return 'breach';
    if (daysDiff > 0) return 'at_risk';
    return 'on_time';
  }
  
  // Default logic for other statuses
  return actual <= expected ? 'on_time' : 'late';
}

/**
 * This part of the code calculates orders-specific KPIs from transformed data
 */
function calculateOrdersKPIs(orders: OrderData[]): any {
  const today = new Date().toISOString().split("T")[0];
  
  // This part of the code counts orders created today
  const ordersToday = orders.filter(order => 
    order.created_date.split("T")[0] === today
  ).length;
  
  // This part of the code counts at-risk orders (delayed, at_risk SLA, quantity discrepancies)
  const atRiskOrders = orders.filter(order =>
    order.status.includes('delayed') || 
    order.sla_status.includes('at_risk') || 
    order.sla_status.includes('breach') ||
    order.expected_quantity !== order.received_quantity
  ).length;
  
  // This part of the code counts open purchase orders
  const openPOs = new Set(
    orders
      .filter(order => 
        order.order_id && 
        !order.status.includes('completed') && 
        !order.status.includes('cancelled')
      )
      .map(order => order.order_id)
  ).size;
  
  // This part of the code counts unfulfillable SKUs (orders with zero received quantity)
  const unfulfillableSKUs = orders.filter(order => 
    order.received_quantity === 0 && 
    order.status !== 'pending'
  ).length;
  
  return {
    ordersToday,
    atRiskOrders,
    openPOs,
    unfulfillableSKUs,
  };
}

/**
 * This part of the code calculates inbound shipment intelligence metrics
 */
function calculateInboundIntelligence(orders: OrderData[]): any {
  const totalInbound = orders.length;
  
  // This part of the code identifies delayed shipments
  const delayedOrders = orders.filter(order => 
    order.status.includes('delayed') || 
    order.sla_status.includes('breach') || 
    order.sla_status.includes('late')
  );
  
  // This part of the code calculates average delay days
  const avgDelayDays = delayedOrders.length > 0 
    ? delayedOrders.reduce((sum, order) => {
        if (!order.expected_date) return sum;
        const expected = new Date(order.expected_date);
        const actual = new Date(order.arrival_date);
        const diffDays = Math.max(0, (actual.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0) / delayedOrders.length
    : 0;
  
  // This part of the code calculates value at risk from delayed orders
  const valueAtRisk = delayedOrders.reduce((sum, order) => 
    sum + (order.expected_quantity * (order.unit_cost || 0)), 0
  );
  
  // This part of the code analyzes geopolitical risks
  const riskCountries = ['China', 'Russia', 'Iran', 'North Korea', 'Myanmar'];
  const riskOrders = orders.filter(order => 
    order.ship_from_country && riskCountries.includes(order.ship_from_country)
  );
  
  const geopoliticalRisks = riskOrders.length > 0 ? {
    riskCountries: [...new Set(riskOrders.map(order => order.ship_from_country).filter(Boolean))],
    affectedShipments: riskOrders.length,
    avgDelayIncrease: 5.2 // Simulated average delay increase
  } : undefined;
  
  return {
    totalInbound,
    delayedShipments: {
      count: delayedOrders.length,
      percentage: totalInbound > 0 ? (delayedOrders.length / totalInbound) * 100 : 0,
    },
    avgDelayDays: Math.round(avgDelayDays * 10) / 10,
    valueAtRisk: Math.round(valueAtRisk),
    geopoliticalRisks,
    recentShipments: orders.slice(0, 10), // Most recent 10
    delayedShipmentsList: delayedOrders.slice(0, 20), // Top 20 delayed
  };
}

/**
 * This part of the code generates orders-specific AI insights
 */
async function generateOrdersInsights(
  orders: OrderData[],
  kpis: any,
  inboundIntelligence: any
): Promise<any[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // This part of the code generates order insights without AI when API key is not available
    const insights = [];
    
    if (kpis.atRiskOrders > 0) {
      insights.push({
        type: "warning",
        title: "At-Risk Orders Detected",
        description: `${kpis.atRiskOrders} orders are currently at risk due to delays or SLA breaches. Immediate attention required to prevent customer impact.`,
        severity: kpis.atRiskOrders > 10 ? "critical" : "warning",
        dollarImpact: inboundIntelligence.valueAtRisk,
      });
    }
    
    if (inboundIntelligence.delayedShipments.percentage > 20) {
      insights.push({
        type: "critical",
        title: "High Delay Rate",
        description: `${inboundIntelligence.delayedShipments.percentage.toFixed(1)}% of shipments are delayed with an average delay of ${inboundIntelligence.avgDelayDays} days. Review supplier performance and logistics routing.`,
        severity: "critical",
        dollarImpact: Math.round(inboundIntelligence.valueAtRisk * 0.8),
      });
    }
    
    if (inboundIntelligence.geopoliticalRisks) {
      insights.push({
        type: "info",
        title: "Geopolitical Risk Assessment",
        description: `${inboundIntelligence.geopoliticalRisks.affectedShipments} shipments from risk-prone regions (${inboundIntelligence.geopoliticalRisks.riskCountries.join(', ')}). Consider supply chain diversification.`,
        severity: "info",
        dollarImpact: 3000,
      });
    }
    
    return insights;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: `You are a 3PL orders specialist. Analyze this orders data and generate 2-3 actionable insights focused on order fulfillment, delays, and optimization opportunities.

ORDERS KPIS:
- Orders Today: ${kpis.ordersToday}
- At-Risk Orders: ${kpis.atRiskOrders}
- Open POs: ${kpis.openPOs}
- Unfulfillable SKUs: ${kpis.unfulfillableSKUs}

INBOUND INTELLIGENCE:
- Total Inbound: ${inboundIntelligence.totalInbound}
- Delayed Shipments: ${inboundIntelligence.delayedShipments.count} (${inboundIntelligence.delayedShipments.percentage.toFixed(1)}%)
- Average Delay: ${inboundIntelligence.avgDelayDays} days
- Value at Risk: $${inboundIntelligence.valueAtRisk.toLocaleString()}

GEOPOLITICAL RISKS:
${inboundIntelligence.geopoliticalRisks ? 
  `- Risk Countries: ${inboundIntelligence.geopoliticalRisks.riskCountries.join(', ')}
- Affected Shipments: ${inboundIntelligence.geopoliticalRisks.affectedShipments}` : 
  '- No significant geopolitical risks detected'
}

Generate insights focusing on order fulfillment optimization, delay reduction, and supply chain risk mitigation.

FORMAT AS JSON ARRAY:
[
  {
    "type": "warning",
    "title": "Orders Insight Title",
    "description": "Detailed analysis with specific recommendations",
    "severity": "critical|warning|info",
    "dollarImpact": estimated_dollar_amount
  }
]`,
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
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
    console.error("Orders AI analysis failed:", error);
  }

  // This part of the code generates fallback order insights when AI fails
  const insights = [];
  
  if (kpis.atRiskOrders > 0) {
    insights.push({
      type: "warning",
      title: "At-Risk Orders Detected",
      description: `${kpis.atRiskOrders} orders are currently at risk due to delays or SLA breaches. Immediate attention required to prevent customer impact.`,
      severity: kpis.atRiskOrders > 10 ? "critical" : "warning",
      dollarImpact: inboundIntelligence.valueAtRisk,
    });
  }
  
  if (inboundIntelligence.delayedShipments.percentage > 20) {
    insights.push({
      type: "critical",
      title: "High Delay Rate",
      description: `${inboundIntelligence.delayedShipments.percentage.toFixed(1)}% of shipments are delayed with an average delay of ${inboundIntelligence.avgDelayDays} days. Review supplier performance and logistics routing.`,
      severity: "critical",
      dollarImpact: Math.round(inboundIntelligence.valueAtRisk * 0.8),
    });
  }
  
  if (inboundIntelligence.geopoliticalRisks) {
    insights.push({
      type: "info",
      title: "Geopolitical Risk Assessment",
      description: `${inboundIntelligence.geopoliticalRisks.affectedShipments} shipments from risk-prone regions (${inboundIntelligence.geopoliticalRisks.riskCountries.join(', ')}). Consider supply chain diversification.`,
      severity: "info",
      dollarImpact: 3000,
    });
  }
  
  return insights;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log(
      "📦 Vercel API: Fetching orders data (using shipments as orders)...",
    );

    // This part of the code fetches shipments and transforms them into orders
    const shipments = await fetchShipments();
    const orders = transformShipmentsToOrders(shipments);

    // This part of the code calculates all orders metrics from transformed data
    const kpis = calculateOrdersKPIs(orders);
    const inboundIntelligence = calculateInboundIntelligence(orders);

    // This part of the code generates orders-specific AI insights
    const insightsData = await generateOrdersInsights(orders, kpis, inboundIntelligence);

    const ordersData = {
      orders: orders.slice(0, 50), // Limit for performance, show top 50
      kpis,
      insights: insightsData.map((insight, index) => ({
        id: `orders-insight-${index}`,
        title: insight.title,
        description: insight.description,
        severity:
          insight.severity === "critical"
            ? ("critical" as const)
            : insight.severity === "warning"
              ? ("warning" as const)
              : ("info" as const),
        dollarImpact: insight.dollarImpact || 0,
        suggestedActions: [
          `Address ${insight.title.toLowerCase()}`,
          "Implement corrective measures",
        ],
        createdAt: new Date().toISOString(),
        source: "orders_agent" as const,
      })),
      inboundIntelligence,
      lastUpdated: new Date().toISOString(),
    };

    console.log("✅ Vercel API: Orders data compiled successfully");
    res.status(200).json({
      success: true,
      data: ordersData,
      message: "Orders data retrieved successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Vercel API Error:", error);
    res.status(500).json({
      error: "Failed to fetch orders data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
