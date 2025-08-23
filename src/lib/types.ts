/**
 * Core Type Definitions
 * 
 * Central type definitions for AI chat application including providers,
 * models, conversations, knowledge bases, and file attachments.
 */

/** AI provider configuration for external services */
export interface Provider {
  /** Unique provider identifier */
  id: string;
  /** Human-readable provider name */
  name: string;
  /** API endpoint URL for requests */
  apiUrl: string;
  /** Environment variable name for API key */
  apiKeyEnvVar: string; // e.g., 'VITE_OPENROUTER_API_KEY'
}

/** AI model with capabilities and provider association */
export interface Model {
  /** Model identifier for API calls */
  id: string;
  /** Human-readable model name */
  name: string;
  /** Associated provider ID */
  providerId: string;
  /** Model capability tags for filtering and display */
  capabilities: ('code' | 'fast' | 'creative' | 'powerful' | 'chat' | 'multilingual' | 'vision' | 'files')[];
  /** Optional provider-specific API endpoint override */
  apiUrlOverride?: string;
}

/** Knowledge base file for context injection */
export interface KnowledgeFile {
  /** Filename with extension */
  name: string;
  /** File content as text */
  content: string;
}

/** Knowledge base collection for conversation context */
export interface Knowledgebase {
  /** Unique knowledge base identifier */
  id: string;
  /** Knowledge base display name */
  name: string;
  /** Primary content description */
  content: string;
  /** Associated files for additional context */
  files: KnowledgeFile[];
  /** Activation status for context injection */
  isActive: boolean;
}

/** Conversation thread with message history and metadata */
export interface Conversation {
  /** Unique conversation identifier */
  id: string;
  /** Conversation title for sidebar display */
  title: string;
  /** Preview of last message content */
  lastMessage: string;
  /** Last activity timestamp */
  timestamp: Date;
  /** Complete message history */
  messages: ChatMessage[];
  /** Active AI model identifier */
  modelId: string;
  /** Optional active agent for specialized behavior */
  agentId?: string;
}

/** Individual chat message with metadata and attachments */
export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  /** Message content text */
  content: string;
  /** Message sender indicator (true for user, false for AI) */
  isUser: boolean;
  /** Message creation timestamp */
  timestamp: Date;
  /** Model name used for AI response */
  modelName?: string; 
  /** Agent name for specialized responses */
  agentName?: string;
  /** Optional file attachment with metadata */
  attachedFile?: {
    /** Filename with extension */
    name: string;
    /** File content (base64 for images, text for documents) */
    content: string;
    /** File size in bytes */
    size?: number;
    /** MIME type for proper handling */
    type?: string;
  };
  /** Separate storage for image analysis results */
  imageAnalysis?: string;
}

/** AI agent with specialized system prompts and behavior */
export interface Agent {
  /** Agent identifier */
  id: string;
  /** Agent display name */
  name: string;
  /** Agent description or purpose */
  description: string;
  /** System prompt defining AI behavior */
  systemPrompt: string;
  /** React icon component for UI display */
  icon: React.ElementType;
}