"use client";

import {
  CampaignType,
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
import { Button } from "@/components/ui/button";
import { ArrowLeft, Rocket, Check } from "lucide-react";

interface CampaignReviewProps {
  robotType: RobotType;
  campaignType: CampaignType;
  flow: FlowType;
  formats: FormatContent[];
  budget: number;
  strategyConfig: Record<string, unknown>;
  onLaunch: () => void;
  onBack: () => void;
}

export function CampaignReview({
  robotType,
  campaignType,
  flow,
  formats,
  budget,
  strategyConfig,
  onLaunch,
  onBack,
}: CampaignReviewProps) {
  const strategyOptions = subtypeStrategyOptions[campaignType];

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Strategy
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

        {/* Launch CTA */}
        <Button className="w-full h-12 text-sm font-semibold" onClick={onLaunch}>
          <Rocket className="h-4 w-4 mr-2" />
          Launch Campaign
        </Button>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Your campaign will go live across 2,140 AdPods instantly.
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
