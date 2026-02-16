"use client";

import { useState, useMemo } from "react";
import {
  CampaignType,
  FlowType,
  FormatType,
  FormatContent,
  OptimizationStrategy,
} from "@/types";
import {
  campaignTypeToFlows,
  flowToFormats,
  flowTypeLabels,
  campaignTypeLabels,
  campaignTypeEmojis,
} from "@/lib/campaignMappings";
import { IntegratedFormatGallery } from "./IntegratedFormatGallery";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import creatives from "@/fixtures/creatives.json";

type SetupSubStep = "flow" | "strategy" | "formats" | "budget";

interface CampaignSetupFlowProps {
  campaignType: CampaignType;
  onComplete: (data: {
    flow: FlowType;
    formats: FormatContent[];
    budget: number;
    optimizationStrategy?: OptimizationStrategy;
  }) => void;
  onBack: () => void;
}

const strategyLabels: Record<OptimizationStrategy, { label: string; description: string }> = {
  maximize_selection: {
    label: "Maximize Selection Rate",
    description: "Optimize for robots choosing your brand most often",
  },
  maximize_value: {
    label: "Maximize Value",
    description: "Optimize for highest revenue per decision",
  },
  balanced: {
    label: "Balanced",
    description: "Balance between selection rate and value",
  },
};

function getSetupSteps(type: CampaignType): SetupSubStep[] {
  const flows = campaignTypeToFlows[type];
  const hasMultipleFlows = flows.length > 1;
  const hasStrategy =
    type === CampaignType.DECISION_BID ||
    type === CampaignType.COMPARISON_PLACEMENT;

  const steps: SetupSubStep[] = [];
  if (hasMultipleFlows) steps.push("flow");
  if (hasStrategy) steps.push("strategy");
  steps.push("formats", "budget");
  return steps;
}

export function CampaignSetupFlow({
  campaignType,
  onComplete,
  onBack,
}: CampaignSetupFlowProps) {
  const steps = useMemo(() => getSetupSteps(campaignType), [campaignType]);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedFlow, setSelectedFlow] = useState<FlowType | null>(() => {
    const flows = campaignTypeToFlows[campaignType];
    return flows.length === 1 ? flows[0] : null;
  });
  const [selectedStrategy, setSelectedStrategy] = useState<OptimizationStrategy | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<FormatType[]>([]);
  const [budget, setBudget] = useState<number | null>(null);

  const currentStep = steps[stepIndex];
  const availableFlows = campaignTypeToFlows[campaignType];
  const availableFormats = flowToFormats[campaignType];

  function handleNext() {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  }

  function handleBack() {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    } else {
      onBack();
    }
  }

  function handleFinish() {
    if (!selectedFlow || selectedFormats.length === 0 || !budget) return;
    const formats: FormatContent[] = selectedFormats.map((ft) => {
      const creative = (creatives as unknown as Record<string, FormatContent>)[ft];
      return { ...creative, type: ft };
    });
    onComplete({
      flow: selectedFlow,
      formats,
      budget,
      optimizationStrategy: selectedStrategy ?? undefined,
    });
  }

  function toggleFormat(fmt: FormatType) {
    setSelectedFormats((prev) =>
      prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt]
    );
  }

  const stepTitle: Record<SetupSubStep, string> = {
    flow: "Choose Influence Stage",
    strategy: "Choose Optimization Strategy",
    formats: "Select Ad Formats",
    budget: "Set Daily Budget",
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={handleBack}
          className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {stepIndex === 0 ? "Back to Campaign Education" : "Back"}
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
          {campaignTypeEmojis[campaignType]} {campaignTypeLabels[campaignType]} — Step {stepIndex + 1} of {steps.length}
        </p>
        <h2 className="text-lg font-semibold mb-4">{stepTitle[currentStep]}</h2>

        {/* Flow Selection */}
        {currentStep === "flow" && (
          <div className="space-y-2">
            {availableFlows.map((flow) => (
              <button
                key={flow}
                onClick={() => {
                  setSelectedFlow(flow);
                  handleNext();
                }}
                className={`w-full rounded-lg border p-4 text-left transition-colors hover:border-primary/40 ${
                  selectedFlow === flow ? "border-primary bg-primary/5" : ""
                }`}
              >
                <p className="text-sm font-semibold">{flowTypeLabels[flow]}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {flowDescriptions[flow]}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Strategy Selection */}
        {currentStep === "strategy" && (
          <div className="space-y-2">
            {(Object.keys(strategyLabels) as OptimizationStrategy[]).map((strat) => (
              <button
                key={strat}
                onClick={() => {
                  setSelectedStrategy(strat);
                  handleNext();
                }}
                className={`w-full rounded-lg border p-4 text-left transition-colors hover:border-primary/40 ${
                  selectedStrategy === strat ? "border-primary bg-primary/5" : ""
                }`}
              >
                <p className="text-sm font-semibold">
                  {strategyLabels[strat].label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {strategyLabels[strat].description}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Format Selection */}
        {currentStep === "formats" && (
          <div>
            <IntegratedFormatGallery
              availableFormats={availableFormats}
              selectedFormats={selectedFormats}
              onToggle={toggleFormat}
            />
            <Button
              className="w-full mt-4"
              disabled={selectedFormats.length === 0}
              onClick={handleNext}
            >
              Continue with {selectedFormats.length} format{selectedFormats.length !== 1 ? "s" : ""}
            </Button>
          </div>
        )}

        {/* Budget Selection */}
        {currentStep === "budget" && (
          <div className="space-y-2">
            {[10000, 15000, 25000, 50000].map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setBudget(amount);
                }}
                className={`w-full rounded-lg border p-4 text-left transition-colors hover:border-primary/40 ${
                  budget === amount ? "border-primary bg-primary/5" : ""
                }`}
              >
                <p className="text-sm font-semibold">${(amount / 1000).toFixed(0)}K / day</p>
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

const flowDescriptions: Record<FlowType, string> = {
  [FlowType.PRE_DECISION]:
    "Influence robots before they begin ranking options. Your brand enters the consideration set early.",
  [FlowType.COMPARISON_STAGE]:
    "Stand out during side-by-side comparisons. Your brand gets visual prominence when robots weigh alternatives.",
  [FlowType.POST_DECISION]:
    "Reinforce your brand after the robot has made a selection. Builds long-term preference.",
  [FlowType.CONTEXTUAL_TRIGGER]:
    "Activate when specific contexts are detected — inventory alerts, route planning, or environmental signals.",
};
