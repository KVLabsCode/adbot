"use client";

import { FormatContent, FormatType, RobotType } from "@/types";
import { formatFieldConstraints } from "@/lib/creativeMappings";
import { RobotSurfacePreview } from "@/components/formats/RobotSurfacePreview";

interface BuilderProps {
  value: Partial<FormatContent>;
  onChange: (content: Partial<FormatContent>) => void;
  robotTypes: RobotType[];
}

export function HighlightBadgeBuilder({ value, onChange }: BuilderProps) {
  const badgeText = value.badgeText ?? "";

  const preview: FormatContent = {
    type: FormatType.HIGHLIGHT_BADGE,
    badgeText: badgeText || "Badge",
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium">Badge Text</label>
            <span className={`text-[10px] ${badgeText.length > formatFieldConstraints.badgeText ? "text-red-500" : "text-muted-foreground"}`}>
              {badgeText.length}/{formatFieldConstraints.badgeText}
            </span>
          </div>
          <input
            type="text"
            value={badgeText}
            onChange={(e) => onChange({ ...value, badgeText: e.target.value })}
            placeholder="e.g. Top Pick, Best Value..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            maxLength={formatFieldConstraints.badgeText + 10}
          />
          {badgeText.length > formatFieldConstraints.badgeText && (
            <p className="text-[10px] text-red-500 mt-0.5">Exceeds {formatFieldConstraints.badgeText} character limit</p>
          )}
        </div>

        <div className="rounded-lg border p-3">
          <p className="text-[10px] text-muted-foreground">
            Badges appear as small overlays on the robot screen surface, drawing attention to highlighted products.
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
