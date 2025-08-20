// src/components/chat.tsx

import { useEffect, useRef, useState } from "react";
import { Message } from "./Message";
import { motion } from "framer-motion";
import { starterTemplates } from '@/lib/starters';
import { StarterTemplates } from './StarterTemplates';
import { Bot } from "lucide-react";
import { type Conversation, type ChatMessage } from "@/lib/types";
import { AGENTS } from "@/lib/agents";

// --- NEW: A custom hook to get the previous value of a prop or state ---
// This is a standard and robust way to handle state transitions.
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// Interface for the component's props
interface ChatProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  onSendMessage: (message: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onRerunMessage: (messageId: string) => void;
  activeConversation: Conversation | undefined;
}

export function Chat({ messages, isTyping = false, onSendMessage, onDeleteMessage, onRerunMessage, activeConversation }: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [animatingMessageId, setAnimatingMessageId] = useState<string | null>(null);

  // --- THE FIX: Use our new custom hook to reliably get the previous typing state ---
  const prevIsTyping = usePrevious(isTyping);

  const activeAgent = AGENTS.find(agent => agent.id === activeConversation?.agentId) || AGENTS[0];

  // This effect now correctly detects the transition to trigger the animation.
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    
    // The condition is now clear and reliable:
    // "If the previous state was typing, and the current state is NOT typing..."
    if (prevIsTyping === true && !isTyping && lastMessage && !lastMessage.isUser) {
      setAnimatingMessageId(lastMessage.id);
    }
  }, [isTyping, messages, prevIsTyping]); // Add prevIsTyping to dependency array


  // This effect for auto-scrolling is correct and remains unchanged.
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    scrollToBottom();
    const container = chatContainerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(scrollToBottom);
    observer.observe(container);
    return () => observer.disconnect();
  }, [messages, isTyping]);


  const TypingIndicator = () => (
    // This component remains unchanged.
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
      <div className="absolute inset-0 overflow-y-auto pb-14 pt-4">
        
        {/* Chat Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-secondary p-3 rounded-full mb-2">
            <activeAgent.icon className="h-6 w-6 text-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">{activeAgent.name}</h2>
          <p className="text-sm text-muted-foreground">{activeAgent.description}</p>
        </div>
        
        {messages.length === 0 ? (
          <StarterTemplates starters={starterTemplates} onSelectStarter={onSendMessage} />
        ) : (
          <motion.div
            ref={chatContainerRef}
            className="max-w-4xl mx-auto px-md-4"
          >
            {messages.map((message) => (
              <Message
                key={message.id}
                {...message}
                onDelete={onDeleteMessage}
                onRerun={onRerunMessage}
                shouldAnimate={message.id === animatingMessageId}
                onAnimationComplete={() => setAnimatingMessageId(null)}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </motion.div>
        )}
      </div>
    </div>
  );
}