// TinyBird Product Details API Response - product_details_mv schema
export interface ProductData {
  product_id: string;
  company_url: string;
  brand_id: string | null;
  brand_name: string;
  brand_domain: string | null;
  created_date: string;
  product_name: string;
  product_sku: string | null;
  gtin: string | null;
  is_kit: boolean;
  active: boolean;
  product_supplier: string | null;
  country_of_origin: string | null;
  harmonized_code: string | null;
  product_external_url: string | null;
  inventory_item_id: string;
  unit_quantity: number;
  supplier_name: string;
  unit_cost: number | null;
  supplier_external_id: string | null;
  updated_date: string | null;
}

// TinyBird Shipments API Response - inbound_shipments_details_mv schema
export interface ShipmentData {
  company_url: string;
  shipment_id: string;
  brand_id: string | null;
  brand_name: string;
  brand_domain: string | null;
  created_date: string;
  purchase_order_number: string | null;
  status: string;
  supplier: string | null;
  expected_arrival_date: string | null;
  warehouse_id: string | null;
  ship_from_city: string | null;
  ship_from_state: string | null;
  ship_from_postal_code: string | null;
  ship_from_country: string | null;
  external_system_url: string | null;
  inventory_item_id: string;
  sku: string | null;
  expected_quantity: number;
  received_quantity: number;
  unit_cost: number | null;
  external_id: string | null;
  receipt_id: string;
  arrival_date: string;
  receipt_inventory_item_id: string;
  receipt_quantity: number;
  tracking_number: string[];
  notes: string;
}

// TinyBird API Response Wrapper
export interface TinyBirdResponse<T> {
  meta: Array<{
    name: string;
    type: string;
  }>;
  data: T[];
}

// Dashboard KPIs
export interface DashboardKPIs {
  totalOrdersToday: number | null;
  atRiskOrders: number | null;
  openPOs: number | null;
  unfulfillableSKUs: number;
}

// Quick Overview Metrics
export interface QuickOverviewMetrics {
  topIssues: number;
  whatsWorking: number;
  dollarImpact: number;
  completedWorkflows: number;
}

// Warehouse Inventory
export interface WarehouseInventory {
  warehouseId: string;
  totalInventory: number;
  productCount: number;
  averageCost: number;
}

// AI Insights
export interface AIInsight {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  dollarImpact: number;
  suggestedActions: string[];
  createdAt: string;
  source: "dashboard_agent" | "warehouse_agent" | "inventory_agent";
}

// Anomaly Detection
export interface Anomaly {
  id: string;
  type:
    | "high_unfulfillable_skus"
    | "low_order_volume"
    | "sla_performance"
    | "inventory_imbalance";
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  icon: string;
  createdAt: string;
}

// Smart Margin Risk Analysis
export interface MarginRiskAlert {
  brandName: string;
  currentMargin: number;
  riskLevel: "High" | "Medium" | "Low";
  riskScore: number;
  primaryDrivers: string[];
  financialImpact: number;
  skuCount: number;
  avgUnitCost: number;
  inactivePercentage: number;
}

// Shipment Cost Variance Detection
export interface CostVarianceAnomaly {
  type: "Cost Spike" | "Quantity Discrepancy" | "Supplier Variance";
  title: string;
  description: string;
  severity: "High" | "Medium";
  warehouseId: string | null;
  supplier: string | null;
  currentValue: number;
  expectedValue: number;
  variance: number;
  riskFactors: string[];
  financialImpact: number;
}

// Dashboard Data (combined)
export interface DashboardData {
  products: ProductData[];
  shipments: ShipmentData[];
  kpis: DashboardKPIs;
  quickOverview: QuickOverviewMetrics;
  warehouseInventory: WarehouseInventory[];
  insights: AIInsight[];
  anomalies: Anomaly[];
  marginRisks: MarginRiskAlert[]; // This part of the code adds smart margin risk analysis data
  costVariances: CostVarianceAnomaly[]; // This part of the code adds cost variance detection data
  lastUpdated: string;
}

// Analytics KPIs
export interface AnalyticsKPIs {
  orderVolumeGrowth: number | null;  // percentage with +/- indicator
  returnRate: number | null;         // percentage 
  fulfillmentEfficiency: number | null; // percentage
  inventoryHealthScore: number | null;   // percentage
}

// Performance Metrics
export interface PerformanceMetrics {
  orderVolumeTrend: {
    growthRate: number;
    totalOrdersAnalyzed: number;
  };
  fulfillmentPerformance: {
    efficiencyRate: number;
    onTimeOrders: number;
  };
}

// Data Insights Dashboard
export interface DataInsightsDashboard {
  totalDataPoints: number;
  activeWarehouses: {
    count: number;
    avgSLA: number;
  };
  uniqueBrands: number;
  inventoryHealth: {
    percentage: number;
    skusInStock: number;
  };
}

// Operational Breakdown
export interface OperationalBreakdown {
  orderAnalysis: {
    totalOrders: number;
    onTimeOrders: number;
    delayedOrders: number;
    onTimeRate: number;
  };
  inventoryAnalysis: {
    totalSKUs: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    avgInventoryLevel: number;
  };
}

// Brand Performance
export interface BrandPerformance {
  totalBrands: number;
  topBrand: {
    name: string;
    skuCount: number;
  };
  brandRankings: Array<{
    rank: number;
    brandName: string;
    skuCount: number;
    inventoryPercentage: number;
    performanceLevel: string;
  }>;
}

// Analytics Data (combined)
export interface AnalyticsData {
  kpis: AnalyticsKPIs;
  insights: AIInsight[]; // Reuse existing type but from "analytics_agent"
  performanceMetrics: PerformanceMetrics;
  dataInsights: DataInsightsDashboard;
  operationalBreakdown: OperationalBreakdown;
  brandPerformance: BrandPerformance;
  lastUpdated: string;
}

// Orders Data (derived from Shipment data structure)
export interface OrderData {
  order_id: string; // maps to purchase_order_number or shipment_id
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
  // Original shipment fields for reference
  shipment_id: string;
  inventory_item_id: string;
}

// Orders KPIs
export interface OrdersKPIs {
  ordersToday: number;
  atRiskOrders: number;
  openPOs: number;
  unfulfillableSKUs: number;
}

// Inbound Shipment Intelligence
export interface InboundShipmentIntelligence {
  totalInbound: number;
  delayedShipments: {
    count: number;
    percentage: number;
  };
  avgDelayDays: number;
  valueAtRisk: number;
  geopoliticalRisks?: {
    riskCountries: string[];
    affectedShipments: number;
    avgDelayIncrease: number;
  };
  recentShipments: OrderData[];
  delayedShipmentsList: OrderData[];
}

// Orders Data (combined)
export interface OrdersData {
  orders: OrderData[];
  kpis: OrdersKPIs;
  insights: AIInsight[]; // Reuse existing type but from "orders_agent"
  inboundIntelligence: InboundShipmentIntelligence;
  lastUpdated: string;
}

// AI Order Suggestion
export interface OrderSuggestion {
  orderId: string;
  suggestion: string;
  priority: "low" | "medium" | "high";
  actionable: boolean;
  estimatedImpact?: string;
}

// API Error Types
export interface APIError {
  message: string;
  status?: number;
  endpoint?: string;
}
