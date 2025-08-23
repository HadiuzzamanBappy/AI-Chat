/**
 * Application Entry Point Component
 * 
 * Smart routing component that determines whether to show onboarding
 * for new users or the main chat interface for existing users.
 * Handles initial message/file payload from onboarding flow.
 */

import { useState, useEffect } from 'react';
import Onboard from './OnBoard';
import Index from './Index';
import { AVAILABLE_MODELS } from "@/lib/data";

/** Initial data structure for onboarding-to-chat handoff */
interface InitialPayload {
  /** Optional initial message from onboarding */
  message: string | null;
  /** Optional file attachment from onboarding */
  file: { 
    name: string; 
    content: string; 
  } | null;
}

/**
 * App Entry Component
 * 
 * Conditionally renders either:
 * - OnBoard component for first-time users
 * - Index component for users with existing conversations
 * 
 * Manages initial payload transfer from onboarding to main chat.
 */
const AppEntry = () => {
  // User state management
  const [hasConversations, setHasConversations] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialPayload, setInitialPayload] = useState<InitialPayload>({ message: null, file: null });
  
  // Onboarding configuration state
  const [selectedModel, setSelectedModel] = useState<string>(AVAILABLE_MODELS[0].id);
  const [providerStatus] = useState<Record<string, 'ok' | 'limit_exceeded'>>({ 'openrouter': 'ok', 'openai': 'ok' });
  const [isFullContext, setIsFullContext] = useState<boolean>(false);

  /** Check for existing conversations on component mount */
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("chat_conversations");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Check if any conversation has actual messages
        if (parsed.some((c: any) => c.messages && c.messages.length > 0)) {
          setHasConversations(true);
        }
      }
    } catch (e) {
      console.error("Failed to parse conversations from localStorage", e);
    }
    setIsLoading(false);
  }, []);

  /** 
   * Handle chat initiation from onboarding
   * Sets initial payload only if message or file provided
   */
  const handleStartChat = (message: string, file?: { name: string; content: string; }) => {
    // Only set payload if meaningful content exists
    if (message || file) {
      setInitialPayload({
        message: message.trim() || null,
        file: file || null,
      });
    }
    // This will now correctly switch to the Index page even if no message is sent.
    setHasConversations(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  return hasConversations 
    ? <Index initialPayloadFromOnboard={initialPayload} /> 
    : <Onboard 
        onStartChat={handleStartChat}
        models={AVAILABLE_MODELS}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        providerStatus={providerStatus}
        isFullContext={isFullContext}
        onIsFullContextChange={setIsFullContext}
      />;
};

export default AppEntry;