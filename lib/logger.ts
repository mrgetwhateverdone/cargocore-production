// This part of the code creates a production-optimized logging system
// Replaces console.log statements with structured, configurable logging

// This part of the code defines log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

// This part of the code defines log entry structure
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
  requestId?: string;
}

// This part of the code creates the production logger class
export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  private constructor() {
    // This part of the code determines the logging level based on environment
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

  // This part of the code provides singleton access to the logger
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // This part of the code logs error messages
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // This part of the code logs warning messages
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  // This part of the code logs info messages
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  // This part of the code logs debug messages (development only)
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // This part of the code performs API request logging
  apiRequest(endpoint: string, method: string, duration?: number, status?: number): void {
    this.info(`API ${method} ${endpoint}`, {
      method,
      endpoint,
      duration: duration ? `${duration.toFixed(2)}ms` : undefined,
      status
    });
  }

  // This part of the code logs AI service calls
  aiService(operation: string, model?: string, tokens?: number, duration?: number): void {
    this.info(`AI Service: ${operation}`, {
      operation,
      model,
      tokens,
      duration: duration ? `${duration.toFixed(2)}ms` : undefined
    });
  }

  // This part of the code logs performance metrics
  performance(operation: string, duration: number, context?: Record<string, any>): void {
    if (duration > 1000) {
      this.warn(`Slow operation: ${operation} (${duration.toFixed(2)}ms)`, context);
    } else {
      this.debug(`Performance: ${operation} (${duration.toFixed(2)}ms)`, context);
    }
  }

  // This part of the code logs data operations
  dataOperation(operation: string, recordCount?: number, duration?: number): void {
    this.debug(`Data Operation: ${operation}`, {
      operation,
      recordCount,
      duration: duration ? `${duration.toFixed(2)}ms` : undefined
    });
  }

  // This part of the code core logging implementation
  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (level > this.logLevel) {
      return; // Skip logs below current level
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      requestId: this.generateRequestId()
    };

    // This part of the code formats output based on environment
    if (this.isDevelopment) {
      this.logToConsole(entry);
    } else {
      this.logToStructured(entry);
    }
  }

  // This part of the code provides development-friendly console output
  private logToConsole(entry: LogEntry): void {
    const levelColors = {
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.INFO]: '\x1b[36m',  // Cyan
      [LogLevel.DEBUG]: '\x1b[90m'  // Gray
    };

    const levelNames = {
      [LogLevel.ERROR]: 'ERROR',
      [LogLevel.WARN]: 'WARN',
      [LogLevel.INFO]: 'INFO',
      [LogLevel.DEBUG]: 'DEBUG'
    };

    const color = levelColors[entry.level];
    const levelName = levelNames[entry.level];
    const reset = '\x1b[0m';

    console.log(`${color}[${levelName}]${reset} ${entry.message}`);
    
    if (entry.context) {
      console.log(`${color}Context:${reset}`, entry.context);
    }
    
    if (entry.error) {
      console.error(`${color}Error:${reset}`, entry.error);
    }
  }

  // This part of the code provides structured logging for production
  private logToStructured(entry: LogEntry): void {
    const structuredLog = {
      level: LogLevel[entry.level],
      message: entry.message,
      timestamp: entry.timestamp,
      requestId: entry.requestId,
      ...(entry.context && { context: entry.context }),
      ...(entry.error && { 
        error: {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack
        }
      })
    };

    // This part of the code outputs JSON for log aggregation services
    console.log(JSON.stringify(structuredLog));
  }

  // This part of the code generates unique request IDs
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// This part of the code provides convenience functions for common logging
export const logger = Logger.getInstance();

// This part of the code provides performance measurement utilities
export const measurePerformance = async <T>(
  operation: string,
  fn: () => Promise<T> | T
): Promise<T> => {
  const start = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.performance(operation, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`${operation} failed after ${duration.toFixed(2)}ms`, error as Error);
    throw error;
  }
};

// This part of the code provides API logging middleware
export const logApiCall = (endpoint: string, method: string) => {
  return async <T>(fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      logger.apiRequest(endpoint, method, duration, 200);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.apiRequest(endpoint, method, duration, 500);
      logger.error(`API ${method} ${endpoint} failed`, error as Error);
      throw error;
    }
  };
};

// This part of the code provides data operation logging
export const logDataOperation = (operation: string, recordCount?: number) => {
  return async <T>(fn: () => Promise<T> | T): Promise<T> => {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      logger.dataOperation(operation, recordCount, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`Data operation ${operation} failed after ${duration.toFixed(2)}ms`, error as Error);
      throw error;
    }
  };
};

// This part of the code provides AI service logging
export const logAIService = (operation: string, model?: string) => {
  return async <T>(fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      logger.aiService(operation, model, undefined, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`AI Service ${operation} failed after ${duration.toFixed(2)}ms`, error as Error);
      throw error;
    }
  };
};
