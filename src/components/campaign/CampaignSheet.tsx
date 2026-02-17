"use client";

import { useState } from "react";
import { Campaign, CampaignStatus, CampaignSchedule, TimeWindow } from "@/types";
import { useStore } from "@/store";
import {
  campaignTypeLabels,
  campaignTypeEmojis,
  flowTypeLabels,
  timeWindowCampaignTypes,
} from "@/lib/campaignMappings";
import { FormatPreview } from "./FormatPreview";
import { ActivityLog } from "./ActivityLog";
import { MetricInfo } from "@/components/ui/MetricInfo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { X, ArrowUpRight, Pencil, Check as CheckIcon } from "lucide-react";
import Link from "next/link";

const timeWindowDisplayLabels: Record<string, string> = {
  all_day: "All Day",
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  night: "Night",
  lunch_rush: "Lunch Rush",
  dinner_rush: "Dinner Rush",
};

interface CampaignSheetProps {
  campaign: Campaign | null;
  open: boolean;
  onClose: () => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}

const statusBadgeClasses: Record<string, string> = {
  [CampaignStatus.ACTIVE]: "bg-black text-white px-2 py-1 rounded-full text-xs",
  [CampaignStatus.PAUSED]: "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs",
  [CampaignStatus.DRAFT]: "bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs",
};

export function CampaignSheet({
  campaign,
  open,
  onClose,
  onPause,
  onResume,
}: CampaignSheetProps) {
  const actionHistory = useStore((s) => s.actionHistory);
  const updateCampaignSchedule = useStore((s) => s.updateCampaignSchedule);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  if (!campaign) return null;

  const campaignEvents = actionHistory.filter(
    (e) => e.campaignId === campaign.id
  );

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        className="w-[680px] sm:max-w-[680px] gap-0"
        showCloseButton={false}
      >
        {/* Fixed Header */}
        <div className="p-6 border-b shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">
                {campaignTypeEmojis[campaign.type]}
              </span>
              <span className="text-lg font-semibold truncate max-w-[280px]">
                {campaign.name}
              </span>
              <span
                className={
                  statusBadgeClasses[campaign.status] ??
                  statusBadgeClasses[CampaignStatus.DRAFT]
                }
              >
                {campaign.status}
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close campaign detail panel"
              className="shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Flow Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
              Flow
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm">{flowTypeLabels[campaign.flow]}</span>
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          {campaign.schedule && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Schedule
                </h3>
                {!editingSchedule ? (
                  <button
                    onClick={() => {
                      setEditStartDate(campaign.schedule!.startDate.split("T")[0]);
                      setEditEndDate(campaign.schedule!.endDate.split("T")[0]);
                      setEditingSchedule(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      updateCampaignSchedule(campaign.id, {
                        startDate: new Date(editStartDate).toISOString(),
                        endDate: new Date(editEndDate).toISOString(),
                        timeWindows: campaign.schedule?.timeWindows,
                      });
                      setEditingSchedule(false);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    <CheckIcon className="h-3 w-3" />
                    Save
                  </button>
                )}
              </div>
              {editingSchedule ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start</label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End</label>
                    <input
                      type="date"
                      value={editEndDate}
                      min={editStartDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-gray-500">Date Range</span>
                    <span className="text-sm font-medium">
                      {new Date(campaign.schedule.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" - "}
                      {new Date(campaign.schedule.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-gray-500">Remaining</span>
                    <span className="text-sm font-medium">
                      {(() => {
                        const remaining = Math.max(
                          0,
                          Math.ceil(
                            (new Date(campaign.schedule.endDate).getTime() - Date.now()) /
                              (1000 * 60 * 60 * 24)
                          )
                        );
                        return `${remaining} day${remaining !== 1 ? "s" : ""}`;
                      })()}
                    </span>
                  </div>
                  {campaign.schedule.timeWindows && campaign.schedule.timeWindows.length > 0 && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-gray-500">Time Windows</span>
                      <span className="text-sm font-medium">
                        {campaign.schedule.timeWindows
                          .map((tw) => timeWindowDisplayLabels[tw] || tw)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Formats Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
              Formats
            </h3>
            <div className="space-y-3">
              {campaign.formats.map((f, i) => (
                <FormatPreview key={i} format={f} />
              ))}
            </div>
          </div>

          {/* Metrics Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Metrics
              </h3>
              <Link
                href="/reporting"
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
              >
                View Reporting
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>ASP</span>
                  <MetricInfo metricKey="asp" />
                </div>
                <p className="text-lg font-semibold">
                  ${campaign.metrics.asp.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>DCV</span>
                  <MetricInfo metricKey="dcv" />
                </div>
                <p className="text-lg font-semibold">
                  {campaign.metrics.dcv.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>CPD</span>
                  <MetricInfo metricKey="cpd" />
                </div>
                <p className="text-lg font-semibold">
                  ${campaign.metrics.cpd.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>RDR</span>
                  <MetricInfo metricKey="rdr" />
                </div>
                <p className="text-lg font-semibold">
                  {(campaign.metrics.rdr * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          {/* Budget Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
              Budget
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">
                ${campaign.budget.toLocaleString()}
              </p>
              {campaign.status === CampaignStatus.ACTIVE ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPause(campaign.id)}
                  aria-label={`Pause ${campaign.name}`}
                >
                  Pause
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onResume(campaign.id)}
                  aria-label={`Resume ${campaign.name}`}
                >
                  Resume
                </Button>
              )}
            </div>
          </div>

          {/* Activity Log */}
          {campaignEvents.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
                AI Activity Log
              </h3>
              <div className="space-y-3">
                <ActivityLog events={campaignEvents} />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
