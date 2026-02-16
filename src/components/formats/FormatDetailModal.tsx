"use client";

import { FormatType, FormatContent } from "@/types";
import { formatTypeLabels } from "@/lib/campaignMappings";
import { RobotSurfacePreview } from "./RobotSurfacePreview";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import creatives from "@/fixtures/creatives.json";

interface FormatDetailModalProps {
  formatType: FormatType;
  onClose: () => void;
}

const formatInfo: Record<
  FormatType,
  {
    where: string;
    when: string;
    influences: string;
    metrics: string;
  }
> = {
  [FormatType.DISPLAY_CARD]: {
    where: "Robot screen interfaces during product evaluation",
    when: "When a robot is browsing or comparing options",
    influences: "Product selection and recommendation ranking",
    metrics: "ASP, DCV, RDR",
  },
  [FormatType.VOICE_PROMPT]: {
    where: "Robot voice interaction during decision moments",
    when: "When a robot verbalizes options to a user",
    influences: "Brand recall and preference during verbal recommendations",
    metrics: "ASP, RDR",
  },
  [FormatType.HIGHLIGHT_BADGE]: {
    where: "Inline badge overlay on product listings",
    when: "During comparison and pre-decision stages",
    influences: "Visual prominence among competing options",
    metrics: "DCV, CPD",
  },
  [FormatType.RESTOCK_ALERT_BANNER]: {
    where: "Alert banners in inventory management interfaces",
    when: "When a robot detects low stock on tracked items",
    influences: "Restock decisions and brand preference for replenishment",
    metrics: "DCV, CPD, RDR",
  },
  [FormatType.ROUTE_PIN]: {
    where: "Navigation waypoints on robot routing maps",
    when: "During delivery or patrol route planning",
    influences: "Route selection and stop prioritization",
    metrics: "ASP, CPD",
  },
};

export function FormatDetailModal({ formatType, onClose }: FormatDetailModalProps) {
  const info = formatInfo[formatType];
  const creative = (creatives as Record<string, FormatContent>)[formatType];
  const format: FormatContent = { ...creative, type: formatType };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border bg-card shadow-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card px-6 py-4 rounded-t-xl">
          <h2 className="text-sm font-semibold">{formatTypeLabels[formatType]}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Robot Surface Preview */}
          <RobotSurfacePreview format={format} />

          {/* Educational info */}
          <div className="space-y-3">
            <InfoRow label="Where it appears" value={info.where} />
            <InfoRow label="When it triggers" value={info.when} />
            <InfoRow label="What it influences" value={info.influences} />
            <InfoRow label="Metrics affected" value={info.metrics} />
          </div>

          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <p className="text-xs font-medium text-muted-foreground min-w-[120px] shrink-0">
        {label}
      </p>
      <p className="text-xs">{value}</p>
    </div>
  );
}
