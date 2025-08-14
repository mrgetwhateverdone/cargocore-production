# CargoCore Real Data Integration Guide
*Complete implementation blueprint for building data-driven 3PL platforms*

## 🎯 Overview
This guide documents the exact implementation of real data integration across all CargoCore pages using TinyBird APIs and OpenAI. Follow this blueprint to replicate the architecture for any brand.

---

## 📊 Core Data Architecture

### TinyBird API Integration
**Base Configuration:**
- **Products Endpoint**: `${TINYBIRD_BASE_URL}?token=${TINYBIRD_TOKEN}&limit=500&company_url=COMP002_packiyo`
- **Shipments Endpoint**: `${TINYBIRD_BASE_URL}?token=${TINYBIRD_TOKEN}&limit=500&company_url=COMP002_packiyo`
- **Environment Variables**: `TINYBIRD_BASE_URL`, `TINYBIRD_TOKEN`

### Data Flow Pattern
```
TinyBird Raw Data → API Endpoint → Data Hook → Page Component → UI Display
```

---

## 🔧 Implementation Pattern (Used on Every Page)

### 1. API Endpoint Creation (`/api/[page]-data.ts`)
```typescript
export default async function handler(req: Request) {
  try {
    // This part of the code fetches real data from TinyBird API
    const baseUrl = process.env.TINYBIRD_BASE_URL;
    const token = process.env.TINYBIRD_TOKEN;
    
    // This part of the code makes the API call with company filter
    const [productsResponse, shipmentsResponse] = await Promise.all([
      fetch(`${baseUrl}?token=${token}&limit=500&company_url=COMP002_packiyo`),
      fetch(`${baseUrl}?token=${token}&limit=500&company_url=COMP002_packiyo`)
    ]);
    
    // This part of the code processes and transforms the raw data
    const products = await productsResponse.json();
    const shipments = await shipmentsResponse.json();
    
    // This part of the code calculates page-specific metrics
    const metrics = calculatePageMetrics(products.data, shipments.data);
    
    // This part of the code calls OpenAI for insights (when needed)
    const insights = await generateAIInsights(metrics, 'gpt-4o-mini');
    
    return Response.json({ metrics, insights, rawData: { products, shipments } });
  } catch (error) {
    return Response.json({ error: 'Data fetch failed' }, { status: 500 });
  }
}
```

### 2. Data Hook Creation (`/client/hooks/use[Page]Data.ts`)
```typescript
export const use[Page]Data = (queryConfig = {}) => {
  return useQuery({
    queryKey: ['[page]-data'],
    queryFn: () => internalApi.get[Page]Data(),
    staleTime: queryConfig.staleTime || 5 * 60 * 1000,
    refetchInterval: queryConfig.refetchInterval || 30000,
    refetchOnWindowFocus: queryConfig.refetchOnWindowFocus || false,
    refetchOnMount: queryConfig.refetchOnMount || true,
    retry: queryConfig.retry || 3,
    retryDelay: queryConfig.retryDelay || 1000,
    gcTime: queryConfig.gcTime || 10 * 60 * 1000
  });
};
```

### 3. Service Integration (`/client/services/internalApi.ts`)
```typescript
class InternalApiService {
  async get[Page]Data() {
    const response = await fetch('/api/[page]-data');
    if (!response.ok) throw new Error('Failed to fetch [page] data');
    return response.json();
  }
}
```

---

## 📱 Page-by-Page Implementation

### 🏠 Dashboard Page
**File**: `/api/dashboard-data.ts`
**Real Data Sources**:
- **Total Products**: `products.data.length`
- **Active Shipments**: `shipments.data.filter(s => s.status === 'in_transit').length`
- **Revenue**: `shipments.data.reduce((sum, s) => sum + parseFloat(s.total_price || 0), 0)`
- **Cost Savings**: Calculated from shipping optimizations

**Key Metrics Calculation**:
```typescript
// This part of the code calculates dashboard KPIs from real data
const totalProducts = products.data?.length || 0;
const activeShipments = shipments.data?.filter(s => s.status === 'in_transit').length || 0;
const totalRevenue = shipments.data?.reduce((sum, s) => sum + parseFloat(s.total_price || 0), 0) || 0;
const avgOrderValue = totalRevenue / (shipments.data?.length || 1);
```

**AI Integration**: OpenAI generates insights based on calculated metrics

---

### 📈 Analytics Page
**File**: `/api/analytics-data.ts`
**Real Data Sources**:
- **Performance Metrics**: Shipping times, delivery rates, cost per shipment
- **Trend Analysis**: Month-over-month comparisons
- **Efficiency Scores**: Calculated from operational data

**Unique Implementation**:
```typescript
// This part of the code calculates analytics trends from shipment data
const monthlyData = groupShipmentsByMonth(shipments.data);
const performanceMetrics = calculatePerformanceMetrics(shipments.data);
const trendsAnalysis = calculateTrends(monthlyData);
```

