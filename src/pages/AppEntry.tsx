import { useState, useEffect } from 'react';
import Onboard from './OnBoard';
import Index from './Index';
import { AVAILABLE_MODELS } from "@/lib/data";

// Define the shape of the data that will be passed
interface InitialPayload {
  message: string | null;
  file: { 
    name: string; 
    content: string; 
  } | null;
}

const AppEntry = () => {
  const [hasConversations, setHasConversations] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialPayload, setInitialPayload] = useState<InitialPayload>({ message: null, file: null });
  
  // Model selection and full context state for Onboard
  const [selectedModel, setSelectedModel] = useState<string>(AVAILABLE_MODELS[0].id);
  const [providerStatus] = useState<Record<string, 'ok' | 'limit_exceeded'>>({ 'openrouter': 'ok', 'openai': 'ok' });
  const [isFullContext, setIsFullContext] = useState<boolean>(false);

  // This effect to check localStorage is correct
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("chat_conversations");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.some((c: any) => c.messages && c.messages.length > 0)) {
          setHasConversations(true);
        }
      }
    } catch (e) {
      console.error("Failed to parse conversations from localStorage", e);
    }
    setIsLoading(false);
  }, []);

  // This handler correctly accepts the message and file
  const handleStartChat = (message: string, file?: { name: string; content: string; }) => {
    // THE FIX: Only set a payload if a message or file actually exists.
    // Otherwise, the default empty payload is fine.
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