import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 3000, // or 8080 if you prefer
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Increase chunk size warning limit to 1MB (1000 kB)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // Externalize problematic Node.js dependencies for browser
      external: [
        '@google-cloud/vision',
        'fs', 'path', 'os', 'crypto', 'stream', 'net', 'http', 'https', 
        'http2', 'zlib', 'tls', 'util', 'events', 'querystring', 'dns',
        'child_process', 'worker_threads'
      ],
      output: {
        // Manual chunk splitting for better caching and performance
        manualChunks: {
          // React core libraries
          'react-vendor': ['react', 'react-dom'],
          
          // Routing and state management
          'routing': ['react-router-dom'],
          'state-management': ['@tanstack/react-query'],
          
          // UI component libraries
          'ui-core': [
            '@radix-ui/react-slot',
            '@radix-ui/react-separator',
            '@radix-ui/react-label',
            'class-variance-authority',
            'clsx',
            'tailwind-merge'
          ],
          
          // Form and dialog components
          'ui-forms': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          
          // Complex UI components
          'ui-complex': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-tabs',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-scroll-area',
            'cmdk',
            'vaul'
          ],
          
          // Animation and motion libraries
          'animations': ['framer-motion'],
          
          // Content rendering libraries
          'content': [
            'react-markdown',
            'remark-gfm',
            'react-syntax-highlighter'
          ],
          
          // Date and utility libraries
          'utilities': [
            'date-fns',
            'lucide-react',
            'next-themes',
            'sonner'
          ],
          
          // Carousel and interactive components
          'interactive': [
            'embla-carousel-react'
          ]
        }
      }
    },
    // Additional build optimizations
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
    minify: 'terser' // Use terser for better minification
  }
});
