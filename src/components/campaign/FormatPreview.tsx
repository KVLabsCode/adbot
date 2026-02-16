"use client";

import { FormatContent, FormatType } from "@/types";
import { formatTypeLabels } from "@/lib/campaignMappings";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2, MapPin, Tag, AlertTriangle, Monitor, MessageSquare, Hand } from "lucide-react";

interface FormatPreviewProps {
  format: FormatContent;
}

const formatIcons: Record<FormatType, React.ElementType> = {
  [FormatType.DISPLAY_CARD]: Monitor,
  [FormatType.VOICE_PROMPT]: Volume2,
  [FormatType.HIGHLIGHT_BADGE]: Tag,
  [FormatType.RESTOCK_ALERT_BANNER]: AlertTriangle,
  [FormatType.ROUTE_PIN]: MapPin,
  [FormatType.HUMANOID_DIALOGUE_SCRIPT]: MessageSquare,
  [FormatType.GESTURE_CUE]: Hand,
};

export function FormatPreview({ format }: FormatPreviewProps) {
  const Icon = formatIcons[format.type];
  const label = formatTypeLabels[format.type];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Badge variant="secondary" className="text-[10px]">
            {label}
          </Badge>
        </div>
        {format.type === FormatType.DISPLAY_CARD && (
          <div className="space-y-1">
            <p className="text-sm font-semibold">{format.headline}</p>
            <p className="text-xs text-muted-foreground">{format.body}</p>
            <p className="text-xs font-medium text-primary">{format.cta}</p>
          </div>
        )}
        {format.type === FormatType.VOICE_PROMPT && (
          <p className="text-xs italic text-muted-foreground">
            &quot;{format.voiceScript}&quot;
          </p>
        )}
        {format.type === FormatType.HIGHLIGHT_BADGE && (
          <Badge className="mt-1">{format.badgeText}</Badge>
        )}
        {format.type === FormatType.RESTOCK_ALERT_BANNER && (
          <p className="text-xs text-amber-600">{format.alertText}</p>
        )}
        {format.type === FormatType.ROUTE_PIN && (
          <p className="text-xs font-medium">{format.pinLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}
