import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, FileText, X, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import type { AnimationGeneratorType } from 'framer-motion';
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ModelSelector } from "@/components/ModelSelector";
import { type Model } from "@/lib/types";

// --- TYPES & CONSTANTS ---
interface AttachedFile {
  name: string;
  content: string;
  size?: number;
  type?: string;
}

interface OnboardProps {
  onStartChat: (message: string, file?: AttachedFile) => void;
  models: Model[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  providerStatus: Record<string, 'ok' | 'limit_exceeded'>;
  isFullContext: boolean;
  onIsFullContextChange: (checked: boolean) => void;
}

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_FILE_TYPES = [
  'text/plain', 'text/markdown', 'application/json', 'application/javascript', 
  'text/css', 'text/html', 'application/x-javascript', 'application/x-typescript',
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'
];
const ALLOWED_EXTENSIONS = ".txt, .md, .json, .js, .ts, .tsx, .css, .jpg, .jpeg, .png, .gif, .webp";

// --- Animated Logo Component ---
const AIChatLogo = () => (
  <motion.div className="w-24 h-24 relative flex items-center justify-center mb-6">
    {/* Animated gradient ring */}
    <motion.div
      className="absolute w-full h-full rounded-full"
      initial={{ scale: 0.8, opacity: 0.7 }}
      animate={{
        scale: [0.8, 1.1, 0.8],
        opacity: [0.7, 1, 0.7],
        boxShadow: [
          '0 0 0 0px #7f5af0',
          '0 0 40px 10px #7f5af0',
          '0 0 0 0px #7f5af0'
        ],
      }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ background: 'radial-gradient(circle, #7f5af0 40%, transparent 70%)' }}
    />
    {/* App logo */}
    <motion.img
      src="/logo.png"
      alt="App Logo"
      className="w-16 h-16 rounded-xl z-10 shadow-lg"
      initial={{ rotate: 0 }}
    />
    {/* Colorful animated dots */}
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute w-4 h-4 rounded-full"
        style={{
          top: `${40 + 20 * Math.sin((i * 2 * Math.PI) / 3)}%`,
          left: `${40 + 20 * Math.cos((i * 2 * Math.PI) / 3)}%`,
          background: i === 0 ? 'linear-gradient(135deg,#7f5af0,#00e0ff)' : i === 1 ? 'linear-gradient(135deg,#00e0ff,#7f5af0)' : 'linear-gradient(135deg,#7f5af0,#ff6ec4)',
          boxShadow: '0 0 10px 2px #7f5af0',
        }}
        initial={{ scale: 0.7, opacity: 0.6 }}
        animate={{ scale: [0.7, 1.2, 0.7], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
      />
    ))}
  </motion.div>
);

// --- Main Onboard Component ---
const Onboard: React.FC<OnboardProps> = ({ 
  onStartChat, 
  models, 
  selectedModel, 
  onModelChange, 
  providerStatus
}) => {
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error("File too large", { 
        description: `Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB` 
      });
      return;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isAllowed = ALLOWED_FILE_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(fileExtension);
    
    if (!isAllowed) {
      toast.error("Unsupported File Type", { 
        description: `Please upload one of the following: ${ALLOWED_EXTENSIONS}` 
      });
      return;
    }

    if (file.type.startsWith('image/')) {
      // For images, read as data URL to display preview
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
      // For text files, read as text
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndProcessFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); if (e.currentTarget.contains(e.relatedTarget as Node)) return; setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); const file = e.dataTransfer.files?.[0]; if (file) validateAndProcessFile(file); };

  const handleSend = () => {
    if (!message.trim() && !attachedFile) return;
    onStartChat(message.trim(), attachedFile || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as AnimationGeneratorType, stiffness: 100 } },
  };

  return (
    <div className="relative h-screen flex flex-col items-center justify-center bg-background p-4 overflow-hidden"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        className="w-full max-w-2xl flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AIChatLogo />

        <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-bold text-primary text-center mb-2 drop-shadow-lg">
          Start a Conversation
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xs sm:text-base font-normal text-[hsl(var(--foreground))] max-w-md text-center mb-6">
          Your intelligent assistant. Ask a question or drop a file to begin.
        </motion.p>
        
        {/* Model Selector and Full Context Toggle */}
        <motion.div variants={itemVariants} className="w-full mb-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              disabled={false}
              providerStatus={providerStatus}
            />
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="w-full relative">
          {/* Enhanced File Attachment Preview */}
          {attachedFile && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 bg-sidebar-hover/50 border border-sidebar-border rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Dynamic File Icon based on type */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    attachedFile.type?.startsWith('image/') 
                      ? 'bg-gradient-to-br from-primary/20 to-primary/30' 
                      : attachedFile.name.includes('.json') || attachedFile.name.includes('.js') || attachedFile.name.includes('.ts')
                      ? 'bg-gradient-to-br from-primary/20 to-primary/30'
                      : 'bg-gradient-to-br from-primary/20 to-primary/30'
                  }`}>
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  {/* File Details */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-foreground truncate">{attachedFile.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {attachedFile.type || 'Unknown type'}
                      </span>
                      {attachedFile.size && (
                        <span className="text-xs text-muted-foreground">
                          • {(attachedFile.size / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                    {attachedFile.size && attachedFile.size > 1024 * 1024 && (
                      <span className="text-xs text-primary flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                        Ready
                      </span>
                    )}
                  </div>
                  
                  {/* Preview for images */}
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
                
                {/* Remove Button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-lg flex-shrink-0" 
                  onClick={() => setAttachedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
          <div
            className="relative flex items-end space-x-2 sm:space-x-3 rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background/80 backdrop-blur-md focus-within:ring-4 focus-within:ring-primary/20 transition-all w-full"
            style={{ boxShadow: '0 4px 32px 0 hsl(var(--primary)/0.15), 0 0 0 4px hsl(var(--primary)/0.08)' }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 p-0 rounded-xl flex-shrink-0 text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30"
              onClick={() => fileInputRef.current?.click()}
              style={{ boxShadow: '0 2px 8px 0 hsl(var(--primary)/0.20)' }}
            >
              <Paperclip className="h-6 w-6" />
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
              placeholder="Ask me anything, or drop a file to start..."
              className="min-h-[40px] max-h-[160px] resize-none border-0 bg-transparent px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base text-[hsl(var(--foreground))] placeholder:text-xs sm:placeholder:text-sm placeholder:text-[hsl(var(--muted-foreground))]"
              autoFocus
            />
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSend}
                disabled={!message.trim() && !attachedFile}
                size="icon"
                className="h-10 w-10 p-0 rounded-xl flex-shrink-0 bg-primary hover:bg-primary-hover disabled:bg-primary/50 shadow-md"
                style={{ boxShadow: '0 2px 8px 0 hsl(var(--primary)/0.20)' }}
              >
                <Send className="h-6 w-6 text-primary-foreground" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 text-center">
          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => onStartChat('', undefined)}
          >
            Or explore options
          </Button>
        </motion.div>
      </motion.div>

      {isDragging && (
        <div className="absolute inset-0">
          <div className="h-full w-full bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 border-2 border-dashed border-primary rounded-lg">
            <UploadCloud className="h-12 w-12 text-primary mb-4" />
            <p className="text-lg font-semibold text-foreground">Drop your file here</p>
            <p className="text-sm text-muted-foreground">{ALLOWED_EXTENSIONS}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboard;