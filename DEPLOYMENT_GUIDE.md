# 🚀 CargoCore Vercel Deployment Guide

## 📋 Prerequisites

Before deploying, ensure you have:

1. **GitHub Account** - For repository hosting
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Required API Keys**:
   - TinyBird API Token
   - Warehouse API Token  
   - OpenAI API Key

## 🔧 Required Environment Variables

The following environment variables are **REQUIRED** for the application to work:

```
TINYBIRD_BASE_URL=https://api.us-east.aws.tinybird.co/v0/pipes/product_details_mv.json
TINYBIRD_TOKEN=your_tinybird_token_here
WAREHOUSE_BASE_URL=https://api.us-east.aws.tinybird.co/v0/pipes/inbound_shipments_details_mv.json
WAREHOUSE_TOKEN=your_warehouse_token_here
OPENAI_API_KEY=your_openai_api_key_here
```

**⚠️ SECURITY NOTE**: These are server-side variables (NO `VITE_` prefix) for security.

## 🌟 Method 1: Deploy New Separate Instance (Recommended)

### Step 1: Create New GitHub Repository

1. **Create a new repository on GitHub**:
   - Go to [github.com/new](https://github.com/new)
   - Name: `cargocore-production` (or your preferred name)
   - Set to **Public** or **Private** (your choice)
   - ✅ Check "Add a README file"
   - Click **"Create repository"**

### Step 2: Push Your Code to New Repository

```bash
# Navigate to your project directory
cd /Users/djpitia/CascadeProjects/VercelCargoCoreRepo/CargoCoreVercel

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit with a descriptive message
git commit -m "feat: Fixed data interface consistency between local and Vercel"

# Add your new GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/cargocore-production.git

# Push to main branch
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

1. **Visit Vercel Dashboard**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click **"Add New..."** → **"Project"**

2. **Import GitHub Repository**:
   - Select **"Import Git Repository"**
   - Find your `cargocore-production` repository
   - Click **"Import"**

3. **Configure Project Settings**:
   - **Project Name**: `cargocore-production` (or your preferred name)
   - **Framework Preset**: Vercel will auto-detect (should be "Vite")
   - **Root Directory**: Leave as `./` (default)
   - **Build Command**: `npm run build:client` (auto-detected from package.json)
   - **Output Directory**: `dist/spa` (auto-detected from vercel.json)

4. **Add Environment Variables**:
   Before clicking "Deploy", add these environment variables:

   | Variable Name | Value |
   |---------------|-------|
   | `TINYBIRD_BASE_URL` | `https://api.us-east.aws.tinybird.co/v0/pipes/product_details_mv.json` |
   | `TINYBIRD_TOKEN` | Your actual TinyBird token |
   | `WAREHOUSE_BASE_URL` | `https://api.us-east.aws.tinybird.co/v0/pipes/inbound_shipments_details_mv.json` |
   | `WAREHOUSE_TOKEN` | Your actual warehouse token |
   | `OPENAI_API_KEY` | Your actual OpenAI API key |

5. **Deploy**:
   - Click **"Deploy"**
   - Wait for deployment to complete (usually 2-3 minutes)
   - Your app will be live at `https://your-project-name.vercel.app`

## 🚀 Method 2: Manual Deployment via CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
# From your project directory
cd /Users/djpitia/CascadeProjects/VercelCargoCoreRepo/CargoCoreVercel

# Deploy to Vercel
vercel

# Follow the prompts:
# ? Set up and deploy "CargoCoreVercel"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] N
# ? What's your project's name? cargocore-production
# ? In which directory is your code located? ./

# Wait for deployment...
```

### Step 4: Add Environment Variables via CLI

```bash
# Add each environment variable
vercel env add TINYBIRD_BASE_URL
# When prompted, enter: https://api.us-east.aws.tinybird.co/v0/pipes/product_details_mv.json
# Select: Production, Preview, Development

vercel env add TINYBIRD_TOKEN
# When prompted, enter your actual TinyBird token
# Select: Production, Preview, Development

vercel env add WAREHOUSE_BASE_URL
# When prompted, enter: https://api.us-east.aws.tinybird.co/v0/pipes/inbound_shipments_details_mv.json
# Select: Production, Preview, Development

vercel env add WAREHOUSE_TOKEN
# When prompted, enter your actual warehouse token
# Select: Production, Preview, Development

vercel env add OPENAI_API_KEY
# When prompted, enter your actual OpenAI API key
# Select: Production, Preview, Development
```

### Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

## 🔍 Verification Steps

After deployment, verify your application:

1. **Check Deployment Status**:
   - Visit your Vercel dashboard
   - Ensure deployment status is "Ready"
   - No build errors in the logs

2. **Test the Application**:
   - Visit your deployed URL
   - Check that dashboard loads properly
   - Verify KPI values are showing correctly
   - Ensure insights are displaying
   - Test that data refreshes work

3. **Monitor Logs**:
   - In Vercel dashboard, go to **Functions** tab
   - Check the `/api/dashboard-data` function logs
   - Look for successful API calls to TinyBird and OpenAI

## 🔧 Configuration Files

Your project includes these important configuration files:

- **`vercel.json`**: Vercel deployment configuration
- **`package.json`**: Build scripts and dependencies
- **`vite.config.ts`**: Frontend build configuration
- **`api/dashboard-data.ts`**: Vercel serverless function

## 🐛 Troubleshooting

### Common Issues:

1. **Environment Variables Not Working**:
   - Ensure variables are added in Vercel dashboard
   - Check they don't have `VITE_` prefix
   - Redeploy after adding variables

2. **Build Failures**:
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation

3. **API Errors**:
   - Check function logs in Vercel dashboard
   - Verify API tokens are valid
   - Test API endpoints manually

4. **Data Not Loading**:
   - Check browser console for errors
   - Verify API function is deployed
   - Test `/api/dashboard-data` endpoint directly

## 📞 Support

If you encounter issues:

1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review build logs in Vercel dashboard
3. Test API endpoints in browser developer tools
4. Verify environment variables are correctly set

## 🎉 Success!

Once deployed successfully, your CargoCore application will be live and accessible at your Vercel URL with:

- ✅ Real-time dashboard data
- ✅ Consistent KPI calculations
- ✅ AI-powered insights
- ✅ Secure API key handling
- ✅ Automatic deployments on code changes
