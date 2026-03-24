/**
 * Chat Completion API Route
 * POST /api/chat
 * 
 * Handles chat messages and calls OpenRouter API with device context
 */

import { prisma } from "@/lib/prisma";
import {
  ChatMessage,
  ChatCompletionStreamChunk,
  createChatCompletion,
  createChatCompletionStream,
} from "@/lib/openrouter";
import { getDeviceContext } from "@/lib/device-context-cache";
import { JALRAKSHAK_SYSTEM_PROMPT } from "@/lib/chat-prompts";
import { DEFAULT_CHAT_MODEL, isAllowedChatModel } from "@/lib/chat-models";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Allow up to 60 seconds for AI response

interface ConversationHistoryItem {
  role?: string;
  content?: string;
}

interface ChatRequestBody {
  deviceId?: string;
  message?: string;
  model?: string;
  stream?: boolean;
  conversationHistory?: ConversationHistoryItem[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const { deviceId, message, model, stream, conversationHistory } = body;
    const requestedModel =
      typeof model === "string" && isAllowedChatModel(model)
        ? model
        : DEFAULT_CHAT_MODEL;
    const shouldStream = stream === true;

    // Validate input
    if (!deviceId || !message) {
      return NextResponse.json(
        { error: "Missing deviceId or message" },
        { status: 400 }
      );
    }

    const deviceContext = await getDeviceContext(deviceId);
    if (!deviceContext) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    const { contextStr } = deviceContext;

    // Prepare messages for OpenRouter
    const messages: ChatMessage[] = [
      { role: "system", content: JALRAKSHAK_SYSTEM_PROMPT },
      { role: "system", content: contextStr },
    ];

    // Add conversation history (limit to last 10 messages to avoid token limit)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory
        .slice(-10)
        .filter(
          (m): m is { role: "user" | "assistant"; content: string } =>
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string" &&
            m.content.trim().length > 0
        )
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));
      messages.push(...recentHistory);
    }

    // Add current user message
    messages.push({ role: "user", content: message });
    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();

    // Save user message to database
    await prisma.chatMessage.create({
      data: {
        messageId: userMessageId,
        deviceId,
        role: "user",
        content: message,
        model: requestedModel,
      },
    });

    if (shouldStream) {
      const encoder = new TextEncoder();
      const streamResponse = await createChatCompletionStream(messages, requestedModel);
      const resolvedModel = streamResponse.model;

      const readable = new ReadableStream<Uint8Array>({
        async start(controller) {
          const sendEvent = (event: Record<string, unknown>) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
            );
          };

          try {
            sendEvent({
              model: resolvedModel,
              userMessageId,
            });

            const reader = streamResponse.response.body?.getReader();
            if (!reader) {
              throw new Error("No stream body from AI provider");
            }

            const decoder = new TextDecoder();
            let buffer = "";
            let assistantMessage = "";

            const processPayload = (payload: string) => {
              if (!payload || payload === "[DONE]") {
                return;
              }

              const parsed = JSON.parse(payload) as ChatCompletionStreamChunk;
              const delta = parsed.choices?.[0]?.delta?.content ?? "";
              if (!delta) {
                return;
              }

              assistantMessage += delta;
              sendEvent({ delta, model: resolvedModel });
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
                processPayload(payload);
              }
            }

            if (buffer.trim().startsWith("data:")) {
              processPayload(buffer.trim().slice(5).trim());
            }

            if (!assistantMessage.trim()) {
              throw new Error("No response from AI");
            }

            await prisma.chatMessage.create({
              data: {
                messageId: assistantMessageId,
                deviceId,
                role: "assistant",
                content: assistantMessage,
                model: resolvedModel,
              },
            });

            sendEvent({
              done: true,
              model: resolvedModel,
              assistantMessageId,
              userMessageId,
            });
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (streamError: unknown) {
            const streamMessage =
              streamError instanceof Error
                ? streamError.message
                : "Failed to stream AI response";
            sendEvent({ error: streamMessage, model: resolvedModel, userMessageId });
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // Non-streaming fallback response
    const completion = await createChatCompletion(messages, requestedModel);
    const assistantMessage = completion.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error("No response from AI");
    }

    // Save assistant response to database
    await prisma.chatMessage.create({
      data: {
        messageId: assistantMessageId,
        deviceId,
        role: "assistant",
        content: assistantMessage,
        tokensUsed: completion.usage?.total_tokens,
        model: completion.model,
      },
    });

    return NextResponse.json({
      message: assistantMessage,
      tokensUsed: completion.usage?.total_tokens,
      model: completion.model,
      userMessageId,
      assistantMessageId,
    });
  } catch (error: unknown) {
    console.error("Error in chat completion:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate response";
    
    // Provide helpful error messages
    if (errorMessage.includes("OPENROUTER_API_KEY")) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
