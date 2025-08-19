// src/components/Sidebar.tsx

import { AnimatePresence, motion } from "framer-motion";
import { type Conversation } from "@/lib/types";
import { DesktopSidebar } from "./DesktopSidebar"; // Import the desktop version

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: (agentId?: string) => void;
  onSelectConversation: (id: string) => void;
  isMobile: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  isMobile,
  isOpen,
  onToggle,
  ...props // Pass the rest of the props down
}: SidebarProps) {
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" }
  };

  // If it's mobile, we use the slide-out panel with an overlay
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={onToggle}
            />
            <motion.div
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-80 z-50 md:hidden"
            >
              {/* The content inside is the DesktopSidebar */}
              <DesktopSidebar {...props} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // If it's not mobile, just render the desktop sidebar directly
  return <DesktopSidebar {...props} />;
}