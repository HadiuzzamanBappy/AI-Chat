/* eslint-disable @typescript-eslint/no-explicit-any */

import { motion } from "framer-motion";
import { User, Bot, Copy, Check, Trash2, Cpu, RotateCw, Edit3, X, Send } from "lucide-react";
import ReactMarkdown, { type ExtraProps } from "react-markdown";
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface MessageProps {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  onDelete: (messageId: string) => void;
  onRerun: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onEditStateChange?: (messageId: string, isEditing: boolean) => void;
  modelName?: string;
  agentName?: string;
  shouldAnimate?: boolean;
  onAnimationComplete?: () => void;
  isSystemTyping?: boolean;
  attachedFile?: {
    name: string;
    content: string;
    size?: number;
    type?: string;
  };
  imageAnalysis?: string; // NEW: Analysis text to display in accordion
}

type CodeBlockProps = {
  children?: ReactNode;
  className?: string;
  node?: any;
  inline?: boolean;
} & ExtraProps;

type ListItemProps = {
  children?: ReactNode;
  node?: any;
  ordered?: boolean;
  index?: number;
};

type ParagraphProps = {
  children?: ReactNode;
  node?: any;
};


export function Message({ id, content, isUser, timestamp, onDelete, onRerun, onEdit, onEditStateChange, modelName, agentName, shouldAnimate = false, onAnimationComplete, isSystemTyping = false, attachedFile, imageAnalysis }: MessageProps) {
  const [isDark, setIsDark] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [displayedContent, setDisplayedContent] = useState(content);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shouldAnimate) {
      setDisplayedContent("");
      const startTime = Date.now();
      const typingSpeed = 10;
      let animationFrameId: number;
      const animate = () => {
        const elapsedTime = Date.now() - startTime;
        const charsToShow = Math.floor(elapsedTime / typingSpeed);
        if (charsToShow < content.length) {
          setDisplayedContent(content.substring(0, charsToShow));
          animationFrameId = requestAnimationFrame(animate);
        } else {
          setDisplayedContent(content);
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }
      };
      animationFrameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrameId);
    } else {
      setDisplayedContent(content);
    }
  }, [content, shouldAnimate, onAnimationComplete]);


  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEditStateChange?.(id, true); // Set immediately to prevent any scroll
    setIsEditing(true);
    setEditContent(content);
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const hasChanges = editContent.trim() !== content;
    
    setIsEditing(false);
    
    if (onEdit && hasChanges) {
      onEdit(id, editContent.trim());
    }
    
    // Notify immediately that editing is done
    onEditStateChange?.(id, false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(false);
    setEditContent(content);
    
    // Notify immediately that editing is done
    onEditStateChange?.(id, false);
  };

  const handleCodeCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const MessageActions = () => (
    <div className={`
      flex items-center gap-1 mt-2 justify-end
      ${isMobile ? 'opacity-70' : 'opacity-0 group-hover:opacity-100'}
      transition-opacity duration-200
    `}>
      {!isEditing && (
        <>
          {isUser && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 hover:bg-primary/10 hover:text-primary touch-manipulation active:scale-95 transition-transform" 
                onClick={handleEdit}
                aria-label="Edit message"
                disabled={isSystemTyping}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 hover:bg-primary/10 hover:text-primary touch-manipulation active:scale-95 transition-transform" 
                onClick={() => onRerun(id)}
              >
                <RotateCw className="h-3 w-3" />
              </Button>
            </>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 hover:bg-primary/10 hover:text-primary touch-manipulation active:scale-95 transition-transform" 
            onClick={handleCopy} 
            aria-label="Copy message"
          >
            {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive touch-manipulation active:scale-95 transition-transform" 
            onClick={() => onDelete(id)} 
            aria-label="Delete message"
            disabled={isSystemTyping}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </>
      )}
    </div>
  );

  const syntaxHighlighterStyle: { [key: string]: CSSProperties } = isDark ? oneDark : oneLight;

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
      className={`group relative flex gap-2 sm:gap-4 p-3 sm:p-4 md:p-6 ${isUser ? 'justify-end' : 'justify-start'} w-full`}
    >
      {!isUser && (
        <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 mt-1">
          <AvatarImage alt="AI Assistant" />
          <AvatarFallback className="bg-gradient-to-br from-purple-400/20 to-purple-500/30 border border-purple-400/20">
            <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className="relative max-w-4xl min-w-0">
        <div className={`
          relative rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm border backdrop-blur-sm inline-block w-fit max-w-full
          ${isEditing ? 'min-w-[300px] sm:min-w-[400px]' : ''}
          ${isUser 
            ? 'bg-primary/10 text-foreground border-primary/20 shadow-primary/5' 
            : 'bg-gray-50 dark:bg-gray-700 text-foreground border-border/50 shadow-black/5 dark:shadow-white/5'
          }
        `}>
          {isUser ? (
            isEditing ? (
              <div className="w-full">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[80px] resize-none text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                  placeholder="Edit your message..."
                  autoFocus
                  disabled={isSystemTyping}
                />
                <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-border/20">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="h-7 px-3 text-xs hover:bg-destructive/10 hover:text-destructive"
                    disabled={isSystemTyping}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={!editContent.trim() || isSystemTyping}
                    className="h-7 px-3 text-xs"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words word-wrap overflow-wrap-anywhere">{displayedContent}</p>
                {/* Display attached image if present */}
                {attachedFile && attachedFile.type?.startsWith('image/') && attachedFile.content && (
                  <div className="mt-3 max-w-md">
                    <img 
                      src={attachedFile.content} 
                      alt={attachedFile.name}
                      className="rounded-lg max-w-full h-auto border border-border/20"
                      loading="lazy"
                    />
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">📷 {attachedFile.name}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">🔍 AI Analysis Available</p>
                    </div>
                    
                    {/* Analysis Accordion */}
                    {imageAnalysis && (
                      <div className="mt-3">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="image-analysis" className="border rounded-lg">
                            <AccordionTrigger className="px-3 py-2 text-sm font-medium hover:no-underline">
                              🔍 View Image Analysis
                            </AccordionTrigger>
                            <AccordionContent className="px-3 pb-3">
                              <div className="prose prose-sm max-w-none dark:prose-invert">
                                {imageAnalysis.includes('Error:') || imageAnalysis.includes('Failed to fetch') ? (
                                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">⚠️ Analysis Error</p>
                                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                                      Image analysis is temporarily unavailable. This usually happens due to:
                                    </p>
                                    <ul className="text-red-500 dark:text-red-400 text-xs mt-2 ml-4 list-disc">
                                      <li>Network connectivity issues</li>
                                      <li>Hugging Face API rate limits</li>
                                      <li>Unsupported image format</li>
                                    </ul>
                                    <p className="text-red-500 dark:text-red-400 text-xs mt-2">
                                      Try uploading the image again or try a different image format.
                                    </p>
                                  </div>
                                ) : (
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      code: ({ children, className, ...props }) => {
                                        const isInline = !className?.includes('language-');
                                        
                                        if (isInline) {
                                          return (
                                            <code 
                                              className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-xs" 
                                              {...props}
                                            >
                                              {children}
                                            </code>
                                          );
                                        }
                                        
                                        return (
                                          <code className={className} {...props}>
                                            {children}
                                          </code>
                                        );
                                      }
                                    }}
                                  >
                                    {imageAnalysis}
                                  </ReactMarkdown>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert overflow-hidden text-foreground">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  li: ({ children, node, ...props }: ListItemProps) => {
                    return (
                      <li className="mb-1" {...props}>{children}</li>
                    );
                  },
                  p: ({ node, children }: ParagraphProps) => {
                    if (node?.children) {
                      const hasCodeBlock = node.children.some((child: any) =>
                        child.type === 'element' &&
                        child.tagName === 'code' &&
                        child.properties?.className?.some((cls: string) => cls.startsWith('language-'))
                      );
                      if (hasCodeBlock) {
                        return <div className="mb-4 last:mb-0">{children}</div>;
                      }
                    }
                    return <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>;
                  },
                  code({ node, inline, className, children, ...props }: CodeBlockProps) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    const idx = node?.position?.start?.line || Math.random();
                    const language = match ? match[1] : 'text';

                    // --- CASE 1: Render as a true INLINE label ---
                    // This now uses a <span> with inline-flex to flow with the text.
                    if (!inline && language === 'text' && !codeString.includes('\n')) {
                      return (
                        <span className="not-prose inline-flex items-center gap-2 bg-secondary border rounded-md px-2 py-1 font-mono text-xs mx-1 align-middle">
                          <code className="truncate">{codeString}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary shrink-0"
                            onClick={() => handleCodeCopy(codeString, idx)}
                            aria-label="Copy code"
                          >
                            {copiedCodeIdx === idx ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </span>
                      );
                    }

                    // --- CASE 2: Render as a full terminal-style block ---
                    // This logic remains the same.
                    if (!inline) {
                      return (
                        <div className="not-prose rounded-lg overflow-hidden bg-secondary border">
                          <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
                            <span className="text-xs text-muted-foreground font-mono">{language}</span>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-muted-foreground hover:bg-primary/10 hover:text-primary" onClick={() => handleCodeCopy(codeString, idx)}>
                              {copiedCodeIdx === idx ? <Check className="w-3 h-3 mr-1 text-green-500" /> : <Copy className="w-3 h-3 mr-1" />}
                              <span className="text-xs hidden sm:inline">Copy</span>
                            </Button>
                          </div>
                          <div className="overflow-x-auto">
                            <SyntaxHighlighter style={syntaxHighlighterStyle} language={language} PreTag="pre" className="!bg-transparent !m-0 !p-4 !text-sm [&>code]:!bg-transparent [&_span]:!bg-transparent [&_*]:!bg-transparent" customStyle={{ backgroundColor: 'transparent' }} {...props}>{codeString}</SyntaxHighlighter>
                          </div>
                        </div>
                      );
                    }
                    
                    // --- CASE 3: Render as a small inline code snippet (using ``) ---
                    // This logic remains the same.
                    return (
                      <code className="px-1 py-0.5 mx-0.5 bg-muted text-primary rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  a: ({ children, ...props }) => (
                    <a className="text-primary hover:text-primary-hover underline hover:no-underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
                  ),
                  img: ({ ...props }) => (
                    <img className="rounded-lg max-w-full h-auto my-4" alt={props.alt || ''} {...props} />
                  ),
                  table: ({ children, ...props }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="border-collapse border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden min-w-full" {...props}>{children}</table>
                    </div>
                  ),
                  th: ({ children, ...props }) => (
                    <th className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold border-b border-gray-300 dark:border-gray-600" {...props}>{children}</th>
                  ),
                  td: ({ children, ...props }) => (
                    <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700" {...props}>{children}</td>
                  ),
                  blockquote: ({ children, ...props }) => (
                    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 my-4 bg-gray-50 dark:bg-gray-900 rounded-r" {...props}>
                      {children}
                    </blockquote>
                  ),
                  ul: ({ children, ...props }) => (
                    <ul className="list-disc pl-6 my-4 space-y-1" {...props}>{children}</ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol className="list-decimal pl-6 my-4 space-y-1" {...props}>{children}</ol>
                  ),
                  h1: ({ children, ...props }) => (
                    <h1 className="text-2xl font-bold mt-6 mb-4 first:mt-0" {...props}>{children}</h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2 className="text-xl font-bold mt-6 mb-3 first:mt-0" {...props}>{children}</h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3 className="text-lg font-semibold mt-5 mb-3 first:mt-0" {...props}>{children}</h3>
                  ),
                  h4: ({ children, ...props }) => (
                    <h4 className="text-base font-semibold mt-4 mb-2 first:mt-0" {...props}>{children}</h4>
                  ),
                  h5: ({ children, ...props }) => (
                    <h5 className="text-sm font-semibold mt-4 mb-2 first:mt-0" {...props}>{children}</h5>
                  ),
                  h6: ({ children, ...props }) => (
                    <h6 className="text-sm font-semibold mt-4 mb-2 first:mt-0" {...props}>{children}</h6>
                  ),
                  hr: ({ ...props }) => (
                    <hr className="my-6 border-gray-300 dark:border-gray-600" {...props} />
                  ),
                  strong: ({ children, ...props }) => (
                    <strong className="font-bold" {...props}>{children}</strong>
                  ),
                  em: ({ children, ...props }) => (
                    <em className="italic" {...props}>{children}</em>
                  ),
                }}
              >
                {displayedContent.trim()}
              </ReactMarkdown>
            </div>
          )}
          
          {/* Message Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mt-3">
            <div className="flex items-center gap-2 text-xs flex-wrap">
              {!isUser && agentName && (
                <Badge variant="secondary" className="h-4 sm:h-5 text-xs px-1.5 sm:px-2 shrink-0">
                  {agentName}
                </Badge>
              )}
              {!isUser && modelName && (
                <Badge variant="outline" className="h-4 sm:h-5 text-xs px-1.5 sm:px-2 shrink-0">
                  <Cpu className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-1" />
                  <span className="truncate max-w-[120px] sm:max-w-none">{modelName}</span>
                </Badge>
              )}
            </div>
            <span className="text-xs opacity-60 font-mono shrink-0 self-end sm:self-auto">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        
        {/* Message Actions - Outside the bubble */}
        <MessageActions />
      </div>

      {isUser && (
        <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 mt-1">
          <AvatarImage alt="User" />
          <AvatarFallback className="bg-primary/20 border border-primary/30">
            <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}