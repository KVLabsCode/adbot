"use client";

import { useState, useCallback } from "react";
import {
  CampaignType,
  FlowType,
  FormatContent,
  RobotType,
} from "@/types";
import { useStore } from "@/store";
import {
  campaignTypeLabels,
  campaignTypeToFlows,
  robotTypeLabels,
} from "@/lib/campaignMappings";
import { executeAction } from "@/lib/actionRegistry";
import { RobotTypeSelector } from "./RobotTypeSelector";
import { SubtypeEducation } from "./SubtypeEducation";
import { SubtypeStrategyConfig } from "./SubtypeStrategyConfig";
import { CampaignReview } from "./CampaignReview";

type LaunchStep =
  | "robot-type"
  | "subtype-education"
  | "config"
  | "review";

interface ConfigResult {
  formats: FormatContent[];
  strategyConfig: Record<string, unknown>;
  budget: number;
}

export function LaunchFlow({ onClose }: { onClose: () => void }) {
  const setLaunchFlowStep = useStore((s) => s.setLaunchFlowStep);

  const [step, setStep] = useState<LaunchStep>("robot-type");
  const [selectedRobotType, setSelectedRobotType] = useState<RobotType | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<CampaignType | null>(null);
  const [configResult, setConfigResult] = useState<ConfigResult | null>(null);

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
    setStep("review");
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

    // Launch via action registry
    executeAction("LAUNCH_CAMPAIGN", {});

    // Close flow
    setLaunchFlowStep(null);
    onClose();
  }, [selectedRobotType, selectedSubtype, configResult, setLaunchFlowStep, onClose]);

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

      {step === "review" && selectedRobotType && selectedSubtype && configResult && (
        <CampaignReview
          robotType={selectedRobotType}
          campaignType={selectedSubtype}
          flow={campaignTypeToFlows[selectedSubtype][0]}
          formats={configResult.formats}
          budget={configResult.budget}
          strategyConfig={configResult.strategyConfig}
          onLaunch={handleLaunch}
          onBack={() => setStep("config")}
        />
      )}
    </div>
  );
}
