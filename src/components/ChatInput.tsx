/**
 * ChatInput Component - Enhanced input interface for AI conversations
 * Features file upload, drag-and-drop, model selection, and ChatGPT-like options
 */

import { useState, type KeyboardEvent, useRef, useEffect } from "react";
import { Send, FileText, X, UploadCloud, Image, FileCode, FileSpreadsheet, File, Camera, GraduationCap, Palette, Brain, Search, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { ModelSelector } from "./ModelSelector";
import { type Model } from "@/lib/types";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// File upload configuration - supports comprehensive file types like ChatGPT
const ALLOWED_FILE_TYPES = [
  // Text files
  'text/plain',
  'text/markdown',
  'text/css',
  'text/html',
  'text/xml',
  'text/csv',
  // Code files
  'application/json',
  'application/javascript',
  'application/x-javascript',
  'application/x-typescript',
  'application/x-python',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];
const ALLOWED_EXTENSIONS = ".txt, .md, .json, .js, .ts, .tsx, .css, .html, .xml, .csv, .pdf, .doc, .docx, .xls, .xlsx, .py, .java, .cpp, .c, .go, .rs, .php, .rb, .swift, .kt, .jpg, .jpeg, .png, .gif, .webp, .svg";

/** Structure for attached file data */
interface AttachedFile {
  name: string;                     // Original filename
  content: string;                  // File content (text or base64 for images)
  size?: number;                    // File size in bytes
  type?: string;                    // MIME type
}

/** Props interface for ChatInput component */
interface ChatInputProps {
  onSendMessage: (message: string, file?: AttachedFile) => void;  // Message send handler
  disabled?: boolean;                                              // Input disabled state
  placeholder?: string;                                            // Textarea placeholder text
  models: Model[];                                                 // Available AI models
  selectedModel: string;                                           // Currently selected model
  onModelChange: (modelId: string) => void;                       // Model change handler
  providerStatus: Record<string, 'ok' | 'limit_exceeded'>;        // Provider availability status
  isFullContext: boolean;                                          // Full context mode toggle
  onIsFullContextChange: (checked: boolean) => void;              // Full context change handler
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  models,
  selectedModel,
  onModelChange,
  providerStatus,
  isFullContext,
  onIsFullContextChange,
}: ChatInputProps) {
  // Component state management
  const [message, setMessage] = useState("");                           // Current message text
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);  // Currently attached file
  const [isDragging, setIsDragging] = useState(false);                  // Drag-and-drop state
  const [showOptions, setShowOptions] = useState(false);                // Options menu visibility
  
  // Refs for DOM manipulation
  const textareaRef = useRef<HTMLTextAreaElement>(null);                // Auto-resize textarea
  const fileInputRef = useRef<HTMLInputElement>(null);                  // Hidden file input

  // ChatGPT-inspired quick action options
  const chatOptions = [
    {
      icon: Camera,
      label: "Add photos & files",
      description: "Upload images, documents, and code files",
      action: () => fileInputRef.current?.click(),
      color: "blue"
    },
    {
      icon: GraduationCap,
      label: "Study and learn",
      description: "Get help with learning and understanding topics",
      action: () => {
        setMessage("Help me study and learn about: ");
        setShowOptions(false);
        setTimeout(() => textareaRef.current?.focus(), 100);
      },
      color: "green"
    },
    {
      icon: Palette,
      label: "Create image",
      description: "Generate images from text descriptions",
      action: () => {
        setMessage("Create an image of: ");
        setShowOptions(false);
        setTimeout(() => textareaRef.current?.focus(), 100);
      },
      color: "purple"
    },
    {
      icon: Brain,
      label: "Think longer",
      description: "Get more detailed and thoughtful responses",
      action: () => {
        setMessage("Please think carefully and provide a detailed analysis of: ");
        setShowOptions(false);
        setTimeout(() => textareaRef.current?.focus(), 100);
      },
      color: "orange"
    },
    {
      icon: Search,
      label: "Deep research",
      description: "Comprehensive research and analysis",
      action: () => {
        setMessage("Please conduct deep research on: ");
        setShowOptions(false);
        setTimeout(() => textareaRef.current?.focus(), 100);
      },
      color: "indigo"
    }
  ];

  /**
   * Validates uploaded files and processes them based on type
   * Handles both text files and images with appropriate error handling
   */
  const validateAndProcessFile = (file: File) => {
    // Validate file type using extension fallback for better compatibility
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isAllowed = ALLOWED_FILE_TYPES.includes(file.type) || 
                     ALLOWED_EXTENSIONS.toLowerCase().includes(fileExtension);

    if (!isAllowed) {
      toast.error("Unsupported File Type", {
        description: `Please upload one of the following file types: ${ALLOWED_EXTENSIONS}.`,
        duration: 4000
      });
      return;
    }

    // Enforce file size limit (10MB like ChatGPT)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File Too Large", {
        description: "Please upload a file smaller than 10MB.",
        duration: 4000
      });
      return;
    }

    // Process file based on type
    if (file.type.startsWith('image/')) {
      // Images: read as data URL for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setAttachedFile({ 
          name: file.name, 
          content,
          size: file.size,
          type: file.type
        });
        toast.success("Image attached successfully!", { duration: 2000 });
      };
      reader.readAsDataURL(file);
    } else {
      // Text files: read as plain text
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setAttachedFile({ 
          name: file.name, 
          content,
          size: file.size,
          type: file.type
        });
        toast.success("File attached successfully!", { duration: 2000 });
      };
      reader.readAsText(file);
    }
  };

  /** Handles file selection from input element */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
    // Reset input to allow selecting same file again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drag-and-drop event handlers with improved UX
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only show drag state if files are being dragged
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Prevent flickering when moving over child elements
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

  /** Handles message sending with validation */
  const handleSend = () => {
    if (!message.trim() && !attachedFile) return;
    onSendMessage(message.trim(), attachedFile || undefined);
    setMessage("");
    setAttachedFile(null);
  };

  /** Handles keyboard shortcuts for sending messages */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Effect: Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Effect: Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showOptions && event.target instanceof Element && !event.target.closest('.options-container')) {
        setShowOptions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showOptions]);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-t border-sidebar-border bg-sidebar-background p-4 sm:p-6 relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header: Model selector and context toggle */}
        <div className="flex items-center justify-between">
          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            disabled={disabled}
            providerStatus={providerStatus}
          />
          <div className="flex items-center gap-2">
            <Checkbox
              id="full-context"
              checked={isFullContext}
              onCheckedChange={onIsFullContextChange}
              disabled={disabled}
              className="rounded-md"
            />
            <Label
              htmlFor="full-context"
              className="text-sm font-medium text-muted-foreground cursor-pointer select-none"
            >
              Full Context
              <span className="text-xs text-muted-foreground/70 ml-1">
                ({isFullContext ? 'All messages' : 'Current message only'})
              </span>
            </Label>
          </div>
        </div>

        {/* File attachment preview with enhanced UI */}
        {attachedFile && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-sidebar-hover/50 border border-sidebar-border rounded-xl p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {/* Dynamic file icon based on type */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  attachedFile.type?.startsWith('image/') 
                    ? 'bg-gradient-to-br from-primary/20 to-primary/30' 
                    : attachedFile.name.includes('.json') || attachedFile.name.includes('.js') || attachedFile.name.includes('.ts')
                    ? 'bg-gradient-to-br from-primary/20 to-primary/30'
                    : attachedFile.name.includes('.pdf') || attachedFile.name.includes('.doc')
                    ? 'bg-gradient-to-br from-primary/20 to-primary/30'
                    : 'bg-gradient-to-br from-primary/20 to-primary/30'
                }`}>
                  {attachedFile.type?.startsWith('image/') ? (
                    <Image className="h-5 w-5 text-primary" />
                  ) : attachedFile.name.includes('.json') || attachedFile.name.includes('.js') || attachedFile.name.includes('.ts') ? (
                    <FileCode className="h-5 w-5 text-primary" />
                  ) : attachedFile.name.includes('.xlsx') || attachedFile.name.includes('.csv') ? (
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                  ) : attachedFile.name.includes('.pdf') || attachedFile.name.includes('.doc') ? (
                    <FileText className="h-5 w-5 text-primary" />
                  ) : (
                    <File className="h-5 w-5 text-primary" />
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-sidebar-foreground truncate">
                      {attachedFile.name}
                    </span>
                    {attachedFile.size && (
                      <span className="text-xs text-sidebar-foreground/60 bg-sidebar-hover px-1.5 py-0.5 rounded">
                        {(attachedFile.size / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>
                  
                  {/* File type indicator with smart detection */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-sidebar-foreground/70">
                      {attachedFile.type?.startsWith('image/') ? 'Image' 
                       : attachedFile.name.includes('.json') ? 'JSON File'
                       : attachedFile.name.includes('.js') ? 'JavaScript'
                       : attachedFile.name.includes('.ts') ? 'TypeScript'
                       : attachedFile.name.includes('.pdf') ? 'PDF Document'
                       : attachedFile.name.includes('.doc') ? 'Word Document'
                       : attachedFile.name.includes('.csv') ? 'CSV File'
                       : attachedFile.name.includes('.xlsx') ? 'Excel File'
                       : 'Text File'}
                    </span>
                    
                    {/* Processing status for large files */}
                    {attachedFile.size && attachedFile.size > 1024 * 1024 && (
                      <span className="text-xs text-primary flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                        Ready
                      </span>
                    )}
                  </div>
                  
                  {/* Image preview for visual files */}
                  {attachedFile.type?.startsWith('image/') && attachedFile.content && (
                    <div className="mt-2">
                      <img 
                        src={attachedFile.content} 
                        alt="Preview" 
                        className="max-w-32 max-h-20 rounded-lg border border-sidebar-border object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Remove attachment button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive flex-shrink-0" 
                onClick={() => setAttachedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Main input area with enhanced functionality */}
        <div className="relative">
          <div className="flex items-end gap-2 sm:gap-3 bg-sidebar-hover/30 border border-sidebar-border rounded-2xl p-3 sm:p-4 focus-within:ring-2 focus-within:ring-yellow-400/20 focus-within:border-yellow-400/30 transition-all duration-200">
            
            {/* Quick options dropdown menu */}
            <div className="relative flex-shrink-0 options-container">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-xl hover:bg-sidebar-active/50 transition-colors"
                disabled={disabled}
                onClick={() => setShowOptions(!showOptions)}
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              
              {/* Animated options dropdown */}
              <AnimatePresence>
                {showOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-12 left-0 sm:left-0 right-0 sm:right-auto z-50 w-full sm:w-64 max-w-sm bg-sidebar-background border border-sidebar-border rounded-xl shadow-lg overflow-hidden mx-2 sm:mx-0"
                  >
                    <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                      {/* Quick action options */}
                      {chatOptions.map((option, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full h-auto p-3 justify-start text-left hover:bg-sidebar-hover rounded-lg"
                          onClick={option.action}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 ${
                            option.color === 'blue' ? 'bg-primary/20 text-primary' :
                            option.color === 'green' ? 'bg-primary/20 text-primary' :
                            option.color === 'purple' ? 'bg-primary/20 text-primary' :
                            option.color === 'orange' ? 'bg-primary/20 text-primary' :
                            option.color === 'indigo' ? 'bg-primary/20 text-primary' :
                            'bg-primary/20 text-primary'
                          }`}>
                            <option.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-sidebar-foreground">
                              {option.label}
                            </div>
                            <div className="text-xs text-sidebar-foreground/60 mt-0.5 truncate">
                              {option.description}
                            </div>
                          </div>
                        </Button>
                      ))}
                      
                      {/* Additional options placeholder */}
                      <div className="border-t border-sidebar-border pt-1 mt-1">
                        <Button
                          variant="ghost"
                          className="w-full h-auto p-3 justify-start text-left hover:bg-sidebar-hover rounded-lg"
                          onClick={() => {
                            toast.info("More options coming soon!");
                            setShowOptions(false);
                          }}
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 bg-gray-500/20 text-gray-500">
                            <MoreHorizontal className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-sidebar-foreground">
                              More
                            </div>
                            <div className="text-xs text-sidebar-foreground/60 mt-0.5 truncate">
                              Additional features and tools
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hidden file input for upload functionality */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept={ALLOWED_EXTENSIONS}
              onChange={handleFileChange}
            />

            {/* Auto-resizing textarea with keyboard shortcuts */}
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[24px] max-h-[200px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-sidebar-foreground/50"
            />

            {/* Send button with gradient styling */}
            <Button
              onClick={handleSend}
              disabled={disabled || (!message.trim() && !attachedFile)}
              size="sm"
              className="h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-xl bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 disabled:from-purple-400/50 disabled:to-purple-500/50 shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
          
          {/* Keyboard shortcut hints */}
          <p className="text-xs text-sidebar-foreground/60 mt-2 text-center hidden sm:block">
            Press <kbd className="px-1.5 py-0.5 bg-sidebar-hover rounded text-xs font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-sidebar-hover rounded text-xs font-mono">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>

      {/* Drag-and-drop overlay with visual feedback */}
      {isDragging && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-sidebar-background/90 backdrop-blur-md flex flex-col items-center justify-center z-10 border-2 border-dashed border-purple-400/50 rounded-2xl"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400/20 to-purple-500/30 rounded-2xl flex items-center justify-center mb-4">
            <UploadCloud className="h-10 w-10 text-purple-500" />
          </div>
          <p className="text-xl font-semibold text-sidebar-foreground mb-2">Drop your file here</p>
          <p className="text-sm text-sidebar-foreground/70 text-center px-4">
            Support for documents, code files, images and more
          </p>
          {/* Supported file type indicators */}
          <div className="flex items-center gap-4 mt-4 text-xs text-sidebar-foreground/60">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>Docs</span>
            </div>
            <div className="flex items-center gap-1">
              <FileCode className="h-3 w-3" />
              <span>Code</span>
            </div>
            <div className="flex items-center gap-1">
              <Image className="h-3 w-3" />
              <span>Images</span>
            </div>
            <div className="flex items-center gap-1">
              <FileSpreadsheet className="h-3 w-3" />
              <span>Sheets</span>
            </div>
          </div>
          <p className="text-xs text-sidebar-foreground/50 mt-2">Max 10MB</p>
        </motion.div>
      )}
    </motion.div>
  );
}