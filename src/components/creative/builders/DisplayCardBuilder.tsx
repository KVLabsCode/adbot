"use client";

import { FormatContent, FormatType, RobotType } from "@/types";
import { formatFieldConstraints } from "@/lib/creativeMappings";
import { RobotSurfacePreview } from "@/components/formats/RobotSurfacePreview";

interface BuilderProps {
  value: Partial<FormatContent>;
  onChange: (content: Partial<FormatContent>) => void;
  robotTypes: RobotType[];
}

export function DisplayCardBuilder({ value, onChange }: BuilderProps) {
  const headline = value.headline ?? "";
  const body = value.body ?? "";
  const cta = value.cta ?? "";

  const preview: FormatContent = {
    type: FormatType.DISPLAY_CARD,
    headline: headline || "Your Headline",
    body: body || "Your body copy goes here.",
    cta: cta || "CTA",
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium">Headline</label>
            <span className={`text-[10px] ${headline.length > formatFieldConstraints.headline ? "text-red-500" : "text-muted-foreground"}`}>
              {headline.length}/{formatFieldConstraints.headline}
            </span>
          </div>
          <input
            type="text"
            value={headline}
            onChange={(e) => onChange({ ...value, headline: e.target.value })}
            placeholder="Enter headline..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            maxLength={formatFieldConstraints.headline + 20}
          />
          {headline.length > formatFieldConstraints.headline && (
            <p className="text-[10px] text-red-500 mt-0.5">Exceeds {formatFieldConstraints.headline} character limit</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium">Body</label>
            <span className={`text-[10px] ${body.length > formatFieldConstraints.body ? "text-red-500" : "text-muted-foreground"}`}>
              {body.length}/{formatFieldConstraints.body}
            </span>
          </div>
          <textarea
            value={body}
            onChange={(e) => onChange({ ...value, body: e.target.value })}
            placeholder="Enter body text..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
            rows={3}
            maxLength={formatFieldConstraints.body + 20}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium">CTA Button</label>
            <span className={`text-[10px] ${cta.length > formatFieldConstraints.cta ? "text-red-500" : "text-muted-foreground"}`}>
              {cta.length}/{formatFieldConstraints.cta}
            </span>
          </div>
          <input
            type="text"
            value={cta}
            onChange={(e) => onChange({ ...value, cta: e.target.value })}
            placeholder="Enter CTA..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            maxLength={formatFieldConstraints.cta + 10}
          />
        </div>

        <div>
          <label className="text-xs font-medium">Icon Upload</label>
          <div className="mt-1 rounded-lg border-2 border-dashed p-4 text-center text-xs text-muted-foreground">
            Icon upload (mock) — drag & drop or click
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
