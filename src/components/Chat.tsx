import { useEffect, useRef } from "react";
import { Message } from "./Message";
import { motion } from "framer-motion";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatProps {
  messages: ChatMessage[];
  isTyping?: boolean;
}

export function Chat({ messages, isTyping = false }: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-chat-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            How can I help you today?
          </h2>
          <p className="text-muted-foreground">
            Start a conversation by typing a message below. I'm here to assist you with any questions or tasks you have.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto bg-chat-background"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto py-6"
      >
        {messages.map((message) => (
          <Message
            key={message.id}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
            isTyping={message.isTyping}
          />
        ))}
        
        {isTyping && (
          <Message
            content=""
            isUser={false}
            timestamp={new Date()}
            isTyping={true}
          />
        )}
        
        <div ref={messagesEndRef} />
      </motion.div>
    </div>
  );
}