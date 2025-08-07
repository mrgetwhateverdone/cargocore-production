import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * This part of the code provides inventory data endpoint for Vercel serverless deployment
 * Following the exact same pattern as analytics-data.ts for consistency
 */

// TinyBird Product Details API Response - standardized interface
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

// Inventory Insight interface for type safety
interface InventoryInsight {
  type: string;
  title: string;
  description: string;
  severity: string;
  dollarImpact: number;
  suggestedActions?: string[];
}

/**
 * This part of the code fetches products data from TinyBird API using standardized parameters
 * Same endpoint as analytics but mapped to inventory concepts
 */
async function fetchProducts(): Promise<ProductData[]> {
  const baseUrl = process.env.TINYBIRD_BASE_URL;
  const token = process.env.TINYBIRD_TOKEN;

  if (!baseUrl || !token) {
    throw new Error("TinyBird configuration missing");
  }

  // This part of the code uses the same endpoint as analytics for consistency
  const url = `${baseUrl}/v0/pipes/product_details_mv.json?token=${token}&limit=1000`;

  console.log("🔒 Server: Fetching products data for inventory analysis...");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TinyBird API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  console.log("✅ Server: Products data fetched:", result.data?.length || 0, "records");

  return result.data || [];
}

/**
 * This part of the code transforms product data into inventory structure
 * Maps product fields to inventory concepts
 */
function transformProductsToInventoryItems(products: ProductData[]) {
  return products
    .filter(product => product.company_url === 'COMP002_packiyo') // Same filter as other pages
    .map(product => {
      // This part of the code calculates inventory metrics from product data
      const onHand = Math.max(0, product.unit_quantity || 0);
      const committed = Math.floor(onHand * 0.1); // Simple calculation: 10% committed
      const available = Math.max(0, onHand - committed);
      
      // This part of the code determines inventory status
      let status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstocked';
      if (available === 0) {
        status = 'Out of Stock';
      } else if (available < 10) {
        status = 'Low Stock';
      } else if (available > 100) {
        status = 'Overstocked';
      } else {
        status = 'In Stock';
      }

      return {
        sku: product.product_sku || product.product_id,
        product_name: product.product_name,
        brand_name: product.brand_name,
        on_hand: onHand,
        committed: committed,
        available: available,
        status: status,
        warehouse_id: null,
        supplier: product.supplier_name || product.product_supplier,
        last_updated: product.updated_date,
      };
    });
}

/**
 * This part of the code calculates inventory KPIs from the inventory data
 */
function calculateInventoryKPIs(inventory: any[]) {
  const totalSKUs = inventory.length;
  const inStockCount = inventory.filter(item => item.status === 'In Stock' || item.status === 'Overstocked').length;
  const unfulfillableCount = inventory.filter(item => item.status === 'Out of Stock').length;
  const overstockedCount = inventory.filter(item => item.status === 'Overstocked').length;
  
  // This part of the code calculates average days on hand (simplified calculation)
  const totalQuantity = inventory.reduce((sum, item) => sum + item.on_hand, 0);
  const avgDaysOnHand = totalSKUs > 0 ? Math.round(totalQuantity / totalSKUs * 30) : null; // Estimate: quantity * 30 days turnover

  return {
    totalSKUs,
    inStockCount,
    unfulfillableCount,
    overstockedCount,
    avgDaysOnHand,
  };
}

/**
 * This part of the code generates inventory-specific AI insights
 */
