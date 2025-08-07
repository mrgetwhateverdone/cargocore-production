// TinyBird Product Details API Response
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

// TinyBird Shipments API Response
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

// Dashboard Data (combined)
export interface DashboardData {
  products: ProductData[];
  shipments: ShipmentData[];
  kpis: DashboardKPIs;
  quickOverview: QuickOverviewMetrics;
  warehouseInventory: WarehouseInventory[];
  insights: AIInsight[];
  anomalies: Anomaly[];
  lastUpdated: string;
}

// API Error Types
export interface APIError {
  message: string;
  status?: number;
  endpoint?: string;
}
