"use client";

import { FormatContent, FormatType } from "@/types";
import { Badge } from "@/components/ui/badge";

interface ScreenSurfaceProps {
  format: FormatContent;
}

export function ScreenSurface({ format }: ScreenSurfaceProps) {
  return (
    <div className="mx-auto w-full max-w-[280px]" aria-label="Robot screen surface preview">
      {/* Device frame */}
      <div className="rounded-2xl border-2 border-foreground/20 bg-background p-1 shadow-md">
        {/* Screen bezel */}
        <div className="rounded-xl bg-muted/30 p-3">
          {/* Status bar */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="h-1 w-8 rounded-full bg-muted-foreground/20" />
            <div className="h-1.5 w-3 rounded-sm bg-muted-foreground/30" />
          </div>

          {/* Content area */}
          <div className="space-y-2">
            {/* Context line */}
            <div className="h-1.5 w-3/4 rounded-full bg-muted-foreground/15" />
            <div className="h-1.5 w-1/2 rounded-full bg-muted-foreground/15" />

            {/* Ad format placement */}
            <div className="my-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
              {format.type === FormatType.DISPLAY_CARD && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold">{format.headline}</p>
                  <p className="text-[10px] text-muted-foreground">{format.body}</p>
                  <span className="inline-block rounded bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                    {format.cta}
                  </span>
                </div>
              )}
              {format.type === FormatType.HIGHLIGHT_BADGE && (
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-1.5 w-16 rounded-full bg-muted-foreground/20" />
                    <div className="h-1.5 w-12 rounded-full bg-muted-foreground/15" />
                  </div>
                  <Badge className="text-[10px] h-5">{format.badgeText}</Badge>
                </div>
              )}
              {format.type === FormatType.RESTOCK_ALERT_BANNER && (
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">!</span>
                  </div>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400">{format.alertText}</p>
                </div>
              )}
            </div>

            {/* More context lines */}
            <div className="h-1.5 w-2/3 rounded-full bg-muted-foreground/15" />
            <div className="h-1.5 w-1/3 rounded-full bg-muted-foreground/15" />
          </div>
        </div>
      </div>
      <div className="mx-auto mt-1 h-1 w-12 rounded-full bg-foreground/20" />
    </div>
  );
}
