"use client";

import { FormatContent, FormatType, RobotType } from "@/types";
import { formatFieldConstraints } from "@/lib/creativeMappings";
import { RobotSurfacePreview } from "@/components/formats/RobotSurfacePreview";

interface BuilderProps {
  value: Partial<FormatContent>;
  onChange: (content: Partial<FormatContent>) => void;
  robotTypes: RobotType[];
}

export function RoutePinBuilder({ value, onChange }: BuilderProps) {
  const pinLabel = value.pinLabel ?? "";
  const headline = value.headline ?? "";
  const body = value.body ?? "";

  const preview: FormatContent = {
    type: FormatType.ROUTE_PIN,
    pinLabel: pinLabel || "Sponsored Stop",
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium">Store Name / Pin Label</label>
            <span className={`text-[10px] ${pinLabel.length > formatFieldConstraints.pinLabel ? "text-red-500" : "text-muted-foreground"}`}>
              {pinLabel.length}/{formatFieldConstraints.pinLabel}
            </span>
          </div>
          <input
            type="text"
            value={pinLabel}
            onChange={(e) => onChange({ ...value, pinLabel: e.target.value })}
            placeholder="e.g. Joe's Coffee, BrandX Store..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            maxLength={formatFieldConstraints.pinLabel + 10}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium">Offer Line</label>
            <span className={`text-[10px] ${headline.length > formatFieldConstraints.offerLine ? "text-red-500" : "text-muted-foreground"}`}>
              {headline.length}/{formatFieldConstraints.offerLine}
            </span>
          </div>
          <input
            type="text"
            value={headline}
            onChange={(e) => onChange({ ...value, headline: e.target.value })}
            placeholder="e.g. 20% off your first order..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            maxLength={formatFieldConstraints.offerLine + 10}
          />
        </div>

        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">
            Distance label: <span className="font-medium text-foreground">Auto-calculated</span>
          </p>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Live Preview
        </p>
        <RobotSurfacePreview format={preview} />
      </div>
    </div>
  );
}
