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
  },
];

// Central definition for all available models
export const AVAILABLE_MODELS: Model[] = [
  // Free, fast models are tagged first
  { id: "mistralai/mistral-7b-instruct", name: "Mistral 7B", providerId: "openrouter", capabilities: ['fast'] },
  { id: "meta-llama/llama-3-8b-instruct", name: "Llama 3 8B", providerId: "openrouter", capabilities: ['fast', 'code'] },
  { id: "google/gemini-flash-1.5", name: "Gemini 1.5 Flash", providerId: "openrouter", capabilities: ['fast', 'creative'] },

  // Paid/Slower models
  { id: "gpt-4o", name: "GPT-4o", providerId: "openai", capabilities: ['code', 'creative'] },

  // Auto as a selectable option
  { id: "openrouter/auto", name: "Auto (Smart Select)", providerId: "openrouter", capabilities: [] },
];