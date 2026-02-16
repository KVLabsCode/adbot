"use client";

import { CheckCircle } from "lucide-react";

const guardrails = [
  "Consent verification passed",
  "Motion-block compliance cleared",
  "Quiet-hours schedule respected",
  "Holdout group excluded",
];

export function GuardrailCheck() {
  return (
    <div className="w-full rounded-lg border bg-card p-4">
      <p className="text-xs font-semibold text-muted-foreground mb-2">
        Guardrail Checks
      </p>
      <div className="space-y-1.5">
        {guardrails.map((label) => (
          <div key={label} className="flex items-center gap-2">
            <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
            <span className="text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
