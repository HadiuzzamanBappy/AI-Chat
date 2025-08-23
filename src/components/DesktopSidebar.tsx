// src/components/DesktopSidebar.tsx

import { Plus, MessageSquare, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useNavigate } from "react-router-dom";
import { type Conversation, type Agent } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DesktopSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  agents: Agent[]; // Use the dynamic list of agents from state
  selectedAgentId: string;
  onAgentChange: (agentId: string) => void;
}

export function DesktopSidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  agents, // Use the prop
  selectedAgentId,
  onAgentChange,
}: DesktopSidebarProps) {
  const navigate = useNavigate();

  const activeAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  type ListItemProps = {
    children: React.ReactNode;
    onClick: React.MouseEventHandler<HTMLDivElement>;
    isActive?: boolean;
  };

  const ListItem = ({ children, onClick, isActive = false }: ListItemProps) => (
    <div
      className={`group flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium cursor-pointer transition-all duration-200 ${isActive
          ? 'bg-sidebar-active text-sidebar-active-foreground border border-primary/20'
          : 'hover:bg-sidebar-hover text-sidebar-foreground border border-transparent hover:border-sidebar-border'
        }`}
      onClick={onClick}
    >
      {children}
    </div>
  );

  return (
    <div className="flex flex-col h-full w-80 min-w-80 max-w-80 bg-sidebar-background border-r border-sidebar-border shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-lg font-bold text-sidebar-foreground truncate">Open LLM Chat</h1>
        <p className="text-sm text-muted-foreground truncate">Your intelligent assistant</p>
      </div>

      {/* Agent Selection and New Chat */}
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Active Agent
          </label>
          <Select value={selectedAgentId} onValueChange={onAgentChange}>
            <SelectTrigger className="w-full border-sidebar-border bg-sidebar-background hover:bg-sidebar-hover rounded-lg">
              <SelectValue asChild>
                <div className="flex items-center gap-3 min-w-0">
                  {activeAgent && (
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-500 rounded-md flex items-center justify-center flex-shrink-0">
                      <activeAgent.icon className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <span className="font-medium truncate">{activeAgent ? activeAgent.name : "Select Agent"}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-sidebar-background border-sidebar-border">
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id} className="focus:bg-primary/10">
                  <div className="flex items-center gap-3 min-w-0 w-full">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-500 rounded-md flex items-center justify-center flex-shrink-0">
                      <agent.icon className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-medium truncate">{agent.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full justify-start bg-primary hover:bg-primary-hover text-primary-foreground border-0 rounded-lg h-11 font-medium shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-3" />
          New Chat
        </Button>
      </div>

      <Separator className="mx-4 bg-sidebar-border" />

      {/* Conversation History */}
      <ScrollArea className="flex-1 min-w-0">
        <div className="p-4">
          <h2 className="mb-4 px-2 text-xs font-semibold text-muted-foreground tracking-wide uppercase truncate">
            Recent Chats
          </h2>
          <div className="space-y-2">
            {conversations.length > 0 ? (
              conversations.map((conversation) => {
                const agent = agents.find(a => a.id === conversation.agentId) || { icon: MessageSquare };
                return (
                  <ListItem
                    key={conversation.id}
                    onClick={() => onSelectConversation(conversation.id)}
                    isActive={activeConversationId === conversation.id}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-6 h-6 bg-muted rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                        <agent.icon className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-sidebar-foreground block leading-relaxed line-clamp-2">
                          {conversation.title}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hover:bg-red-50 dark:hover:bg-red-900/20 mt-0.5"
                      onClick={(e) => { e.stopPropagation(); onDeleteConversation(conversation.id); }}
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                    </Button>
                  </ListItem>
                );
              })
            ) : (
              <div className="px-3 py-8 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Start a new chat to begin</p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <Separator className="mx-4 bg-sidebar-border" />

      {/* Footer - Theme Toggle and Settings */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-3 py-2 hover:bg-sidebar-hover rounded-lg text-sidebar-foreground transition-all duration-200"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Settings</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}