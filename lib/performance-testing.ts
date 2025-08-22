// This part of the code creates performance testing utilities for data layer optimization
// Provides benchmarking, monitoring, and optimization recommendations

// This part of the code defines performance metrics
interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'mb' | 'count' | 'percent';
  threshold?: number;
  status: 'good' | 'warning' | 'critical';
  timestamp: number;
}

// This part of the code defines test results
interface PerformanceTestResult {
  testName: string;
  duration: number;
  memoryUsed: number;
  operationsPerSecond?: number;
  metrics: PerformanceMetric[];
  recommendations: string[];
  passed: boolean;
}

// This part of the code defines benchmark configuration
interface BenchmarkConfig {
  iterations: number;
  warmupIterations?: number;
  timeout?: number;
  memoryThreshold?: number;
  timeThreshold?: number;
}

// This part of the code creates the performance testing class
export class PerformanceTester {
  private results: PerformanceTestResult[] = [];

  // This part of the code runs a performance benchmark
  async benchmark<T>(
    testName: string,
    testFunction: () => Promise<T> | T,
    config: BenchmarkConfig = { iterations: 100 }
  ): Promise<PerformanceTestResult> {
    const {
      iterations,
      warmupIterations = 10,
      timeout = 30000,
      memoryThreshold = 50, // MB
      timeThreshold = 1000, // ms
    } = config;

    console.log(`🔬 Performance Test: ${testName}`);
    
    // This part of the code performs warmup iterations
    for (let i = 0; i < warmupIterations; i++) {
      await testFunction();
    }

    // This part of the code measures performance
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    const durations: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const iterationStart = performance.now();
      
      try {
        await Promise.race([
          testFunction(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ]);
      } catch (error) {
        console.error(`Iteration ${i + 1} failed:`, error);
      }
      
      const iterationEnd = performance.now();
      durations.push(iterationEnd - iterationStart);
    }

    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();
    
    // This part of the code calculates metrics
    const totalDuration = endTime - startTime;
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const memoryUsed = endMemory - startMemory;
    const operationsPerSecond = 1000 / avgDuration;

    const metrics: PerformanceMetric[] = [
      {
        name: 'Average Duration',
        value: avgDuration,
        unit: 'ms',
        threshold: timeThreshold,
        status: avgDuration > timeThreshold ? 'critical' : avgDuration > timeThreshold * 0.7 ? 'warning' : 'good',
        timestamp: Date.now(),
      },
      {
        name: 'Memory Usage',
        value: memoryUsed,
        unit: 'mb',
        threshold: memoryThreshold,
        status: memoryUsed > memoryThreshold ? 'critical' : memoryUsed > memoryThreshold * 0.7 ? 'warning' : 'good',
        timestamp: Date.now(),
      },
      {
        name: 'Operations Per Second',
        value: operationsPerSecond,
        unit: 'count',
        status: operationsPerSecond > 100 ? 'good' : operationsPerSecond > 50 ? 'warning' : 'critical',
        timestamp: Date.now(),
      },
    ];

    // This part of the code generates recommendations
    const recommendations = this.generateRecommendations(metrics, {
      avgDuration,
      memoryUsed,
      operationsPerSecond,
      testName,
    });

    const result: PerformanceTestResult = {
      testName,
      duration: totalDuration,
      memoryUsed,
      operationsPerSecond,
      metrics,
      recommendations,
      passed: metrics.every(m => m.status !== 'critical'),
    };

    this.results.push(result);
    return result;
  }

  // This part of the code tests data operations performance
  async testDataOperations(data: any[], operations: {
    name: string;
    operation: (data: any[]) => any;
  }[]): Promise<PerformanceTestResult[]> {
    const results: PerformanceTestResult[] = [];
    
    for (const op of operations) {
      const result = await this.benchmark(
        `Data Operation: ${op.name}`,
        () => op.operation(data),
        { iterations: 50, timeThreshold: 100 }
      );
      results.push(result);
    }
    
    return results;
  }

  // This part of the code tests API response times
  async testAPIPerformance(endpoints: {
    name: string;
    url: string;
    method?: 'GET' | 'POST';
    data?: any;
  }[]): Promise<PerformanceTestResult[]> {
    const results: PerformanceTestResult[] = [];
    
    for (const endpoint of endpoints) {
      const result = await this.benchmark(
        `API: ${endpoint.name}`,
        async () => {
          const response = await fetch(endpoint.url, {
            method: endpoint.method || 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: endpoint.data ? JSON.stringify(endpoint.data) : undefined,
          });
          return response.json();
        },
        { iterations: 20, timeThreshold: 2000 }
      );
      results.push(result);
    }
    
    return results;
  }

