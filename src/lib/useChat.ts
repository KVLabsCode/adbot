"use client";

import { useCallback, useRef, useState } from "react";
import { useStore } from "@/store";
import { ChatMessage, ChatRequestBody } from "@/types";
import { makeId } from "@/lib/idCounter";

export { makeId } from "@/lib/idCounter";

export function useChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const store = useStore.getState();

    // Add user message
    const userMsg: ChatMessage = {
      id: makeId(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    store.addMessage(userMsg);

    // Create streaming assistant message
    const assistantId = makeId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };
    store.addMessage(assistantMsg);
    setIsStreaming(true);

    // Build request
    const currentState = useStore.getState();
    const chatMessages = currentState.conversation
      .filter((m) => !m.isStreaming)
      .map((m) => ({ role: m.role, content: m.content }));
    // Add the new user message
    chatMessages.push({ role: "user" as const, content });

    const body: ChatRequestBody = {
      messages: chatMessages,
      context: {
        campaigns: currentState.campaigns,
        reportingData: currentState.reportingData,
        billingData: currentState.billingData,
        campaignDraft: currentState.campaignDraft,
      },
    };

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        useStore.getState().updateMessageContent(
          assistantId,
          err.error || "Something went wrong. Please try again."
        );
        useStore.getState().finalizeMessage(assistantId);
        setIsStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        useStore.getState().updateMessageContent(assistantId, "No response received.");
        useStore.getState().finalizeMessage(assistantId);
        setIsStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              accumulated += delta;
              useStore.getState().updateMessageContent(assistantId, accumulated);
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }

      useStore.getState().finalizeMessage(assistantId);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        useStore.getState().finalizeMessage(assistantId);
      } else {
        useStore.getState().updateMessageContent(
          assistantId,
          "Failed to get a response. Please check your connection and try again."
        );
        useStore.getState().finalizeMessage(assistantId);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { sendMessage, isStreaming, abort };
}
