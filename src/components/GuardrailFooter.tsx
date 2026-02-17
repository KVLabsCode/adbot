"use client";

import { Check } from "lucide-react";

const guardrails = ["Consent", "Motion block", "Quiet hours", "10% holdout"];

export function GuardrailFooter() {
  return (
    <div className="border-t bg-muted/50 px-4 py-2 text-xs text-muted-foreground flex items-center gap-4 overflow-x-auto">
      <span className="font-medium shrink-0">Running with:</span>
      {guardrails.map((g) => (
        <span key={g} className="flex items-center gap-1 shrink-0">
          <Check className="h-3 w-3 text-green-600" aria-hidden="true" />
          {g}
        </span>
      ))}
    </div>
  );
}
