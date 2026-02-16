"use client";

import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { FormatType, RobotType, FormatContent, CreativeStatus } from "@/types";
import { useStore } from "@/store";
import { formatTypeLabels } from "@/lib/campaignMappings";
import { formatToRobotCompatibility } from "@/lib/creativeMappings";
import { validateCreative } from "@/lib/validationEngine";
import { FormatSelector } from "./FormatSelector";
import { RobotCompatibilitySelector } from "./RobotCompatibilitySelector";
import { Button } from "@/components/ui/button";
import templates from "@/fixtures/creative-templates.json";

type GenerateStep = "format" | "robot" | "tone" | "offer" | "result";
type BrandTone = "professional" | "friendly" | "bold" | "playful";

const TONES: { value: BrandTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "bold", label: "Bold" },
  { value: "playful", label: "Playful" },
];

interface AIGenerateProps {
  onComplete: () => void;
}

export function AIGenerate({ onComplete }: AIGenerateProps) {
  const addCreative = useStore((s) => s.addCreative);
  const addValidationLog = useStore((s) => s.addValidationLog);

  const [step, setStep] = useState<GenerateStep>("format");
  const [selectedFormat, setSelectedFormat] = useState<FormatType | null>(null);
  const [selectedRobots, setSelectedRobots] = useState<RobotType[]>([]);
  const [selectedTone, setSelectedTone] = useState<BrandTone | null>(null);
  const [brandName, setBrandName] = useState("");
  const [offerDetail, setOfferDetail] = useState("");
  const [generatedContent, setGeneratedContent] = useState<Partial<FormatContent> | null>(null);

  const allSteps: GenerateStep[] = ["format", "robot", "tone", "offer", "result"];
  const stepIndex = allSteps.indexOf(step);

  const handleFormatSelect = (fmt: FormatType) => {
    setSelectedFormat(fmt);
    const compatible = formatToRobotCompatibility[fmt];
    setSelectedRobots(compatible.length === 1 ? [compatible[0]] : []);
    setStep("robot");
  };

  const handleGenerate = () => {
    if (!selectedFormat || !selectedTone || !brandName) return;

    const formatTemplates = (templates as Record<string, Record<string, Record<string, string>[]>>)[selectedFormat];
    if (!formatTemplates) return;

    const toneTemplates = formatTemplates[selectedTone];
    if (!toneTemplates || toneTemplates.length === 0) return;

    // Deterministic: pick first template
    const template = toneTemplates[0];
    const filled: Partial<FormatContent> = { type: selectedFormat };

    for (const [key, val] of Object.entries(template)) {
      const replaced = val
        .replace(/\{\{brand\}\}/g, brandName)
        .replace(/\{\{offer\}\}/g, offerDetail || "a special offer");
      (filled as Record<string, string>)[key] = replaced;
    }

    setGeneratedContent(filled);
    setStep("result");
  };

  const handleSave = () => {
    if (!selectedFormat || !generatedContent) return;

    const creative = {
      id: `cr-${Date.now()}`,
      name: `AI: ${formatTypeLabels[selectedFormat]} — ${brandName}`,
      formatType: selectedFormat,
      robotTypes: selectedRobots,
      status: CreativeStatus.DRAFT as CreativeStatus,
      content: { ...generatedContent, type: selectedFormat } as FormatContent,
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

  const updateGeneratedField = (key: string, val: string) => {
    if (!generatedContent) return;
    setGeneratedContent({ ...generatedContent, [key]: val });
  };

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => {
            if (stepIndex > 0) setStep(allSteps[stepIndex - 1]);
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
          {allSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Format */}
        {step === "format" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Select Ad Format</h2>
            <FormatSelector onSelect={handleFormatSelect} selected={selectedFormat} />
          </div>
        )}

        {/* Step 2: Robot */}
        {step === "robot" && selectedFormat && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Select Robot Types</h2>
            <RobotCompatibilitySelector
              formatType={selectedFormat}
              selected={selectedRobots}
              onChange={setSelectedRobots}
            />
            <Button
              className="w-full mt-4"
              disabled={selectedRobots.length === 0}
              onClick={() => setStep("tone")}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 3: Tone */}
        {step === "tone" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Select Brand Tone</h2>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => {
                    setSelectedTone(t.value);
                    setStep("offer");
                  }}
                  className={`rounded-lg border p-4 text-left transition-colors hover:border-primary/30 ${
                    selectedTone === t.value ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <p className="text-sm font-semibold">{t.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Offer */}
        {step === "offer" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Enter Offer Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Brand Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Acme Coffee"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Offer Detail</label>
                <input
                  type="text"
                  value={offerDetail}
                  onChange={(e) => setOfferDetail(e.target.value)}
                  placeholder="e.g. 20% off your first order"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
              <Button
                className="w-full"
                disabled={!brandName.trim()}
                onClick={handleGenerate}
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                Generate Creative
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Result */}
        {step === "result" && generatedContent && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Generated Creative</h2>
            <div className="space-y-3 rounded-lg border p-4">
              {generatedContent.headline != null && (
                <div>
                  <label className="text-xs font-medium mb-1 block">Headline</label>
                  <input
                    type="text"
                    value={generatedContent.headline}
                    onChange={(e) => updateGeneratedField("headline", e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
              )}
              {generatedContent.body != null && (
                <div>
                  <label className="text-xs font-medium mb-1 block">Body</label>
                  <textarea
                    value={generatedContent.body}
                    onChange={(e) => updateGeneratedField("body", e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
                    rows={2}
                  />
                </div>
              )}
              {generatedContent.cta != null && (
                <div>
                  <label className="text-xs font-medium mb-1 block">CTA</label>
                  <input
                    type="text"
                    value={generatedContent.cta}
                    onChange={(e) => updateGeneratedField("cta", e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
              )}
              {generatedContent.voiceScript != null && (
                <div>
                  <label className="text-xs font-medium mb-1 block">Voice Script</label>
                  <textarea
                    value={generatedContent.voiceScript}
                    onChange={(e) => updateGeneratedField("voiceScript", e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
                    rows={3}
                  />
                </div>
              )}
              {generatedContent.badgeText != null && (
                <div>
                  <label className="text-xs font-medium mb-1 block">Badge Text</label>
                  <input
                    type="text"
                    value={generatedContent.badgeText}
                    onChange={(e) => updateGeneratedField("badgeText", e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
              )}
              {generatedContent.alertText != null && (
                <div>
                  <label className="text-xs font-medium mb-1 block">Alert Text</label>
                  <textarea
                    value={generatedContent.alertText}
                    onChange={(e) => updateGeneratedField("alertText", e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
                    rows={2}
                  />
                </div>
              )}
              {generatedContent.pinLabel != null && (
                <div>
                  <label className="text-xs font-medium mb-1 block">Pin Label</label>
                  <input
                    type="text"
                    value={generatedContent.pinLabel}
                    onChange={(e) => updateGeneratedField("pinLabel", e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
              )}
              {generatedContent.dialogueLine != null && (
                <div>
                  <label className="text-xs font-medium mb-1 block">Dialogue Line</label>
                  <textarea
                    value={generatedContent.dialogueLine}
                    onChange={(e) => updateGeneratedField("dialogueLine", e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
                    rows={2}
                  />
                </div>
              )}
              {generatedContent.gestureName != null && (
                <div>
                  <label className="text-xs font-medium mb-1 block">Gesture</label>
                  <input
                    type="text"
                    value={generatedContent.gestureName}
                    onChange={(e) => updateGeneratedField("gestureName", e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
              )}
              {generatedContent.gestureContext != null && (
                <div>
                  <label className="text-xs font-medium mb-1 block">Gesture Context</label>
                  <input
                    type="text"
                    value={generatedContent.gestureContext}
                    onChange={(e) => updateGeneratedField("gestureContext", e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>
            <Button className="w-full mt-4" onClick={handleSave}>
              Save & Validate Creative
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