---

### 📦 Orders Page
**File**: `/api/orders-data.ts`
**Real Data Sources**:
- **Order Status Distribution**: Real shipment statuses
- **Processing Times**: Calculated from timestamps
- **Inbound Intelligence**: AI analysis of incoming orders

**Status Mapping**:
```typescript
// This part of the code maps real shipment statuses to order categories
const statusMapping = {
  'pending': 'Processing',
  'in_transit': 'Shipped',
  'delivered': 'Delivered',
  'cancelled': 'Cancelled'
};
```

---

### 📊 Inventory Page
**File**: `/api/inventory-data.ts`
**Real Data Sources**:
- **Stock Levels**: Product quantities from TinyBird
- **Brand Performance**: Calculated by brand metrics
- **Low Stock Alerts**: Threshold-based calculations

**Brand Analysis**:
```typescript
// This part of the code analyzes brand performance from product data
const brandMetrics = products.data.reduce((acc, product) => {
  const brand = product.brand || 'Unknown';
  acc[brand] = acc[brand] || { products: 0, totalValue: 0 };
  acc[brand].products++;
  acc[brand].totalValue += parseFloat(product.price || 0);
  return acc;
}, {});
```

---

### 💰 Cost Management Page
**File**: `/api/cost-data.ts`
**Real Data Sources**:
- **Warehouse Costs**: Calculated per location
- **Supplier Performance**: Metrics from shipment data
- **Cost Center Analysis**: Grouped operational costs

**Cost Calculations**:
```typescript
// This part of the code calculates warehouse-specific costs
const warehouseCosts = shipments.data.reduce((acc, shipment) => {
  const warehouse = shipment.warehouse || 'Unknown';
  acc[warehouse] = acc[warehouse] || { orders: 0, totalCost: 0 };
  acc[warehouse].orders++;
  acc[warehouse].totalCost += parseFloat(shipment.shipping_cost || 0);
  return acc;
}, {});
```

---

### 🏭 Warehouses Page
**File**: `/api/warehouses-data.ts`
**Real Data Sources**:
- **Warehouse Performance**: Calculated from shipment data
- **AI Learning System**: Performance optimization suggestions
- **Budget Allocation**: Cost distribution analysis

**Performance Scoring**:
```typescript
// This part of the code calculates warehouse performance scores
const warehousePerformance = calculateWarehouseScores(shipments.data);
const performanceOptimization = await generateOptimizationSuggestions(warehousePerformance);
```

---

### 💡 Economic Intelligence Page
**File**: `/api/economic-intelligence.ts`
**Real Data Sources**:
- **6 KPI Metrics**: All calculated from real TinyBird data
- **Business Impact Analysis**: AI-generated based on real metrics
- **Risk Assessment**: Dynamic analysis of operational data

**KPI Calculations**:
```typescript
// This part of the code calculates economic KPIs from real operational data
const supplierPerformance = calculateSupplierMetrics(shipments.data);
const shippingCostImpact = calculateCostImpact(shipments.data);
const supplyChainHealth = calculateChainHealth(products.data, shipments.data);
const demandForecast = calculateDemandMetrics(shipments.data);
const inventoryTurnover = calculateTurnover(products.data, shipments.data);
const operationalEfficiency = calculateEfficiency(shipments.data);
```

**Dynamic Risk Generation**:
```typescript
// This part of the code generates dynamic business risks based on real metrics
function generateBusinessImpactAnalysis(kpis, products, shipments) {
  const keyRisks = [];
  const opportunityAreas = [];
  
  if (kpis.shippingCostImpact > 120) {
    keyRisks.push(`Inventory management challenges compound with ${kpis.shippingCostImpact}% shipping cost increases`);
  }
  
  if (kpis.supplierPerformance < 80) {
    opportunityAreas.push(`Supplier optimization could improve performance by ${100 - kpis.supplierPerformance}%`);
  }
  
  return { keyRisks, opportunityAreas };
}
```

---

### 📄 Reports Page
**File**: `/api/reports-data.ts` + `/api/report-insights.ts`
**Real Data Sources**:
- **Template-Specific Data**: Filtered real data based on report type
- **AI Insights**: OpenAI analysis of filtered datasets
- **PDF Generation**: Multi-page reports with real metrics

**Template Implementation**:
```typescript
// This part of the code filters data based on selected report template
function filterDataForTemplate(products, shipments, templateId) {
  switch (templateId) {
    case 'weekly-performance':
      return filterByWeeklyMetrics(products, shipments);
    case 'sla-compliance':
      return filterBySLAMetrics(shipments);
    case 'inventory-analysis':
      return filterByInventoryMetrics(products);
  }
}
```

