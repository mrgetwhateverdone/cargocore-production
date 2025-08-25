import type { VercelRequest, VercelResponse } from "@vercel/node";

// Inlined types and utilities to resolve Vercel import issues
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

// Inlined safe formatters
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
    .replace(/\$([0-9,]+)\.00impact/g, '$$1 impact')
    .replace(/\$([0-9,]+\.[0-9]{1,2})impact/g, '$$1 impact')
    .replace(/\$([0-9,]+)impact/g, '$$1 impact')
    .replace(/\$([0-9,]+)\.00\s+impact/g, '$$1 impact');
}

function safeFormatAIText(text: string | null | undefined): string {
  return safeDollarFormat(safeCleanMarkdown(text));
}

interface OrdersInsight {
  type: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  dollarImpact: number;
  suggestedActions: string[];
}

async function generateOrdersInsights(
  orders: OrderData[],
  kpis: any,
  inboundIntelligence: any
): Promise<OrdersInsight[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // This part of the code generates order insights without AI when API key is not available
    const insights: OrdersInsight[] = [];
    
    if (kpis.atRiskOrders > 0) {
      insights.push({
        type: "warning",
        title: "At-Risk Orders Detected",
        description: `${kpis.atRiskOrders} orders are at risk due to quantity mismatches or cancellations. Immediate review recommended to prevent fulfillment delays.`,
        severity: "warning",
        dollarImpact: 0,
        suggestedActions: [
          "Review at-risk orders and contact suppliers for status updates",
          "Implement automated alerting for quantity mismatches",
          "Establish backup suppliers for critical SKUs"
        ],
      });
    }
    
    if (inboundIntelligence.delayedShipments.percentage > 20) {
      insights.push({
        type: "critical",
        title: "High Shipment Delay Rate",
        description: `${inboundIntelligence.delayedShipments.percentage}% of shipments are delayed with average delay of ${inboundIntelligence.avgDelayDays} days. Value at risk: $${inboundIntelligence.valueAtRisk.toLocaleString()}.`,
        severity: "critical",
        dollarImpact: inboundIntelligence.valueAtRisk,
        suggestedActions: [
          "Analyze root causes of shipment delays by supplier",
          "Implement supplier performance scorecards and penalties",
          "Establish expedited shipping agreements for critical orders"
        ],
      });
    }
    
    if (kpis.unfulfillableSKUs > 0) {
      insights.push({
        type: "info",
        title: "SKU Data Quality Issue",
        description: `${kpis.unfulfillableSKUs} orders have missing SKU information. Consider data quality improvements to enhance inventory tracking.`,
        severity: "info",
        dollarImpact: 0,
        suggestedActions: [
          "Audit product data entry processes for completeness",
          "Implement mandatory SKU validation in order system",
          "Train staff on proper inventory data management"
        ],
      });
    }
    
    return insights;
  }

  try {
    // This part of the code calculates advanced order metrics for AI analysis
    const orderStatuses = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const supplierPerformance = orders.reduce((acc, order) => {
      if (order.supplier) {
        if (!acc[order.supplier]) {
          acc[order.supplier] = { total: 0, delayed: 0, avgQuantity: 0 };
        }
        acc[order.supplier].total++;
        if (order.expected_date && order.arrival_date && 
            new Date(order.arrival_date) > new Date(order.expected_date)) {
          acc[order.supplier].delayed++;
        }
        acc[order.supplier].avgQuantity += order.expected_quantity;
      }
      return acc;
    }, {} as Record<string, { total: number; delayed: number; avgQuantity: number }>);

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
            content: `You are a 3PL operations expert specializing in order management and fulfillment optimization. Analyze this order data to identify critical operational insights.

ORDER PERFORMANCE ANALYSIS:
==========================

CURRENT ORDER STATUS:
- Orders Today: ${kpis.ordersToday}
- At-Risk Orders: ${kpis.atRiskOrders}
- Open Purchase Orders: ${kpis.openPOs}
- Unfulfillable SKUs: ${kpis.unfulfillableSKUs}

INBOUND SHIPMENT INTELLIGENCE:
- Total Inbound Shipments: ${inboundIntelligence.totalInbound}
- Delayed Shipments: ${inboundIntelligence.delayedShipments.count} (${inboundIntelligence.delayedShipments.percentage}%)
- Average Delay: ${inboundIntelligence.avgDelayDays} days
- Value at Risk: $${inboundIntelligence.valueAtRisk.toLocaleString()}

ORDER STATUS BREAKDOWN:
${Object.entries(orderStatuses).map(([status, count]) => `- ${status}: ${count} orders`).join('\n')}

SUPPLIER PERFORMANCE:
${Object.entries(supplierPerformance).slice(0, 5).map(([supplier, data]) => 
  `- ${supplier}: ${data.total} orders, ${data.delayed} delayed (${((data.delayed/data.total)*100).toFixed(1)}%)`
).join('\n')}

Generate 2-3 insights in JSON format with:
- title: Clear, specific problem or opportunity (8-12 words)
- description: Detailed analysis with metrics (40-60 words)
- severity: "critical" | "warning" | "info"
- dollarImpact: Estimated financial impact (number)
- suggestedActions: Array of 2-3 specific actions (10-15 words each)

Focus on:
1. Order fulfillment optimization opportunities
2. Supplier performance management
3. Risk mitigation strategies
4. Operational efficiency improvements

FORMAT: Return valid JSON array only, no additional text.

Example:
[{
  "title": "High At-Risk Order Volume Threatening Customer Satisfaction",
  "description": "Analysis reveals ${kpis.atRiskOrders} orders are at risk due to quantity mismatches and supplier delays, representing significant fulfillment challenges.",
  "severity": "critical",
  "dollarImpact": ${inboundIntelligence.valueAtRisk},
  "suggestedActions": ["Implement real-time order tracking and alerts system", "Establish supplier performance scorecards and penalties", "Deploy automated quantity verification workflows"]
}]`,
          },
        ],
        max_tokens: 1200,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      console.error(`❌ OpenAI API error: ${response.status}`);
      return []; // Return empty array instead of null
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('❌ No content in OpenAI response');
      return [];
    }

    // Parse and clean the AI response
    const parsed = JSON.parse(content);
    
    if (!Array.isArray(parsed)) {
      console.error('❌ AI response is not an array');
      return [];
    }

    // Process and clean the insights
    const insights: OrdersInsight[] = parsed.map((insight: any, index: number) => ({
      type: insight.type || 'info',
      title: safeFormatAIText(insight.title || `Order Insight ${index + 1}`),
      description: safeFormatAIText(insight.description || 'No description available'),
      severity: (insight.severity === 'critical' || insight.severity === 'warning' || insight.severity === 'info') 
        ? insight.severity 
        : 'info',
      dollarImpact: typeof insight.dollarImpact === 'number' ? insight.dollarImpact : 0,
      suggestedActions: Array.isArray(insight.suggestedActions) 
        ? insight.suggestedActions.map((action: string) => safeFormatAIText(action))
        : [],
    }));

    console.log(`✅ Generated ${insights.length} AI order insights`);
    return insights;

  } catch (error) {
    console.error('❌ Error generating order insights:', error);
    return []; // Return empty array on error
  }
}

