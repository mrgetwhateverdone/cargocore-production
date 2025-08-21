/**
 * SHARED TYPE DEFINITIONS - CARGOCORE PLATFORM
 * 
 * This part of the code defines comprehensive type system for CargoCore platform
 * Created during Phase 2: Type Safety Implementation
 * Eliminates 'any' types and provides complete type coverage
 */

// ===================================
// TINYBIRD API RESPONSE TYPES
// ===================================

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

// ===================================
// COMMON TYPES & UTILITIES
// ===================================

export type SeverityLevel = "critical" | "warning" | "info";
export type PriorityLevel = "low" | "medium" | "high" | "critical";
export type StatusLevel = "Excellent" | "Good" | "Needs Attention";
export type RiskLevel = "Low" | "Medium" | "High";

// API Response Wrapper
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// API Error Response
export interface APIError {
  message: string;
  status?: number;
  endpoint?: string;
  code?: string;
}

// ===================================
// AI & INSIGHTS TYPES
// ===================================

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  dollarImpact: number;
  suggestedActions: string[];
  createdAt: string;
  source: "dashboard_agent" | "warehouse_agent" | "inventory_agent" | "cost_agent" | "analytics_agent" | "orders_agent" | "reports_agent" | "economic_agent";
  type?: string;
}

// ===================================
// DASHBOARD TYPES
// ===================================

export interface DashboardKPIs {
  totalOrdersToday: number | null;
  atRiskOrders: number | null;
  openPOs: number | null;
  unfulfillableSKUs: number;
}

export interface QuickOverviewMetrics {
  topIssues: number;
  whatsWorking: number;
  dollarImpact: number;
  completedWorkflows: number;
}

export interface WarehouseInventory {
  warehouseId: string;
  totalInventory: number;
  productCount: number;
  averageCost: number;
}

export interface Anomaly {
  id: string;
  type: "high_unfulfillable_skus" | "low_order_volume" | "sla_performance" | "inventory_imbalance";
  title: string;
  description: string;
  severity: SeverityLevel;
  icon: string;
  createdAt: string;
}

export interface MarginRiskAlert {
  brandName: string;
  currentMargin: number;
  riskLevel: RiskLevel;
  riskScore: number;
  primaryDrivers: string[];
  financialImpact: number;
  skuCount: number;
  avgUnitCost: number;
  inactivePercentage: number;
}

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

export interface DashboardData {
  products: ProductData[];
  shipments: ShipmentData[];
  kpis: DashboardKPIs;
  quickOverview: QuickOverviewMetrics;
  warehouseInventory: WarehouseInventory[];
  insights: AIInsight[];
  anomalies: Anomaly[];
  marginRisks: MarginRiskAlert[];
  costVariances: CostVarianceAnomaly[];
  lastUpdated: string;
}

// ===================================
// ANALYTICS TYPES
// ===================================

export interface AnalyticsKPIs {
  orderVolumeGrowth: number | null;
  returnRate: number | null;
  fulfillmentEfficiency: number | null;
  inventoryHealthScore: number | null;
}

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

