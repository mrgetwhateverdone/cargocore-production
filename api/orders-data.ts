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

    const ordersData = {
      orders: orders.slice(0, 500),
      kpis,
      insights: [], // Simplified - no AI insights to avoid complexity
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