  // This part of the code tests component rendering performance
  async testRenderPerformance<T>(
    testName: string,
    renderFunction: () => T,
    iterations: number = 100
  ): Promise<PerformanceTestResult> {
    return this.benchmark(
      `Render: ${testName}`,
      renderFunction,
      { iterations, timeThreshold: 16 } // 60fps = 16.67ms per frame
    );
  }

  // This part of the code tests caching performance
  async testCachePerformance(
    cacheOperations: {
      name: string;
      operation: () => Promise<any> | any;
    }[]
  ): Promise<PerformanceTestResult[]> {
    const results: PerformanceTestResult[] = [];
    
    for (const operation of cacheOperations) {
      const result = await this.benchmark(
        `Cache: ${operation.name}`,
        operation.operation,
        { iterations: 1000, timeThreshold: 10 }
      );
      results.push(result);
    }
    
    return results;
  }

  // This part of the code generates optimization recommendations
  private generateRecommendations(
    metrics: PerformanceMetric[],
    context: {
      avgDuration: number;
      memoryUsed: number;
      operationsPerSecond: number;
      testName: string;
    }
  ): string[] {
    const recommendations: string[] = [];
    
    // This part of the code analyzes duration metrics
    if (context.avgDuration > 1000) {
      recommendations.push('Consider implementing pagination or data virtualization for large datasets');
      recommendations.push('Optimize database queries with proper indexing');
      recommendations.push('Implement result caching for frequently accessed data');
    } else if (context.avgDuration > 500) {
      recommendations.push('Consider lazy loading for non-critical data');
      recommendations.push('Implement request debouncing for user interactions');
    }

    // This part of the code analyzes memory usage
    if (context.memoryUsed > 50) {
      recommendations.push('Implement data cleanup and garbage collection strategies');
      recommendations.push('Use data virtualization for large lists and tables');
      recommendations.push('Consider streaming data for large responses');
    } else if (context.memoryUsed > 25) {
      recommendations.push('Monitor memory usage patterns and implement cleanup routines');
    }

    // This part of the code analyzes operations per second
    if (context.operationsPerSecond < 50) {
      recommendations.push('Optimize algorithm complexity (consider O(log n) vs O(n) solutions)');
      recommendations.push('Implement worker threads for CPU-intensive operations');
      recommendations.push('Use memoization for expensive computations');
    }

    // This part of the code provides test-specific recommendations
    if (context.testName.includes('Data Operation')) {
      if (context.avgDuration > 100) {
        recommendations.push('Use Map/Set data structures for faster lookups');
        recommendations.push('Implement binary search for sorted data');
        recommendations.push('Consider using Web Workers for heavy data processing');
      }
    }

    if (context.testName.includes('API')) {
      if (context.avgDuration > 2000) {
        recommendations.push('Implement request caching with appropriate TTL');
        recommendations.push('Use CDN for static data endpoints');
        recommendations.push('Optimize API payload size by removing unnecessary fields');
      }
    }

    if (context.testName.includes('Render')) {
      if (context.avgDuration > 16) {
        recommendations.push('Use React.memo() for component optimization');
        recommendations.push('Implement virtual scrolling for large lists');
        recommendations.push('Use useMemo() and useCallback() for expensive computations');
      }
    }

    return recommendations;
  }

  // This part of the code gets memory usage (browser environment)
  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
      const memory = (window.performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return 0;
  }

  // This part of the code generates a performance report
  generateReport(): {
    summary: {
      totalTests: number;
      passedTests: number;
      averageDuration: number;
      totalMemoryUsed: number;
    };
    results: PerformanceTestResult[];
    overallRecommendations: string[];
  } {
    const summary = {
      totalTests: this.results.length,
      passedTests: this.results.filter(r => r.passed).length,
      averageDuration: this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length,
      totalMemoryUsed: this.results.reduce((sum, r) => sum + r.memoryUsed, 0),
    };

    // This part of the code generates overall recommendations
    const overallRecommendations: string[] = [];
    
    if (summary.passedTests / summary.totalTests < 0.8) {
      overallRecommendations.push('Performance optimization is needed - less than 80% of tests passed');
    }
    
    if (summary.averageDuration > 1000) {
      overallRecommendations.push('Overall response times are slow - implement caching and optimization strategies');
    }
    
    if (summary.totalMemoryUsed > 100) {
      overallRecommendations.push('High memory usage detected - implement memory management strategies');
    }

    return {
      summary,
      results: this.results,
      overallRecommendations,
    };
  }

