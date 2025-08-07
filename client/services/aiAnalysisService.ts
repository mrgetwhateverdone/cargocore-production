/**
 * DEPRECATED: This file has been moved to server-side for security
 *
 * All OpenAI API calls now go through secure server endpoints:
 * - /api/insights (AI insight generation)
 * - /api/dashboard-data (includes AI insights)
 *
 * Use client/services/internalApi.ts for all AI functionality
 *
 * This file is kept for reference but should not be imported
 */

export const aiAnalysisService = {
  deprecated: true,
  message:
    "Use internalApi.ts instead - all OpenAI calls are now server-side for security",
};
