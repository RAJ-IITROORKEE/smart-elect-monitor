"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ChatSuggestions } from "./chat-suggestions";
import { ModelSelector } from "./model-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Copy,
  Database,
  Droplets,
  Loader2,
  Menu,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_CHAT_MODEL, isAllowedChatModel } from "@/lib/chat-models";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  startedAt: Date;
  updatedAt: Date;
  messages: Message[];
  persistedMessageIds: string[];
}

interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  lastSeen: string | Date;
  totalReadings: number;
}

interface ContextStats {
  safeCount: number;
  unsafeCount: number;
  totalReadings: number;
}

interface ContextReading {
  predictionStatus: string | null;
  predictionRiskLevel: string | null;
}

interface DeviceContextResponse {
  stats?: ContextStats;
  readings?: ContextReading[];
}

interface ChatInterfaceProps {
  deviceId: string;
  device: DeviceInfo;
}

interface HistoryMessageResponse {
  messageId: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

interface ChatStreamEvent {
  delta?: string;
  done?: boolean;
  error?: string;
  model?: string;
  userMessageId?: string;
  assistantMessageId?: string;
}

const SESSION_BREAK_MS = 45 * 60 * 1000;

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function formatChatTime(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatSidebarTime(value: Date): string {
  const now = new Date();
  const sameDay =
    now.getFullYear() === value.getFullYear() &&
    now.getMonth() === value.getMonth() &&
    now.getDate() === value.getDate();

  if (sameDay) return formatChatTime(value);

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(value);
}

function buildSessionTitle(messages: Message[]): string {
  const firstPrompt = messages.find((m) => m.role === "user")?.content;
  if (!firstPrompt) return "New chat";

  const trimmed = firstPrompt.trim();
  if (trimmed.length <= 48) return trimmed;
  return `${trimmed.slice(0, 48)}...`;
}

function groupMessagesIntoSessions(messages: HistoryMessageResponse[]): ChatSession[] {
  if (messages.length === 0) return [];

  const ordered = [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const sessions: ChatSession[] = [];
  let current: ChatSession | null = null;
  let previousAt = 0;

  for (const message of ordered) {
    const messageDate = new Date(message.timestamp);
    const currentAt = messageDate.getTime();
    const shouldSplit =
      current && message.role === "user" && currentAt - previousAt > SESSION_BREAK_MS;

    if (!current || shouldSplit) {
      current = {
        id: `session-${message.messageId}`,
        title: "New chat",
        startedAt: messageDate,
        updatedAt: messageDate,
        messages: [],
        persistedMessageIds: [],
      };
      sessions.push(current);
    }

    current.messages.push({
      id: message.messageId,
      role: message.role,
      content: message.content,
      timestamp: messageDate,
    });
    current.persistedMessageIds.push(message.messageId);
    current.updatedAt = messageDate;
    previousAt = currentAt;
  }

  return sessions
    .map((session) => ({
      ...session,
      title: buildSessionTitle(session.messages),
    }))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

function emptySession(): ChatSession {
  const now = new Date();
  return {
    id: `session-local-${crypto.randomUUID()}`,
    title: "New chat",
    startedAt: now,
    updatedAt: now,
    messages: [],
    persistedMessageIds: [],
  };
}

function withUpdatedSession(
  sessions: ChatSession[],
  targetSessionId: string,
  updater: (session: ChatSession) => ChatSession
): ChatSession[] {
  return sessions
    .map((session) => (session.id === targetSessionId ? updater(session) : session))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export function ChatInterface({ deviceId, device }: ChatInterfaceProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [context, setContext] = useState<DeviceContextResponse | null>(null);
  const [search, setSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [composerValue, setComposerValue] = useState("");
  const [isDeletingSessionId, setIsDeletingSessionId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [pendingDeleteSession, setPendingDeleteSession] = useState<ChatSession | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_CHAT_MODEL);
  const [activeModel, setActiveModel] = useState<string>(DEFAULT_CHAT_MODEL);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [activeSessionId, sessions]
  );

  const filteredSessions = useMemo(() => {
    if (!search.trim()) return sessions;
    const query = search.toLowerCase();
    return sessions.filter((session) => {
      if (session.title.toLowerCase().includes(query)) return true;
      return session.messages.some((message) =>
        message.content.toLowerCase().includes(query)
      );
    });
  }, [search, sessions]);

  const isOffline =
    Date.now() - toDate(device.lastSeen).getTime() > 2 * 60 * 1000;

  const latestPrediction = context?.readings?.[0]?.predictionStatus ?? null;
  const latestRiskLevel = context?.readings?.[0]?.predictionRiskLevel ?? null;

  const safeCount = context?.stats?.safeCount ?? 0;
  const unsafeCount = context?.stats?.unsafeCount ?? 0;

  useEffect(() => {
    const loadHistoryAndContext = async () => {
      try {
        const [historyRes, contextRes] = await Promise.all([
          fetch(`/api/chat/history/${deviceId}`),
          fetch(`/api/device/${deviceId}/context`),
        ]);

        const historyData = (await historyRes.json()) as {
          messages?: HistoryMessageResponse[];
        };

        if (contextRes.ok) {
          const contextData = (await contextRes.json()) as DeviceContextResponse;
          setContext(contextData);
        }

        if (historyData.messages && historyData.messages.length > 0) {
          const nextSessions = groupMessagesIntoSessions(historyData.messages);
          setSessions(nextSessions);
          setActiveSessionId(nextSessions[0]?.id ?? "");
        } else {
          const fresh = emptySession();
          setSessions([fresh]);
          setActiveSessionId(fresh.id);
        }
      } catch (error) {
        console.error("Failed to load chat data:", error);
        const fresh = emptySession();
        setSessions([fresh]);
        setActiveSessionId(fresh.id);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistoryAndContext();
  }, [deviceId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages.length, isLoading]);

  const createNewChat = () => {
    const fresh = emptySession();
    setSessions((prev) => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
    setSearch("");
    setComposerValue("");
    setIsSidebarOpen(false);
  };

  const copyAssistantMessage = async (message: Message) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      window.setTimeout(() => {
        setCopiedMessageId((current) => (current === message.id ? null : current));
      }, 1800);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!activeSession || isLoading) return;

    const targetSessionId = activeSession.id;
    const historyForApi = activeSession.messages.filter(
      (message) => message.role === "user" || message.role === "assistant"
    );
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    const assistantDraftId = crypto.randomUUID();
    const assistantDraft: Message = {
      id: assistantDraftId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setSessions((prev) =>
      withUpdatedSession(prev, targetSessionId, (session) => {
        const updatedMessages = [...session.messages, userMessage, assistantDraft];
        return {
          ...session,
          title:
            session.title === "New chat"
              ? buildSessionTitle(updatedMessages)
              : session.title,
          updatedAt: userMessage.timestamp,
          messages: updatedMessages,
        };
      })
    );

    setIsLoading(true);
    setStreamingMessageId(assistantDraftId);
    setActiveModel(selectedModel);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          message: content,
          model: selectedModel,
          stream: true,
          conversationHistory: historyForApi,
        }),
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!res.body) {
        const data = (await res.json()) as {
          message: string;
          userMessageId?: string;
          assistantMessageId?: string;
          model?: string;
        };

        if (data.model) {
          setActiveModel(data.model);
        }

        setSessions((prev) =>
          withUpdatedSession(prev, targetSessionId, (session) => {
            const nextPersistedIds = [...session.persistedMessageIds];
            if (data.userMessageId) nextPersistedIds.push(data.userMessageId);
            if (data.assistantMessageId) nextPersistedIds.push(data.assistantMessageId);

            return {
              ...session,
              updatedAt: new Date(),
              persistedMessageIds: nextPersistedIds,
              messages: session.messages.map((msg) =>
                msg.id === assistantDraftId
                  ? {
                      ...msg,
                      id: data.assistantMessageId || msg.id,
                      content: data.message,
                      timestamp: new Date(),
                    }
                  : msg
              ),
            };
          })
        );

        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";
      let persistedUserMessageId: string | undefined;
      let persistedAssistantMessageId: string | undefined;

      const applyAssistantContent = (nextContent: string, nextId?: string) => {
        setSessions((prev) =>
          withUpdatedSession(prev, targetSessionId, (session) => ({
            ...session,
            updatedAt: new Date(),
            messages: session.messages.map((msg) =>
              msg.id === assistantDraftId
                ? {
                    ...msg,
                    id: nextId || msg.id,
                    content: nextContent,
                    timestamp: new Date(),
                  }
                : msg
            ),
          }))
        );
      };

      const finalizePersistedIds = (userId?: string, assistantId?: string) => {
        if (!userId && !assistantId) return;
        setSessions((prev) =>
          withUpdatedSession(prev, targetSessionId, (session) => {
            const nextPersistedIds = [...session.persistedMessageIds];
            if (userId) nextPersistedIds.push(userId);
            if (assistantId) nextPersistedIds.push(assistantId);

            return {
              ...session,
              persistedMessageIds: nextPersistedIds,
            };
          })
        );
      };

      const processEvent = (event: ChatStreamEvent) => {
        if (event.error) {
          throw new Error(event.error);
        }

        if (event.model && isAllowedChatModel(event.model)) {
          setActiveModel(event.model);
        }

        if (event.userMessageId) {
          persistedUserMessageId = event.userMessageId;
        }

        if (event.assistantMessageId) {
          persistedAssistantMessageId = event.assistantMessageId;
        }

        if (typeof event.delta === "string" && event.delta.length > 0) {
          fullContent += event.delta;
          applyAssistantContent(fullContent, persistedAssistantMessageId);
        }

        if (event.done) {
          if (!fullContent.trim()) {
            fullContent = "No response generated. Please try again.";
          }
          applyAssistantContent(fullContent, persistedAssistantMessageId);
          finalizePersistedIds(persistedUserMessageId, persistedAssistantMessageId);
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const payload = trimmed.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;

          try {
            const event = JSON.parse(payload) as ChatStreamEvent;
            processEvent(event);
          } catch (parseError) {
            console.error("Failed to parse stream payload:", parseError);
          }
        }
      }

      if (buffer.trim().startsWith("data:")) {
        const payload = buffer.trim().slice(5).trim();
        if (payload && payload !== "[DONE]") {
          try {
            const event = JSON.parse(payload) as ChatStreamEvent;
            processEvent(event);
          } catch (parseError) {
            console.error("Failed to parse final stream payload:", parseError);
          }
        }
      }

      if (!fullContent.trim()) {
        throw new Error("No response from AI");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Sorry, I encountered an error processing your request. Please try again.";

      setSessions((prev) =>
        withUpdatedSession(prev, targetSessionId, (session) => {
          const hasDraft = session.messages.some((msg) => msg.id === assistantDraftId);

          if (!hasDraft) {
            return {
              ...session,
              updatedAt: new Date(),
              messages: [
                ...session.messages,
                {
                  id: crypto.randomUUID(),
                  role: "assistant",
                  content: message,
                  timestamp: new Date(),
                },
              ],
            };
          }

          return {
            ...session,
            updatedAt: new Date(),
            messages: session.messages.map((msg) =>
              msg.id === assistantDraftId
                ? {
                    ...msg,
                    content: message,
                    timestamp: new Date(),
                  }
                : msg
            ),
          };
        })
      );
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  };

  const handleDeleteSession = async (session: ChatSession) => {
    if (isDeletingSessionId || session.messages.length === 0) return;

    setIsDeletingSessionId(session.id);

    try {
      if (session.persistedMessageIds.length > 0) {
        const response = await fetch(`/api/chat/history/${deviceId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionMessageIds: session.persistedMessageIds }),
        });

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error || "Failed to delete chat");
        }
      }

      setSessions((prev) => {
        const next = prev.filter((item) => item.id !== session.id);
        if (next.length === 0) {
          const fresh = emptySession();
          setActiveSessionId(fresh.id);
          return [fresh];
        }

        if (activeSessionId === session.id) {
          setActiveSessionId(next[0].id);
        }

        return next;
      });
    } catch (error) {
      console.error("Failed to delete chat session:", error);
    } finally {
      setIsDeletingSessionId(null);
      setPendingDeleteSession(null);
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border p-4">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2.5 font-bold text-foreground transition-opacity hover:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
            <Droplets className="h-4.5 w-4.5 text-primary" />
          </span>
          <span className="gradient-text text-lg font-extrabold tracking-tight">
            JalRakshak<span className="text-primary">.AI</span>
          </span>
        </Link>

        <Button
          onClick={createNewChat}
          className="w-full justify-start gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search chats"
            className="h-9 border-sidebar-border bg-sidebar pl-8"
          />
        </div>
      </div>

      <div className="space-y-3 border-b border-sidebar-border p-4">
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/35 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Device context
          </p>
          <p className="mt-1 truncate text-sm font-semibold">
            {device.deviceName || device.deviceId}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={isOffline ? "outline" : "success"} className="text-[11px]">
              {isOffline ? "Offline" : "Live"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {device.totalReadings} readings
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Last seen {toDate(device.lastSeen).toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/35 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Predictions snapshot
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-sidebar-border bg-sidebar px-2 py-1.5">
              <span className="block text-muted-foreground">Safe</span>
              <span className="font-semibold">{safeCount}</span>
            </div>
            <div className="rounded-lg border border-sidebar-border bg-sidebar px-2 py-1.5">
              <span className="block text-muted-foreground">Unsafe</span>
              <span className="font-semibold">{unsafeCount}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs">
            {latestPrediction === "Unsafe" ? (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
            <span className="text-muted-foreground">Latest:</span>
            <span className="font-medium">{latestPrediction ?? "No prediction"}</span>
            {latestRiskLevel ? (
              <span className="text-muted-foreground">({latestRiskLevel})</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Chats
        </p>

        <div className="space-y-1">
          {filteredSessions.map((session) => {
            const last = session.messages[session.messages.length - 1];
            const isActive = session.id === activeSessionId;

            return (
              <div
                key={session.id}
                className={cn(
                  "group rounded-lg border border-transparent transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/70"
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveSessionId(session.id);
                    setIsSidebarOpen(false);
                  }}
                  className="w-full cursor-pointer px-3 py-2 text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate pr-1 text-sm font-medium">{session.title}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatSidebarTime(session.updatedAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {last ? last.content : "Start a fresh conversation for this device"}
                  </p>
                </button>

                <div className="flex items-center justify-end px-2 pb-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 rounded-md px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={isDeletingSessionId === session.id}
                    onClick={() => setPendingDeleteSession(session)}
                  >
                    {isDeletingSessionId === session.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (isLoadingHistory) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background text-foreground">
      <aside className="hidden w-80 border-r border-sidebar-border bg-sidebar md:block">
        {sidebarContent}
      </aside>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-[320px] max-w-[85vw] p-0" showCloseButton={false}>
          <SheetHeader className="sr-only">
            <SheetTitle>Chat sessions</SheetTitle>
            <SheetDescription>Browse chat history and device context</SheetDescription>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold md:text-base">
                {device.deviceName || device.deviceId}
              </p>
              <p className="truncate text-xs text-muted-foreground">Device {device.deviceId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ModelSelector
              value={selectedModel}
              activeValue={activeModel}
              onChange={(nextModel) => {
                if (isAllowedChatModel(nextModel)) {
                  setSelectedModel(nextModel);
                  if (!isLoading) {
                    setActiveModel(nextModel);
                  }
                }
              }}
              disabled={isLoading}
            />

            <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
              <span className="inline-flex items-center gap-1">
                <Database className="h-3.5 w-3.5" />
                {device.totalReadings} readings
              </span>
              <span className="inline-flex items-center gap-1">
                <Activity className="h-3.5 w-3.5" />
                {latestPrediction ?? "No prediction"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" />
                {toDate(device.lastSeen).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background via-background to-muted/20">
          <div className="mx-auto flex w-full max-w-4xl flex-col px-4 pb-6 pt-6 md:px-6">
            {activeSession && activeSession.messages.length > 0 ? (
              <div className="space-y-5">
                {activeSession.messages.map((message, index) => {
                  const previousMessage =
                    index > 0 ? activeSession.messages[index - 1] : undefined;

                  return (
                    <div key={message.id} className="space-y-1.5">
                      <ChatMessage
                        role={message.role}
                        content={message.content}
                        timestamp={message.timestamp}
                        isStreaming={message.id === streamingMessageId}
                      />

                      {message.role === "assistant" && (
                        <div className="flex justify-start pl-11">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 rounded-md px-2 text-xs"
                            onClick={() => copyAssistantMessage(message)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copiedMessageId === message.id ? "Copied" : "Copy"}
                          </Button>

                          {previousMessage?.role === "user" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="ml-1 h-7 gap-1.5 rounded-md px-2 text-xs"
                              onClick={() => setComposerValue(previousMessage.content)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit query
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-semibold tracking-tight">Ask about this device</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  This chat is grounded in the selected device context, historical readings, and prediction history. Ask for analysis, anomaly detection, risk explanation, or action recommendations.
                </p>
                <div className="mt-5">
                  <ChatSuggestions onSelect={sendMessage} disabled={isLoading} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-border bg-background/95 px-4 py-4 backdrop-blur md:px-6">
          <div className="mx-auto w-full max-w-4xl">
            <ChatInput
              onSend={sendMessage}
              disabled={isLoading}
              value={composerValue}
              onValueChange={setComposerValue}
              submitLabel={composerValue.trim() ? "Resend query" : "Send message"}
            />
          </div>
        </div>
      </div>

      <Dialog
        open={Boolean(pendingDeleteSession)}
        onOpenChange={(open) => {
          if (!open && !isDeletingSessionId) {
            setPendingDeleteSession(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={!isDeletingSessionId}>
          <DialogHeader>
            <DialogTitle>Delete chat permanently?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All messages from this chat session will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDeleteSession(null)}
              disabled={Boolean(isDeletingSessionId)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!pendingDeleteSession || Boolean(isDeletingSessionId)}
              onClick={() => {
                if (pendingDeleteSession) {
                  handleDeleteSession(pendingDeleteSession);
                }
              }}
            >
              {isDeletingSessionId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete permanently"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
