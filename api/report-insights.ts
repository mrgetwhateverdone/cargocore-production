import { VercelRequest, VercelResponse } from '@vercel/node';

interface ProductData {
  product_id: string;
  product_name: string;
  product_sku: string | null;
  brand_name: string;
  unit_cost: number | null;
  active: boolean;
  created_date: string;
}

interface ShipmentData {
  shipment_id: string;
  status: string;
  warehouse_id: string | null;
  supplier: string | null;
  expected_quantity: number;
  received_quantity: number;
  created_date: string;
  brand_name: string;
}

interface ReportInsightRequest {
  template: {
    id: string;
    name: string;
  };
  data: {
    products: ProductData[];
    shipments: ShipmentData[];
  };
  filters: {
    brands?: string[];
    warehouses?: string[];
    metrics?: string[];
  };
}

interface ReportInsight {
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

/**
 * This part of the code generates AI-powered insights for reports using OpenAI
 */
async function generateAIReportInsights(
  template: any,
  data: any,
  filters: any
): Promise<ReportInsight[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  console.log('🔑 Checking OpenAI API key...', {
    hasKey: !!apiKey,
    keyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none',
    template: template.name
  });
  
  if (!apiKey) {
    console.error('❌ OpenAI API key not found in environment variables');
    throw new Error("OpenAI API key not configured");
  }

  // This part of the code prepares the operational context for AI analysis
  const operationalContext = createOperationalContext(data, template, filters);
  
  // This part of the code creates template-specific prompts for world-class insights
  const prompt = createTemplateSpecificPrompt(template, data, filters);

  const messages = [
    {
      role: "system" as const,
      content: `You are CargoCore AI, an expert 3PL operations analyst specializing in data-driven insights for logistics operations.

YOUR EXPERTISE:
- Supply chain optimization and performance analysis
- Inventory management and SKU rationalization
- SLA compliance and customer satisfaction metrics
- Labor forecasting and workforce optimization
- Financial impact analysis with specific dollar amounts

RESPONSE FORMAT:
You must provide exactly 3 insights in this JSON format:
[
  {
    "title": "Specific, actionable insight title",
    "content": "Detailed analysis with specific numbers, percentages, and actionable recommendations. Include financial impact when possible.",
    "priority": "high|medium|low",
    "category": "operational|financial|strategic"
  }
]

ANALYSIS REQUIREMENTS:
- Use REAL data from the operational context
- Provide specific numbers, percentages, and metrics
- Include actionable recommendations with timelines
- Estimate financial impact when relevant
- Be direct and professional, avoid generic advice
- Focus on optimization opportunities and risk mitigation

OPERATIONAL CONTEXT:
${operationalContext}`
    },
    {
      role: "user" as const,
      content: prompt
    }
  ];

  try {
    const openaiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
    
    console.log('🚀 Making OpenAI API call...', {
      url: openaiUrl,
      model: 'gpt-4',
      messageCount: messages.length,
      operationalContextLength: operationalContext.length
    });
    
    const requestBody = {
      model: "gpt-4",
      messages,
      max_tokens: 1000,
      temperature: 0.3,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    };
    
    console.log('📦 Request body prepared:', {
      model: requestBody.model,
      messagesLength: requestBody.messages.length,
      maxTokens: requestBody.max_tokens
    });
    
    const response = await fetch(openaiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📊 OpenAI Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    console.log('✅ OpenAI Response received:', {
      hasChoices: !!aiResponse.choices,
      choicesLength: aiResponse.choices?.length || 0,
      hasContent: !!aiResponse.choices?.[0]?.message?.content
    });
    
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('❌ No content in OpenAI response:', aiResponse);
      throw new Error("No response from OpenAI");
    }

    console.log('📝 Raw AI content received:', content);

    // This part of the code parses the AI response and ensures valid JSON
    try {
      const insights = JSON.parse(content);
      console.log('✅ Successfully parsed AI insights:', {
        isArray: Array.isArray(insights),
        length: insights?.length || 0,
        insights
      });
      
      if (Array.isArray(insights) && insights.length > 0) {
        return insights.slice(0, 3); // Ensure max 3 insights
      }
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON:', parseError);
      console.log('📝 Attempting fallback parsing for content:', content);
    }
    
    // Fallback: Convert text response to structured insights
    return parseTextResponseToInsights(content, template);
    
  } catch (error) {
    console.error('❌ AI insight generation failed:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      template: template.name,
      dataSize: {
        products: data.products?.length || 0,
        shipments: data.shipments?.length || 0
      }
    });
    throw new Error(`Failed to generate AI insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * This part of the code creates operational context for AI analysis
 */
function createOperationalContext(data: any, template: any, filters: any): string {
  const products = data.products || [];
  const shipments = data.shipments || [];
  
  // Calculate key metrics
  const activeProducts = products.filter((p: any) => p.active);
  const completedShipments = shipments.filter((s: any) => s.status === 'completed');
  const cancelledShipments = shipments.filter((s: any) => s.status === 'cancelled');
  const successRate = shipments.length > 0 ? (completedShipments.length / shipments.length) * 100 : 0;
  
  // Get unique brands and warehouses
  const uniqueBrands = [...new Set(products.map((p: any) => p.brand_name).filter(Boolean))];
  const uniqueWarehouses = [...new Set(shipments.map((s: any) => s.warehouse_id).filter(Boolean))];
  
  // Calculate average unit cost
  const costsWithValues = products.filter((p: any) => p.unit_cost && p.unit_cost > 0);
  const avgUnitCost = costsWithValues.length > 0 
    ? costsWithValues.reduce((sum: number, p: any) => sum + p.unit_cost, 0) / costsWithValues.length 
    : 0;
  
  let context = `OPERATIONAL METRICS:
- Total Products: ${products.length} (${activeProducts.length} active, ${products.length - activeProducts.length} inactive)
- Total Shipments: ${shipments.length} (${completedShipments.length} completed, ${cancelledShipments.length} cancelled)
- Success Rate: ${successRate.toFixed(1)}%
- Brand Portfolio: ${uniqueBrands.length} brands
- Warehouse Network: ${uniqueWarehouses.length} locations
- Average Unit Cost: $${avgUnitCost.toFixed(2)}

PERFORMANCE INDICATORS:
- Inventory Health: ${((activeProducts.length / products.length) * 100).toFixed(1)}% active SKUs
- Cancellation Rate: ${shipments.length > 0 ? ((cancelledShipments.length / shipments.length) * 100).toFixed(1) : 0}%
- Portfolio Complexity: ${products.length / uniqueBrands.length > 0 ? (products.length / uniqueBrands.length).toFixed(1) : 0} SKUs per brand`;

  // Add filter context if filters are applied
  if (filters.brands && filters.brands.length > 0) {
    context += `\n- FILTERED BY BRANDS: ${filters.brands.join(', ')}`;
  }
  if (filters.warehouses && filters.warehouses.length > 0) {
    context += `\n- FILTERED BY WAREHOUSES: ${filters.warehouses.join(', ')}`;
  }

  return context;
}

/**
 * This part of the code creates template-specific prompts for AI analysis
 */
function createTemplateSpecificPrompt(template: any, data: any, filters: any): string {
  const basePrompt = `Analyze the operational data and provide 3 specific, actionable insights for this ${template.name} report.`;
  
  switch (template.id) {
    case 'weekly-performance':
      return `${basePrompt}

Focus on:
1. Operational efficiency analysis with specific performance metrics
2. Throughput optimization opportunities with financial impact
3. Strategic recommendations for scaling current operations

Analyze success rates, volume trends, and identify bottlenecks or excellence areas.`;

    case 'inventory-health':
      return `${basePrompt}

Focus on:
1. SKU performance analysis and inventory optimization opportunities
2. Portfolio rationalization with cost savings potential
3. Inventory turnover and dead stock management strategies

Evaluate active vs inactive SKUs, brand performance, and inventory efficiency.`;

    case 'sla-compliance':
      return `${basePrompt}

Focus on:
1. SLA performance evaluation with customer satisfaction impact
2. Service quality analysis and improvement opportunities
3. Operational excellence recommendations for customer retention

Analyze completion rates, cancellation patterns, and service consistency.`;

    case 'labor-forecast':
      return `${basePrompt}

Focus on:
1. Workforce capacity analysis with staffing recommendations
2. Operational complexity assessment and training needs
3. Labor optimization strategies with cost implications

Evaluate current workload, staffing efficiency, and scalability requirements.`;

    default:
      return `${basePrompt}

Focus on:
1. Overall operational performance with key improvement areas
2. Cost optimization opportunities with financial impact
3. Strategic growth recommendations based on current metrics

Provide comprehensive analysis of the business operations and optimization potential.`;
  }
}

/**
 * This part of the code parses text responses into structured insights
 */
function parseTextResponseToInsights(content: string, template: any): ReportInsight[] {
  // Simple fallback parsing if JSON parsing fails
  const sections = content.split('\n\n').filter(section => section.trim().length > 0);
  
  return sections.slice(0, 3).map((section, index) => ({
    title: `${template.name} Insight ${index + 1}`,
    content: section.trim(),
    priority: index === 0 ? 'high' as const : 'medium' as const,
    category: 'operational' as const
  }));
}

/**
 * This part of the code handles the main API endpoint for report insights generation
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    console.log("🤖 Report Insights API: Processing insight generation request...");
    
    const { template, data, filters }: ReportInsightRequest = req.body;
    
    if (!template || !data) {
      return res.status(400).json({
        success: false,
        error: "Template and data are required",
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`🎯 Generating insights for template: ${template.name}`);
    console.log(`📊 Data: ${data.products?.length || 0} products, ${data.shipments?.length || 0} shipments`);
    
    // Generate AI-powered insights
    const insights = await generateAIReportInsights(template, data, filters);
    
    console.log(`✅ Generated ${insights.length} AI insights successfully`);
    
    res.status(200).json({
      success: true,
      data: {
        insights,
        template: template.name,
        generatedAt: new Date().toISOString(),
        dataPoints: {
          products: data.products?.length || 0,
          shipments: data.shipments?.length || 0
        }
      },
      message: "Report insights generated successfully"
    });

  } catch (error) {
    console.error("❌ Report Insights API Error:", error);
    
    res.status(500).json({
      success: false,
      error: "Failed to generate report insights",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}
