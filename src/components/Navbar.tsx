/**
 * Navbar Component
 * 
 * Mobile-responsive navigation header with sidebar toggle functionality.
 * Provides consistent branding and navigation control for smaller screens
 * while remaining hidden on desktop layouts where the sidebar is persistent.
 */

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Component props interface for navigation configuration */
interface NavbarProps {
  /** Callback function to toggle sidebar visibility */
  onToggleSidebar?: () => void;
  /** Customizable title displayed in the navbar */
  title?: string;
}

/**
 * Mobile Navigation Header
 * 
 * Sticky navigation bar that appears only on mobile devices (hidden on md+ screens).
 * Features a hamburger menu button for sidebar control and customizable app title.
 * Uses backdrop blur for modern visual effect when content scrolls behind.
 */
export function Navbar({ onToggleSidebar, title = "AI Chat" }: NavbarProps) {
  return (
    <nav className="bg-background/95 border-b border-border px-4 py-3 md:hidden sticky top-0 z-50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 whitespace-nowrap w-full">
          {/* Hamburger menu button for sidebar toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="h-9 w-9 p-0 rounded-lg hover:bg-muted" 
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          {/* App title with responsive text truncation */}
          <div className="flex items-center space-x-3 min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">
              {title}
            </h1>
          </div>
        </div>
      </div>
    </nav>
  );
}