/**
 * ThemeToggle Component
 * 
 * Provides theme switching functionality between light and dark modes.
 * Handles system preference detection, localStorage persistence, and
 * smooth visual transitions with animated icon changes.
 */

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

/**
 * Theme Toggle Button
 * 
 * Interactive button that toggles between light and dark themes with:
 * - System preference detection on initial load
 * - LocalStorage persistence for user choices
 * - Animated icon transitions and hover effects
 * - Accessibility support with proper labels
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Effect: Initialize theme based on saved preference or system default
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(useDark);
    document.documentElement.classList.toggle('dark', useDark);
  }, []);

  /** Handles theme switching with persistence and DOM class updates */
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Theme-appropriate icon with smooth transitions */}
      <div className="relative">
        {isDark ? (
          <Sun className="h-4 w-4 text-primary transition-transform duration-200 rotate-0" />
        ) : (
          <Moon className="h-4 w-4 text-gray-600 transition-transform duration-200 rotate-0" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}