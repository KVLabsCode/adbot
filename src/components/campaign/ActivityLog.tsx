"use client";

import { ActionEvent, ActionType } from "@/types";
import { flowTypeLabels, formatTypeLabels } from "@/lib/campaignMappings";
import { FlowType, FormatType } from "@/types";

const actionLabels: Record<ActionType, (payload: Record<string, unknown>) => string> = {
  CREATE_CAMPAIGN: () => "Campaign Created",
  SET_FLOW: (p) => `Flow Selected: ${flowTypeLabels[p.flow as FlowType] ?? p.flow}`,
  ADD_FORMAT: (p) => `Format Added: ${formatTypeLabels[p.formatType as FormatType] ?? p.formatType}`,
  SET_BUDGET: (p) => `Budget Set: $${(p.budget as number).toLocaleString()}`,
  LAUNCH_CAMPAIGN: () => "Campaign Launched",
  PAUSE_CAMPAIGN: () => "Campaign Paused",
  RESUME_CAMPAIGN: () => "Campaign Resumed",
  INCREASE_BUDGET: (p) => `Budget Increased by $${(p.amount as number).toLocaleString()}`,
};

function relativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

interface ActivityLogProps {
  events: ActionEvent[];
}

export function ActivityLog({ events }: ActivityLogProps) {
  if (events.length === 0) return null;

  return (
    <div className="relative pl-4">
      <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
      <div className="space-y-3">
        {events.map((event) => {
          const label = actionLabels[event.type]?.(event.payload) ?? event.type;
          return (
            <div key={event.id} className="flex items-start gap-3 relative">
              <div className="absolute left-[-13px] top-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {relativeTime(event.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
