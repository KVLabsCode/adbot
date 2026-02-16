"use client";

import { FormatContent, FormatType, RobotType } from "@/types";
import { formatFieldConstraints } from "@/lib/creativeMappings";
import { RobotSurfacePreview } from "@/components/formats/RobotSurfacePreview";

interface BuilderProps {
  value: Partial<FormatContent>;
  onChange: (content: Partial<FormatContent>) => void;
  robotTypes: RobotType[];
}

const TONES = ["Neutral", "Enthusiastic", "Premium"];

export function VoicePromptBuilder({ value, onChange }: BuilderProps) {
  const voiceScript = value.voiceScript ?? "";
  const tone = value.emotionalTone ?? "Neutral";

  const estimatedDuration = Math.max(1, Math.ceil(voiceScript.split(/\s+/).filter(Boolean).length / 2.5));

  const preview: FormatContent = {
    type: FormatType.VOICE_PROMPT,
    voiceScript: voiceScript || "Your voice script will appear here...",
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium">Voice Script</label>
            <span className={`text-[10px] ${voiceScript.length > formatFieldConstraints.voiceScript ? "text-red-500" : "text-muted-foreground"}`}>
              {voiceScript.length}/{formatFieldConstraints.voiceScript}
            </span>
          </div>
          <textarea
            value={voiceScript}
            onChange={(e) => onChange({ ...value, voiceScript: e.target.value })}
            placeholder="Enter the script the robot will speak..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
            rows={5}
            maxLength={formatFieldConstraints.voiceScript + 30}
          />
          {voiceScript.length > formatFieldConstraints.voiceScript && (
            <p className="text-[10px] text-red-500 mt-0.5">Exceeds {formatFieldConstraints.voiceScript} character limit</p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block">Tone</label>
          <div className="flex gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => onChange({ ...value, emotionalTone: t })}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                  tone === t ? "border-primary bg-primary/5 font-semibold" : "hover:border-primary/30"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">
            Estimated duration: <span className="font-medium text-foreground">~{estimatedDuration}s</span>
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
