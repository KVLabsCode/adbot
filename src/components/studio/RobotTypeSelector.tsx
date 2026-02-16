"use client";

import { RobotType } from "@/types";
import {
  robotTypeLabels,
  robotTypeDescriptions,
  robotTypeCapabilities,
  robotTypeAdvantages,
  robotTypeExamples,
  robotTypeIsPremium,
  robotTypePremiumFeatures,
} from "@/lib/campaignMappings";
import { ArrowLeft, Star } from "lucide-react";

interface RobotTypeSelectorProps {
  onSelect: (type: RobotType) => void;
  onBack: () => void;
}

const premiumTypes: RobotType[] = [
  RobotType.HUMANOID,
  RobotType.EVENT,
  RobotType.AUTONOMOUS_VEHICLE,
];

const standardTypes: RobotType[] = [
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
        <p className="text-sm text-muted-foreground mb-6">
          Each robot class unlocks different advertising surfaces and influence layers.
        </p>

        {/* Premium Surfaces Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Premium Surfaces</h3>
            <span className="text-[9px] font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
              Flagship Placement
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {premiumTypes.map((rt) => (
              <RobotCard
                key={rt}
                type={rt}
                onSelect={onSelect}
                premium
              />
            ))}
          </div>
        </div>

        {/* Standard Robots Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Standard Robots</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {standardTypes.map((rt) => (
              <RobotCard
                key={rt}
                type={rt}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RobotCard({
  type,
  onSelect,
  premium,
}: {
  type: RobotType;
  onSelect: (type: RobotType) => void;
  premium?: boolean;
}) {
  const premiumFeatures = robotTypePremiumFeatures[type];

  return (
    <button
      onClick={() => onSelect(type)}
      className={`flex flex-col rounded-xl border bg-card p-5 text-left transition-all hover:shadow-md active:scale-[0.99] ${
        premium
          ? "border-transparent bg-gradient-to-br from-amber-50/50 via-card to-purple-50/50 dark:from-amber-950/20 dark:via-card dark:to-purple-950/20 shadow-sm ring-1 ring-amber-200/50 dark:ring-amber-800/30 hover:ring-amber-300/70 dark:hover:ring-amber-700/50"
          : "hover:border-primary/40 hover:shadow-sm"
      }`}
      aria-label={`Select ${robotTypeLabels[type]}`}
    >
      {/* Premium badge */}
      {premium && (
        <span className="self-start mb-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 px-2 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider">
          <Star className="h-2.5 w-2.5" />
          Flagship
        </span>
      )}

      {/* Visual */}
      <div className={`rounded-lg p-4 mb-4 flex items-center justify-center ${
        premium ? "bg-gradient-to-br from-amber-50/80 to-purple-50/80 dark:from-amber-950/30 dark:to-purple-950/30" : "bg-muted/50"
      }`}>
        <RobotIllustration type={type} />
      </div>

      {/* Header */}
      <h3 className="text-sm font-semibold mb-0.5">
        {robotTypeLabels[type]}
      </h3>
      <p className="text-[10px] text-muted-foreground mb-0.5">
        e.g. {robotTypeExamples[type]}
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        {robotTypeDescriptions[type]}
      </p>

      {/* Capabilities */}
      <div className="mb-3">
        <p className="text-[10px] font-semibold text-foreground mb-1">
          {premium ? "Premium Capabilities" : "Ad Capabilities"}
        </p>
        <div className="flex flex-wrap gap-1">
          {robotTypeCapabilities[type].map((cap) => (
            <span
              key={cap}
              className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-medium ${
                premium
                  ? "bg-amber-100/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Premium features */}
      {premium && premiumFeatures && (
        <div className="mb-3">
          <p className="text-[10px] font-semibold text-foreground mb-1">
            Brand Features
          </p>
          {premiumFeatures.map((feat) => (
            <p key={feat} className="text-[10px] text-amber-600 dark:text-amber-400">
              ★ {feat}
            </p>
          ))}
        </div>
      )}

      {/* Advantages */}
      <div>
        <p className="text-[10px] font-semibold text-foreground mb-1">
          Advertiser Advantages
        </p>
        {robotTypeAdvantages[type].map((adv) => (
          <p key={adv} className="text-[10px] text-muted-foreground">
            + {adv}
          </p>
        ))}
      </div>
    </button>
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
    case RobotType.HUMANOID:
      return <HumanoidRobotSVG />;
    case RobotType.EVENT:
      return <EventRobotSVG />;
    case RobotType.AUTONOMOUS_VEHICLE:
      return <AutonomousVehicleSVG />;
  }
}

function DeliveryRobotSVG() {
  return (
    <svg width="120" height="72" viewBox="0 0 120 72" fill="none" aria-hidden="true">
      <rect x="0" y="58" width="120" height="2" rx="1" className="fill-muted-foreground/20" />
      <rect x="15" y="58" width="8" height="2" rx="1" className="fill-muted-foreground/10" />
      <rect x="35" y="58" width="8" height="2" rx="1" className="fill-muted-foreground/10" />
      <rect x="55" y="58" width="8" height="2" rx="1" className="fill-muted-foreground/10" />
      <rect x="75" y="58" width="8" height="2" rx="1" className="fill-muted-foreground/10" />
      <rect x="95" y="58" width="8" height="2" rx="1" className="fill-muted-foreground/10" />
      <rect x="30" y="28" width="50" height="30" rx="6" className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
      <rect x="36" y="22" width="38" height="8" rx="3" className="fill-primary/10 stroke-primary/60" strokeWidth="1" />
      <rect x="40" y="34" width="30" height="14" rx="2" className="fill-card stroke-primary/40" strokeWidth="1" />
      <rect x="44" y="37" width="22" height="3" rx="1" className="fill-primary/30" />
      <rect x="44" y="42" width="14" height="2" rx="1" className="fill-muted-foreground/20" />
      <circle cx="40" cy="58" r="5" className="fill-muted-foreground/30 stroke-muted-foreground/50" strokeWidth="1" />
      <circle cx="70" cy="58" r="5" className="fill-muted-foreground/30 stroke-muted-foreground/50" strokeWidth="1" />
      <line x1="55" y1="22" x2="55" y2="14" className="stroke-primary/60" strokeWidth="1.5" />
      <circle cx="55" cy="12" r="2" className="fill-primary" />
      <rect x="80" y="18" width="1.5" height="24" rx="0.5" className="fill-muted-foreground/40" />
      <path d="M81.5 18 L92 22 L81.5 26Z" className="fill-primary/40" />
    </svg>
  );
}

function RetailRobotSVG() {
  return (
    <svg width="120" height="72" viewBox="0 0 120 72" fill="none" aria-hidden="true">
      <rect x="0" y="64" width="120" height="2" rx="1" className="fill-muted-foreground/20" />
      <rect x="38" y="20" width="44" height="44" rx="8" className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
      <rect x="44" y="26" width="32" height="22" rx="3" className="fill-card stroke-primary/40" strokeWidth="1" />
      <rect x="47" y="30" width="12" height="14" rx="1.5" className="fill-primary/20 stroke-primary/40" strokeWidth="0.75" />
      <rect x="61" y="30" width="12" height="14" rx="1.5" className="fill-muted-foreground/10 stroke-muted-foreground/30" strokeWidth="0.75" />
      <text x="53" y="39" textAnchor="middle" className="fill-primary text-[6px] font-bold">A</text>
      <text x="67" y="39" textAnchor="middle" className="fill-muted-foreground text-[6px]">B</text>
      <rect x="42" y="56" width="36" height="8" rx="4" className="fill-muted-foreground/20" />
      <circle cx="50" cy="64" r="3" className="fill-muted-foreground/30 stroke-muted-foreground/50" strokeWidth="1" />
      <circle cx="70" cy="64" r="3" className="fill-muted-foreground/30 stroke-muted-foreground/50" strokeWidth="1" />
      <ellipse cx="60" cy="16" rx="8" ry="4" className="fill-primary/10 stroke-primary/60" strokeWidth="1" />
      <circle cx="60" cy="16" r="2" className="fill-primary/40" />
      <rect x="10" y="30" width="20" height="3" rx="1" className="fill-muted-foreground/15" />
      <rect x="10" y="38" width="20" height="3" rx="1" className="fill-muted-foreground/15" />
      <rect x="10" y="46" width="20" height="3" rx="1" className="fill-muted-foreground/15" />
    </svg>
  );
}

function HomeRobotSVG() {
  return (
    <svg width="120" height="72" viewBox="0 0 120 72" fill="none" aria-hidden="true">
      <rect x="0" y="64" width="120" height="2" rx="1" className="fill-muted-foreground/20" />
      <ellipse cx="60" cy="44" rx="22" ry="20" className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
      <ellipse cx="60" cy="38" rx="14" ry="10" className="fill-card stroke-primary/40" strokeWidth="1" />
      <circle cx="54" cy="36" r="3" className="fill-primary/50" />
      <circle cx="66" cy="36" r="3" className="fill-primary/50" />
      <circle cx="55" cy="35" r="1" className="fill-card" />
      <circle cx="67" cy="35" r="1" className="fill-card" />
      <path d="M55 42 Q60 46 65 42" className="stroke-primary/40" strokeWidth="1" fill="none" />
      <rect x="57" y="14" width="6" height="12" rx="3" className="fill-primary/20 stroke-primary/60" strokeWidth="1" />
      <circle cx="60" cy="16" r="2.5" className="fill-primary/40" />
      <ellipse cx="60" cy="62" rx="16" ry="4" className="fill-muted-foreground/20" />
      <path d="M85 36 Q90 36 90 30" className="stroke-primary/30" strokeWidth="1" fill="none" />
      <path d="M87 38 Q94 38 94 28" className="stroke-primary/20" strokeWidth="1" fill="none" />
    </svg>
  );
}

function HospitalityRobotSVG() {
  return (
    <svg width="120" height="72" viewBox="0 0 120 72" fill="none" aria-hidden="true">
      <rect x="0" y="64" width="120" height="2" rx="1" className="fill-muted-foreground/20" />
      <rect x="44" y="16" width="32" height="48" rx="6" className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
      <rect x="48" y="22" width="24" height="16" rx="2" className="fill-card stroke-primary/40" strokeWidth="1" />
      <rect x="51" y="25" width="18" height="2" rx="1" className="fill-primary/30" />
      <rect x="51" y="29" width="12" height="1.5" rx="0.75" className="fill-muted-foreground/20" />
      <rect x="51" y="33" width="14" height="1.5" rx="0.75" className="fill-muted-foreground/20" />
      <rect x="38" y="42" width="44" height="4" rx="2" className="fill-primary/10 stroke-primary/40" strokeWidth="1" />
      <rect x="42" y="38" width="8" height="4" rx="1" className="fill-muted-foreground/20" />
      <rect x="54" y="38" width="8" height="4" rx="1" className="fill-muted-foreground/20" />
      <rect x="66" y="38" width="8" height="4" rx="1" className="fill-muted-foreground/20" />
      <ellipse cx="60" cy="62" rx="14" ry="4" className="fill-muted-foreground/20" />
      <circle cx="52" cy="64" r="3" className="fill-muted-foreground/30 stroke-muted-foreground/50" strokeWidth="1" />
      <circle cx="68" cy="64" r="3" className="fill-muted-foreground/30 stroke-muted-foreground/50" strokeWidth="1" />
      <circle cx="60" cy="12" r="3" className="fill-primary/30 stroke-primary/60" strokeWidth="1" />
      <circle cx="60" cy="12" r="1.5" className="fill-primary" />
    </svg>
  );
}

function HumanoidRobotSVG() {
  return (
    <svg width="120" height="72" viewBox="0 0 120 72" fill="none" aria-hidden="true">
      {/* Floor */}
      <rect x="0" y="68" width="120" height="2" rx="1" className="fill-muted-foreground/20" />
      {/* Head */}
      <ellipse cx="60" cy="14" rx="10" ry="11" className="fill-amber-100/60 dark:fill-amber-950/40 stroke-amber-500/60" strokeWidth="1.5" />
      {/* Eyes */}
      <circle cx="56" cy="12" r="2" className="fill-amber-500/70" />
      <circle cx="64" cy="12" r="2" className="fill-amber-500/70" />
      <circle cx="56.5" cy="11.5" r="0.7" className="fill-white/80" />
      <circle cx="64.5" cy="11.5" r="0.7" className="fill-white/80" />
      {/* Mouth line */}
      <path d="M56 18 Q60 20 64 18" className="stroke-amber-500/40" strokeWidth="0.8" fill="none" />
      {/* Neck */}
      <rect x="57" y="24" width="6" height="4" rx="1" className="fill-amber-200/40 dark:fill-amber-900/30" />
      {/* Torso */}
      <rect x="45" y="28" width="30" height="24" rx="4" className="fill-amber-100/60 dark:fill-amber-950/40 stroke-amber-500/60" strokeWidth="1.5" />
      {/* Chest plate */}
      <rect x="50" y="32" width="20" height="12" rx="2" className="fill-card stroke-amber-400/40" strokeWidth="0.8" />
      <rect x="53" y="35" width="14" height="2" rx="1" className="fill-amber-400/30" />
      <rect x="53" y="39" width="10" height="1.5" rx="0.75" className="fill-muted-foreground/20" />
      {/* Arms */}
      <rect x="35" y="30" width="8" height="20" rx="4" className="fill-amber-100/40 dark:fill-amber-950/30 stroke-amber-500/40" strokeWidth="1" />
      <rect x="77" y="30" width="8" height="20" rx="4" className="fill-amber-100/40 dark:fill-amber-950/30 stroke-amber-500/40" strokeWidth="1" />
      {/* Hands */}
      <circle cx="39" cy="52" r="3" className="fill-amber-200/50 dark:fill-amber-900/40 stroke-amber-500/30" strokeWidth="0.8" />
      <circle cx="81" cy="52" r="3" className="fill-amber-200/50 dark:fill-amber-900/40 stroke-amber-500/30" strokeWidth="0.8" />
      {/* Legs */}
      <rect x="48" y="52" width="10" height="16" rx="3" className="fill-amber-100/40 dark:fill-amber-950/30 stroke-amber-500/40" strokeWidth="1" />
      <rect x="62" y="52" width="10" height="16" rx="3" className="fill-amber-100/40 dark:fill-amber-950/30 stroke-amber-500/40" strokeWidth="1" />
    </svg>
  );
}

function EventRobotSVG() {
  return (
    <svg width="120" height="72" viewBox="0 0 120 72" fill="none" aria-hidden="true">
      {/* Floor */}
      <rect x="0" y="66" width="120" height="2" rx="1" className="fill-muted-foreground/20" />
      {/* Base platform */}
      <ellipse cx="60" cy="64" rx="20" ry="4" className="fill-purple-200/30 dark:fill-purple-900/20" />
      {/* Body — wide display kiosk */}
      <rect x="40" y="18" width="40" height="46" rx="6" className="fill-purple-100/50 dark:fill-purple-950/30 stroke-purple-500/60" strokeWidth="1.5" />
      {/* Large display */}
      <rect x="44" y="22" width="32" height="24" rx="3" className="fill-card stroke-purple-400/40" strokeWidth="1" />
      {/* Screen content — brand display */}
      <rect x="48" y="26" width="24" height="4" rx="1" className="fill-purple-400/30" />
      <rect x="48" y="33" width="16" height="2" rx="1" className="fill-muted-foreground/20" />
      <rect x="48" y="38" width="20" height="2" rx="1" className="fill-muted-foreground/15" />
      {/* Speaker grills */}
      <rect x="44" y="50" width="32" height="6" rx="2" className="fill-purple-200/30 dark:fill-purple-900/20" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={46 + i * 4} y="51" width="2" height="4" rx="0.5" className="fill-purple-400/20" />
      ))}
      {/* Camera/sensor top */}
      <circle cx="60" cy="14" r="4" className="fill-purple-200/40 dark:fill-purple-900/30 stroke-purple-500/50" strokeWidth="1" />
      <circle cx="60" cy="14" r="2" className="fill-purple-500/50" />
      {/* Sound waves */}
      <path d="M26 34 Q22 34 22 28" className="stroke-purple-400/40" strokeWidth="1" fill="none" />
      <path d="M24 36 Q18 36 18 26" className="stroke-purple-400/25" strokeWidth="1" fill="none" />
      <path d="M94 34 Q98 34 98 28" className="stroke-purple-400/40" strokeWidth="1" fill="none" />
      <path d="M96 36 Q102 36 102 26" className="stroke-purple-400/25" strokeWidth="1" fill="none" />
      {/* Wheels */}
      <circle cx="50" cy="66" r="3" className="fill-muted-foreground/30 stroke-muted-foreground/50" strokeWidth="0.8" />
      <circle cx="70" cy="66" r="3" className="fill-muted-foreground/30 stroke-muted-foreground/50" strokeWidth="0.8" />
    </svg>
  );
}

