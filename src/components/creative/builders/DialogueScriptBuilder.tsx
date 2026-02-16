"use client";

import { FormatContent, FormatType, RobotType } from "@/types";
import { formatFieldConstraints } from "@/lib/creativeMappings";
import { RobotSurfacePreview } from "@/components/formats/RobotSurfacePreview";

interface BuilderProps {
  value: Partial<FormatContent>;
  onChange: (content: Partial<FormatContent>) => void;
  robotTypes: RobotType[];
}

const EMOTIONAL_TONES = ["Friendly", "Professional", "Playful", "Empathetic"];
const CONTEXT_TRIGGERS = ["Greeting", "Product Inquiry", "Checkout", "Idle"];

export function DialogueScriptBuilder({ value, onChange }: BuilderProps) {
  const dialogueLine = value.dialogueLine ?? "";
  const emotionalTone = value.emotionalTone ?? "Friendly";
  const contextTrigger = value.contextTrigger ?? "Greeting";

  const preview: FormatContent = {
    type: FormatType.HUMANOID_DIALOGUE_SCRIPT,
    dialogueLine: dialogueLine || "Your dialogue line...",
    emotionalTone,
    contextTrigger,
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium">Dialogue Line</label>
            <span className={`text-[10px] ${dialogueLine.length > formatFieldConstraints.dialogueLine ? "text-red-500" : "text-muted-foreground"}`}>
              {dialogueLine.length}/{formatFieldConstraints.dialogueLine}
            </span>
          </div>
          <textarea
            value={dialogueLine}
            onChange={(e) => onChange({ ...value, dialogueLine: e.target.value })}
            placeholder="Enter what the robot will say..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
            rows={4}
            maxLength={formatFieldConstraints.dialogueLine + 20}
          />
          {dialogueLine.length > formatFieldConstraints.dialogueLine && (
            <p className="text-[10px] text-red-500 mt-0.5">Exceeds {formatFieldConstraints.dialogueLine} character limit</p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block">Emotional Tone</label>
          <div className="flex flex-wrap gap-2">
            {EMOTIONAL_TONES.map((t) => (
              <button
                key={t}
                onClick={() => onChange({ ...value, emotionalTone: t.toLowerCase() })}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                  emotionalTone === t.toLowerCase()
                    ? "border-primary bg-primary/5 font-semibold"
                    : "hover:border-primary/30"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block">Context Trigger</label>
          <div className="flex flex-wrap gap-2">
            {CONTEXT_TRIGGERS.map((ct) => (
              <button
                key={ct}
                onClick={() => onChange({ ...value, contextTrigger: ct.toLowerCase().replace(/ /g, "_") })}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                  contextTrigger === ct.toLowerCase().replace(/ /g, "_")
                    ? "border-primary bg-primary/5 font-semibold"
                    : "hover:border-primary/30"
                }`}
              >
                {ct}
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