export interface BrandPerformanceAnalytics {
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

export interface AnalyticsData {
  kpis: AnalyticsKPIs;
  insights: AIInsight[];
  performanceMetrics: PerformanceMetrics;
  dataInsights: DataInsightsDashboard;
  operationalBreakdown: OperationalBreakdown;
  brandPerformance: BrandPerformanceAnalytics;
  lastUpdated: string;
}

// ===================================
// ORDERS TYPES
// ===================================

export interface OrderData {
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
  shipment_id: string;
  inventory_item_id: string;
}

export interface OrdersKPIs {
  ordersToday: number;
  atRiskOrders: number;
  openPOs: number;
  unfulfillableSKUs: number;
}

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

export interface OrdersData {
  orders: OrderData[];
  kpis: OrdersKPIs;
  insights: AIInsight[];
  inboundIntelligence: InboundShipmentIntelligence;
  lastUpdated: string;
}

export interface OrderSuggestion {
  orderId: string;
  suggestion: string;
  priority: PriorityLevel;
  actionable: boolean;
  estimatedImpact?: string;
}

// ===================================
// INVENTORY TYPES
// ===================================

export interface InventoryItem {
  sku: string;
  product_name: string;
  brand_name: string;
  on_hand: number;
  committed: number;
  available: number;
  unit_cost: number;
  total_value: number;
  supplier: string;
  country_of_origin: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstocked' | 'Inactive';
  active: boolean;
  days_since_created: number;
  warehouse_id?: string | null;
  last_updated?: string | null;
  reorder_analysis?: {
    daily_usage_rate: number;
    lead_time_days: number;
    reorder_date: string;
    recommended_quantity: number;
    reorder_cost: number;
    days_until_stockout: number;
    safety_stock: number;
    reorder_status: 'critical' | 'warning' | 'good';
  };
}

export interface InventoryKPIs {
  totalActiveSKUs: number;
  totalInventoryValue: number;
  lowStockAlerts: number;
  inactiveSKUs: number;
  totalSKUs: number;
  inStockCount: number;
  unfulfillableCount: number;
  overstockedCount: number;
  avgDaysOnHand: number | null;
}

export interface BrandPerformance {
  brand_name: string;
  sku_count: number;
  total_value: number;
  total_quantity: number;
  avg_value_per_sku: number;
  portfolio_percentage: number;
  efficiency_score: number;
}

export interface SupplierAnalysis {
  supplier_name: string;
  sku_count: number;
  total_value: number;
  countries: string[];
  concentration_risk: number;
  diversity_score: number;
  avg_lead_time: number | null;
  multi_source_skus: number;
}

export interface InventoryData {
  kpis: InventoryKPIs;
  insights: AIInsight[];
  inventory: InventoryItem[];
  brandPerformance: BrandPerformance[];
  supplierAnalysis: SupplierAnalysis[];
  warehouseInventory: WarehouseInventory[];
  lastUpdated: string;
}

// ===================================
// WAREHOUSE TYPES
// ===================================

export interface WarehouseData {
  warehouseId: string;
  warehouseName: string;
  supplierName: string;
  slaPerformance: number;
  activeOrders: number;
  avgFulfillmentTime: number;
  totalSKUs: number;
  throughput: number;
  status: StatusLevel;
  performanceScore: number;
  location?: {
    city: string | null;
    state: string | null;
    country: string | null;
  };
}

export interface WarehouseKPIs {
  avgSLAPercentage: number | null;
  totalActiveOrders: number | null;
  avgFulfillmentTime: number | null;
  totalInboundThroughput: number | null;
}

export interface WarehousePerformanceRanking {
  rank: number;
  warehouseId: string;
  warehouseName: string;
  slaPerformance: number;
  activeOrders: number;
  avgFulfillmentTime: number;
  status: StatusLevel;
}

export interface BudgetAllocation {
  warehouseId: string;
  warehouseName: string;
  currentBudget: number;
  recommendedBudget: number;
  changeAmount: number;
  changePercentage: number;
  expectedROI: number;
  justification: string;
  riskLevel: RiskLevel;
  performanceScore: number;
}

export interface UserBehaviorAnalysis {
  warehouseId: string;
  warehouseName: string;
  viewFrequency: number;
  timeSpent: number;
  engagementScore: number;
  commonActions: string[];
  nextBestAction: string;
  personalizedTips: string[];
}

export interface OptimizationOpportunity {
  area: string;
  priority: RiskLevel;
  currentValue: number;
  targetValue: number;
  investment: number;
  potentialSavings: number;
  timeline: string;
}

export interface WarehouseOptimization {
  warehouseId: string;
  warehouseName: string;
  roiPercentage: number;
  riskLevel: RiskLevel;
  performanceMetrics: {
    slaPerformance: number;
    throughput: number;
    efficiency: number;
    capacityUsage: number;
  };
  opportunities: OptimizationOpportunity[];
  totalInvestment: number;
  potentialSavings: number;
  timeline: string;
}

export interface WarehousesData {
  warehouses: WarehouseData[];
  kpis: WarehouseKPIs;
  insights: AIInsight[];
  performanceRankings: WarehousePerformanceRanking[];
  budgetAllocations: BudgetAllocation[];
  userBehavior: UserBehaviorAnalysis[];
  optimizations: WarehouseOptimization[];
  lastUpdated: string;
}

// ===================================
// COST MANAGEMENT TYPES
// ===================================

export interface CostKPIs {
  totalMonthlyCosts: number;
  costEfficiencyRate: number;
  topPerformingWarehouses: number;
  totalCostCenters: number;
  totalWarehouses: number;
  avgSLAPerformance: number;
  monthlyThroughput: number;
  activeCostCenters: number;
}

export interface CostCenter {
  warehouse_id: string;
  warehouse_name: string;
  monthly_throughput: number;
  sla_performance: number;
  status: 'Active' | 'Inactive';
  total_shipments: number;
  on_time_shipments: number;
  monthly_costs: number;
  cost_per_shipment: number;
  cost_efficiency: number;
  utilization_rate: number;
  cost_breakdown: {
    receiving: number;
    storage: number;
    processing: number;
    overhead: number;
  };
}

export interface SupplierPerformance {
  supplier_name: string;
  total_cost: number;
  avg_cost_per_unit: number;
  sla_performance: number;
  shipment_count: number;
  cost_variance: number;
  efficiency_score: number;
  status: 'Efficient' | 'Needs Attention' | 'High Cost';
}

export interface HistoricalCostTrend {
  month: string;
  total_cost: number;
  shipment_count: number;
  avg_cost_per_shipment: number;
  cost_change_percentage: number;
}

export interface CostData {
  kpis: CostKPIs;
  insights: AIInsight[];
  costCenters: CostCenter[];
  supplierPerformance: SupplierPerformance[];
  historicalTrends: HistoricalCostTrend[];
  lastUpdated: string;
}

// ===================================
// ECONOMIC INTELLIGENCE TYPES
// ===================================

export interface EconomicKPIs {
  supplierPerformance: number;
  shippingCostImpact: number;
  transportationCosts: number;
  supplyChainHealth: number;
  logisticsCostEfficiency: number;
  supplierDelayRate: number;
}

export interface EconomicInsight {
  id: string;
  title: string;
  description: string;
  dollarImpact: number;
  severity: SeverityLevel;
  type: string;
  source: string;
  suggestedActions: string[];
  createdAt: string;
}

export interface BusinessImpactAnalysis {
  executiveSummary: string;
  keyRisks: string[];
  opportunityAreas: string[];
}

export interface FinancialImpacts {
  quantityDiscrepancyImpact: number;
  cancelledShipmentsImpact: number;
  brandConcentrationRisk: number;
  totalFinancialRisk: number;
  top3BrandPercentage: number;
}

export interface EconomicKPIDetail {
  id: string;
  title: string;
  value: string | number;
  description: string;
  status: 'critical' | 'warning' | 'good';
  detailedAnalysis: string;
  keyMetrics: Array<{
    label: string;
    value: string | number;
    description: string;
  }>;
  recommendations: string[];
}

export interface EconomicIntelligenceData {
  kpis: EconomicKPIs;
  insights: EconomicInsight[];
  businessImpact: BusinessImpactAnalysis;
  financialImpacts: FinancialImpacts;
  kpiDetails?: {
    supplierPerformance: EconomicKPIDetail;
    shippingCostImpact: EconomicKPIDetail;
    supplyChainHealth: EconomicKPIDetail;
    transportationCosts: EconomicKPIDetail;
    logisticsCostEfficiency: EconomicKPIDetail;
    supplierDelayRate: EconomicKPIDetail;
  };
  lastUpdated: string;
}

// ===================================
// REPORTS TYPES
// ===================================

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  estimatedReadTime: string;
  metrics: string[];
  available: boolean;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  brands?: string[];
  warehouses?: string[];
  template: string;
}