function AutonomousVehicleSVG() {
  return (
    <svg width="120" height="72" viewBox="0 0 120 72" fill="none" aria-hidden="true">
      {/* Road */}
      <rect x="0" y="58" width="120" height="2" rx="1" className="fill-muted-foreground/20" />
      <rect x="10" y="58" width="12" height="2" rx="1" className="fill-muted-foreground/10" />
      <rect x="35" y="58" width="12" height="2" rx="1" className="fill-muted-foreground/10" />
      <rect x="60" y="58" width="12" height="2" rx="1" className="fill-muted-foreground/10" />
      <rect x="85" y="58" width="12" height="2" rx="1" className="fill-muted-foreground/10" />
      {/* Vehicle body */}
      <path d="M20 42 Q20 28 35 26 L85 26 Q100 28 100 42 L100 50 Q100 54 96 54 L24 54 Q20 54 20 50 Z"
        className="fill-blue-100/50 dark:fill-blue-950/30 stroke-blue-500/60" strokeWidth="1.5" />
      {/* Windshield */}
      <path d="M32 28 L42 20 L78 20 L88 28 Z" className="fill-card stroke-blue-400/40" strokeWidth="1" />
      {/* Roof sensor */}
      <rect x="52" y="16" width="16" height="4" rx="2" className="fill-blue-200/50 dark:fill-blue-900/30 stroke-blue-500/40" strokeWidth="0.8" />
      <circle cx="56" cy="18" r="1" className="fill-blue-500/50" />
      <circle cx="60" cy="18" r="1" className="fill-blue-500/50" />
      <circle cx="64" cy="18" r="1" className="fill-blue-500/50" />
      {/* Side display */}
      <rect x="38" y="34" width="44" height="14" rx="2" className="fill-card stroke-blue-400/30" strokeWidth="0.8" />
      <rect x="42" y="37" width="28" height="3" rx="1" className="fill-blue-400/30" />
      <rect x="42" y="42" width="18" height="2" rx="1" className="fill-muted-foreground/20" />
      {/* Headlights */}
      <rect x="22" y="42" width="6" height="4" rx="1.5" className="fill-amber-300/50" />
      <rect x="92" y="42" width="6" height="4" rx="1.5" className="fill-amber-300/50" />
      {/* Wheels */}
      <circle cx="34" cy="56" r="6" className="fill-muted-foreground/30 stroke-muted-foreground/50" strokeWidth="1" />
      <circle cx="34" cy="56" r="2.5" className="fill-muted-foreground/15" />
      <circle cx="86" cy="56" r="6" className="fill-muted-foreground/30 stroke-muted-foreground/50" strokeWidth="1" />
      <circle cx="86" cy="56" r="2.5" className="fill-muted-foreground/15" />
    </svg>
  );
}
