# Components Directory

This directory contains all React components for the AI Chat application, organized into custom application components and reusable UI components.

## 📁 Directory Structure

```
components/
├── Custom Application Components
├── Chat.tsx                    # Main chat interface with message display
├── ChatInput.tsx              # Message input with file upload and send functionality
├── DesktopSidebar.tsx         # Desktop-specific sidebar layout
├── ImageAnalysis.tsx          # Image analysis interface for vision models
├── Message.tsx                # Individual message bubble with formatting
├── ModelSelector.tsx          # AI model selection dropdown with capabilities
├── Navbar.tsx                 # Top navigation bar with controls
├── Sidebar.tsx                # Main sidebar with conversations and navigation
├── StarterTemplates.tsx       # Quick-start conversation templates
├── ThemeToggle.tsx           # Dark/light theme switcher
├── TokenWarning.tsx          # Token limit warnings and optimization
├── VisionModelSwitcher.tsx   # Vision-capable model selector
└── ui/                       # Reusable UI components (shadcn/ui based)
    ├── accordion.tsx         # Collapsible content sections
    ├── alert-dialog.tsx      # Modal dialogs for confirmations
    ├── alert.tsx             # Notification alerts
    ├── avatar.tsx            # User profile pictures
    ├── badge.tsx             # Status and category indicators
    ├── button.tsx            # Interactive buttons
    ├── card.tsx              # Content containers
    ├── dialog.tsx            # Modal overlays
    ├── dropdown-menu.tsx     # Context menus
    ├── input.tsx             # Form input fields
    ├── label.tsx             # Form field labels
    ├── progress.tsx          # Loading and progress indicators
    ├── select.tsx            # Dropdown selections
    ├── separator.tsx         # Visual dividers
    ├── sheet.tsx             # Side panels
    ├── switch.tsx            # Toggle switches
    ├── tabs.tsx              # Tabbed interfaces
    ├── textarea.tsx          # Multi-line text input
    ├── toast.tsx             # Notification system
    ├── tooltip.tsx           # Hover information
    └── ...                   # Additional UI primitives
```

## 🎯 Custom Application Components

### Core Chat Components
- **`Chat.tsx`** - Main chat interface that renders conversation messages with real-time updates and typing indicators
- **`ChatInput.tsx`** - Input component handling message composition, file uploads, model selection, and send functionality
- **`Message.tsx`** - Individual message bubble with role-based styling, timestamp, and attachment display

### Navigation & Layout
- **`Sidebar.tsx`** - Primary navigation with conversation history, new chat creation, and settings access
- **`DesktopSidebar.tsx`** - Desktop-optimized sidebar layout with enhanced functionality
- **`Navbar.tsx`** - Top navigation bar with theme toggle, model selection, and mobile menu controls

### AI Model Management
- **`ModelSelector.tsx`** - Dropdown for selecting AI models with capability indicators and provider status
- **`VisionModelSwitcher.tsx`** - Specialized selector for vision-capable models when images are attached
- **`TokenWarning.tsx`** - Smart warnings for token limits with suggestions for optimization

### User Experience
- **`StarterTemplates.tsx`** - Quick-start conversation templates for common use cases
- **`ThemeToggle.tsx`** - Dark/light theme switcher with smooth transitions
- **`ImageAnalysis.tsx`** - Interface for image analysis with multiple AI vision providers

## 🧩 UI Components (shadcn/ui)

The `ui/` directory contains reusable UI primitives built with:
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first styling
- **Class Variance Authority** - Type-safe component variants
- **Framer Motion** - Smooth animations (where applicable)

### Key UI Categories

#### **Form Components**
- `button.tsx`, `input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`, `radio-group.tsx`, `switch.tsx`
- Fully accessible with keyboard navigation and screen reader support

#### **Layout Components** 
- `card.tsx`, `separator.tsx`, `tabs.tsx`, `accordion.tsx`, `sheet.tsx`
- Consistent spacing and responsive design patterns

#### **Feedback Components**
- `toast.tsx`, `alert.tsx`, `progress.tsx`, `skeleton.tsx`, `badge.tsx`
- User feedback and loading states with consistent styling

#### **Overlay Components**
- `dialog.tsx`, `popover.tsx`, `tooltip.tsx`, `dropdown-menu.tsx`, `hover-card.tsx`
- Modal interactions with proper focus management

## 🛠️ Component Architecture

### Design Principles
- **Composition over Inheritance** - Components are composed together rather than extended
- **Single Responsibility** - Each component has a focused, well-defined purpose
- **Accessibility First** - All components follow WCAG guidelines
- **Type Safety** - Full TypeScript support with proper prop validation
- **Theme Consistency** - Unified design system with CSS custom properties

### State Management
- **Local State** - Component-specific state using React hooks
- **Global State** - Shared state via custom hooks in `/hooks` directory
- **Persistent State** - localStorage integration for user preferences

### Styling Approach
- **Tailwind CSS** - Utility-first styling with custom design tokens
- **CSS Custom Properties** - Theme-aware color system
- **Responsive Design** - Mobile-first approach with breakpoint consistency
- **Animation** - Subtle micro-interactions using Tailwind and Framer Motion

## 🔧 Usage Guidelines

### Importing Components
```typescript
// Custom application components
import { Chat } from '@/components/Chat';
import { ChatInput } from '@/components/ChatInput';

// UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
```

### Component Conventions
- **Props Interface** - Each component exports its props interface
- **Forward Refs** - UI components support ref forwarding
- **Default Props** - Sensible defaults for optional props
- **Variants** - UI components support multiple visual variants

### Customization
- **CSS Variables** - Theme customization via custom properties
- **Tailwind Classes** - Override styling with Tailwind utilities  
- **Component Variants** - Use built-in variant props for common modifications

## 📚 Documentation

Each component includes:
- **JSDoc Comments** - Purpose and usage documentation
- **TypeScript Interfaces** - Complete prop definitions
- **Example Usage** - Common implementation patterns
- **Accessibility Notes** - Screen reader and keyboard support details

## 🎨 Design System Integration

Components follow the application's design system:
- **Color Palette** - Consistent use of semantic color tokens
- **Typography** - Unified text styles and hierarchy
- **Spacing** - Consistent spacing scale
- **Border Radius** - Unified corner radius values
- **Shadows** - Consistent elevation system

---

*This components directory provides a complete UI foundation for the AI Chat application, balancing reusability with specific functionality needs.*
