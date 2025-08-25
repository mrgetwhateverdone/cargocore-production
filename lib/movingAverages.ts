/**
 * MOVING AVERAGES UTILITY LIBRARY - CARGOCORE PLATFORM
 * 
 * This part of the code provides safe moving average calculations with comprehensive error handling
 * All functions gracefully handle edge cases and invalid data to maintain system stability
 */

import { ma, ema, sma, dma, wma } from 'moving-averages';

// This part of the code defines the trend direction type for consistent usage across the platform
export type TrendDirection = 'up' | 'down' | 'neutral';

// This part of the code defines configuration options for moving average calculations
export interface MovingAverageConfig {
  period?: number;
  minDataPoints?: number;
  fallbackValue?: number;
}

/**
 * This part of the code calculates a safe simple moving average with error handling
 * Returns empty array if calculation fails to prevent system crashes
 */
export function calculateSafeMA(data: number[], period: number = 7): number[] {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('MA calculation: Empty or invalid data provided');
      return [];
    }
    
    if (period <= 0 || period > data.length) {
      console.warn(`MA calculation: Invalid period ${period} for data length ${data.length}`);
      return [];
    }

    // This part of the code filters out invalid values before calculation
    const validData = data.filter(value => 
      typeof value === 'number' && 
      !isNaN(value) && 
      isFinite(value)
    );

    if (validData.length < period) {
      console.warn(`MA calculation: Insufficient valid data points (${validData.length} < ${period})`);
      return [];
    }

    return ma(validData, period);
  } catch (error) {
    console.error('MA calculation failed:', error);
    return [];
  }
}

/**
 * This part of the code calculates a safe exponential moving average with error handling
 * EMA gives more weight to recent values, useful for trend detection
 */
export function calculateSafeEMA(data: number[], period: number = 7): number[] {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('EMA calculation: Empty or invalid data provided');
      return [];
    }
    
    if (period <= 0 || period > data.length) {
      console.warn(`EMA calculation: Invalid period ${period} for data length ${data.length}`);
      return [];
    }

    // This part of the code filters out invalid values before calculation
    const validData = data.filter(value => 
      typeof value === 'number' && 
      !isNaN(value) && 
      isFinite(value)
    );

    if (validData.length < period) {
      console.warn(`EMA calculation: Insufficient valid data points (${validData.length} < ${period})`);
      return [];
    }

    return ema(validData, period);
  } catch (error) {
    console.error('EMA calculation failed:', error);
    return [];
  }
}

/**
 * This part of the code calculates a safe smoothed moving average with error handling
 * SMA is useful for reducing noise in volatile data
 */
export function calculateSafeSMA(data: number[], period: number = 7, times: number = 1): number[] {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('SMA calculation: Empty or invalid data provided');
      return [];
    }
    
    if (period <= 0 || period > data.length) {
      console.warn(`SMA calculation: Invalid period ${period} for data length ${data.length}`);
      return [];
    }

    if (times <= 0) {
      console.warn(`SMA calculation: Invalid times parameter ${times}`);
      return [];
    }

    // This part of the code filters out invalid values before calculation
    const validData = data.filter(value => 
      typeof value === 'number' && 
      !isNaN(value) && 
      isFinite(value)
    );

    if (validData.length < period) {
      console.warn(`SMA calculation: Insufficient valid data points (${validData.length} < ${period})`);
      return [];
    }

    return sma(validData, period, times);
  } catch (error) {
    console.error('SMA calculation failed:', error);
    return [];
  }
}

/**
 * This part of the code calculates a safe dynamic weighted moving average with error handling
 * DMA allows for custom weighting schemes for forecasting
 */
