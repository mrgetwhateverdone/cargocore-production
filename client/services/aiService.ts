// This part of the code creates a centralized AI service that standardizes all OpenAI integrations
// Consolidates 12+ different AI patterns into one unified, maintainable system

// This part of the code defines the standard AI service configuration
interface AIServiceConfig {
  model?: 'gpt-4' | 'gpt-4o-mini';
  maxTokens?: number;
  temperature?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

// This part of the code defines the standardized AI request structure
interface AIRequest {
  systemPrompt: string;
  userPrompt: string;
  context?: Record<string, any>;
  config?: AIServiceConfig;
}

// This part of the code defines the standardized AI response structure
interface AIResponse<T = string> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// This part of the code provides the default configuration for AI requests
const DEFAULT_CONFIG: AIServiceConfig = {
  model: 'gpt-4o-mini',
  maxTokens: 500,
  temperature: 0.2,
  presencePenalty: 0.1,
  frequencyPenalty: 0.1,
};

// This part of the code creates the centralized AI service class
export class AIService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
    
    if (!this.apiKey) {
      console.warn('⚠️ OpenAI API key not configured');
    }
  }

  // This part of the code provides the main AI generation method
  async generateResponse(request: AIRequest): Promise<AIResponse<string>> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'OpenAI API key not configured'
      };
    }

    const config = { ...DEFAULT_CONFIG, ...request.config };

    try {
      const messages = [
        {
          role: 'system' as const,
          content: request.systemPrompt
        },
        {
          role: 'user' as const,
          content: request.userPrompt
        }
      ];

      const requestBody = {
        model: config.model,
        messages,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        presence_penalty: config.presencePenalty,
        frequency_penalty: config.frequencyPenalty
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `OpenAI API error: ${response.status} - ${errorText}`
        };
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices?.[0]?.message?.content;

      if (!content) {
        return {
          success: false,
          error: 'No response content from OpenAI'
        };
      }

      return {
        success: true,
        data: content,
        usage: aiResponse.usage
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown AI service error'
      };
    }
  }

  // This part of the code provides specialized methods for different AI use cases
  async generateRecommendations(
    type: 'cost-variance' | 'margin-risk' | 'brand-optimization' | 'warehouse-optimization' | 'economic-intelligence' | 'dashboard-insights' | 'inventory-management',
    data: any,
    contextData?: Record<string, any>
  ): Promise<AIResponse<string[]>> {
    const systemPrompt = this.getSystemPromptForType(type);
    const userPrompt = this.getUserPromptForType(type, data, contextData);

    const response = await this.generateResponse({
      systemPrompt,
      userPrompt,
      context: contextData,
      config: {
        model: 'gpt-4o-mini',
        maxTokens: 500,
        temperature: 0.2
      }
    });

    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error,
        usage: response.usage
      };
    }

    // This part of the code parses AI response into clean, actionable recommendations
    const recommendations = this.parseRecommendations(response.data);

    return {
      success: true,
      data: recommendations,
      usage: response.usage
    };
  }

  // This part of the code generates executive summaries and insights
  async generateInsights(
    type: 'orders' | 'analytics' | 'cost-management' | 'reports',
    data: any,
    contextData?: Record<string, any>
  ): Promise<AIResponse<any[]>> {
    const systemPrompt = this.getInsightSystemPrompt(type);
    const userPrompt = this.getInsightUserPrompt(type, data, contextData);

    const response = await this.generateResponse({
      systemPrompt,
      userPrompt,
      context: contextData,
      config: {
        model: 'gpt-4',
        maxTokens: 1000,
        temperature: 0.3
      }
    });

    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error,
        usage: response.usage
      };
    }

    // This part of the code parses AI response into structured insights
    const insights = this.parseInsights(response.data, type);

    return {
      success: true,
      data: insights,
      usage: response.usage
    };
  }

  // This part of the code generates chat responses for the AI assistant
  async generateChatResponse(
    userMessage: string,
    operationalContext: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<AIResponse<string>> {
    const systemPrompt = `You are an expert 3PL operations assistant with deep knowledge of supply chain management, warehouse operations, inventory optimization, and logistics. You have access to real-time operational data from CargoCore.

OPERATIONAL CONTEXT:
${operationalContext}

Provide helpful, actionable insights based on the data. Keep responses concise but informative. Focus on practical solutions and operational improvements. IMPORTANT: Respond in plain text only - no markdown formatting, no asterisks, no bold text.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user' as const, content: userMessage }
    ];

    const response = await this.generateResponse({
      systemPrompt,
      userPrompt: userMessage,
      config: {
        model: 'gpt-4o-mini',
        maxTokens: 1200,
        temperature: 0.3
      }
    });

    if (!response.success || !response.data) {
      return response;
    }

    // This part of the code cleans markdown formatting from chat responses
    const cleanedResponse = this.cleanMarkdownFormatting(response.data);

    return {
      success: true,
      data: cleanedResponse,
      usage: response.usage
    };
  }

  // This part of the code provides standardized system prompts for different recommendation types
  private getSystemPromptForType(type: string): string {
    const basePrompt = "You are a world-class supply chain optimization expert with 20+ years of experience. Provide specific, actionable recommendations that drive measurable results. Each recommendation should be a single, clear action (15-20 words max). No explanations or bullet points - just actionable strategies.";

    const specificPrompts = {
      'cost-variance': `${basePrompt} Focus on cost optimization and variance reduction strategies.`,
      'margin-risk': `${basePrompt} Focus on margin protection and risk mitigation strategies.`,
      'brand-optimization': `${basePrompt} Focus on brand portfolio optimization and investment strategies.`,
      'warehouse-optimization': `${basePrompt} Focus on warehouse efficiency and operational excellence.`,
      'economic-intelligence': `${basePrompt} Focus on economic trends and strategic positioning.`,
      'dashboard-insights': `${basePrompt} Focus on operational improvements and performance optimization.`,
      'inventory-management': `${basePrompt} Focus on inventory optimization and stock management.`
    };

    return specificPrompts[type as keyof typeof specificPrompts] || basePrompt;
  }

  // This part of the code generates user prompts based on type and data
  private getUserPromptForType(type: string, data: any, contextData?: Record<string, any>): string {
    // Implementation would vary by type - this is a simplified version
    return `Analyze the following ${type} data and provide actionable recommendations: ${JSON.stringify(data)}`;
  }

  // This part of the code provides system prompts for insight generation
  private getInsightSystemPrompt(type: string): string {
    const prompts = {
      'orders': "You are a supply chain optimization expert. Analyze order flow patterns and provide operational intelligence for process improvement.",
      'analytics': "You are a data analytics expert specializing in 3PL operations. Provide strategic insights based on performance metrics.",
      'cost-management': "You are a cost optimization expert. Analyze cost data and provide strategic recommendations for cost reduction.",
      'reports': "You are a business intelligence expert. Generate comprehensive insights for executive reporting."
    };

    return prompts[type as keyof typeof prompts] || prompts['orders'];
  }

  // This part of the code generates user prompts for insights
  private getInsightUserPrompt(type: string, data: any, contextData?: Record<string, any>): string {
    // Implementation would vary by type - this is a simplified version
    return `Generate insights for ${type} based on: ${JSON.stringify(data)}`;
  }

  // This part of the code parses AI recommendations into a clean array
  private parseRecommendations(aiResponse: string): string[] {
    return aiResponse
      .split('\n')
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
      .filter(line => line.length > 5 && line.length < 100)  // Reasonable length
      .slice(0, 4);  // Max 4 recommendations
  }

  // This part of the code parses AI insights into structured data
  private parseInsights(aiResponse: string, type: string): any[] {
    // This would be implemented based on the specific insight structure needed
    // For now, return a simple structure
    return [{
      id: `ai-insight-${Date.now()}`,
      title: `AI Generated ${type} Insight`,
      description: aiResponse.substring(0, 200),
      severity: 'info' as const,
      source: `${type}_agent`,
      suggestedActions: this.parseRecommendations(aiResponse),
      createdAt: new Date().toISOString()
    }];
  }

  // This part of the code removes markdown formatting for clean text output
  private cleanMarkdownFormatting(text: string): string {
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

  // This part of the code provides safe formatting for dollar amounts
  formatDollarImpact(amount: number | null | undefined): string {
    if (!amount || typeof amount !== 'number') return '$0';
    
    const formatted = amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2
    });

    return formatted.replace(/\.00$/, '');
  }

  // This part of the code provides health check for the AI service
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const response = await this.generateResponse({
        systemPrompt: "You are a helpful assistant.",
        userPrompt: "Say 'OK' if you can respond.",
        config: {
          maxTokens: 10,
          temperature: 0
        }
      });

      return response.success;
    } catch {
      return false;
    }
  }
}

// This part of the code creates a singleton instance for use across the application
export const aiService = new AIService();
