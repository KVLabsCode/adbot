"use client";

import { FormatType } from "@/types";
import { ALL_FORMAT_TYPES, formatMetadata, formatToRobotCompatibility } from "@/lib/creativeMappings";
import { robotTypeEmojis } from "@/lib/campaignMappings";

interface FormatSelectorProps {
  onSelect: (format: FormatType) => void;
  selected?: FormatType | null;
}

export function FormatSelector({ onSelect, selected }: FormatSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {ALL_FORMAT_TYPES.map((ft) => {
        const meta = formatMetadata[ft];
        const compatible = formatToRobotCompatibility[ft];
        const isSelected = selected === ft;

        return (
          <button
            key={ft}
            onClick={() => onSelect(ft)}
            className={`rounded-lg border p-3 text-left transition-colors hover:border-primary/30 hover:bg-accent ${
              isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : ""
            }`}
          >
            <span className="text-lg">{meta.emoji}</span>
            <p className="text-xs font-semibold mt-1">{meta.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {meta.whereItAppears}
            </p>
            <div className="flex gap-0.5 mt-1.5">
              {compatible.map((rt) => (
                <span key={rt} className="text-[10px]" title={rt}>
                  {robotTypeEmojis[rt]}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
