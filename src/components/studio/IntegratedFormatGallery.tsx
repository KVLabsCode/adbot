"use client";

import { useState } from "react";
import { FormatType, FormatContent } from "@/types";
import { formatTypeLabels } from "@/lib/campaignMappings";
import { RobotSurfacePreview } from "@/components/formats/RobotSurfacePreview";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import creatives from "@/fixtures/creatives.json";

const formatEmojis: Record<FormatType, string> = {
  [FormatType.DISPLAY_CARD]: "📱",
  [FormatType.VOICE_PROMPT]: "🔊",
  [FormatType.HIGHLIGHT_BADGE]: "⭐",
  [FormatType.RESTOCK_ALERT_BANNER]: "📣",
  [FormatType.ROUTE_PIN]: "📍",
};

const formatDescriptions: Record<FormatType, string> = {
  [FormatType.DISPLAY_CARD]: "Rich visual card on robot screens",
  [FormatType.VOICE_PROMPT]: "Spoken message by robot assistants",
  [FormatType.HIGHLIGHT_BADGE]: "Badge overlay on product listings",
  [FormatType.RESTOCK_ALERT_BANNER]: "Alert when inventory runs low",
  [FormatType.ROUTE_PIN]: "Waypoint on navigation maps",
};

interface IntegratedFormatGalleryProps {
  availableFormats: FormatType[];
  selectedFormats: FormatType[];
  onToggle: (formatType: FormatType) => void;
}

export function IntegratedFormatGallery({
  availableFormats,
  selectedFormats,
  onToggle,
}: IntegratedFormatGalleryProps) {
  const [previewFormat, setPreviewFormat] = useState<FormatType | null>(null);

  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2">
        {availableFormats.map((fmt) => {
          const isSelected = selectedFormats.includes(fmt);
          return (
            <div
              key={fmt}
              className={`rounded-lg border p-3 transition-colors ${
                isSelected ? "border-primary bg-primary/5" : "border-muted"
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg" role="img" aria-hidden="true">
                  {formatEmojis[fmt]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{formatTypeLabels[fmt]}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDescriptions[fmt]}
                  </p>
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[10px] h-7 flex-1"
                  onClick={() => setPreviewFormat(fmt)}
                >
                  View in Context
                </Button>
                <Button
                  variant={isSelected ? "secondary" : "default"}
                  size="sm"
                  className="text-[10px] h-7 flex-1"
                  onClick={() => onToggle(fmt)}
                >
                  {isSelected ? "Remove" : "Select"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewFormat && (
        <FormatPreviewModal
          formatType={previewFormat}
          onClose={() => setPreviewFormat(null)}
        />
      )}
    </>
  );
}

function FormatPreviewModal({
  formatType,
  onClose,
}: {
  formatType: FormatType;
  onClose: () => void;
}) {
  const creative = (creatives as Record<string, FormatContent>)[formatType];
  const format: FormatContent = { ...creative, type: formatType };

  const captions: Record<FormatType, string> = {
    [FormatType.DISPLAY_CARD]:
      "This Display Card appears during product comparison on robot screens.",
    [FormatType.VOICE_PROMPT]:
      "This Voice Prompt plays when robots verbalize recommendations.",
    [FormatType.HIGHLIGHT_BADGE]:
      "This Highlight Badge appears next to your product in robot listings.",
    [FormatType.RESTOCK_ALERT_BANNER]:
      "This Alert Banner triggers when robots detect low inventory.",
    [FormatType.ROUTE_PIN]:
      "This Route Pin appears on robot navigation maps during delivery.",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-xl border bg-card p-6 shadow-lg mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-semibold mb-4">
          {formatTypeLabels[formatType]}
        </h3>
        <RobotSurfacePreview format={format} />
        <p className="text-xs text-muted-foreground text-center mt-4">
          {captions[formatType]}
        </p>
        <Button variant="outline" className="w-full mt-4" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