export interface ReportKPIs {
  totalProducts: number;
  totalShipments: number;
  activeProducts: number;
  totalInventoryValue: number;
  completedShipments: number;
  delayedShipments: number;
  slaCompliance: number | null;
  fulfillmentRate: number | null;
}

export interface ReportBrandOption {
  brand_name: string;
  sku_count: number;
  total_value: number;
  total_quantity: number;
  avg_value_per_sku: number;
  portfolio_percentage: number;
  efficiency_score: number;
}

export interface ReportWarehouseOption {
  warehouse_id: string;
  warehouse_name: string;
  total_shipments: number;
  completed_shipments: number;
  total_cost: number;
  total_quantity: number;
  efficiency_rate: number;
  avg_cost_per_shipment: number;
}

export interface ReportData {
  template: ReportTemplate;
  filters: ReportFilters;
  data: {
    products: ProductData[];
    shipments: ShipmentData[];
    kpis: ReportKPIs;
    insights: AIInsight[];
  };
  availableBrands: ReportBrandOption[];
  availableWarehouses: ReportWarehouseOption[];
  generatedAt: string;
  reportPeriod: string;
}

export interface ReportTemplatesResponse {
  templates: ReportTemplate[];
  availableBrands: ReportBrandOption[];
  availableWarehouses: ReportWarehouseOption[];
}

// ===================================
// AI CHAT TYPES
// ===================================

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  conversation?: ChatMessage[];
  includeContext?: boolean;
}

export interface ChatResponse {
  response: string;
  conversationId: string;
  timestamp: string;
  context?: {
    dataTimestamp: string;
    sourcesUsed: string[];
  };
}

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
}

// ===================================
// OPENAI INTEGRATION TYPES
// ===================================

export interface OpenAIConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface AIRecommendationRequest {
  context: string;
  dataType: 'dashboard' | 'orders' | 'inventory' | 'warehouses' | 'cost' | 'analytics' | 'economic';
  data: Record<string, unknown>;
}

export interface AIRecommendationResponse {
  recommendations: string[];
  confidence: number;
  processingTime: number;
}

// ===================================
// WORKFLOW TYPES
// ===================================

export interface WorkflowAction {
  label: string;
  type: 'create_workflow' | 'update_data' | 'send_notification';
  target: string;
  values: string[];
  priority: PriorityLevel;
}

export interface Workflow {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: PriorityLevel;
  category: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  assignedTo?: string;
  associatedInsightId?: string;
  dollarImpact?: number;
  suggestedActions?: string[];
}

// ===================================
// SETTINGS TYPES
// ===================================

export interface SettingsData {
  dataRefreshInterval: number;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  api: {
    timeout: number;
    retries: number;
  };
  ui: {
    density: 'compact' | 'comfortable' | 'spacious';
    animations: boolean;
  };
}

// ===================================
// UTILITY TYPES
// ===================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface FilterOptions {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

// ===================================
// FORM TYPES
// ===================================

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}
