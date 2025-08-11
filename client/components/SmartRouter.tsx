import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSettingsIntegration } from "@/hooks/useSettingsIntegration";

/**
 * This part of the code handles intelligent routing based on user settings
 * Redirects to user's preferred default page when accessing root path
 */
export function SmartRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getDefaultPage } = useSettingsIntegration();

  useEffect(() => {
    // This part of the code redirects to user's default page only on root path
    if (location.pathname === "/") {
      const defaultPage = getDefaultPage();
      
      // This part of the code maps setting values to actual routes
      const pageRoutes: Record<string, string> = {
        'dashboard': '/',
        'orders': '/orders',
        'inventory': '/inventory',
        'analytics': '/analytics',
        'warehouses': '/warehouses',
        'cost_management': '/cost-management'
      };

      const targetRoute = pageRoutes[defaultPage];
      
      // Only redirect if it's not the dashboard (which is already the current route)
      if (targetRoute && targetRoute !== "/" && defaultPage !== 'dashboard') {
        console.log(`🎯 Smart Router: Redirecting to user's default page: ${targetRoute}`);
        navigate(targetRoute, { replace: true });
      }
    }
  }, [location.pathname, navigate, getDefaultPage]);

  return null; // This component doesn't render anything
}
