/**
 * Utility Functions
 * 
 * Common utility functions for class name merging, conditional styling,
 * and other helper functions used throughout the application.
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges Tailwind CSS class names intelligently
 * 
 * Uses clsx for conditional class handling and tailwind-merge
 * for proper Tailwind class deduplication and conflict resolution.
 * 
 * @param inputs - Class values (strings, conditionals, arrays, objects)
 * @returns Merged and optimized class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
