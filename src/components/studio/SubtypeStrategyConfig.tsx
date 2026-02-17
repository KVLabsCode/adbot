"use client";

import { useState, useMemo } from "react";
import { CampaignType, FormatType, FormatContent, TimeWindow, CampaignSchedule } from "@/types";
import {
  campaignTypeLabels,
  campaignTypeEmojis,
  subtypeStrategyOptions,
  flowToFormats,
  timeWindowCampaignTypes,
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
    schedule: CampaignSchedule;
  }) => void;
  onBack: () => void;
}

type ConfigStep = "formats" | "strategy" | "budget" | "duration";

const timeWindowLabels: Record<TimeWindow, string> = {
  [TimeWindow.ALL_DAY]: "All Day",
  [TimeWindow.MORNING]: "Morning (6am-12pm)",
  [TimeWindow.AFTERNOON]: "Afternoon (12pm-5pm)",
  [TimeWindow.EVENING]: "Evening (5pm-9pm)",
  [TimeWindow.NIGHT]: "Night (9pm-6am)",
  [TimeWindow.LUNCH_RUSH]: "Lunch Rush (11am-2pm)",
  [TimeWindow.DINNER_RUSH]: "Dinner Rush (5pm-9pm)",
};

function formatDateInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

function daysBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function durationLabel(days: number): string {
  if (days === 0) return "Same day";
  if (days === 1) return "1 day";
  if (days < 14) return `${days} days`;
  const weeks = Math.round(days / 7);
  return `${weeks} week${weeks !== 1 ? "s" : ""} (${days} days)`;
}

export function SubtypeStrategyConfig({
  subtype,
  onComplete,
  onBack,
}: SubtypeStrategyConfigProps) {
  const [step, setStep] = useState<ConfigStep>("formats");
  const [selectedFormats, setSelectedFormats] = useState<FormatType[]>([]);
  const [strategyValues, setStrategyValues] = useState<Record<string, string>>({});
  const [budget, setBudget] = useState<number | null>(null);

  // Duration state
  const today = useMemo(() => formatDateInput(new Date()), []);
  const defaultEnd = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return formatDateInput(d);
  }, []);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [selectedTimeWindows, setSelectedTimeWindows] = useState<TimeWindow[]>([]);

  const showTimeWindows = timeWindowCampaignTypes.includes(subtype);
  const duration = daysBetween(startDate, endDate);

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

  function applyQuickPick(days: number) {
    const s = new Date();
    const e = new Date();
    e.setDate(e.getDate() + days);
    setStartDate(formatDateInput(s));
    setEndDate(formatDateInput(e));
  }

  function toggleTimeWindow(tw: TimeWindow) {
    setSelectedTimeWindows((prev) =>
      prev.includes(tw) ? prev.filter((t) => t !== tw) : [...prev, tw]
    );
  }

  function handleFinish() {
    if (selectedFormats.length === 0 || !budget || !startDate || !endDate) return;
    const formats: FormatContent[] = selectedFormats.map((ft) => {
      const creative = (creatives as unknown as Record<string, FormatContent>)[ft];
      return { ...creative, type: ft };
    });
    const schedule: CampaignSchedule = {
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      timeWindows: selectedTimeWindows.length > 0 ? selectedTimeWindows : undefined,
    };
    onComplete({
      formats,
      strategyConfig: strategyValues,
      budget,
      schedule,
    });
  }

  const allStrategySelected = strategyOptions.every(
    (opt) => strategyValues[opt.id]
  );

  const steps: ConfigStep[] = ["formats", "strategy", "budget", "duration"];
  const stepIndex = steps.indexOf(step);

  const stepTitle: Record<ConfigStep, string> = {
    formats: "Select Ad Formats",
    strategy: "Configure Strategy",
    budget: "Set Daily Budget",
    duration: "Set Campaign Duration",
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
              onClick={() => setStep("duration")}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Duration Selection */}
        {step === "duration" && (
          <div className="space-y-4">
            {/* Quick-pick durations */}
            <div>
              <p className="text-xs font-semibold mb-2">Quick Pick</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { days: 7, label: "7 days" },
                  { days: 14, label: "14 days" },
                  { days: 30, label: "30 days" },
                ].map((pick) => (
                  <button
                    key={pick.days}
                    onClick={() => applyQuickPick(pick.days)}
                    className={`rounded-lg border p-2.5 text-center text-xs transition-colors hover:border-primary/40 ${
                      duration === pick.days
                        ? "border-primary bg-primary/5 font-semibold"
                        : ""
                    }`}
                  >
                    {pick.label}
                  </button>
                ))}
                <div className="rounded-lg border p-2.5 text-center text-xs text-muted-foreground border-dashed">
                  Custom
                </div>
              </div>
            </div>

            {/* Date pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Duration display */}
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-sm font-medium">{durationLabel(duration)}</p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {" - "}
                {new Date(endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>

            {/* Time-of-day windows (only for time-sensitive types) */}
            {showTimeWindows && (
              <div>
                <p className="text-xs font-semibold mb-2">Time-of-Day Windows</p>
                <p className="text-[10px] text-muted-foreground mb-2">
                  Optionally restrict when your ads run during each day.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(timeWindowLabels).map(([key, label]) => {
                    const tw = key as TimeWindow;
                    const isSelected = selectedTimeWindows.includes(tw);
                    return (
                      <button
                        key={tw}
                        onClick={() => toggleTimeWindow(tw)}
                        className={`rounded-lg border p-2.5 text-left text-xs transition-colors hover:border-primary/40 ${
                          isSelected
                            ? "border-primary bg-primary/5 font-semibold"
                            : ""
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              className="w-full mt-2"
              disabled={!startDate || !endDate || duration < 0}
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
