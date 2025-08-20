import { useState, type KeyboardEvent, useRef, useEffect } from "react";
import { Send, Paperclip, FileText, X, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { ModelSelector } from "./ModelSelector";
import { type Model } from "@/lib/types";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Configuration for allowed file types
const ALLOWED_FILE_TYPES = [
  'text/plain',
  'text/markdown',
  'application/json',
  'application/javascript',
  'text/css',
  'text/html',
  // Add common TS/TSX MIME types if needed, though they can be inconsistent
  'application/x-javascript',
  'application/x-typescript',
];
const ALLOWED_EXTENSIONS = ".txt, .md, .json, .js, .ts, .tsx, .css";

interface AttachedFile {
  name: string;
  content: string;
}

interface ChatInputProps {
  onSendMessage: (message: string, file?: AttachedFile) => void;
  disabled?: boolean;
  placeholder?: string;
  models: Model[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  providerStatus: Record<string, 'ok' | 'limit_exceeded'>;
  isFullContext: boolean; // Add this prop
  onIsFullContextChange: (checked: boolean) => void; // Add this prop
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  models,
  selectedModel,
  onModelChange,
  providerStatus,
  isFullContext, // Destructure the new prop
  onIsFullContextChange, // Destructure the new prop
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    // A more robust check that includes file extension for TS/TSX files
    const fileExtension = '.' + file.name.split('.').pop();
    const isAllowed = ALLOWED_FILE_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(fileExtension);

    if (!isAllowed) {
      toast.error("Unsupported File Type", {
        description: `Please upload one of the following: ${ALLOWED_EXTENSIONS}.`
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAttachedFile({ name: file.name, content });
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- REFACTORED Drag-and-Drop Handlers ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Check if dragged items are files
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // This logic helps prevent flickering when moving over child elements
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleSend = () => {
    if (!message.trim() && !attachedFile) return;
    onSendMessage(message.trim(), attachedFile || undefined);
    setMessage("");
    setAttachedFile(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  return (
    // UPDATED: The motion.div is now the drop zone
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-t border-sidebar-border bg-sidebar-background p-4 relative" // Added 'relative'
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            disabled={disabled}
            providerStatus={providerStatus}
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="full-context"
              checked={isFullContext}
              onCheckedChange={onIsFullContextChange}
              disabled={disabled}
            />
            <Label
              htmlFor="full-context"
              className="text-sm font-medium text-muted-foreground cursor-pointer"
            >
              Send Full Context
            </Label>
          </div>
        </div>

        {attachedFile && (
          <div className="mb-2 flex items-center justify-between bg-secondary p-2 rounded-md text-sm">
            <div className="flex items-center gap-2 font-medium">
              <FileText className="h-4 w-4" />
              <span>{attachedFile.name}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAttachedFile(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="relative flex items-end space-x-3 bg-input border border-input-border rounded-xl p-3 focus-within:ring-2 focus-within:ring-ring/20 transition-colors">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 p-0 rounded-lg flex-shrink-0"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={ALLOWED_EXTENSIONS}
            onChange={handleFileChange}
          />

          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[40px] max-h-[200px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground"
          />

          <Button
            onClick={handleSend}
            disabled={disabled || (!message.trim() && !attachedFile)}
            size="icon"
            className="h-9 w-9 p-0 rounded-lg flex-shrink-0 bg-primary hover:bg-primary-hover disabled:bg-primary/50"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2 text-center">
          You can also drag & drop a file into this input area.
        </p>
      </div>

      {/* UPDATED: Overlay is now contained within the parent motion.div */}
      {isDragging && (
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 border-2 border-dashed border-primary rounded-lg"
        >
          <UploadCloud className="h-12 w-12 text-primary mb-4" />
          <p className="text-lg font-semibold text-foreground">Drop your file here</p>
          <p className="text-sm text-muted-foreground">{ALLOWED_EXTENSIONS}</p>
        </div>
      )}
    </motion.div>
  );
}