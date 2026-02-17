"use client";

import {
  CampaignType,
  CampaignSchedule,
  FlowType,
  FormatContent,
  RobotType,
} from "@/types";
import {
  campaignTypeLabels,
  campaignTypeEmojis,
  flowTypeLabels,
  formatTypeLabels,
  robotTypeLabels,
  robotTypeEmojis,
  subtypeStrategyOptions,
} from "@/lib/campaignMappings";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Rocket, Check, AlertTriangle } from "lucide-react";

const timeWindowDisplayLabels: Record<string, string> = {
  all_day: "All Day",
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  night: "Night",
  lunch_rush: "Lunch Rush",
  dinner_rush: "Dinner Rush",
};

interface CampaignReviewProps {
  robotType: RobotType;
  campaignType: CampaignType;
  flow: FlowType;
  formats: FormatContent[];
  budget: number;
  schedule: CampaignSchedule;
  strategyConfig: Record<string, unknown>;
  creativeIds: string[];
  isDemoMode: boolean;
  onLaunch: () => void;
  onBack: () => void;
}

export function CampaignReview({
  robotType,
  campaignType,
  flow,
  formats,
  budget,
  schedule,
  strategyConfig,
  creativeIds,
  isDemoMode,
  onLaunch,
  onBack,
}: CampaignReviewProps) {
  const strategyOptions = subtypeStrategyOptions[campaignType];
  const creatives = useStore((s) => s.creatives);

  const selectedCreativeNames = creativeIds
    .map((id) => creatives.find((c) => c.id === id)?.name)
    .filter(Boolean);

  const canLaunch = isDemoMode || creativeIds.length > 0;

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <h2 className="text-lg font-semibold mb-1">Review Campaign</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Confirm your campaign settings before going live.
        </p>

        {/* Campaign Summary */}
        <div className="rounded-xl border bg-card p-4 mb-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Campaign Summary
          </h3>
          <div className="space-y-2.5">
            <SummaryRow
              label="Robot Type"
              value={`${robotTypeEmojis[robotType]} ${robotTypeLabels[robotType]}`}
            />
            <SummaryRow
              label="Campaign Subtype"
              value={`${campaignTypeEmojis[campaignType]} ${campaignTypeLabels[campaignType]}`}
            />
            <SummaryRow
              label="Influence Stage"
              value={flowTypeLabels[flow]}
            />
            <SummaryRow
              label="Ad Formats"
              value={formats.map((f) => formatTypeLabels[f.type]).join(", ")}
            />
            {selectedCreativeNames.length > 0 && (
              <SummaryRow
                label="Creatives"
                value={selectedCreativeNames.join(", ")}
              />
            )}
            {/* Strategy config values */}
            {strategyOptions.map((opt) => {
              const selectedValue = strategyConfig[opt.id] as string | undefined;
              const selectedOption = opt.options.find((o) => o.value === selectedValue);
              if (!selectedOption) return null;
              return (
                <SummaryRow
                  key={opt.id}
                  label={opt.label}
                  value={selectedOption.label}
                />
              );
            })}
            <SummaryRow
              label="Schedule"
              value={`${new Date(schedule.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(schedule.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
            />
            <SummaryRow
              label="Duration"
              value={`${Math.round((new Date(schedule.endDate).getTime() - new Date(schedule.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`}
            />
            {schedule.timeWindows && schedule.timeWindows.length > 0 && (
              <SummaryRow
                label="Time Windows"
                value={schedule.timeWindows.map((tw) => timeWindowDisplayLabels[tw] || tw).join(", ")}
              />
            )}
            <SummaryRow
              label="Daily Budget"
              value={`$${budget.toLocaleString()}`}
            />
          </div>
        </div>

        {/* Control Reinforcement */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl border bg-card p-4">
            <h3 className="text-xs font-semibold mb-2.5">You Control</h3>
            <div className="space-y-1.5">
              {["Surfaces", "Timing", "Creative", "Budget"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <h3 className="text-xs font-semibold mb-2.5">Kovio Handles</h3>
            <div className="space-y-1.5">
              {[
                "AI optimization",
                "Guardrails",
                "Holdout",
                "Compliance",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live mode warning */}
        {!isDemoMode && creativeIds.length === 0 && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-600">
                Live campaigns require at least one uploaded creative.
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Go back and select a validated creative to continue.
              </p>
            </div>
          </div>
        )}

        {/* Launch CTA */}
        <Button
          className="w-full h-12 text-sm font-semibold"
          onClick={onLaunch}
          disabled={!canLaunch}
        >
          <Rocket className="h-4 w-4 mr-2" />
          Launch Campaign
        </Button>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          {isDemoMode
            ? "Your campaign will go live across 2,140 AdPods instantly."
            : "Your campaign will be persisted to the database and available via the edge API."}
        </p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
