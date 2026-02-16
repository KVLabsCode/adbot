"use client";

import { useCallback, useEffect, useRef, useMemo } from "react";
import { useStore } from "@/store";
import { useChat } from "@/lib/useChat";
import { executeAction } from "@/lib/actionRegistry";
import { ActionType } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { PromptChips } from "./PromptChips";
import { ChatInput } from "./ChatInput";
import { WelcomeScreen } from "./WelcomeScreen";
import { DecisionLifecyclePanel } from "./DecisionLifecyclePanel";
import { OnboardingOverlay } from "@/components/onboarding/OnboardingOverlay";

export function ChatWindow() {
  const conversation = useStore((s) => s.conversation);
  const hasSeenOnboarding = useStore((s) => s.hasSeenOnboarding);
  const { sendMessage, isStreaming } = useChat();

  const scrollRef = useRef<HTMLDivElement>(null);

  const hasMessages = useMemo(
    () => conversation.length > 0,
    [conversation]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  const handlePromptSelect = (label: string) => {
    sendMessage(label);
  };

  const handleAction = useCallback(
    (actionType: ActionType, payload: Record<string, unknown>) => {
      executeAction(actionType, payload);
    },
    []
  );

  return (
    <div className="flex h-full flex-col">
      {!hasSeenOnboarding && <OnboardingOverlay />}

      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Studio</h2>
        <p className="text-xs text-muted-foreground">
          Create and manage campaigns through chat
        </p>
      </div>

      <DecisionLifecyclePanel />

      {!hasMessages ? (
        <WelcomeScreen
          onPromptSelect={handlePromptSelect}
          onAction={handleAction}
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
          <div className="space-y-3 max-w-2xl mx-auto">
            {conversation.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        </div>
      )}

      <div className="border-t bg-card">
        {hasMessages && (
          <PromptChips
            onPromptSelect={handlePromptSelect}
            onAction={handleAction}
            compact
          />
        )}
        <div className="px-4 py-3">
          <ChatInput onSend={sendMessage} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
}
