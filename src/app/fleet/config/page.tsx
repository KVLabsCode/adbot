"use client";

import { useCallback } from "react";
import { useStore } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Monitor,
  Mic,
  Hand,
  Smile,
  Tv,
  Shield,
  DollarSign,
  PieChart,
  Ban,
} from "lucide-react";
import type {
  ContentCategory,
  BrandSafetyRating,
  SurfaceConfig,
} from "@/types";

const CONTENT_CATEGORIES: { value: ContentCategory; label: string }[] = [
  { value: "alcohol", label: "Alcohol" },
  { value: "political", label: "Political" },
  { value: "competitor_brands", label: "Competitor Brands" },
  { value: "adult_content", label: "Adult Content" },
  { value: "gambling", label: "Gambling" },
  { value: "tobacco", label: "Tobacco" },
];

const BRAND_SAFETY_OPTIONS: { value: BrandSafetyRating; label: string; description: string }[] = [
  { value: "standard", label: "Standard", description: "Basic category filtering" },
  { value: "enhanced", label: "Enhanced", description: "Keyword + category filtering" },
  { value: "premium", label: "Premium", description: "Full manual review + AI screening" },
];

export default function FleetConfigPage() {
  const fleetConfig = useStore((s) => s.fleetConfig);
  const updateFleetConfig = useStore((s) => s.updateFleetConfig);

  const toggleSurface = useCallback(
    (key: keyof SurfaceConfig) => {
      updateFleetConfig({
        surfaces: {
          ...fleetConfig.surfaces,
          [key]: !fleetConfig.surfaces[key],
        },
      });
    },
    [fleetConfig.surfaces, updateFleetConfig]
  );

  const toggleBlockedCategory = useCallback(
    (cat: ContentCategory) => {
      const current = fleetConfig.contentPolicy.blockedCategories;
      const next = current.includes(cat)
        ? current.filter((c) => c !== cat)
        : [...current, cat];
      updateFleetConfig({
        contentPolicy: {
          ...fleetConfig.contentPolicy,
          blockedCategories: next,
        },
      });
    },
    [fleetConfig.contentPolicy, updateFleetConfig]
  );

  const setBrandSafety = useCallback(
    (rating: BrandSafetyRating) => {
      updateFleetConfig({
        contentPolicy: {
          ...fleetConfig.contentPolicy,
          brandSafetyRating: rating,
        },
      });
    },
    [fleetConfig.contentPolicy, updateFleetConfig]
  );

  const setCpmFloor = useCallback(
    (values: number[]) => {
      updateFleetConfig({ cpmFloor: values[0] });
    },
    [updateFleetConfig]
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fleet Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Control ad surfaces, content policies, and pricing for your robot fleet.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 — Ad Surface Toggles
          ═══════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Ad Surfaces</h2>
          <p className="text-sm text-muted-foreground">
            Enable or disable ad delivery surfaces on your robots.
          </p>
        </div>

        {/* Humanoid Surfaces */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Humanoid Models
          </p>
          <div className="grid gap-3">
            <SurfaceToggle
              icon={<Monitor className="h-5 w-5" />}
              label="Chest Display"
              description="Visual ads on the robot's chest-mounted screen"
              enabled={fleetConfig.surfaces.chestDisplay}
              onToggle={() => toggleSurface("chestDisplay")}
            />
            <SurfaceToggle
              icon={<Mic className="h-5 w-5" />}
              label="Verbal Delivery"
              description="Spoken ad scripts during customer interactions"
              enabled={fleetConfig.surfaces.verbalDelivery}
              onToggle={() => toggleSurface("verbalDelivery")}
            />
            <SurfaceToggle
              icon={<Hand className="h-5 w-5" />}
              label="Gesture Prompts"
              description="Branded gestures and motion cues"
              enabled={fleetConfig.surfaces.gesturePrompts}
              onToggle={() => toggleSurface("gesturePrompts")}
            />
            <SurfaceToggle
              icon={<Smile className="h-5 w-5" />}
              label="Face Expression"
              description="Emotional face display tied to ad content"
              enabled={fleetConfig.surfaces.faceExpression}
              onToggle={() => toggleSurface("faceExpression")}
            />
          </div>
        </div>

        <Separator />

        {/* Delivery Surfaces */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Delivery Models
          </p>
          <div className="grid gap-3">
            <SurfaceToggle
              icon={<Tv className="h-5 w-5" />}
              label="Screen Display"
              description="Visual ads on the robot's built-in display screen"
              enabled={fleetConfig.surfaces.screenDisplay}
              onToggle={() => toggleSurface("screenDisplay")}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — Content Policy
          ═══════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Content Policy
          </h2>
          <p className="text-sm text-muted-foreground">
            Block content categories and set brand safety levels.
          </p>
        </div>

        {/* Category Blocklist */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Ban className="h-4 w-4 text-red-400" />
              <p className="text-sm font-medium">Category Blocklist</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Checked categories will be blocked from appearing on your fleet.
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {CONTENT_CATEGORIES.map((cat) => {
                const blocked = fleetConfig.contentPolicy.blockedCategories.includes(cat.value);
                return (
                  <label
                    key={cat.value}
                    className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      checked={blocked}
                      onChange={() => toggleBlockedCategory(cat.value)}
                      className="h-4 w-4 rounded border-border accent-red-500"
                    />
                    <div>
                      <span className="text-sm font-medium">{cat.label}</span>
                      {blocked && (
                        <Badge
                          variant="outline"
                          className="ml-2 text-[10px] text-red-400 border-red-400/30 bg-red-400/5"
                        >
                          Blocked
                        </Badge>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Brand Safety Rating */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <p className="text-sm font-medium">Brand Safety Rating</p>
            <p className="text-xs text-muted-foreground">
              Controls how strictly ad content is screened before appearing on your fleet.
            </p>
            <Select
              value={fleetConfig.contentPolicy.brandSafetyRating}
              onValueChange={(v) => setBrandSafety(v as BrandSafetyRating)}
            >
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BRAND_SAFETY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div>
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        {opt.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">Current:</span>
              <Badge
                variant="outline"
                className={
                  fleetConfig.contentPolicy.brandSafetyRating === "premium"
                    ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/5"
                    : fleetConfig.contentPolicy.brandSafetyRating === "enhanced"
                    ? "text-blue-500 border-blue-500/30 bg-blue-500/5"
                    : "text-amber-500 border-amber-500/30 bg-amber-500/5"
                }
              >
                {fleetConfig.contentPolicy.brandSafetyRating.charAt(0).toUpperCase() +
                  fleetConfig.contentPolicy.brandSafetyRating.slice(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 — CPM Floor
          ═══════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            CPM Floor
          </h2>
          <p className="text-sm text-muted-foreground">
            Minimum CPM bid required for campaigns targeting your fleet.
          </p>
        </div>

        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Minimum CPM</p>
                <p className="text-xs text-muted-foreground">
                  Campaigns bidding below this will not run on your robots
                </p>
              </div>
              <span className="text-3xl font-bold font-[family-name:var(--font-geist-mono)] text-emerald-500">
                ${fleetConfig.cpmFloor.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[fleetConfig.cpmFloor]}
              min={0}
              max={20}
              step={0.5}
              onValueChange={setCpmFloor}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>$0.00</span>
              <span>$10.00</span>
              <span>$20.00</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4 — Revenue Split (Read-Only)
          ═══════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <PieChart className="h-5 w-5 text-violet-500" />
            Revenue Split
          </h2>
          <p className="text-sm text-muted-foreground">
            How ad revenue is divided between the platform and your fleet.
          </p>
        </div>

        <Card className="border-muted bg-muted/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-6">
              {/* Platform fee */}
              <div className="flex-1 text-center space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Platform Fee
                </p>
                <p className="text-2xl font-bold font-[family-name:var(--font-geist-mono)] text-muted-foreground">
                  {100 - fleetConfig.revenueSplitPercent}%
                </p>
              </div>

              <Separator orientation="vertical" className="h-16" />

              {/* OEM net */}
              <div className="flex-1 text-center space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Your Net
                </p>
                <p className="text-2xl font-bold font-[family-name:var(--font-geist-mono)] text-emerald-500">
                  {fleetConfig.revenueSplitPercent}%
                </p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-4">
              Revenue split is set by your partnership agreement and cannot be changed here.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SurfaceToggle({
  icon,
  label,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Card
      className={`transition-all duration-200 ${!enabled ? "opacity-50" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 transition-colors ${
              enabled
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            className="shrink-0"
          />
        </div>
      </CardContent>
    </Card>
  );
}
