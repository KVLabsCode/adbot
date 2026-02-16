"use client";

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { metricTooltips } from "@/lib/metricTooltips";

interface MetricInfoProps {
  metricKey: string;
}

export function MetricInfo({ metricKey }: MetricInfoProps) {
  const info = metricTooltips[metricKey];
  if (!info) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Info about ${info.title}`}
        >
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="font-semibold text-xs">{info.title}</p>
        <p className="text-xs mt-1">{info.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
