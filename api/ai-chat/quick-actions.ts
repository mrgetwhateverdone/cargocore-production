import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * This part of the code defines the quick actions available for AI assistant
 * Each action provides predefined prompts that leverage real operational data
 */
const QUICK_ACTIONS = [
  {
    id: "top-brands",
    label: "Name my top brands",
    prompt: "Based on my current operational data, name my top 5 brands by total activity (SKUs + shipments). Include specific metrics for each brand and their operational performance."
  },
  {
    id: "warehouse-status", 
    label: "List my warehouses",
    prompt: "List all my active warehouses with their current SLA performance, shipment volume, and operational status. Rank them by performance and identify any that need attention."
  },
  {
    id: "daily-priorities",
    label: "What should I act on today?",
    prompt: "Analyze my current operations and identify the top 3-5 most critical issues I should address today. Focus on at-risk shipments, processing problems, and financial impact."
  },
  {
    id: "at-risk-orders",
    label: "Show at-risk orders",
    prompt: "Identify all shipments and orders that are currently at-risk. Include quantity discrepancies, cancelled orders, and delayed shipments with their potential financial impact."
  }
];

/**
 * This part of the code handles requests for available quick actions
 * Returns predefined prompts for immediate operational insights
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🚀 Quick Actions API: Fetching available actions...");
    
    res.status(200).json({
      success: true,
      data: QUICK_ACTIONS,
      message: "Quick actions retrieved successfully",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Quick Actions API Error:", error);
    
    res.status(500).json({
      error: "Failed to fetch quick actions",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
