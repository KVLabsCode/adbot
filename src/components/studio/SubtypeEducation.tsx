"use client";

import { useState } from "react";
import { CampaignType, RobotType, FlowType } from "@/types";
import {
  robotTypeLabels,
  robotTypeToSubtypes,
  campaignTypeLabels,
  campaignTypeEmojis,
  campaignTypeToFlows,
  subtypeEducation,
  subtypeSummary,
} from "@/lib/campaignMappings";
import { CampaignFlowPreview } from "@/components/campaign/CampaignFlowPreview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";

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
  const [learnMoreSubtype, setLearnMoreSubtype] = useState<CampaignType | null>(null);

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
          Choose a Campaign Subtype
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          Campaign subtypes for {robotTypeLabels[robotType].toLowerCase()} — each targets a different influence layer.
        </p>

        {/* Grid of compact subtype cards */}
        <div className="grid gap-3 sm:grid-cols-2">
          {subtypes.map((subtype) => (
            <SubtypeGridCard
              key={subtype}
              subtype={subtype}
              onSelect={() => onSelect(subtype)}
              onLearnMore={() => setLearnMoreSubtype(subtype)}
            />
          ))}
        </div>
      </div>

      {/* Learn More Modal */}
      {learnMoreSubtype && (
        <LearnMoreModal
          subtype={learnMoreSubtype}
          onClose={() => setLearnMoreSubtype(null)}
          onSelect={() => {
            setLearnMoreSubtype(null);
            onSelect(learnMoreSubtype);
          }}
        />
      )}
    </div>
  );
}

/* ── Compact Grid Card ──────────────────────────────────── */

function SubtypeGridCard({
  subtype,
  onSelect,
  onLearnMore,
}: {
  subtype: CampaignType;
  onSelect: () => void;
  onLearnMore: () => void;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 transition-all hover:border-primary/30">
      {/* Header */}
      <div className="flex items-start gap-2.5 mb-3">
        <span className="text-xl" role="img" aria-hidden="true">
          {campaignTypeEmojis[subtype]}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold">{campaignTypeLabels[subtype]}</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {subtypeSummary[subtype]}
          </p>
        </div>
      </div>

      {/* Mini visual */}
      <div className="rounded-lg bg-muted/30 p-2.5 mb-3 flex items-center justify-center">
        <SubtypeMiniVisual subtype={subtype} />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-[10px] h-7"
          onClick={onLearnMore}
        >
          Learn More
        </Button>
        <Button
          size="sm"
          className="flex-1 text-[10px] h-7"
          onClick={onSelect}
        >
          Select
        </Button>
      </div>
    </div>
  );
}

/* ── Learn More Modal ───────────────────────────────────── */

