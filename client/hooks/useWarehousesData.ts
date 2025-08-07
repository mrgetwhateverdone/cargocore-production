import { useState, useEffect } from "react";
import type { WarehousesData, APIError } from "@/types/api";

/**
 * This part of the code creates a custom hook for warehouse data management
 * Following the same patterns as useAnalyticsData and useDashboardData for consistency
 */

interface UseWarehousesDataReturn {
  data: WarehousesData | null;
  isLoading: boolean;
  error: APIError | null;
  refetch: () => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export function useWarehousesData(): UseWarehousesDataReturn {
  const [data, setData] = useState<WarehousesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<APIError | null>(null);

  const fetchWarehousesData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🏭 Client: Fetching warehouse data from API...");

      // This part of the code fetches comprehensive warehouse data from the API
      const response = await fetch(`${API_BASE_URL}/api/warehouses-data`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch warehouse data: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "API returned unsuccessful response");
      }

      console.log("✅ Client: Warehouse data loaded successfully");
      console.log("📊 Warehouses:", result.data.warehouses.length);
      console.log("🔍 Insights:", result.data.insights.length);
      console.log("💡 Optimizations:", result.data.optimizations.length);

      setData(result.data);
    } catch (err) {
      console.error("❌ Client: Warehouse data fetch failed:", err);
      setError({
        message: err instanceof Error ? err.message : "Unknown error occurred",
        status: err instanceof Error && "status" in err ? (err as any).status : undefined,
        endpoint: "/api/warehouses-data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    await fetchWarehousesData();
  };

  // This part of the code handles initial data loading on component mount
  useEffect(() => {
    fetchWarehousesData();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
