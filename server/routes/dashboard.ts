import { RequestHandler } from "express";

/**
 * Server-side proxy for TinyBird and OpenAI APIs
 * Keeps all API keys secure on server-side only
 * URLs kept completely intact as they work
 */

interface ProductData {
  product_id: string;
  company_url: string;
  brand_id: string | null;
  brand_name: string;
  brand_domain: string | null;
  created_date: string;
  product_name: string;
  product_sku: string | null;
  gtin: string | null;
  is_kit: boolean;
  active: boolean;
  product_supplier: string | null;
  country_of_origin: string | null;
  harmonized_code: string | null;
  product_external_url: string | null;
  inventory_item_id: string;
  unit_quantity: number;
  supplier_name: string;
  unit_cost: number | null;
  supplier_external_id: string | null;
  updated_date: string | null;
}

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
  meta: Array<{
    name: string;
    type: string;
  }>;
  data: T[];
}

/**
 * Secure TinyBird Products API proxy
 * Environment keys not exposed to client
 */
export const getProductsData: RequestHandler = async (req, res) => {
  try {
    console.log("🔒 Server: Fetching TinyBird products data securely...");

    const tinybirdBaseUrl = process.env.TINYBIRD_BASE_URL;
    const tinybirdToken = process.env.TINYBIRD_TOKEN;
    if (!tinybirdBaseUrl || !tinybirdToken) {
      throw new Error(
        "TINYBIRD_BASE_URL and TINYBIRD_TOKEN environment variables not configured",
      );
    }

    const tinybirdUrl = `${tinybirdBaseUrl}?token=${tinybirdToken}`;
    const response = await fetch(tinybirdUrl);

    if (!response.ok) {
      throw new Error(
        `TinyBird Products API Error: ${response.status} ${response.statusText}`,
      );
    }

    const result: TinyBirdResponse<ProductData> = await response.json();

    console.log(
      "✅ Server: Products data fetched successfully:",
      result.data.length,
      "records",
    );

    res.json({
      success: true,
      data: result.data,
      count: result.data.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Server: TinyBird products fetch failed:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Secure TinyBird Shipments API proxy
 * Environment keys not exposed to client
 */
export const getShipmentsData: RequestHandler = async (req, res) => {
  try {
    console.log("🔒 Server: Fetching TinyBird shipments data securely...");

    const warehouseBaseUrl = process.env.WAREHOUSE_BASE_URL;
    const warehouseToken = process.env.WAREHOUSE_TOKEN;
    if (!warehouseBaseUrl || !warehouseToken) {
      throw new Error(
        "WAREHOUSE_BASE_URL and WAREHOUSE_TOKEN environment variables not configured",
      );
    }

    const warehouseUrl = `${warehouseBaseUrl}?token=${warehouseToken}`;
    const response = await fetch(warehouseUrl);

    if (!response.ok) {
      throw new Error(
        `TinyBird Shipments API Error: ${response.status} ${response.statusText}`,
      );
    }

    const result: TinyBirdResponse<ShipmentData> = await response.json();

    console.log(
      "✅ Server: Shipments data fetched successfully:",
      result.data.length,
      "records",
    );

    res.json({
      success: true,
      data: result.data,
      count: result.data.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Server: TinyBird shipments fetch failed:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch shipments data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Secure OpenAI Insights generation proxy
 * API key not exposed to client
 */
export const generateInsights: RequestHandler = async (req, res) => {
  try {
    console.log("🔒 Server: Generating AI insights securely...");

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY environment variable not configured");
    }

    const { analysisData } = req.body;
    if (!analysisData) {
      return res.status(400).json({
        success: false,
        error: "Analysis data required for insight generation",
      });
    }

    const prompt = buildAnalysisPrompt(analysisData);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API Error: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();
    const insights = parseInsightsResponse(result.choices[0].message.content);

    console.log(
      "✅ Server: AI insights generated successfully:",
      insights.length,
      "insights",
    );

    res.json({
      success: true,
      insights,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Server: AI insight generation failed:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate AI insights",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Combined dashboard data endpoint
 * Fetches all data server-side and returns processed result
 */
export const getDashboardData: RequestHandler = async (req, res) => {
  try {
    console.log("🔒 Server: Fetching complete dashboard data securely...");

    // Fetch both datasets server-side
    const [productsResponse, shipmentsResponse] = await Promise.all([
      fetchProductsInternal(),
      fetchShipmentsInternal(),
    ]);

    const products = productsResponse.data;
    const shipments = shipmentsResponse.data;

    // Calculate all metrics server-side
    const kpis = calculateKPIs(products, shipments);
    const quickOverview = calculateQuickOverview(products, shipments);
    const warehouseInventory = getInventoryByWarehouse(products, shipments);
    const anomalies = detectAnomalies(products, shipments);

    // Try to generate AI insights (optional - don't fail if this fails)
    let insights = [];
    try {
      insights = await generateInsightsInternal({
        warehouseInventory,
        kpis,
        products,
        shipments,
      });
    } catch (error) {
      console.warn(
        "⚠️ Server: AI insights generation failed, continuing without insights:",
        error,
      );
    }

    const dashboardData = {
      products,
      shipments,
      kpis,
      quickOverview,
      warehouseInventory,
      insights,
      anomalies,
      lastUpdated: new Date().toISOString(),
    };

    console.log("✅ Server: Complete dashboard data processed successfully");

    res.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Server: Dashboard data processing failed:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Internal helper functions (not exposed)
async function fetchProductsInternal() {
  const baseUrl = process.env.TINYBIRD_BASE_URL!;
  const token = process.env.TINYBIRD_TOKEN!;
  // Add filters for specific company and brand + limit for performance
  const url = `${baseUrl}?token=${token}&limit=100&company_url=COMP002_packiyo&brand_id=561bdd14-630a-4a0c-9493-50a513bbb946`;
  console.log("📦 Local: Fetching products with limit=100 for faster response");

  const response = await fetch(url);
  if (!response.ok) throw new Error("TinyBird Products API Error");
  const result: TinyBirdResponse<ProductData> = await response.json();
  return { data: result.data };
}

async function fetchShipmentsInternal() {
  const baseUrl = process.env.WAREHOUSE_BASE_URL!;
  const token = process.env.WAREHOUSE_TOKEN!;
  // This part of the code fetches from inbound_shipments_details_mv API with COMP002_3PL company filter
  const url = `${baseUrl}?token=${token}&limit=150&company_url=COMP002_3PL`;
  console.log(
    "🚛 Local: Fetching shipments from inbound_shipments_details_mv API with COMP002_3PL filter",
  );

  const response = await fetch(url);
  if (!response.ok) throw new Error("TinyBird Shipments API Error");
  const result: TinyBirdResponse<ShipmentData> = await response.json();
  return { data: result.data };
}

/**
 * This part of the code calculates real financial impact from operational data
 * Uses actual unit costs and quantity discrepancies for accurate dollar amounts
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

  // Calculate lost revenue from inactive products
  const inactiveProductsValue = products
    .filter(p => !p.active && p.unit_cost)
    .reduce((sum, product) => {
      // Estimate monthly lost revenue potential
      return sum + ((product.unit_cost || 0) * product.unit_quantity * 30);
    }, 0);

  // Calculate total inventory value at risk
  const atRiskInventoryValue = shipments
    .filter(s => s.expected_quantity !== s.received_quantity || s.status === "cancelled")
    .reduce((sum, shipment) => {
      return sum + (shipment.received_quantity * (shipment.unit_cost || 0));
    }, 0);

  return {
    quantityDiscrepancyImpact: Math.round(quantityDiscrepancyImpact),
    cancelledShipmentsImpact: Math.round(cancelledShipmentsImpact),
    inactiveProductsValue: Math.round(inactiveProductsValue),
    atRiskInventoryValue: Math.round(atRiskInventoryValue),
    totalFinancialRisk: Math.round(quantityDiscrepancyImpact + cancelledShipmentsImpact + inactiveProductsValue)
  };
}

async function generateInsightsInternal(data: any) {
  const prompt = buildAnalysisPrompt(data);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) throw new Error("OpenAI API Error");

  const result = await response.json();
  return parseInsightsResponse(result.choices[0].message.content);
}

function buildAnalysisPrompt(data: any): string {
  const { warehouseInventory, kpis, products, shipments } = data;
  
  const financialImpacts = calculateFinancialImpacts(products, shipments);
  const totalProducts = products.length;
  const totalShipments = shipments.length;
  const activeProducts = products.filter((p: ProductData) => p.active).length;
  const inactiveProducts = products.filter((p: ProductData) => !p.active).length;
  const atRiskShipments = shipments.filter((s: ShipmentData) => s.expected_quantity !== s.received_quantity).length;
  const cancelledShipments = shipments.filter((s: ShipmentData) => s.status === "cancelled").length;
  const totalShipmentValue = shipments.reduce((sum: number, s: ShipmentData) => sum + (s.received_quantity * (s.unit_cost || 0)), 0);

  return `
You are a 3PL operations analyst. Analyze this real logistics data and generate 2-3 actionable insights with real financial impact.

OPERATIONAL DATA:
- Total Products: ${totalProducts} (${inactiveProducts} inactive)
- Total Shipments: ${totalShipments} (${atRiskShipments} with quantity discrepancies, ${cancelledShipments} cancelled)
- Total Shipment Value: $${Math.round(totalShipmentValue).toLocaleString()}

FINANCIAL IMPACT ANALYSIS:
- Quantity Discrepancy Impact: $${financialImpacts.quantityDiscrepancyImpact.toLocaleString()}
- Cancelled Shipments Impact: $${financialImpacts.cancelledShipmentsImpact.toLocaleString()}
- Inactive Products Lost Revenue: $${financialImpacts.inactiveProductsValue.toLocaleString()}/month
- Total Financial Risk: $${financialImpacts.totalFinancialRisk.toLocaleString()}

Generate insights focusing on the highest financial impact areas. Include specific dollar amounts and percentages.

FORMAT AS JSON ARRAY:
[
  {
    "title": "Specific Issue Title",
    "description": "Detailed analysis with financial impact and recommendations",
    "severity": "critical|warning|info",
    "dollarImpact": actual_dollar_amount,
    "suggestedActions": ["Action 1", "Action 2"]
  }
]
`;
}

function parseInsightsResponse(content: string) {
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON found");

    const insights = JSON.parse(jsonMatch[0]);
    const timestamp = new Date().toISOString();

    return insights.map((insight: any, index: number) => ({
      id: `ai-insight-${Date.now()}-${index}`,
      title: insight.title || "AI Generated Insight",
      description: insight.description || "Analysis from operational data",
      severity: insight.severity || "info",
      dollarImpact: insight.dollarImpact || 0,
      suggestedActions: Array.isArray(insight.suggestedActions)
        ? insight.suggestedActions
        : [],
      createdAt: timestamp,
      source: "dashboard_agent",
    }));
  } catch (error) {
    console.error("Failed to parse AI insights:", error);
    // This part of the code returns empty insights when AI parsing fails - only show real data-driven insights
    return [];
  }
}

// KPI calculation functions (same logic as client-side)
function calculateKPIs(products: ProductData[], shipments: ShipmentData[]) {
  const today = new Date().toISOString().split("T")[0];

  const totalOrdersToday = shipments.filter(
    (shipment) => shipment.created_date === today,
  ).length;

  const atRiskOrders = shipments.filter(
    (shipment) =>
      shipment.expected_quantity !== shipment.received_quantity ||
      shipment.status === "cancelled",
  ).length;

  const openPOs = new Set(
    shipments
      .filter(
        (shipment) =>
          shipment.purchase_order_number &&
          shipment.status !== "completed" &&
          shipment.status !== "cancelled",
      )
      .map((shipment) => shipment.purchase_order_number),
  ).size;

  const unfulfillableSKUs = products.filter(
    (product) => !product.active,
  ).length;

  return {
    totalOrdersToday: totalOrdersToday > 0 ? totalOrdersToday : null,
    atRiskOrders: atRiskOrders > 0 ? atRiskOrders : null,
    openPOs: openPOs > 0 ? openPOs : null,
    unfulfillableSKUs,
  };
}

function calculateQuickOverview(
  products: ProductData[],
  shipments: ShipmentData[],
) {
  const atRiskCount = shipments.filter(
    (shipment) =>
      shipment.expected_quantity !== shipment.received_quantity ||
      shipment.status === "cancelled",
  ).length;

  const onTrackCount = shipments.filter(
    (shipment) =>
      shipment.expected_quantity === shipment.received_quantity &&
      shipment.status !== "cancelled",
  ).length;

  const dollarImpact = shipments
    .filter(
      (shipment) => shipment.expected_quantity !== shipment.received_quantity,
    )
    .reduce((sum, shipment) => {
      const quantityDiff = Math.abs(
        shipment.expected_quantity - shipment.received_quantity,
      );
      const cost = shipment.unit_cost || 0;
      return sum + quantityDiff * cost;
    }, 0);

  const completedWorkflows = new Set(
    shipments
      .filter(
        (shipment) =>
          shipment.status === "receiving" || shipment.status === "completed",
      )
      .map((shipment) => shipment.purchase_order_number),
  ).size;

  return {
    topIssues: atRiskCount,
    whatsWorking: onTrackCount,
    dollarImpact: Math.round(dollarImpact),
    completedWorkflows,
  };
}

function getInventoryByWarehouse(
  products: ProductData[],
  shipments: ShipmentData[],
) {
  // This part of the code provides realistic warehouse-specific inventory numbers  
  // Using proper Map-based deduplication to ensure unique warehouses
  const warehouseMap = new Map();
  shipments.forEach((s) => {
    if (s.warehouse_id && !warehouseMap.has(s.warehouse_id)) {
      warehouseMap.set(s.warehouse_id, {
        id: s.warehouse_id,
        name: s.supplier, // Use supplier as warehouse name
      });
    }
  });
  
  return Array.from(warehouseMap.values()).map((warehouse) => {
    // This part of the code calculates real warehouse inventory from actual shipment data
    const warehouseShipments = shipments.filter(s => s.warehouse_id === warehouse.id);
    const warehouseProducts = products.filter(p => 
      warehouseShipments.some(s => s.inventory_item_id === p.inventory_item_id)
    );
    
    const totalInventory = warehouseShipments.reduce((sum, shipment) => 
      sum + shipment.received_quantity, 0
    );
    
    const averageCost = warehouseShipments.length > 0 
      ? warehouseShipments
          .filter(s => s.unit_cost !== null)
          .reduce((sum, shipment) => sum + (shipment.unit_cost || 0), 0) / 
        warehouseShipments.filter(s => s.unit_cost !== null).length
      : 0;
    
    return {
      warehouseId: warehouse.id,
      totalInventory,
      productCount: warehouseProducts.length,
      averageCost: Math.round(averageCost || 0),
    };
  });
}

function detectAnomalies(products: ProductData[], shipments: ShipmentData[]) {
  const anomalies = [];

  const unfulfillableCount = products.filter((p) => !p.active).length;
  if (unfulfillableCount > 100) {
    anomalies.push({
      id: "high-unfulfillable-skus",
      type: "high_unfulfillable_skus",
      title: "High Unfulfillable SKUs",
      description: `${unfulfillableCount} SKUs cannot be fulfilled`,
      severity: "critical",
      icon: "⚠️",
      createdAt: new Date().toISOString(),
    });
  }

  const today = new Date().toISOString().split("T")[0];
  const todayOrders = shipments.filter((s) => s.created_date === today).length;
  if (todayOrders === 0) {
    anomalies.push({
      id: "low-order-volume",
      type: "low_order_volume",
      title: "Low Order Volume",
      description: "No orders detected today",
      severity: "info",
      icon: "📊",
      createdAt: new Date().toISOString(),
    });
  }

  return anomalies;
}
