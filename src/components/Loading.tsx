/**
 * Modern Loading Components
 * 
 * Collection of minimal, modern loading indicators and pages
 * with smooth animations and theme integration.
 */

import { motion } from "framer-motion";
import { MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import React from "react";

/** Props for customizable loading spinner */
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  variant?: "default" | "minimal" | "dots";
}

/** Props for full-page loading */
interface LoadingPageProps {
  title?: string;
  subtitle?: string;
  variant?: "default" | "brand" | "minimal";
  className?: string;
}

/**
 * Modern Loading Spinner Component
 * 
 * Customizable spinner with multiple variants and sizes
 */
export const LoadingSpinner = ({ 
  size = "md", 
  className, 
  text, 
  variant = "default" 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              "bg-primary rounded-full",
              size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-3 h-3"
            )}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
        {text && (
          <span className={cn("text-muted-foreground ml-3", textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center space-x-3", className)}>
        <div
          className={cn(
            "border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin",
            sizeClasses[size]
          )}
        />
        {text && (
          <span className={cn("text-muted-foreground", textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <span className={cn("text-muted-foreground", textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );
};

/**
 * Modern Full-Page Loading Component
 * 
 * Beautiful full-screen loading with brand integration
 */
export const LoadingPage = ({ 
  title = "Loading", 
  subtitle,
  variant = "default",
  className 
}: LoadingPageProps) => {
  if (variant === "minimal") {
    return (
      <div className={cn(
        "min-h-screen bg-background flex items-center justify-center",
        className
      )}>
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" variant="minimal" />
          <div className="text-center space-y-1">
            <h2 className="text-lg font-medium text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "brand") {
    return (
      <div className={cn(
        "min-h-screen bg-background flex items-center justify-center p-4",
        className
      )}>
        <div className="max-w-md w-full text-center space-y-8">
          {/* Animated Brand Logo */}
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              duration: 0.8
            }}
          >
            <MessageSquare className="w-10 h-10 text-primary" />
          </motion.div>

          {/* Loading Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground">{subtitle}</p>
              )}
            </div>

            {/* Modern Loading Animation */}
            <div className="flex justify-center">
              <LoadingSpinner size="lg" variant="dots" />
            </div>
          </motion.div>

          {/* Subtle Progress Indicator */}
          <motion.div 
            className="w-full bg-muted rounded-full h-1 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn(
      "min-h-screen bg-background flex items-center justify-center p-4",
      className
    )}>
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
};

/**
 * Inline Loading Component
 * 
 * For smaller loading states within components
 */
export const InlineLoading = ({ 
  text = "Loading...",
  size = "md",
  variant = "default"
}: Omit<LoadingSpinnerProps, "className">) => {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size={size} text={text} variant={variant} />
    </div>
  );
};

/**
 * Card Loading Skeleton
 * 
 * For loading states in card components
 */
export const CardLoading = () => {
  return (
    <div className="p-6 space-y-4">
      <div className="animate-pulse space-y-4">
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-muted h-10 w-10"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-3 bg-muted rounded w-1/3"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Loading Button Component
 * 
 * Button with integrated loading state
 */
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ 
    children, 
    isLoading = false, 
    loadingText,
    className,
    disabled,
    ...props 
  }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        className={className}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full opacity-75"
            />
            {loadingText || "Loading..."}
          </div>
        ) : (
          children
        )}
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";

// Export all components as default
export default {
  LoadingSpinner,
  LoadingPage,
  InlineLoading,
  CardLoading,
  LoadingButton
};
