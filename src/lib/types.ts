// src/lib/types.ts

export interface Provider {
  id: string;
  name: string;
  apiUrl: string;
  apiKeyEnvVar: string; // e.g., 'VITE_OPENROUTER_API_KEY'
}

export interface Model {
  id: string;
  name: string;
  providerId: string;
  capabilities: ('code' | 'fast' | 'creative' | 'powerful' | 'chat' | 'multilingual')[]; // NEW
  apiUrlOverride?: string;
}

export interface KnowledgeFile {
  name: string;
  content: string;
}

export interface Knowledgebase {
  id: string;
  name:string;
  content: string;
  files: KnowledgeFile[];
  isActive: boolean;
}

// NOTE: I am adding the Conversation interface here because it's not in your types.ts
// but it's better to have it here for central management.
export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: ChatMessage[];
  modelId: string;
  agentId?: string; // NEW: Link to an agent
}

// You should also move ChatMessage here if it's not already
export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  modelName?: string; 
  agentName?: string; // NEW: Name of the agent used for this message
}

// NEW: Define the Agent interface
export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  icon: React.ElementType;
}