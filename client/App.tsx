import "./global.css";
import "@/lib/env"; // Client environment validation (secure - no API keys)

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { WorkflowToastListener } from "./components/WorkflowToast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "next-themes";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ClerkProvider, SignedIn } from "@clerk/clerk-react";

console.log("🚀 CargoCore: App.tsx loading...");

// This part of the code configures Clerk authentication
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_YW1hemluZy1kb3J5LTY1LmNsZXJrLmFjY291bnRzLmRldiQ";

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

// Page imports
import Landing from "./pages/Landing";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
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
import { SmartRouter } from "./components/SmartRouter";
import { ProtectedRoute } from "./components/ProtectedRoute";

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
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <WorkflowToastListener />
            <BrowserRouter>
                <SmartRouter />
              <Routes>
                  {/* Public Landing & Contact Pages */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Protected Dashboard & App Pages */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <SignedIn>
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      </SignedIn>
                    } 
                  />
                  <Route 
                    path="/workflows" 
                    element={
                      <SignedIn>
                        <ProtectedRoute>
                          <Workflows />
                        </ProtectedRoute>
                      </SignedIn>
                    } 
                  />
                  <Route 
                    path="/analytics" 
                    element={
                      <SignedIn>
                        <ProtectedRoute>
                          <Analytics />
                        </ProtectedRoute>
                      </SignedIn>
                    } 
                  />
                  <Route 
                    path="/orders" 
                    element={
                      <SignedIn>
                        <ProtectedRoute>
                          <Orders />
                        </ProtectedRoute>
                      </SignedIn>
                    } 
                  />
                  <Route 
                    path="/inventory" 
                    element={
                      <SignedIn>
                        <ProtectedRoute>
                          <Inventory />
                        </ProtectedRoute>
                      </SignedIn>
                    } 
                  />
                  <Route 
                    path="/warehouses" 
                    element={
                      <SignedIn>
                        <ProtectedRoute>
                          <Warehouses />
                        </ProtectedRoute>
                      </SignedIn>
                    } 
                  />
                  <Route 
                    path="/cost-management" 
                    element={
                      <SignedIn>
                        <ProtectedRoute>
                          <CostManagement />
                        </ProtectedRoute>
                      </SignedIn>
                    } 
                  />
                <Route
                  path="/intelligence"
                    element={
                      <SignedIn>
                        <ProtectedRoute>
                          <EconomicIntelligence />
                        </ProtectedRoute>
                      </SignedIn>
                    }
                  />
                  <Route 
                    path="/reports" 
                    element={
                      <SignedIn>
                        <ProtectedRoute>
                          <Reports />
                        </ProtectedRoute>
                      </SignedIn>
                    } 
                  />
                  <Route 
                    path="/assistant" 
                    element={
                      <SignedIn>
                        <ProtectedRoute>
                          <AIAssistant />
                        </ProtectedRoute>
                      </SignedIn>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <SignedIn>
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      </SignedIn>
                    } 
                  />

                {/* 404 Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
            </SettingsProvider>
        </QueryClientProvider>
      </ThemeProvider>
      </ClerkProvider>
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
