/**
 * Vercel Serverless Function: AI Order Suggestion Generation
 * 
 * Endpoint: /api/order-suggestion
 * Method: POST
 * 
 * This function generates AI-powered suggestions for specific orders
 * by analyzing order data and providing actionable insights.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Type definitions
interface OrderData {
  order_id: string;
  created_date: string;
  brand_name: string;
  status: string;
  sla_status: string;
  expected_date: string | null;
  arrival_date: string;
  supplier: string | null;
  warehouse_id: string | null;
  product_sku: string | null;
  expected_quantity: number;
  received_quantity: number;
  unit_cost: number | null;
  ship_from_country: string | null;
  notes: string;
}

interface OrderSuggestion {
  orderId: string;
  suggestion: string;
  priority: "low" | "medium" | "high";
  actionable: boolean;
  estimatedImpact?: string;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

/**
 * Main serverless function handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    const response: APIResponse<never> = {
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests',
      timestamp: new Date().toISOString(),
    };
    res.status(405).json(response);
    return;
  }

  try {
    console.log('🔒 Server: Processing AI order suggestion request...');

    // Extract order data from request body
    const { orderData } = req.body;
    
    if (!orderData) {
      const response: APIResponse<never> = {
        success: false,
        error: 'Missing order data',
        message: 'Order data is required for generating suggestions',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    // Validate environment variables
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.error('❌ Missing OpenAI API key');
      const response: APIResponse<never> = {
        success: false,
        error: 'AI service configuration error',
        message: 'AI suggestion service is temporarily unavailable',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
      return;
    }

    // Generate AI suggestion
    const suggestion = await generateAIOrderSuggestion(orderData, openaiApiKey);

    const response: APIResponse<OrderSuggestion> = {
      success: true,
      data: suggestion,
      timestamp: new Date().toISOString(),
    };

    console.log('✅ Server: AI order suggestion generated successfully');
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Server: Order suggestion error:', error);
    
    const response: APIResponse<never> = {
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate AI order suggestion',
      timestamp: new Date().toISOString(),
    };
    
    res.status(500).json(response);
  }
}

/**
 * Generate AI suggestion for a specific order using OpenAI
 */
async function generateAIOrderSuggestion(
  orderData: OrderData,
  openaiApiKey: string
): Promise<OrderSuggestion> {
  // Analyze order data to determine context and priority
  const context = analyzeOrderContext(orderData);
  
  // Create prompt for OpenAI
  const prompt = createOrderAnalysisPrompt(orderData, context);

  try {
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert 3PL operations analyst. Provide concise, actionable insights for order management. Focus on practical recommendations for logistics professionals.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiSuggestion = data.choices[0]?.message?.content || 'Unable to generate specific recommendation.';

    // Create structured suggestion response
    const suggestion: OrderSuggestion = {
      orderId: orderData.order_id,
      suggestion: aiSuggestion.trim(),
      priority: context.priority,
      actionable: true,
      estimatedImpact: context.estimatedImpact,
    };

    return suggestion;

  } catch (error) {
    console.error('❌ OpenAI API call failed:', error);
    
    // Fallback to rule-based suggestion
    return generateFallbackSuggestion(orderData, context);
  }
}

/**
 * Analyze order context to determine priority and focus areas
 */
function analyzeOrderContext(orderData: OrderData): {
  priority: "low" | "medium" | "high";
  focusAreas: string[];
  estimatedImpact: string;
  issues: string[];
} {
  const issues: string[] = [];
  const focusAreas: string[] = [];
  let priority: "low" | "medium" | "high" = "low";

  // Check for delayed orders
  if (orderData.status.toLowerCase().includes('delayed') || 
      orderData.sla_status.toLowerCase().includes('breach')) {
    issues.push('SLA breach');
    focusAreas.push('delivery optimization');
    priority = 'high';
  }

  // Check for quantity discrepancies
  if (orderData.received_quantity < orderData.expected_quantity) {
    issues.push('quantity shortfall');
    focusAreas.push('inventory management');
    if (priority !== 'high') priority = 'medium';
  }

  // Check for pending/processing orders
  if (orderData.status.toLowerCase().includes('pending') || 
      orderData.status.toLowerCase().includes('processing')) {
    focusAreas.push('processing optimization');
    if (priority === 'low') priority = 'medium';
  }

  // Check for at-risk SLA
  if (orderData.sla_status.toLowerCase().includes('at_risk')) {
    issues.push('SLA risk');
    focusAreas.push('proactive management');
    if (priority === 'low') priority = 'medium';
  }

  // Determine estimated impact
  let estimatedImpact = 'Low impact';
  if (priority === 'medium') estimatedImpact = 'Medium cost/service impact';
  if (priority === 'high') estimatedImpact = 'High cost/service impact';

  return {
    priority,
    focusAreas,
    estimatedImpact,
    issues,
  };
}

