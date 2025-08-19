import { useEffect, useRef } from "react";
import { Message } from "./Message";
import { motion } from "framer-motion";
import { starterTemplates } from '@/lib/starters';
import { StarterTemplates } from './StarterTemplates';
import { Bot } from "lucide-react";
import { type Conversation, type ChatMessage } from "@/lib/types";
import { AGENTS } from "@/lib/agents";

interface ChatProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  onSendMessage: (message: string) => void;
  onDeleteMessage: (messageId: string) => void;
  activeConversation: Conversation | undefined;
}

export function Chat({ messages, isTyping = false, onSendMessage, onDeleteMessage, activeConversation }: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
  
  const activeAgent = AGENTS.find(agent => agent.id === activeConversation?.agentId) || AGENTS[0];

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
          <div className="flex space-x-1">
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
      <div className="absolute inset-0 overflow-y-auto pb-24 pt-4"> {/* Add padding for floating input */}
        
        {/* Minimalist Header */}
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
            className="max-w-4xl mx-auto px-md-4"
          >
            {messages.map((message) => <Message key={message.id} {...message} onDelete={onDeleteMessage} />)}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </motion.div>
        )}
      </div>
    </div>
  );
}