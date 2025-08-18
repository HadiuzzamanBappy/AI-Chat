import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Chat } from "@/components/Chat";
import { ChatInput } from "@/components/ChatInput";
import { Navbar } from "@/components/Navbar";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: ChatMessage[];
}

// Mock data
const mockConversations: Conversation[] = [
  {
    id: "1",
    title: "Getting Started with AI",
    lastMessage: "Hello! How can I help you today?",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    messages: [
      {
        id: "1",
        content: "Hello! How can I help you today?",
        isUser: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 30)
      }
    ]
  },
  {
    id: "2", 
    title: "React Development Tips",
    lastMessage: "Here are some best practices...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    messages: [
      {
        id: "2",
        content: "Can you give me some React development tips?",
        isUser: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      {
        id: "3",
        content: "Here are some React best practices:\n\n1. **Use functional components** with hooks instead of class components\n2. **Keep components small** and focused on a single responsibility\n3. **Use TypeScript** for better type safety\n4. **Implement proper error boundaries**\n\n```jsx\nfunction MyComponent({ data }) {\n  const [state, setState] = useState(null);\n  \n  useEffect(() => {\n    // Side effects here\n  }, []);\n  \n  return <div>{data}</div>;\n}\n```\n\nWould you like me to elaborate on any of these points?",
        isUser: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 30)
      }
    ]
  }
];

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>("1");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const isMobile = useIsMobile();

  // Auto-close sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Chat",
      lastMessage: "",
      timestamp: new Date(),
      messages: []
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeConversationId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date()
    };

    // Add user message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              lastMessage: content,
              timestamp: new Date(),
              title: conv.messages.length === 0 ? content.slice(0, 50) + (content.length > 50 ? '...' : '') : conv.title
            }
          : conv
      )
    );

    // Show typing indicator
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: generateMockResponse(content),
        isUser: false,
        timestamp: new Date()
      };

      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, aiMessage],
                lastMessage: aiMessage.content.slice(0, 100) + (aiMessage.content.length > 100 ? '...' : ''),
                timestamp: new Date()
              }
            : conv
        )
      );

      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateMockResponse = (userMessage: string) => {
    const responses = [
      `That's an interesting question about "${userMessage.slice(0, 20)}...". Let me think about that and provide you with a comprehensive answer.\n\nHere are some key points to consider:\n\n• **First point**: This relates to the main topic you mentioned\n• **Second point**: There are several approaches to this\n• **Third point**: It's important to consider the broader context\n\nWould you like me to elaborate on any of these aspects?`,
      
      `I understand you're asking about "${userMessage.slice(0, 30)}...". This is a common question, and I'm happy to help!\n\n**Here's what I recommend:**\n\n1. Start by understanding the fundamentals\n2. Break down the problem into smaller parts\n3. Consider different perspectives\n4. Test your approach\n\n\`\`\`\n// Example code snippet\nfunction example() {\n  return "This demonstrates the concept";\n}\n\`\`\`\n\nLet me know if you need more specific guidance!`,
      
      `Great question! Regarding "${userMessage.slice(0, 25)}...", there are several important aspects to consider:\n\n**Key Considerations:**\n- Context and background\n- Current best practices\n- Potential challenges\n- Future implications\n\nThis is a complex topic that requires careful thought. Would you like me to dive deeper into any particular aspect?`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {isMobile && (
        <Navbar 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={activeConversation?.title || "ChatGPT"}
        />
      )}
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          isMobile={isMobile}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="flex-1 flex flex-col">
          <Chat messages={messages} isTyping={isTyping} />
          <ChatInput 
            onSendMessage={handleSendMessage} 
            disabled={isTyping}
            placeholder={messages.length === 0 ? "Start a conversation..." : "Type your message..."}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
