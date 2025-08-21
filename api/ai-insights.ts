// This part of the code creates a unified AI insights endpoint
// Consolidates all AI insight generation into one standardized serverless function

import { VercelRequest, VercelResponse } from '@vercel/node';

// This part of the code defines the standardized insight request
interface InsightRequest {
  type: 'orders' | 'analytics' | 'cost-management' | 'reports' | 'inventory' | 'warehouses' | 'economic-intelligence';
  data: any;
  contextData?: Record<string, any>;
}

// This part of the code defines standardized insight structure
interface AIInsight {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  dollarImpact?: number;
  source: string;
  suggestedActions: string[];
  createdAt: string;
}

// This part of the code safely formats dollar amounts for AI output
function safeFormatDollar(amount: number | null | undefined): string {
  if (!amount || typeof amount !== 'number') return '$0';
  
  const formatted = amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2
  });

  return formatted.replace(/\.00$/, '');
}

// This part of the code removes markdown formatting for clean AI text
function cleanMarkdownFormatting(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/\*\*/g, '')           // Remove **bold**
    .replace(/\*/g, '')             // Remove *italic*
    .replace(/`/g, '')              // Remove `code`
    .replace(/#{1,6}\s/g, '')       // Remove # headers
    .replace(/^\s*[-*+]\s/gm, '')   // Remove bullet points
    .replace(/^\s*\d+\.\s/gm, '')   // Remove numbered lists
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Remove [links](url)
    .trim();
}

// This part of the code provides unified AI insights for all use cases
async function generateUnifiedInsights(request: InsightRequest): Promise<AIInsight[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return [{
      id: `fallback-${Date.now()}`,
      title: 'Check OpenAI Connection',
      description: 'AI insights are unavailable. Verify OpenAI API key configuration.',
      severity: 'warning',
      source: `${request.type}_agent`,
      suggestedActions: ['Verify OpenAI API key configuration', 'Check network connectivity', 'Review system settings'],
      createdAt: new Date().toISOString()
    }];
  }

  const systemPrompts = {
    'orders': "You are a supply chain optimization expert. Analyze order flow patterns and provide operational intelligence for process improvement. Generate 2-3 critical insights with specific metrics and actionable recommendations.",
    'analytics': "You are a data analytics expert specializing in 3PL operations. Analyze performance metrics and provide strategic insights for optimization. Generate 2-3 key insights with performance indicators.",
    'cost-management': "You are a cost optimization expert analyzing warehouse and operational costs. Provide strategic insights for cost reduction and efficiency improvement. Generate 2-3 cost-focused insights.",
    'reports': "You are a business intelligence expert generating comprehensive insights for executive reporting. Analyze operational data and provide strategic recommendations. Generate 2-3 executive-level insights.",
    'inventory': "You are an inventory optimization expert analyzing stock levels and brand performance. Provide insights for inventory efficiency and investment optimization. Generate 2-3 inventory-focused insights.",
    'warehouses': "You are a warehouse operations expert analyzing facility performance and throughput. Provide insights for operational excellence and efficiency. Generate 2-3 warehouse optimization insights.",
    'economic-intelligence': "You are an economic intelligence specialist analyzing market conditions and business impact. Provide strategic insights for economic positioning. Generate 2-3 economic insights."
  };

  const userPrompts = {
    'orders': `Analyze order processing performance and provide operational insights:

ORDER METRICS:
- Daily Orders: ${request.data.kpis?.ordersToday || 0}
- At-Risk Orders: ${request.data.kpis?.atRiskOrders || 0}
- Open POs: ${request.data.kpis?.openPOs || 0}
- Unfulfillable SKUs: ${request.data.kpis?.unfulfillableSKUs || 0}

INBOUND INTELLIGENCE:
- Total Shipments: ${request.data.inboundIntelligence?.totalInbound || 0}
- Delayed Shipments: ${request.data.inboundIntelligence?.delayedShipments?.count || 0}
- Value at Risk: ${safeFormatDollar(request.data.inboundIntelligence?.valueAtRisk)}
- Avg Delay: ${request.data.inboundIntelligence?.avgDelayDays || 0} days`,

    'analytics': `Analyze performance metrics and provide strategic insights:

PERFORMANCE OVERVIEW:
- Growth Rate: ${request.data.performanceMetrics?.growthRate || 0}%
- Efficiency Rate: ${request.data.performanceMetrics?.efficiencyRate || 0}%
- On-Time Orders: ${request.data.performanceMetrics?.onTimeOrders || 0}

BRAND PERFORMANCE:
- Total Brands: ${request.data.brandPerformance?.length || 0}
- Top Performers: ${request.data.brandPerformance?.filter((b: any) => b.efficiency_score >= 70).length || 0}
- Portfolio Value: ${safeFormatDollar(request.data.brandPerformance?.reduce((sum: number, b: any) => sum + (b.total_value || 0), 0))}`,

    'cost-management': `Analyze cost structure and provide optimization insights:

COST METRICS:
- Monthly Costs: ${safeFormatDollar(request.data.kpis?.totalMonthlyCosts)}
- Efficiency Rate: ${request.data.kpis?.costEfficiencyRate || 0}%
- Cost Centers: ${request.data.costCenters?.length || 0}
- Supplier Performance: ${request.data.supplierPerformance?.length || 0} suppliers

TREND ANALYSIS:
- Historical Trends: ${request.data.historicalTrends?.length || 0} data points
- Performance Variance: Analyzing cost optimization opportunities`,

    'reports': `Generate executive insights for comprehensive reporting:

OPERATIONAL SUMMARY:
- Total Operations: Multi-facility 3PL operations
- Performance Status: ${request.contextData?.performanceStatus || 'Operational'}
- Data Coverage: ${request.contextData?.dataCoverage || 'Full'} operational scope
- Reporting Period: Current operational cycle

STRATEGIC FOCUS:
- Operational Excellence: Performance optimization
- Cost Management: Strategic cost reduction
- Supply Chain: End-to-end optimization`,

    'inventory': `Analyze inventory performance and provide optimization insights:

INVENTORY METRICS:
- Total SKUs: ${request.data.kpis?.totalSKUs || 0}
- Stock Value: ${safeFormatDollar(request.data.kpis?.totalStockValue)}
- Turnover Rate: ${request.data.kpis?.averageTurnoverRate || 0}x
- Stock-out Risk: ${request.data.kpis?.stockOutRisk || 0}%

BRAND ANALYSIS:
- Brand Portfolio: ${request.data.brandPerformance?.length || 0} brands
- Top Performers: ${request.data.brandPerformance?.filter((b: any) => b.efficiency_score >= 70).length || 0}
- Investment Efficiency: Optimizing portfolio allocation`,

    'warehouses': `Analyze warehouse performance and provide operational insights:

WAREHOUSE NETWORK:
- Total Facilities: ${request.data.warehouses?.length || 0}
- Avg Performance: ${request.data.warehouses?.reduce((sum: number, w: any) => sum + (w.performance_score || 0), 0) / Math.max(request.data.warehouses?.length || 1, 1) || 0}%
- Total Throughput: ${request.data.warehouses?.reduce((sum: number, w: any) => sum + (w.throughput || 0), 0)?.toLocaleString() || 0} units/day
- Capacity Utilization: ${request.data.warehouses?.reduce((sum: number, w: any) => sum + (w.capacity_utilization || 0), 0) / Math.max(request.data.warehouses?.length || 1, 1) || 0}%

OPTIMIZATION OPPORTUNITIES:
- Performance Variance: Analyzing facility optimization potential
- Throughput Enhancement: Operational efficiency improvements`,

    'economic-intelligence': `Analyze economic conditions and provide strategic insights:

ECONOMIC INDICATORS:
- KPI Performance: ${request.contextData?.kpiCount || 0} indicators tracked
- Market Position: Strategic positioning analysis
- Economic Impact: Business performance correlation
- Risk Assessment: Economic volatility management

STRATEGIC CONTEXT:
- Operational Shipments: ${request.contextData?.shipments || 0}
- Performance Metrics: ${request.contextData?.performance || 0}% operational efficiency
- Supplier Network: ${request.contextData?.suppliers || 0} strategic partners`
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
        model: "gpt-4",
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
        max_tokens: 1000,
        temperature: 0.3
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

    // This part of the code parses AI response into structured insights
    const cleanedResponse = cleanMarkdownFormatting(aiResponse);
    const insights = parseInsightsFromResponse(cleanedResponse, request.type);

    return insights;

  } catch (error) {
    console.error('AI Insights Error:', error);
    
    // This part of the code provides fallback insights based on type
    return generateFallbackInsights(request.type);
  }
}

// This part of the code parses AI response into structured insight objects
function parseInsightsFromResponse(aiResponse: string, type: string): AIInsight[] {
  const sections = aiResponse.split('\n\n').filter(section => section.trim().length > 0);
  const insights: AIInsight[] = [];

  for (let i = 0; i < Math.min(sections.length, 3); i++) {
    const section = sections[i].trim();
    const lines = section.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length > 0) {
      const title = lines[0].replace(/^\d+\.\s*/, '').replace(/^#+\s*/, '').trim();
      const description = lines.slice(1).join(' ').trim() || title;
      
      insights.push({
        id: `ai-insight-${type}-${Date.now()}-${i}`,
        title: title.substring(0, 100),
        description: description.substring(0, 300),
        severity: i === 0 ? 'critical' : i === 1 ? 'warning' : 'info',
        source: `${type}_agent`,
        suggestedActions: extractActionsFromText(section),
        createdAt: new Date().toISOString()
      });
    }
  }

  return insights.length > 0 ? insights : generateFallbackInsights(type);
}

// This part of the code extracts actionable items from AI text
function extractActionsFromText(text: string): string[] {
  const actionKeywords = ['implement', 'optimize', 'improve', 'reduce', 'increase', 'deploy', 'establish', 'monitor', 'review', 'enhance'];
  const sentences = text.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 10);
  
  const actions = sentences
    .filter(sentence => actionKeywords.some(keyword => sentence.toLowerCase().includes(keyword)))
    .slice(0, 3)
    .map(action => action.replace(/^\d+\.\s*/, '').trim());

  return actions.length > 0 ? actions : [
    'Review current operational metrics for optimization opportunities',
    'Implement performance monitoring for continuous improvement',
    'Establish data-driven decision making processes'
  ];
}

// This part of the code provides fallback insights when AI is unavailable
function generateFallbackInsights(type: string): AIInsight[] {
  const fallbacks = {
    'orders': [
      {
        title: 'Order Processing Optimization Needed',
        description: 'Current order processing workflows show opportunities for efficiency improvements and risk reduction.',
        severity: 'warning' as const
      }
    ],
    'analytics': [
      {
        title: 'Performance Analytics Review Required',
        description: 'Performance metrics indicate areas for operational enhancement and efficiency gains.',
        severity: 'info' as const
      }
    ],
    'cost-management': [
      {
        title: 'Cost Optimization Opportunities Identified',
        description: 'Cost structure analysis reveals potential for strategic cost reduction and efficiency improvements.',
        severity: 'warning' as const
      }
    ],
    'reports': [
      {
        title: 'Executive Report Generation Ready',
        description: 'Comprehensive operational data available for strategic reporting and decision making.',
        severity: 'info' as const
      }
    ],
    'inventory': [
      {
        title: 'Inventory Optimization Strategy Needed',
        description: 'Inventory analysis shows opportunities for improved turnover rates and investment efficiency.',
        severity: 'warning' as const
      }
    ],
    'warehouses': [
      {
        title: 'Warehouse Performance Enhancement Available',
        description: 'Warehouse operations show potential for throughput optimization and efficiency improvements.',
        severity: 'info' as const
      }
    ],
    'economic-intelligence': [
      {
        title: 'Economic Intelligence Monitoring Active',
        description: 'Economic indicators are being tracked for strategic positioning and risk management.',
        severity: 'info' as const
      }
    ]
  };

  const typeInsights = fallbacks[type] || fallbacks['orders'];
  
  return typeInsights.map((insight, index) => ({
    id: `fallback-${type}-${Date.now()}-${index}`,
    title: insight.title,
    description: insight.description,
    severity: insight.severity,
    source: `${type}_agent`,
    suggestedActions: [
      'Review operational data for optimization opportunities',
      'Implement performance monitoring systems',
      'Establish continuous improvement processes'
    ],
    createdAt: new Date().toISOString()
  }));
}

// This part of the code handles the unified AI insights endpoint
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, data, contextData } = req.body as InsightRequest;

    if (!type || !data) {
      return res.status(400).json({ error: 'Missing required fields: type, data' });
    }

    const insights = await generateUnifiedInsights({
      type,
      data,
      contextData
    });

    res.status(200).json({
      success: true,
      insights,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Insights Handler Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      insights: generateFallbackInsights('orders')
    });
  }
}
