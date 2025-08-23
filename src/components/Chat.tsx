/**
 * Chat Component - Main interface for AI conversations
 * Handles message display, typing indicators, auto-scrolling, and user interactions
 */

import { useEffect, useRef, useState } from "react";
import { Message } from "./Message";
import { motion } from "framer-motion";
import { starterTemplates } from '@/lib/starters';
import { StarterTemplates } from './StarterTemplates';
import { Bot } from "lucide-react";
import { type Conversation, type ChatMessage } from "@/lib/types";
import { AGENTS } from "@/lib/agents";

/**
 * Custom hook to track previous value of state/props
 * Essential for detecting state transitions without causing re-renders
 */
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

/** Props interface for Chat component */
interface ChatProps {
  messages: ChatMessage[];                                    // Array of conversation messages
  isTyping?: boolean;                                         // AI response generation indicator
  onSendMessage: (message: string) => void;                  // Handler for new user messages
  onDeleteMessage: (messageId: string) => void;              // Handler for message deletion
  onRerunMessage: (messageId: string) => void;               // Handler for message re-execution
  onEditMessage?: (messageId: string, newContent: string) => void;  // Optional message editing handler
  activeConversation: Conversation | undefined;               // Current conversation context
}

export function Chat({ messages, isTyping = false, onSendMessage, onDeleteMessage, onRerunMessage, onEditMessage, activeConversation }: ChatProps) {
  // Refs for DOM manipulation and state tracking
  const messagesEndRef = useRef<HTMLDivElement>(null);     // Reference for auto-scrolling to bottom
  const chatContainerRef = useRef<HTMLDivElement>(null);   // Reference for resize observation
  const isEditingRef = useRef(false);                      // Tracks editing state without re-renders
  
  // Component state management
  const [animatingMessageId, setAnimatingMessageId] = useState<string | null>(null);  // Controls message entrance animations
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);      // Tracks currently edited message
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);                   // Controls auto-scroll behavior

  // Track previous typing state to detect AI response completion
  const prevIsTyping = usePrevious(isTyping);

  // Get active agent with fallback to first agent
  const activeAgent = AGENTS.find(agent => agent.id === activeConversation?.agentId) || AGENTS[0];

  /**
   * Manages auto-scroll behavior during message editing
   * Prevents UI jumping by disabling scroll when user edits messages
   */
  const handleEditStateChange = (messageId: string, isEditing: boolean) => {
    isEditingRef.current = isEditing;
    
    if (isEditing) {
      // Disable auto-scroll when editing starts to maintain user focus
      setAutoScrollEnabled(false);
      setEditingMessageId(messageId);
    } else {
      // Re-enable auto-scroll after editing with delay to ensure state sync
      setTimeout(() => {
        setEditingMessageId(null);
        isEditingRef.current = false;
        setTimeout(() => setAutoScrollEnabled(true), 100);
      }, 500);
    }
  };

  // Effect: Trigger message entrance animation when AI finishes responding
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    
    // Detect transition from typing to not typing for animation trigger
    if (prevIsTyping === true && !isTyping && lastMessage && !lastMessage.isUser) {
      setAnimatingMessageId(lastMessage.id);
    }
  }, [isTyping, messages, prevIsTyping]);


  // Effect: Intelligent auto-scroll management
  useEffect(() => {
    // Skip auto-scroll if disabled or user is editing
    if (!autoScrollEnabled || isEditingRef.current || editingMessageId) return;
    
    const scrollToBottom = () => {
      // Double-check scroll conditions before executing
      if (!autoScrollEnabled || isEditingRef.current) return;
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    
    // Delay scroll to ensure DOM updates are complete
    const timeoutId = setTimeout(scrollToBottom, 10);
    
    const container = chatContainerRef.current;
    if (!container) {
      clearTimeout(timeoutId);
      return;
    }
    
    // Observe container resizing and scroll accordingly
    const observer = new ResizeObserver(() => {
      if (autoScrollEnabled && !isEditingRef.current) {
        scrollToBottom();
      }
    });
    observer.observe(container);
    
    // Cleanup on effect dependencies change
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [messages, isTyping, editingMessageId, autoScrollEnabled]);


  /** Animated typing indicator component for AI response generation */
  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-4 p-6 justify-start"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-chat-assistant-bubble flex items-center justify-center">
        <Bot className="h-4 w-4 text-chat-assistant-bubble-foreground" />
      </div>
      <div className="relative max-w-[70%]">
        <div className="rounded-2xl px-4 py-3 bg-chat-assistant-bubble text-chat-assistant-bubble-foreground">
          <div className="flex items-center space-x-1">
            <span>Thinking</span>
            {/* Animated dots with staggered timing */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-current rounded-full"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="relative flex-1 bg-chat-background">
      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden pb-4 pt-4">
        
        {/* Agent header with icon, name, and description */}
        <div className="text-center mb-4 p-2">
          <div className="inline-flex items-center justify-center bg-secondary p-3 rounded-full mb-2">
            <activeAgent.icon className="h-6 w-6 text-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">{activeAgent.name}</h2>
          <p className="text-sm text-muted-foreground">{activeAgent.description}</p>
        </div>
        
        {/* Conditional rendering: starter templates for empty chat, messages for active chat */}
        {messages.length === 0 ? (
          <StarterTemplates starters={starterTemplates} onSelectStarter={onSendMessage} />
        ) : (
          <motion.div
            ref={chatContainerRef}
            className="max-w-4xl mx-auto px-md-4"
          >
            {/* Render all messages with animation and interaction handlers */}
            {messages.map((message) => (
              <Message
                key={message.id}
                {...message}
                onDelete={onDeleteMessage}
                onRerun={onRerunMessage}
                onEdit={onEditMessage}
                onEditStateChange={handleEditStateChange}
                shouldAnimate={message.id === animatingMessageId}
                onAnimationComplete={() => setAnimatingMessageId(null)}
                isSystemTyping={isTyping}
                attachedFile={message.attachedFile}
                imageAnalysis={message.imageAnalysis}
              />
            ))}
            {/* Show typing indicator when AI is generating response */}
            {isTyping && <TypingIndicator />}
            {/* Invisible div for auto-scroll targeting */}
            <div ref={messagesEndRef} />
          </motion.div>
        )}
      </div>
    </div>
  );
}