"use client";

import { FlowType } from "@/types";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CampaignFlowPreviewProps {
  flow: FlowType;
}

const nodes = [
  {
    id: "CONTEXTUAL_TRIGGER",
    label: "Context Detected",
    tooltip:
      "The robot senses an event — low inventory, a delivery request, or a user preference signal.",
  },
  {
    id: "PRE_DECISION",
    label: "Robot Evaluates",
    tooltip:
      "The robot ranks available products based on price, availability, and safety constraints.",
  },
  {
    id: "COMPARISON_STAGE",
    label: "Brand Influence",
    tooltip:
      "Competing options are weighed side-by-side. Your brand's placement shifts the outcome.",
  },
  {
    id: "POST_DECISION",
    label: "Decision Executed",
    tooltip:
      "The robot commits to a choice — selecting, recommending, or routing to the winning option.",
  },
];

const flowToActiveNode: Record<FlowType, string> = {
  [FlowType.CONTEXTUAL_TRIGGER]: "CONTEXTUAL_TRIGGER",
  [FlowType.PRE_DECISION]: "PRE_DECISION",
  [FlowType.COMPARISON_STAGE]: "COMPARISON_STAGE",
  [FlowType.POST_DECISION]: "POST_DECISION",
};

const flowInfluenceLabel: Record<FlowType, string> = {
  [FlowType.CONTEXTUAL_TRIGGER]:
    "Your brand triggers when context matches — reaching robots at the moment of need.",
  [FlowType.PRE_DECISION]:
    "Your brand influences ranking before final selection.",
  [FlowType.COMPARISON_STAGE]:
    "Your brand stands out during side-by-side comparison.",
  [FlowType.POST_DECISION]:
    "Your brand reinforces the decision after selection is made.",
};

export function CampaignFlowPreview({ flow }: CampaignFlowPreviewProps) {
  const activeNodeId = flowToActiveNode[flow];

  return (
    <div className="w-full rounded-lg border bg-card p-4">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0">
        {nodes.map((node, i) => {
          const isActive = node.id === activeNodeId;
          return (
            <div key={node.id} className="flex items-center gap-0 flex-shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "rounded-lg border-2 px-3 py-2 text-xs font-medium transition-all duration-150 text-center min-w-[120px] cursor-help relative",
                      isActive
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-muted text-muted-foreground"
                    )}
                  >
                    {node.label}
                    <Info className="h-2.5 w-2.5 absolute top-1 right-1 opacity-40" aria-hidden="true" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p className="text-xs">{node.tooltip}</p>
                </TooltipContent>
              </Tooltip>
              {i < nodes.length - 1 && (
                <svg
                  width="24"
                  height="12"
                  viewBox="0 0 24 12"
                  className="text-muted-foreground hidden sm:block flex-shrink-0 mx-0.5"
                  aria-hidden="true"
                >
                  <path
                    d="M0 6h18M16 2l4 4-4 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={cn(
                      isActive && "stroke-primary"
                    )}
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground mt-3 text-center">
        {flowInfluenceLabel[flow]}
      </p>
    </div>
  );
}
