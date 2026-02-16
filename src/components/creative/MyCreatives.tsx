"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { Creative, CreativeStatus } from "@/types";
import { formatTypeLabels, formatTypeEmojis } from "@/lib/campaignMappings";
import { robotTypeEmojis } from "@/lib/campaignMappings";
import { CreativeDetailPanel } from "./CreativeDetailPanel";

const statusColors: Record<CreativeStatus, string> = {
  [CreativeStatus.DRAFT]: "bg-muted text-muted-foreground",
  [CreativeStatus.VALIDATED]: "bg-green-500/10 text-green-700 dark:text-green-400",
  [CreativeStatus.NEEDS_CORRECTION]: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  [CreativeStatus.LIVE]: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
};

const statusLabels: Record<CreativeStatus, string> = {
  [CreativeStatus.DRAFT]: "Draft",
  [CreativeStatus.VALIDATED]: "Validated",
  [CreativeStatus.NEEDS_CORRECTION]: "Needs Correction",
  [CreativeStatus.LIVE]: "Live",
};

export function MyCreatives() {
  const creatives = useStore((s) => s.creatives);
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);

  if (selectedCreative) {
    return (
      <CreativeDetailPanel
        creative={selectedCreative}
        onBack={() => setSelectedCreative(null)}
      />
    );
  }

  if (creatives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <p className="text-2xl mb-2">🎨</p>
        <p className="text-sm font-medium">No creatives yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Use the "Create New" or "AI Generate" tabs to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs text-muted-foreground mb-3">
          {creatives.length} creative{creatives.length !== 1 ? "s" : ""}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {creatives.map((creative) => (
            <button
              key={creative.id}
              onClick={() => setSelectedCreative(creative)}
              className="rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary/30 hover:bg-accent"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-base">
                  {formatTypeEmojis[creative.formatType]}
                </span>
                <span className="text-xs font-medium truncate">
                  {formatTypeLabels[creative.formatType]}
                </span>
              </div>
              <p className="text-xs font-semibold truncate mb-1">{creative.name}</p>
              <div className="flex flex-wrap gap-0.5 mb-2">
                {creative.robotTypes.map((rt) => (
                  <span key={rt} className="text-xs" title={rt}>
                    {robotTypeEmojis[rt]}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    statusColors[creative.status]
                  }`}
                >
                  {statusLabels[creative.status]}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(creative.lastModified).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
