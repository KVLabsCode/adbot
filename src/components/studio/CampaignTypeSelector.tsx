"use client";

import { CampaignType } from "@/types";
import {
  campaignTypeLabels,
  campaignTypeEmojis,
} from "@/lib/campaignMappings";
import { ArrowLeft } from "lucide-react";

interface CampaignTypeSelectorProps {
  onSelect: (type: CampaignType) => void;
  onBack: () => void;
}

const campaignCards: {
  type: CampaignType;
  shortDescription: string;
  youControl: string[];
  kovioHandles: string[];
  visual: React.ReactNode;
}[] = [
  {
    type: CampaignType.DECISION_BID,
    shortDescription: "Compete in real-time when robots choose products.",
    youControl: ["Influence stage", "Bid strategy", "Creative format"],
    kovioHandles: ["Ranking optimization", "Guardrails", "Budget pacing"],
    visual: <DecisionBidVisual />,
  },
  {
    type: CampaignType.PREFERENCE_SLOT,
    shortDescription: "Pin your brand as the recommended choice before decisions.",
    youControl: ["Preference position", "Badge content", "Budget"],
    kovioHandles: ["Recommendation logic", "Holdout discipline", "Pacing"],
    visual: <PreferenceSlotVisual />,
  },
  {
    type: CampaignType.RESTOCK_SPONSORSHIP,
    shortDescription: "Appear when robots detect low inventory and restock.",
    youControl: ["Alert creative", "Trigger conditions", "Budget"],
    kovioHandles: ["Inventory detection", "Timing optimization", "Guardrails"],
    visual: <RestockVisual />,
  },
  {
    type: CampaignType.COMPARISON_PLACEMENT,
    shortDescription: "Stand out when robots compare options side-by-side.",
    youControl: ["Comparison position", "Highlight content", "Budget"],
    kovioHandles: ["Comparison rendering", "Fairness guardrails", "Pacing"],
    visual: <ComparisonVisual />,
  },
  {
    type: CampaignType.ROUTE_SPONSORSHIP,
    shortDescription: "Place your location on robot delivery routes.",
    youControl: ["Pin placement", "Route targeting", "Budget"],
    kovioHandles: ["Route optimization", "Navigation safety", "Pacing"],
    visual: <RouteVisual />,
  },
  {
    type: CampaignType.VOICE_DISPLAY,
    shortDescription: "Reach robots with voice + screen together.",
    youControl: ["Voice script", "Display card", "Budget"],
    kovioHandles: ["Multi-modal delivery", "Guardrails", "Pacing"],
    visual: <VoiceDisplayVisual />,
  },
];

export function CampaignTypeSelector({ onSelect, onBack }: CampaignTypeSelectorProps) {
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

        <h2 className="text-lg font-semibold mb-1">Choose a Campaign Type</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Each type targets a different stage of how robots make decisions.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {campaignCards.map((card) => (
            <button
              key={card.type}
              onClick={() => onSelect(card.type)}
              className="flex flex-col rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-sm active:scale-[0.99]"
              aria-label={`Select ${campaignTypeLabels[card.type]}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl" role="img" aria-hidden="true">
                  {campaignTypeEmojis[card.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold">
                    {campaignTypeLabels[card.type]}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {card.shortDescription}
                  </p>
                </div>
              </div>

              {/* Mini visual */}
              <div className="rounded-lg bg-muted/50 p-3 mb-3">
                {card.visual}
              </div>

              {/* Control split */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <p className="font-semibold text-foreground mb-1">You control</p>
                  {card.youControl.map((item) => (
                    <p key={item} className="text-muted-foreground">
                      ✓ {item}
                    </p>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Kovio handles</p>
                  {card.kovioHandles.map((item) => (
                    <p key={item} className="text-muted-foreground">
                      ✓ {item}
                    </p>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Mini visual components for each campaign type */

function DecisionBidVisual() {
  return (
    <div className="flex items-center justify-center gap-2 h-12" aria-label="Robot comparing products">
      {["A", "B", "C"].map((label, i) => (
        <div key={label} className="relative">
          <div
            className={`h-8 w-10 rounded border text-[9px] font-mono flex items-center justify-center ${
              i === 0
                ? "border-primary bg-primary/10 text-primary font-bold"
                : "border-muted text-muted-foreground"
            }`}
          >
            {label}
          </div>
          {i === 0 && (
            <div className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-primary text-[7px] text-primary-foreground flex items-center justify-center font-bold">
              1
            </div>
          )}
        </div>
      ))}
      <svg width="20" height="12" className="text-muted-foreground ml-1">
        <path d="M0 6h14M12 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px]">
        🤖
      </div>
    </div>
  );
}

function PreferenceSlotVisual() {
  return (
    <div className="flex items-center justify-center gap-3 h-12" aria-label="Recommended badge on product">
      <div className="relative h-9 w-14 rounded border border-muted flex items-center justify-center">
        <div className="text-[9px] text-muted-foreground">Product</div>
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[7px] font-bold px-1.5 rounded-full">
          ⭐ Recommended
        </div>
      </div>
    </div>
  );
}

function RestockVisual() {
  return (
    <div className="flex items-center justify-center gap-2 h-12" aria-label="Inventory alert to branded suggestion">
      <div className="rounded border border-amber-400/50 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 text-[9px] text-amber-700 dark:text-amber-400">
        ⚠ Low stock
      </div>
      <svg width="16" height="12" className="text-muted-foreground">
        <path d="M0 6h10M8 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <div className="rounded border border-primary/30 bg-primary/5 px-2 py-1 text-[9px] font-medium">
        📦 Your Brand
      </div>
    </div>
  );
}

function ComparisonVisual() {
  return (
    <div className="flex items-center justify-center gap-2 h-12" aria-label="Side-by-side comparison">
      <div className="h-9 w-12 rounded border border-primary bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
        You
      </div>
      <span className="text-muted-foreground text-xs">vs</span>
      <div className="h-9 w-12 rounded border border-muted flex items-center justify-center text-[9px] text-muted-foreground">
        Other
      </div>
    </div>
  );
}

function RouteVisual() {
  return (
    <div className="relative h-12 flex items-center justify-center" aria-label="Map route with sponsored pin">
      <svg width="120" height="40" viewBox="0 0 120 40" className="text-muted-foreground">
        <path d="M10 35 Q30 10 60 20 Q90 30 110 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
        <circle cx="10" cy="35" r="3" fill="currentColor" opacity="0.3" />
        <circle cx="110" cy="5" r="3" fill="currentColor" opacity="0.3" />
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="rounded bg-primary px-1.5 py-0.5 text-[7px] font-bold text-primary-foreground">
          📍 Your Store
        </div>
      </div>
    </div>
  );
}

function VoiceDisplayVisual() {
  return (
    <div className="flex items-center justify-center gap-3 h-12" aria-label="Voice prompt with display card">
      <div className="flex items-center gap-1">
        <span className="text-sm">🔊</span>
        <div className="flex items-end gap-[2px]">
          {[3, 5, 7, 4, 6].map((h, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-primary/50"
              style={{ height: `${h * 2}px` }}
            />
          ))}
        </div>
      </div>
      <span className="text-muted-foreground text-[10px]">+</span>
      <div className="h-8 w-12 rounded border border-primary/30 bg-primary/5 flex items-center justify-center text-[8px]">
        📱 Card
      </div>
    </div>
  );
}
