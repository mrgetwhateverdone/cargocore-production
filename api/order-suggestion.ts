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
  return `Analyze this 3PL order and provide actionable recommendations:

ORDER DETAILS:
- Order ID: ${orderData.order_id}
- Brand: ${orderData.brand_name}
- Status: ${orderData.status}
- SLA Status: ${orderData.sla_status}
- Expected Quantity: ${orderData.expected_quantity}
- Received Quantity: ${orderData.received_quantity}
- Supplier: ${orderData.supplier || 'Not specified'}
- Expected Date: ${orderData.expected_date || 'Not specified'}
- Origin: ${orderData.ship_from_country || 'Unknown'}

IDENTIFIED ISSUES: ${context.issues.join(', ') || 'None'}
FOCUS AREAS: ${context.focusAreas.join(', ') || 'General optimization'}

Provide a concise recommendation focusing on:
1. Immediate actions needed
2. Root cause if issues exist
3. Prevention strategies
4. Expected business impact

Keep response under 150 words and actionable for logistics managers.`;
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
