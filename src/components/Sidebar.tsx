/**
 * Sidebar Component
 * 
 * Responsive sidebar wrapper that handles mobile and desktop display modes.
 * Provides smooth animations for mobile slide-in/out behavior while maintaining
 * persistent display on desktop. Acts as a container for DesktopSidebar content.
 */

import { AnimatePresence, motion } from "framer-motion";
import { type Conversation, type Agent } from "@/lib/types";
import { DesktopSidebar } from "./DesktopSidebar";

/** Component props interface for sidebar configuration and event handling */
interface SidebarProps {
  /** List of conversation history items */
  conversations: Conversation[];
  /** Currently active conversation identifier */
  activeConversationId: string | null;
  /** Callback to create a new chat session */
  onNewChat: () => void;
  /** Callback when selecting an existing conversation */
  onSelectConversation: (id: string) => void;
  /** Callback to delete a conversation */
  onDeleteConversation: (id: string) => void;
  /** Whether the current device is mobile */
  isMobile: boolean;
  /** Mobile sidebar visibility state */
  isOpen: boolean;
  /** Callback to toggle mobile sidebar visibility */
  onToggle: () => void;
  /** Available AI agents for selection */
  agents: Agent[];
  /** Currently selected agent identifier */
  selectedAgentId: string;
  /** Callback when agent selection changes */
  onAgentChange: (agentId: string) => void;
}

/**
 * Responsive Sidebar Implementation
 * 
 * Handles both mobile and desktop sidebar presentation with smooth animations.
 * On mobile: Provides slide-in overlay with backdrop blur
 * On desktop: Renders persistent sidebar without animations
 */
export function Sidebar({
  isMobile,
  isOpen,
  onToggle,
  ...props // Spread remaining props to DesktopSidebar
}: SidebarProps) {
  // Animation configurations for smooth mobile transitions
  const sidebarVariants = {
    open: { 
      x: 0,
    },
    closed: { 
      x: "-100%",
    }
  };

  const backdropVariants = {
    open: { 
      opacity: 1,
    },
    closed: { 
      opacity: 0,
    }
  };

  // Mobile sidebar with overlay and animations
  if (isMobile) {
    return (
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            {/* Backdrop overlay with blur effect for focus */}
            <motion.div
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ 
                duration: 0.3,
                ease: [0.4, 0.0, 0.2, 1]
              }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              onClick={onToggle}
            />
            {/* Animated sidebar panel with spring physics */}
            <motion.div
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="fixed left-0 top-0 bottom-0 w-80 z-50 md:hidden shadow-2xl shadow-black/20 backdrop-blur-xl"
            >
              {/* Delegate content rendering to DesktopSidebar */}
              <DesktopSidebar {...props} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: Direct rendering without mobile-specific animations
  return <DesktopSidebar {...props} />;
}