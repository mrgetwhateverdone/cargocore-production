# CargoCore - 3PL Operations Platform

A sophisticated, enterprise-grade 3PL (Third-Party Logistics) operations platform with real-time data integration, AI-powered insights, and advanced analytics for warehouse management and supply chain optimization.

## 🚀 Quick Start

### Local Development

1. **Clone the repository**

   ```bash
   git clone your-repo-url
   cd cargocore
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Fill in your actual API keys and endpoints in .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🌐 Vercel Deployment

### Automatic Deployment (Recommended)

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial CargoCore setup"
   git push origin main
   ```

2. **Connect to Vercel**

   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will detect the configuration automatically

3. **Set Environment Variables in Vercel**
   In your Vercel project dashboard, add these environment variables:

   ```
   TINYBIRD_BASE_URL=https://api.us-east.aws.tinybird.co/v0/pipes/product_details_mv.json
   TINYBIRD_TOKEN=your_tinybird_token
   WAREHOUSE_BASE_URL=https://api.us-east.aws.tinybird.co/v0/pipes/inbound_shipments_details_mv.json
   WAREHOUSE_TOKEN=your_warehouse_token
   OPENAI_API_KEY=your_openai_api_key
   COMPANY_URL=COMP002_packiyo
   WAREHOUSE_COMPANY_URL=COMP002_3PL
   BRAND_ID=your_brand_id
   ```

   **IMPORTANT:** Use server-side variables (NO `VITE_` prefix) for security

4. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be live at `https://your-app.vercel.app`

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables (server-side only for security)
vercel env add TINYBIRD_BASE_URL
vercel env add TINYBIRD_TOKEN
vercel env add WAREHOUSE_BASE_URL
vercel env add WAREHOUSE_TOKEN
vercel env add OPENAI_API_KEY
vercel env add COMPANY_URL
vercel env add WAREHOUSE_COMPANY_URL
vercel env add BRAND_ID

# Redeploy with environment variables
vercel --prod
```

## 📊 Features

### ✅ Phase 1: Foundation (Complete)

- Professional layout with collapsible sidebar
- 11-page navigation structure
- CargoCore branding and styling
- Mobile-responsive design
- Secure environment variable handling

### 🚧 Phase 2: Data Integration (Next)

- Real-time TinyBird API integration
- OpenAI insights generation
- Dashboard KPIs with live data
- Error handling and loading states

### 🔮 Phase 3: Advanced Dashboard (Next)

- Warehouse inventory visualization
- Anomaly detection system
- AI-powered operational insights
- Real-time data refresh

## 🔧 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + Custom CargoCore theme
- **State Management**: TanStack Query
- **Routing**: React Router 6
- **Deployment**: Vercel
- **APIs**: TinyBird + OpenAI

## 🎨 Brand Colors

- **Primary Blue**: `#2563eb` - Trust & reliability
- **Secondary Blue**: `#1d4ed8` - Depth & emphasis
- **Light Blue**: `#dbeafe` - Backgrounds & accents
- **Success Green**: `#16a34a` - Operational success
- **Warning Orange**: `#ea580c` - Attention needed
- **Critical Red**: `#dc2626` - Urgent issues

## 🔒 Security

- Environment variables are properly secured
- API keys never committed to repository
- Production security headers configured
- CORS and XSS protection enabled

## 📁 Project Structure

```
client/                   # React frontend
├── components/
│   ├── layout/          # Layout components (Sidebar, Header)
│   └── ui/              # Reusable UI components
├── pages/               # Page components (11 routes)
├── lib/                 # Utilities and environment validation
��── global.css           # CargoCore theme and styling

server/                   # Express backend (for future API needs)
shared/                   # Shared TypeScript interfaces
```

## ��� Next Steps

1. **Phase 2**: Implement real-time data integration
2. **Phase 3**: Build comprehensive dashboard with insights
3. **Phase 4**: Add advanced features (cost management, reports)
4. **Phase 5**: Production optimization and monitoring

---

**CargoCore** - Professional Precision in 3PL Operations
