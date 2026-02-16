"use client";

import { useState } from "react";
import { ArrowLeft, Trash2, Wand2 } from "lucide-react";
import { Creative, CreativeStatus } from "@/types";
import { useStore } from "@/store";
import { formatTypeLabels, formatTypeEmojis } from "@/lib/campaignMappings";
import { robotTypeLabels, robotTypeEmojis } from "@/lib/campaignMappings";
import { RobotSurfacePreview } from "@/components/formats/RobotSurfacePreview";
import { validateCreative, autoFixCreative } from "@/lib/validationEngine";
import { Button } from "@/components/ui/button";

const statusColors: Record<CreativeStatus, string> = {
  [CreativeStatus.DRAFT]: "bg-muted text-muted-foreground",
  [CreativeStatus.VALIDATED]: "bg-green-500/10 text-green-700 dark:text-green-400",
  [CreativeStatus.NEEDS_CORRECTION]: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  [CreativeStatus.LIVE]: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
};

const statusLabels: Record<CreativeStatus, string> = {
  [CreativeStatus.DRAFT]: "Draft",
  [CreativeStatus.VALIDATED]: "Validated",
  [CreativeStatus.NEEDS_CORRECTION]: "Needs Correction",
  [CreativeStatus.LIVE]: "Live",
};

interface CreativeDetailPanelProps {
  creative: Creative;
  onBack: () => void;
}

export function CreativeDetailPanel({ creative, onBack }: CreativeDetailPanelProps) {
  const updateCreative = useStore((s) => s.updateCreative);
  const deleteCreative = useStore((s) => s.deleteCreative);
  const addValidationLog = useStore((s) => s.addValidationLog);
  const [current, setCurrent] = useState(creative);

  const handleValidate = () => {
    const results = validateCreative(current);
    const allPassed = results.every((r) => r.passed);
    const status = allPassed ? CreativeStatus.VALIDATED : CreativeStatus.NEEDS_CORRECTION;
    const updated = {
      ...current,
      status,
      validationResults: results,
      lastModified: new Date().toISOString(),
    };
    setCurrent(updated);
    updateCreative(current.id, updated);

    addValidationLog({
      id: `vlog-${Date.now()}`,
      creativeId: current.id,
      creativeName: current.name,
      formatType: current.formatType,
      timestamp: new Date().toISOString(),
      passed: allPassed,
      results,
    });
  };

  const handleAutoFix = (resultIndex: number) => {
    const result = current.validationResults[resultIndex];
    if (!result || !result.autoFixAvailable) return;
    const fixed = autoFixCreative(current, result);
    const newResults = validateCreative(fixed);
    const allPassed = newResults.every((r) => r.passed);
    const updated = {
      ...fixed,
      status: allPassed ? CreativeStatus.VALIDATED : CreativeStatus.NEEDS_CORRECTION,
      validationResults: newResults,
      lastModified: new Date().toISOString(),
    };
    setCurrent(updated);
    updateCreative(current.id, updated);
  };

  const handleDelete = () => {
    deleteCreative(current.id);
    onBack();
  };

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Creatives
        </button>

        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{formatTypeEmojis[current.formatType]}</span>
              <h2 className="text-lg font-semibold">{current.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatTypeLabels[current.formatType]}
              </span>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  statusColors[current.status]
                }`}
              >
                {statusLabels[current.status]}
              </span>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="rounded-lg p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Delete creative"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Robot Types */}
        <div className="mb-4">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Robot Types
          </p>
          <div className="flex flex-wrap gap-1.5">
            {current.robotTypes.map((rt) => (
              <span
                key={rt}
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
              >
                {robotTypeEmojis[rt]} {robotTypeLabels[rt]}
              </span>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="mb-4">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Preview
          </p>
          <RobotSurfacePreview format={current.content} />
        </div>

        {/* Validation Results */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Validation
            </p>
            <Button size="sm" variant="outline" onClick={handleValidate} className="text-xs h-7">
              Run Validation
            </Button>
          </div>
          {current.validationResults.length > 0 ? (
            <div className="space-y-1.5">
              {current.validationResults.map((r, i) => (
                <div
                  key={r.category}
                  className={`flex items-center justify-between rounded-lg border p-2 text-xs ${
                    r.passed ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{r.passed ? "\u2705" : "\u26a0\ufe0f"}</span>
                    <div>
                      <p className="font-medium capitalize">{r.category.replace(/_/g, " ")}</p>
                      <p className="text-muted-foreground text-[10px]">{r.message}</p>
                    </div>
                  </div>
                  {!r.passed && r.autoFixAvailable && (
                    <button
                      onClick={() => handleAutoFix(i)}
                      className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Wand2 className="h-3 w-3" />
                      Auto Fix
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No validation results yet. Click "Run Validation" to check.
            </p>
          )}
        </div>

        {/* Trust Badges */}
        {current.status === CreativeStatus.VALIDATED && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 space-y-1">
            <p className="text-xs font-medium text-green-700 dark:text-green-400">
              ✓ Compatible with {current.robotTypes.map((rt) => robotTypeLabels[rt]).join(", ")}
            </p>
            <p className="text-xs font-medium text-green-700 dark:text-green-400">
              ✓ Passes screen constraints
            </p>
            <p className="text-xs font-medium text-green-700 dark:text-green-400">
              ✓ Guardrail compliant
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
