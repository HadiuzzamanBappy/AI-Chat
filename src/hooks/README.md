# Hooks Directory

This directory contains custom React hooks that provide reusable stateful logic and side effects for the AI Chat application.

## 📁 Directory Structure

```
hooks/
├── use-agents.ts           # AI agent management and persistence
├── use-knowledgebases.ts   # Knowledge base CRUD operations
├── use-mobile.ts          # Responsive breakpoint detection
└── use-toast.ts           # Toast notification system
```

## 🪝 Custom Hooks Overview

### `use-agents.ts`

**AI Agent Management Hook**

Manages custom AI agents with specialized system prompts and behaviors.

```typescript
const { agents, addAgent, updateAgent, deleteAgent } = useAgents();
```

**Features:**

- 🤖 **Agent CRUD Operations** - Create, read, update, and delete custom AI agents
- 💾 **Persistent Storage** - Automatically syncs with localStorage
- 🔄 **State Management** - Reactive state updates across components
- 📝 **System Prompts** - Manage specialized AI behavior configurations
- 🎭 **Icon Support** - Associate icons with agents for UI display

**Use Cases:**

- Creating specialized AI assistants (coding, creative writing, analysis)
- Managing agent libraries for different conversation contexts
- Customizing AI behavior with specific system prompts

---

### `use-knowledgebases.ts`

**Knowledge Base Management Hook**

Handles knowledge base creation, management, and context injection for AI conversations.

```typescript
const { 
  knowledgebases, 
  addKnowledgebase, 
  deleteKnowledgebase, 
  updateKnowledgebase,
  setActiveKnowledgebase 
} = useKnowledgebases();
```

**Features:**

- 📚 **Knowledge Base CRUD** - Full lifecycle management of knowledge bases
- 📄 **File Management** - Upload and manage multiple files per knowledge base
- 🎯 **Context Activation** - Toggle knowledge bases for conversation context
- 💾 **Persistent Storage** - localStorage integration with data validation
- 📊 **Content Limits** - Word count validation and content optimization

**Use Cases:**

- Injecting domain-specific knowledge into AI conversations
- Managing project documentation and context
- Creating specialized knowledge domains for different topics

---

### `use-mobile.ts`

**Responsive Breakpoint Detection Hook**

Provides consistent mobile/desktop detection across the application.

```typescript
const isMobile = useIsMobile();
```

**Features:**

- 📱 **Breakpoint Detection** - Tracks viewport width against mobile breakpoint (768px)
- 🎯 **Efficient Monitoring** - Uses matchMedia API for performant responsive tracking
- 🔄 **Real-time Updates** - Automatically updates on viewport changes
- ⚡ **Event-driven** - Lightweight event listeners for optimal performance

**Use Cases:**

- Conditional rendering for mobile vs desktop layouts
- Responsive component behavior and interactions
- Mobile-specific UI optimizations

---

### `use-toast.ts`

**Toast Notification System Hook**

Provides toast notification functionality using sonner toast library.

```typescript
const { toast } = useToast();
```

**Features:**

- 📢 **Multiple Toast Types** - Success, error, warning, and info notifications
- ⏰ **Auto-dismiss** - Configurable timeout and persistence options
- 🎨 **Themed Styling** - Consistent with application design system
- 🔗 **Action Support** - Interactive toasts with buttons and callbacks

**Use Cases:**

- User feedback for actions (save, delete, error states)
- System notifications and status updates
- Form validation and submission feedback

## 🛠️ Hook Architecture

### Design Principles

**🔄 Single Responsibility**
Each hook manages one specific concern (agents, knowledge bases, responsive state, notifications)

**💾 Persistent State**
Hooks that manage user data automatically persist to localStorage with proper serialization

**⚡ Performance Optimized**

- Minimal re-renders through selective state updates
- Event-driven updates where applicable
- Efficient data structures and operations

**🔒 Type Safety**
All hooks are fully typed with TypeScript interfaces and proper error handling

### State Management Pattern

```typescript
// Common pattern across data management hooks
interface HookState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

// CRUD operations pattern
interface CRUDHook<T> {
  items: T[];
  add: (item: Omit<T, 'id'>) => void;
  update: (id: string, updates: Partial<T>) => void;
  delete: (id: string) => void;
}
```

### Storage Integration

**localStorage Schema:**

```typescript
// Storage keys used by hooks
const STORAGE_KEYS = {
  agents: 'chat_agents',
  knowledgebases: 'chat_knowledgebases',
  // Mobile state is session-based, no storage needed
  // Toast state is ephemeral, no storage needed
};
```

## 📚 Usage Guidelines

### Importing Hooks

```typescript
import { useAgents } from '@/hooks/use-agents';
import { useKnowledgebases } from '@/hooks/use-knowledgebases';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
```

### Common Usage Patterns

**Data Management Hooks:**

```typescript
// Standard CRUD pattern
const { items, add, update, delete } = useDataHook();

// Adding new items
const handleAdd = () => {
  add({ name: 'New Item', ...otherProps });
};

// Updating existing items
const handleUpdate = (id: string) => {
  update(id, { name: 'Updated Name' });
};
```

**Utility Hooks:**

```typescript
// Responsive behavior
const isMobile = useIsMobile();

// Conditional rendering
{isMobile ? <MobileComponent /> : <DesktopComponent />}

// Notifications
const { toast } = useToast();
toast.success('Operation completed successfully!');
```

### Best Practices

**✅ Hook Composition**

```typescript
// Combine hooks for complex functionality
const MyComponent = () => {
  const { agents } = useAgents();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Use hooks together for rich functionality
};
```

**✅ Error Handling**

```typescript
// Proper error handling in hook usage
const { agents, error } = useAgents();

if (error) {
  toast.error(`Failed to load agents: ${error}`);
}
```

**✅ Performance Optimization**

```typescript
// Selective subscription to hook data
const { agents } = useAgents();
const agentCount = agents.length; // Only re-render when count changes
```

## 🔧 Extension Points

### Adding New Hooks

When creating new hooks, follow these patterns:

1. **State Management**: Use useState for local state, useEffect for side effects
2. **Persistence**: Integrate localStorage for data that should persist
3. **Error Handling**: Include proper error states and user feedback
4. **TypeScript**: Define clear interfaces for hook parameters and return values
5. **Testing**: Include unit tests for hook logic and edge cases

### Hook Dependencies

```typescript
// Common dependencies across hooks
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner'; // For user notifications
```

## 🧪 Testing Strategy

### Unit Testing

- **State Updates** - Verify state changes correctly
- **Side Effects** - Test localStorage integration and event listeners
- **Error Conditions** - Handle edge cases and error states
- **Performance** - Ensure minimal unnecessary re-renders

### Integration Testing

- **Component Integration** - Test hooks within actual components
- **Cross-Hook Communication** - Verify hooks work together properly
- **Storage Persistence** - Test data persistence across sessions

---

*These custom hooks provide the foundation for stateful logic in the AI Chat application, promoting code reuse and separation of concerns while maintaining type safety and performance.*