**AI Insights Generation**:
```typescript
// This part of the code generates template-specific insights
export default async function handler(req: Request) {
  const { template, data } = await req.json();
  
  const prompt = `Analyze this ${template} data and provide actionable insights: ${JSON.stringify(data)}`;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500
  });
  
  return Response.json({ insight: response.choices[0].message.content });
}
```

---

### 🤖 AI Assistant Page
**File**: `/api/ai-chat.ts`
**Real Data Integration**:
- **Context Awareness**: Feeds real operational data into chat context
- **Data-Driven Responses**: AI references actual metrics in responses
- **Operational Insights**: Suggestions based on current data state

**Context Building**:
```typescript
// This part of the code builds AI context from real operational data
function buildAIContext(products, shipments) {
  return `Current operational context:
  - Total products: ${products.length}
  - Active shipments: ${shipments.filter(s => s.status === 'in_transit').length}
  - Recent performance metrics: ${calculateRecentMetrics(shipments)}`;
}
```

---

## 🔑 Key Implementation Secrets

### 1. **Company Filtering is Critical**
```typescript
// This part of the code ensures data isolation by company
&company_url=COMP002_packiyo
```
**Why**: Without this filter, you get mixed data from multiple companies

### 2. **Data Transformation Pipeline**
```typescript
// This part of the code transforms raw TinyBird data into usable metrics
Raw TinyBird Data → Calculate Metrics → Generate Insights → Display UI
```

### 3. **Error Handling Pattern**
```typescript
// This part of the code handles API failures gracefully
try {
  const data = await fetchRealData();
  return processData(data);
} catch (error) {
  console.error('Data fetch failed:', error);
  return fallbackData(); // Minimal fallback, never mock data
}
```

### 4. **OpenAI Integration Strategy**
```typescript
// This part of the code optimizes AI calls for cost and performance
- Default model: 'gpt-4o-mini' (cost efficiency)
- Max tokens: 500-1000 (prevent runaway costs)
- Context: Real metrics only (no mock data)
- Prompts: Specific and actionable
```

---

## 🚀 Deployment Configuration

### Environment Variables Required:
```bash
TINYBIRD_BASE_URL=your_tinybird_endpoint
TINYBIRD_TOKEN=your_tinybird_token
OPENAI_API_KEY=your_openai_key
WAREHOUSE_BASE_URL=your_warehouse_endpoint (if separate)
WAREHOUSE_TOKEN=your_warehouse_token (if separate)
```

### Vercel Function Limits:
- **Hobby Plan**: Max 12 serverless functions
- **Strategy**: Consolidate AI endpoints to stay under limit
- **Optimization**: Use single OpenAI endpoint for multiple purposes

---

## 🎨 UI Integration Pattern

### Data Display Strategy:
```typescript
// This part of the code displays real data with loading states
const { data, isLoading, error } = usePageData();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage />;
if (!data) return <NoDataMessage />;

return <RealDataDisplay data={data} />;
```

### No Mock Data Rule:
- **Never** show placeholder data
- **Always** fetch from real APIs
- **Gracefully** handle loading/error states
- **Display** "No data available" instead of fake metrics

---

## 🔄 Testing Your Implementation

### 1. **Verify API Endpoints**
```bash
curl "your-app.vercel.app/api/dashboard-data"
# Should return real TinyBird data, not mock data
```

### 2. **Check Data Flow**
```typescript
// This part of the code validates data integration
console.log('TinyBird Response:', response.data.length);
console.log('Calculated Metrics:', metrics);
console.log('AI Insights:', insights);
```

### 3. **Validate UI Display**
- All numbers should reflect real operational data
- AI insights should reference actual metrics
- No "Lorem ipsum" or placeholder content

---

## 📋 Brand Implementation Checklist

### ✅ **Setup Phase**
- [ ] Configure TinyBird endpoints for your brand
- [ ] Set up OpenAI API access
- [ ] Configure environment variables
- [ ] Test data connectivity

### ✅ **Development Phase**
- [ ] Implement API endpoints following the pattern
- [ ] Create data hooks for each page
- [ ] Build UI components with real data integration
- [ ] Add AI insights generation

### ✅ **Validation Phase**
- [ ] Verify all pages show real data
- [ ] Test AI responses reference actual metrics
- [ ] Confirm no mock data anywhere
- [ ] Validate error handling

### ✅ **Deployment Phase**
- [ ] Deploy to Vercel with environment variables
- [ ] Test production API endpoints
- [ ] Verify data flow end-to-end
- [ ] Monitor function count limits

---

## 🎯 Success Criteria

Your brand implementation is successful when:

1. **✅ Every page displays real operational data**
2. **✅ AI insights reference actual business metrics**
3. **✅ No mock or placeholder data exists**
4. **✅ Error states are handled gracefully**
5. **✅ Performance is optimized for cost efficiency**
6. **✅ Data updates reflect real business changes**

---

*This implementation guide represents the exact methodology used to build CargoCore's real data integration. Follow these patterns precisely to replicate the architecture for any brand.*
