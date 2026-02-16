"use client";

import { FormatContent } from "@/types";

interface GestureSurfaceProps {
  format: FormatContent;
}

const gestureZones: Record<string, { top: string; label: string }> = {
  wave: { top: "15%", label: "Hand wave" },
  point: { top: "35%", label: "Arm point" },
  present: { top: "40%", label: "Both arms present" },
  bow: { top: "25%", label: "Upper body bow" },
  thumbs_up: { top: "35%", label: "Thumbs up" },
};

const timingLabels: Record<string, string> = {
  before: "Before Speech",
  during: "During Speech",
  after: "After Speech",
};

export function GestureSurface({ format }: GestureSurfaceProps) {
  const gesture = format.gestureName ?? "wave";
  const zone = gestureZones[gesture] ?? gestureZones.wave;
  const timing = format.emotionalTone ?? "during";

  return (
    <div className="mx-auto w-full max-w-[280px]" aria-label="Humanoid gesture surface preview">
      {/* Device frame */}
      <div className="rounded-2xl border-2 border-foreground/20 bg-background p-1 shadow-md">
        <div className="rounded-xl bg-muted/30 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-medium">Gesture Cue Preview</p>
            <span className="text-[9px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
              {timingLabels[timing] ?? timing}
            </span>
          </div>

          {/* Humanoid silhouette with gesture zone */}
          <div className="relative h-40 flex items-center justify-center">
            {/* Stick figure */}
            <svg viewBox="0 0 100 160" className="h-full w-auto opacity-30" aria-hidden="true">
              {/* Head */}
              <circle cx="50" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
              {/* Body */}
              <line x1="50" y1="32" x2="50" y2="90" stroke="currentColor" strokeWidth="2" />
              {/* Arms */}
              <line x1="50" y1="50" x2="20" y2="70" stroke="currentColor" strokeWidth="2" />
              <line x1="50" y1="50" x2="80" y2="70" stroke="currentColor" strokeWidth="2" />
              {/* Legs */}
              <line x1="50" y1="90" x2="30" y2="140" stroke="currentColor" strokeWidth="2" />
              <line x1="50" y1="90" x2="70" y2="140" stroke="currentColor" strokeWidth="2" />
            </svg>

            {/* Gesture highlight zone */}
            <div
              className="absolute left-1/2 -translate-x-1/2 rounded-full border-2 border-primary/50 bg-primary/10 px-3 py-1 animate-pulse"
              style={{ top: zone.top }}
            >
              <p className="text-[9px] font-medium text-primary whitespace-nowrap">
                {zone.label}
              </p>
            </div>
          </div>

          {/* Context */}
          <div className="mt-2 text-center">
            <p className="text-[10px] text-muted-foreground">
              {format.gestureContext || "No context specified"}
            </p>
            <p className="text-[9px] text-primary mt-0.5 capitalize font-medium">
              {gesture.replace(/_/g, " ")}
            </p>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-1 h-1 w-12 rounded-full bg-foreground/20" />
    </div>
  );
}
