"use client";

import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import { useStore } from "@/store";
import { useChat } from "@/lib/useChat";
import { handleReporting, handleInsights } from "@/lib/agenticHandlers";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { WelcomeScreen } from "./WelcomeScreen";
import { DecisionLifecyclePanel } from "./DecisionLifecyclePanel";
import { OnboardingOverlay } from "@/components/onboarding/OnboardingOverlay";
import { AgenticActions, AgenticActionId } from "@/components/studio/AgenticActions";
import { LaunchFlow } from "@/components/studio/LaunchFlow";
import { CreativeStudio } from "@/components/creative/CreativeStudio";

export function ChatWindow() {
  const conversation = useStore((s) => s.conversation);
  const hasSeenOnboarding = useStore((s) => s.hasSeenOnboarding);
  const launchFlowStep = useStore((s) => s.launchFlowStep);
  const setLaunchFlowStep = useStore((s) => s.setLaunchFlowStep);
  const { sendMessage, isStreaming } = useChat();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLaunchFlow, setShowLaunchFlow] = useState(false);
  const [showCreativeStudio, setShowCreativeStudio] = useState(false);

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
          setShowLaunchFlow(true);
          setLaunchFlowStep("type-select");
          break;
        case "creatives":
          setShowCreativeStudio(true);
          break;
        case "reporting":
          handleReporting();
          break;
        case "insights":
          handleInsights();
          break;
      }
    },
    [setLaunchFlowStep]
  );

  const handleCloseLaunchFlow = useCallback(() => {
    setShowLaunchFlow(false);
    setLaunchFlowStep(null);
  }, [setLaunchFlowStep]);

  // Show the creative studio full-screen when active
  if (showCreativeStudio) {
    return (
      <div className="flex h-full flex-col">
        <CreativeStudio onClose={() => setShowCreativeStudio(false)} />
      </div>
    );
  }

  // Show the launch flow full-screen when active
  if (showLaunchFlow || launchFlowStep) {
    return (
      <div className="flex h-full flex-col">
        <LaunchFlow onClose={handleCloseLaunchFlow} />
      </div>
    );
  }

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