export function calculateSafeDMA(data: number[], alpha: number | number[], noHead: boolean = false): number[] {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('DMA calculation: Empty or invalid data provided');
      return [];
    }

    // This part of the code validates alpha parameter
    if (Array.isArray(alpha)) {
      if (alpha.some(a => typeof a !== 'number' || isNaN(a) || a < 0 || a > 1)) {
        console.warn('DMA calculation: Invalid alpha array values');
        return [];
      }
    } else {
      if (typeof alpha !== 'number' || isNaN(alpha) || alpha < 0 || alpha > 1) {
        console.warn(`DMA calculation: Invalid alpha value ${alpha}`);
        return [];
      }
    }

    // This part of the code filters out invalid values before calculation
    const validData = data.filter(value => 
      typeof value === 'number' && 
      !isNaN(value) && 
      isFinite(value)
    );

    if (validData.length === 0) {
      console.warn('DMA calculation: No valid data points');
      return [];
    }

    return dma(validData, alpha, noHead);
  } catch (error) {
    console.error('DMA calculation failed:', error);
    return [];
  }
}

/**
 * This part of the code calculates a safe weighted moving average with error handling
 * WMA applies linear weighting to data points
 */
export function calculateSafeWMA(data: number[], period: number = 7): number[] {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('WMA calculation: Empty or invalid data provided');
      return [];
    }
    
    if (period <= 0 || period > data.length) {
      console.warn(`WMA calculation: Invalid period ${period} for data length ${data.length}`);
      return [];
    }

    // This part of the code filters out invalid values before calculation
    const validData = data.filter(value => 
      typeof value === 'number' && 
      !isNaN(value) && 
      isFinite(value)
    );

    if (validData.length < period) {
      console.warn(`WMA calculation: Insufficient valid data points (${validData.length} < ${period})`);
      return [];
    }

    return wma(validData, period);
  } catch (error) {
    console.error('WMA calculation failed:', error);
    return [];
  }
}

/**
 * This part of the code determines trend direction from moving average data
 * Compares recent values to determine if trend is up, down, or neutral
 */
export function calculateTrendDirection(values: number[], lookbackPeriod: number = 2): TrendDirection {
  try {
    if (!values || !Array.isArray(values) || values.length < lookbackPeriod) {
      return 'neutral';
    }

    // This part of the code gets the most recent values for comparison
    const recentValues = values.slice(-lookbackPeriod);
    
    // This part of the code filters out invalid values
    const validValues = recentValues.filter(value => 
      typeof value === 'number' && 
      !isNaN(value) && 
      isFinite(value)
    );

    if (validValues.length < 2) {
      return 'neutral';
    }

    const current = validValues[validValues.length - 1];
    const previous = validValues[validValues.length - 2];

    // This part of the code determines trend with small tolerance for noise
    const changeThreshold = Math.abs(previous) * 0.01; // 1% threshold
    const difference = current - previous;

    if (Math.abs(difference) <= changeThreshold) {
      return 'neutral';
    }

    return difference > 0 ? 'up' : 'down';
  } catch (error) {
    console.error('Trend direction calculation failed:', error);
    return 'neutral';
  }
}

/**
 * This part of the code calculates volatility score based on standard deviation
 * Higher score indicates more volatile data
 */
export function calculateVolatilityScore(values: number[]): number {
  try {
    if (!values || !Array.isArray(values) || values.length < 2) {
      return 0;
    }

    // This part of the code filters out invalid values
    const validValues = values.filter(value => 
      typeof value === 'number' && 
      !isNaN(value) && 
      isFinite(value)
    );

    if (validValues.length < 2) {
      return 0;
    }

    // This part of the code calculates mean
    const mean = validValues.reduce((sum, value) => sum + value, 0) / validValues.length;

    // This part of the code calculates variance
    const variance = validValues.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / validValues.length;

    // This part of the code calculates standard deviation
    const standardDeviation = Math.sqrt(variance);

    // This part of the code normalizes volatility score (0-100 scale)
    const volatilityScore = mean !== 0 ? (standardDeviation / Math.abs(mean)) * 100 : 0;

    return Math.round(Math.min(volatilityScore, 100)); // Cap at 100
  } catch (error) {
    console.error('Volatility score calculation failed:', error);
    return 0;
  }
}

/**
 * This part of the code provides enhanced moving average analysis with multiple indicators
 * Returns comprehensive trend analysis for dashboard display
 */
