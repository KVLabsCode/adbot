"use client";

import { useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import { useChat } from "@/lib/useChat";
import { handleReporting, handleInsights } from "@/lib/agenticHandlers";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { WelcomeScreen } from "./WelcomeScreen";
import { DecisionLifecyclePanel } from "./DecisionLifecyclePanel";
import { OnboardingOverlay } from "@/components/onboarding/OnboardingOverlay";
import { AgenticActions, AgenticActionId } from "@/components/studio/AgenticActions";

export function ChatWindow() {
  const conversation = useStore((s) => s.conversation);
  const hasSeenOnboarding = useStore((s) => s.hasSeenOnboarding);
  const { sendMessage, isStreaming } = useChat();
  const router = useRouter();

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

  const handleAgenticAction = useCallback(
    (action: AgenticActionId) => {
      switch (action) {
        case "launch":
          router.push("/create");
          break;
        case "creatives":
          router.push("/creatives");
          break;
        case "reporting":
          handleReporting();
          break;
        case "insights":
          handleInsights();
          break;
      }
    },
    [router]
  );

  return (
    <div className="flex h-full flex-col">
      {!hasSeenOnboarding && <OnboardingOverlay />}

      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Chat</h2>
          <p className="text-xs text-muted-foreground">
            Ask questions, get insights, and manage campaigns
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
          AI Assistant Online
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
        </div>
      </div>

      {/* Live status strip */}
      <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-1.5 text-[11px] text-muted-foreground overflow-x-auto">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
        <span className="whitespace-nowrap">247 Robots Online</span>
        <span className="text-border shrink-0">|</span>
        <span className="whitespace-nowrap hidden sm:inline">R2B Mediation Active</span>
        <span className="text-border shrink-0 hidden sm:inline">|</span>
        <span className="whitespace-nowrap">$18,391 Generated Today</span>
      </div>

      <DecisionLifecyclePanel />

      {!hasMessages ? (
        <WelcomeScreen onAction={handleAgenticAction} />
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
          <AgenticActions onAction={handleAgenticAction} />
        )}
        <div className="px-4 py-3">
          <ChatInput onSend={sendMessage} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
}