async function generateInventoryInsights(
  inventory: any[],
  kpis: any
): Promise<InventoryInsight[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // This part of the code generates inventory insights without AI when API key is not available
    const insights: InventoryInsight[] = [];
    
    if (kpis.unfulfillableCount > 0) {
      insights.push({
        type: "critical",
        title: "Stock Shortage Alert",
        description: `${kpis.unfulfillableCount} SKUs are out of stock and cannot fulfill orders. Immediate replenishment required to avoid customer impact.`,
        severity: "critical",
        dollarImpact: 0, // No mock values - real impact calculation not available
        suggestedActions: [
          "Review out-of-stock SKUs for immediate reorder",
          "Contact suppliers for expedited delivery",
          "Implement safety stock policies"
        ]
      });
    }
    
    if (kpis.overstockedCount > 10) {
      insights.push({
        type: "warning",
        title: "Excess Inventory Alert",
        description: `${kpis.overstockedCount} SKUs are overstocked, consuming warehouse space and capital. Consider inventory optimization strategies.`,
        severity: "warning",
        dollarImpact: 0, // No mock values - real impact calculation not available
        suggestedActions: [
          "Analyze overstocked items for markdown opportunities",
          "Review reorder points and quantities",
          "Implement demand forecasting improvements"
        ]
      });
    }
    
    if (kpis.avgDaysOnHand && kpis.avgDaysOnHand > 90) {
      insights.push({
        type: "info",
        title: "Slow Inventory Turnover",
        description: `Average days on hand is ${kpis.avgDaysOnHand} days, indicating slow inventory movement. Review demand patterns and adjust procurement.`,
        severity: "info",
        dollarImpact: 0, // No mock values - real impact calculation not available
        suggestedActions: [
          "Analyze slow-moving inventory patterns",
          "Adjust reorder frequencies based on demand",
          "Consider promotional strategies for slow items"
        ]
      });
    }
    
    return insights;
  }

  try {
    // This part of the code calls OpenAI for sophisticated inventory analysis
    const totalValue = inventory.reduce((sum, item) => sum + (item.on_hand * (item.unit_cost || 0)), 0);
    const topBrands = [...new Set(inventory.map(item => item.brand_name))].slice(0, 5);
    
    const openaiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
    const response = await fetch(openaiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an inventory optimization specialist. Analyze 3PL inventory data to identify stock management opportunities and operational improvements.

INVENTORY ANALYSIS CONTEXT:
- Total SKUs: ${kpis.totalSKUs}
- In Stock: ${kpis.inStockCount}
- Out of Stock: ${kpis.unfulfillableCount}
- Overstocked: ${kpis.overstockedCount}
- Avg Days on Hand: ${kpis.avgDaysOnHand || 'Not available'}
- Total Portfolio Value: $${totalValue.toLocaleString()}
- Active Brands: ${topBrands.join(', ')}

PROVIDE INVENTORY INTELLIGENCE:
1. STOCK OPTIMIZATION: What inventory adjustments will improve turnover and reduce carrying costs?
2. REPLENISHMENT STRATEGY: How should reorder points and quantities be optimized?
3. RISK MITIGATION: What stock-related risks need immediate attention?
4. OPERATIONAL EFFICIENCY: How can warehouse space and capital utilization be improved?

FORMAT AS INVENTORY OPTIMIZATION JSON:
[
  {
    "type": "warning",
    "title": "Inventory Strategy Title",
    "description": "Stock analysis with optimization recommendations, turnover insights, and specific inventory management actions",
    "severity": "critical|warning|info",
    "dollarImpact": calculated_cost_savings_or_risk,
    "suggestedActions": ["Implement ABC analysis for top 20% of SKUs", "Negotiate supplier payment terms for overstocked items", "Establish automated reorder triggers for critical inventory"]
  }
]

CRITICAL: suggestedActions must be:
- Specific inventory management tasks (not generic placeholders)
- Based on actual stock level analysis and turnover data
- Ordered by impact (highest value savings first, preventive measures last)
- Include specific SKU categories, brands, or inventory policies when relevant
- Between 1-4 actions based on inventory issue complexity`,
          },
        ],
        max_tokens: 700,
        temperature: 0.2,
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
    console.error("Inventory AI analysis failed:", error);
  }

  // This part of the code generates fallback inventory insights when AI fails
  const insights: InventoryInsight[] = [];
  
  if (kpis.unfulfillableCount > 0) {
    insights.push({
      type: "critical",
      title: "Stock Shortage Alert",
      description: `${kpis.unfulfillableCount} SKUs are out of stock and cannot fulfill orders. Immediate replenishment required to avoid customer impact.`,
      severity: "critical",
      dollarImpact: 0, // No mock values - real impact calculation not available
      suggestedActions: [
        "Review out-of-stock SKUs for immediate reorder",
        "Contact suppliers for expedited delivery",
        "Implement safety stock policies"
      ]
    });
  }
  
  if (kpis.overstockedCount > 10) {
    insights.push({
      type: "warning",
      title: "Excess Inventory Alert",
      description: `${kpis.overstockedCount} SKUs are overstocked, consuming warehouse space and capital. Consider inventory optimization strategies.`,
      severity: "warning",
      dollarImpact: 0, // No mock values - real impact calculation not available
      suggestedActions: [
        "Analyze overstocked items for markdown opportunities",
        "Review reorder points and quantities",
        "Implement demand forecasting improvements"
      ]
    });
  }
  
  if (kpis.avgDaysOnHand && kpis.avgDaysOnHand > 90) {
    insights.push({
      type: "info",
      title: "Slow Inventory Turnover",
      description: `Average days on hand is ${kpis.avgDaysOnHand} days, indicating slow inventory movement. Review demand patterns and adjust procurement.`,
      severity: "info",
      dollarImpact: 0, // No mock values - real impact calculation not available
      suggestedActions: [
        "Analyze slow-moving inventory patterns",
        "Adjust reorder frequencies based on demand",
        "Consider promotional strategies for slow items"
      ]
    });
  }

  return insights;
}

/**
 * This part of the code handles the main API request
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    console.log("🔒 Server: Starting inventory data compilation...");

    // This part of the code fetches and processes all inventory data
    const products = await fetchProducts();
    const inventory = transformProductsToInventoryItems(products);
    const kpis = calculateInventoryKPIs(inventory);
    const insights = await generateInventoryInsights(inventory, kpis);

    const inventoryData = {
      kpis,
      insights,
      inventory: inventory.slice(0, 500), // Limit for performance
      lastUpdated: new Date().toISOString(),
    };

    console.log("✅ Server: Inventory data compiled successfully");
    console.log("📊 Server: Inventory summary:", {
      totalSKUs: kpis.totalSKUs,
      inStock: kpis.inStockCount,
      outOfStock: kpis.unfulfillableCount,
      overstocked: kpis.overstockedCount,
      insights: insights.length,
    });

    res.status(200).json({
      success: true,
      data: inventoryData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Server: Inventory API error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory data",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}
