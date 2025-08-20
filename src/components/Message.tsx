import { motion } from "framer-motion";
import { User, Bot, Copy, Check, Trash2, Cpu } from "lucide-react";
import ReactMarkdown, { type ExtraProps } from "react-markdown";
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

// Interface defining all the props the component accepts
interface MessageProps {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
  onDelete: (messageId: string) => void;
  modelName?: string;
}

// A precise type for the props of our custom 'code' component.
// This solves the "'inline' does not exist on type..." error.
type CodeBlockProps = {
    children?: ReactNode;
    className?: string;
    node?: unknown;
    inline?: boolean;
} & ExtraProps;

export function Message({ id, content, isUser, timestamp, isTyping = false, onDelete, modelName }: MessageProps) {
  const [isDark, setIsDark] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const TypingIndicator = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-current rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );

  const MessageActions = () => (
    <div className={`
      absolute top-1/2 -translate-y-1/2 flex items-center gap-1 p-1 rounded-md bg-secondary border shadow-sm
      transition-opacity duration-200 opacity-0 group-hover:opacity-100
      ${isUser ? 'right-full mr-2' : 'left-full ml-2'}
    `}>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(id)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );

  // Assign the style to a correctly typed variable before using it.
  // This solves the "No overload matches this call" error.
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

      <div className="relative max-w-[70%]">
        <div className={`rounded-2xl px-3 py-2 ${isUser ? 'bg-chat-user-bubble text-chat-user-bubble-foreground' : 'bg-chat-assistant-bubble text-chat-assistant-bubble-foreground'}`}>
          {isTyping ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">{content}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-table:my-4 prose-th:p-2 prose-td:p-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Apply our new, precise type to the code component's props.
                  code({ inline, className, children, ...props }: CodeBlockProps) {
                    const match = /language-(\w+)/.exec(className || '');
                    if (!inline) {
                      return (
                        <SyntaxHighlighter
                          style={syntaxHighlighterStyle} // Use the correctly typed style variable
                          language={match ? match[1] : 'plaintext'}
                          PreTag="div"
                          className="rounded-lg !my-2"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      );
                    }
                    return (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 mt-2">
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