import { Plus, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { type Conversation } from "@/lib/types";
import { AGENTS } from "@/lib/agents";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface DesktopSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: (agentId?: string) => void;
  onSelectConversation: (id: string) => void;
}

export function DesktopSidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
}: DesktopSidebarProps) {
  const navigate = useNavigate();

  interface ListItemProps {
    children: React.ReactNode;
    onClick: () => void;
    isActive?: boolean;
  }

  const ListItem = ({ children, onClick, isActive = false }: ListItemProps) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium cursor-pointer transition-colors ${
        isActive
          ? 'bg-sidebar-active text-sidebar-active-foreground'
          : 'hover:bg-sidebar-hover text-sidebar-foreground'
      }`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
  return (
    <div className="flex flex-col h-full bg-sidebar-background border-r border-sidebar-border">
      {/* Header Section */}
      <div className="p-4">
        <h1 className="text-xl font-semibold text-foreground">Open LLM</h1>
        <p className="text-sm text-muted-foreground">Personal workspace</p>
      </div>

      {/* Primary Actions */}
      <div className="p-4 space-y-2">
        <Button
          onClick={() => onNewChat()} // New blank chat
          className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      <Separator className="mx-4" />

      {/* Main Content Area with Scrolling */}
      <ScrollArea className="flex-1">
        {/* Agents List */}
        <div className="p-4">
          <h2 className="mb-2 px-3 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Agents
          </h2>
          <div className="space-y-1">
            {AGENTS.map((agent) => (
              <ListItem key={agent.id} onClick={() => onNewChat(agent.id)}>
                <agent.icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{agent.name}</span>
              </ListItem>
            ))}
          </div>
        </div>

        <Separator className="mx-4" />

        {/* History List */}
        <div className="p-4">
          <h2 className="mb-2 px-3 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            History
          </h2>
          <div className="space-y-1">
            {conversations.length > 0 ? (
              // If there are conversations, map them out
              conversations.map((conversation) => {
                const agent = AGENTS.find(a => a.id === conversation.agentId) || { icon: MessageSquare };
                return (
                  <ListItem
                    key={conversation.id}
                    onClick={() => onSelectConversation(conversation.id)}
                    isActive={activeConversationId === conversation.id}
                  >
                    <agent.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{conversation.title}</span>
                  </ListItem>
                );
              })
            ) : (
              // If there are NO conversations, show the empty state message
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No chat history yet.
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <Separator />

      {/* Footer Section */}
      <div className="p-4 flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="flex-1 justify-start text-left h-auto py-2"
          onClick={() => navigate('/settings')}
        >
          <div className="flex items-center gap-3">
             <User className="h-5 w-5 rounded-full" />
             <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Hadiuzzaman Bappy</span>
                <span className="text-xs text-muted-foreground">Settings & Knowledge</span>
             </div>
          </div>
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );
}