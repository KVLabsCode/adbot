"use client";

import { CampaignType, RobotType, FlowType } from "@/types";
import {
  robotTypeLabels,
  robotTypeToSubtypes,
  campaignTypeLabels,
  campaignTypeEmojis,
  campaignTypeToFlows,
  subtypeEducation,
} from "@/lib/campaignMappings";
import { CampaignFlowPreview } from "@/components/campaign/CampaignFlowPreview";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface SubtypeEducationProps {
  robotType: RobotType;
  onSelect: (subtype: CampaignType) => void;
  onBack: () => void;
}

export function SubtypeEducation({
  robotType,
  onSelect,
  onBack,
}: SubtypeEducationProps) {
  const subtypes = robotTypeToSubtypes[robotType];

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to Robot Types"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Robot Types
        </button>

        <h2 className="text-lg font-semibold mb-1">
          Campaign Subtypes for {robotTypeLabels[robotType]}
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          These campaigns are derived from {robotTypeLabels[robotType].toLowerCase()} capabilities. Each targets a different influence layer.
        </p>

        <div className="space-y-4">
          {subtypes.map((subtype) => (
            <SubtypeCard
              key={subtype}
              subtype={subtype}
              onSelect={() => onSelect(subtype)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SubtypeCard({
  subtype,
  onSelect,
}: {
  subtype: CampaignType;
  onSelect: () => void;
}) {
  const edu = subtypeEducation[subtype];
  const flows = campaignTypeToFlows[subtype];
  const primaryFlow: FlowType = flows[0];

  return (
    <div className="rounded-xl border bg-card p-5 transition-all hover:border-primary/30">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl" role="img" aria-hidden="true">
          {campaignTypeEmojis[subtype]}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold">
            {campaignTypeLabels[subtype]}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {edu.whatItDoes}
          </p>
        </div>
      </div>

      {/* Visual simulation */}
      <div className="rounded-lg bg-muted/30 p-3 mb-4">
        <SubtypeSimulation subtype={subtype} />
      </div>

      {/* Influence stage diagram */}
      <div className="mb-4">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Influence Stage
        </p>
        <CampaignFlowPreview flow={primaryFlow} />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-[10px]">
        <div>
          <p className="font-semibold text-foreground mb-1">Where It Acts</p>
          <p className="text-muted-foreground">{edu.whereItActs}</p>
        </div>
        <div>
          <p className="font-semibold text-foreground mb-1">Metrics Impacted</p>
          {edu.metricsImpacted.map((m) => (
            <p key={m} className="text-muted-foreground">{m}</p>
          ))}
        </div>
      </div>

      {/* Best for tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {edu.bestFor.map((tag) => (
          <span
            key={tag}
            className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] text-primary font-medium"
          >
            {tag}
          </span>
        ))}
      </div>

      <Button className="w-full" onClick={onSelect}>
        Select Subtype
      </Button>
    </div>
  );
}

/* ── Subtype Visual Simulations ───────────────────────────── */

function SubtypeSimulation({ subtype }: { subtype: CampaignType }) {
  switch (subtype) {
    case CampaignType.DECISION_BID:
      return <DecisionBidSimulation />;
    case CampaignType.ROUTE_SPONSORSHIP:
      return <RouteSimulation />;
    case CampaignType.VOICE_DISPLAY:
      return <VoiceDisplaySimulation />;
    case CampaignType.COMPARISON_PLACEMENT:
      return <ComparisonSimulation />;
    case CampaignType.PREFERENCE_SLOT:
      return <PreferenceSimulation />;
    case CampaignType.RESTOCK_SPONSORSHIP:
      return <RestockSimulation />;
  }
}

function DecisionBidSimulation() {
  return (
    <div className="flex items-center justify-center gap-2 py-2" aria-label="Robot comparing and ranking products">
      {["A", "B", "C"].map((label, i) => (
        <div key={label} className="relative">
          <div
            className={`h-10 w-12 rounded border text-[10px] font-mono flex items-center justify-center ${
              i === 0
                ? "border-primary bg-primary/10 text-primary font-bold"
                : "border-muted text-muted-foreground"
            }`}
          >
            {label}
          </div>
          {i === 0 && (
            <div className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-primary text-[7px] text-primary-foreground flex items-center justify-center font-bold">
              1
            </div>
          )}
        </div>
      ))}
      <svg width="24" height="12" className="text-muted-foreground ml-1">
        <path d="M0 6h18M16 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm">
        🤖
      </div>
    </div>
  );
}

function RouteSimulation() {
  return (
    <div className="relative h-16 flex items-center justify-center py-2" aria-label="Map route with sponsored pin">
      <svg width="160" height="50" viewBox="0 0 160 50" className="text-muted-foreground">
        <path d="M10 40 Q40 10 80 25 Q120 40 150 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
        <circle cx="10" cy="40" r="3" fill="currentColor" opacity="0.3" />
        <circle cx="150" cy="10" r="3" fill="currentColor" opacity="0.3" />
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="rounded bg-primary px-2 py-0.5 text-[8px] font-bold text-primary-foreground">
          📍 Your Store
        </div>
      </div>
    </div>
  );
}

function VoiceDisplaySimulation() {
  return (
    <div className="flex items-center justify-center gap-4 py-2" aria-label="Voice prompt with display card">
      <div className="flex items-center gap-1">
        <span className="text-base">🔊</span>
        <div className="flex items-end gap-[2px]">
          {[3, 5, 7, 4, 6].map((h, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-primary/50"
              style={{ height: `${h * 2.5}px` }}
            />
          ))}
        </div>
      </div>
      <span className="text-muted-foreground text-[10px]">+</span>
      <div className="h-10 w-16 rounded border border-primary/30 bg-primary/5 flex items-center justify-center text-[9px]">
        📱 Card
      </div>
    </div>
  );
}

function ComparisonSimulation() {
  return (
    <div className="flex items-center justify-center gap-3 py-2" aria-label="Side-by-side comparison with your brand highlighted">
      <div className="h-12 w-16 rounded border-2 border-primary bg-primary/10 flex flex-col items-center justify-center">
        <span className="text-[9px] font-bold text-primary">You</span>
        <span className="text-[7px] text-primary/60">Featured</span>
      </div>
      <span className="text-muted-foreground text-xs">vs</span>
      <div className="h-12 w-16 rounded border border-muted flex flex-col items-center justify-center">
        <span className="text-[9px] text-muted-foreground">Other</span>
        <span className="text-[7px] text-muted-foreground/60">Standard</span>
      </div>
    </div>
  );
}

function PreferenceSimulation() {
  return (
    <div className="flex items-center justify-center py-2" aria-label="Product with recommended badge">
      <div className="relative h-12 w-20 rounded border border-muted flex items-center justify-center">
        <div className="text-[9px] text-muted-foreground">Product</div>
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[7px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
          ⭐ Recommended
        </div>
      </div>
    </div>
  );
}

function RestockSimulation() {
  return (
    <div className="flex items-center justify-center gap-2 py-2" aria-label="Low stock alert to branded suggestion">
      <div className="rounded border border-amber-400/50 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1.5 text-[9px] text-amber-700 dark:text-amber-400">
        ⚠ Low stock
      </div>
      <svg width="20" height="12" className="text-muted-foreground">
        <path d="M0 6h14M12 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <div className="rounded border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-[9px] font-medium">
        📦 Your Brand
      </div>
    </div>
  );
}
