"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import {
  RobotCategory,
  BiddingModel,
  TimeWindow,
  type WizardStep,
  type CampaignSchedule,
  type Creative,
  type Campaign,
} from "@/types";
import {
  robotCategoryInfo,
  getOemsByCategory,
  getMomentsByCategory,
  getOemById,
  getMomentById,
} from "@/fixtures/oem-partners";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Bot,
  Truck,
  Store,
  Calendar,
  DollarSign,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Rocket,
  Image,
  Clock,
  Zap,
  Eye,
  AlertCircle,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_LABELS: Record<WizardStep, string> = {
  1: "Robot Type",
  2: "OEM & Moment",
  3: "Creatives",
  4: "Budget & Schedule",
  5: "Review & Launch",
};

const CATEGORY_ICONS: Record<RobotCategory, typeof Bot> = {
  [RobotCategory.HUMANOID]: Bot,
  [RobotCategory.DELIVERY_LOGISTICS]: Truck,
  [RobotCategory.SERVICE_RETAIL]: Store,
};

const TIME_WINDOW_OPTIONS: { id: TimeWindow; label: string; hours: string }[] = [
  { id: TimeWindow.MORNING, label: "Morning", hours: "6am - 11am" },
  { id: TimeWindow.LUNCH_RUSH, label: "Lunch", hours: "11am - 2pm" },
  { id: TimeWindow.AFTERNOON, label: "Afternoon", hours: "2pm - 5pm" },
  { id: TimeWindow.EVENING, label: "Evening", hours: "5pm - 10pm" },
];

const DEFAULT_BIDDING: Record<RobotCategory, BiddingModel> = {
  [RobotCategory.HUMANOID]: BiddingModel.CPE,
  [RobotCategory.DELIVERY_LOGISTICS]: BiddingModel.CPM,
  [RobotCategory.SERVICE_RETAIL]: BiddingModel.CPM,
};

const CATEGORY_IMAGES: Record<RobotCategory, { src: string; bg: string }> = {
  [RobotCategory.HUMANOID]: {
    src: "/robots/humanoid.svg",
    bg: "bg-[#F4F3FE]",
  },
  [RobotCategory.DELIVERY_LOGISTICS]: {
    src: "/robots/delivery.svg",
    bg: "bg-[#EAF7F2]",
  },
  [RobotCategory.SERVICE_RETAIL]: {
    src: "/robots/service.svg",
    bg: "bg-[#FDF6EE]",
  },
};

// ─── Step Bar ─────────────────────────────────────────────────────────────────

