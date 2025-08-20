import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Chat } from "@/components/Chat";
import { ChatInput } from "@/components/ChatInput";
import { Navbar } from "@/components/Navbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { PROVIDERS, AVAILABLE_MODELS } from "@/lib/data";
import { type Conversation, type ChatMessage, type Agent } from "@/lib/types";
import { AGENTS as DEFAULT_AGENTS } from "@/lib/agents"; // This contains the original agent data with icon components
import { defaultKnowledgebase } from '@/lib/default-knowledgebase';
import { MessageSquare } from "lucide-react";

interface FilePayload {
  name: string;
  content: string;
}

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(DEFAULT_AGENTS[0].id);
  const [providerStatus, setProviderStatus] = useState<Record<string, 'ok' | 'limit_exceeded'>>({ 'openrouter': 'ok', 'openai': 'ok' });
  const [selectedModel, setSelectedModel] = useState<string>(AVAILABLE_MODELS[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const isMobile = useIsMobile();
  const [sendFullContext, setSendFullContext] = useState(true);

  useEffect(() => {
    // 1. Load Agents from localStorage and "Rehydrate" them
    let loadedAgents: Agent[] = DEFAULT_AGENTS;
    try {
      const savedAgents = localStorage.getItem("chat_agents");
      if (savedAgents) {
        const parsedAgents: Agent[] = JSON.parse(savedAgents);
        // --- THE FIX: Re-assign the icon component from the original data source ---
        loadedAgents = parsedAgents.map(savedAgent => {
          const defaultAgent = DEFAULT_AGENTS.find(d => d.id === savedAgent.id);
          return {
            ...savedAgent,
            icon: defaultAgent ? defaultAgent.icon : MessageSquare, // Fallback icon
          };
        });
      }
    } catch (e) { console.error("Failed to load agents from localStorage", e); }
    setAgents(loadedAgents);

    // 2. Load Selected Agent
    const savedSelectedAgentId = localStorage.getItem("selected_agent_id");
    if (savedSelectedAgentId && loadedAgents.find(a => a.id === savedSelectedAgentId)) {
      setSelectedAgentId(savedSelectedAgentId);
    } else if (loadedAgents.length > 0) {
      setSelectedAgentId(loadedAgents[0].id);
    }
    
    // 3. Load Conversations
    let loadedConversations: Conversation[] = [];
    try {
        const savedData = localStorage.getItem("chat_conversations");
        if (savedData) {
            const parsed = JSON.parse(savedData) as Conversation[];
            loadedConversations = parsed.filter(c => c.messages.length > 0).map(conv => ({
                ...conv,
                timestamp: new Date(conv.timestamp),
                messages: conv.messages.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) }))
            }));
        }
    } catch (error) { console.error("Failed to load conversations from localStorage", error); }
    
    setConversations(loadedConversations);

    if (loadedConversations.length > 0) {
        const lastActiveId = localStorage.getItem("active_conversation_id");
        const lastActiveConv = loadedConversations.find(c => c.id === lastActiveId);
        if (lastActiveConv) {
            setActiveConversationId(lastActiveConv.id);
            setSelectedModel(lastActiveConv.modelId);
        } else {
            setActiveConversationId(loadedConversations[0].id);
            setSelectedModel(loadedConversations[0].modelId);
        }
    } else {
        setActiveConversationId(null);
    }
    setIsAppLoaded(true);
  }, []);

  // --- Effect to save agent state to localStorage ---
  useEffect(() => {
    if (!isAppLoaded) return;
    try {
      // Create a version of agents safe for stringifying (without the icon function)
      const agentsToSave = agents.map(({ icon, ...rest }) => rest);
      localStorage.setItem("chat_agents", JSON.stringify(agentsToSave));
      localStorage.setItem("selected_agent_id", selectedAgentId);
    } catch (error) { console.error("Failed to save agent state to localStorage", error); }
  }, [agents, selectedAgentId, isAppLoaded]);

  // Effect for saving conversations
  useEffect(() => {
    if (!isAppLoaded) return;
    try {
      const conversationsToSave = conversations.filter(c => c.messages.length > 0);
      localStorage.setItem("chat_conversations", JSON.stringify(conversationsToSave));
      if (activeConversationId) {
        localStorage.setItem("active_conversation_id", activeConversationId);
      }
    } catch (error) { console.error("Failed to save conversations to localStorage", error); }
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

  const handleModelChange = (newModelId: string) => {
    setSelectedModel(newModelId);
    if (!activeConversationId) return;
    setConversations(prev => prev.map(conv => conv.id === activeConversationId ? { ...conv, modelId: newModelId } : conv));
  };

  const handleAgentChange = (agentId: string) => {
    setSelectedAgentId(agentId);
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
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

  const selectBestModel = (prompt: string): string => {
    const lowerCasePrompt = prompt.toLowerCase();
    const codeKeywords = ['javascript', 'python', 'react', 'sql', 'function', 'component', '```', 'code'];
    const creativeKeywords = ['write', 'poem', 'story', 'idea', 'suggest', 'imagine'];
    if (codeKeywords.some(keyword => lowerCasePrompt.includes(keyword))) {
      const codeModel = AVAILABLE_MODELS.find(m => m.providerId === 'openrouter' && m.capabilities.includes('code'));
      if (codeModel) return codeModel.id;
    }
    if (creativeKeywords.some(keyword => lowerCasePrompt.includes(keyword))) {
      const creativeModel = AVAILABLE_MODELS.find(m => m.providerId === 'openrouter' && m.capabilities.includes('creative'));
      if (creativeModel) return creativeModel.id;
    }
    const fastModel = AVAILABLE_MODELS.find(m => m.providerId === 'openrouter' && m.capabilities.includes('fast'));
    return fastModel ? fastModel.id : 'openrouter/auto';
  };

  const fetchApiResponse = async (conversationForApi: Conversation, messageHistory: ChatMessage[]) => {
    if (!conversationForApi) return;
    setIsTyping(true);

    let finalModelId = conversationForApi.modelId;
    if (conversationForApi.modelId === 'openrouter/auto') {
      const lastUserMessage = (() => {
        for (let i = messageHistory.length - 1; i >= 0; i--) {
          if (messageHistory[i].isUser) return messageHistory[i].content;
        }
        return "";
      })();
      finalModelId = selectBestModel(lastUserMessage);
    }

    const model = AVAILABLE_MODELS.find(m => m.id === finalModelId);
    const provider = PROVIDERS.find(p => p.id === model?.providerId);
    const agent = agents.find(a => a.id === conversationForApi.agentId) || agents[0];

    if (!model || !provider) {
      console.error("Active conversation is missing a valid model or provider.");
      // Add an error message to the chat for the user
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

    const apiKey = localStorage.getItem(provider.apiKeyEnvVar) || import.meta.env[provider.apiKeyEnvVar];

    if (!apiKey) {
      // Add an error message to the chat for the user
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

    let apiModelId = finalModelId;

    if (provider.id !== 'openrouter' && apiModelId.includes('/')) {
      apiModelId = apiModelId.split('/')[1];
    }
    // --- FIX ENDS HERE ---

    // --- Knowledgebase Logic ---
    let knowledgebaseContent = localStorage.getItem('user_knowledgebase');
    if (!knowledgebaseContent) {
      const feedDefaultSetting = localStorage.getItem('feed_default_kb');
      if (feedDefaultSetting === null || JSON.parse(feedDefaultSetting) === true) {
        knowledgebaseContent = defaultKnowledgebase.content;
      }
    }
    const systemPromptContent = [agent.systemPrompt, knowledgebaseContent].filter(Boolean).join('\n\n');
    const systemMessage = { role: 'system', content: systemPromptContent };

    const messagesToSendToApi = sendFullContext
      ? messageHistory.map(msg => ({ role: (msg.isUser ? "user" : "assistant") as "user" | "assistant", content: msg.content }))
      : [messageHistory.at(-1)].filter((msg): msg is ChatMessage => !!msg).map(msg => ({ role: (msg.isUser ? "user" : "assistant") as "user" | "assistant", content: msg.content }));

    const apiMessages = [systemMessage, ...messagesToSendToApi];

    try {
      const response = await fetch(provider.apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": `${window.location.host}`,
          "X-Title": "AI Chat",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: apiModelId,
          messages: apiMessages,
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
          timestamp: new Date(),
          modelName: model.name, // Use finalModelId for consistency
          agentName: agent.name
        };
        setConversations(prev =>
          prev.map(conv =>
            conv.id === conversationForApi.id
              ? {
                ...conv,
                messages: [...conv.messages, aiMessage],
                lastMessage: aiContent.slice(0, 50) + (aiContent.length > 50 ? '...' : ''),
                timestamp: new Date()
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

  const handleSendMessage = async (message: string, file?: FilePayload) => {
    let combinedContent = message;
    if (file) { combinedContent = `Attached File: "${file.name}"\n\n---\n\n${file.content}\n\n---\n\n${message}`; }

    const userMessage: ChatMessage = { id: Date.now().toString(), content: combinedContent, isUser: true, timestamp: new Date() };

    if (!activeConversationId) {
      // This is the FIRST message of a NEW chat
      const agent = agents.find(a => a.id === selectedAgentId) || agents[0];
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: message.slice(0, 40) + (message.length > 40 ? '...' : ''),
        lastMessage: message,
        timestamp: new Date(),
        messages: [userMessage],
        modelId: selectedModel,
        agentId: agent.id,
      };

      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(newConversation.id);
      await fetchApiResponse(newConversation, newConversation.messages);
    } else {
      // This is a message in an EXISTING chat
      let updatedConversation: Conversation | undefined;
      const updatedConversations = conversations.map(conv => {
        if (conv.id === activeConversationId) {
          updatedConversation = { ...conv, messages: [...conv.messages, userMessage], lastMessage: message, timestamp: new Date() };
          return updatedConversation;
        }
        return conv;
      });
      setConversations(updatedConversations);
      
      if (updatedConversation) {
        await fetchApiResponse(updatedConversation, updatedConversation.messages);
      }
    }
  };

  const handleRerunMessage = async (messageId: string) => {
    const conversation = conversations.find(c => c.id === activeConversationId);
    if (!conversation) return;
    const messageIndex = conversation.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1 || !conversation.messages[messageIndex].isUser) return;

    const truncatedMessages = conversation.messages.slice(0, messageIndex + 1);
    
    let updatedConversation: Conversation | undefined;
    const updatedConversations = conversations.map(conv => {
        if (conv.id === activeConversationId) {
            updatedConversation = { ...conv, messages: truncatedMessages };
            return updatedConversation;
        }
        return conv;
    });
    setConversations(updatedConversations);

    if (updatedConversation) {
      await fetchApiResponse(updatedConversation, truncatedMessages);
    }
  };

  const handleDeleteConversation = (conversationId: string) => {
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    if (activeConversationId === conversationId) {
      if (updatedConversations.length > 0) {
        handleSelectConversation(updatedConversations[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!activeConversationId) return;
    setConversations(prev => prev.map(conv => conv.id === activeConversationId ? { ...conv, messages: conv.messages.filter(msg => msg.id !== messageId) } : conv));
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
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} title={activeConversation?.title || "New Chat"} />
      )}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          isMobile={isMobile}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          agents={agents}
          selectedAgentId={selectedAgentId}
          onAgentChange={handleAgentChange}
        />
        <div className="flex-1 flex flex-col">
          <Chat
            messages={messages}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            onRerunMessage={handleRerunMessage}
            activeConversation={activeConversation}
          />
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isTyping}
            placeholder={!activeConversationId ? "Start a new conversation..." : "Type your message..."}
            models={AVAILABLE_MODELS}
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            providerStatus={providerStatus}
            isFullContext={sendFullContext}
            onIsFullContextChange={setSendFullContext}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;