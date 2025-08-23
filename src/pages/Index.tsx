import { useState, useEffect } from "react";
// removed unused imports
import { Sidebar } from "@/components/Sidebar";
import { Chat } from "@/components/Chat";
import { ChatInput } from "@/components/ChatInput";
import { Navbar } from "@/components/Navbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { PROVIDERS, AVAILABLE_MODELS } from "@/lib/data";
import { estimateTokens, getTokenLimit, trimMessagesToFit, calculateMessageTokens } from "@/lib/token-utils";
import { type Conversation, type ChatMessage, type Agent } from "@/lib/types";
import { AGENTS as DEFAULT_AGENTS } from "@/lib/agents"; // This contains the original agent data with icon components
import { defaultKnowledgebase } from '@/lib/default-knowledgebase';
import { analyzeWithHuggingFace } from '@/lib/image-analysis';
import { MessageSquare } from "lucide-react";

interface FilePayload {
  name: string;
  content: string;
  size?: number;
  type?: string;
}

interface InitialPayload {
  message: string | null;
  file: { 
    name: string; 
    content: string; 
  } | null;
}

const Index = ({ initialPayloadFromOnboard = { message: null, file: null } }: { initialPayloadFromOnboard?: InitialPayload }) => {
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
  
  // Debug wrapper for full context toggle
  const handleFullContextChange = (value: boolean) => {
    console.log('🔄 Full Context Toggle:', { from: sendFullContext, to: value });
    setSendFullContext(value);
  };
  
  // removed unused location and navigate

  useEffect(() => {
    const sendInitialPayload = async () => {
      // The crucial check: Do nothing until the app has finished loading its data
      if (!isAppLoaded) {
        return;
      }

      // Now that we're loaded, check if there's an initial payload to send
      if (initialPayloadFromOnboard) {
        const { message, file } = initialPayloadFromOnboard;

        // Only proceed if there's actually a message or a file
        if (message || file) {
          // Await the entire send process
          await handleSendMessage(
            message || '', // Pass message or empty string
            file || undefined // Pass file or undefined
          );
        }
      }
    };

    sendInitialPayload();

  }, [isAppLoaded, initialPayloadFromOnboard]);

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
      // Remove images from messages before saving to localStorage to prevent quota issues
      const conversationsToSave = conversations.filter(c => c.messages.length > 0).map(conv => ({
        ...conv,
        messages: conv.messages.map(msg => ({
          ...msg,
          // Keep only image metadata, not the actual base64 content
          attachedFile: msg.attachedFile?.type?.startsWith('image/') 
            ? { 
                name: msg.attachedFile.name, 
                type: msg.attachedFile.type, 
                size: msg.attachedFile.size,
                content: '' // Remove base64 content from localStorage
              }
            : msg.attachedFile
        }))
      }));
      
      localStorage.setItem("chat_conversations", JSON.stringify(conversationsToSave));
      if (activeConversationId) {
        localStorage.setItem("active_conversation_id", activeConversationId);
      }
    } catch (error) { 
      console.error("Failed to save conversations to localStorage", error); 
      
      // If still failing, try saving without any attachments
      try {
        const minimalConversations = conversations.filter(c => c.messages.length > 0).map(conv => ({
          ...conv,
          messages: conv.messages.map(msg => ({
            ...msg,
            attachedFile: undefined // Remove all attachments as fallback
          }))
        }));
        localStorage.setItem("chat_conversations", JSON.stringify(minimalConversations));
        console.log("💾 Saved conversations without attachments as fallback");
      } catch (fallbackError) {
        console.error("Even fallback save failed:", fallbackError);
      }
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

  // This function is now provider-agnostic.
  const selectBestModel = (prompt: string, providerId: string): string => {
    const lowerCasePrompt = prompt.toLowerCase();
    const codeKeywords = ['javascript', 'python', 'react', 'sql', 'function', 'component', '```', 'code'];
    const creativeKeywords = ['write', 'poem', 'story', 'idea', 'suggest', 'imagine'];

    // First, filter the models to only include those from the requested provider
    const modelsForProvider = AVAILABLE_MODELS.filter(m => m.providerId === providerId);

    // Check for file attachment capability first (most specific)
    const hasFileAttached = lowerCasePrompt.includes('image') || lowerCasePrompt.includes('file') || lowerCasePrompt.includes('picture') || lowerCasePrompt.includes('photo') || lowerCasePrompt.includes('uploaded');
    if (hasFileAttached) {
      const visionModel = modelsForProvider.find(m => m.capabilities.includes('vision') || m.capabilities.includes('files'));
      if (visionModel) {
        console.log('🎯 Auto-selected vision model:', visionModel.name);
        return visionModel.id;
      }
    }

    // Now, find the best model within that provider's list
    if (codeKeywords.some(keyword => lowerCasePrompt.includes(keyword))) {
      const codeModel = modelsForProvider.find(m => m.capabilities.includes('code'));
      if (codeModel) return codeModel.id;
    }
    if (creativeKeywords.some(keyword => lowerCasePrompt.includes(keyword))) {
      const creativeModel = modelsForProvider.find(m => m.capabilities.includes('creative'));
      if (creativeModel) return creativeModel.id;
    }

    // Fallback to the fastest model for that provider
    const fastModel = modelsForProvider.find(m => m.capabilities.includes('fast'));

    // If no suitable model is found, return the original "auto" id for that provider
    return fastModel ? fastModel.id : `${providerId}/auto`;
  };

  const fetchApiResponse = async (conversationForApi: Conversation, messageHistory: ChatMessage[]) => {
    if (!conversationForApi) return;
    setIsTyping(true);

    let finalModelId = conversationForApi.modelId;
    
    // Check if last message has file attachments 
    const lastMessage = messageHistory[messageHistory.length - 1];
    const hasTextFileAttachment = lastMessage?.attachedFile && !lastMessage.attachedFile?.type?.startsWith('image/');
    const hasImageAttachment = lastMessage?.attachedFile && lastMessage.attachedFile?.type?.startsWith('image/');
    
    console.log('🔍 File Attachment Check:', {
      hasTextFileAttachment,
      hasImageAttachment,
      currentModel: finalModelId
    });
    
    if (finalModelId.endsWith('/auto')) {
      // --- FIX #1: Select the first element after splitting ---
      // This correctly extracts "openrouter" as a string from "openrouter/auto"
      const providerId = finalModelId.split('/')[0];

      const lastUserMessage = (() => {
        for (let i = messageHistory.length - 1; i >= 0; i--) {
          if (messageHistory[i].isUser) return messageHistory[i].content;
        }
        return "";
      })();

      finalModelId = selectBestModel(lastUserMessage + (hasImageAttachment ? ' image file attached' : hasTextFileAttachment ? ' text file attached' : ''), providerId);
    }
    
    // Force vision-capable model if IMAGE is attached but current model doesn't support it
    if (hasImageAttachment) {
      const currentModel = AVAILABLE_MODELS.find(m => m.id === finalModelId);
      const supportsVision = currentModel?.capabilities.includes('vision') || currentModel?.capabilities.includes('files');
      
      if (!supportsVision) {
        // Look for vision models, prioritizing FREE models first
        let visionModel = AVAILABLE_MODELS.find(m => m.id === 'google/gemini-flash-1.5' && m.capabilities.includes('vision'));
        
        if (!visionModel) {
          visionModel = AVAILABLE_MODELS.find(m => m.id === 'gpt-4o-mini' && m.capabilities.includes('vision'));
        }
        
        if (!visionModel) {
          visionModel = AVAILABLE_MODELS.find(m => m.id === 'gpt-4o' && m.capabilities.includes('vision'));
        }
        
        if (!visionModel) {
          visionModel = AVAILABLE_MODELS.find(m => m.capabilities.includes('vision') || m.capabilities.includes('files'));
        }
        
        if (visionModel) {
          finalModelId = visionModel.id;
          console.log('🔄 SWITCHED to vision model for image:', visionModel.name, 'ID:', visionModel.id);
          
          // Update selected model
          setSelectedModel(visionModel.id);
          
          // Update conversation model
          setConversations(prev => prev.map(conv => 
            conv.id === activeConversationId 
              ? { ...conv, modelId: visionModel.id } 
              : conv
          ));
        } else {
          console.warn('⚠️ No vision model found! Available models:', 
            AVAILABLE_MODELS.map(m => ({ id: m.id, capabilities: m.capabilities }))
          );
        }
      }
    }

    const model = AVAILABLE_MODELS.find(m => m.id === finalModelId);
    const provider = PROVIDERS.find(p => p.id === model?.providerId);
    const agent = agents.find(a => a.id === conversationForApi.agentId) || agents[0];
    
    console.log('🚀 Final API Call Details:', {
      finalModelId,
      model: model?.name,
      provider: provider?.name,
      hasTextFileAttachment,
      hasImageAttachment,
      supportsVision: model?.capabilities.includes('vision'),
      modelCapabilities: model?.capabilities
    });

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
      if (feedDefaultSetting !== null && JSON.parse(feedDefaultSetting) === true) {
        knowledgebaseContent = defaultKnowledgebase.content;
      }
    }
    const systemPromptContent = [agent.systemPrompt, knowledgebaseContent].filter(Boolean).join('\n\n');
    const systemMessage = { role: 'system', content: systemPromptContent };
    const systemPromptTokens = estimateTokens(systemPromptContent);

    // Get token limit for the model
    const tokenLimit = getTokenLimit(finalModelId);
    console.log('🔍 Token Management:', {
      model: finalModelId,
      limit: tokenLimit,
      systemTokens: systemPromptTokens,
      totalMessages: messageHistory.length
    });

    // Trim messages to fit within token limit
    const trimmedMessages = trimMessagesToFit(messageHistory, tokenLimit, systemPromptTokens);
    const messageTokenCount = calculateMessageTokens(trimmedMessages);
    const totalTokens = systemPromptTokens + messageTokenCount;

    // Log conversation history for debugging
    console.log('📚 Original Message History:', messageHistory.length, 'messages');
    console.log('✂️ After Trimming:', trimmedMessages.length, 'messages');
    console.log('📋 Available Messages:');
    trimmedMessages.forEach((msg, index) => {
      const preview = msg.content.slice(0, 80).replace(/\n/g, ' ');
      console.log(`  ${index + 1}. [${msg.isUser ? 'USER' : 'ASSISTANT'}]: ${preview}${msg.content.length > 80 ? '...' : ''}`);
    });

    console.log('📊 Token Usage:', {
      systemTokens: systemPromptTokens,
      messageTokens: messageTokenCount,
      totalTokens: totalTokens,
      limit: tokenLimit,
      trimmedFrom: messageHistory.length,
      trimmedTo: trimmedMessages.length,
      withinLimit: totalTokens <= tokenLimit
    });

    // If still over limit, show warning
    if (totalTokens > tokenLimit) {
      const warningMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `⚠️ **Token Limit Warning**: Your request (~${totalTokens} tokens) exceeds the model's limit (${tokenLimit} tokens). The conversation has been automatically trimmed to fit.`,
        isUser: false,
        timestamp: new Date()
      };
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId 
          ? { ...conv, messages: [...conv.messages, warningMessage] } 
          : conv
      ));
    }

    const messagesToSendToApi = sendFullContext
      ? trimmedMessages.map(msg => {
          // For Full Context: Always send only text content (exclude images)
          return {
            role: (msg.isUser ? "user" : "assistant") as "user" | "assistant", 
            content: msg.content
          };
        })
      : [trimmedMessages.at(-1)].filter((msg): msg is ChatMessage => !!msg).map(msg => {
          const baseMessage = {
            role: (msg.isUser ? "user" : "assistant") as "user" | "assistant", 
            content: msg.content
          };
          
          // For single message: Include image for vision models if available
          if (msg.attachedFile && msg.attachedFile.type?.startsWith('image/') && 
              (model.capabilities.includes('vision') || model.capabilities.includes('files'))) {
            return {
              role: baseMessage.role,
              content: [
                { type: "text", text: msg.content },
                { 
                  type: "image_url", 
                  image_url: { 
                    url: `data:${msg.attachedFile.type};base64,${msg.attachedFile.content}` 
                  } 
                }
              ]
            };
          }
          
          return baseMessage;
        });

    // Debug logging for full context functionality
    console.log('🔍 Full Context Debug:', {
      sendFullContext,
      trimmedMessagesCount: trimmedMessages.length,
      messagesToSendToApiCount: messagesToSendToApi.length,
      mode: sendFullContext ? 'FULL CONTEXT - All messages' : 'SINGLE MESSAGE - Last message only'
    });

    // Detailed message content logging
    console.log(`📨 ${sendFullContext ? 'FULL CONTEXT' : 'SINGLE MESSAGE'} - Messages Being Sent to API:`);
    if (messagesToSendToApi.length === 0) {
      console.log('  ⚠️ No messages to send!');
    } else {
      messagesToSendToApi.forEach((msg, index) => {
        console.log(`  ${index + 1}. [${msg.role.toUpperCase()}]: ${msg.content.slice(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
      });
    }
    console.log('─'.repeat(50));

    const apiMessages = [systemMessage, ...messagesToSendToApi];

    // Log the final API request for debugging
    console.log('🚀 API Request Details:', {
      model: model?.name,
      modelId: finalModelId,
      provider: provider?.name,
      messageCount: messagesToSendToApi.length,
      hasTextFileAttachment,
      lastMessageContent: messagesToSendToApi[messagesToSendToApi.length - 1]?.content?.slice(0, 100) + '...'
    });

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

      console.log('API Request:', {
        url: provider.apiUrl,
        model: apiModelId,
        messageCount: apiMessages.length,
        lastMessage: apiMessages[apiMessages.length - 1]
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          model: apiModelId,
          provider: provider.name,
          hasImageInRequest: apiMessages.some(msg => Array.isArray(msg.content))
        });
        
        // Specific handling for OpenRouter vision errors
        if (provider.name === 'OpenRouter' && hasImageAttachment && response.status === 400) {
          // Try without vision - fallback to text-only
          console.log('🔄 OpenRouter vision failed, trying text-only approach...');
          
          const textOnlyMessages = apiMessages.map(msg => ({
            ...msg,
            content: Array.isArray(msg.content) 
              ? msg.content.find(c => c.type === 'text')?.text || 'Image attached'
              : msg.content
          }));
          
          const fallbackResponse = await fetch(provider.apiUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "HTTP-Referer": `${window.location.host}`,
              "X-Title": "AI Chat",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: apiModelId,
              messages: textOnlyMessages,
            }),
          });
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            const fallbackAiContent = fallbackData.choices[0]?.message?.content;
            
            if (fallbackAiContent) {
              // Process the fallback response with image analysis
              let aiContent = fallbackAiContent;
              
              // Add Hugging Face analysis since vision failed
              if (hasImageAttachment && lastMessage.attachedFile) {
                try {
                  console.log('🖼️ Adding Hugging Face analysis due to vision failure...');
                  const attachedFile = lastMessage.attachedFile;
                  
                  // Check if content is already a data URL or just base64
                  const imageDataUrl = attachedFile.content.startsWith('data:') 
                    ? attachedFile.content 
                    : `data:${attachedFile.type};base64,${attachedFile.content}`;
                  
                  const analysisResult = await analyzeWithHuggingFace(imageDataUrl, attachedFile.name);
                  
                  const cleanedAnalysis = analysisResult.description.replace(/^\*\*📊 Comprehensive Image Analysis Report\*\*\s*\n\n/, '');
                  aiContent = `${aiContent}\n\n---\n\n🔍 **Image Analysis** (Vision API unavailable)\n\n${cleanedAnalysis}`;
                } catch (analysisError) {
                  console.error('Image analysis also failed:', analysisError);
                  aiContent = `${aiContent}\n\n---\n\n📷 **Note**: An image was uploaded but could not be processed by the current model.`;
                }
              }
              
              const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: aiContent,
                isUser: false,
                timestamp: new Date(),
                modelName: model.name,
                agentName: agent.name
              };

              // Clean up and save
              const updatedMessages = conversationForApi.messages.map((msg, index) => {
                if (index === conversationForApi.messages.length - 1 && msg.attachedFile?.type?.startsWith('image/')) {
                  return { ...msg, attachedFile: undefined };
                }
                return msg;
              });

              setConversations(prev =>
                prev.map(conv =>
                  conv.id === conversationForApi.id
                    ? {
                      ...conv,
                      messages: [...updatedMessages, aiMessage],
                      lastMessage: aiContent.slice(0, 50) + (aiContent.length > 50 ? '...' : ''),
                      timestamp: new Date()
                    }
                    : conv
                )
              );
              
              setIsTyping(false);
              return;
            }
          }
        }
        
        if (response.status === 429) {
          setProviderStatus(prev => ({ ...prev, [provider.id]: 'limit_exceeded' }));
        }
        throw new Error(errorData.error?.message || `API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let aiContent = data.choices[0]?.message?.content;

      // Image analysis now happens in user message creation, not agent response
      if (aiContent && hasImageAttachment && lastMessage.attachedFile) {
        try {
          console.log('🖼️ Adding Hugging Face analysis to agent response...');
          const attachedFile = lastMessage.attachedFile;
          
          // Check if content is already a data URL or just base64
          const imageDataUrl = attachedFile.content.startsWith('data:') 
            ? attachedFile.content 
            : `data:${attachedFile.type};base64,${attachedFile.content}`;
          
          const analysisResult = await analyzeWithHuggingFace(imageDataUrl, attachedFile.name);
          
          // Combine AI response with detailed analysis (avoid duplicate headers)
          const cleanedAnalysis = analysisResult.description.replace(/^\*\*� Comprehensive Image Analysis Report\*\*\s*\n\n/, '');
          aiContent = `${aiContent}\n\n---\n\n📊 **Additional Technical Analysis**\n\n${cleanedAnalysis}`;
          
          console.log('✅ Image analysis added to agent response');
        } catch (error) {
          console.error('❌ Image analysis failed, using fallback:', error);
          // Add basic fallback analysis
          const attachedFile = lastMessage.attachedFile;
          const fileSizeMB = ((attachedFile.size || attachedFile.content.length) / 1024 / 1024);
          const fallbackAnalysis = `**📸 Image Technical Analysis**\n\n**File:** ${attachedFile.name}\n**Format:** ${attachedFile.type}\n**Size:** ${fileSizeMB.toFixed(1)}MB\n**Status:** Successfully processed for AI analysis\n\n*Note: Advanced computer vision analysis was attempted using free Hugging Face models.*`;
          aiContent = `${aiContent}\n\n---\n\n${fallbackAnalysis}`;
        }
      }

      if (aiContent) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: aiContent,
          isUser: false,
          timestamp: new Date(),
          modelName: model.name,
          agentName: agent.name
        };

        setConversations(prev =>
          prev.map(conv =>
            conv.id === conversationForApi.id
              ? {
                ...conv,
                messages: [...conversationForApi.messages, aiMessage],
                lastMessage: aiContent.slice(0, 50) + (aiContent.length > 50 ? '...' : ''),
                timestamp: new Date()
              }
              : conv
          )
        );
      }
    } catch (error) {
      console.error(`Error calling ${provider.name} API:`, error);
      
      // Specific error handling for OpenRouter vision issues
      if (provider.name === 'OpenRouter' && hasImageAttachment) {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `❌ **OpenRouter Vision Error**: The current model "${model.name}" may not support image processing properly.\n\n**Suggestions:**\n• Try switching to **"Gemini 1.5 Flash"** manually\n• Or upload a smaller image (under 5MB)\n• Or describe the image in text instead\n\n**Error:** ${error instanceof Error ? error.message : "Unknown error"}`,
          isUser: false,
          timestamp: new Date()
        };
        
        setConversations(prev => prev.map(conv => 
          conv.id === conversationForApi.id 
            ? { ...conv, messages: [...conv.messages, errorMessage] } 
            : conv
        ));
      } else {
        // General error handling for API calls
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `❌ **API Error**: Sorry, I encountered an error from the ${provider.name} API.\n\n**Error details:** ${error instanceof Error ? error.message : "Unknown error"}`,
          isUser: false,
          timestamp: new Date()
        };
        setConversations(prev => prev.map(conv => 
          conv.id === conversationForApi.id 
            ? { ...conv, messages: [...conv.messages, errorMessage] } 
            : conv
        ));
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (message: string, file?: FilePayload) => {
    let combinedContent = message;
    
    if (file) {
      // Check file size limits
      const fileSizeKB = (file.size || file.content.length) / 1024;
      const fileSizeMB = fileSizeKB / 1024;
      
      if (file.type?.startsWith('image/')) {
        // Image size check - most models support up to 20MB
        if (fileSizeMB > 20) {
          alert(`Image file "${file.name}" is too large (${fileSizeMB.toFixed(1)}MB). Please use an image under 20MB.`);
          return;
        }
        
        // For images, just use the user's message - analysis will be stored separately
        combinedContent = message || `Can you help me understand this image?`;
      } else {
        // Text file size check - be more conservative 
        if (fileSizeMB > 5) {
          alert(`Text file "${file.name}" is too large (${fileSizeMB.toFixed(1)}MB). Please use a file under 5MB.`);
          return;
        }
        // Estimate tokens for text content
        const contentTokens = estimateTokens(file.content);
        if (contentTokens > 50000) { // Conservative limit
          alert(`Text file "${file.name}" contains too much text (~${contentTokens} tokens). Please use a smaller file or summarize the content.`);
          return;
        }
        // For text files, include the content but format it nicely
        const fileHeader = `📎 **Attached File: ${file.name}**\n`;
        const fileSeparator = '\n---\n\n';
        const userMessage = message ? `\n\n---\n\n**Your message:**\n${message}` : '';
        combinedContent = `${fileHeader}${fileSeparator}${file.content}${userMessage}`;
      }
    }

    const userMessage: ChatMessage = { 
      id: Date.now().toString(), 
      content: combinedContent, 
      isUser: true, 
      timestamp: new Date(),
      // Keep image during session for UI display
      attachedFile: file?.type?.startsWith('image/') ? file : undefined
    };

    // If we have an image, analyze it with Hugging Face and store separately
    if (file?.type?.startsWith('image/')) {
      try {
        console.log('🔍 Analyzing image with Hugging Face...');
        
        // The file.content is already a complete data URL from readAsDataURL()
        const imageDataUrl = file.content; // e.g., "data:image/jpeg;base64,/9j/4AAQ..."
        const analysisResult = await analyzeWithHuggingFace(imageDataUrl, file.name);
        
        if (analysisResult?.description) {
          // Store analysis separately for accordion display
          userMessage.imageAnalysis = analysisResult.description;
          
          // Also save to localStorage for persistence (but limit storage to avoid quota)
          try {
            const savedAnalyses = localStorage.getItem('imageAnalyses') || '[]';
            const analyses = JSON.parse(savedAnalyses);
            
            // Keep only the last 10 analyses to prevent localStorage bloat
            if (analyses.length >= 10) {
              analyses.shift(); // Remove oldest
            }
            
            analyses.push({
              filename: file.name,
              analysis: analysisResult.description,
              timestamp: new Date().toISOString()
            });
            localStorage.setItem('imageAnalyses', JSON.stringify(analyses));
          } catch (storageError) {
            console.warn('Could not save analysis to localStorage:', storageError);
          }
          
          console.log('✅ Image analysis completed and stored separately');
        }
      } catch (error) {
        console.error('❌ Image analysis failed:', error);
        // Store basic fallback analysis
        const fileSizeMB = ((file.size || file.content.length) / 1024 / 1024);
        const fallbackAnalysis = `**📸 Image Technical Analysis**\n\n**File:** ${file.name}\n**Format:** ${file.type}\n**Size:** ${fileSizeMB.toFixed(1)}MB\n**Status:** Successfully processed for AI analysis\n\n*Error: ${error instanceof Error ? error.message : 'Unknown error'}*\n\n*Note: Advanced computer vision analysis was attempted using free Hugging Face models.*`;
        userMessage.imageAnalysis = fallbackAnalysis;
      }
    }

    if (!activeConversationId) {
      // This is the FIRST message of a NEW chat
      const agent = agents.find(a => a.id === selectedAgentId) || agents[0];
      
      // Create a better title for image conversations
      const title = file?.type?.startsWith('image/') 
        ? `Image Analysis: ${file.name.substring(0, 20)}...`
        : (message.slice(0, 40) + (message.length > 40 ? '...' : ''));
      
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: title,
        lastMessage: combinedContent.slice(0, 100) + (combinedContent.length > 100 ? '...' : ''),
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
          updatedConversation = { 
            ...conv, 
            messages: [...conv.messages, userMessage], 
            lastMessage: combinedContent.slice(0, 100) + (combinedContent.length > 100 ? '...': ''), 
            timestamp: new Date() 
          };
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

  const handleEditMessage = async (messageId: string, newContent: string) => {
    const conversation = conversations.find(c => c.id === activeConversationId);
    if (!conversation) return;
    const messageIndex = conversation.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1 || !conversation.messages[messageIndex].isUser) return;

    // Update the message content and truncate messages after it
    const updatedMessages = conversation.messages.slice(0, messageIndex + 1);
    updatedMessages[messageIndex] = { ...updatedMessages[messageIndex], content: newContent };

    let updatedConversation: Conversation | undefined;
    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversationId) {
        updatedConversation = { ...conv, messages: updatedMessages };
        return updatedConversation;
      }
      return conv;
    });
    setConversations(updatedConversations);

    if (updatedConversation) {
      await fetchApiResponse(updatedConversation, updatedMessages);
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
            onEditMessage={handleEditMessage}
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
            onIsFullContextChange={handleFullContextChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;