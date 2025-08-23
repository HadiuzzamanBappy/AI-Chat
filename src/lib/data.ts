// src/lib/data.ts

import { type Provider, type Model } from './types';

// Central definition for all API providers
export const PROVIDERS: Provider[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    apiKeyEnvVar: 'VITE_OPENROUTER_API_KEY'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    apiKeyEnvVar: 'VITE_OPENAI_API_KEY'
  }
];

export const AVAILABLE_MODELS: Model[] = [
  // --- OpenRouter Free & Fast Models ---
  {
    id: "mistralai/mistral-7b-instruct",
    name: "Mistral 7B",
    providerId: "openrouter",
    capabilities: ['fast', 'chat']
  },
  {
    id: "mistralai/mistral-nemo:free",
    name: "Mistral Nemo",
    providerId: "openrouter",
    capabilities: ['fast', 'chat']
  },
  {
    id: "meta-llama/llama-3-8b-instruct",
    name: "Llama 3 8B",
    providerId: "openrouter",
    capabilities: ['fast', 'code', 'chat']
  },
  {
    id: "qwen/qwen3-coder:free",
    name: "Qwen 3 Coder",
    providerId: "openrouter",
    capabilities: ['fast', 'code']
  },
  {
    id: "tngtech/deepseek-r1t2-chimera:free",
    name: "DeepSeek R1T2 Chimera",
    providerId: "openrouter",
    capabilities: ['fast', 'code', 'chat']
  },
  {
    id: "z-ai/glm-4.5-air:free",
    name: "GLM 4.5 Air",
    providerId: "openrouter",
    capabilities: ['fast', 'code', 'multilingual']
  },
  {
    id: "openai/gpt-oss-20b:free",
    name: "GPT-OSS 20B",
    providerId: "openrouter",
    capabilities: ['fast', 'creative', 'code']
  },

  // --- OpenRouter High-Performance Models ---
  {
    id: "microsoft/mai-ds-r1:free",
    name: "Microsoft MAI DS R1",
    providerId: "openrouter",
    capabilities: ['code', 'creative', 'powerful']
  },
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek V3",
    providerId: "openrouter",
    capabilities: ['code', 'creative', 'multilingual']
  },
  {
    id: "google/gemini-flash-1.5",
    name: "Gemini 1.5 Flash",
    providerId: "openrouter",
    capabilities: ['fast', 'creative', 'multilingual', 'vision', 'files']
  },

  // --- OpenAI Models ---
  {
    id: "gpt-4o",
    name: "GPT-4o",
    providerId: "openai",
    capabilities: ['code', 'creative', 'powerful', 'multilingual', 'vision', 'files']
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    providerId: "openai", 
    capabilities: ['fast', 'code', 'creative', 'vision', 'files']
  },

  // --- Auto-Selection Models ---
  {
    id: "openrouter/auto",
    name: "Auto (Smart Select)",
    providerId: "openrouter",
    capabilities: ['vision', 'files'] // Auto should support files
  },
];