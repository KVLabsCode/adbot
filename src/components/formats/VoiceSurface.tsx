"use client";

import { FormatContent } from "@/types";
import { Volume2 } from "lucide-react";

interface VoiceSurfaceProps {
  format: FormatContent;
}

export function VoiceSurface({ format }: VoiceSurfaceProps) {
  return (
    <div className="mx-auto w-full max-w-[280px]" aria-label="Robot voice interaction surface preview">
      {/* Device frame */}
      <div className="rounded-2xl border-2 border-foreground/20 bg-background p-1 shadow-md">
        <div className="rounded-xl bg-muted/30 p-4">
          {/* Robot speaking indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Volume2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-medium">AdPod Assistant</p>
              <p className="text-[10px] text-muted-foreground">Speaking...</p>
            </div>
          </div>

          {/* Audio waveform */}
          <div className="flex items-center justify-center gap-[3px] h-8 mb-3" aria-label="Audio waveform animation">
            {[3, 5, 7, 4, 8, 5, 6, 3, 7, 5, 4, 6, 8, 3, 5].map((h, i) => (
              <div
                key={i}
                className="w-[3px] rounded-full bg-primary/60"
                style={{
                  height: `${h * 3}px`,
                  animation: `pulse 1.2s ease-in-out ${i * 0.08}s infinite alternate`,
                }}
              />
            ))}
          </div>

          {/* Subtitle caption */}
          <div className="rounded-lg bg-card border p-3">
            <p className="text-[11px] italic text-center leading-relaxed">
              &quot;{format.voiceScript}&quot;
            </p>
          </div>

          {/* Companion display hint */}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-muted-foreground">
            <div className="h-3 w-3 rounded border border-muted-foreground/30" />
            <p className="text-[9px]">Companion display available</p>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-1 h-1 w-12 rounded-full bg-foreground/20" />
    </div>
  );
}
