"use client";

import { useState, useCallback } from "react";
import {
  CampaignType,
  FlowType,
  FormatContent,
  RobotType,
  CreativeStatus,
} from "@/types";
import { useStore } from "@/store";
import {
  campaignTypeLabels,
  campaignTypeToFlows,
  robotTypeLabels,
  formatTypeLabels,
} from "@/lib/campaignMappings";
import { executeAction } from "@/lib/actionRegistry";
import { useDemoMode } from "@/lib/supabase/hooks";
import { RobotTypeSelector } from "./RobotTypeSelector";
import { SubtypeEducation } from "./SubtypeEducation";
import { SubtypeStrategyConfig } from "./SubtypeStrategyConfig";
import { CampaignReview } from "./CampaignReview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Image, Film } from "lucide-react";

type LaunchStep =
  | "robot-type"
  | "subtype-education"
  | "config"
  | "creative-select"
  | "review";

interface ConfigResult {
  formats: FormatContent[];
  strategyConfig: Record<string, unknown>;
  budget: number;
}

export function LaunchFlow({ onClose }: { onClose: () => void }) {
  const setLaunchFlowStep = useStore((s) => s.setLaunchFlowStep);
  const creatives = useStore((s) => s.creatives);
  const { isDemoMode } = useDemoMode();
  const isLiveMode = isDemoMode === false;

  const [step, setStep] = useState<LaunchStep>("robot-type");
  const [selectedRobotType, setSelectedRobotType] = useState<RobotType | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<CampaignType | null>(null);
  const [configResult, setConfigResult] = useState<ConfigResult | null>(null);
  const [selectedCreativeIds, setSelectedCreativeIds] = useState<string[]>([]);

  const eligibleCreatives = creatives.filter(
    (c) => c.status === CreativeStatus.VALIDATED || c.status === CreativeStatus.LIVE
  );

  const handleSelectRobotType = useCallback((rt: RobotType) => {
    setSelectedRobotType(rt);
    setStep("subtype-education");
  }, []);

  const handleSelectSubtype = useCallback((subtype: CampaignType) => {
    setSelectedSubtype(subtype);
    setStep("config");
  }, []);

  const handleConfigComplete = useCallback((result: ConfigResult) => {
    setConfigResult(result);
    if (isLiveMode) {
      setStep("creative-select");
    } else {
      setStep("review");
    }
  }, [isLiveMode]);

  const toggleCreative = useCallback((id: string) => {
    setSelectedCreativeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleLaunch = useCallback(() => {
    if (!selectedRobotType || !selectedSubtype || !configResult) return;

    const store = useStore.getState();
    const name = `${robotTypeLabels[selectedRobotType]} — ${campaignTypeLabels[selectedSubtype]}`;
    const flows = campaignTypeToFlows[selectedSubtype];
    const flow: FlowType = flows[0];

    // Build draft
    store.createDraft(selectedSubtype, name, selectedRobotType);
    store.setDraftFlow(flow);
    for (const format of configResult.formats) {
      store.addDraftFormat(format);
    }
    store.setDraftBudget(configResult.budget);
    store.setDraftStrategyConfig(configResult.strategyConfig);
    if (selectedCreativeIds.length > 0) {
      store.setDraftCreativeIds(selectedCreativeIds);
    }

    // Launch via action registry
    executeAction("LAUNCH_CAMPAIGN", {});

    // Close flow
    setLaunchFlowStep(null);
    onClose();
  }, [selectedRobotType, selectedSubtype, configResult, selectedCreativeIds, setLaunchFlowStep, onClose]);

  const handleClose = useCallback(() => {
    setLaunchFlowStep(null);
    onClose();
  }, [setLaunchFlowStep, onClose]);

  return (
    <div className="flex h-full flex-col">
      {step === "robot-type" && (
        <RobotTypeSelector
          onSelect={handleSelectRobotType}
          onBack={handleClose}
        />
      )}

      {step === "subtype-education" && selectedRobotType && (
        <SubtypeEducation
          robotType={selectedRobotType}
          onSelect={handleSelectSubtype}
          onBack={() => setStep("robot-type")}
        />
      )}

      {step === "config" && selectedSubtype && (
        <SubtypeStrategyConfig
          subtype={selectedSubtype}
          onComplete={handleConfigComplete}
          onBack={() => setStep("subtype-education")}
        />
      )}

      {step === "creative-select" && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setStep("config")}
              className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Strategy
            </button>

            <h2 className="text-lg font-semibold mb-1">Select Creatives</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Choose one or more validated creatives to include in this campaign.
            </p>

            {eligibleCreatives.length === 0 ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 text-center">
                <p className="text-sm font-medium text-amber-600 mb-1">
                  No validated creatives found
                </p>
                <p className="text-xs text-muted-foreground">
                  Create and validate a creative with an uploaded media file first.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {eligibleCreatives.map((creative) => {
                  const isSelected = selectedCreativeIds.includes(creative.id);
                  return (
                    <button
                      key={creative.id}
                      onClick={() => toggleCreative(creative.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30 hover:bg-accent/50"
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{creative.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatTypeLabels[creative.formatType]}
                        </p>
                      </div>
                      {creative.mediaType && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          {creative.mediaType === "video" ? (
                            <Film className="h-3 w-3" />
                          ) : (
                            <Image className="h-3 w-3" />
                          )}
                          {creative.mediaType}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <Button
              className="w-full mt-4"
              disabled={selectedCreativeIds.length === 0}
              onClick={() => setStep("review")}
            >
              Continue with {selectedCreativeIds.length} creative
              {selectedCreativeIds.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      )}

      {step === "review" && selectedRobotType && selectedSubtype && configResult && (
        <CampaignReview
          robotType={selectedRobotType}
          campaignType={selectedSubtype}
          flow={campaignTypeToFlows[selectedSubtype][0]}
          formats={configResult.formats}
          budget={configResult.budget}
          strategyConfig={configResult.strategyConfig}
          creativeIds={selectedCreativeIds}
          isDemoMode={isDemoMode !== false}
          onLaunch={handleLaunch}
          onBack={() => setStep(isLiveMode ? "creative-select" : "config")}
        />
      )}
    </div>
  );
}
