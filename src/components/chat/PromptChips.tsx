"use client";

import { useState } from "react";
import { DollarSign, BarChart3, Lightbulb, ArrowLeft, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store";
import {
  promptCategories,
  getContextualActionChips,
  getCampaignManagementChips,
  ActionChip,
} from "@/lib/promptRegistry";
import { ActionType, PromptCategory } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  DollarSign,
  BarChart3,
  Lightbulb,
};

interface PromptChipsProps {
  onPromptSelect: (label: string) => void;
  onAction?: (actionType: ActionType, payload: Record<string, unknown>) => void;
  compact?: boolean;
}

export function PromptChips({ onPromptSelect, onAction, compact }: PromptChipsProps) {
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | null>(null);
  const draft = useStore((s) => s.campaignDraft);
  const campaigns = useStore((s) => s.campaigns);

  const actionChips = getContextualActionChips(draft, campaigns);
  const managementChips = getCampaignManagementChips(campaigns);

  // If a category is expanded, show the AI question prompts
  if (selectedCategory) {
    const category = promptCategories.find((c) => c.id === selectedCategory);
    if (!category) return null;

    return (
      <div className={compact ? "px-4 py-2" : "px-4 py-3"}>
        <button
          onClick={() => setSelectedCategory(null)}
          className="mb-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </button>
        <div className="flex flex-wrap gap-2">
          {category.prompts.map((prompt) => (
            <Button
              key={prompt.id}
              variant="outline"
              size="sm"
              className="h-auto whitespace-normal text-left text-xs py-1.5 px-3"
              onClick={() => {
                onPromptSelect(prompt.label);
                setSelectedCategory(null);
              }}
            >
              {prompt.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "px-4 py-2" : "px-4 py-3"}>
      <div className="flex flex-wrap justify-center gap-2">
        {/* Action chips */}
        {actionChips.map((chip) => (
          <ActionChipButton
            key={chip.id}
            chip={chip}
            onAction={onAction}
          />
        ))}

        {/* Campaign management chips (when no draft active) */}
        {!draft && managementChips.map((chip) => (
          <ActionChipButton
            key={chip.id}
            chip={chip}
            onAction={onAction}
          />
        ))}

        {/* AI question category chips */}
        {promptCategories.map((cat) => {
          const Icon = iconMap[cat.icon];
          return (
            <Button
              key={cat.id}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {cat.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function ActionChipButton({
  chip,
  onAction,
}: {
  chip: ActionChip;
  onAction?: (actionType: ActionType, payload: Record<string, unknown>) => void;
}) {
  const isLaunch = chip.actionType === "LAUNCH_CAMPAIGN";

  return (
    <Button
      variant={isLaunch ? "default" : "outline"}
      size="sm"
      className={`text-xs ${isLaunch ? "gap-1.5" : ""}`}
      onClick={() => onAction?.(chip.actionType, chip.payload)}
    >
      {isLaunch && <Rocket className="h-3.5 w-3.5" />}
      {chip.label}
    </Button>
  );
}
