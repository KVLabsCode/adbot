"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { FormatType, RobotType, FormatContent, CreativeStatus } from "@/types";
import { useStore } from "@/store";
import { formatTypeLabels } from "@/lib/campaignMappings";
import { formatToRobotCompatibility } from "@/lib/creativeMappings";
import { validateCreative } from "@/lib/validationEngine";
import { FormatSelector } from "./FormatSelector";
import { RobotCompatibilitySelector } from "./RobotCompatibilitySelector";
import { DisplayCardBuilder } from "./builders/DisplayCardBuilder";
import { VoicePromptBuilder } from "./builders/VoicePromptBuilder";
import { HighlightBadgeBuilder } from "./builders/HighlightBadgeBuilder";
import { RestockBannerBuilder } from "./builders/RestockBannerBuilder";
import { RoutePinBuilder } from "./builders/RoutePinBuilder";
import { DialogueScriptBuilder } from "./builders/DialogueScriptBuilder";
import { GestureCueBuilder } from "./builders/GestureCueBuilder";
import { Button } from "@/components/ui/button";

type FlowStep = "format-select" | "robot-select" | "builder";

interface CreateNewFlowProps {
  onComplete: () => void;
}

export function CreateNewFlow({ onComplete }: CreateNewFlowProps) {
  const addCreative = useStore((s) => s.addCreative);
  const addValidationLog = useStore((s) => s.addValidationLog);

  const [step, setStep] = useState<FlowStep>("format-select");
  const [selectedFormat, setSelectedFormat] = useState<FormatType | null>(null);
  const [selectedRobots, setSelectedRobots] = useState<RobotType[]>([]);
  const [content, setContent] = useState<Partial<FormatContent>>({});

  const steps: FlowStep[] = ["format-select", "robot-select", "builder"];
  const stepIndex = steps.indexOf(step);

  const handleFormatSelect = (fmt: FormatType) => {
    setSelectedFormat(fmt);
    const compatible = formatToRobotCompatibility[fmt];
    setSelectedRobots(compatible.length === 1 ? [compatible[0]] : []);
    setContent({ type: fmt });
    setStep("robot-select");
  };

  const handleRobotContinue = () => {
    if (selectedRobots.length === 0) return;
    setStep("builder");
  };

  const handleSave = () => {
    if (!selectedFormat) return;

    const creative = {
      id: `cr-${Date.now()}`,
      name: `${formatTypeLabels[selectedFormat]} Creative`,
      formatType: selectedFormat,
      robotTypes: selectedRobots,
      status: CreativeStatus.DRAFT,
      content: { ...content, type: selectedFormat } as FormatContent,
      validationResults: [] as ReturnType<typeof validateCreative>,
      lastModified: new Date().toISOString(),
    };

    const results = validateCreative(creative);
    const allPassed = results.every((r) => r.passed);
    creative.status = allPassed ? CreativeStatus.VALIDATED : CreativeStatus.NEEDS_CORRECTION;
    creative.validationResults = results;

    addCreative(creative);

    addValidationLog({
      id: `vlog-${Date.now()}`,
      creativeId: creative.id,
      creativeName: creative.name,
      formatType: creative.formatType,
      timestamp: new Date().toISOString(),
      passed: allPassed,
      results,
    });

    onComplete();
  };

  const renderBuilder = () => {
    if (!selectedFormat) return null;
    const props = {
      value: content,
      onChange: setContent,
      robotTypes: selectedRobots,
    };

    switch (selectedFormat) {
      case FormatType.DISPLAY_CARD:
        return <DisplayCardBuilder {...props} />;
      case FormatType.VOICE_PROMPT:
        return <VoicePromptBuilder {...props} />;
      case FormatType.HIGHLIGHT_BADGE:
        return <HighlightBadgeBuilder {...props} />;
      case FormatType.RESTOCK_ALERT_BANNER:
        return <RestockBannerBuilder {...props} />;
      case FormatType.ROUTE_PIN:
        return <RoutePinBuilder {...props} />;
      case FormatType.HUMANOID_DIALOGUE_SCRIPT:
        return <DialogueScriptBuilder {...props} />;
      case FormatType.GESTURE_CUE:
        return <GestureCueBuilder {...props} />;
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => {
            if (stepIndex > 0) setStep(steps[stepIndex - 1]);
          }}
          className={`mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ${
            stepIndex === 0 ? "invisible" : ""
          }`}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wide">
          Step {stepIndex + 1} of {steps.length}
        </p>

        {/* Step 1: Format Selection */}
        {step === "format-select" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Select Ad Format</h2>
            <FormatSelector onSelect={handleFormatSelect} selected={selectedFormat} />
          </div>
        )}

        {/* Step 2: Robot Selection */}
        {step === "robot-select" && selectedFormat && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Select Robot Compatibility</h2>
            <RobotCompatibilitySelector
              formatType={selectedFormat}
              selected={selectedRobots}
              onChange={setSelectedRobots}
            />
            <Button
              className="w-full mt-4"
              disabled={selectedRobots.length === 0}
              onClick={handleRobotContinue}
            >
              Continue with {selectedRobots.length} robot type
              {selectedRobots.length !== 1 ? "s" : ""}
            </Button>
          </div>
        )}

        {/* Step 3: Builder */}
        {step === "builder" && selectedFormat && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Build {formatTypeLabels[selectedFormat]}
            </h2>
            {renderBuilder()}
            <Button className="w-full mt-4" onClick={handleSave}>
              Save & Validate Creative
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
