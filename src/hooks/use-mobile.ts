/**
 * useIsMobile Hook
 * 
 * Responsive breakpoint detection hook that tracks mobile/desktop state
 * using matchMedia API for consistent cross-component mobile behavior.
 */

import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Mobile Detection Hook
 * 
 * Returns boolean indicating if viewport is below mobile breakpoint (768px).
 * Uses matchMedia for efficient responsive tracking with event listeners.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  // Effect: Set up responsive breakpoint monitoring
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    /** Updates mobile state on viewport change */
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Set initial state and add listener
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
