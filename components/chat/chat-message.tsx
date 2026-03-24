"use client";

import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, timestamp, isStreaming = false }: ChatMessageProps) {
  const isUser = role === "user";
  const isSystem = role === "system";

  if (isSystem) return null; // Don't render system messages

  return (
    <div className={cn("flex items-start gap-3", isUser && "justify-end")}>
      {!isUser && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      <div className={cn("flex flex-1 flex-col", isUser && "items-end")}>
        <div
          className={cn(
            "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm border border-border bg-card"
          )}
        >
          <div
            className={cn(
              "prose prose-sm max-w-none",
              isUser
                ? "prose-invert"
                : "prose-neutral dark:prose-invert prose-p:leading-relaxed"
            )}
          >
            {isStreaming && !isUser && !content.trim() ? (
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span>Thinking</span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                </span>
              </div>
            ) : null}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                ),
                h2: ({ children }) => (
                  <h2 className="mb-2 mt-4 text-base font-semibold first:mt-0">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-2 mt-3 text-sm font-semibold first:mt-0">{children}</h3>
                ),
                ul: ({ children }) => (
                  <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>
                ),
                table: ({ children }) => (
                  <div className="my-3 overflow-x-auto rounded-lg border border-border">
                    <table className="w-full border-collapse text-xs">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-muted/60">{children}</thead>,
                th: ({ children }) => (
                  <th className="border-b border-border px-3 py-2 text-left font-semibold">{children}</th>
                ),
                td: ({ children }) => <td className="border-b border-border/60 px-3 py-2">{children}</td>,
                tr: ({ children }) => <tr className="align-top">{children}</tr>,
                blockquote: ({ children }) => (
                  <blockquote className="my-2 border-l-2 border-primary/40 pl-3 text-muted-foreground">
                    {children}
                  </blockquote>
                ),
                pre: ({ children }) => (
                  <pre className="my-2 overflow-x-auto rounded-lg bg-muted p-3 text-xs">{children}</pre>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                code: ({ children }) => (
                  <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs">
                    {children}
                  </code>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
            {isStreaming && !isUser ? (
              <span className="ml-1 inline-block h-4 w-0.5 animate-pulse rounded bg-primary align-middle" />
            ) : null}
          </div>
        </div>

        <span className="mt-1 text-xs text-muted-foreground">
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {isUser && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
