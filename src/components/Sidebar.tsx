import { Plus, MessageSquare, Settings, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function Sidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  isMobile = false,
  isOpen = true,
  onToggle
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar-background border-r border-sidebar-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">ChatGPT</h2>
        {isMobile && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button
          onClick={onNewChat}
          className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group rounded-lg p-3 cursor-pointer transition-colors ${
                activeConversationId === conversation.id
                  ? 'bg-sidebar-active text-sidebar-active-foreground'
                  : 'hover:bg-sidebar-hover text-sidebar-foreground'
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {conversation.title}
                  </p>
                  <p className="text-xs opacity-70 truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4 space-y-2">
        <Button
          variant="secondary"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-hover"
          onClick={() => navigate('/settings')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            className="flex-1 justify-start mr-2 text-sidebar-foreground hover:bg-sidebar-hover"
            onClick={() => navigate('/login')}
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={onToggle}
            />
            <motion.div
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-80 z-50"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      variants={sidebarVariants}
      initial={false}
      animate={isOpen ? "open" : "closed"}
      transition={{ type: "tween", duration: 0.3 }}
      className="w-80 h-full"
    >
      <SidebarContent />
    </motion.div>
  );
}