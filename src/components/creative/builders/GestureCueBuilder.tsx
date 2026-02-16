"use client";

import { FormatContent, FormatType, RobotType } from "@/types";
import { formatFieldConstraints } from "@/lib/creativeMappings";
import { RobotSurfacePreview } from "@/components/formats/RobotSurfacePreview";

interface BuilderProps {
  value: Partial<FormatContent>;
  onChange: (content: Partial<FormatContent>) => void;
  robotTypes: RobotType[];
}

const GESTURES = ["Wave", "Point", "Present", "Bow", "Thumbs Up"];
const TIMINGS = ["Before Speech", "During Speech", "After Speech"];

export function GestureCueBuilder({ value, onChange }: BuilderProps) {
  const gestureName = value.gestureName ?? "";
  const gestureContext = value.gestureContext ?? "";
  const timing = value.emotionalTone ?? "during";

  const preview: FormatContent = {
    type: FormatType.GESTURE_CUE,
    gestureName: gestureName || "wave",
    gestureContext: gestureContext || "Gesture context...",
    emotionalTone: timing,
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium mb-1 block">Gesture</label>
          <div className="flex flex-wrap gap-2">
            {GESTURES.map((g) => {
              const gVal = g.toLowerCase().replace(/ /g, "_");
              return (
                <button
                  key={g}
                  onClick={() => onChange({ ...value, gestureName: gVal })}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                    gestureName === gVal
                      ? "border-primary bg-primary/5 font-semibold"
                      : "hover:border-primary/30"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium">Context</label>
            <span className={`text-[10px] ${gestureContext.length > formatFieldConstraints.gestureContext ? "text-red-500" : "text-muted-foreground"}`}>
              {gestureContext.length}/{formatFieldConstraints.gestureContext}
            </span>
          </div>
          <input
            type="text"
            value={gestureContext}
            onChange={(e) => onChange({ ...value, gestureContext: e.target.value })}
            placeholder="e.g. Draw attention to display..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            maxLength={formatFieldConstraints.gestureContext + 10}
          />
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block">Timing</label>
          <div className="flex flex-wrap gap-2">
            {TIMINGS.map((t) => {
              const tVal = t.toLowerCase().split(" ")[0];
              return (
                <button
                  key={t}
                  onClick={() => onChange({ ...value, emotionalTone: tVal })}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                    timing === tVal
                      ? "border-primary bg-primary/5 font-semibold"
                      : "hover:border-primary/30"
                  }`}
                >
                  {t}
                </button>
              );
            })}
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
