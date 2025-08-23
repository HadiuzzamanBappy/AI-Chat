/**
 * Main Application Component
 * 
 * Root component that sets up the application's routing, global providers,
 * and notification systems. Configures React Query for data management
 * and provides UI context for tooltips and toast notifications.
 */

import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingPage } from "@/components/Loading";

// Lazy load page components for better code splitting
const AppEntry = lazy(() => import("./pages/AppEntry"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

/** React Query client for server state management and caching */
const queryClient = new QueryClient();

/**
 * Modern loading fallback component for lazy-loaded routes
 * Uses the new LoadingPage component for consistent branding
 */
const PageLoader = () => (
  <LoadingPage 
    title="Loading page..."
    subtitle="Please wait while we prepare your experience"
    variant="brand"
  />
);

/**
 * Root application component with routing and global providers
 * 
 * Provides:
 * - React Query for API state management
 * - Tooltip context for interactive elements
 * - Toast notification systems (both shadcn/ui and Sonner)
 * - Client-side routing with protected and public routes
 * - Lazy loading with Suspense for optimal performance
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Main application entry point */}
            <Route path="/" element={<AppEntry />} />
            {/* Authentication routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Application settings */}
            <Route path="/settings" element={<Settings />} />
            {/* Catch-all route for 404 handling - must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
