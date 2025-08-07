/**
 * DEPRECATED: This file has been moved to server-side for security
 *
 * All TinyBird API calls now go through secure server endpoints:
 * - /api/dashboard-data (complete dashboard data)
 * - /api/products (products only)
 * - /api/shipments (shipments only)
 *
 * Use client/services/internalApi.ts for all data fetching
 *
 * This file is kept for reference but should not be imported
 */

export const tinybirdApi = {
  deprecated: true,
  message:
    "Use internalApi.ts instead - all TinyBird calls are now server-side for security",
};
