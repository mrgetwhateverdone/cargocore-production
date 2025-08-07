import "./global.css";
import "@/lib/env"; // Client environment validation (secure - no API keys)

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "next-themes";

console.log("🚀 CargoCore: App.tsx loading...");

// Page imports
import Index from "./pages/Index";
import Workflows from "./pages/Workflows";
import Analytics from "./pages/Analytics";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Warehouses from "./pages/Warehouses";
import CostManagement from "./pages/CostManagement";
import EconomicIntelligence from "./pages/EconomicIntelligence";
import Reports from "./pages/Reports";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Configure TanStack Query for real-time data
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 5 * 60 * 1000, // 5 minutes auto-refresh
      refetchOnWindowFocus: true,
      retry: 3,
      retryDelay: 1000,
    },
  },
});

const App = () => {
  console.log("🎯 CargoCore: App component rendering...");

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Main Dashboard */}
                <Route path="/" element={<Index />} />

                {/* All 11 CargoCore Pages */}
                <Route path="/workflows" element={<Workflows />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/warehouses" element={<Warehouses />} />
                <Route path="/cost-management" element={<CostManagement />} />
                <Route
                  path="/intelligence"
                  element={<EconomicIntelligence />}
                />
                <Route path="/reports" element={<Reports />} />
                <Route path="/assistant" element={<AIAssistant />} />
                <Route path="/settings" element={<Settings />} />

                {/* 404 Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

console.log("🔧 CargoCore: Setting up React root...");
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("❌ No root element found!");
} else {
  console.log("✅ Root element found, creating React app...");
  createRoot(rootElement).render(<App />);
  console.log("🎉 CargoCore: React app initialized!");
}
