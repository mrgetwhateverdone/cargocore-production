// This part of the code creates a unified AI chat endpoint
// Consolidates all AI chat functionality into one standardized serverless function

import { VercelRequest, VercelResponse } from '@vercel/node';

// This part of the code defines the chat message structure
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

// This part of the code defines the chat request structure
interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  operationalContext?: string;
  settings?: {
    model?: 'gpt-4' | 'gpt-4o-mini';
    maxTokens?: number;
    temperature?: number;
    contextLevel?: 'basic' | 'detailed' | 'comprehensive';
  };
}

// This part of the code removes markdown formatting for clean chat responses
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

// This part of the code generates comprehensive operational context
function generateOperationalContext(): string {
  return `You are an expert 3PL operations assistant with deep knowledge of:

CORE COMPETENCIES:
• Supply Chain Management: End-to-end logistics optimization, vendor management, and distribution strategy
• Warehouse Operations: Inventory management, order fulfillment, storage optimization, and labor efficiency
• Transportation & Logistics: Route optimization, carrier management, freight cost analysis, and delivery performance
• Data Analytics: KPI tracking, performance metrics, trend analysis, and predictive insights
• Cost Management: Operational cost analysis, budget optimization, and ROI improvement strategies
• Quality Control: Process standardization, error reduction, and continuous improvement methodologies

OPERATIONAL INTELLIGENCE:
• Real-time inventory tracking and stock level optimization
• Order processing workflows and fulfillment efficiency
• Supplier performance monitoring and relationship management
• Warehouse performance analytics and throughput optimization
• Cost variance analysis and budget management
• Economic intelligence and market trend analysis

DECISION SUPPORT CAPABILITIES:
• Strategic planning and operational forecasting
• Risk assessment and mitigation strategies
• Process improvement recommendations
• Technology integration guidance
• Compliance and regulatory advisory
• Performance benchmarking and best practices

You have access to live CargoCore operational data including inventory levels, order statuses, warehouse performance, supplier metrics, cost analytics, and economic intelligence indicators.

RESPONSE GUIDELINES:
• Provide actionable, data-driven insights
• Focus on practical solutions and operational improvements
• Keep responses concise but comprehensive
• Use plain text only - no markdown formatting
• Reference specific metrics when relevant
• Offer strategic recommendations when appropriate`;
}

// This part of the code provides unified AI chat responses
async function generateUnifiedChatResponse(request: ChatRequest): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return 'I apologize, but I cannot connect to the AI service at the moment. Please check the OpenAI API configuration and try again.';
  }

  const settings = {
    model: 'gpt-4o-mini',
    maxTokens: 1200,
    temperature: 0.3,
    contextLevel: 'detailed',
    ...request.settings
  };

  // This part of the code builds the conversation context
  const systemPrompt = request.operationalContext || generateOperationalContext();
  
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    // Include last 10 messages for context
    ...(request.conversationHistory || []).slice(-10),
    { role: 'user' as const, content: request.message }
  ];

  try {
    const openaiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
    
    const response = await fetch(openaiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: settings.model,
        messages,
        max_tokens: settings.maxTokens,
        temperature: settings.temperature,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from OpenAI");
    }

    // This part of the code cleans markdown formatting from AI responses
    return cleanMarkdownFormatting(aiResponse);

  } catch (error) {
    console.error('AI Chat Error:', error);
    
    // This part of the code provides intelligent fallback responses
    return generateFallbackResponse(request.message);
  }
}

// This part of the code provides contextual fallback responses
function generateFallbackResponse(userMessage: string): string {
  const messageLower = userMessage.toLowerCase();
  
  // This part of the code provides topic-specific fallback responses
  if (messageLower.includes('inventory') || messageLower.includes('stock')) {
    return 'I can help you with inventory management questions. While I cannot access live data right now, I can provide guidance on inventory optimization, stock level management, turnover analysis, and demand forecasting strategies. What specific inventory challenge would you like to discuss?';
  }
  
  if (messageLower.includes('warehouse') || messageLower.includes('fulfillment')) {
    return 'I specialize in warehouse operations and can assist with fulfillment optimization, layout design, throughput analysis, and performance improvement. What warehouse operations topic would you like to explore?';
  }
  
  if (messageLower.includes('cost') || messageLower.includes('budget')) {
    return 'I can provide insights on cost management, budget optimization, variance analysis, and cost reduction strategies. What cost-related challenge are you looking to address?';
  }
  
  if (messageLower.includes('supplier') || messageLower.includes('vendor')) {
    return 'I can help with supplier management, vendor performance analysis, relationship optimization, and supply chain risk assessment. What supplier-related question do you have?';
  }
  
  if (messageLower.includes('order') || messageLower.includes('shipment')) {
    return 'I can assist with order processing optimization, shipment tracking, delivery performance analysis, and fulfillment efficiency improvements. What order management topic interests you?';
  }
  
  if (messageLower.includes('analytics') || messageLower.includes('report')) {
    return 'I can provide guidance on performance analytics, KPI tracking, reporting strategies, and data-driven decision making. What analytics or reporting question do you have?';
  }
  
  // This part of the code provides general fallback response
  return 'I am your 3PL operations assistant, ready to help with supply chain management, warehouse operations, inventory optimization, cost analysis, and strategic planning. While I cannot access live operational data at the moment, I can provide expert guidance on best practices and strategic approaches. What specific operational challenge would you like to discuss?';
}

// This part of the code handles the unified AI chat endpoint
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Handle CORS for frontend requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory, operationalContext, settings } = req.body as ChatRequest;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid message field' });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message too long (max 2000 characters)' });
    }

    const aiResponse = await generateUnifiedChatResponse({
      message,
      conversationHistory,
      operationalContext,
      settings
    });

    const responseMessage: ChatMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: responseMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Chat Handler Error:', error);
    
    const fallbackMessage: ChatMessage = {
      role: 'assistant',
      content: 'I apologize, but I encountered an error processing your request. Please try again, and if the issue persists, please contact support.',
      timestamp: new Date().toISOString()
    };

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      message: fallbackMessage
    });
  }
}