function StepBar({ current }: { current: WizardStep }) {
  const progressPercent = ((current - 1) / 4) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-3">
        {([1, 2, 3, 4, 5] as WizardStep[]).map((step) => {
          const isComplete = current > step;
          const isCurrent = current === step;
          return (
            <div key={step} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isComplete
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/40"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  step
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  isCurrent
                    ? "text-foreground"
                    : isComplete
                      ? "text-emerald-400"
                      : "text-muted-foreground"
                }`}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>
      <Progress value={progressPercent} className="h-1.5" />
    </div>
  );
}

// ─── Step 1: Robot Type ───────────────────────────────────────────────────────

function StepRobotType({
  selected,
  onSelect,
}: {
  selected: RobotCategory | undefined;
  onSelect: (cat: RobotCategory) => void;
}) {
  const categories = [
    RobotCategory.HUMANOID,
    RobotCategory.DELIVERY_LOGISTICS,
    RobotCategory.SERVICE_RETAIL,
  ] as const;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Choose Robot Type</h2>
      <p className="text-muted-foreground mb-6">
        Select the category of robot fleet your ads will run on.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const info = robotCategoryInfo[cat];
          const Icon = CATEGORY_ICONS[cat];
          const isSelected = selected === cat;
          const isHumanoid = cat === RobotCategory.HUMANOID;

          const { src, bg } = CATEGORY_IMAGES[cat];

          return (
            <Card
              key={cat}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(cat)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(cat);
                }
              }}
              className={`cursor-pointer transition-all hover:border-primary/50 overflow-hidden p-0 ${
                isSelected
                  ? "ring-2 ring-primary border-primary"
                  : "border-border"
              } ${isHumanoid ? "relative" : ""}`}
            >
              {isHumanoid && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="default" className="bg-emerald-600 text-white text-[10px]">
                    Premium
                  </Badge>
                </div>
              )}
              <div className={`aspect-[4/3] overflow-hidden ${bg} relative`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${info.label} robot`}
                  className="h-full w-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center">
                  <Icon className="h-16 w-16 opacity-30" />
                </div>
              </div>
              <CardHeader className="px-5 pt-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                      isHumanoid
                        ? "bg-emerald-600/20 text-emerald-400"
                        : cat === RobotCategory.DELIVERY_LOGISTICS
                          ? "bg-blue-600/20 text-blue-400"
                          : "bg-purple-600/20 text-purple-400"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{info.label}</CardTitle>
                    <CardDescription className="text-xs">{info.tagline}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm px-5 pb-5">
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wide font-medium">
                    Ad Surfaces
                  </span>
                  <p className="text-foreground mt-0.5">{info.surfaces}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wide font-medium">
                      Bidding
                    </span>
                    <p className="text-foreground mt-0.5">{info.bidding}</p>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    {info.indicativeRate}
                  </Badge>
                </div>
                <Separator />
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wide font-medium">
                    Example
                  </span>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    {info.exampleUseCase}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2: OEM & Moment ─────────────────────────────────────────────────────

function StepOemMoment({
  robotCategory,
  selectedOem,
  selectedMoment,
  onSelectOem,
  onSelectMoment,
}: {
  robotCategory: RobotCategory;
  selectedOem: string | undefined;
  selectedMoment: string | undefined;
  onSelectOem: (id: string) => void;
  onSelectMoment: (id: string) => void;
}) {
  const oems = getOemsByCategory(robotCategory);
  const moments = getMomentsByCategory(robotCategory);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Select OEM & Placement Moment</h2>
      <p className="text-muted-foreground mb-6">
        Choose the robot manufacturer and when your ad appears.
      </p>

      {/* OEM Selection */}
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        OEM Partner
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {oems.map((oem) => {
          const isSelected = selectedOem === oem.id;
          return (
            <Card
              key={oem.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectOem(oem.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectOem(oem.id);
                }
              }}
              className={`cursor-pointer transition-all hover:border-primary/50 py-4 ${
                isSelected
                  ? "ring-2 ring-primary border-primary"
                  : "border-border"
              }`}
            >
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{oem.name}</CardTitle>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {oem.displayAspectRatio}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mt-1">{oem.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {oem.models.map((model) => (
                    <Badge key={model} variant="secondary" className="text-[10px]">
                      {model}
                    </Badge>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {oem.environments.map((env) => (
                    <span key={env} className="text-[10px] text-muted-foreground">
                      {env}
                      {oem.environments.indexOf(env) < oem.environments.length - 1 ? " · " : ""}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Placement Moment */}
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        Placement Moment
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {moments.map((moment) => {
          const isSelected = selectedMoment === moment.id;
          return (
            <Card
              key={moment.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectMoment(moment.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectMoment(moment.id);
                }
              }}
              className={`cursor-pointer transition-all hover:border-primary/50 py-4 ${
                isSelected
                  ? "ring-2 ring-primary border-primary"
                  : "border-border"
              }`}
            >
              <CardContent className="pt-0">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{moment.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {moment.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 3: Creative Selection ───────────────────────────────────────────────

function StepCreatives({
  robotCategory,
  selectedIds,
  onToggle,
}: {
  robotCategory: RobotCategory;
  selectedIds: string[];
  onToggle: (ids: string[]) => void;
}) {
  const creatives = useStore((s) => s.creatives);
  const filtered = useMemo(
    () => creatives.filter((c) => c.robotCategory === robotCategory),
    [creatives, robotCategory],
  );

  const handleToggle = useCallback(
    (id: string) => {
      if (selectedIds.includes(id)) {
        onToggle(selectedIds.filter((sid) => sid !== id));
      } else {
        onToggle([...selectedIds, id]);
      }
    },
    [selectedIds, onToggle],
  );

  if (filtered.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-1">Select Creatives</h2>
        <p className="text-muted-foreground mb-6">
          Attach creatives to this campaign.
        </p>
        <Card className="py-16">
          <CardContent className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Image className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No matching creatives</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              You don&apos;t have any creatives for{" "}
              {robotCategoryInfo[robotCategory].label} yet. Head to the Creatives
              page to create some first, then come back here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Select Creatives</h2>
      <p className="text-muted-foreground mb-6">
        Choose one or more creatives to attach. Showing{" "}
        <span className="text-foreground font-medium">{filtered.length}</span>{" "}
        creatives for {robotCategoryInfo[robotCategory].label}.
      </p>

      <div className="space-y-2">
        {filtered.map((creative: Creative) => {
          const isSelected = selectedIds.includes(creative.id);
          return (
            <Card
              key={creative.id}
              role="button"
              tabIndex={0}
              onClick={() => handleToggle(creative.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleToggle(creative.id);
                }
              }}
              className={`cursor-pointer transition-all hover:border-primary/50 py-3 ${
                isSelected
                  ? "ring-2 ring-primary border-primary"
                  : "border-border"
              }`}
            >
              <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{creative.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {creative.formatType.replace(/_/g, " ")}
                    </p>
                  </div>

                  {/* Status badge */}
                  <Badge
                    variant={
                      creative.status === "validated" || creative.status === "live"
                        ? "default"
                        : creative.status === "needs_correction"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-[10px] capitalize"
                  >
                    {creative.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedIds.length > 0 && (
        <p className="text-sm text-muted-foreground mt-4">
          {selectedIds.length} creative{selectedIds.length > 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}

// ─── Step 4: Budget & Schedule ────────────────────────────────────────────────

function StepBudgetSchedule({
  robotCategory,
  budget,
  budgetType,
  schedule,
  onBudgetChange,
  onBudgetTypeChange,
  onScheduleChange,
}: {
  robotCategory: RobotCategory;
  budget: number | undefined;
  budgetType: "daily" | "total";
  schedule: CampaignSchedule | undefined;
  onBudgetChange: (value: number) => void;
  onBudgetTypeChange: (type: "daily" | "total") => void;
  onScheduleChange: (schedule: CampaignSchedule) => void;
}) {
  const currentSchedule: CampaignSchedule = schedule ?? {
    startDate: "",
    endDate: "",
    timeWindows: [],
  };

  const toggleTimeWindow = (tw: TimeWindow) => {
    const current = currentSchedule.timeWindows ?? [];
    const next = current.includes(tw)
      ? current.filter((t) => t !== tw)
      : [...current, tw];
    onScheduleChange({ ...currentSchedule, timeWindows: next });
  };

  // Estimate calculations
  const budgetVal = budget ?? 0;
  const isHumanoid = robotCategory === RobotCategory.HUMANOID;
  const rate = isHumanoid ? 25 : robotCategory === RobotCategory.SERVICE_RETAIL ? 12 : 8;
  const estimatedImpressions = isHumanoid
    ? 0
    : budgetVal > 0
      ? Math.round((budgetVal / rate) * 1000)
      : 0;
  const estimatedEngagements = isHumanoid
    ? budgetVal > 0
      ? Math.round(budgetVal / rate)
      : 0
    : Math.round(estimatedImpressions * 0.032);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Budget & Schedule</h2>
      <p className="text-muted-foreground mb-6">
        Set your spend and campaign dates.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                Budget
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onBudgetTypeChange("daily")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    budgetType === "daily"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Daily
                </button>
                <button
                  type="button"
                  onClick={() => onBudgetTypeChange("total")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    budgetType === "total"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Total
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <Input
                  type="number"
                  min={0}
                  step={100}
                  placeholder="e.g. 5000"
                  value={budget ?? ""}
                  onChange={(e) => onBudgetChange(Number(e.target.value))}
                  className="pl-7"
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-400" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={currentSchedule.startDate}
                    onChange={(e) =>
                      onScheduleChange({ ...currentSchedule, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={currentSchedule.endDate}
                    onChange={(e) =>
                      onScheduleChange({ ...currentSchedule, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <Separator />
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Time-of-Day Targeting (optional)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIME_WINDOW_OPTIONS.map((tw) => {
                    const isActive = currentSchedule.timeWindows?.includes(tw.id) ?? false;
                    return (
                      <button
                        key={tw.id}
                        type="button"
                        onClick={() => toggleTimeWindow(tw.id)}
                        className={`py-2 px-3 rounded-lg text-xs border transition-all text-center ${
                          isActive
                            ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        <span className="font-medium block">{tw.label}</span>
                        <span className="text-[10px] text-muted-foreground">{tw.hours}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Estimate Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 border-dashed">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                Live Estimate
              </CardTitle>
              <CardDescription>Based on your budget and model</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {budgetVal > 0 ? (
                <>
                  {!isHumanoid && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Est. Impressions
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {estimatedImpressions.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Est. Engagements
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {estimatedEngagements.toLocaleString()}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Rate
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      ${rate.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Budget ({budgetType})
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      ${budgetVal.toLocaleString()}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <DollarSign className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Enter a budget to see estimates
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Review & Launch ──────────────────────────────────────────────────

function StepReview({
  draft,
  campaignName,
  onNameChange,
  onSubmit,
  submitted,
  submittedCampaign,
}: {
  draft: NonNullable<ReturnType<typeof useStore.getState>["campaignDraft"]>;
  campaignName: string;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
  submitted: boolean;
  submittedCampaign: Campaign | null;
}) {
  const creatives = useStore((s) => s.creatives);

  const oem = draft.oemId ? getOemById(draft.oemId) : undefined;
  const moment = draft.placementMomentId ? getMomentById(draft.placementMomentId) : undefined;
  const catInfo = draft.robotCategory ? robotCategoryInfo[draft.robotCategory] : undefined;
  const selectedCreatives = creatives.filter((c) => draft.creativeIds.includes(c.id));

  if (submitted) {
    return null; // Handled by parent CreatePage via SuccessPage
  }

  if (false as boolean) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center overflow-hidden">
        <style>{`
          @keyframes robotEntrance {
            0% { opacity: 0; transform: scale(0.3) rotate(-10deg); }
            50% { opacity: 1; transform: scale(1.1) rotate(2deg); }
            70% { transform: scale(0.95) rotate(-1deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          @keyframes robotHover {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }
          @keyframes eyeGlow {
            0%, 100% { opacity: 1; filter: drop-shadow(0 0 4px #4f46e5); }
            50% { opacity: 0.5; filter: drop-shadow(0 0 8px #4f46e5); }
          }
          @keyframes chestScan {
            0% { transform: translateY(0); opacity: 0.6; }
            100% { transform: translateY(20px); opacity: 0; }
          }
          @keyframes armWave {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-15deg); }
            75% { transform: rotate(10deg); }
          }
          @keyframes confettiDrop {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(160px) rotate(720deg); opacity: 0; }
          }
          @keyframes confettiDrop2 {
            0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(180px) rotate(-540deg); opacity: 0; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.7); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes pulseRing {
            0% { transform: scale(1); opacity: 0.4; }
            100% { transform: scale(2.5); opacity: 0; }
          }
          @keyframes slideProgress {
            from { width: 0%; }
            to { width: 33%; }
          }
          @keyframes tickDraw {
            from { stroke-dashoffset: 40; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes headTilt {
            0%, 100% { transform: rotate(0deg); }
            30% { transform: rotate(3deg); }
            60% { transform: rotate(-2deg); }
          }
        `}</style>

        {/* Confetti particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-sm"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `-10px`,
                width: `${6 + Math.random() * 6}px`,
                height: `${6 + Math.random() * 6}px`,
                backgroundColor: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"][i % 6],
                animation: `${i % 2 === 0 ? "confettiDrop" : "confettiDrop2"} ${2 + Math.random() * 2}s ease-in ${Math.random() * 1.5}s both`,
                borderRadius: i % 3 === 0 ? "50%" : "2px",
              }}
            />
          ))}
        </div>

        {/* Robot with entrance + hover animation */}
        <div className="relative mb-6" style={{ animation: "robotEntrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}>
          {/* Pulse rings behind robot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-32 h-32 rounded-full border-2 border-emerald-500/30" style={{ animation: "pulseRing 2s ease-out infinite" }} />
            <div className="absolute w-32 h-32 rounded-full border-2 border-indigo-500/20" style={{ animation: "pulseRing 2s ease-out infinite 0.5s" }} />
            <div className="absolute w-32 h-32 rounded-full border-2 border-amber-500/20" style={{ animation: "pulseRing 2s ease-out infinite 1s" }} />
          </div>

          <div style={{ animation: "robotHover 3s ease-in-out infinite 0.8s" }}>
            <svg width="160" height="190" viewBox="0 0 160 190" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Antenna with signal */}
              <line x1="80" y1="10" x2="80" y2="30" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
              <circle cx="80" cy="7" r="5" fill="#818cf8" />
              {/* Signal arcs */}
              <path d="M72 4 Q66 0 72 -4" stroke="#818cf8" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
              <path d="M88 4 Q94 0 88 -4" stroke="#818cf8" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />

              {/* Head with tilt animation */}
              <g style={{ transformOrigin: "80px 50px", animation: "headTilt 4s ease-in-out infinite 1s" }}>
                <rect x="40" y="30" width="80" height="44" rx="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
                {/* Eyes */}
                <circle cx="58" cy="50" r="7" fill="#4f46e5" style={{ animation: "eyeGlow 2s ease-in-out infinite" }} />
                <circle cx="102" cy="50" r="7" fill="#4f46e5" style={{ animation: "eyeGlow 2s ease-in-out infinite 0.4s" }} />
                {/* Eye highlights */}
                <circle cx="56" cy="48" r="2.5" fill="white" opacity="0.8" />
                <circle cx="100" cy="48" r="2.5" fill="white" opacity="0.8" />
                {/* Happy mouth */}
                <path d="M66 62 Q80 72 94 62" stroke="#4f46e5" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </g>

              {/* Neck */}
              <rect x="68" y="74" width="24" height="10" rx="4" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Body */}
              <rect x="30" y="84" width="100" height="62" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />

              {/* Chest display with animated checkmark */}
              <rect x="50" y="94" width="60" height="40" rx="6" fill="#ecfdf5" stroke="#86efac" strokeWidth="1.5" />
              {/* Scan line */}
              <rect x="52" y="96" width="56" height="2" rx="1" fill="#4f46e5" opacity="0.3" style={{ animation: "chestScan 1.5s ease-in-out infinite" }} />
              {/* Checkmark with draw animation */}
              <path
                d="M64 115 L74 125 L96 102"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="40"
                style={{ animation: "tickDraw 0.6s ease-out 0.5s both" }}
              />

              {/* Left arm with wave */}
              <g style={{ transformOrigin: "28px 90px", animation: "armWave 2s ease-in-out infinite 1s" }}>
                <rect x="10" y="88" width="18" height="46" rx="9" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
                {/* Hand */}
                <circle cx="19" cy="138" r="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
              </g>

              {/* Right arm */}
              <rect x="132" y="88" width="18" height="46" rx="9" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
              <circle cx="141" cy="138" r="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Legs */}
              <rect x="46" y="146" width="22" height="28" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
              <rect x="92" y="146" width="22" height="28" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
              {/* Feet */}
              <rect x="42" y="170" width="30" height="10" rx="5" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.5" />
              <rect x="88" y="170" width="30" height="10" rx="5" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div style={{ animation: "fadeInUp 0.6s ease-out both 0.4s" }}>
          <h2 className="text-3xl font-bold mb-2">Campaign Submitted!</h2>
          <p className="text-lg text-muted-foreground">
            <span className="text-foreground font-bold">{submittedCampaign.name}</span>
          </p>
        </div>

        {/* Status Timeline */}
        <div style={{ animation: "fadeInUp 0.6s ease-out both 0.6s" }} className="my-8 w-full max-w-lg">
          {/* Progress bar */}
          <div className="h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ animation: "slideProgress 1s ease-out 0.8s both" }} />
          </div>

          <div className="flex items-start justify-between relative">
            {/* Step 1: Submitted */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-emerald-600">Submitted</span>
              <span className="text-[10px] text-muted-foreground">Just now</span>
            </div>

            {/* Step 2: OEM Review */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 border-2 border-amber-200">
                <Clock className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-amber-600">OEM Review</span>
              <span className="text-[10px] text-muted-foreground">Pending</span>
            </div>

            {/* Step 3: Go Live */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground border-2 border-border">
                <Rocket className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-muted-foreground">Go Live</span>
              <span className="text-[10px] text-muted-foreground">Upcoming</span>
            </div>
          </div>
        </div>

        {/* Campaign ID + estimate */}
        <div style={{ animation: "fadeInUp 0.6s ease-out both 0.8s" }} className="space-y-2 mb-8">
          <Badge variant="outline" className="font-[family-name:var(--font-geist-mono)] text-xs px-3 py-1">
            {submittedCampaign.id}
          </Badge>
          <p className="text-sm text-muted-foreground">Usually approved within 24 hours</p>
        </div>

        {/* Action buttons */}
        <div style={{ animation: "scaleIn 0.5s ease-out both 1s" }} className="flex items-center gap-3">
          <Button variant="outline" size="lg" onClick={() => router.push("/campaigns")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            View Campaigns
          </Button>
          <Button size="lg" onClick={() => initDraft()} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Rocket className="h-4 w-4" />
            Create Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Review & Launch</h2>
      <p className="text-muted-foreground mb-6">
        Confirm your campaign details and give it a name.
      </p>

      <div className="space-y-4">
        {/* Campaign Name */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary" />
              Campaign Name
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="e.g. Summer Promo — Humanoid Fleet"
              value={campaignName}
              onChange={(e) => onNameChange(e.target.value)}
              className="text-base"
            />
          </CardContent>
        </Card>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Robot Type */}
          <Card>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                Robot Type
              </p>
              <p className="font-semibold">{catInfo?.label ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{catInfo?.tagline}</p>
            </CardContent>
          </Card>

          {/* OEM */}
          <Card>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                OEM Partner
              </p>
              <p className="font-semibold">{oem?.name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">
                {oem?.models.join(", ")}
              </p>
            </CardContent>
          </Card>

          {/* Placement Moment */}
          <Card>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                Placement Moment
              </p>
              <p className="font-semibold">{moment?.label ?? "—"}</p>
              <p className="text-xs text-muted-foreground">
                {moment?.description}
              </p>
            </CardContent>
          </Card>

          {/* Budget */}
          <Card>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                Budget
              </p>
              <p className="font-semibold">
                ${(draft.budget ?? 0).toLocaleString()}{" "}
                <span className="text-muted-foreground font-normal text-sm">
                  ({draft.budgetType ?? "total"})
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {draft.robotCategory === RobotCategory.HUMANOID ? "CPE" : "CPM"}
              </p>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                Schedule
              </p>
              {draft.schedule?.startDate ? (
                <>
                  <p className="font-semibold">
                    {draft.schedule.startDate} &mdash; {draft.schedule.endDate || "Ongoing"}
                  </p>
                  {draft.schedule.timeWindows && draft.schedule.timeWindows.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {draft.schedule.timeWindows.map((tw) => (
                        <Badge key={tw} variant="secondary" className="text-[10px] capitalize">
                          {tw.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="font-semibold text-muted-foreground">Not set</p>
              )}
            </CardContent>
          </Card>

          {/* Creatives */}
          <Card>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                Creatives ({selectedCreatives.length})
              </p>
              {selectedCreatives.length > 0 ? (
                <div className="space-y-1">
                  {selectedCreatives.map((c) => (
                    <div key={c.id} className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {c.formatType.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No creatives selected</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button
            size="lg"
            onClick={onSubmit}
            disabled={!campaignName.trim()}
            className="gap-2"
          >
            <Rocket className="h-4 w-4" />
            Submit Campaign
          </Button>
        </div>
        {!campaignName.trim() && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
            <AlertCircle className="h-3 w-3" />
            Enter a campaign name to submit
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Success Page (post-submission) ───────────────────────────────────────────

function SuccessPage({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const initDraft = useStore((s) => s.initDraft);

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center overflow-hidden">
      <style>{`
        @keyframes robotEntrance {
          0% { opacity: 0; transform: scale(0.3) rotate(-10deg); }
          50% { opacity: 1; transform: scale(1.1) rotate(2deg); }
          70% { transform: scale(0.95) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes robotHover {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes eyeGlow {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 4px #4f46e5); }
          50% { opacity: 0.5; filter: drop-shadow(0 0 8px #4f46e5); }
        }
        @keyframes chestScan {
          0% { transform: translateY(0); opacity: 0.6; }
          100% { transform: translateY(20px); opacity: 0; }
        }
        @keyframes armWave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(10deg); }
        }
        @keyframes confettiDrop {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(160px) rotate(720deg); opacity: 0; }
        }
        @keyframes confettiDrop2 {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(180px) rotate(-540deg); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes slideProgress {
          from { width: 0%; }
          to { width: 33%; }
        }
        @keyframes tickDraw {
          from { stroke-dashoffset: 40; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes headTilt {
          0%, 100% { transform: rotate(0deg); }
          30% { transform: rotate(3deg); }
          60% { transform: rotate(-2deg); }
        }
      `}</style>

      {/* Confetti particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-sm"
            style={{
              left: `${10 + ((i * 37) % 80)}%`,
              top: `-10px`,
              width: `${6 + (i % 3) * 3}px`,
              height: `${6 + (i % 3) * 3}px`,
              backgroundColor: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"][i % 6],
              animation: `${i % 2 === 0 ? "confettiDrop" : "confettiDrop2"} ${2 + (i % 3)}s ease-in ${(i % 5) * 0.3}s both`,
              borderRadius: i % 3 === 0 ? "50%" : "2px",
            }}
          />
        ))}
      </div>

      {/* Robot */}
      <div className="relative mb-6" style={{ animation: "robotEntrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-32 h-32 rounded-full border-2 border-emerald-500/30" style={{ animation: "pulseRing 2s ease-out infinite" }} />
          <div className="absolute w-32 h-32 rounded-full border-2 border-indigo-500/20" style={{ animation: "pulseRing 2s ease-out infinite 0.5s" }} />
          <div className="absolute w-32 h-32 rounded-full border-2 border-amber-500/20" style={{ animation: "pulseRing 2s ease-out infinite 1s" }} />
        </div>
        <div style={{ animation: "robotHover 3s ease-in-out infinite 0.8s" }}>
          <svg width="160" height="190" viewBox="0 0 160 190" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="80" y1="10" x2="80" y2="30" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
            <circle cx="80" cy="7" r="5" fill="#818cf8" />
            <path d="M72 4 Q66 0 72 -4" stroke="#818cf8" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
            <path d="M88 4 Q94 0 88 -4" stroke="#818cf8" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
            <g style={{ transformOrigin: "80px 50px", animation: "headTilt 4s ease-in-out infinite 1s" }}>
              <rect x="40" y="30" width="80" height="44" rx="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
              <circle cx="58" cy="50" r="7" fill="#4f46e5" style={{ animation: "eyeGlow 2s ease-in-out infinite" }} />
              <circle cx="102" cy="50" r="7" fill="#4f46e5" style={{ animation: "eyeGlow 2s ease-in-out infinite 0.4s" }} />
              <circle cx="56" cy="48" r="2.5" fill="white" opacity="0.8" />
              <circle cx="100" cy="48" r="2.5" fill="white" opacity="0.8" />
              <path d="M66 62 Q80 72 94 62" stroke="#4f46e5" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
            <rect x="68" y="74" width="24" height="10" rx="4" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.5" />
            <rect x="30" y="84" width="100" height="62" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
            <rect x="50" y="94" width="60" height="40" rx="6" fill="#ecfdf5" stroke="#86efac" strokeWidth="1.5" />
            <rect x="52" y="96" width="56" height="2" rx="1" fill="#4f46e5" opacity="0.3" style={{ animation: "chestScan 1.5s ease-in-out infinite" }} />
            <path d="M64 115 L74 125 L96 102" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" style={{ animation: "tickDraw 0.6s ease-out 0.5s both" }} />
            <g style={{ transformOrigin: "28px 90px", animation: "armWave 2s ease-in-out infinite 1s" }}>
              <rect x="10" y="88" width="18" height="46" rx="9" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
              <circle cx="19" cy="138" r="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
            </g>
            <rect x="132" y="88" width="18" height="46" rx="9" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
            <circle cx="141" cy="138" r="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
            <rect x="46" y="146" width="22" height="28" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
            <rect x="92" y="146" width="22" height="28" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
            <rect x="42" y="170" width="30" height="10" rx="5" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.5" />
            <rect x="88" y="170" width="30" height="10" rx="5" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <div style={{ animation: "fadeInUp 0.6s ease-out both 0.4s" }}>
        <h2 className="text-3xl font-bold mb-2">Campaign Submitted!</h2>
        <p className="text-lg text-muted-foreground">
          <span className="text-foreground font-bold">{campaign.name}</span>
        </p>
      </div>

      {/* Status Timeline */}
      <div style={{ animation: "fadeInUp 0.6s ease-out both 0.6s" }} className="my-8 w-full max-w-lg">
        <div className="h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ animation: "slideProgress 1s ease-out 0.8s both" }} />
        </div>
        <div className="flex items-start justify-between">
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600">Submitted</span>
            <span className="text-[10px] text-muted-foreground">Just now</span>
          </div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 border-2 border-amber-200">
              <Clock className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-amber-600">OEM Review</span>
            <span className="text-[10px] text-muted-foreground">Pending</span>
          </div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground border-2 border-border">
              <Rocket className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-muted-foreground">Go Live</span>
            <span className="text-[10px] text-muted-foreground">Upcoming</span>
          </div>
        </div>
      </div>

      {/* Campaign ID */}
      <div style={{ animation: "fadeInUp 0.6s ease-out both 0.8s" }} className="space-y-2 mb-8">
        <Badge variant="outline" className="font-[family-name:var(--font-geist-mono)] text-xs px-3 py-1">
          {campaign.id}
        </Badge>
        <p className="text-sm text-muted-foreground">Usually approved within 24 hours</p>
      </div>

      {/* Action buttons */}
      <div style={{ animation: "scaleIn 0.5s ease-out both 1s" }} className="flex items-center gap-3">
        <Button variant="outline" size="lg" onClick={() => router.push("/campaigns")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          View Campaigns
        </Button>
        <Button size="lg" onClick={() => initDraft()} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Rocket className="h-4 w-4" />
          Create Another
        </Button>
      </div>
    </div>
  );
}

// ─── Main Wizard Page ─────────────────────────────────────────────────────────

export default function CreatePage() {
  const router = useRouter();

  // Store state
  const draft = useStore((s) => s.campaignDraft);
  const initDraft = useStore((s) => s.initDraft);
  const setWizardStep = useStore((s) => s.setWizardStep);
  const setDraftRobotCategory = useStore((s) => s.setDraftRobotCategory);
  const setDraftOem = useStore((s) => s.setDraftOem);
  const setDraftMoment = useStore((s) => s.setDraftMoment);
  const setDraftCreativeIds = useStore((s) => s.setDraftCreativeIds);
  const setDraftBudget = useStore((s) => s.setDraftBudget);
  const setDraftBiddingModel = useStore((s) => s.setDraftBiddingModel);
  const setDraftSchedule = useStore((s) => s.setDraftSchedule);
  const setDraftName = useStore((s) => s.setDraftName);
  const submitDraft = useStore((s) => s.submitDraft);

  // Local state
  const [submitted, setSubmitted] = useState(false);
  const [submittedCampaign, setSubmittedCampaign] = useState<Campaign | null>(null);

  // Initialize draft on mount
  useEffect(() => {
    initDraft();
  }, [initDraft]);

  const step: WizardStep = draft?.step ?? 1;

  // Step validation — determines if Next is enabled
  const canProceed = useMemo(() => {
    if (!draft) return false;
    switch (step) {
      case 1:
        return !!draft.robotCategory;
      case 2:
        return !!draft.oemId && !!draft.placementMomentId;
      case 3:
        // Creatives are optional (allow skipping if none available)
        return true;
      case 4:
        return (draft.budget ?? 0) > 0;
      case 5:
        return !!draft.name?.trim();
      default:
        return false;
    }
  }, [draft, step]);

  const goNext = useCallback(() => {
    if (step < 5) {
      // Auto-set bidding model when moving past step 1
      if (step === 1 && draft?.robotCategory && !draft.biddingModel) {
        setDraftBiddingModel(DEFAULT_BIDDING[draft.robotCategory]);
      }
      setWizardStep((step + 1) as WizardStep);
    }
  }, [step, draft, setWizardStep, setDraftBiddingModel]);

  const goBack = useCallback(() => {
    if (step > 1) {
      setWizardStep((step - 1) as WizardStep);
    }
  }, [step, setWizardStep]);

  const handleSubmit = useCallback(() => {
    const campaign = submitDraft();
    if (campaign) {
      setSubmitted(true);
      setSubmittedCampaign(campaign);
    }
  }, [submitDraft]);

  // Handle budget changes — need to keep budgetType in sync
  const handleBudgetChange = useCallback(
    (value: number) => {
      setDraftBudget(value, draft?.budgetType ?? "total");
    },
    [setDraftBudget, draft?.budgetType],
  );

  const handleBudgetTypeChange = useCallback(
    (type: "daily" | "total") => {
      setDraftBudget(draft?.budget ?? 0, type);
    },
    [setDraftBudget, draft?.budget],
  );

  // Show success page BEFORE the draft-null check,
  // because submitDraft() clears the draft to null
  if (submitted && submittedCampaign) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <SuccessPage campaign={submittedCampaign} />
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Initializing campaign wizard...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Create Campaign</h1>
        <p className="text-muted-foreground">
          Launch advertising on robot fleets in 5 steps.
        </p>
      </div>

      {/* Step Progress */}
      <StepBar current={step} />

      {/* Step Content */}
      <div className="mb-8">
        {step === 1 && (
          <StepRobotType
            selected={draft.robotCategory}
            onSelect={setDraftRobotCategory}
          />
        )}

        {step === 2 && draft.robotCategory && (
          <StepOemMoment
            robotCategory={draft.robotCategory}
            selectedOem={draft.oemId}
            selectedMoment={draft.placementMomentId}
            onSelectOem={setDraftOem}
            onSelectMoment={setDraftMoment}
          />
        )}

        {step === 3 && draft.robotCategory && (
          <StepCreatives
            robotCategory={draft.robotCategory}
            selectedIds={draft.creativeIds}
            onToggle={setDraftCreativeIds}
          />
        )}

        {step === 4 && draft.robotCategory && (
          <StepBudgetSchedule
            robotCategory={draft.robotCategory}
            budget={draft.budget}
            budgetType={draft.budgetType ?? "total"}
            schedule={draft.schedule}
            onBudgetChange={handleBudgetChange}
            onBudgetTypeChange={handleBudgetTypeChange}
            onScheduleChange={setDraftSchedule}
          />
        )}

        {step === 5 && (
          <StepReview
            draft={draft}
            campaignName={draft.name ?? ""}
            onNameChange={setDraftName}
            onSubmit={handleSubmit}
            submitted={submitted}
            submittedCampaign={submittedCampaign}
          />
        )}
      </div>

      {/* Navigation */}
      {!submitted && (
        <div className="flex items-center justify-between border-t border-border pt-6">
          <div>
            {step === 1 ? (
              <Button
                variant="ghost"
                onClick={() => router.push("/campaigns")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </Button>
            ) : (
              <Button variant="outline" onClick={goBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Step {step} of 5
            </span>
            {step < 5 && (
              <Button onClick={goNext} disabled={!canProceed} className="gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
