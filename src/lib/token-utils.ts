/**
 * Token Management Utilities
 * 
 * Handles token estimation, limits, and conversation trimming for AI models.
 * Provides accurate token counting and smart message truncation to fit model limits.
 */

import type { ChatMessage } from './types';

/** Estimates token count using 4-character approximation */
export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

/** Token limits for different AI models by provider */
export const MODEL_TOKEN_LIMITS: Record<string, number> = {
  // OpenRouter models
  'mistralai/mistral-7b-instruct': 32000,
  'mistralai/mistral-nemo:free': 128000,
  'meta-llama/llama-3-8b-instruct': 8192,
  'qwen/qwen3-coder:free': 32768,
  'tngtech/deepseek-r1t2-chimera:free': 32768,
  'z-ai/glm-4.5-air:free': 128000,
  'google/gemini-flash-1.5': 1000000,
  'openai/gpt-oss-20b:free': 4096,
  'microsoft/mai-ds-r1:free': 200000,
  'deepseek/deepseek-chat-v3-0324:free': 64000,
  'openrouter/auto': 128000, // Conservative estimate for auto

  // OpenAI models
  'gpt-4o': 128000,
  'gpt-4o-mini': 128000,
  
  // Default fallback
  'default': 4096
};

/** Returns token limit for specified model */
export const getTokenLimit = (modelId: string): number => {
  return MODEL_TOKEN_LIMITS[modelId] || MODEL_TOKEN_LIMITS.default;
};

/** 
 * Calculates total tokens for message array including attachments
 * 
 * Images use conservative 1000 token estimate per attachment.
 * Text files add their actual content length in tokens.
 */
export const calculateMessageTokens = (messages: ChatMessage[]): number => {
  return messages.reduce((total, message) => {
    let tokens = estimateTokens(message.content);
    
    // Add tokens for attached files with type-specific calculations
    if (message.attachedFile && message.attachedFile.type) {
      if (message.attachedFile.type.startsWith('image/')) {
        // Images use 85-170 tokens per 512x512 tile - conservative estimate
        tokens += 1000;
      } else {
        // Text files add their content length
        tokens += estimateTokens(message.attachedFile.content || '');
      }
    }
    
    return total + tokens;
  }, 0);
};

/**
 * Trims message history to fit within token limits
 * 
 * Preserves recent messages and handles oversized final messages by truncation.
 * Reserves space for system prompts and maintains conversation context.
 */
export const trimMessagesToFit = (
  messages: ChatMessage[], 
  maxTokens: number,
  systemPromptTokens: number = 1000
): ChatMessage[] => {
  const availableTokens = maxTokens - systemPromptTokens;
  let currentTokens = 0;
  const trimmedMessages: ChatMessage[] = [];
  
  // Process messages from most recent backwards
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageTokens = calculateMessageTokens([message]);
    
    if (currentTokens + messageTokens <= availableTokens) {
      trimmedMessages.unshift(message);
      currentTokens += messageTokens;
    } else {
      // Handle oversized final message by truncating content
      if (i === messages.length - 1) {
        const truncatedMessage = { ...message };
        if (message.attachedFile) {
          // Preserve attachment but truncate text content
          const maxContentLength = (availableTokens - 1000) * 4;
          if (message.content.length > maxContentLength) {
            truncatedMessage.content = message.content.substring(0, maxContentLength) + '... [truncated]';
          }
        }
        trimmedMessages.unshift(truncatedMessage);
      }
      break;
    }
  }
  
  return trimmedMessages;
};
