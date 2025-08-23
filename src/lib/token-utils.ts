// src/lib/token-utils.ts

import type { ChatMessage } from './types';

// Rough token estimation (1 token ≈ 4 characters for most models)
export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

// Token limits for different models
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

export const getTokenLimit = (modelId: string): number => {
  return MODEL_TOKEN_LIMITS[modelId] || MODEL_TOKEN_LIMITS.default;
};

export const calculateMessageTokens = (messages: ChatMessage[]): number => {
  return messages.reduce((total, message) => {
    let tokens = estimateTokens(message.content);
    
    // Add tokens for attached files (images are much more expensive)
    if (message.attachedFile && message.attachedFile.type) {
      if (message.attachedFile.type.startsWith('image/')) {
        // Images can use 85-170 tokens per tile (roughly 512x512 pixels)
        tokens += 1000; // Conservative estimate for image processing
      } else {
        // Text files add their content length
        tokens += estimateTokens(message.attachedFile.content || '');
      }
    }
    
    return total + tokens;
  }, 0);
};

export const trimMessagesToFit = (
  messages: ChatMessage[], 
  maxTokens: number,
  systemPromptTokens: number = 1000 // Reserve space for system prompt
): ChatMessage[] => {
  const availableTokens = maxTokens - systemPromptTokens;
  let currentTokens = 0;
  const trimmedMessages: ChatMessage[] = [];
  
  // Start from the end (most recent) and work backwards
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageTokens = calculateMessageTokens([message]);
    
    if (currentTokens + messageTokens <= availableTokens) {
      trimmedMessages.unshift(message);
      currentTokens += messageTokens;
    } else {
      // If this is the very last message and it's too big, we need to handle it
      if (i === messages.length - 1) {
        // Try to truncate the content while keeping the attachment info
        const truncatedMessage = { ...message };
        if (message.attachedFile) {
          // Keep the attachment but truncate the text content
          const maxContentLength = (availableTokens - 1000) * 4; // Convert back to chars
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
