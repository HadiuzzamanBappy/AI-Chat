/**
 * 404 Not Found Page Component
 * 
 * Modern, minimal error page that aligns with the AI Chat application theme.
 * Features animated elements and smooth navigation back to the main app.
 */

import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Modern 404 Error Page
 * 
 * Provides a themed, animated 404 experience with:
 * - Consistent design system integration
 * - Smooth animations and micro-interactions
 * - Multiple navigation options
 * - Error logging for debugging
 */
const NotFound = () => {
  const location = useLocation();

  /** Log 404 errors for debugging and analytics */
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated 404 Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          {/* Main 404 Text */}
          <motion.h1 
            className="text-8xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            404
          </motion.h1>
          
          {/* Floating Chat Bubble */}
          <motion.div
            className="absolute -top-4 -right-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
          >
            <MessageSquare className="w-6 h-6 text-primary" />
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-3"
        >
          <h2 className="text-2xl font-semibold text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back to chatting with AI!
          </p>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button asChild className="gap-2">
            <Link to="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="gap-2">
            <Link to="/" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Link>
          </Button>
        </motion.div>

        {/* Subtle Animation Elements */}
        <motion.div
          className="flex justify-center items-center gap-2 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary/30 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.8, 0.3] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: i * 0.2 
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
