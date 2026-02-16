"use client";

import { useState } from "react";
import { CampaignType, FormatType, FormatContent } from "@/types";
import {
  campaignTypeLabels,
  campaignTypeEmojis,
  subtypeStrategyOptions,
  flowToFormats,
} from "@/lib/campaignMappings";
import { IntegratedFormatGallery } from "./IntegratedFormatGallery";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import creatives from "@/fixtures/creatives.json";

interface SubtypeStrategyConfigProps {
  subtype: CampaignType;
  onComplete: (data: {
    formats: FormatContent[];
    strategyConfig: Record<string, unknown>;
    budget: number;
  }) => void;
  onBack: () => void;
}

type ConfigStep = "formats" | "strategy" | "budget";

export function SubtypeStrategyConfig({
  subtype,
  onComplete,
  onBack,
}: SubtypeStrategyConfigProps) {
  const [step, setStep] = useState<ConfigStep>("formats");
  const [selectedFormats, setSelectedFormats] = useState<FormatType[]>([]);
  const [strategyValues, setStrategyValues] = useState<Record<string, string>>({});
  const [budget, setBudget] = useState<number | null>(null);

  const availableFormats = flowToFormats[subtype];
  const strategyOptions = subtypeStrategyOptions[subtype];

  function toggleFormat(fmt: FormatType) {
    setSelectedFormats((prev) =>
      prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt]
    );
  }

  function handleStrategySelect(optionId: string, value: string) {
    setStrategyValues((prev) => ({ ...prev, [optionId]: value }));
  }

  function handleFinish() {
    if (selectedFormats.length === 0 || !budget) return;
    const formats: FormatContent[] = selectedFormats.map((ft) => {
      const creative = (creatives as unknown as Record<string, FormatContent>)[ft];
      return { ...creative, type: ft };
    });
    onComplete({
      formats,
      strategyConfig: strategyValues,
      budget,
    });
  }

  const allStrategySelected = strategyOptions.every(
    (opt) => strategyValues[opt.id]
  );

  const steps: ConfigStep[] = ["formats", "strategy", "budget"];
  const stepIndex = steps.indexOf(step);

  const stepTitle: Record<ConfigStep, string> = {
    formats: "Select Ad Formats",
    strategy: "Configure Strategy",
    budget: "Set Daily Budget",
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => {
            if (stepIndex > 0) {
              setStep(steps[stepIndex - 1]);
            } else {
              onBack();
            }
          }}
          className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {stepIndex === 0 ? "Back to Subtypes" : "Back"}
        </button>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-4">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wide">
          {campaignTypeEmojis[subtype]} {campaignTypeLabels[subtype]} — Step{" "}
          {stepIndex + 1} of {steps.length}
        </p>
        <h2 className="text-lg font-semibold mb-4">{stepTitle[step]}</h2>

        {/* Format Selection */}
        {step === "formats" && (
          <div>
            <IntegratedFormatGallery
              availableFormats={availableFormats}
              selectedFormats={selectedFormats}
              onToggle={toggleFormat}
            />
            <Button
              className="w-full mt-4"
              disabled={selectedFormats.length === 0}
              onClick={() => setStep("strategy")}
            >
              Continue with {selectedFormats.length} format
              {selectedFormats.length !== 1 ? "s" : ""}
            </Button>
          </div>
        )}

        {/* Strategy Configuration */}
        {step === "strategy" && (
          <div className="space-y-4">
            {strategyOptions.map((opt) => (
              <div key={opt.id}>
                <p className="text-xs font-semibold mb-2">{opt.label}</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {opt.options.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => handleStrategySelect(opt.id, o.value)}
                      className={`rounded-lg border p-3 text-center text-xs transition-colors hover:border-primary/40 ${
                        strategyValues[opt.id] === o.value
                          ? "border-primary bg-primary/5 font-semibold"
                          : ""
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <Button
              className="w-full mt-2"
              disabled={!allStrategySelected}
              onClick={() => setStep("budget")}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Budget Selection */}
        {step === "budget" && (
          <div className="space-y-2">
            {[10000, 15000, 25000, 50000].map((amount) => (
              <button
                key={amount}
                onClick={() => setBudget(amount)}
                className={`w-full rounded-lg border p-4 text-left transition-colors hover:border-primary/40 ${
                  budget === amount ? "border-primary bg-primary/5" : ""
                }`}
              >
                <p className="text-sm font-semibold">
                  ${(amount / 1000).toFixed(0)}K / day
                </p>
                <p className="text-xs text-muted-foreground">
                  ${amount.toLocaleString()} daily budget
                </p>
              </button>
            ))}
            <Button
              className="w-full mt-2"
              disabled={!budget}
              onClick={handleFinish}
            >
              Continue to Review
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
