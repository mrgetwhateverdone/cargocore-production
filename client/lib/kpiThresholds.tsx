import { AlertTriangle } from "lucide-react";

/**
 * This part of the code defines world-class KPI thresholds based on industry standards
 * Provides business-critical alerts that indicate immediate operational issues
 */

export interface KPIThreshold {
  critical: number;
  warning?: number;
  type: 'percentage' | 'number' | 'hours' | 'currency';
  comparison: 'less_than' | 'greater_than';
}

/**
 * This part of the code defines universal industry-standard thresholds
 * These are based on Fortune 500 3PL operational benchmarks
 */
export const WORLD_CLASS_THRESHOLDS: Record<string, KPIThreshold> = {
  // SLA Performance (industry standard: 95%+)
  'sla_percentage': {
    critical: 95,
    warning: 90,
    type: 'percentage',
    comparison: 'less_than'
  },
  
  // Fulfillment Time (customer expectation: <24h)
  'fulfillment_hours': {
    critical: 24,
    warning: 18,
    type: 'hours',
    comparison: 'greater_than'
  },
  
  // At-Risk Orders (operational threshold)
  'at_risk_orders': {
    critical: 50,
    warning: 25,
    type: 'number',
    comparison: 'greater_than'
  },
  
  // Low Stock Alerts (supply chain risk)
  'low_stock_skus': {
    critical: 100,
    warning: 50,
    type: 'number',
    comparison: 'greater_than'
  },
  
  // Processing Accuracy (operational excellence)
  'processing_accuracy': {
    critical: 98,
    warning: 95,
    type: 'percentage',
    comparison: 'less_than'
  },
  
  // Cost Efficiency (financial performance)
  'cost_efficiency': {
    critical: 85,
    warning: 90,
    type: 'percentage',
    comparison: 'less_than'
  },
  
  // Inactive SKUs (inventory management)
  'inactive_skus': {
    critical: 0,
    type: 'number',
    comparison: 'greater_than'
  },
  
  // Unfulfillable SKUs (operational failure)
  'unfulfillable_skus': {
    critical: 0,
    type: 'number',
    comparison: 'greater_than'
  }
};

/**
 * This part of the code evaluates KPI values against world-class thresholds
 * Returns critical alert status for business-impacting issues
 */
export function evaluateKPIStatus(
  kpiKey: string, 
  value: number | null | undefined
): 'critical' | 'warning' | 'normal' {
  if (value === null || value === undefined) {
    return 'normal';
  }

  const threshold = WORLD_CLASS_THRESHOLDS[kpiKey];
  if (!threshold) {
    return 'normal';
  }

  const { critical, warning, comparison } = threshold;

  if (comparison === 'less_than') {
    if (value < critical) return 'critical';
    if (warning && value < warning) return 'warning';
  } else if (comparison === 'greater_than') {
    if (value > critical) return 'critical';
    if (warning && value > warning) return 'warning';
  }

  return 'normal';
}

/**
 * This part of the code renders a red warning icon for critical KPIs
 * Provides immediate visual feedback for business-critical issues
 */
export function renderKPIWarningIcon(status: 'critical' | 'warning' | 'normal') {
  if (status === 'critical') {
    return (
      <AlertTriangle 
        className="h-4 w-4 text-red-500 inline ml-1" 
        title="Critical: Immediate attention required"
      />
    );
  }
  
  if (status === 'warning') {
    return (
      <AlertTriangle 
        className="h-4 w-4 text-orange-500 inline ml-1" 
        title="Warning: Monitor closely"
      />
    );
  }
  
  return null;
}

/**
 * This part of the code provides business context for critical alerts
 * Explains the operational impact of threshold violations
 */
export function getKPIBusinessImpact(kpiKey: string): string {
  const impacts: Record<string, string> = {
    'sla_percentage': 'Customer satisfaction and contract compliance at risk',
    'fulfillment_hours': 'Customer expectations not being met',
    'at_risk_orders': 'Revenue and customer relationships threatened',
    'low_stock_skus': 'Stockout risk and revenue opportunity loss',
    'processing_accuracy': 'Operational failure affecting customer trust',
    'cost_efficiency': 'Financial performance below industry standards',
    'inactive_skus': 'Capital tied up in non-performing inventory',
    'unfulfillable_skus': 'Direct revenue loss and customer impact'
  };
  
  return impacts[kpiKey] || 'Performance below operational standards';
}
