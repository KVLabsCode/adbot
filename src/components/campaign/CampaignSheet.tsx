"use client";

import { Campaign } from "@/types";
import { useStore } from "@/store";
import {
  campaignTypeLabels,
  campaignTypeEmojis,
  flowTypeLabels,
} from "@/lib/campaignMappings";
import { FormatPreview } from "./FormatPreview";
import { ActivityLog } from "./ActivityLog";
import { MetricInfo } from "@/components/ui/MetricInfo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface CampaignSheetProps {
  campaign: Campaign | null;
  open: boolean;
  onClose: () => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}

export function CampaignSheet({
  campaign,
  open,
  onClose,
  onPause,
  onResume,
}: CampaignSheetProps) {
  const actionHistory = useStore((s) => s.actionHistory);
  if (!campaign) return null;

  const campaignEvents = actionHistory.filter(
    (e) => e.campaignId === campaign.id
  );

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="text-xl">
              {campaignTypeEmojis[campaign.type]}
            </span>
            {campaign.name}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Badge
              variant={campaign.status === "active" ? "default" : "secondary"}
            >
              {campaign.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {campaignTypeLabels[campaign.type]}
            </span>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-2">Flow</h4>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm">{flowTypeLabels[campaign.flow]}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-2">Formats</h4>
            <div className="space-y-2">
              {campaign.formats.map((f, i) => (
                <FormatPreview key={i} format={f} />
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-2">Metrics</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border p-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  ASP <MetricInfo metricKey="asp" />
                </div>
                <p className="text-lg font-bold">
                  ${campaign.metrics.asp.toFixed(2)}
                </p>
              </div>
              <div className="rounded-md border p-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  DCV <MetricInfo metricKey="dcv" />
                </div>
                <p className="text-lg font-bold">
                  {campaign.metrics.dcv.toLocaleString()}
                </p>
              </div>
              <div className="rounded-md border p-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  CPD <MetricInfo metricKey="cpd" />
                </div>
                <p className="text-lg font-bold">
                  ${campaign.metrics.cpd.toFixed(2)}
                </p>
              </div>
              <div className="rounded-md border p-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  RDR <MetricInfo metricKey="rdr" />
                </div>
                <p className="text-lg font-bold">
                  {(campaign.metrics.rdr * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="text-lg font-bold">
                ${campaign.budget.toLocaleString()}
              </p>
            </div>
            {campaign.status === "active" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPause(campaign.id)}
                aria-label={`Pause ${campaign.name}`}
              >
                Pause
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => onResume(campaign.id)}
                aria-label={`Resume ${campaign.name}`}
              >
                Resume
              </Button>
            )}
          </div>

          {campaignEvents.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">AI Activity Log</h4>
                <ActivityLog events={campaignEvents} />
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
