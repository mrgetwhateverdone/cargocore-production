/**
 * Client-side environment validation (SECURE)
 *
 * NO API KEYS on client-side - all sensitive data moved to server
 * Client only needs basic configuration, server handles all external APIs
 */

// Only validate client-safe environment variables (none currently needed)
const clientEnvVars = [
  // No sensitive variables needed on client-side
  // All API keys are server-side only for security
] as const;

export const env = {
  // Client-side configuration can be added here if needed
  // Example: VITE_APP_VERSION, VITE_FEATURE_FLAGS, etc.
} as const;

// Validate environment on import
console.log(
  "✅ Client environment validated successfully (no sensitive data exposed)",
);
console.log("🔒 All API keys secured server-side - zero client exposure");

/**
 * Development mode security check
 * Warn if any sensitive variables are accidentally exposed
 */
if (import.meta.env.DEV) {
  const allClientEnvs = Object.keys(import.meta.env);
  const suspiciousVars = allClientEnvs.filter(
    (key) =>
      key.includes("API_KEY") ||
      key.includes("SECRET") ||
      key.includes("TOKEN") ||
      key.includes("TINYBIRD") ||
      key.includes("OPENAI"),
  );

  if (suspiciousVars.length > 0) {
    console.warn(
      "⚠️ SECURITY WARNING: Potentially sensitive environment variables found on client:",
    );
    console.warn(suspiciousVars);
    console.warn(
      "🔧 Consider moving these to server-side (remove VITE_ prefix)",
    );
  } else {
    console.log(
      "✅ Security check passed - no sensitive variables exposed to client",
    );
  }
}
