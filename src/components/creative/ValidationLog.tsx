"use client";

import { useState } from "react";
import { useStore } from "@/store";
import { formatTypeLabels, formatTypeEmojis } from "@/lib/campaignMappings";
import { ChevronDown, ChevronRight } from "lucide-react";

export function ValidationLog() {
  const validationLog = useStore((s) => s.validationLog);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (validationLog.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <p className="text-2xl mb-2">📋</p>
        <p className="text-sm font-medium">No validation history</p>
        <p className="text-xs text-muted-foreground mt-1">
          Validation results will appear here when you create or validate creatives.
        </p>
      </div>
    );
  }

  const sorted = [...validationLog].reverse();

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs text-muted-foreground mb-3">
          {validationLog.length} validation{validationLog.length !== 1 ? "s" : ""}
        </p>
        <div className="space-y-2">
          {sorted.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <div key={entry.id} className="rounded-lg border">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-accent/50 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-base flex-shrink-0">
                    {formatTypeEmojis[entry.formatType]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{entry.creativeName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatTypeLabels[entry.formatType]} &middot;{" "}
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      entry.passed
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {entry.passed ? "Passed" : "Failed"}
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t px-3 py-2 space-y-1.5">
                    {entry.results.map((r) => (
                      <div
                        key={r.category}
                        className={`flex items-start gap-2 rounded px-2 py-1.5 text-xs ${
                          r.passed ? "bg-green-500/5" : "bg-amber-500/5"
                        }`}
                      >
                        <span className="flex-shrink-0 mt-0.5">
                          {r.passed ? "\u2705" : "\u26a0\ufe0f"}
                        </span>
                        <div>
                          <p className="font-medium capitalize">
                            {r.category.replace(/_/g, " ")}
                          </p>
                          <p className="text-muted-foreground text-[10px]">{r.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
