"use client";

import { useState } from "react";
import { ArrowLeft, Upload, Image, Film, Check } from "lucide-react";
import { FormatType, RobotType, FormatContent, CreativeStatus } from "@/types";
import { useStore } from "@/store";
import { formatTypeLabels } from "@/lib/campaignMappings";
import { formatToRobotCompatibility } from "@/lib/creativeMappings";
import { validateCreative } from "@/lib/validationEngine";
import { useDemoMode } from "@/lib/supabase/hooks";
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

const ALLOWED_MEDIA_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "video/mp4",
  "video/webm",
];

type FlowStep = "format-select" | "robot-select" | "upload-media" | "builder";

interface CreateNewFlowProps {
  onComplete: () => void;
}

export function CreateNewFlow({ onComplete }: CreateNewFlowProps) {
  const addCreative = useStore((s) => s.addCreative);
  const addValidationLog = useStore((s) => s.addValidationLog);
  const { isDemoMode } = useDemoMode();

  const [step, setStep] = useState<FlowStep>("format-select");
  const [selectedFormat, setSelectedFormat] = useState<FormatType | null>(null);
  const [selectedRobots, setSelectedRobots] = useState<RobotType[]>([]);
  const [content, setContent] = useState<Partial<FormatContent>>({});

  // Upload state (live mode only)
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [assetPath, setAssetPath] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [fileName, setFileName] = useState("");
  const [creativeName, setCreativeName] = useState("");

  const isLiveMode = isDemoMode === false;

  const steps: FlowStep[] = isLiveMode
    ? ["format-select", "robot-select", "upload-media", "builder"]
    : ["format-select", "robot-select", "builder"];
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
    setStep(isLiveMode ? "upload-media" : "builder");
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
      alert("Unsupported file type. Use PNG, JPEG, WebP, MP4, or WebM.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setFileName(file.name);
    try {
      // Step 1: Get signed upload URL from our API (tiny JSON request)
      const signRes = await fetch("/api/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: "a0000000-0000-0000-0000-000000000001",
          fileName: file.name,
          contentType: file.type,
        }),
      });
      if (!signRes.ok) {
        const err = await signRes.json();
        throw new Error(err.error || "Failed to get upload URL");
      }
      const { signedUrl, path, token } = await signRes.json();

      // Step 2: Upload file directly to Supabase via XHR (supports progress)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      setAssetPath(path);
      setMediaType(file.type.startsWith("video") ? "video" : "image");
      setMimeType(file.type);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUploadContinue = () => {
    if (!assetPath) return;
    setStep("builder");
  };

  const handleSave = () => {
    if (!selectedFormat) return;

    // In live mode, require an uploaded asset
    if (isLiveMode && !assetPath) return;

    const creative = {
      id: `cr-${Date.now()}`,
      name: creativeName.trim() || `${formatTypeLabels[selectedFormat]} Creative`,
      formatType: selectedFormat,
      robotTypes: selectedRobots,
      status: CreativeStatus.DRAFT,
      content: { ...content, type: selectedFormat } as FormatContent,
      validationResults: [] as ReturnType<typeof validateCreative>,
      lastModified: new Date().toISOString(),
      // Media fields (live mode)
      ...(assetPath && {
        assetPath,
        mediaType,
        mimeType,
      }),
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

        {/* Step: Format Selection */}
        {step === "format-select" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Select Ad Format</h2>
            <FormatSelector onSelect={handleFormatSelect} selected={selectedFormat} />
          </div>
        )}

        {/* Step: Robot Selection */}
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

        {/* Step: Upload Media (live mode only) */}
        {step === "upload-media" && (
          <div>
            <h2 className="text-lg font-semibold mb-1">Upload Creative Media</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Upload an image or video for your creative. This will be displayed on AdPod devices.
            </p>

            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors">
              <input
                type="file"
                accept={ALLOWED_MEDIA_TYPES.join(",")}
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-sm text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </span>
                  <div className="w-full max-w-xs h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : assetPath ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                    <Check className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium">{fileName}</span>
                  <span className="text-xs text-muted-foreground">
                    {mediaType === "video" ? "Video" : "Image"} uploaded — click to replace
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Click to upload</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPEG, WebP, MP4, or WebM
                    </p>
                  </div>
                  <div className="flex gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Image className="h-3 w-3" /> Images
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Film className="h-3 w-3" /> Videos
                    </span>
                  </div>
                </div>
              )}
            </label>

            <Button
              className="w-full mt-4"
              disabled={!assetPath}
              onClick={handleUploadContinue}
            >
              Continue to Builder
            </Button>
          </div>
        )}

        {/* Step: Builder */}
        {step === "builder" && selectedFormat && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Build {formatTypeLabels[selectedFormat]}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5">Creative Name</label>
              <input
                type="text"
                value={creativeName}
                onChange={(e) => setCreativeName(e.target.value)}
                placeholder={`${formatTypeLabels[selectedFormat]} Creative`}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            {renderBuilder()}
            <Button
              className="w-full mt-4"
              onClick={handleSave}
              disabled={isLiveMode && !assetPath}
            >
              Save & Validate Creative
            </Button>
            {isLiveMode && !assetPath && (
              <p className="text-[10px] text-amber-600 text-center mt-2">
                Live mode requires an uploaded media file
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
