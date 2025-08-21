import type { VercelRequest, VercelResponse } from "@vercel/node";

// Phase 2: World-Class Inventory Dashboard with Rich Data
interface ProductData {
  product_id: string;
  company_url: string;
  brand_name: string;
  product_name: string;
  product_sku: string | null;
  unit_quantity: number;
  unit_cost: number | null;
  active: boolean;
  supplier_name: string;
  country_of_origin: string | null;
  created_date: string;
  updated_date: string | null;
}

async function fetchProducts(): Promise<ProductData[]> {
  const baseUrl = process.env.TINYBIRD_BASE_URL;
  const token = process.env.TINYBIRD_TOKEN;

  if (!baseUrl || !token) {
    console.log("⚠️ TinyBird config missing, using fallback");
    return [];
  }

  // This part of the code matches the working dashboard API URL pattern
  const url = `${baseUrl}?token=${token}&limit=1000&company_url=COMP002_packiyo`;
  
  try {
    console.log("🔒 Fetching from TinyBird:", url.replace(token, "[TOKEN]"));
    const response = await fetch(url);
    if (!response.ok) {
      console.log("⚠️ TinyBird API failed:", response.status, response.statusText);
      return [];
    }
    const result = await response.json();
    console.log("✅ TinyBird response:", result.data?.length || 0, "products");
    return result.data || [];
  } catch (error) {
    console.log("⚠️ TinyBird fetch failed:", error);
    return [];
  }
}

// TinyBird Shipments API Response interface
interface ShipmentData {
  company_url: string;
  shipment_id: string;
  supplier: string | null;
  created_date: string;
  expected_arrival_date: string | null;
  arrival_date: string;
  inventory_item_id: string;
  sku: string | null;
}

async function fetchShipments(): Promise<ShipmentData[]> {
  const baseUrl = process.env.WAREHOUSE_BASE_URL;
  const token = process.env.WAREHOUSE_TOKEN;

  if (!baseUrl || !token) {
    console.log("⚠️ Warehouse TinyBird config missing, skipping shipment data");
    return [];
  }

  // This part of the code matches the working pattern from other APIs
  const url = `${baseUrl}?token=${token}&limit=1000&company_url=COMP002_3PL`;
  
  try {
    console.log("🔒 Fetching shipments from TinyBird:", url.replace(token, "[TOKEN]"));
    const response = await fetch(url);
    if (!response.ok) {
      console.log("⚠️ Shipments API failed:", response.status, response.statusText);
      return [];
    }
    const result = await response.json();
    console.log("✅ Shipments response:", result.data?.length || 0, "shipments");
    return result.data || [];
  } catch (error) {
    console.log("⚠️ Shipments fetch failed:", error);
    return [];
  }
}

function calculateEnhancedKPIs(products: ProductData[]) {
  // Data is already filtered by company_url in the API call
  const companyProducts = products;
  
  // Basic counts
  const totalSKUs = companyProducts.length;
  const activeSKUs = companyProducts.filter(p => p.active).length;
  const inactiveSKUs = companyProducts.filter(p => !p.active).length;
  const lowStockCount = companyProducts.filter(p => p.unit_quantity > 0 && p.unit_quantity < 10).length;
  
  // Value calculations
  const totalInventoryValue = companyProducts.reduce((sum, p) => {
    const cost = p.unit_cost || 0;
    return sum + (p.unit_quantity * cost);
  }, 0);
  
  // Legacy KPIs for compatibility
  const inStockCount = companyProducts.filter(p => p.unit_quantity > 0).length;
  const unfulfillableCount = companyProducts.filter(p => p.unit_quantity === 0).length;
  const overstockedCount = companyProducts.filter(p => p.unit_quantity > 100).length;
  
  return {
    // Enhanced KPIs
    totalActiveSKUs: activeSKUs,
    totalInventoryValue: Math.round(totalInventoryValue),
    lowStockAlerts: lowStockCount,
    inactiveSKUs: inactiveSKUs,
    
    // Legacy KPIs for compatibility
    totalSKUs,
    inStockCount,
    unfulfillableCount,
    overstockedCount,
    avgDaysOnHand: null // Will calculate separately if needed
  };
}

