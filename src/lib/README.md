# Library Directory

This directory contains utility libraries, type definitions, and core business logic for the AI Chat application. These modules provide shared functionality used throughout the application.

## 📁 Directory Structure

```
lib/
├── agents.ts                 # AI agent definitions with specialized system prompts
├── data.ts                   # AI providers, models, and configuration data
├── default-knowledgebase.ts  # Default personal context knowledge base
├── image-analysis.ts         # Multi-provider image analysis services
├── starters.ts              # Conversation starter templates
├── token-utils.ts           # Token counting and conversation trimming
├── types.ts                 # Core TypeScript interface definitions
└── utils.ts                 # General utility functions (className merging)
```

## 📚 Library Modules

### `agents.ts`
**AI Agent Configuration Library**

Defines specialized AI agents with custom system prompts for different use cases.

```typescript
import { AGENTS } from '@/lib/agents';
```

**Features:**
- 🤖 **Pre-built Agents** - Ready-to-use AI assistants for common tasks
- 📝 **System Prompts** - Specialized behavior configurations
- 🎭 **Icon Integration** - Visual icons for each agent type
- 🎯 **Role Specialization** - Coding, creative, analytical, and general assistants

**Available Agents:**
- **General Assistant** - Balanced AI for everyday conversations
- **Code Expert** - Specialized for programming and technical discussions
- **Creative Writer** - Optimized for creative and narrative content
- **Data Analyst** - Focused on data analysis and insights
- **Research Assistant** - Academic and research-oriented responses

---

### `data.ts`
**AI Provider and Model Configuration**

Central configuration for AI providers, models, and their capabilities.

```typescript
import { PROVIDERS, AVAILABLE_MODELS } from '@/lib/data';
```

**Features:**
- 🌐 **Multi-Provider Support** - OpenRouter and OpenAI integration
- 🧠 **Model Catalog** - Comprehensive list of available AI models
- 🏷️ **Capability Tagging** - Models categorized by strengths (code, creative, fast, etc.)
- 🔑 **API Configuration** - Provider endpoints and authentication setup
- 🆓 **Free Tier Tracking** - Identifies free vs paid model tiers

**Model Categories:**
- **Fast Models** - Quick response times for simple queries
- **Powerful Models** - Advanced reasoning for complex tasks
- **Code Models** - Specialized for programming tasks
- **Vision Models** - Image analysis capabilities
- **Creative Models** - Optimized for creative content generation

---

### `default-knowledgebase.ts`
**Personal Context Configuration**

Default knowledge base providing personal context to AI conversations.

```typescript
import { defaultKnowledgebase } from '@/lib/default-knowledgebase';
```

**Features:**
- 👤 **Personal Context** - User background and preferences
- 🎯 **Conversation Optimization** - Tailored AI responses based on user profile
- 📝 **Customizable Content** - Easy modification of personal information
- 🔄 **Context Injection** - Seamless integration with conversation flow

**Context Areas:**
- Professional background and expertise
- Communication preferences and style
- Technical interests and experience levels
- Project context and current focus areas

---

### `image-analysis.ts`
**Multi-Provider Image Analysis Service**

Comprehensive image analysis using multiple AI vision providers.

```typescript
import { analyzeWithHuggingFace, extractObjects, extractText } from '@/lib/image-analysis';
```

**Features:**
- 🖼️ **Multi-Provider Support** - Hugging Face, OpenAI Vision integration
- 🔍 **Object Detection** - Identify and catalog objects in images
- 📝 **Text Extraction** - OCR capabilities for text within images
- 🎨 **Scene Analysis** - Comprehensive image description and analysis
- ⚡ **Fallback System** - Automatic provider switching on failures

**Capabilities:**
- Detailed image descriptions
- Object identification and counting
- Text extraction and transcription
- Scene composition analysis
- Technical diagram interpretation

---

### `starters.ts`
**Conversation Starter Templates**

Pre-defined conversation starters to help users begin productive AI interactions.

```typescript
import { CONVERSATION_STARTERS } from '@/lib/starters';
```

**Features:**
- 🚀 **Quick Start** - Ready-to-use conversation prompts
- 🎯 **Category Organization** - Grouped by use case and domain
- 🎨 **Visual Icons** - Associated icons for better UX
- 💡 **Inspiration** - Helps users discover AI capabilities
- 🔄 **Contextual Relevance** - Starters adapted to different scenarios

**Starter Categories:**
- **Creative Writing** - Story ideas, character development, worldbuilding
- **Programming** - Code review, debugging, architecture discussions
- **Analysis** - Data interpretation, research synthesis, problem-solving
- **Learning** - Educational queries, concept explanations, tutorials
- **Productivity** - Task planning, email drafting, meeting summaries

---

### `token-utils.ts`
**Token Management and Optimization**

Utilities for managing AI model token limits and optimizing conversation context.

```typescript
import { estimateTokens, getTokenLimit, trimMessagesToFit } from '@/lib/token-utils';
```

**Features:**
- 📊 **Token Estimation** - Accurate token counting for different models
- 📏 **Model Limits** - Comprehensive database of model token limits
- ✂️ **Smart Trimming** - Intelligent conversation history truncation
- 🎯 **Context Optimization** - Preserve important context while staying within limits
- 🔄 **Attachment Handling** - Token calculations for images and files

**Core Functions:**
- `estimateTokens()` - Convert text to approximate token count
- `getTokenLimit()` - Get maximum tokens for specific model
- `trimMessagesToFit()` - Intelligently trim conversation to fit limits
- `calculateMessageTokens()` - Total tokens including attachments

