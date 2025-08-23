/**
 * useAgents Hook
 * 
 * Manages AI agent configuration with localStorage persistence.
 * Handles CRUD operations for custom agents while preserving default agents.
 */

import { useState, useEffect } from 'react';
import { type Agent } from '@/lib/types';
import { AGENTS as DEFAULT_AGENTS } from '@/lib/agents';
import { Bot } from 'lucide-react';
import { toast } from "sonner";

/** Icon mapping for agent rehydration from localStorage */
const ICON_MAP = DEFAULT_AGENTS.reduce((acc: Record<string, React.ElementType>, agent) => {
  acc[agent.id] = agent.icon;
  return acc;
}, {});

/**
 * Agent Management Hook
 * 
 * Provides persistent agent storage with icon rehydration and CRUD operations.
 * Maintains backwards compatibility with default agents.
 */
export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Effect: Load agents from localStorage with icon rehydration
  useEffect(() => {
    try {
      const savedAgentsJSON = localStorage.getItem("chat_agents");
      let loadedAgents: Agent[];

      if (savedAgentsJSON) {
        const parsedAgents: Omit<Agent, 'icon'>[] = JSON.parse(savedAgentsJSON);
        
        // Rehydrate icons from ICON_MAP since functions can't be serialized
        loadedAgents = parsedAgents.map(savedAgent => ({
          ...savedAgent,
          icon: ICON_MAP[savedAgent.id] || Bot,
        }));
      } else {
        loadedAgents = DEFAULT_AGENTS;
      }
      setAgents(loadedAgents);
    } catch (e) {
      console.error("Failed to load agents from localStorage, falling back to defaults.", e);
      setAgents(DEFAULT_AGENTS);
    }
    setIsLoaded(true);
  }, []);

  // Effect: Save agents to localStorage (excluding non-serializable icons)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const agentsToSave = agents.map(({ icon, ...rest }) => rest);
      localStorage.setItem("chat_agents", JSON.stringify(agentsToSave));
    } catch (error) {
      console.error("Failed to save agents to localStorage", error);
    }
  }, [agents, isLoaded]);

  /** Creates new custom agent with default configuration */
  const addAgent = () => {
    const newAgent: Agent = {
      id: `custom-${Date.now()}`,
      name: 'New Custom Agent',
      description: 'Describe what this agent does.',
      systemPrompt: 'You are a helpful assistant.',
      icon: Bot,
    };
    setAgents(prev => [...prev, newAgent]);
    toast.success("New agent created!");
  };

  /** Updates existing agent properties (excluding id and icon) */
  const updateAgent = (agentId: string, updatedData: Partial<Omit<Agent, 'id' | 'icon'>>) => {
    setAgents(prev =>
      prev.map(agent =>
        agent.id === agentId ? { ...agent, ...updatedData } : agent
      )
    );
  };

  /** Deletes agent with confirmation (prevents deleting last agent) */
  const deleteAgent = (agentId: string) => {
    if (agents.length <= 1) {
      toast.error("Cannot delete the last agent.");
      return;
    }
    if (confirm("Are you sure you want to delete this agent?")) {
        setAgents(prev => prev.filter(agent => agent.id !== agentId));
        toast.success("Agent deleted.");
    }
  };

  return { agents, addAgent, updateAgent, deleteAgent };
}