function LearnMoreModal({
  subtype,
  onClose,
  onSelect,
}: {
  subtype: CampaignType;
  onClose: () => void;
  onSelect: () => void;
}) {
  const edu = subtypeEducation[subtype];
  const flows = campaignTypeToFlows[subtype];
  const primaryFlow: FlowType = flows[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg mx-4 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <span className="text-2xl" role="img" aria-hidden="true">
            {campaignTypeEmojis[subtype]}
          </span>
          <h3 className="text-base font-semibold">{campaignTypeLabels[subtype]}</h3>
        </div>

        {/* Section 1 — What It Does */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            What It Does
          </h4>
          <p className="text-sm text-foreground">{edu.whatItDoes}</p>
        </div>

        {/* Section 2 — Where It Acts */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Where It Acts — {edu.whereItActs}
          </h4>
          <CampaignFlowPreview flow={primaryFlow} />
        </div>

        {/* Section 3 — Metrics Impacted */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Metrics Impacted
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {edu.metricsImpacted.map((m) => (
              <span
                key={m}
                className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] text-primary font-medium"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Section 4 — Strategic Fit */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Best For
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {edu.bestFor.map((tag) => (
              <span
                key={tag}
                className="inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button className="flex-1" onClick={onSelect}>
            Select Subtype
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Mini Visuals for Grid Cards ────────────────────────── */

function SubtypeMiniVisual({ subtype }: { subtype: CampaignType }) {
  switch (subtype) {
    case CampaignType.DECISION_BID:
      return <DecisionMini />;
    case CampaignType.ROUTE_SPONSORSHIP:
      return <RouteMini />;
    case CampaignType.VOICE_DISPLAY:
      return <VoiceDisplayMini />;
    case CampaignType.COMPARISON_PLACEMENT:
      return <ComparisonMini />;
    case CampaignType.PREFERENCE_SLOT:
      return <PreferenceMini />;
    case CampaignType.RESTOCK_SPONSORSHIP:
      return <RestockMini />;
  }
}

function DecisionMini() {
  return (
    <div className="flex items-center gap-1.5" aria-label="Ranking shift">
      {["A", "B", "C"].map((l, i) => (
        <div
          key={l}
          className={`h-7 w-8 rounded border text-[8px] font-mono flex items-center justify-center ${
            i === 0 ? "border-primary bg-primary/10 text-primary font-bold" : "border-muted text-muted-foreground"
          }`}
        >
          {l}
        </div>
      ))}
      <svg width="16" height="10" className="text-muted-foreground">
        <path d="M0 5h10M8 2l4 3-4 3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <span className="text-sm">🤖</span>
    </div>
  );
}

function RouteMini() {
  return (
    <div className="relative h-10 flex items-center justify-center" aria-label="Map route">
      <svg width="100" height="32" viewBox="0 0 100 32" className="text-muted-foreground">
        <path d="M5 28 Q25 5 50 16 Q75 27 95 4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.4" />
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-primary px-1.5 py-0.5 text-[7px] font-bold text-primary-foreground">
        📍 You
      </div>
    </div>
  );
}

function VoiceDisplayMini() {
  return (
    <div className="flex items-center gap-2" aria-label="Voice and display">
      <span className="text-sm">🔊</span>
      <div className="flex items-end gap-[2px]">
        {[3, 5, 7, 4, 6].map((h, i) => (
          <div key={i} className="w-[2px] rounded-full bg-primary/50" style={{ height: `${h * 1.5}px` }} />
        ))}
      </div>
      <span className="text-[9px] text-muted-foreground">+</span>
      <div className="h-7 w-10 rounded border border-primary/30 bg-primary/5 flex items-center justify-center text-[7px]">
        📱
      </div>
    </div>
  );
}

function ComparisonMini() {
  return (
    <div className="flex items-center gap-2" aria-label="Comparison">
      <div className="h-8 w-10 rounded border-2 border-primary bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
        You
      </div>
      <span className="text-[9px] text-muted-foreground">vs</span>
      <div className="h-8 w-10 rounded border border-muted flex items-center justify-center text-[8px] text-muted-foreground">
        B
      </div>
    </div>
  );
}

function PreferenceMini() {
  return (
    <div className="flex items-center justify-center" aria-label="Recommended badge">
      <div className="relative h-8 w-14 rounded border border-muted flex items-center justify-center">
        <span className="text-[7px] text-muted-foreground">Product</span>
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[6px] font-bold px-1.5 rounded-full whitespace-nowrap">
          ⭐ Rec
        </div>
      </div>
    </div>
  );
}

function RestockMini() {
  return (
    <div className="flex items-center gap-1.5" aria-label="Restock alert">
      <div className="rounded border border-amber-400/50 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-1 text-[7px] text-amber-700 dark:text-amber-400">
        ⚠ Low
      </div>
      <svg width="12" height="8" className="text-muted-foreground">
        <path d="M0 4h8M6 1l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <div className="rounded border border-primary/30 bg-primary/5 px-1.5 py-1 text-[7px] font-medium">
        📦 You
      </div>
    </div>
  );
}
