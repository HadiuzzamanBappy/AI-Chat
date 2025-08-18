import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useState } from "react";

interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

export function Message({ content, isUser, timestamp, isTyping = false }: MessageProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  const TypingIndicator = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-current rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-4 p-6 ${isUser ? 'justify-end' : 'justify-start'
        }`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-chat-assistant-bubble flex items-center justify-center">
          <Bot className="h-4 w-4 text-chat-assistant-bubble-foreground" />
        </div>
      )}

      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${isUser
            ? 'bg-chat-user-bubble text-chat-user-bubble-foreground'
            : 'bg-chat-assistant-bubble text-chat-assistant-bubble-foreground'
          }`}
      >
        {isTyping ? (
          <TypingIndicator />
        ) : isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                code({ className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  const isInline = !match;

                  return isInline ? (
                    <code
                      className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <SyntaxHighlighter
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      style={isDark ? oneDark as any : oneLight as any}
                      language={language}
                      PreTag="div"
                      className="rounded-lg !my-2"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                pre({ children }: any) {
                  return <>{children}</>;
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

        <div className="flex justify-end mt-2">
          <span className="text-xs opacity-60">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-chat-user-bubble flex items-center justify-center">
          <User className="h-4 w-4 text-chat-user-bubble-foreground" />
        </div>
      )}
    </motion.div>
  );
}