/**
 * CARGOCORE API CONFIGURATION
 * 
 * This part of the code centralizes all API limits and endpoints for consistent data fetching
 * Eliminates hardcoded limits across 15+ API files and provides single source of truth
 */

// Standardized API limits for TinyBird endpoints
export const API_LIMITS = {
  // Products endpoint - balanced performance vs data completeness
  PRODUCTS: 500,
  
  // Shipments endpoint - higher limit for comprehensive order analysis  
  SHIPMENTS: 500,
  
  // Reports endpoint - maximum data for comprehensive reporting
  REPORTS: 1000,
  
  // Development/testing limits (faster responses for dev)
  DEV_PRODUCTS: 100,
  DEV_SHIPMENTS: 150,
} as const;

// Environment-aware limit selection
export function getApiLimits() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    products: isDevelopment ? API_LIMITS.DEV_PRODUCTS : API_LIMITS.PRODUCTS,
    shipments: isDevelopment ? API_LIMITS.DEV_SHIPMENTS : API_LIMITS.SHIPMENTS,
    reports: API_LIMITS.REPORTS,
  };
}

// Standardized URL builders
export function buildProductsUrl(baseUrl: string, token: string, companyUrl: string, brandId?: string): string {
  const limits = getApiLimits();
  let url = `${baseUrl}?token=${token}&limit=${limits.products}&company_url=${companyUrl}`;
  
  if (brandId) {
    url += `&brand_id=${brandId}`;
  }
  
  return url;
}

export function buildShipmentsUrl(baseUrl: string, token: string, companyUrl: string): string {
  const limits = getApiLimits();
  return `${baseUrl}?token=${token}&limit=${limits.shipments}&company_url=${companyUrl}`;
}

export function buildReportsUrl(baseUrl: string, token: string, companyUrl: string): string {
  const limits = getApiLimits();
  return `${baseUrl}?token=${token}&limit=${limits.reports}&company_url=${companyUrl}`;
}

// Company configuration (will be moved to env vars in next phase)
export const COMPANY_CONFIG = {
  PRODUCTS_COMPANY: process.env.COMPANY_PRODUCTS_URL || 'COMP002_packiyo',
  WAREHOUSE_COMPANY: process.env.COMPANY_WAREHOUSE_URL || 'COMP002_3PL',
  DEFAULT_BRAND_ID: process.env.DEFAULT_BRAND_ID || '561bdd14-630a-4a0c-9493-50a513bbb946',
} as const;
