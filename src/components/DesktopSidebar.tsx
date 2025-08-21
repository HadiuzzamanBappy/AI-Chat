// src/components/DesktopSidebar.tsx

import { Plus, User, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useNavigate } from "react-router-dom";
import { type Conversation, type Agent } from "@/lib/types"; // Import Agent
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
      className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium cursor-pointer transition-colors ${
        isActive ? 'bg-sidebar-active text-sidebar-active-foreground' : 'hover:bg-sidebar-hover text-sidebar-foreground'
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-sidebar-background border-r border-sidebar-border">
      <div className="p-4">
        <h1 className="text-xl font-semibold text-foreground">Open LLM</h1>
        <p className="text-sm text-muted-foreground">Personal workspace</p>
      </div>

      <div className="p-4 space-y-2">
        <div className="space-y-1">
          <label className="px-1 text-xs font-semibold text-muted-foreground">ACTIVE AGENT</label>
          <Select value={selectedAgentId} onValueChange={onAgentChange}>
            <SelectTrigger className="w-full">
              <SelectValue asChild>
                <div className="flex items-center gap-2">
                  {activeAgent && <activeAgent.icon className="h-4 w-4" />}
                  <span>{activeAgent ? activeAgent.name : "Select Agent"}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-secondary">
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex items-center gap-2">
                    <agent.icon className="h-4 w-4" />
                    <span>{agent.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onNewChat} className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary-hover">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      <Separator className="mx-4" />

      <ScrollArea className="flex-1">
        <div className="p-4">
          <h2 className="mb-2 px-3 text-xs font-semibold text-muted-foreground tracking-wider uppercase">History</h2>
          <div className="space-y-1">
            {conversations.length > 0 ? (
              conversations.map((conversation) => {
                // --- THE FIX: Use the `agents` prop from state, not the static `AGENTS` import ---
                const agent = agents.find(a => a.id === conversation.agentId) || { icon: MessageSquare };
                return (
                  <ListItem
                    key={conversation.id}
                    onClick={() => onSelectConversation(conversation.id)}
                    isActive={activeConversationId === conversation.id}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <agent.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{conversation.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      onClick={(e) => { e.stopPropagation(); onDeleteConversation(conversation.id); }}
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </ListItem>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">No chat history yet.</div>
            )}
          </div>
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4 flex items-center justify-between gap-2">
        <Button variant="ghost" className="flex-1 justify-start text-left h-auto py-2" onClick={() => navigate('/settings')}>
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