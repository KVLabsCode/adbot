"use client";

import { useState } from "react";
import { FormatType } from "@/types";
import { formatTypeLabels } from "@/lib/campaignMappings";
import { FormatDetailModal } from "@/components/formats/FormatDetailModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Volume2, Tag, AlertTriangle, MapPin } from "lucide-react";

const formats: {
  type: FormatType;
  emoji: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    type: FormatType.DISPLAY_CARD,
    emoji: "📱",
    icon: Monitor,
    description:
      "Rich visual card shown on robot screens during product evaluation. Includes headline, body text, and call-to-action.",
  },
  {
    type: FormatType.VOICE_PROMPT,
    emoji: "🔊",
    icon: Volume2,
    description:
      "Spoken message delivered by robot voice assistants during decision moments. Ideal for hands-free contexts.",
  },
  {
    type: FormatType.HIGHLIGHT_BADGE,
    emoji: "🏷️",
    icon: Tag,
    description:
      "Compact visual badge overlaid on product listings. Makes your brand stand out during comparison stages.",
  },
  {
    type: FormatType.RESTOCK_ALERT_BANNER,
    emoji: "📦",
    icon: AlertTriangle,
    description:
      "Alert banner triggered when robots detect low inventory. Positions your brand as the preferred restock option.",
  },
  {
    type: FormatType.ROUTE_PIN,
    emoji: "📍",
    icon: MapPin,
    description:
      "Sponsored waypoint on robot navigation maps. Draws delivery and patrol routes through your location.",
  },
];

export default function FormatsPage() {
  const [selectedFormat, setSelectedFormat] = useState<FormatType | null>(null);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Ad Formats</h2>
        <p className="text-sm text-muted-foreground">
          Explore how each format appears in real robot contexts
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {formats.map((fmt) => {
          const Icon = fmt.icon;
          return (
            <Card key={fmt.type} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl" role="img" aria-hidden="true">
                    {fmt.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold">
                      {formatTypeLabels[fmt.type]}
                    </h3>
                  </div>
                  <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" aria-hidden="true" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {fmt.description}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setSelectedFormat(fmt.type)}
                >
                  View Example
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedFormat && (
        <FormatDetailModal
          formatType={selectedFormat}
          onClose={() => setSelectedFormat(null)}
        />
      )}
    </div>
  );
}
