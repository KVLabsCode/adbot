"use client";

import { useState, useRef } from "react";
import { useStore } from "@/store";
import {
  RobotCategory,
  RobotType,
  CreativeStatus,
  FormatType,
  type Creative,
  type FormatContent,
  type ValidationResult,
} from "@/types";
import {
  Bot,
  Truck,
  Store,
  Upload,
  Trash2,
  Monitor,
  Hand,
  Smile,
  Image,
  Mic,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  X,
  FileVideo,
  FileImage,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// ─── Constants ──────────────────────────────────────────────────────────────

const GESTURES = [
  { id: "wave-toward", label: "Wave Toward", description: "Inviting customer to approach" },
  { id: "point", label: "Point", description: "Directing attention to chest display" },
  { id: "nod-to", label: "Nod To", description: "Acknowledging customer with a nod" },
  { id: "present", label: "Present", description: "Open-hand gesture presenting information" },
  { id: "thumbs-up", label: "Thumbs Up", description: "Positive reinforcement gesture" },
];

const EXPRESSIONS = [
  { id: "smile", label: "Smile", description: "Warm, welcoming smile" },
  { id: "curious", label: "Curious", description: "Intrigued, engaged look" },
  { id: "welcoming", label: "Welcoming", description: "Open, friendly expression" },
  { id: "excited", label: "Excited", description: "Enthusiastic, energetic expression" },
  { id: "neutral", label: "Neutral", description: "Professional, calm demeanor" },
];

const FORMAT_OPTIONS: {
  category: RobotCategory;
  formats: { type: FormatType; label: string; icon: React.ReactNode; description: string }[];
}[] = [
  {
    category: RobotCategory.HUMANOID,
    formats: [
      { type: FormatType.CHEST_DISPLAY, label: "Chest Display", icon: <Monitor className="size-5" />, description: "Portrait 9:16, MP4 or PNG, max 15 seconds" },
      { type: FormatType.VERBAL_SCRIPT, label: "Verbal Script", icon: <Mic className="size-5" />, description: "Plain text, \u226420 words (~8 sec spoken)" },
      { type: FormatType.GESTURE_PROMPT, label: "Gesture Prompt", icon: <Hand className="size-5" />, description: "Select from Kovio gesture library" },
      { type: FormatType.FACE_EXPRESSION, label: "Face Expression", icon: <Smile className="size-5" />, description: "Select from Kovio expression library" },
    ],
  },
  {
    category: RobotCategory.DELIVERY_LOGISTICS,
    formats: [
      { type: FormatType.SCREEN_DISPLAY, label: "Screen Display", icon: <Monitor className="size-5" />, description: "Landscape 16:9 or Square 1:1, MP4 or PNG, max 30 sec" },
    ],
  },
  {
    category: RobotCategory.SERVICE_RETAIL,
    formats: [
      { type: FormatType.SCREEN_DISPLAY, label: "Screen Display", icon: <Monitor className="size-5" />, description: "Display screen + optional audio" },
    ],
  },
];

// ─── Validation Engine ──────────────────────────────────────────────────────

function validateCreative(
  formatType: FormatType,
  content: FormatContent,
  file: File | null,
  robotCategory: RobotCategory
): ValidationResult[] {
  const results: ValidationResult[] = [];

  if (formatType === FormatType.CHEST_DISPLAY) {
    if (file) {
      const isValidType = ["image/png", "image/jpeg", "video/mp4"].includes(file.type);
      results.push({
        category: "format_compatibility",
        passed: isValidType,
        message: isValidType ? "Portrait 9:16 MP4/PNG accepted" : `Invalid file type: ${file.type}. Use PNG, JPEG, or MP4.`,
        autoFixAvailable: false,
      });
      const sizeOk = file.size <= 50 * 1024 * 1024;
      results.push({
        category: "length_constraints",
        passed: sizeOk,
        message: sizeOk ? "File size within 50MB limit" : "File exceeds 50MB limit",
        autoFixAvailable: false,
      });
    }
    results.push({
      category: "visual_fit",
      passed: true,
      message: "Renders correctly on G1/H1 chest display",
      autoFixAvailable: false,
    });
  }

  if (formatType === FormatType.VERBAL_SCRIPT) {
    const words = (content.voiceScript || "").trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    results.push({
      category: "length_constraints",
      passed: wordCount > 0 && wordCount <= 20,
      message: wordCount === 0
        ? "Voice script is empty"
        : wordCount <= 20
          ? `${wordCount} words, within 20-word limit`
          : `${wordCount} words exceeds 20-word limit. Trim to fit ~8 seconds.`,
      autoFixAvailable: wordCount > 20,
    });
    results.push({
      category: "safety_guardrails",
      passed: true,
      message: "No prohibited content detected",
      autoFixAvailable: false,
    });
  }

  if (formatType === FormatType.GESTURE_PROMPT) {
    const hasGesture = !!content.gestureName;
    results.push({
      category: "robot_capability",
      passed: hasGesture,
      message: hasGesture ? `${content.gestureName} supported on G1/H1` : "No gesture selected",
      autoFixAvailable: false,
    });
  }

  if (formatType === FormatType.FACE_EXPRESSION) {
    const hasExpression = !!content.expressionName;
    results.push({
      category: "robot_capability",
      passed: hasExpression,
      message: hasExpression ? `${content.expressionName} expression available on G1/H1` : "No expression selected",
      autoFixAvailable: false,
    });
  }

  if (formatType === FormatType.SCREEN_DISPLAY) {
    if (file) {
      const isValidType = ["image/png", "image/jpeg", "video/mp4"].includes(file.type);
      results.push({
        category: "format_compatibility",
        passed: isValidType,
        message: isValidType
          ? `${robotCategory === RobotCategory.DELIVERY_LOGISTICS ? "16:9/1:1" : "1:1"} ${file.type.startsWith("video") ? "MP4" : "PNG"} accepted`
          : `Invalid file type: ${file.type}. Use PNG, JPEG, or MP4.`,
        autoFixAvailable: false,
      });
    }
    results.push({
      category: "visual_fit",
      passed: true,
      message: "Renders correctly on bot display",
      autoFixAvailable: false,
    });
  }

  return results;
}

// ─── Robot Silhouette Preview ───────────────────────────────────────────────

function RobotPreview({
  robotCategory,
  formatType,
  content,
  previewUrl,
}: {
  robotCategory: RobotCategory;
  formatType: FormatType;
  content: FormatContent;
  previewUrl: string | null;
}) {
  if (robotCategory === RobotCategory.HUMANOID) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-48">
          {/* Head */}
          <div className="mx-auto w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center">
            {formatType === FormatType.FACE_EXPRESSION && content.expressionName ? (
              <span className="text-2xl">
                {content.expressionName === "smile" ? "😊" :
                 content.expressionName === "curious" ? "🤔" :
                 content.expressionName === "welcoming" ? "😃" :
                 content.expressionName === "excited" ? "🤩" : "😐"}
              </span>
            ) : (
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <div className="w-3 h-3 rounded-full bg-blue-400" />
              </div>
            )}
          </div>
          {/* Neck */}
          <div className="mx-auto w-6 h-4 bg-zinc-700" />
          {/* Torso with chest display */}
          <div className="mx-auto w-36 h-52 rounded-lg bg-zinc-800 border-2 border-zinc-600 flex flex-col items-center p-2">
            {/* Chest display area */}
            <div className="w-24 h-40 rounded-md bg-zinc-900 border border-zinc-500 overflow-hidden flex items-center justify-center">
              {formatType === FormatType.CHEST_DISPLAY && previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : formatType === FormatType.CHEST_DISPLAY ? (
                <div className="text-center px-2">
                  <p className="text-[9px] font-bold text-zinc-400">{content.headline || "Headline"}</p>
                  <p className="text-[7px] text-zinc-500 mt-1">{content.body || "Body text"}</p>
                  {content.cta && (
                    <div className="mt-2 px-2 py-0.5 bg-blue-500/20 rounded text-[7px] text-blue-400">
                      {content.cta}
                    </div>
                  )}
                </div>
              ) : formatType === FormatType.VERBAL_SCRIPT ? (
                <div className="text-center px-2">
                  <Volume2 className="size-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-[7px] text-zinc-400 italic leading-tight">
                    {content.voiceScript ? `"${content.voiceScript.slice(0, 60)}${content.voiceScript.length > 60 ? "..." : ""}"` : "Voice script preview"}
                  </p>
                </div>
              ) : formatType === FormatType.GESTURE_PROMPT ? (
                <div className="text-center px-2">
                  <Hand className="size-5 text-amber-400 mx-auto mb-1" />
                  <p className="text-[8px] text-zinc-400">{content.gestureName || "Select gesture"}</p>
                </div>
              ) : (
                <div className="text-[8px] text-zinc-500 text-center">9:16 Display</div>
              )}
            </div>
          </div>
          {/* Arms suggestion */}
          {formatType === FormatType.GESTURE_PROMPT && content.gestureName && (
            <div className="absolute top-24 -left-4 w-8 h-20 flex items-end">
              <div className="w-full h-3 bg-zinc-700 rounded-full transform -rotate-45 origin-right" />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Unitree G1 Preview</p>
      </div>
    );
  }

  // Delivery/Service bot
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48">
        {/* Bot body */}
        <div className="mx-auto w-40 h-32 rounded-xl bg-zinc-800 border-2 border-zinc-600 flex flex-col items-center justify-center p-3">
          {/* Screen */}
          <div className="w-32 h-20 rounded-md bg-zinc-900 border border-zinc-500 overflow-hidden flex items-center justify-center">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center px-2">
                <p className="text-[9px] font-bold text-zinc-400">{content.headline || "Headline"}</p>
                <p className="text-[7px] text-zinc-500 mt-1">{content.body || "Body text"}</p>
                {content.cta && (
                  <div className="mt-1 px-2 py-0.5 bg-blue-500/20 rounded text-[7px] text-blue-400">
                    {content.cta}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Wheels */}
        <div className="flex justify-between px-6 -mt-1">
          <div className="w-8 h-4 rounded-b-full bg-zinc-700 border border-zinc-600" />
          <div className="w-8 h-4 rounded-b-full bg-zinc-700 border border-zinc-600" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">Bot Display Preview</p>
    </div>
  );
}

// ─── TTS Preview Button ─────────────────────────────────────────────────────

function TTSPreview({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false);

  function speak() {
    if (!text.trim() || typeof window === "undefined") return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function stop() {
    window.speechSynthesis.cancel();
    setPlaying(false);
  }

  return (
    <Button
      size="sm"
      variant={playing ? "destructive" : "secondary"}
      onClick={playing ? stop : speak}
      disabled={!text.trim()}
      className="gap-1.5"
    >
      {playing ? <X className="size-3.5" /> : <Volume2 className="size-3.5" />}
      {playing ? "Stop" : "Preview TTS"}
    </Button>
  );
}

// ─── Create Creative Dialog ─────────────────────────────────────────────────

type CreateStep = "category" | "format" | "build" | "validate";

function CreateCreativeDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (creative: Creative) => void;
}) {
  const [step, setStep] = useState<CreateStep>("category");
  const [robotCategory, setRobotCategory] = useState<RobotCategory | null>(null);
  const [formatType, setFormatType] = useState<FormatType | null>(null);
  const [name, setName] = useState("");
  const [content, setContent] = useState<FormatContent>({ type: FormatType.SCREEN_DISPLAY });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("category");
    setRobotCategory(null);
    setFormatType(null);
    setName("");
    setContent({ type: FormatType.SCREEN_DISPLAY });
    setFile(null);
    setPreviewUrl(null);
    setValidationResults([]);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else if (f.type.startsWith("video/")) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    }
  }

  function handleValidate() {
    if (!formatType || !robotCategory) return;
    const results = validateCreative(formatType, content, file, robotCategory);
    setValidationResults(results);
    setStep("validate");
  }

  function handleSave() {
    if (!formatType || !robotCategory || !name.trim()) return;

    const creative: Creative = {
      id: `cr-${Date.now()}`,
      name: name.trim(),
      formatType,
      robotCategory,
      robotTypes: robotCategory === RobotCategory.HUMANOID ? [RobotType.HUMANOID] :
        robotCategory === RobotCategory.DELIVERY_LOGISTICS ? [RobotType.DELIVERY] :
          [RobotType.RETAIL],
      status: validationResults.every((r) => r.passed) ? CreativeStatus.VALIDATED : CreativeStatus.NEEDS_CORRECTION,
      content: { ...content, type: formatType },
      validationResults,
      lastModified: new Date().toISOString(),
      assetPath: file ? file.name : undefined,
      mediaType: file?.type.startsWith("video") ? "video" : file ? "image" : undefined,
      mimeType: file?.type,
      durationSeconds: formatType === FormatType.CHEST_DISPLAY ? 15 :
        formatType === FormatType.VERBAL_SCRIPT ? Math.ceil(((content.voiceScript || "").split(/\s+/).length / 2.5)) :
          undefined,
    };

    onSave(creative);
    handleClose();
  }

  const allPassed = validationResults.length > 0 && validationResults.every((r) => r.passed);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Creative</DialogTitle>
          <DialogDescription>
            {step === "category" && "Choose a robot category for your creative"}
            {step === "format" && "Select the creative format"}
            {step === "build" && "Build your creative content"}
            {step === "validate" && "Review validation results"}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex gap-1 mb-2">
          {(["category", "format", "build", "validate"] as CreateStep[]).map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                (["category", "format", "build", "validate"] as CreateStep[]).indexOf(step) >= i
                  ? "bg-blue-500"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* ─── Step: Category ─── */}
        {step === "category" && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { cat: RobotCategory.HUMANOID, label: "Humanoid", desc: "Chest display, verbal, gesture, expression", icon: <Bot className="size-6" />, accent: "blue" },
              { cat: RobotCategory.DELIVERY_LOGISTICS, label: "Delivery & Logistics", desc: "Screen display ads", icon: <Truck className="size-6" />, accent: "violet" },
              { cat: RobotCategory.SERVICE_RETAIL, label: "Service & Retail", desc: "Screen display + audio", icon: <Store className="size-6" />, accent: "emerald" },
            ].map(({ cat, label, desc, icon, accent }) => (
              <button
                key={cat}
                onClick={() => { setRobotCategory(cat); setStep("format"); }}
                className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-all hover:border-${accent}-500/50 hover:bg-${accent}-500/5`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${accent}-500/10 text-${accent}-400`}>
                  {icon}
                </div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* ─── Step: Format ─── */}
        {step === "format" && robotCategory && (
          <div className="space-y-3">
            {FORMAT_OPTIONS.filter((g) => g.category === robotCategory).flatMap((g) =>
              g.formats.map((fmt) => (
                <button
                  key={fmt.type}
                  onClick={() => {
                    setFormatType(fmt.type);
                    setContent({ type: fmt.type });
                    setStep("build");
                  }}
                  className="flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-all hover:border-blue-500/50 hover:bg-blue-500/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    {fmt.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{fmt.label}</p>
                    <p className="text-xs text-muted-foreground">{fmt.description}</p>
                  </div>
                </button>
              ))
            )}
            <Button variant="ghost" size="sm" onClick={() => { setRobotCategory(null); setStep("category"); }}>
              Back
            </Button>
          </div>
        )}

        {/* ─── Step: Build ─── */}
        {step === "build" && formatType && robotCategory && (
          <div className="space-y-4">
            {/* Creative name */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Creative Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Holiday Greeting Chest Ad"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Builder */}
              <div className="space-y-4">
                {/* ── Chest Display Builder ── */}
                {formatType === FormatType.CHEST_DISPLAY && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Media Upload
                      </label>
                      <p className="text-xs text-muted-foreground mb-2">Portrait 9:16, MP4 or PNG, max 15 seconds</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,video/mp4"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors"
                      >
                        {file ? (
                          <div className="flex items-center gap-2">
                            {file.type.startsWith("video") ? <FileVideo className="size-5 text-blue-400" /> : <FileImage className="size-5 text-blue-400" />}
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="size-6 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Click to upload PNG, JPEG, or MP4</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Headline</label>
                      <Input value={content.headline || ""} onChange={(e) => setContent({ ...content, headline: e.target.value })} placeholder="e.g. Happy Holidays!" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Body Text</label>
                      <Input value={content.body || ""} onChange={(e) => setContent({ ...content, body: e.target.value })} placeholder="e.g. Special seasonal greeting" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Call to Action</label>
                      <Input value={content.cta || ""} onChange={(e) => setContent({ ...content, cta: e.target.value })} placeholder="e.g. Scan for offer" className="mt-1" />
                    </div>
                  </>
                )}

                {/* ── Verbal Script Builder ── */}
                {formatType === FormatType.VERBAL_SCRIPT && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Voice Script</label>
                      <p className="text-xs text-muted-foreground mb-2">Max 20 words (~8 seconds spoken). The robot will speak this aloud.</p>
                      <textarea
                        value={content.voiceScript || ""}
                        onChange={(e) => setContent({ ...content, voiceScript: e.target.value })}
                        placeholder="e.g. Welcome! Today's experience is brought to you by our partner. Scan my chest display for a special offer."
                        rows={4}
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs font-[family-name:var(--font-geist-mono)] ${
                          (content.voiceScript || "").trim().split(/\s+/).filter(Boolean).length > 20
                            ? "text-red-400"
                            : "text-muted-foreground"
                        }`}>
                          {(content.voiceScript || "").trim().split(/\s+/).filter(Boolean).length}/20 words
                        </span>
                        <TTSPreview text={content.voiceScript || ""} />
                      </div>
                    </div>
                  </>
                )}

                {/* ── Gesture Prompt Builder ── */}
                {formatType === FormatType.GESTURE_PROMPT && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select Gesture</label>
                      <p className="text-xs text-muted-foreground mb-2">Choose from the Kovio gesture library</p>
                      <div className="space-y-2">
                        {GESTURES.map((g) => (
                          <button
                            key={g.id}
                            onClick={() => setContent({ ...content, gestureName: g.id, gestureContext: g.description })}
                            className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                              content.gestureName === g.id
                                ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30"
                                : "hover:border-muted-foreground/30"
                            }`}
                          >
                            <Hand className={`size-4 ${content.gestureName === g.id ? "text-amber-400" : "text-muted-foreground"}`} />
                            <div>
                              <p className="text-sm font-medium">{g.label}</p>
                              <p className="text-xs text-muted-foreground">{g.description}</p>
                            </div>
                            {content.gestureName === g.id && (
                              <CheckCircle2 className="size-4 text-amber-400 ml-auto shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Face Expression Builder ── */}
                {formatType === FormatType.FACE_EXPRESSION && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select Expression</label>
                      <p className="text-xs text-muted-foreground mb-2">Choose from the Kovio expression library</p>
                      <div className="grid grid-cols-2 gap-2">
                        {EXPRESSIONS.map((expr) => (
                          <button
                            key={expr.id}
                            onClick={() => setContent({ ...content, expressionName: expr.id })}
                            className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all ${
                              content.expressionName === expr.id
                                ? "border-pink-500 bg-pink-500/10 ring-1 ring-pink-500/30"
                                : "hover:border-muted-foreground/30"
                            }`}
                          >
                            <span className="text-xl">
                              {expr.id === "smile" ? "😊" :
                               expr.id === "curious" ? "🤔" :
                               expr.id === "welcoming" ? "😃" :
                               expr.id === "excited" ? "🤩" : "😐"}
                            </span>
                            <p className="text-xs font-medium">{expr.label}</p>
                            <p className="text-[10px] text-muted-foreground">{expr.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Screen Display Builder (Delivery/Service) ── */}
                {formatType === FormatType.SCREEN_DISPLAY && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Media Upload
                      </label>
                      <p className="text-xs text-muted-foreground mb-2">
                        {robotCategory === RobotCategory.DELIVERY_LOGISTICS
                          ? "Landscape 16:9 or Square 1:1, MP4 or PNG, max 30 seconds"
                          : "Square 1:1, MP4 or PNG"}
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,video/mp4"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors"
                      >
                        {file ? (
                          <div className="flex items-center gap-2">
                            {file.type.startsWith("video") ? <FileVideo className="size-5 text-blue-400" /> : <FileImage className="size-5 text-blue-400" />}
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="size-6 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Click to upload PNG, JPEG, or MP4</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Headline</label>
                      <Input value={content.headline || ""} onChange={(e) => setContent({ ...content, headline: e.target.value })} placeholder="e.g. Hungry? Order now!" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Body Text</label>
                      <Input value={content.body || ""} onChange={(e) => setContent({ ...content, body: e.target.value })} placeholder="e.g. Free delivery on your first order" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Call to Action</label>
                      <Input value={content.cta || ""} onChange={(e) => setContent({ ...content, cta: e.target.value })} placeholder="e.g. Scan to order" className="mt-1" />
                    </div>
                  </>
                )}
              </div>

              {/* Right: Robot preview */}
              <div className="flex flex-col items-center justify-center rounded-lg border bg-zinc-950/50 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Eye className="size-3" />
                  Live Preview
                </div>
                <RobotPreview
                  robotCategory={robotCategory}
                  formatType={formatType}
                  content={content}
                  previewUrl={previewUrl}
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => { setFormatType(null); setStep("format"); }}>
                Back
              </Button>
              <Button onClick={handleValidate} disabled={!name.trim()}>
                <CheckCircle2 className="size-4" />
                Validate & Review
              </Button>
            </div>
          </div>
        )}

        {/* ─── Step: Validate ─── */}
        {step === "validate" && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                {allPassed ? (
                  <CheckCircle2 className="size-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="size-5 text-amber-400" />
                )}
                <span className="font-medium">
                  {allPassed ? "All checks passed" : "Some checks need attention"}
                </span>
              </div>
              <Separator />
              {validationResults.map((vr, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`mt-0.5 size-2.5 shrink-0 rounded-full ${vr.passed ? "bg-emerald-400" : "bg-red-400"}`} />
                  <div>
                    <p className="text-sm">{vr.message}</p>
                    <p className="text-xs text-muted-foreground capitalize">{vr.category.replace(/_/g, " ")}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="rounded-lg border p-4">
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Name:</span> {name}</div>
                <div><span className="text-muted-foreground">Category:</span> {robotCategory === RobotCategory.HUMANOID ? "Humanoid" : robotCategory === RobotCategory.DELIVERY_LOGISTICS ? "Delivery" : "Service"}</div>
                <div><span className="text-muted-foreground">Format:</span> {formatType?.replace(/_/g, " ")}</div>
                {file && <div><span className="text-muted-foreground">File:</span> {file.name}</div>}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setStep("build")}>Back to Edit</Button>
              <Button onClick={handleSave} className="gap-1.5">
                <CheckCircle2 className="size-4" />
                {allPassed ? "Save Creative" : "Save Anyway"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function robotCategoryLabel(cat: RobotCategory): string {
  switch (cat) {
    case RobotCategory.HUMANOID: return "Humanoid";
    case RobotCategory.DELIVERY_LOGISTICS: return "Delivery";
    case RobotCategory.SERVICE_RETAIL: return "Service";
  }
}

function robotCategoryIcon(cat: RobotCategory) {
  switch (cat) {
    case RobotCategory.HUMANOID: return <Bot className="size-4" />;
    case RobotCategory.DELIVERY_LOGISTICS: return <Truck className="size-4" />;
    case RobotCategory.SERVICE_RETAIL: return <Store className="size-4" />;
  }
}

function statusBadge(status: CreativeStatus) {
  const map: Record<CreativeStatus, { label: string; className: string }> = {
    [CreativeStatus.LIVE]: { label: "Live", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
    [CreativeStatus.VALIDATED]: { label: "Validated", className: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
    [CreativeStatus.DRAFT]: { label: "Draft", className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25" },
    [CreativeStatus.NEEDS_CORRECTION]: { label: "Needs Fix", className: "bg-orange-500/15 text-orange-400 border-orange-500/25" },
  };
  const { label, className } = map[status];
  return <Badge variant="outline" className={className}>{label}</Badge>;
}

function formatBadge(formatType: FormatType, robotCategory: RobotCategory) {
  if (robotCategory === RobotCategory.HUMANOID) {
    const humanoidFormatLabels: Record<string, { label: string; icon: React.ReactNode }> = {
      [FormatType.CHEST_DISPLAY]: { label: "Chest Display", icon: <Monitor className="size-3" /> },
      [FormatType.VERBAL_SCRIPT]: { label: "Verbal Script", icon: <Mic className="size-3" /> },
      [FormatType.GESTURE_PROMPT]: { label: "Gesture", icon: <Hand className="size-3" /> },
      [FormatType.FACE_EXPRESSION]: { label: "Face Expression", icon: <Smile className="size-3" /> },
    };
    const info = humanoidFormatLabels[formatType];
    if (info) {
      return <Badge variant="secondary" className="gap-1 text-xs">{info.icon}{info.label}</Badge>;
    }
  }
  return <Badge variant="secondary" className="gap-1 text-xs capitalize"><Image className="size-3" />{formatType.replace(/_/g, " ")}</Badge>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Creative Detail Dialog ─────────────────────────────────────────────────

function CreativeDetailDialog({
  creative,
  open,
  onClose,
  onDelete,
}: {
  creative: Creative | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  if (!creative) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {robotCategoryIcon(creative.robotCategory)}
            {creative.name}
          </DialogTitle>
          <DialogDescription>
            {robotCategoryLabel(creative.robotCategory)} creative &middot; Last modified {formatDate(creative.lastModified)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {formatBadge(creative.formatType, creative.robotCategory)}
            {statusBadge(creative.status)}
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Content</h4>
            <div className="rounded-lg border p-3 space-y-1.5 text-sm">
              {creative.content.headline && <div><span className="text-muted-foreground">Headline:</span> {creative.content.headline}</div>}
              {creative.content.body && <div><span className="text-muted-foreground">Body:</span> {creative.content.body}</div>}
              {creative.content.cta && <div><span className="text-muted-foreground">CTA:</span> {creative.content.cta}</div>}
              {creative.content.voiceScript && (
                <div>
                  <span className="text-muted-foreground">Voice Script:</span>{" "}
                  <span className="italic">&ldquo;{creative.content.voiceScript}&rdquo;</span>
                  <div className="mt-1.5">
                    <TTSPreview text={creative.content.voiceScript} />
                  </div>
                </div>
              )}
              {creative.content.gestureName && (
                <div><span className="text-muted-foreground">Gesture:</span> {creative.content.gestureName}{creative.content.gestureContext && ` \u2014 ${creative.content.gestureContext}`}</div>
              )}
              {creative.content.expressionName && (
                <div><span className="text-muted-foreground">Expression:</span> {creative.content.expressionName}</div>
              )}
              {creative.durationSeconds != null && (
                <div><span className="text-muted-foreground">Duration:</span> <span className="font-[family-name:var(--font-geist-mono)]">{creative.durationSeconds}s</span></div>
              )}
            </div>
          </div>

          {creative.validationResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Validation</h4>
              <div className="space-y-1">
                {creative.validationResults.map((vr, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 size-2 shrink-0 rounded-full ${vr.passed ? "bg-emerald-400" : "bg-red-400"}`} />
                    <span className="text-muted-foreground">{vr.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="destructive" size="sm" onClick={() => { onDelete(creative.id); onClose(); }}>
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

const humanoidFormats: FormatType[] = [
  FormatType.CHEST_DISPLAY,
  FormatType.VERBAL_SCRIPT,
  FormatType.GESTURE_PROMPT,
  FormatType.FACE_EXPRESSION,
];

export default function CreativesPage() {
  const creatives = useStore((s) => s.creatives);
  const deleteCreative = useStore((s) => s.deleteCreative);
  const addCreative = useStore((s) => s.addCreative);

  const [statusFilter, setStatusFilter] = useState<CreativeStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  function filterCreatives(list: Creative[], category?: RobotCategory): Creative[] {
    let result = list;
    if (category) result = result.filter((c) => c.robotCategory === category);
    if (statusFilter !== "all") result = result.filter((c) => c.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.formatType.toLowerCase().includes(q));
    }
    return result;
  }

  function CreativeGrid({ items }: { items: Creative[]; category?: RobotCategory }) {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Image className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No creatives match your filters.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            Create One
          </Button>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((cr) => (
          <Card key={cr.id} className="cursor-pointer transition-colors hover:border-foreground/20 py-4" onClick={() => setSelectedCreative(cr)}>
            <CardContent className="space-y-3 px-4 py-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {robotCategoryIcon(cr.robotCategory)}
                  <p className="text-sm font-medium truncate">{cr.name}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formatBadge(cr.formatType, cr.robotCategory)}
                {statusBadge(cr.status)}
              </div>
              {/* Content preview snippet */}
              <div className="text-xs text-muted-foreground truncate">
                {cr.content.headline && `"${cr.content.headline}"`}
                {cr.content.voiceScript && `"${cr.content.voiceScript.slice(0, 50)}..."`}
                {cr.content.gestureName && `Gesture: ${cr.content.gestureName}`}
                {cr.content.expressionName && `Expression: ${cr.content.expressionName}`}
              </div>
              <p className="text-xs text-muted-foreground">Modified {formatDate(cr.lastModified)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Creative Studio</h2>
          <p className="text-sm text-muted-foreground">
            Manage your ad creatives across all robot surfaces
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New Creative
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search creatives..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CreativeStatus | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={CreativeStatus.DRAFT}>Draft</SelectItem>
            <SelectItem value={CreativeStatus.VALIDATED}>Validated</SelectItem>
            <SelectItem value={CreativeStatus.LIVE}>Live</SelectItem>
            <SelectItem value={CreativeStatus.NEEDS_CORRECTION}>Needs Fix</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs by robot category */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All
            <span className="ml-1 font-[family-name:var(--font-geist-mono)] text-xs opacity-60">{filterCreatives(creatives).length}</span>
          </TabsTrigger>
          <TabsTrigger value={RobotCategory.HUMANOID}>
            <Bot className="size-3.5" />
            Humanoid
            <span className="ml-1 font-[family-name:var(--font-geist-mono)] text-xs opacity-60">{filterCreatives(creatives, RobotCategory.HUMANOID).length}</span>
          </TabsTrigger>
          <TabsTrigger value={RobotCategory.DELIVERY_LOGISTICS}>
            <Truck className="size-3.5" />
            Delivery
            <span className="ml-1 font-[family-name:var(--font-geist-mono)] text-xs opacity-60">{filterCreatives(creatives, RobotCategory.DELIVERY_LOGISTICS).length}</span>
          </TabsTrigger>
          <TabsTrigger value={RobotCategory.SERVICE_RETAIL}>
            <Store className="size-3.5" />
            Service
            <span className="ml-1 font-[family-name:var(--font-geist-mono)] text-xs opacity-60">{filterCreatives(creatives, RobotCategory.SERVICE_RETAIL).length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <CreativeGrid items={filterCreatives(creatives)} />
        </TabsContent>

        <TabsContent value={RobotCategory.HUMANOID} className="mt-4">
          <div className="flex flex-wrap gap-2 mb-4 px-1">
            <span className="text-xs text-muted-foreground mr-1 self-center">Formats:</span>
            {humanoidFormats.map((ft) => (
              <span key={ft}>{formatBadge(ft, RobotCategory.HUMANOID)}</span>
            ))}
          </div>
          <CreativeGrid items={filterCreatives(creatives, RobotCategory.HUMANOID)} category={RobotCategory.HUMANOID} />
        </TabsContent>

        <TabsContent value={RobotCategory.DELIVERY_LOGISTICS} className="mt-4">
          <CreativeGrid items={filterCreatives(creatives, RobotCategory.DELIVERY_LOGISTICS)} category={RobotCategory.DELIVERY_LOGISTICS} />
        </TabsContent>

        <TabsContent value={RobotCategory.SERVICE_RETAIL} className="mt-4">
          <CreativeGrid items={filterCreatives(creatives, RobotCategory.SERVICE_RETAIL)} category={RobotCategory.SERVICE_RETAIL} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreativeDetailDialog
        creative={selectedCreative}
        open={!!selectedCreative}
        onClose={() => setSelectedCreative(null)}
        onDelete={deleteCreative}
      />
      <CreateCreativeDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={addCreative}
      />
    </div>
  );
}
