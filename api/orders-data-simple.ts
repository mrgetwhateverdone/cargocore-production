import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    console.log("📦 Simple orders endpoint test");

    const ordersData = {
      orders: [],
      kpis: {
        ordersToday: 0,
        atRiskOrders: 0,
        openPOs: 0,
        unfulfillableSKUs: 0
      },
      insights: [],
      inboundIntelligence: {
        totalInbound: 0,
        delayedShipments: { count: 0, percentage: 0 },
        avgDelayDays: 0,
        valueAtRisk: 0,
        recentShipments: [],
        delayedShipmentsList: []
      },
      lastUpdated: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      data: ordersData,
      message: "Orders data retrieved successfully",
      timestamp: new Date().toISOString(),
    });
    return;
  } catch (error) {
    console.error("❌ Simple orders error:", error);
    res.status(500).json({
      error: "Failed to fetch orders data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
}
