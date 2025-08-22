// This part of the code creates a standardized API response system
// Ensures consistent response formats across all endpoints

import { VercelResponse } from '@vercel/node';

// This part of the code defines the standard API response structure
interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  meta?: Record<string, any>;
}

// This part of the code defines standard error response structure
interface ApiError {
  code: string;
  message: string;
  details?: string;
  field?: string;
}

// This part of the code provides the standardized API response builder
export class ApiResponseBuilder {
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // This part of the code creates successful responses
  static success<T>(
    res: VercelResponse,
    data: T,
    options: {
      message?: string;
      statusCode?: number;
      pagination?: StandardApiResponse['pagination'];
      meta?: Record<string, any>;
    } = {}
  ): void {
    const response: StandardApiResponse<T> = {
      success: true,
      data,
      message: options.message,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      pagination: options.pagination,
      meta: options.meta
    };

    res.status(options.statusCode || 200).json(response);
  }

  // This part of the code creates error responses
  static error(
    res: VercelResponse,
    error: string | ApiError,
    options: {
      statusCode?: number;
      details?: string;
      meta?: Record<string, any>;
    } = {}
  ): void {
    const errorResponse: StandardApiResponse = {
      success: false,
      error: typeof error === 'string' ? error : error.message,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      meta: options.meta
    };

    // This part of the code adds error details if provided
    if (options.details) {
      errorResponse.meta = { 
        ...errorResponse.meta, 
        details: options.details 
      };
    }

    res.status(options.statusCode || 500).json(errorResponse);
  }

  // This part of the code creates validation error responses
  static validationError(
    res: VercelResponse,
    message: string,
    field?: string
  ): void {
    const response: StandardApiResponse = {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      meta: field ? { field } : undefined
    };

    res.status(400).json(response);
  }

  // This part of the code creates not found error responses
  static notFound(
    res: VercelResponse,
    resource: string = 'Resource'
  ): void {
    this.error(res, `${resource} not found`, { statusCode: 404 });
  }

  // This part of the code creates method not allowed responses
  static methodNotAllowed(
    res: VercelResponse,
    allowedMethods: string[] = []
  ): void {
    const meta = allowedMethods.length > 0 
      ? { allowedMethods } 
      : undefined;

    const response: StandardApiResponse = {
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      meta
    };

    res.status(405).json(response);
  }

  // This part of the code creates unauthorized responses
  static unauthorized(
    res: VercelResponse,
    message: string = 'Unauthorized access'
  ): void {
    this.error(res, message, { statusCode: 401 });
  }

  // This part of the code creates forbidden responses
  static forbidden(
    res: VercelResponse,
    message: string = 'Forbidden access'
  ): void {
    this.error(res, message, { statusCode: 403 });
  }

  // This part of the code creates rate limit responses
  static rateLimited(
    res: VercelResponse,
    retryAfter?: number
  ): void {
    const meta = retryAfter ? { retryAfter } : undefined;
    
    const response: StandardApiResponse = {
      success: false,
      error: 'Rate limit exceeded',
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      meta
    };

    res.status(429).json(response);
  }

  // This part of the code creates paginated responses
  static paginated<T>(
    res: VercelResponse,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    options: {
      message?: string;
      meta?: Record<string, any>;
    } = {}
  ): void {
    const hasMore = (pagination.page * pagination.limit) < pagination.total;

    this.success(res, data, {
      message: options.message,
      pagination: {
        ...pagination,
        hasMore
      },
      meta: options.meta
    });
  }

  // This part of the code creates responses for AI operations
  static aiResponse<T>(
    res: VercelResponse,
    data: T,
    options: {
      model?: string;
      tokensUsed?: number;
      processingTime?: number;
      fallbackUsed?: boolean;
    } = {}
  ): void {
    this.success(res, data, {
      message: 'AI operation completed',
      meta: {
        ai: {
          model: options.model,
          tokensUsed: options.tokensUsed,
          processingTime: options.processingTime,
          fallbackUsed: options.fallbackUsed || false
        }
      }
    });
  }

  // This part of the code creates responses for data operations
  static dataResponse<T>(
    res: VercelResponse,
    data: T,
    options: {
      source?: string;
      cached?: boolean;
      freshness?: number;
      recordCount?: number;
    } = {}
  ): void {
    this.success(res, data, {
      message: 'Data retrieved successfully',
      meta: {
        data: {
          source: options.source,
          cached: options.cached || false,
          freshness: options.freshness,
          recordCount: options.recordCount
        }
      }
    });
  }
}

// This part of the code provides utility functions for response handling
export const ApiUtils = {
  // This part of the code validates request methods
  validateMethod(req: any, allowedMethods: string[]): boolean {
    return allowedMethods.includes(req.method);
  },

  // This part of the code validates required fields
  validateRequiredFields(data: any, requiredFields: string[]): { valid: boolean; missing: string[] } {
    const missing = requiredFields.filter(field => 
      data[field] === undefined || data[field] === null || data[field] === ''
    );
    
    return {
      valid: missing.length === 0,
      missing
    };
  },

  // This part of the code sanitizes error messages for production
  sanitizeError(error: any): string {
    if (process.env.NODE_ENV === 'production') {
      // This part of the code provides generic error messages in production
      if (error.message?.includes('ENOTFOUND') || error.message?.includes('fetch')) {
        return 'External service unavailable';
      }
      if (error.message?.includes('API key') || error.message?.includes('Authorization')) {
        return 'Configuration error';
      }
      if (error.message?.includes('timeout')) {
        return 'Request timeout';
      }
      return 'Internal server error';
    }
    
    // This part of the code provides detailed error messages in development
    return error instanceof Error ? error.message : String(error);
  },

  // This part of the code creates standardized cache headers
  setCacheHeaders(res: VercelResponse, maxAge: number = 300): void {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}`);
    res.setHeader('CDN-Cache-Control', `public, max-age=${maxAge}`);
    res.setHeader('Vercel-CDN-Cache-Control', `public, max-age=${maxAge}`);
  },

  // This part of the code sets CORS headers
  setCorsHeaders(res: VercelResponse): void {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
};

// This part of the code provides a decorator for standardized error handling
export function withErrorHandling(handler: Function) {
  return async (req: any, res: VercelResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      ApiResponseBuilder.error(
        res,
        ApiUtils.sanitizeError(error),
        {
          statusCode: 500,
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined
        }
      );
    }
  };
}

// This part of the code provides method validation decorator
export function withMethodValidation(allowedMethods: string[]) {
  return function(handler: Function) {
    return async (req: any, res: VercelResponse) => {
      if (!ApiUtils.validateMethod(req, allowedMethods)) {
        return ApiResponseBuilder.methodNotAllowed(res, allowedMethods);
      }
      
      await handler(req, res);
    };
  };
}

// This part of the code exports the standard response types for TypeScript
export type { StandardApiResponse, ApiError };