  // This part of the code clears test results
  clearResults(): void {
    this.results = [];
  }
}

// This part of the code provides real-time performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  // This part of the code starts monitoring performance
  startMonitoring(metricTypes: ('navigation' | 'resource' | 'measure' | 'paint')[] = ['navigation', 'paint']): void {
    if (typeof window === 'undefined') return;

    metricTypes.forEach(type => {
      if (this.observers.has(type)) return;

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.processPerformanceEntries(type, entries);
      });

      try {
        observer.observe({ entryTypes: [type] });
        this.observers.set(type, observer);
      } catch (error) {
        console.warn(`Performance monitoring for ${type} not supported`, error);
      }
    });
  }

  // This part of the code stops monitoring performance
  stopMonitoring(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  // This part of the code processes performance entries
  private processPerformanceEntries(type: string, entries: PerformanceEntry[]): void {
    entries.forEach(entry => {
      const metric: PerformanceMetric = {
        name: entry.name,
        value: entry.duration || (entry as any).startTime,
        unit: 'ms',
        status: this.evaluatePerformance(type, entry.duration || (entry as any).startTime),
        timestamp: entry.startTime + performance.timeOrigin,
      };

      if (!this.metrics.has(type)) {
        this.metrics.set(type, []);
      }
      
      this.metrics.get(type)!.push(metric);
    });
  }

  // This part of the code evaluates performance status
  private evaluatePerformance(type: string, value: number): 'good' | 'warning' | 'critical' {
    const thresholds = {
      navigation: { warning: 2000, critical: 5000 },
      resource: { warning: 1000, critical: 3000 },
      measure: { warning: 100, critical: 500 },
      paint: { warning: 100, critical: 300 },
    };

    const threshold = thresholds[type as keyof typeof thresholds] || { warning: 1000, critical: 2000 };
    
    if (value > threshold.critical) return 'critical';
    if (value > threshold.warning) return 'warning';
    return 'good';
  }

  // This part of the code gets current metrics
  getMetrics(): Map<string, PerformanceMetric[]> {
    return new Map(this.metrics);
  }

  // This part of the code clears metrics
  clearMetrics(): void {
    this.metrics.clear();
  }
}

// This part of the code provides performance testing utilities
export const PerformanceUtils = {
  // This part of the code measures React component render time
  measureRender: <T,>(component: () => T, name: string): T => {
    const start = performance.now();
    const result = component();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎨 Render ${name}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  },

  // This part of the code measures async operations
  measureAsync: async <T,>(operation: () => Promise<T>, name: string): Promise<T> => {
    const start = performance.now();
    const result = await operation();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ Async ${name}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  },

  // This part of the code creates performance marks
  mark: (name: string): void => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },

  // This part of the code measures between marks
  measure: (name: string, startMark: string, endMark: string): number => {
    if (typeof performance !== 'undefined' && performance.measure && performance.getEntriesByName) {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name, 'measure');
      return entries.length > 0 ? entries[0].duration : 0;
    }
    return 0;
  },

  // This part of the code gets core web vitals
  getCoreWebVitals: (): Promise<{
    FCP?: number;
    LCP?: number;
    FID?: number;
    CLS?: number;
  }> => {
    return new Promise((resolve) => {
      const vitals: any = {};
      
      // First Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            vitals.FCP = entry.startTime;
          }
        });
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.LCP = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let cls = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        });
        vitals.CLS = cls;
      }).observe({ entryTypes: ['layout-shift'] });

      // Return results after a delay
      setTimeout(() => resolve(vitals), 2000);
    });
  }
};

// This part of the code creates a singleton performance tester
export const performanceTester = new PerformanceTester();
export const performanceMonitor = new PerformanceMonitor();

// This part of the code exports types
export type { PerformanceMetric, PerformanceTestResult, BenchmarkConfig };
