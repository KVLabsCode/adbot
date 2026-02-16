"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const stages = [
  {
    label: "Context Detected",
    description:
      "The robot senses an event — low inventory, a delivery request, a user preference signal — and begins evaluating its options.",
  },
  {
    label: "Options Evaluated",
    description:
      "The robot ranks available products based on price, availability, user preference, and safety constraints.",
  },
  {
    label: "Comparison Stage",
    description:
      "Competing options are weighed side-by-side. Your brand's placement and prominence can shift the outcome here.",
  },
  {
    label: "Decision Executed",
    description:
      "The robot commits to a choice — selecting, recommending, or routing to the winning option. Metrics are captured instantly.",
  },
];

export function DecisionLifecyclePanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded={isOpen}
        aria-label="Toggle decision lifecycle panel"
      >
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        How Robot Decisions Work
      </button>

      {isOpen && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {stages.map((stage, i) => (
              <div key={stage.label} className="flex items-center gap-1 flex-shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs cursor-help hover:bg-muted/50 transition-colors">
                      <span>{stage.label}</span>
                      <Info className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-semibold text-xs">{stage.label}</p>
                    <p className="text-xs mt-1">{stage.description}</p>
                  </TooltipContent>
                </Tooltip>
                {i < stages.length - 1 && (
                  <svg width="16" height="12" viewBox="0 0 16 12" className="text-muted-foreground flex-shrink-0">
                    <path d="M0 6h12M10 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Click any stage to learn more. Your campaigns target specific stages to influence outcomes.
          </p>
        </div>
      )}
    </div>
  );
}
