"use client";

import { FormatContent, FormatType } from "@/types";
import { ScreenSurface } from "./ScreenSurface";
import { VoiceSurface } from "./VoiceSurface";
import { RoutingSurface } from "./RoutingSurface";
import { DialogueSurface } from "./DialogueSurface";
import { GestureSurface } from "./GestureSurface";

interface RobotSurfacePreviewProps {
  format: FormatContent;
}

const surfaceLabels: Record<FormatType, string> = {
  [FormatType.DISPLAY_CARD]: "Screen Surface",
  [FormatType.HIGHLIGHT_BADGE]: "Screen Surface",
  [FormatType.RESTOCK_ALERT_BANNER]: "Screen Surface",
  [FormatType.VOICE_PROMPT]: "Voice Interaction Surface",
  [FormatType.ROUTE_PIN]: "Routing Interface Surface",
  [FormatType.HUMANOID_DIALOGUE_SCRIPT]: "Dialogue Interaction Surface",
  [FormatType.GESTURE_CUE]: "Gesture Cue Surface",
};

export function RobotSurfacePreview({ format }: RobotSurfacePreviewProps) {
  const label = surfaceLabels[format.type];

  return (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground text-center mb-3 uppercase tracking-wide">
        {label}
      </p>
      {(format.type === FormatType.DISPLAY_CARD ||
        format.type === FormatType.HIGHLIGHT_BADGE ||
        format.type === FormatType.RESTOCK_ALERT_BANNER) && (
        <ScreenSurface format={format} />
      )}
      {format.type === FormatType.VOICE_PROMPT && (
        <VoiceSurface format={format} />
      )}
      {format.type === FormatType.ROUTE_PIN && (
        <RoutingSurface format={format} />
      )}
      {format.type === FormatType.HUMANOID_DIALOGUE_SCRIPT && (
        <DialogueSurface format={format} />
      )}
      {format.type === FormatType.GESTURE_CUE && (
        <GestureSurface format={format} />
      )}
    </div>
  );
}
