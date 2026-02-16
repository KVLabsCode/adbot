"use client";

import { Rocket, BarChart3, Brain, TrendingUp } from "lucide-react";

export type AgenticActionId = "launch" | "reporting" | "insights" | "performance";

interface AgenticActionsProps {
  onAction: (action: AgenticActionId) => void;
}

const actions: {
  id: AgenticActionId;
  label: string;
  emoji: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    id: "launch",
    label: "Launch Campaign",
    emoji: "🚀",
    icon: Rocket,
    description: "Build & deploy a new campaign",
  },
  {
    id: "reporting",
    label: "Reporting & Actions",
    emoji: "📈",
    icon: BarChart3,
    description: "View metrics & manage campaigns",
  },
  {
    id: "insights",
    label: "Insights",
    emoji: "🧠",
    icon: Brain,
    description: "AI-powered recommendations",
  },
  {
    id: "performance",
    label: "Performance",
    emoji: "📊",
    icon: TrendingUp,
    description: "Track campaign results",
  },
];

export function AgenticActions({ onAction }: AgenticActionsProps) {
  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto sm:grid-cols-4">
        {actions.map((a) => (
          <button
            key={a.id}
            onClick={() => onAction(a.id)}
            className="flex flex-col items-center gap-1.5 rounded-lg border bg-card p-3 text-center transition-colors hover:bg-accent hover:border-primary/30 active:scale-[0.98]"
            aria-label={a.label}
          >
            <span className="text-xl" role="img" aria-hidden="true">
              {a.emoji}
            </span>
            <span className="text-xs font-semibold leading-tight">{a.label}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              {a.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