function calculateBrandPerformance(products: ProductData[]) {
  // Data is already filtered by company_url in the API call
  const companyProducts = products;
  const brandMap = new Map<string, {skuCount: number, totalValue: number, totalQuantity: number}>();
  
  companyProducts.forEach(p => {
    const cost = p.unit_cost || 0;
    const value = p.unit_quantity * cost;
    
    if (brandMap.has(p.brand_name)) {
      const existing = brandMap.get(p.brand_name)!;
      existing.skuCount += 1;
      existing.totalValue += value;
      existing.totalQuantity += p.unit_quantity;
    } else {
      brandMap.set(p.brand_name, {
        skuCount: 1,
        totalValue: value,
        totalQuantity: p.unit_quantity
      });
    }
  });
  
  const totalPortfolioValue = Array.from(brandMap.values()).reduce((sum, data) => sum + data.totalValue, 0);
  
  return Array.from(brandMap.entries())
    .map(([brand, data]) => ({
      brand_name: brand,
      sku_count: data.skuCount,
      total_value: Math.round(data.totalValue),
      total_quantity: data.totalQuantity,
      avg_value_per_sku: Math.round(data.totalValue / data.skuCount),
      portfolio_percentage: totalPortfolioValue > 0 ? Math.round((data.totalValue / totalPortfolioValue) * 100) : 0,
      efficiency_score: Math.round((data.totalValue / data.skuCount) * (data.totalQuantity / data.skuCount))
    }))
    .sort((a, b) => b.total_value - a.total_value); // All brands, sorted by value
}

// This part of the code calculates supplier diversity score based on geographic and operational factors
function calculateDiversityScore(countries: string[], skuCount: number, totalValue: number): number {
  // Base score from geographic diversity (0-50 points)
  const geoScore = Math.min(50, countries.length * 5);
  
  // Operational diversity bonus (0-30 points)
  const operationalScore = Math.min(30, Math.floor(skuCount / 5) * 2);
  
  // Business scale factor (0-20 points)
  const scaleScore = totalValue > 50000 ? 20 : totalValue > 10000 ? 10 : 5;
  
  return Math.min(100, geoScore + operationalScore + scaleScore);
}

