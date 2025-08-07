import type { VercelRequest, VercelResponse } from "@vercel/node";

// Phase 1: Real KPIs from TinyBird data
interface ProductData {
  product_id: string;
  company_url: string;
  brand_name: string;
  product_name: string;
  product_sku: string | null;
  unit_quantity: number;
  active: boolean;
}

async function fetchProducts(): Promise<ProductData[]> {
  const baseUrl = process.env.TINYBIRD_BASE_URL;
  const token = process.env.TINYBIRD_TOKEN;

  if (!baseUrl || !token) {
    console.log("⚠️ TinyBird config missing, using fallback");
    return [];
  }

  const url = `${baseUrl}/v0/pipes/product_details_mv.json?token=${token}&limit=1000`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log("⚠️ TinyBird API failed, using fallback");
      return [];
    }
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.log("⚠️ TinyBird fetch failed, using fallback");
    return [];
  }
}

function calculateRealKPIs(products: ProductData[]) {
  // Filter to company data
  const companyProducts = products.filter(p => p.company_url === 'COMP002_packiyo');
  
  const totalSKUs = companyProducts.length;
  const inStockCount = companyProducts.filter(p => p.unit_quantity > 0).length;
  const unfulfillableCount = companyProducts.filter(p => p.unit_quantity === 0).length;
  const overstockedCount = companyProducts.filter(p => p.unit_quantity > 100).length;
  
  // Simple avg days calculation
  const totalQuantity = companyProducts.reduce((sum, p) => sum + p.unit_quantity, 0);
  const avgDaysOnHand = totalSKUs > 0 ? Math.round(totalQuantity / totalSKUs * 30) : 0;

  return {
    totalSKUs,
    inStockCount,
    unfulfillableCount,
    overstockedCount,
    avgDaysOnHand
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🔒 Phase 1: Fetching real inventory KPIs...");

    // Fetch real data and calculate KPIs
    const products = await fetchProducts();
    const kpis = products.length > 0 
      ? calculateRealKPIs(products) 
      : {
          totalSKUs: 0,
          inStockCount: 0, 
          unfulfillableCount: 0,
          overstockedCount: 0,
          avgDaysOnHand: null
        };

    console.log("📊 KPIs calculated:", kpis);

    const inventoryData = {
      kpis,
      insights: products.length > 0 ? [
        {
          id: "inventory-insight-1",
          title: "Stock Analysis",
          description: `Inventory analysis shows ${kpis.unfulfillableCount} unfulfillable SKUs out of ${kpis.totalSKUs} total SKUs requiring attention.`,
          severity: kpis.unfulfillableCount > 10 ? "warning" as const : "info" as const,
          dollarImpact: 0,
          suggestedActions: ["Review stock levels", "Contact suppliers"],
          createdAt: new Date().toISOString(),
          source: "inventory_agent" as const,
        }
      ] : [
        {
          id: "inventory-insight-1",
          title: "Information Not Available",
          description: "Inventory insights are not available. Data source connection required.",
          severity: "info" as const,
          dollarImpact: 0,
          suggestedActions: ["Check data source connection"],
          createdAt: new Date().toISOString(),
          source: "inventory_agent" as const,
        }
      ],
      inventory: products.length > 0 ? [
        {
          sku: "N/A",
          product_name: "Information not available in dataset",
          brand_name: "N/A",
          on_hand: 0,
          committed: 0,
          available: 0,
          status: "Out of Stock" as const,
          warehouse_id: null,
          supplier: "N/A",
          last_updated: null
        }
      ] : [
        {
          sku: "N/A",
          product_name: "Information not available in dataset",
          brand_name: "N/A",
          on_hand: 0,
          committed: 0,
          available: 0,
          status: "Out of Stock" as const,
          warehouse_id: null,
          supplier: "N/A",
          last_updated: null
        }
      ],
      lastUpdated: new Date().toISOString(),
    };

    console.log("✅ Phase 1: Inventory KPIs generated from", products.length > 0 ? "real TinyBird data" : "fallback data");
    
    res.status(200).json({
      success: true,
      data: inventoryData,
      message: "Inventory data retrieved successfully",
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error("❌ Simple inventory API error:", error);
    res.status(500).json({
      error: "Failed to fetch inventory data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}