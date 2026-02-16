"use client";

import { FormatContent, FormatType, RobotType } from "@/types";
import { formatFieldConstraints } from "@/lib/creativeMappings";
import { RobotSurfacePreview } from "@/components/formats/RobotSurfacePreview";

interface BuilderProps {
  value: Partial<FormatContent>;
  onChange: (content: Partial<FormatContent>) => void;
  robotTypes: RobotType[];
}

const URGENCY_LEVELS = ["Low", "Medium", "High"];

export function RestockBannerBuilder({ value, onChange }: BuilderProps) {
  const alertText = value.alertText ?? "";
  const urgency = value.emotionalTone ?? "Medium";

  const preview: FormatContent = {
    type: FormatType.RESTOCK_ALERT_BANNER,
    alertText: alertText || "Your restock alert text...",
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium">Alert Text</label>
            <span className={`text-[10px] ${alertText.length > formatFieldConstraints.alertText ? "text-red-500" : "text-muted-foreground"}`}>
              {alertText.length}/{formatFieldConstraints.alertText}
            </span>
          </div>
          <textarea
            value={alertText}
            onChange={(e) => onChange({ ...value, alertText: e.target.value })}
            placeholder="Enter restock alert message..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
            rows={3}
            maxLength={formatFieldConstraints.alertText + 20}
          />
          {alertText.length > formatFieldConstraints.alertText && (
            <p className="text-[10px] text-red-500 mt-0.5">Exceeds {formatFieldConstraints.alertText} character limit</p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block">Urgency Level</label>
          <div className="flex gap-2">
            {URGENCY_LEVELS.map((u) => (
              <button
                key={u}
                onClick={() => onChange({ ...value, emotionalTone: u })}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                  urgency === u ? "border-primary bg-primary/5 font-semibold" : "hover:border-primary/30"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
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