// This part of the code calculates average lead time for a supplier from shipment data
function calculateAvgLeadTime(supplierName: string, shipments: ShipmentData[]): number | null {
  const supplierShipments = shipments.filter(s => 
    s.supplier && s.supplier.toLowerCase() === supplierName.toLowerCase()
  );
  
  if (supplierShipments.length === 0) return null;
  
  const leadTimes = supplierShipments
    .filter(s => s.created_date && s.arrival_date)
    .map(s => {
      const created = new Date(s.created_date);
      const arrived = new Date(s.arrival_date);
      return Math.max(0, Math.ceil((arrived.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
    })
    .filter(days => days > 0 && days < 365); // Filter out invalid dates
  
  if (leadTimes.length === 0) return null;
  
  return Math.round(leadTimes.reduce((sum, days) => sum + days, 0) / leadTimes.length);
}

// This part of the code counts SKUs available from multiple suppliers
function countMultiSourceSKUs(supplierName: string, allProducts: ProductData[]): number {
  // Get all SKUs from this supplier
  const supplierSKUs = new Set(
    allProducts
      .filter(p => p.supplier_name === supplierName && p.product_sku)
      .map(p => p.product_sku!)
  );
  
  // Count how many of these SKUs are also available from other suppliers
  let multiSourceCount = 0;
  
  supplierSKUs.forEach(sku => {
    const suppliersForSKU = new Set(
      allProducts
        .filter(p => p.product_sku === sku)
        .map(p => p.supplier_name)
    );
    
    // If this SKU is available from more than one supplier, count it
    if (suppliersForSKU.size > 1) {
      multiSourceCount++;
    }
  });
  
  return multiSourceCount;
}

// This part of the code calculates reorder analysis for inventory items
function calculateReorderAnalysis(
  product: ProductData, 
  shipments: ShipmentData[]
): {
  daily_usage_rate: number;
  lead_time_days: number;
  reorder_date: string;
  recommended_quantity: number;
  reorder_cost: number;
  days_until_stockout: number;
  safety_stock: number;
  status: 'critical' | 'warning' | 'good';
} {
  // Calculate daily usage rate from shipment data
  const productShipments = shipments.filter(s => 
    s.sku === product.product_sku
  );
  
  const dailyUsageRate = productShipments.length > 0 ? 
    Math.max(1, Math.ceil(productShipments.length / 30)) : 2; // Fallback to 2 units/day
  
  // Get lead time (use supplier average or fallback to 14 days)
  const leadTimeDays = calculateAvgLeadTime(product.supplier_name, shipments) || 14;
  
  // Calculate safety stock (20% of lead time consumption)
  const safetyStock = Math.ceil(dailyUsageRate * leadTimeDays * 0.2);
  
  // Calculate days until stockout
  const availableStock = Math.max(0, product.unit_quantity - Math.floor(product.unit_quantity * 0.1));
  const daysUntilStockout = Math.floor(availableStock / dailyUsageRate);
  
  // Calculate recommended reorder quantity (lead time consumption + safety stock)
  const recommendedQuantity = Math.ceil((dailyUsageRate * leadTimeDays) + safetyStock);
  
  // Calculate reorder cost
  const reorderCost = recommendedQuantity * (product.unit_cost || 0);
  
  // Calculate reorder date (today + days until reorder needed)
  const reorderDays = Math.max(0, daysUntilStockout - leadTimeDays);
  const reorderDate = new Date();
  reorderDate.setDate(reorderDate.getDate() + reorderDays);
  
  // Determine status
  let status: 'critical' | 'warning' | 'good';
  if (daysUntilStockout <= 3) {
    status = 'critical';
  } else if (daysUntilStockout <= 14) {
    status = 'warning';
  } else {
    status = 'good';
  }
  
  return {
    daily_usage_rate: dailyUsageRate,
    lead_time_days: leadTimeDays,
    reorder_date: reorderDate.toLocaleDateString(),
    recommended_quantity: recommendedQuantity,
    reorder_cost: Math.round(reorderCost),
    days_until_stockout: daysUntilStockout,
    safety_stock: safetyStock,
    status
  };
}

function calculateSupplierAnalysis(products: ProductData[], shipments: ShipmentData[] = []) {
  // Data is already filtered by company_url in the API call
  const companyProducts = products;
  const supplierMap = new Map<string, {skuCount: number, totalValue: number, countries: Set<string>}>();
  
  companyProducts.forEach(p => {
    const cost = p.unit_cost || 0;
    const value = p.unit_quantity * cost;
    
    if (supplierMap.has(p.supplier_name)) {
      const existing = supplierMap.get(p.supplier_name)!;
      existing.skuCount += 1;
      existing.totalValue += value;
      if (p.country_of_origin) existing.countries.add(p.country_of_origin);
    } else {
      supplierMap.set(p.supplier_name, {
        skuCount: 1,
        totalValue: value,
        countries: new Set(p.country_of_origin ? [p.country_of_origin] : [])
      });
    }
  });
  
  const totalCompanyValue = companyProducts.reduce((sum, p) => sum + (p.unit_quantity * (p.unit_cost || 0)), 0);
  
  return Array.from(supplierMap.entries())
    .map(([supplier, data]) => {
      const countries = Array.from(data.countries);
      return {
        supplier_name: supplier,
        sku_count: data.skuCount,
        total_value: Math.round(data.totalValue),
        countries,
        concentration_risk: Math.round((data.totalValue / totalCompanyValue) * 100),
        diversity_score: calculateDiversityScore(countries, data.skuCount, data.totalValue),
        avg_lead_time: calculateAvgLeadTime(supplier, shipments),
        multi_source_skus: countMultiSourceSKUs(supplier, companyProducts)
      };
    })
    .sort((a, b) => b.total_value - a.total_value)
    .slice(0, 15);
}

function transformToEnhancedInventoryItems(products: ProductData[], shipments: ShipmentData[] = []) {
  // Data is already filtered by company_url in the API call
  return products
    .map(p => {
      const cost = p.unit_cost || 0;
      const totalValue = p.unit_quantity * cost;
      const daysSinceCreated = Math.floor((Date.now() - new Date(p.created_date).getTime()) / (1000 * 60 * 60 * 24));
      
      // Enhanced status logic
      let status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstocked' | 'Inactive';
      if (!p.active) {
        status = 'Inactive';
      } else if (p.unit_quantity === 0) {
        status = 'Out of Stock';
      } else if (p.unit_quantity < 10) {
        status = 'Low Stock';
      } else if (p.unit_quantity > 100) {
        status = 'Overstocked';
      } else {
        status = 'In Stock';
      }
      
      // Calculate reorder analysis for active products
      let reorderAnalysis = undefined;
      if (p.active && (status === 'Low Stock' || status === 'Out of Stock' || status === 'In Stock')) {
        const analysis = calculateReorderAnalysis(p, shipments);
        reorderAnalysis = {
          daily_usage_rate: analysis.daily_usage_rate,
          lead_time_days: analysis.lead_time_days,
          reorder_date: analysis.reorder_date,
          recommended_quantity: analysis.recommended_quantity,
          reorder_cost: analysis.reorder_cost,
          days_until_stockout: analysis.days_until_stockout,
          safety_stock: analysis.safety_stock,
          reorder_status: analysis.status
        };
      }
      
      return {
        sku: p.product_sku || p.product_id,
        product_name: p.product_name,
        brand_name: p.brand_name,
        on_hand: p.unit_quantity,
        committed: Math.floor(p.unit_quantity * 0.1), // Simple 10% committed
        available: Math.max(0, p.unit_quantity - Math.floor(p.unit_quantity * 0.1)),
        unit_cost: cost,
        total_value: Math.round(totalValue),
        supplier: p.supplier_name,
        country_of_origin: p.country_of_origin || 'Unknown',
        status,
        active: p.active,
        days_since_created: daysSinceCreated,
        warehouse_id: null,
        last_updated: p.updated_date,
        reorder_analysis: reorderAnalysis
      };
    })
    .sort((a, b) => b.total_value - a.total_value); // Sort by value descending
}

/**
 * This part of the code generates world-class AI recommendations for brand inventory investment optimization
 * Uses advanced prompts to provide specific, actionable brand management strategies
 */
async function generateBrandInventoryRecommendations(
  brand: any,
  contextData: { 
    totalBrands: number; 
    portfolioValue: number; 
    avgEfficiency: number;
    topPerformers: number;
    totalSKUs: number;
  }
): Promise<string[]> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    console.warn('🤖 OpenAI API key not available, using fallback brand inventory recommendations');
    return [
      'Optimize SKU mix to focus on high-performing products',
      'Implement inventory turnover analysis and slow-moving SKU review',
      'Develop brand-specific pricing strategy to improve margins',
      'Establish performance monitoring dashboards for brand KPIs'
    ];
  }

  // This part of the code creates world-class prompts specific to brand performance levels
  const getPromptByPerformance = () => {
    if (brand.efficiency_score >= 85) {
      return `HIGH-PERFORMING BRAND OPTIMIZATION:

Brand Excellence Analysis:
- Brand: ${brand.brand_name} (Top Performer)
- Investment Value: $${brand.total_value.toLocaleString()}
- Efficiency Score: ${brand.efficiency_score}% (Excellent)
- SKU Portfolio: ${brand.sku_count} SKUs, $${brand.avg_value_per_sku.toFixed(2)} avg value/SKU
- Portfolio Share: ${brand.portfolio_percentage}% of total investment
- Total Units: ${brand.total_quantity.toLocaleString()} units

Market Leadership Context:
- Total brand portfolio: ${contextData.totalBrands} brands
- Portfolio value: $${contextData.portfolioValue.toLocaleString()}
- Top performers: ${contextData.topPerformers}/${contextData.totalBrands} brands (${brand.brand_name} included)
- Average efficiency: ${contextData.avgEfficiency}%

STRATEGIC EXPANSION: Generate 4 growth acceleration strategies:
1. Premium line extension and market expansion
2. Operational excellence and competitive advantage
3. Strategic partnerships and channel optimization
4. Innovation leadership and market positioning

Requirements:
- Focus on sustaining market leadership (6+ month strategy)
- Target 15-25% value growth while maintaining efficiency
- Leverage high performance for strategic advantage
- Include innovation and competitive differentiation`;

    } else if (brand.efficiency_score >= 70) {
      return `SOLID BRAND ENHANCEMENT:

Brand Growth Analysis:
- Brand: ${brand.brand_name} (Strong Performer)
- Investment Value: $${brand.total_value.toLocaleString()}
- Efficiency Score: ${brand.efficiency_score}% (Good)
- SKU Portfolio: ${brand.sku_count} SKUs, $${brand.avg_value_per_sku.toFixed(2)} avg value/SKU
- Portfolio Weight: ${brand.portfolio_percentage}% of investment
- Inventory Level: ${brand.total_quantity.toLocaleString()} units

Performance Context:
- Brand portfolio size: ${contextData.totalBrands} brands
- Total portfolio value: $${contextData.portfolioValue.toLocaleString()}
- Benchmark efficiency: ${contextData.avgEfficiency}%
- Above-average performers: ${contextData.topPerformers}

PERFORMANCE ACCELERATION: Generate 4 optimization strategies:
1. Efficiency improvement and margin enhancement
2. SKU portfolio optimization and mix refinement
3. Inventory turnover acceleration and cost reduction
4. Market positioning and competitive advantage

Requirements:
- Target 10-15% efficiency improvement over 90 days
- Balance growth with operational excellence
- Focus on measurable ROI and performance metrics
- Include specific inventory and pricing optimizations`;

    } else {
      return `UNDERPERFORMING BRAND TURNAROUND:

Brand Recovery Analysis:
- Brand: ${brand.brand_name} (Requires Attention)
- Investment Value: $${brand.total_value.toLocaleString()}
- Efficiency Score: ${brand.efficiency_score}% (Below Target)
- SKU Portfolio: ${brand.sku_count} SKUs, $${brand.avg_value_per_sku.toFixed(2)} avg value/SKU
- Portfolio Impact: ${brand.portfolio_percentage}% of total investment
- Stock Level: ${brand.total_quantity.toLocaleString()} units

Critical Context:
- Portfolio brands: ${contextData.totalBrands} total
- Portfolio value at risk: $${contextData.portfolioValue.toLocaleString()}
- Performance gap: ${contextData.avgEfficiency - brand.efficiency_score}% below average
- Requires immediate intervention

URGENT TURNAROUND: Generate 4 recovery strategies:
1. Immediate cost reduction and efficiency improvement
2. SKU rationalization and inventory optimization
3. Pricing strategy review and margin recovery
4. Performance monitoring and corrective actions

Requirements:
- Implement within 30 days for maximum impact
- Target minimum 20% efficiency improvement
- Focus on immediate cost savings and waste reduction
- Include specific timelines and measurable outcomes`;
    }
  };

  try {
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
            content: "You are a world-class brand portfolio optimization expert with 20+ years of experience in inventory management and brand investment strategy. Provide specific, actionable recommendations that drive measurable brand performance improvements. Each recommendation should be a single, clear action (15-20 words max). No explanations or bullet points - just the actionable strategies that deliver business results."
          },
          {
            role: "user", 
            content: getPromptByPerformance()
          }
        ],
        max_tokens: 500,
        temperature: 0.2  // Lower temperature for more focused, practical recommendations
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

    // This part of the code parses AI response into clean, actionable brand recommendations
    const lines = aiResponse.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Remove any formatting characters and numbers
        return line
          .replace(/^\d+\.\s*/, '')    // Remove "1. "
          .replace(/^[•-]\s*/, '')     // Remove "• " or "- "
          .replace(/^\*+/, '')         // Remove asterisks
          .replace(/\*+$/, '')         // Remove trailing asterisks
          .replace(/\*\*/g, '')        // Remove **bold** formatting
          .replace(/^\s*-\s*/, '')     // Remove leading dashes
          .trim();
      })
      .filter(line => line.length > 10 && line.length < 150)  // Reasonable length for brand actions
      .slice(0, 4);  // Max 4 recommendations

    const recommendations = lines.length > 0 ? lines : [
      'Implement SKU performance analysis and optimize product mix',
      'Develop brand-specific pricing strategy to improve margins',
      'Establish inventory turnover targets and monitoring systems',
      'Create brand performance dashboard with actionable metrics'
    ];

    return recommendations;

  } catch (error) {
    console.error('❌ Brand inventory AI recommendation generation failed:', error);
    
    // This part of the code provides high-quality fallback recommendations based on efficiency
    const fallbackRecs = {
      'high': [
        'Expand premium product lines to capitalize on brand strength',
        'Develop strategic partnerships for market expansion opportunities',
        'Implement innovation programs to maintain competitive advantage',
        'Optimize inventory allocation to maximize profit margins'
      ],
      'medium': [
        'Optimize SKU mix to focus on highest-performing products',
        'Implement inventory turnover analysis and improvement plan',
        'Develop pricing strategy to enhance brand profitability',
        'Establish performance monitoring and optimization processes'
      ],
      'low': [
        'Conduct immediate SKU profitability analysis and rationalization',
        'Implement cost reduction initiatives across entire brand portfolio',
        'Review pricing strategy and optimize for margin improvement',
        'Establish performance recovery plan with measurable targets'
      ]
    };

    const performanceLevel = brand.efficiency_score >= 70 ? 'high' : 
                             brand.efficiency_score >= 50 ? 'medium' : 'low';
    
    return fallbackRecs[performanceLevel];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // This part of the code handles brand inventory recommendation requests
  if (req.query.brandRecommendations === 'true') {
    try {
      console.log("📦 Inventory API: Processing brand inventory recommendation request...");
      
      const { brand, contextData } = req.query;
      
      if (!brand || !contextData) {
        return res.status(400).json({
          success: false,
          error: "Brand and context data are required for recommendations",
          timestamp: new Date().toISOString(),
        });
      }

      const parsedBrand = JSON.parse(brand as string);
      const parsedContextData = JSON.parse(contextData as string);

      console.log(`🎯 Generating brand recommendations for: ${parsedBrand.brand_name} - ${parsedBrand.efficiency_score}% efficiency`);
      
      // Generate AI-powered brand inventory recommendations
      const recommendations = await generateBrandInventoryRecommendations(parsedBrand, parsedContextData);
      
      console.log(`✅ Generated ${recommendations.length} brand investment optimization recommendations successfully`);
      
      return res.status(200).json({
        success: true,
        data: {
          recommendations,
          brand: parsedBrand.brand_name,
          generatedAt: new Date().toISOString(),
          context: {
            efficiencyScore: parsedBrand.efficiency_score,
            totalValue: parsedBrand.total_value,
            portfolioPercentage: parsedBrand.portfolio_percentage
          }
        },
        message: "Brand inventory recommendations generated successfully"
      });

    } catch (error) {
      console.error("❌ Inventory API Brand Recommendations Error:", error);
      
      return res.status(500).json({
        success: false,
        error: "Failed to generate brand inventory recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  try {
    console.log("🔒 Phase 2: Building world-class inventory dashboard...");

    // Fetch real data and calculate enhanced analytics
    const [products, shipments] = await Promise.all([
      fetchProducts(),
      fetchShipments()
    ]);
    
    if (products.length === 0) {
      // No data available - return clean empty state
      return res.status(200).json({
        success: true,
        data: {
          kpis: {
            totalActiveSKUs: 0,
            totalInventoryValue: 0,
            lowStockAlerts: 0,
            inactiveSKUs: 0,
            totalSKUs: 0,
            inStockCount: 0,
            unfulfillableCount: 0,
            overstockedCount: 0,
            avgDaysOnHand: null
          },
          insights: [{
            id: "inventory-insight-1",
            title: "Information Not Available",
            description: "Inventory data is not available. Data source connection required.",
            severity: "info" as const,
            dollarImpact: 0,
            suggestedActions: ["Check data source connection"],
            createdAt: new Date().toISOString(),
            source: "inventory_agent" as const,
          }],
          inventory: [],
          brandPerformance: [],
          supplierAnalysis: [],
          lastUpdated: new Date().toISOString(),
        },
        message: "No inventory data available",
        timestamp: new Date().toISOString(),
      });
    }

    // Calculate enhanced analytics
    const kpis = calculateEnhancedKPIs(products);
    const brandPerformance = calculateBrandPerformance(products);
    const supplierAnalysis = calculateSupplierAnalysis(products, shipments);
    const inventory = transformToEnhancedInventoryItems(products, shipments);

    // Generate enhanced insights
    const insights = [];
    
    // Stock health insights
    if (kpis.inactiveSKUs > 0) {
      insights.push({
        id: "inventory-insight-inactive",
        title: "Inactive SKUs Detected",
        description: `${kpis.inactiveSKUs} inactive SKUs found. These products may need review or removal from inventory.`,
        severity: "warning" as const,
        dollarImpact: 0,
        suggestedActions: ["Review inactive product status", "Consider discontinuation", "Update product lifecycle"],
        createdAt: new Date().toISOString(),
        source: "inventory_agent" as const,
      });
    }
    
    // Value concentration insights
    if (brandPerformance.length > 0) {
      const topBrand = brandPerformance[0];
      const brandConcentration = Math.round((topBrand.total_value / kpis.totalInventoryValue) * 100);
      if (brandConcentration > 40) {
        insights.push({
          id: "inventory-insight-brand-concentration",
          title: "Brand Concentration Risk",
          description: `${topBrand.brand_name} represents ${brandConcentration}% of total inventory value. Consider diversification strategies.`,
          severity: "warning" as const,
          dollarImpact: 0,
          suggestedActions: ["Diversify brand portfolio", "Analyze brand performance", "Review procurement strategy"],
          createdAt: new Date().toISOString(),
          source: "inventory_agent" as const,
        });
      }
    }
    
    // Supplier concentration insights
    if (supplierAnalysis.length > 0) {
      const highRiskSuppliers = supplierAnalysis.filter(s => s.concentration_risk > 30);
      if (highRiskSuppliers.length > 0) {
        insights.push({
          id: "inventory-insight-supplier-risk",
          title: "Supplier Concentration Risk",
          description: `${highRiskSuppliers.length} suppliers represent >30% of inventory value each. Supply chain diversification recommended.`,
          severity: "critical" as const,
          dollarImpact: 0,
          suggestedActions: ["Diversify supplier base", "Negotiate backup suppliers", "Assess supply chain risks"],
          createdAt: new Date().toISOString(),
          source: "inventory_agent" as const,
        });
      }
    }
    
    // Low stock alerts
    if (kpis.lowStockAlerts > 0) {
      insights.push({
        id: "inventory-insight-low-stock",
        title: "Low Stock Alerts",
        description: `${kpis.lowStockAlerts} SKUs are running low on inventory. Replenishment may be needed soon.`,
        severity: "warning" as const,
        dollarImpact: 0,
        suggestedActions: ["Review reorder points", "Contact suppliers for replenishment", "Analyze demand patterns"],
        createdAt: new Date().toISOString(),
        source: "inventory_agent" as const,
      });
    }

    // This part of the code calculates warehouse inventory data (moved from Dashboard)
    // Note: Since shipments in inventory API have different structure, we'll calculate from products
    const warehouseInventory = (() => {
      // Group products by supplier to simulate warehouse data
      const supplierMap = new Map();
      products.forEach((p) => {
        if (p.supplier_name && !supplierMap.has(p.supplier_name)) {
          supplierMap.set(p.supplier_name, {
            id: p.supplier_name,
            name: p.supplier_name,
          });
        }
      });
      
      return Array.from(supplierMap.values());
    })().map((warehouse) => {
      // This part of the code calculates warehouse inventory from product data (since shipments have different structure)
      const warehouseProducts = products.filter(p => p.supplier_name === warehouse.id);
      
      const totalInventory = warehouseProducts.reduce((sum, product) => 
        sum + product.unit_quantity, 0
      );
      
      const averageCost = warehouseProducts.length > 0 
        ? warehouseProducts
            .filter(p => p.unit_cost !== null)
            .reduce((sum, product, _, arr) => sum + (product.unit_cost || 0), 0) / 
          warehouseProducts.filter(p => p.unit_cost !== null).length
        : 0;
      
      return {
        warehouseId: warehouse.id,
        totalInventory,
        productCount: warehouseProducts.length,
        averageCost: Math.round(averageCost || 0),
      };
    }).filter(w => w.totalInventory > 0); // Only include warehouses with inventory

    const inventoryData = {
      kpis,
      insights,
      inventory: inventory.slice(0, 500), // Limit for performance
      brandPerformance,
      supplierAnalysis,
      warehouseInventory,
      lastUpdated: new Date().toISOString(),
    };

    console.log("✅ World-class inventory dashboard generated:", {
      totalSKUs: kpis.totalSKUs,
      totalValue: kpis.totalInventoryValue,
      brands: brandPerformance.length,
      suppliers: supplierAnalysis.length,
      insights: insights.length
    });
    
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