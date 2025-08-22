// This part of the code creates a unified AI recommendations endpoint
// Consolidates all AI recommendation generation into one standardized serverless function

import { VercelRequest, VercelResponse } from '@vercel/node';

// This part of the code defines the standardized recommendation request
interface RecommendationRequest {
  type: 'cost-variance' | 'margin-risk' | 'brand-optimization' | 'warehouse-optimization' | 'economic-intelligence' | 'dashboard-insights' | 'inventory-management';
  data: any;
  contextData?: Record<string, any>;
}

// This part of the code provides unified AI recommendations for all use cases
async function generateUnifiedRecommendations(request: RecommendationRequest): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompts = {
    'cost-variance': "You are a world-class supply chain cost optimization expert with 20+ years of experience in 3PL operations. Provide specific, actionable recommendations that drive measurable cost savings. Each recommendation should be a single, clear action (15-20 words max). No explanations or bullet points - just the actionable steps.",
    'margin-risk': "You are a margin protection specialist with deep 3PL expertise. Provide specific actions to mitigate margin risks and improve profitability. Each recommendation should be a single, clear action (15-20 words max). No explanations or bullet points.",
    'brand-optimization': "You are a brand portfolio optimization expert for 3PL operations. Provide specific strategies to optimize brand investments and performance. Each recommendation should be a single, clear action (15-20 words max). No explanations or bullet points.",
    'warehouse-optimization': "You are a warehouse efficiency expert with extensive 3PL experience. Provide specific actions to improve warehouse operations and throughput. Each recommendation should be a single, clear action (15-20 words max). No explanations or bullet points.",
    'economic-intelligence': "You are an economic intelligence specialist for supply chain operations. Provide specific strategies to navigate economic conditions and trends. Each recommendation should be a single, clear action (15-20 words max). No explanations or bullet points.",
    'dashboard-insights': "You are a world-class operations consultant with 20+ years of experience in 3PL and supply chain management. Provide specific, actionable recommendations that drive measurable operational improvements. Each recommendation should be a single, clear action (15-20 words max). No explanations or bullet points.",
    'inventory-management': "You are an inventory optimization expert specializing in 3PL operations. Provide specific strategies to optimize stock levels and inventory efficiency. Each recommendation should be a single, clear action (15-20 words max). No explanations or bullet points."
  };

  const userPrompts = {
    'cost-variance': `Analyze this cost variance anomaly and provide actionable cost reduction strategies:
Type: ${request.data.type}
Current Cost: $${request.data.currentCost?.toLocaleString() || 0}
Expected Cost: $${request.data.expectedCost?.toLocaleString() || 0}
Variance: ${request.data.variance || 0}%
Impact: $${request.data.impact?.toLocaleString() || 0}

Context: ${request.contextData?.totalAnomalies || 0} total anomalies, $${request.contextData?.totalImpact?.toLocaleString() || 0} total impact`,

    'margin-risk': `Analyze this margin risk situation and provide actionable mitigation strategies:
Brand: ${request.data.brand}
Current Margin: ${request.data.currentMargin || 0}%
Risk Score: ${request.data.riskScore || 0}/100
SKU Count: ${request.data.skuCount || 0}
Avg Unit Cost: $${request.data.avgUnitCost || 0}

Risk Drivers: ${request.data.primaryRiskDrivers?.join(', ') || 'Unknown'}`,

    'brand-optimization': `Analyze this brand performance and provide optimization strategies:
Brand: ${request.data.brand_name}
Efficiency Score: ${request.data.efficiency_score || 0}%
Total Value: $${request.data.total_value?.toLocaleString() || 0}
SKU Count: ${request.data.sku_count || 0}
Performance Tier: ${request.data.performance_tier || 'Unknown'}

Portfolio Context: ${request.contextData?.totalBrands || 0} brands, ${request.contextData?.topPerformers || 0} top performers`,

    'warehouse-optimization': `Analyze this warehouse performance and provide optimization strategies:
Warehouse: ${request.data.name || request.data.id}
Performance Score: ${request.data.performance_score || 0}%
Throughput: ${request.data.throughput?.toLocaleString() || 0} units/day
Efficiency: ${request.data.efficiency || 0}%
Capacity Utilization: ${request.data.capacity_utilization || 0}%

Network Context: ${request.contextData?.totalWarehouses || 0} warehouses, ${request.contextData?.avgPerformance || 0}% avg performance`,

    'economic-intelligence': `Analyze this economic KPI and provide strategic positioning recommendations:
KPI: ${request.data.title}
Current Value: ${request.data.value}
Status: ${request.data.status}
Trend: ${request.data.trend || 'Stable'}

Economic Context: ${request.contextData?.shipments || 0} shipments, ${request.contextData?.performance || 0}% performance`,

    'dashboard-insights': `Analyze this operational insight and provide actionable improvement strategies:
Title: ${request.data.title}
Severity: ${request.data.severity}
Description: ${request.data.description}
Impact: $${request.data.dollarImpact?.toLocaleString() || 0}

Operational Context: ${request.contextData?.totalShipments || 0} shipments, ${request.contextData?.totalOrders || 0} orders, ${request.contextData?.atRiskOrders || 0} at-risk orders`,

    'inventory-management': `Analyze this inventory situation and provide optimization strategies:
Brand: ${request.data.brand_name || request.data.name}
Stock Level: ${request.data.quantity || 0} units
Value: $${request.data.total_value?.toLocaleString() || 0}
Turnover: ${request.data.turnover_rate || 0}x
Performance: ${request.data.efficiency_score || 0}%

Inventory Context: ${request.contextData?.totalSKUs || 0} SKUs, ${request.contextData?.portfolioValue?.toLocaleString() || 0} portfolio value`
  };

  try {
    const openaiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
    
    const response = await fetch(openaiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompts[request.type]
          },
          {
            role: "user", 
            content: userPrompts[request.type]
          }
        ],
        max_tokens: 500,
        temperature: 0.2
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

    // This part of the code parses AI response into clean actionable recommendations
    const recommendations = aiResponse
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .map((line: string) => {
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
      .filter((line: string) => line.length > 5 && line.length < 100)  // Reasonable length
      .slice(0, 4);  // Max 4 recommendations

    return recommendations.length > 0 ? recommendations : [
      'Implement data-driven optimization strategies for operational excellence',
      'Establish performance monitoring systems for continuous improvement',
      'Deploy advanced analytics for strategic decision making',
      'Create standardized processes for scalable operations'
    ];

  } catch (error) {
    console.error('AI Recommendations Error:', error);
    
    // This part of the code provides fallback recommendations based on type
    const fallbacks = {
      'cost-variance': [
        'Implement immediate cost containment measures and budget controls',
        'Negotiate supplier contracts for better pricing terms',
        'Optimize resource allocation to reduce operational waste',
        'Deploy cost monitoring systems for early variance detection'
      ],
      'margin-risk': [
        'Implement margin protection strategies and risk monitoring',
        'Optimize pricing models for improved profitability',
        'Diversify supplier base to reduce margin pressure',
        'Deploy dynamic pricing tools for competitive advantage'
      ],
      'brand-optimization': [
        'Focus investment on high-performing brand categories',
        'Optimize portfolio mix for maximum return on investment',
        'Implement brand performance tracking and analytics',
        'Develop strategic partnerships for brand growth'
      ],
      'warehouse-optimization': [
        'Implement workflow optimization for increased throughput',
        'Deploy automation solutions for operational efficiency',
        'Optimize layout design for improved material flow',
        'Establish performance monitoring and KPI tracking'
      ],
      'economic-intelligence': [
        'Monitor economic indicators for strategic planning',
        'Implement scenario planning for market volatility',
        'Develop contingency strategies for economic shifts',
        'Optimize supply chain for economic resilience'
      ],
      'dashboard-insights': [
        'Implement performance monitoring and alert systems',
        'Optimize operational workflows for efficiency gains',
        'Deploy data analytics for decision support',
        'Establish continuous improvement processes'
      ],
      'inventory-management': [
        'Optimize stock levels for improved inventory turnover',
        'Implement demand forecasting for better planning',
        'Deploy inventory optimization algorithms',
        'Establish reorder point optimization strategies'
      ]
    };

    return fallbacks[request.type] || fallbacks['dashboard-insights'];
  }
}

// This part of the code handles the unified AI recommendations endpoint
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, data, contextData } = req.body as RecommendationRequest;

    if (!type || !data) {
      return res.status(400).json({ error: 'Missing required fields: type, data' });
    }

    const recommendations = await generateUnifiedRecommendations({
      type,
      data,
      contextData
    });

    res.status(200).json({
      success: true,
      recommendations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Recommendations Handler Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      recommendations: [
        'Check system configuration and try again',
        'Contact support if the issue persists',
        'Review operational data for accuracy',
        'Implement manual review processes as backup'
      ]
    });
  }
}