async function fetchShipments(): Promise<ShipmentData[]> {
  const baseUrl = process.env.WAREHOUSE_BASE_URL;
  const token = process.env.WAREHOUSE_TOKEN;

  if (!baseUrl || !token) {
    throw new Error("WAREHOUSE_BASE_URL and WAREHOUSE_TOKEN environment variables are required");
  }

  const limits = {
    shipments: process.env.NODE_ENV === 'development' ? 150 : 500
  };
  const companyUrl = process.env.COMPANY_WAREHOUSE_URL || 'COMP002_3PL';
  const url = `${baseUrl}?token=${token}&limit=${limits.shipments}&company_url=${companyUrl}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || [];
}

function transformShipmentsToOrders(shipments: ShipmentData[]): OrderData[] {
  return shipments.map(shipment => ({
    order_id: shipment.shipment_id,
    created_date: shipment.created_date,
    brand_name: shipment.brand_name,
    status: shipment.status,
    sla_status: shipment.status === "completed" ? "on_time" : "pending",
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
  }));
}

function calculateOrdersKPIs(orders: OrderData[]) {
  const today = new Date().toISOString().split("T")[0];
  
  return {
    ordersToday: orders.filter(order => order.created_date === today).length,
    atRiskOrders: orders.filter(order => 
      order.expected_quantity !== order.received_quantity || order.status === "cancelled"
    ).length,
    openPOs: new Set(orders
      .filter(order => order.status !== "completed" && order.status !== "cancelled")
      .map(order => order.order_id)
    ).size,
    unfulfillableSKUs: orders.filter(order => !order.product_sku).length
  };
}

function calculateInboundIntelligence(orders: OrderData[]) {
  const totalInbound = orders.length;
  const delayedOrders = orders.filter(order => {
    if (!order.expected_date || !order.arrival_date) return false;
    return new Date(order.arrival_date) > new Date(order.expected_date);
  });

  const delayedCount = delayedOrders.length;
  const delayedPercentage = totalInbound > 0 ? (delayedCount / totalInbound) * 100 : 0;
  
  const avgDelayDays = delayedOrders.length > 0 
    ? delayedOrders.reduce((sum, order) => {
        if (!order.expected_date || !order.arrival_date) return sum;
        const expected = new Date(order.expected_date);
        const actual = new Date(order.arrival_date);
        const delayDays = Math.max(0, Math.ceil((actual.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24)));
        return sum + delayDays;
      }, 0) / delayedOrders.length
    : 0;

  const valueAtRisk = delayedOrders.reduce((sum, order) => {
    return sum + (order.expected_quantity * (order.unit_cost || 0));
  }, 0);

  return {
    totalInbound,
    delayedShipments: {
      count: delayedCount,
      percentage: Math.round(delayedPercentage)
    },
    avgDelayDays: Math.round(avgDelayDays),
    valueAtRisk: Math.round(valueAtRisk),
    recentShipments: orders.slice(0, 10),
    delayedShipmentsList: delayedOrders.slice(0, 10)
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    console.log("📦 Vercel API: Fetching orders data (using shipments as orders)...");

    const shipments = await fetchShipments();
    const orders = transformShipmentsToOrders(shipments);
    const kpis = calculateOrdersKPIs(orders);
    const inboundIntelligence = calculateInboundIntelligence(orders);

    // This part of the code generates order-specific AI insights
    const insightsData = await generateOrdersInsights(orders, kpis, inboundIntelligence);

    const ordersData = {
      orders: orders.slice(0, 500),
      kpis,
      insights: insightsData.map((insight, index) => ({
        id: `orders-insight-${index}`,
        title: insight.title,
        description: insight.description,
        severity: insight.severity,
        dollarImpact: insight.dollarImpact,
        suggestedActions: insight.suggestedActions,
        createdAt: new Date().toISOString(),
        source: "orders-analysis",
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
    return;
  } catch (error) {
    console.error("❌ Vercel API Error:", error);
    res.status(500).json({
      error: "Failed to fetch orders data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
}