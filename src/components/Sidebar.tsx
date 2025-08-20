// src/components/Sidebar.tsx

import { AnimatePresence, motion } from "framer-motion";
import { type Conversation, type Agent } from "@/lib/types"; // Import Agent type
import { DesktopSidebar } from "./DesktopSidebar";

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void; // Simplified `onNewChat`
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  isMobile: boolean;
  isOpen: boolean;
  onToggle: () => void;
  agents: Agent[]; // New prop
  selectedAgentId: string; // New prop
  onAgentChange: (agentId: string) => void; // New prop
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
              {/* Pass all props down to the DesktopSidebar */}
              <DesktopSidebar {...props} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // If not mobile, render the desktop sidebar directly with all props.
  return <DesktopSidebar {...props} />;
}