/**
 * Create detailed prompt for OpenAI analysis
 */
function createOrderAnalysisPrompt(orderData: OrderData, context: any): string {
  // Calculate enhanced order intelligence metrics
  const orderValue = (orderData.received_quantity || 0) * (orderData.unit_cost || 0);
  const quantityVariance = orderData.expected_quantity - orderData.received_quantity;
  const variancePercent = orderData.expected_quantity > 0 ? 
    Math.abs(quantityVariance) / orderData.expected_quantity * 100 : 0;
  
  // Determine order complexity and risk factors
  const complexityFactors = [];
  if (quantityVariance !== 0) complexityFactors.push('quantity variance');
  if (orderData.sla_status.toLowerCase().includes('risk')) complexityFactors.push('SLA risk');
  if (orderData.status.toLowerCase().includes('delayed')) complexityFactors.push('delivery delay');
  if (!orderData.supplier) complexityFactors.push('supplier uncertainty');
  
  const complexityScore = Math.min(10, complexityFactors.length * 2.5 + (variancePercent / 10));
  
  return `You are a precision operations analyst specializing in individual order optimization within portfolio context. Provide tactical recommendations that optimize both individual order and system performance.

CONTEXTUAL ORDER INTELLIGENCE:
=============================

ORDER PROFILE ANALYSIS:
- Order ID: ${orderData.order_id}
- Brand Tier: ${orderData.brand_name} (customer value segment)
- Order Complexity Score: ${complexityScore.toFixed(1)}/10
- Financial Value: $${orderValue.toFixed(2)}
- Status Profile: ${orderData.status} (SLA: ${orderData.sla_status})

PORTFOLIO IMPACT ANALYSIS:
- Quantity Performance: ${orderData.received_quantity}/${orderData.expected_quantity} (${variancePercent.toFixed(1)}% variance)
- Supplier Performance: ${orderData.supplier || 'Unknown supplier'} from ${orderData.ship_from_country || 'Unknown origin'}
- Expected Delivery: ${orderData.expected_date || 'No target date'}
- Risk Factors: ${complexityFactors.join(', ') || 'Standard processing'}

PREDICTIVE ORDER INTELLIGENCE:
- Success Probability: ${Math.max(10, 100 - (complexityScore * 8)).toFixed(1)}% based on ${complexityFactors.length + 2} factors
- Financial Impact: ${quantityVariance !== 0 ? `$${Math.abs(quantityVariance * (orderData.unit_cost || 50)).toFixed(2)} variance` : 'On target'}
- Processing Priority: ${context.priority} (${context.estimatedImpact})
- Risk Assessment: ${context.issues.join(', ') || 'Low risk profile'}

OPTIMIZATION VECTORS:
- Immediate Focus Areas: ${context.focusAreas.join(', ') || 'Standard workflow'}
- Resource Allocation: ${complexityScore > 5 ? 'High-touch processing required' : 'Standard processing flow'}
- Timeline Optimization: ${orderData.expected_date ? 'Target date established' : 'Expedite date setting'}
- Quality Assurance: ${variancePercent > 10 ? 'Enhanced QA protocols needed' : 'Standard QA sufficient'}

PROVIDE PRECISION GUIDANCE:
1. IMMEDIATE ACTIONS: What specific steps will optimize this order's success probability?
2. RESOURCE OPTIMIZATION: How should resources be allocated for maximum efficiency?
3. PORTFOLIO EFFECTS: How does optimizing this order impact other operations?
4. LEARNING INSIGHTS: What patterns can be applied to similar future orders?

Provide tactical decisions with confidence scores and specific implementation steps. Focus on actionable logistics management decisions.`;
}

/**
 * Generate fallback suggestion when AI is unavailable
 */
function generateFallbackSuggestion(
  orderData: OrderData,
  context: any
): OrderSuggestion {
  let suggestion = '';

  if (context.issues.length > 0) {
    suggestion = `Order ${orderData.order_id} requires attention: ${context.issues.join(', ')}. `;
    
    if (context.issues.includes('SLA breach')) {
      suggestion += 'Escalate to expedite processing and notify customer of delay. ';
    }
    
    if (context.issues.includes('quantity shortfall')) {
      suggestion += 'Investigate supplier delivery and consider partial fulfillment. ';
    }
    
    suggestion += 'Review with operations team for process improvements.';
  } else {
    suggestion = `Order ${orderData.order_id} is progressing normally. Monitor for on-time delivery and maintain standard processing workflow.`;
  }

  return {
    orderId: orderData.order_id,
    suggestion: suggestion.trim(),
    priority: context.priority,
    actionable: true,
    estimatedImpact: context.estimatedImpact,
  };
}