---

### `types.ts`
**Core Type Definitions**

Central TypeScript interfaces and types for the entire application.

```typescript
import type { ChatMessage, Conversation, Agent, Provider } from '@/lib/types';
```

**Features:**
- 🔒 **Type Safety** - Comprehensive TypeScript definitions
- 🏗️ **Data Structures** - Core entity interfaces
- 🔗 **Relationship Mapping** - Inter-entity relationships and dependencies
- 📝 **Documentation** - Inline documentation for all interfaces
- 🎯 **Consistency** - Shared types across entire application

**Key Interfaces:**
- **ChatMessage** - Individual message structure with attachments
- **Conversation** - Complete conversation threads with metadata
- **Agent** - AI agent configuration and system prompts
- **Provider** - AI service provider configuration
- **Model** - AI model definitions with capabilities
- **Knowledgebase** - Knowledge base and file structures

---

### `utils.ts`
**General Utility Functions**

Common utility functions used throughout the application.

```typescript
import { cn } from '@/lib/utils';
```

**Features:**
- 🎨 **Class Name Merging** - Intelligent Tailwind CSS class combination
- 🔧 **Type-Safe Utilities** - Fully typed helper functions
- ⚡ **Performance Optimized** - Efficient implementations
- 🧩 **Composable** - Functions designed for easy composition

**Core Functions:**
- `cn()` - Combines and merges Tailwind CSS classes with conflict resolution

## 🛠️ Architecture Patterns

### Design Principles

**🎯 Single Source of Truth**
Each library module manages one specific domain (agents, models, tokens, etc.)

**📦 Pure Functions**
Most utilities are pure functions with predictable inputs and outputs

**🔒 Type Safety First**
All modules are fully typed with comprehensive TypeScript definitions

**⚡ Performance Conscious**
Optimized implementations with minimal computational overhead

### Module Dependencies

```typescript
// Common dependency patterns
import type { ... } from './types';        // Type definitions
import { cn } from './utils';              // Utility functions
import { PROVIDERS } from './data';        // Configuration data
```

### Integration Patterns

**Configuration Loading:**
```typescript
// Load configuration data
import { AVAILABLE_MODELS, PROVIDERS } from '@/lib/data';
import { AGENTS } from '@/lib/agents';
import { CONVERSATION_STARTERS } from '@/lib/starters';
```

**Utility Usage:**
```typescript
// Token management
import { estimateTokens, trimMessagesToFit } from '@/lib/token-utils';

// Image analysis
import { analyzeWithHuggingFace } from '@/lib/image-analysis';
```

## 📚 Usage Guidelines

### Importing Libraries
```typescript
// Type-only imports
import type { ChatMessage, Agent } from '@/lib/types';

// Function imports
import { cn } from '@/lib/utils';
import { estimateTokens } from '@/lib/token-utils';

// Data imports
import { AVAILABLE_MODELS } from '@/lib/data';
```

### Common Patterns

**Token Management:**
```typescript
const messageTokens = calculateMessageTokens(messages);
const limit = getTokenLimit(selectedModel);
const trimmed = trimMessagesToFit(messages, limit);
```

**Image Analysis:**
```typescript
const analysis = await analyzeWithHuggingFace(imageBase64);
const objects = extractObjects(analysis);
const text = extractText(analysis);
```

**Class Name Composition:**
```typescript
const className = cn(
  'base-classes',
  isActive && 'active-classes',
  variant === 'primary' && 'primary-classes'
);
```

### Best Practices

**✅ Type-Safe Imports**
```typescript
import type { TypeDefinition } from '@/lib/types';  // Types only
import { utility } from '@/lib/utils';               // Runtime values
```

**✅ Configuration Access**
```typescript
// Access predefined configurations
const model = AVAILABLE_MODELS.find(m => m.id === selectedModelId);
const agent = AGENTS.find(a => a.id === selectedAgentId);
```

**✅ Error Handling**
```typescript
// Proper error handling with utilities
try {
  const analysis = await analyzeWithHuggingFace(image);
} catch (error) {
  console.error('Image analysis failed:', error);
  // Fallback logic
}
```

## 🔧 Extension Guidelines

### Adding New Libraries

When creating new library modules:

1. **Follow Naming Convention** - Use kebab-case for filenames
2. **Export Consistency** - Use named exports for functions, default for configurations
3. **Type Definitions** - Add types to `types.ts` if shared across modules
4. **Documentation** - Include JSDoc comments for public APIs
5. **Testing** - Add unit tests for complex logic

### Module Structure Template
```typescript
/**
 * Module Name and Description
 * 
 * Brief description of module purpose and functionality.
 */

// Type imports
import type { RequiredTypes } from './types';

// Implementation
export const CONFIGURATION = {
  // Configuration object
};

export function utilityFunction(param: Type): ReturnType {
  // Function implementation
}
```

## 🧪 Testing Strategy

### Unit Testing Focus Areas
- **Token Calculations** - Verify accuracy of token estimation and trimming
- **Image Analysis** - Test provider integration and fallback mechanisms
- **Type Validation** - Ensure type safety across all interfaces
- **Configuration Loading** - Validate data structure integrity

### Integration Testing
- **Cross-Module Dependencies** - Test module interactions
- **Provider Integration** - Verify external API integrations
- **Error Handling** - Test failure scenarios and fallbacks

---

*These library modules form the foundation of the AI Chat application, providing robust, type-safe, and well-documented utilities for all core functionality.*
