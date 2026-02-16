"use client";

import { ActionType } from "@/types";
import { useStore } from "@/store";
import { PromptChips } from "./PromptChips";
import { Target } from "lucide-react";

interface WelcomeScreenProps {
  onPromptSelect: (label: string) => void;
  onAction?: (actionType: ActionType, payload: Record<string, unknown>) => void;
}

export function WelcomeScreen({ onPromptSelect, onAction }: WelcomeScreenProps) {
  const campaigns = useStore((s) => s.campaigns);
  const hasCampaigns = campaigns.length > 0;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="text-center mb-6">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Target className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          {hasCampaigns ? "How can I help today?" : "Start your first campaign"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {hasCampaigns
            ? "Ask about your campaigns, check performance, or launch a new one."
            : "Launch a robot decision campaign to influence how robots choose your brand. Pick a campaign type below to get started."}
        </p>
      </div>
      <PromptChips onPromptSelect={onPromptSelect} onAction={onAction} />
    </div>
  );
}
