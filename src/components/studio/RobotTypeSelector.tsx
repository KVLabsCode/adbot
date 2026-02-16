"use client";

import { RobotType } from "@/types";
import {
  robotTypeLabels,
  robotTypeDescriptions,
  robotTypeCapabilities,
  robotTypeAdvantages,
  robotTypeExamples,
} from "@/lib/campaignMappings";
import { ArrowLeft } from "lucide-react";

interface RobotTypeSelectorProps {
  onSelect: (type: RobotType) => void;
  onBack: () => void;
}

const robotTypes: RobotType[] = [
  RobotType.DELIVERY,
  RobotType.RETAIL,
  RobotType.HOME,
  RobotType.HOSPITALITY,
];

export function RobotTypeSelector({ onSelect, onBack }: RobotTypeSelectorProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to Studio"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Studio
        </button>

        <h2 className="text-lg font-semibold mb-1">Choose a Robot Type</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Each robot class unlocks different advertising surfaces and influence layers.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {robotTypes.map((rt) => (
            <button
              key={rt}
              onClick={() => onSelect(rt)}
              className="flex flex-col rounded-xl border bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-sm active:scale-[0.99]"
              aria-label={`Select ${robotTypeLabels[rt]}`}
            >
              {/* Visual */}
              <div className="rounded-lg bg-muted/50 p-4 mb-4 flex items-center justify-center">
                <RobotIllustration type={rt} />
              </div>

              {/* Header */}
              <h3 className="text-sm font-semibold mb-0.5">
                {robotTypeLabels[rt]}
              </h3>
              <p className="text-[10px] text-muted-foreground mb-0.5">
                e.g. {robotTypeExamples[rt]}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {robotTypeDescriptions[rt]}
              </p>

              {/* Capabilities */}
              <div className="mb-3">
                <p className="text-[10px] font-semibold text-foreground mb-1">
                  Ad Capabilities
                </p>
                <div className="flex flex-wrap gap-1">
                  {robotTypeCapabilities[rt].map((cap) => (
                    <span
                      key={cap}
                      className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[9px] text-primary font-medium"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Advantages */}
              <div>
                <p className="text-[10px] font-semibold text-foreground mb-1">
                  Advertiser Advantages
                </p>
                {robotTypeAdvantages[rt].map((adv) => (
                  <p key={adv} className="text-[10px] text-muted-foreground">
                    + {adv}
                  </p>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── SVG Robot Illustrations ────────────────────────────── */

function RobotIllustration({ type }: { type: RobotType }) {
  switch (type) {
    case RobotType.DELIVERY:
      return <DeliveryRobotSVG />;
    case RobotType.RETAIL:
      return <RetailRobotSVG />;
    case RobotType.HOME:
      return <HomeRobotSVG />;
    case RobotType.HOSPITALITY:
      return <HospitalityRobotSVG />;
  }
}

function DeliveryRobotSVG() {
  return (
    <svg width="120" height="72" viewBox="0 0 120 72" fill="none" aria-hidden="true">
      {/* Road */}
      <rect x="0" y="58" width="120" height="2" rx="1" className="fill-muted-foreground/20" />
      <rect x="15" y="58" width="8" height="2" rx="1" className="fill-muted-foreground/10" />
      <rect x="35" y="58" width="8" height="2" rx="1" className="fill-muted-foreground/10" />
      <rect x="55" y="58" width="8" height="2" rx="1" className="fill-muted-foreground/10" />
      <rect x="75" y="58" width="8" height="2" rx="1" className="fill-muted-foreground/10" />
      <rect x="95" y="58" width="8" height="2" rx="1" className="fill-muted-foreground/10" />
      {/* Body */}
      <rect x="30" y="28" width="50" height="30" rx="6" className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
      {/* Compartment lid */}
      <rect x="36" y="22" width="38" height="8" rx="3" className="fill-primary/10 stroke-primary/60" strokeWidth="1" />
      {/* Screen */}
      <rect x="40" y="34" width="30" height="14" rx="2" className="fill-card stroke-primary/40" strokeWidth="1" />
      <rect x="44" y="37" width="22" height="3" rx="1" className="fill-primary/30" />
      <rect x="44" y="42" width="14" height="2" rx="1" className="fill-muted-foreground/20" />
      {/* Wheels */}
      <circle cx="40" cy="58" r="5" className="fill-muted-foreground/30 stroke-muted-foreground/50" strokeWidth="1" />
      <circle cx="70" cy="58" r="5" className="fill-muted-foreground/30 stroke-muted-foreground/50" strokeWidth="1" />
      {/* Antenna */}
      <line x1="55" y1="22" x2="55" y2="14" className="stroke-primary/60" strokeWidth="1.5" />
      <circle cx="55" cy="12" r="2" className="fill-primary" />
      {/* Flag */}
      <rect x="80" y="18" width="1.5" height="24" rx="0.5" className="fill-muted-foreground/40" />
      <path d="M81.5 18 L92 22 L81.5 26Z" className="fill-primary/40" />
    </svg>
  );
}

function RetailRobotSVG() {
  return (
    <svg width="120" height="72" viewBox="0 0 120 72" fill="none" aria-hidden="true">
      {/* Floor */}
      <rect x="0" y="64" width="120" height="2" rx="1" className="fill-muted-foreground/20" />
      {/* Body */}
      <rect x="38" y="20" width="44" height="44" rx="8" className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
      {/* Large screen */}
      <rect x="44" y="26" width="32" height="22" rx="3" className="fill-card stroke-primary/40" strokeWidth="1" />
      {/* Screen content — comparison */}
      <rect x="47" y="30" width="12" height="14" rx="1.5" className="fill-primary/20 stroke-primary/40" strokeWidth="0.75" />
      <rect x="61" y="30" width="12" height="14" rx="1.5" className="fill-muted-foreground/10 stroke-muted-foreground/30" strokeWidth="0.75" />
      <text x="53" y="39" textAnchor="middle" className="fill-primary text-[6px] font-bold">A</text>
      <text x="67" y="39" textAnchor="middle" className="fill-muted-foreground text-[6px]">B</text>
      {/* Base/wheels */}
      <rect x="42" y="56" width="36" height="8" rx="4" className="fill-muted-foreground/20" />
      <circle cx="50" cy="64" r="3" className="fill-muted-foreground/30 stroke-muted-foreground/50" strokeWidth="1" />
      <circle cx="70" cy="64" r="3" className="fill-muted-foreground/30 stroke-muted-foreground/50" strokeWidth="1" />
      {/* Head sensor */}
      <ellipse cx="60" cy="16" rx="8" ry="4" className="fill-primary/10 stroke-primary/60" strokeWidth="1" />
      <circle cx="60" cy="16" r="2" className="fill-primary/40" />
      {/* Shelf indicator */}
      <rect x="10" y="30" width="20" height="3" rx="1" className="fill-muted-foreground/15" />
      <rect x="10" y="38" width="20" height="3" rx="1" className="fill-muted-foreground/15" />
      <rect x="10" y="46" width="20" height="3" rx="1" className="fill-muted-foreground/15" />
    </svg>
  );
}

function HomeRobotSVG() {
  return (
    <svg width="120" height="72" viewBox="0 0 120 72" fill="none" aria-hidden="true">
      {/* Floor */}
      <rect x="0" y="64" width="120" height="2" rx="1" className="fill-muted-foreground/20" />
      {/* Body — rounded friendly */}
      <ellipse cx="60" cy="44" rx="22" ry="20" className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
      {/* Face screen */}
      <ellipse cx="60" cy="38" rx="14" ry="10" className="fill-card stroke-primary/40" strokeWidth="1" />
      {/* Eyes */}
      <circle cx="54" cy="36" r="3" className="fill-primary/50" />
      <circle cx="66" cy="36" r="3" className="fill-primary/50" />
      <circle cx="55" cy="35" r="1" className="fill-card" />
      <circle cx="67" cy="35" r="1" className="fill-card" />
      {/* Mouth */}
      <path d="M55 42 Q60 46 65 42" className="stroke-primary/40" strokeWidth="1" fill="none" />
      {/* Periscope/camera */}
      <rect x="57" y="14" width="6" height="12" rx="3" className="fill-primary/20 stroke-primary/60" strokeWidth="1" />
      <circle cx="60" cy="16" r="2.5" className="fill-primary/40" />
      {/* Wheel base */}
      <ellipse cx="60" cy="62" rx="16" ry="4" className="fill-muted-foreground/20" />
      {/* Sound waves */}
      <path d="M85 36 Q90 36 90 30" className="stroke-primary/30" strokeWidth="1" fill="none" />
      <path d="M87 38 Q94 38 94 28" className="stroke-primary/20" strokeWidth="1" fill="none" />
    </svg>
  );
}

function HospitalityRobotSVG() {
  return (
    <svg width="120" height="72" viewBox="0 0 120 72" fill="none" aria-hidden="true">
      {/* Floor */}
      <rect x="0" y="64" width="120" height="2" rx="1" className="fill-muted-foreground/20" />
      {/* Body — tall and sleek */}
      <rect x="44" y="16" width="32" height="48" rx="6" className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
      {/* Screen */}
      <rect x="48" y="22" width="24" height="16" rx="2" className="fill-card stroke-primary/40" strokeWidth="1" />
      {/* Screen content — menu */}
      <rect x="51" y="25" width="18" height="2" rx="1" className="fill-primary/30" />
      <rect x="51" y="29" width="12" height="1.5" rx="0.75" className="fill-muted-foreground/20" />
      <rect x="51" y="33" width="14" height="1.5" rx="0.75" className="fill-muted-foreground/20" />
      {/* Tray shelf */}
      <rect x="38" y="42" width="44" height="4" rx="2" className="fill-primary/10 stroke-primary/40" strokeWidth="1" />
      {/* Items on tray */}
      <rect x="42" y="38" width="8" height="4" rx="1" className="fill-muted-foreground/20" />
      <rect x="54" y="38" width="8" height="4" rx="1" className="fill-muted-foreground/20" />
      <rect x="66" y="38" width="8" height="4" rx="1" className="fill-muted-foreground/20" />
      {/* Wheel base */}
      <ellipse cx="60" cy="62" rx="14" ry="4" className="fill-muted-foreground/20" />
      <circle cx="52" cy="64" r="3" className="fill-muted-foreground/30 stroke-muted-foreground/50" strokeWidth="1" />
      <circle cx="68" cy="64" r="3" className="fill-muted-foreground/30 stroke-muted-foreground/50" strokeWidth="1" />
      {/* Head light */}
      <circle cx="60" cy="12" r="3" className="fill-primary/30 stroke-primary/60" strokeWidth="1" />
      <circle cx="60" cy="12" r="1.5" className="fill-primary" />
    </svg>
  );
}
