"use client";

import { FormatContent } from "@/types";
import { MapPin } from "lucide-react";

interface RoutingSurfaceProps {
  format: FormatContent;
}

export function RoutingSurface({ format }: RoutingSurfaceProps) {
  return (
    <div className="mx-auto w-full max-w-[280px]" aria-label="Robot routing interface surface preview">
      {/* Device frame */}
      <div className="rounded-2xl border-2 border-foreground/20 bg-background p-1 shadow-md">
        <div className="rounded-xl bg-muted/30 p-3 relative overflow-hidden">
          {/* Map grid background */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Map content */}
          <div className="relative z-10">
            {/* Status bar */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-medium">Navigation Active</p>
              <div className="h-1.5 w-6 rounded-full bg-green-500/50" />
            </div>

            {/* Route path with sponsored pin */}
            <div className="relative h-32 flex items-center">
              {/* Route line */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 120">
                <path
                  d="M 20 100 Q 60 80 100 60 Q 140 40 180 50 Q 200 55 220 30"
                  fill="none"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  opacity="0.3"
                />
                {/* Start dot */}
                <circle cx="20" cy="100" r="4" fill="hsl(var(--muted-foreground))" opacity="0.4" />
                {/* End dot */}
                <circle cx="220" cy="30" r="4" fill="hsl(var(--muted-foreground))" opacity="0.4" />
              </svg>

              {/* Sponsored pin */}
              <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="rounded-lg border-2 border-primary bg-card px-2 py-1 shadow-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-semibold">{format.pinLabel}</span>
                </div>
                <div className="h-2 w-0.5 bg-primary" />
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
            </div>

            {/* Route info bar */}
            <div className="flex items-center justify-between mt-2 text-[9px] text-muted-foreground">
              <span>3.2 km remaining</span>
              <span>ETA 8 min</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-1 h-1 w-12 rounded-full bg-foreground/20" />
    </div>
  );
}
