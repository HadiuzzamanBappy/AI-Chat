import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Chat } from "@/components/Chat";
import { ChatInput } from "@/components/ChatInput";
import { Navbar } from "@/components/Navbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { PROVIDERS, AVAILABLE_MODELS } from "@/lib/data";
import { type Conversation, type ChatMessage } from "@/lib/types";
import { AGENTS } from "@/lib/agents";
import { defaultKnowledgebase } from '@/lib/default-knowledgebase';

interface FilePayload {
  name: string;
  content: string;
}

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isAppLoaded, setIsAppLoaded] = useState(false);

  const [providerStatus, setProviderStatus] = useState<Record<string, 'ok' | 'limit_exceeded'>>({
    'openrouter': 'ok',
    'openai': 'ok'
  });
  const [selectedModel, setSelectedModel] = useState<string>(AVAILABLE_MODELS[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    let loadedConversations: Conversation[] = [];
    try {
      const savedData = localStorage.getItem("chat_conversations");
      if (savedData) {
        const parsed = JSON.parse(savedData) as Conversation[];
        loadedConversations = parsed.map(conv => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
          messages: conv.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      }
    } catch (error) {
      console.error("Failed to parse conversations from localStorage", error);
    }

    if (loadedConversations.length === 0) {
      const agent = AGENTS[0];
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: "Untitled",
        lastMessage: "",
        timestamp: new Date(),
        messages: [],
        modelId: selectedModel,
        agentId: agent.id,
      };
      setConversations([newConversation]);
      setActiveConversationId(newConversation.id);
    } else {
      setConversations(loadedConversations);
      const lastActiveId = localStorage.getItem("active_conversation_id");
      const lastActiveConversation = loadedConversations.find(c => c.id === lastActiveId);

      if (lastActiveConversation) {
        setActiveConversationId(lastActiveConversation.id);
        setSelectedModel(lastActiveConversation.modelId);
      } else {
        setActiveConversationId(loadedConversations[0].id);
        setSelectedModel(loadedConversations[0].modelId);
      }
    }
    setIsAppLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAppLoaded) return;
    try {
      localStorage.setItem("chat_conversations", JSON.stringify(conversations));
      if (activeConversationId) {
        localStorage.setItem("active_conversation_id", activeConversationId);
      }
    } catch (error) {
      console.error("Failed to save to localStorage", error);
    }
  }, [conversations, activeConversationId, isAppLoaded]);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  const handleNewChat = (agentId: string = 'default') => {
    const agent = AGENTS.find(a => a.id === agentId) || AGENTS[0];
    const newConversation: Conversation = {
      id: Date.now().toString(),
      // UPDATED: The title is now clean and simple.
      title: "Untitled",
      lastMessage: "",
      timestamp: new Date(),
      messages: [],
      modelId: selectedModel,
      agentId: agent.id,
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    if (isMobile) setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setActiveConversationId(id);
      setSelectedModel(conversation.modelId);
    }
    if (isMobile) setSidebarOpen(false);
  };

  // NEW: Smart model selection logic
  const selectBestModel = (prompt: string): string => {
    const lowerCasePrompt = prompt.toLowerCase();

    // Keywords that suggest a need for a coding model
    const codeKeywords = ['javascript', 'python', 'react', 'sql', 'function', 'component', '```', 'code'];

    // Keywords for creative tasks
    const creativeKeywords = ['write', 'poem', 'story', 'idea', 'suggest', 'imagine'];

    if (codeKeywords.some(keyword => lowerCasePrompt.includes(keyword))) {
      // Find the first available free model tagged with 'code'
      const codeModel = AVAILABLE_MODELS.find(m => m.providerId === 'openrouter' && m.capabilities.includes('code'));
      if (codeModel) return codeModel.id;
    }

    if (creativeKeywords.some(keyword => lowerCasePrompt.includes(keyword))) {
      const creativeModel = AVAILABLE_MODELS.find(m => m.providerId === 'openrouter' && m.capabilities.includes('creative'));
      if (creativeModel) return creativeModel.id;
    }

    // Default to the first available fast, free model
    const fastModel = AVAILABLE_MODELS.find(m => m.providerId === 'openrouter' && m.capabilities.includes('fast'));
    return fastModel ? fastModel.id : 'openrouter/auto'; // Fallback
  };

  const handleSendMessage = async (message: string, file?: FilePayload) => {
    if (!activeConversationId || !activeConversation) return;

    let combinedContent = message;
    if (file) {
      combinedContent = `Attached File: "${file.name}"\n\n---\n\n${file.content}\n\n---\n\n${message}`;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: combinedContent,
      isUser: true,
      timestamp: new Date()
    };

    // This optimistic update is correct and remains unchanged.
    const updatedConversations = conversations.map(conv =>
      conv.id === activeConversationId
        ? {
          ...conv,
          messages: [...conv.messages, userMessage],
          lastMessage: message,
          timestamp: new Date(),
          title: conv.messages.length === 0
            ? message.slice(0, 40) + (message.length > 40 ? '...' : '')
            : conv.title,
        }
        : conv
    );

    setConversations(updatedConversations);
    setIsTyping(true);

    // --- FIX #1: Use the 'selectedModel' from state, not the old model from the conversation object. ---
    // This ensures the model you picked in the dropdown is the one that gets used.
    let finalModelId = selectedModel;

    // The "Auto" selection logic correctly uses the newly determined model ID.
    if (selectedModel === 'openrouter/auto') {
      finalModelId = selectBestModel(combinedContent);
    }

    const model = AVAILABLE_MODELS.find(m => m.id === finalModelId);
    const provider = PROVIDERS.find(p => p.id === model?.providerId);
    const agent = AGENTS.find(a => a.id === activeConversation.agentId) || AGENTS[0];

    if (!model || !provider) {
      console.error("Active conversation is missing a valid model or provider.");
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Error: Could not find a valid model or provider for this conversation.",
        isUser: false,
        timestamp: new Date()
      };
      setConversations(prev => prev.map(conv => conv.id === activeConversationId ? { ...conv, messages: [...conv.messages, errorMessage] } : conv));
      setIsTyping(false);
      return;
    }

    // API Key logic is correct and remains unchanged.
    const apiKey = localStorage.getItem(provider.apiKeyEnvVar) || import.meta.env[provider.apiKeyEnvVar];
    if (!apiKey) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `API Key for ${provider.name} is not configured. Please add it to your settings.`,
        isUser: false,
        timestamp: new Date()
      };
      setConversations(prev => prev.map(conv => conv.id === activeConversationId ? { ...conv, messages: [...conv.messages, errorMessage] } : conv));
      setIsTyping(false);
      return;
    }

    // The API model ID formatting is correct and remains unchanged.
    let apiModelId = finalModelId;
    if (provider.id !== 'openrouter' && apiModelId.includes('/')) {
      apiModelId = apiModelId.split('/')[1];
    }

    // Knowledgebase and message preparation logic is correct and remains unchanged.
    let knowledgebaseContent = localStorage.getItem('user_knowledgebase');
    if (!knowledgebaseContent) {
      const feedDefaultSetting = localStorage.getItem('feed_default_kb');
      if (feedDefaultSetting === null || JSON.parse(feedDefaultSetting) === true) {
        knowledgebaseContent = defaultKnowledgebase.content;
      }
    }
    const systemPromptContent = [agent.systemPrompt, knowledgebaseContent].filter(Boolean).join('\n\n');
    const systemMessage = { role: 'system', content: systemPromptContent };
    const userAndAssistantMessages = updatedConversations
      .find(c => c.id === activeConversationId)
      ?.messages.map(msg => ({ role: msg.isUser ? "user" : "assistant", content: msg.content })) || [];
    const apiMessages = [systemMessage, ...userAndAssistantMessages];

    console.log(`Sending to ${provider.name} with model ${apiModelId}:`, apiMessages);

    try {
      const response = await fetch('/api/chat', { // Call your own API endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: apiMessages, // The message history
          providerId: provider.id, // Tell the server which provider to use
          modelId: apiModelId, // Tell the server which model to use
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          setProviderStatus(prev => ({ ...prev, [provider.id]: 'limit_exceeded' }));
        }
        const errorData = await response.json();
        throw new Error(errorData.error.message || "An error occurred with the API.");
      }

      const data = await response.json();
      const aiContent = data.choices[0]?.message?.content;

      if (aiContent) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: aiContent,
          isUser: false,
          timestamp: new Date()
        };
        setConversations(prev =>
          prev.map(conv =>
            conv.id === activeConversationId
              ? {
                ...conv,
                messages: [...conv.messages, aiMessage],
                lastMessage: aiContent.slice(0, 50) + (aiContent.length > 50 ? '...' : ''),
                timestamp: new Date(),
                // --- FIX #2: Save the model that was just used to the conversation history. ---
                // This ensures the correct model is remembered for the next message and when you reload.
                modelId: selectedModel,
              }
              : conv
          )
        );
      }
    } catch (error) {
      console.error(`Error calling ${provider.name} API:`, error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error from the ${provider.name} API: ${error instanceof Error ? error.message : "Unknown error"}`,
        isUser: false,
        timestamp: new Date()
      };
      setConversations(prev => prev.map(conv => conv.id === activeConversationId ? { ...conv, messages: [...conv.messages, errorMessage] } : conv));
    } finally {
      setIsTyping(false);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!activeConversationId) return;

    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversationId
          ? {
            ...conv,
            messages: conv.messages.filter(msg => msg.id !== messageId),
          }
          : conv
      )
    );
  };

  if (!isAppLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Loading Chat...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {isMobile && (
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={activeConversation?.title || "Personal AI"}
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
          <Chat
            messages={messages}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            activeConversation={activeConversation}
          />
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isTyping}
            placeholder={messages.length === 0 ? "Start a conversation..." : "Type your message..."}
            models={AVAILABLE_MODELS}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            providerStatus={providerStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;