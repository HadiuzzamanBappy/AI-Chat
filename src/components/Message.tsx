/* eslint-disable @typescript-eslint/no-explicit-any */

import { motion } from "framer-motion";
import { User, Bot, Copy, Check, Trash2, Cpu, RotateCw } from "lucide-react";
import ReactMarkdown, { type ExtraProps } from "react-markdown";
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface MessageProps {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  onDelete: (messageId: string) => void;
  onRerun: (messageId: string) => void;
  modelName?: string;
  agentName?: string;
  shouldAnimate?: boolean;
  onAnimationComplete?: () => void;
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


export function Message({ id, content, isUser, timestamp, onDelete, onRerun, modelName, agentName, shouldAnimate = false, onAnimationComplete }: MessageProps) {
  const [isDark, setIsDark] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [displayedContent, setDisplayedContent] = useState(content);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

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
      absolute top-1/2 -translate-y-1/2 flex items-center gap-1 p-1 rounded-md bg-secondary border shadow-sm
      transition-opacity duration-200 opacity-0 group-hover:opacity-100
      ${isUser ? 'right-full mr-2' : 'left-full ml-2'}
    `}>
      {isUser && (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRerun(id)}>
          <RotateCw className="h-4 w-4" />
        </Button>
      )}
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy} aria-label="Copy message">
        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(id)} aria-label="Delete message">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );

  const syntaxHighlighterStyle: { [key: string]: CSSProperties } = isDark ? oneDark : oneLight;

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`group relative flex gap-4 p-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-chat-assistant-bubble flex items-center justify-center">
          <Bot className="h-4 w-4 text-chat-assistant-bubble-foreground" />
        </div>
      )}

      <div className="relative sm:max-w-[70%]">
        <div className={`rounded-2xl px-3 py-2 ${isUser ? 'bg-chat-user-bubble text-chat-user-bubble-foreground' : 'bg-chat-assistant-bubble text-chat-assistant-bubble-foreground'}`}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">{displayedContent}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-table:my-4 prose-th:p-2 prose-td:p-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  li: ({ children, ...props }: ListItemProps) => (
                    <li className="pl-1 mb-1 marker:text-primary" {...props}>{children}</li>
                  ),
                  p: ({ node, children }: ParagraphProps) => {
                    if (node?.children) {
                      const hasCodeBlock = node.children.some((child: any) =>
                        child.type === 'element' &&
                        child.tagName === 'code' &&
                        child.properties?.className?.some((cls: string) => cls.startsWith('language-'))
                      );
                      if (hasCodeBlock) {
                        return <div className="mb-2 last:mb-0">{children}</div>;
                      }
                    }
                    return <p className="mb-2 last:mb-0">{children}</p>;
                  },
                  code({ node, inline, className, children, ...props }: CodeBlockProps) {
                    const match = /language-(\w+)/.exec(className || '');
                    if (!inline) {
                      const codeString = String(children).replace(/\n$/, '');
                      const idx = node?.position?.start?.line || Math.random();
                      return (
                        <div className="relative group">
                          <SyntaxHighlighter
                            style={syntaxHighlighterStyle}
                            language={match ? match[1] : 'plaintext'}
                            PreTag="pre"
                            className="!text-sm rounded-lg !my-2 !p-4 !overflow-x-auto !border !border-muted"
                            showLineNumbers
                            {...props}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                          <button
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition px-2 py-1 rounded text-xs flex items-center gap-1"
                            onClick={() => handleCodeCopy(codeString, idx)}
                            aria-label="Copy code block"
                          >
                            {copiedCodeIdx === idx ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      );
                    }
                    return (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  a: ({ children, ...props }) => (
                    <a className="text-primary underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
                  ),
                  img: ({ ...props }) => (
                    <img className="rounded-lg border max-w-full h-auto my-2" alt={props.alt || ''} {...props} />
                  ),
                  table: ({ children, ...props }) => (
                    <table className="border-collapse border border-muted rounded-lg my-4" {...props}>{children}</table>
                  ),
                  th: ({ children, ...props }) => (
                    <th className="bg-muted px-2 py-1 text-left" {...props}>{children}</th>
                  ),
                  td: ({ children, ...props }) => (
                    <td className="px-2 py-1 border-t" {...props}>{children}</td>
                  ),
                  blockquote: ({ children, ...props }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-2" {...props}>{children}</blockquote>
                  ),
                  ul: ({ children, ...props }) => (
                    <ul className="list-disc pl-6 mb-2" {...props}>{children}</ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol className="list-decimal pl-6 mb-2" {...props}>{children}</ol>
                  ),
                }}
              >
                {displayedContent.trim()}
              </ReactMarkdown>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 mt-2">
            {!isUser && agentName && (
              <div className="flex items-center gap-1 text-xs opacity-50">
                <User size={12} />
                <span>{agentName}</span>
              </div>
            )}
            {!isUser && modelName && (
              <div className="flex items-center gap-1 text-xs opacity-50">
                <Cpu size={12} />
                <span>{modelName}</span>
              </div>
            )}
            <span className="text-xs opacity-60">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <MessageActions />
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-chat-user-bubble flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </motion.div>
  );
}