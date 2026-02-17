"use client";

import { useStore } from "@/store";
import { AgenticActions, AgenticActionId } from "@/components/studio/AgenticActions";
import { Target } from "lucide-react";

interface WelcomeScreenProps {
  onAction: (action: AgenticActionId) => void;
}

export function WelcomeScreen({ onAction }: WelcomeScreenProps) {
  const campaigns = useStore((s) => s.campaigns);
  const hasCampaigns = campaigns.length > 0;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-kovio-blue/[0.03] to-transparent">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Target className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          {hasCampaigns ? "How can I help today?" : "Start your first campaign"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {hasCampaigns
            ? "Ask about your campaigns, check performance, or launch a new one."
            : "Launch a robot decision campaign to influence how robots choose your brand. Pick an action below to get started."}
        </p>
      </div>
      <AgenticActions onAction={onAction} />
    </div>
  );
}