export function calculateEnhancedTrendAnalysis(
  data: number[], 
  shortPeriod: number = 7, 
  longPeriod: number = 21
): {
  shortMA: number[];
  longMA: number[];
  emaShort: number[];
  emaLong: number[];
  trendDirection: TrendDirection;
  volatilityScore: number;
  crossoverSignal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
} {
  try {
    // This part of the code calculates multiple moving averages
    const shortMA = calculateSafeMA(data, shortPeriod);
    const longMA = calculateSafeMA(data, longPeriod);
    const emaShort = calculateSafeEMA(data, shortPeriod);
    const emaLong = calculateSafeEMA(data, longPeriod);

    // This part of the code determines overall trend direction
    const trendDirection = calculateTrendDirection(emaShort);

    // This part of the code calculates volatility
    const volatilityScore = calculateVolatilityScore(data);

    // This part of the code detects crossover signals
    let crossoverSignal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let confidence = 0;

    if (shortMA.length > 0 && longMA.length > 0) {
      const shortCurrent = shortMA[shortMA.length - 1];
      const longCurrent = longMA[longMA.length - 1];
      const shortPrevious = shortMA.length > 1 ? shortMA[shortMA.length - 2] : shortCurrent;
      const longPrevious = longMA.length > 1 ? longMA[longMA.length - 2] : longCurrent;

      // This part of the code detects crossover patterns
      const wasBelow = shortPrevious <= longPrevious;
      const isAbove = shortCurrent > longCurrent;
      const wasAbove = shortPrevious >= longPrevious;
      const isBelow = shortCurrent < longCurrent;

      if (wasBelow && isAbove) {
        crossoverSignal = 'bullish';
        confidence = Math.min(95, 60 + (Math.abs(shortCurrent - longCurrent) / longCurrent) * 100);
      } else if (wasAbove && isBelow) {
        crossoverSignal = 'bearish';
        confidence = Math.min(95, 60 + (Math.abs(longCurrent - shortCurrent) / longCurrent) * 100);
      }
    }

    return {
      shortMA,
      longMA,
      emaShort,
      emaLong,
      trendDirection,
      volatilityScore,
      crossoverSignal,
      confidence: Math.round(confidence),
    };
  } catch (error) {
    console.error('Enhanced trend analysis failed:', error);
    return {
      shortMA: [],
      longMA: [],
      emaShort: [],
      emaLong: [],
      trendDirection: 'neutral',
      volatilityScore: 0,
      crossoverSignal: 'neutral',
      confidence: 0,
    };
  }
}

/**
 * This part of the code creates adaptive thresholds for anomaly detection
 * Uses EMA to create dynamic baselines that adapt to data trends
 */
export function calculateAdaptiveThreshold(
  data: number[], 
  period: number = 14, 
  multiplier: number = 1.25
): {
  baseline: number;
  upperThreshold: number;
  lowerThreshold: number;
  confidence: number;
} {
  try {
    if (!data || data.length === 0) {
      return {
        baseline: 0,
        upperThreshold: 0,
        lowerThreshold: 0,
        confidence: 0,
      };
    }

    // This part of the code calculates EMA baseline
    const emaValues = calculateSafeEMA(data, period);
    
    if (emaValues.length === 0) {
      return {
        baseline: 0,
        upperThreshold: 0,
        lowerThreshold: 0,
        confidence: 0,
      };
    }

    const baseline = emaValues[emaValues.length - 1];
    
    // This part of the code calculates threshold bounds
    const upperThreshold = baseline * multiplier;
    const lowerThreshold = baseline / multiplier;
    
    // This part of the code calculates confidence based on data stability
    const volatility = calculateVolatilityScore(data.slice(-period));
    const confidence = Math.max(50, 100 - volatility); // Higher confidence for lower volatility

    return {
      baseline: Math.round(baseline * 100) / 100,
      upperThreshold: Math.round(upperThreshold * 100) / 100,
      lowerThreshold: Math.round(lowerThreshold * 100) / 100,
      confidence: Math.round(confidence),
    };
  } catch (error) {
    console.error('Adaptive threshold calculation failed:', error);
    return {
      baseline: 0,
      upperThreshold: 0,
      lowerThreshold: 0,
      confidence: 0,
    };
  }
}
