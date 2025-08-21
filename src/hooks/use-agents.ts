import { useState, useEffect } from 'react';
import { type Agent } from '@/lib/types'; // Uses your updated Agent type
import { AGENTS as DEFAULT_AGENTS } from '@/lib/agents';
import { Bot } from 'lucide-react';
import { toast } from "sonner";

// Create a map of default icons for easy "rehydration."
// --- THE FIX: Explicitly type the accumulator ('acc') in the reduce function ---
const ICON_MAP = DEFAULT_AGENTS.reduce((acc: Record<string, React.ElementType>, agent) => {
  acc[agent.id] = agent.icon;
  return acc;
}, {}); // The initial value is still an empty object, but its type is now known.


export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Effect to load agents from localStorage on initial render
  useEffect(() => {
    try {
      const savedAgentsJSON = localStorage.getItem("chat_agents");
      let loadedAgents: Agent[];

      if (savedAgentsJSON) {
        const parsedAgents: Omit<Agent, 'icon'>[] = JSON.parse(savedAgentsJSON);
        
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

  // Effect to save agents to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const agentsToSave = agents.map(({ icon, ...rest }) => rest);
      localStorage.setItem("chat_agents", JSON.stringify(agentsToSave));
    } catch (error) {
      console.error("Failed to save agents to localStorage", error);
    }
  }, [agents, isLoaded]);

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

  const updateAgent = (agentId: string, updatedData: Partial<Omit<Agent, 'id' | 'icon'>>) => {
    setAgents(prev =>
      prev.map(agent =>
        agent.id === agentId ? { ...agent, ...updatedData } : agent
      )
    );
  };

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