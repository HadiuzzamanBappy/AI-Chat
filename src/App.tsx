/**
 * Main Application Component
 * 
 * Root component that sets up the application's routing, global providers,
 * and notification systems. Configures React Query for data management
 * and provides UI context for tooltips and toast notifications.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppEntry from "./pages/AppEntry";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

/** React Query client for server state management and caching */
const queryClient = new QueryClient();

/**
 * Root application component with routing and global providers
 * 
 * Provides:
 * - React Query for API state management
 * - Tooltip context for interactive elements
 * - Toast notification systems (both shadcn/ui and Sonner)
 * - Client-side routing with protected and public routes
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
