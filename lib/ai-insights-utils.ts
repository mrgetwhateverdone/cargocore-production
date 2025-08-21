/**
 * CENTRALIZED AI INSIGHTS UTILITIES
 * 
 * This part of the code creates shared utilities for generating real AI insights
 * without creating additional serverless functions (stays within 12 function limit)
 */

// Type definitions for different insight contexts
export type InsightContext = 'dashboard' | 'orders' | 'analytics' | 'warehouses' | 'cost' | 'inventory';

interface AIInsightRequest {
  context: InsightContext;
  data: any;
  kpis: any;
  contextData?: any;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  dollarImpact: number;
  suggestedActions: string[];
  createdAt: string;
  source: string;
}

/**
 * This part of the code cleans markdown formatting from AI responses
 */
export function cleanMarkdownFormatting(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * This part of the code fixes dollar impact formatting in AI responses
 */
export function fixDollarImpactFormatting(text: string): string {
  return text
    .replace(/\$([0-9,]+)\.00impact/g, '$$1 impact')
    .replace(/\$([0-9,]+\.[0-9]{1,2})impact/g, '$$1 impact')
    .replace(/\$([0-9,]+)\.00\s+impact/g, '$$1 impact');
}

/**
 * This part of the code creates context-specific AI prompts for maximum 3PL value
 */
export function createContextPrompt(context: InsightContext, data: any, kpis: any, contextData?: any): string {
  const baseContext = `
You are an expert 3PL operations analyst providing strategic insights for operational excellence.
Analyze the provided data and generate actionable insights that drive real business value.

CRITICAL REQUIREMENTS:
- Focus on operational efficiency, cost optimization, and service excellence
- Provide specific, measurable recommendations with dollar impact calculations
- Base insights on actual data patterns and trends
- Include implementation timelines (30/60/90 days)
- Suggest specific KPIs to track progress

DATA CONTEXT:
${JSON.stringify({ kpis, dataPoints: Object.keys(data).length, additionalContext: contextData }, null, 2)}
`;

  const contextSpecificPrompts = {
    dashboard: `
DASHBOARD OPERATIONAL INTELLIGENCE:
Focus on overall operational health and critical issues requiring immediate attention.

Key Analysis Areas:
- Shipment performance and SLA compliance
- Cost efficiency and margin optimization  
- Risk identification and mitigation strategies
- Resource utilization and capacity planning

Generate 2-3 strategic insights that address the most critical operational challenges.
Priority: Issues with >$50K annual impact or >20% efficiency improvement potential.`,

    orders: `
ORDER FULFILLMENT OPTIMIZATION:
Focus on order processing efficiency, delivery performance, and customer satisfaction.

Key Analysis Areas:
- Order cycle time optimization
- SLA breach prevention strategies
- Supplier performance management
- Inventory availability optimization

Generate 2-3 insights focused on improving order fulfillment metrics and reducing delays.
Priority: Actions that improve on-time delivery and reduce operational costs.`,

    analytics: `
PERFORMANCE ANALYTICS & TRENDS:
Focus on data-driven insights for strategic decision making and trend analysis.

Key Analysis Areas:
- Performance trend analysis and forecasting
- Benchmarking against industry standards
- Brand/product portfolio optimization
- Operational efficiency metrics

Generate 2-3 analytical insights that reveal hidden patterns and optimization opportunities.
Priority: Data-driven recommendations for strategic operational improvements.`,

    warehouses: `
WAREHOUSE OPERATIONS EXCELLENCE:
Focus on warehouse efficiency, capacity optimization, and performance management.

Key Analysis Areas:
- Warehouse utilization and productivity
- SLA performance and improvement opportunities
- Resource allocation and staffing optimization
- Technology integration and automation potential

Generate 2-3 insights focused on warehouse operational excellence and efficiency gains.
Priority: Improvements that boost throughput while maintaining service quality.`,

    cost: `
COST MANAGEMENT & OPTIMIZATION:
Focus on cost reduction opportunities, budget optimization, and financial efficiency.

Key Analysis Areas:
- Operational cost analysis and reduction opportunities
- Facility utilization and consolidation potential
- Supplier cost optimization and negotiation leverage
- Process efficiency and waste elimination

Generate 2-3 insights focused on significant cost reduction and efficiency improvements.
Priority: Cost optimization strategies with measurable ROI and implementation feasibility.`,

    inventory: `
INVENTORY OPTIMIZATION & MANAGEMENT:
Focus on inventory efficiency, turnover optimization, and working capital management.

Key Analysis Areas:
- Inventory turnover and obsolescence management
- Demand forecasting and planning accuracy
- SKU performance and portfolio optimization
- Supplier relationship and procurement efficiency

Generate 2-3 insights focused on inventory optimization and working capital efficiency.
Priority: Strategies that reduce carrying costs while maintaining service levels.`
  };

  return `${baseContext}\n\n${contextSpecificPrompts[context]}\n\n
FORMAT AS VALID JSON ARRAY:
[
  {
    "type": "warning",
    "title": "Specific Strategic Issue Title",
    "description": "Detailed analysis with specific data points, financial impact calculation, and implementation timeline",
    "severity": "critical|warning|info",
    "dollarImpact": calculated_dollar_amount_based_on_data,
    "suggestedActions": [
      "Specific actionable step with timeline",
      "Measurable outcome with KPI target",
      "Implementation milestone with responsibility"
    ]
  }
]

CRITICAL SUCCESS FACTORS:
- Base insights on actual data provided
- Calculate realistic dollar impacts from operational improvements
- Provide specific, actionable recommendations
- Include measurable success metrics and timelines
- Focus on high-impact, feasible implementations`;
}

/**
 * This part of the code generates real AI insights using OpenAI
 * Returns null if AI fails - NO FALLBACK DATA
 */
export async function generateRealAIInsights(
  request: AIInsightRequest
): Promise<AIInsight[] | null> {
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  // Return null if no API key - NO FALLBACK
  if (!apiKey) {
    console.error('❌ OpenAI API key not available - no insights generated');
    return null;
  }

  try {
    console.log(`🤖 Generating AI insights for context: ${request.context}`);
    
    const prompt = createContextPrompt(request.context, request.data, request.kpis, request.contextData);
    
    const openaiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
    
    const response = await fetch(openaiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a world-class 3PL operations expert. Generate strategic insights that drive real operational excellence and business value. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      console.error(`❌ OpenAI API error: ${response.status}`);
      return null; // NO FALLBACK
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('❌ No content in OpenAI response');
      return null; // NO FALLBACK
    }

    // Parse and clean the AI response
    const parsed = JSON.parse(content);
    
    if (!Array.isArray(parsed)) {
      console.error('❌ AI response is not an array');
      return null; // NO FALLBACK
    }

    // Process and clean the insights
    const insights: AIInsight[] = parsed.map((insight: any, index: number) => ({
      id: `${request.context}-ai-${Date.now()}-${index}`,
      title: fixDollarImpactFormatting(cleanMarkdownFormatting(insight.title || 'AI Analysis')),
      description: fixDollarImpactFormatting(cleanMarkdownFormatting(insight.description || '')),
      severity: insight.severity || 'info',
      dollarImpact: typeof insight.dollarImpact === 'number' ? insight.dollarImpact : 0,
      suggestedActions: (insight.suggestedActions || []).map((action: string) => 
        fixDollarImpactFormatting(cleanMarkdownFormatting(action))
      ),
      createdAt: new Date().toISOString(),
      source: `${request.context}_agent`
    }));

    console.log(`✅ Generated ${insights.length} real AI insights for ${request.context}`);
    return insights;

  } catch (error) {
    console.error(`❌ AI insight generation failed for ${request.context}:`, error);
    return null; // NO FALLBACK - let frontend handle gracefully
  }
}
