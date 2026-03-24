"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/store";
import { getOemById, getMomentById } from "@/fixtures/oem-partners";
import {
  RobotCategory,
  CampaignStatus,
  BiddingModel,
  type Campaign,
} from "@/types";
import {
  Bot,
  Truck,
  Store,
  Pause,
  Play,
  Copy,
  BarChart3,
  Plus,
  Target,
  Calendar,
  DollarSign,
  Zap,
  Eye,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function robotIcon(category: RobotCategory) {
  switch (category) {
    case RobotCategory.HUMANOID:
      return <Bot className="size-4 text-violet-400" />;
    case RobotCategory.DELIVERY_LOGISTICS:
      return <Truck className="size-4 text-sky-400" />;
    case RobotCategory.SERVICE_RETAIL:
      return <Store className="size-4 text-amber-400" />;
  }
}

function statusBadge(status: CampaignStatus) {
  const map: Record<
    CampaignStatus,
    { label: string; className: string }
  > = {
    [CampaignStatus.ACTIVE]: {
      label: "Live",
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    },
    [CampaignStatus.PENDING_APPROVAL]: {
      label: "Pending",
      className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
    },
    [CampaignStatus.PAUSED]: {
      label: "Paused",
      className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
    },
    [CampaignStatus.ENDED]: {
      label: "Ended",
      className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    },
    [CampaignStatus.REJECTED]: {
      label: "Rejected",
      className: "bg-red-500/15 text-red-400 border-red-500/25",
    },
    [CampaignStatus.DRAFT]: {
      label: "Draft",
      className: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    },
  };
  const { label, className } = map[status];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

function formatCurrency(n: number): string {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function primaryMetricLabel(c: Campaign): string {
  if (c.robotCategory === RobotCategory.HUMANOID) return "CPE";
  return "CPM";
}

function primaryMetricValue(c: Campaign): string {
  if (c.robotCategory === RobotCategory.HUMANOID) {
    return c.metrics.cpe > 0 ? `$${c.metrics.cpe.toFixed(2)}` : "--";
  }
  return c.metrics.cpm > 0 ? `$${c.metrics.cpm.toFixed(2)}` : "--";
}

function engagementOrImpressionLabel(c: Campaign): string {
  if (c.robotCategory === RobotCategory.HUMANOID) return "Engagements";
  return "Impressions";
}

function engagementOrImpressionValue(c: Campaign): string {
  if (c.robotCategory === RobotCategory.HUMANOID) {
    return formatNumber(c.metrics.engagements);
  }
  return formatNumber(c.metrics.impressions);
}

// ─── Campaign Detail Sheet ────────────────────────────────────────────────────

function CampaignDetailSheet({
  campaign,
  open,
  onClose,
}: {
  campaign: Campaign | null;
  open: boolean;
  onClose: () => void;
}) {
  const creatives = useStore((s) => s.creatives);
  const pauseCampaign = useStore((s) => s.pauseCampaign);
  const resumeCampaign = useStore((s) => s.resumeCampaign);

  if (!campaign) return null;

  const oem = getOemById(campaign.oemId);
  const moment = getMomentById(campaign.placementMomentId);
  const linkedCreatives = creatives.filter((cr) =>
    campaign.creativeIds.includes(cr.id)
  );

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center gap-2">
            {robotIcon(campaign.robotCategory)}
            <SheetTitle>{campaign.name}</SheetTitle>
          </div>
          <SheetDescription>
            {oem?.name ?? campaign.oemId} &middot;{" "}
            {moment?.label ?? campaign.placementMomentId}
          </SheetDescription>
          <div className="mt-1">{statusBadge(campaign.status)}</div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-6 pb-6">
            {/* Budget & Schedule */}
            <section>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Budget & Schedule
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <Card className="py-3">
                  <CardContent className="flex items-center gap-2 px-4 py-0">
                    <DollarSign className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="font-[family-name:var(--font-geist-mono)] text-sm font-medium">
                        {formatCurrency(campaign.budget)}{" "}
                        <span className="text-muted-foreground font-normal">
                          {campaign.budgetType}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="py-3">
                  <CardContent className="flex items-center gap-2 px-4 py-0">
                    <DollarSign className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Spent</p>
                      <p className="font-[family-name:var(--font-geist-mono)] text-sm font-medium">
                        {formatCurrency(campaign.metrics.spend)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="py-3">
                  <CardContent className="flex items-center gap-2 px-4 py-0">
                    <Calendar className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Schedule</p>
                      <p className="text-sm">
                        {campaign.schedule
                          ? `${campaign.schedule.startDate} - ${campaign.schedule.endDate}`
                          : "No schedule"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="py-3">
                  <CardContent className="flex items-center gap-2 px-4 py-0">
                    <Zap className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Bidding Model
                      </p>
                      <p className="text-sm font-medium uppercase">
                        {campaign.biddingModel}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Separator />

            {/* All Metrics */}
            <section>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Performance Metrics
              </h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Impressions</p>
                  <p className="font-[family-name:var(--font-geist-mono)] text-lg font-semibold">
                    {formatNumber(campaign.metrics.impressions)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Engagements</p>
                  <p className="font-[family-name:var(--font-geist-mono)] text-lg font-semibold">
                    {formatNumber(campaign.metrics.engagements)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Spend</p>
                  <p className="font-[family-name:var(--font-geist-mono)] text-lg font-semibold">
                    {formatCurrency(campaign.metrics.spend)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CPM</p>
                  <p className="font-[family-name:var(--font-geist-mono)] text-lg font-semibold">
                    {campaign.metrics.cpm > 0
                      ? `$${campaign.metrics.cpm.toFixed(2)}`
                      : "--"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CPE</p>
                  <p className="font-[family-name:var(--font-geist-mono)] text-lg font-semibold">
                    {campaign.metrics.cpe > 0
                      ? `$${campaign.metrics.cpe.toFixed(2)}`
                      : "--"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Engagement Rate
                  </p>
                  <p className="font-[family-name:var(--font-geist-mono)] text-lg font-semibold">
                    {campaign.metrics.engagementRate > 0
                      ? `${campaign.metrics.engagementRate.toFixed(1)}%`
                      : "--"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Verbal Completions
                  </p>
                  <p className="font-[family-name:var(--font-geist-mono)] text-lg font-semibold">
                    {formatNumber(campaign.metrics.verbalCompletions)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">QR Scan Rate</p>
                  <p className="font-[family-name:var(--font-geist-mono)] text-lg font-semibold">
                    {campaign.metrics.qrScanRate > 0
                      ? `${campaign.metrics.qrScanRate.toFixed(1)}%`
                      : "--"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Avg Dwell Time
                  </p>
                  <p className="font-[family-name:var(--font-geist-mono)] text-lg font-semibold">
                    {campaign.metrics.dwellTimeAvg > 0
                      ? `${campaign.metrics.dwellTimeAvg.toFixed(1)}s`
                      : "--"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">RDR</p>
                  <p className="font-[family-name:var(--font-geist-mono)] text-lg font-semibold">
                    {campaign.metrics.rdr > 0
                      ? `${campaign.metrics.rdr.toFixed(1)}%`
                      : "--"}
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Creatives */}
            <section>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Creatives ({linkedCreatives.length})
              </h4>
              {linkedCreatives.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No creatives attached.
                </p>
              ) : (
                <div className="space-y-2">
                  {linkedCreatives.map((cr) => (
                    <div
                      key={cr.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{cr.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {cr.formatType.replace(/_/g, " ")}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          cr.status === "live"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                            : cr.status === "validated"
                              ? "bg-blue-500/15 text-blue-400 border-blue-500/25"
                              : "bg-zinc-500/15 text-zinc-400 border-zinc-500/25"
                        }
                      >
                        {cr.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {campaign.status === CampaignStatus.ACTIVE && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pauseCampaign(campaign.id)}
                >
                  <Pause className="size-3.5" />
                  Pause
                </Button>
              )}
              {campaign.status === CampaignStatus.PAUSED && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resumeCampaign(campaign.id)}
                >
                  <Play className="size-3.5" />
                  Resume
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href="/reporting">
                  <BarChart3 className="size-3.5" />
                  View Report
                </Link>
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const campaigns = useStore((s) => s.campaigns);
  const selectedId = useStore((s) => s.selectedCampaignId);
  const selectCampaign = useStore((s) => s.selectCampaign);
  const pauseCampaign = useStore((s) => s.pauseCampaign);
  const resumeCampaign = useStore((s) => s.resumeCampaign);
  const duplicateCampaign = useStore((s) => s.duplicateCampaign);

  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">(
    "all"
  );

  const filtered =
    statusFilter === "all"
      ? campaigns
      : campaigns.filter((c) => c.status === statusFilter);

  const selected = campaigns.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Campaigns</h2>
          <p className="text-sm text-muted-foreground">
            Manage your active and upcoming robot ad campaigns
          </p>
        </div>
        <Button asChild>
          <Link href="/create">
            <Plus className="size-4" />
            New Campaign
          </Link>
        </Button>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(
          [
            { value: "all" as const, label: "All" },
            { value: CampaignStatus.ACTIVE, label: "Live" },
            { value: CampaignStatus.PENDING_APPROVAL, label: "Pending" },
            { value: CampaignStatus.PAUSED, label: "Paused" },
            { value: CampaignStatus.DRAFT, label: "Draft" },
            { value: CampaignStatus.ENDED, label: "Ended" },
          ] as const
        ).map(({ value, label }) => (
          <Button
            key={value}
            variant={statusFilter === value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(value)}
          >
            {label}
            {value === "all" ? (
              <span className="ml-1 font-[family-name:var(--font-geist-mono)] text-xs opacity-70">
                {campaigns.length}
              </span>
            ) : (
              <span className="ml-1 font-[family-name:var(--font-geist-mono)] text-xs opacity-70">
                {campaigns.filter((c) => c.status === value).length}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Campaign table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Target className="h-8 w-8 text-muted-foreground" aria-hidden />
          </div>
          <h3 className="text-base font-semibold mb-1">No campaigns found</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            {statusFilter === "all"
              ? "Launch your first robot ad campaign to start reaching customers through robotic surfaces."
              : "No campaigns match this filter."}
          </p>
          {statusFilter === "all" && (
            <Button asChild>
              <Link href="/create">Create Campaign</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>OEM</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">Primary Metric</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => selectCampaign(c.id)}
                >
                  <TableCell>{robotIcon(c.robotCategory)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getMomentById(c.placementMomentId)?.label ??
                          c.placementMomentId}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(c.status)}</TableCell>
                  <TableCell className="text-sm">
                    {getOemById(c.oemId)?.name ?? c.oemId}
                  </TableCell>
                  <TableCell className="text-right font-[family-name:var(--font-geist-mono)] text-sm">
                    {formatCurrency(c.metrics.spend)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <span className="font-[family-name:var(--font-geist-mono)] text-sm">
                        {primaryMetricValue(c)}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        {primaryMetricLabel(c)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <span className="font-[family-name:var(--font-geist-mono)] text-sm">
                        {engagementOrImpressionValue(c)}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        {engagementOrImpressionLabel(c)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className="flex items-center justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {c.status === CampaignStatus.ACTIVE && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title="Pause campaign"
                          onClick={() => pauseCampaign(c.id)}
                        >
                          <Pause className="size-3.5" />
                        </Button>
                      )}
                      {c.status === CampaignStatus.PAUSED && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title="Resume campaign"
                          onClick={() => resumeCampaign(c.id)}
                        >
                          <Play className="size-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        title="Duplicate campaign"
                        onClick={() => duplicateCampaign(c.id)}
                      >
                        <Copy className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" asChild>
                        <Link href="/reporting" title="View report">
                          <BarChart3 className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Summary row */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Eye className="size-3.5" />
            <span>
              Total impressions:{" "}
              <span className="font-[family-name:var(--font-geist-mono)] text-foreground">
                {formatNumber(
                  filtered.reduce((s, c) => s + c.metrics.impressions, 0)
                )}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            <span>
              Total engagements:{" "}
              <span className="font-[family-name:var(--font-geist-mono)] text-foreground">
                {formatNumber(
                  filtered.reduce((s, c) => s + c.metrics.engagements, 0)
                )}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="size-3.5" />
            <span>
              Total spend:{" "}
              <span className="font-[family-name:var(--font-geist-mono)] text-foreground">
                {formatCurrency(
                  filtered.reduce((s, c) => s + c.metrics.spend, 0)
                )}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Detail sheet */}
      <CampaignDetailSheet
        campaign={selected}
        open={!!selected}
        onClose={() => selectCampaign(null)}
      />
    </div>
  );
}
