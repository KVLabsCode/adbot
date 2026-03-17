"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  DollarSign,
  Eye,
  Zap,
  TrendingUp,
  BarChart3,
  Pause,
  Play,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getAdvertiserById,
  getCampaignsForAdvertiser,
  getAdvertiserTimeSeries,
  type OemCampaign,
} from "@/fixtures/oem-demo";

export default function AdvertiserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const adv = getAdvertiserById(id);
  const baseCampaigns = getCampaignsForAdvertiser(id);
  const timeSeries = getAdvertiserTimeSeries(id);

  // Local campaign state so OEM can toggle on/off
  const [campaigns, setCampaigns] = useState(baseCampaigns);
  const [copiedLink, setCopiedLink] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  if (!adv) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Advertiser not found.</p>
        <Link href="/oem/advertisers" className="text-sm text-emerald-500 hover:underline mt-2 inline-block">
          Back to advertisers
        </Link>
      </div>
    );
  }

  const pendingCampaign = confirmTarget
    ? campaigns.find((c) => c.id === confirmTarget)
    : null;
  const pendingAction = pendingCampaign?.status === "active" ? "pause" : "resume";

  const confirmToggle = () => {
    if (!confirmTarget) return;
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === confirmTarget
          ? { ...c, status: c.status === "active" ? "paused" as const : "active" as const }
          : c
      )
    );
    setConfirmTarget(null);
  };

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/a/${id}`
    : `/a/${id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const totalCampaignSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalCampaignImpressions = activeCampaigns.reduce((s, c) => s + c.impressions, 0);
  const totalCampaignRevenue = activeCampaigns.reduce((s, c) => s + c.revenueGenerated, 0);
  const avgCtr = activeCampaigns.length > 0
    ? activeCampaigns.reduce((s, c) => s + c.ctr, 0) / activeCampaigns.length
    : 0;
  const ecpm = totalCampaignImpressions > 0
    ? (totalCampaignRevenue / totalCampaignImpressions) * 1000
    : 0;

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] space-y-8">
      {/* Breadcrumb + Header */}
      <div>
        <Link
          href="/oem/advertisers"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to advertisers
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
              style={{ backgroundColor: adv.accentColor }}
            >
              {adv.logoInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{adv.name}</h1>
                <StatusBadge status={adv.status} />
              </div>
              <p className="text-sm text-muted-foreground">{adv.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {adv.status === "active" ? (
              <Button variant="outline" size="sm">
                <Pause className="h-3.5 w-3.5 mr-1.5" />
                Pause All
              </Button>
            ) : adv.status === "paused" ? (
              <Button variant="outline" size="sm">
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Resume All
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy Share Link
                </>
              )}
            </Button>
            <Link href={`/a/${id}`} target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Advertiser View
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard
          label="Total Spend"
          value={`$${totalCampaignSpend.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4" />}
          accent="text-blue-500"
          bgAccent="bg-blue-500/10"
        />
        <KpiCard
          label="Impressions"
          value={formatCompact(totalCampaignImpressions)}
          icon={<Eye className="h-4 w-4" />}
          accent="text-violet-500"
          bgAccent="bg-violet-500/10"
        />
        <KpiCard
          label="Revenue to Fleet"
          value={`$${totalCampaignRevenue.toLocaleString()}`}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="text-emerald-500"
          bgAccent="bg-emerald-500/10"
        />
        <KpiCard
          label="Avg CTR"
          value={`${avgCtr.toFixed(1)}%`}
          icon={<Zap className="h-4 w-4" />}
          accent="text-amber-500"
          bgAccent="bg-amber-500/10"
        />
        <KpiCard
          label="eCPM"
          value={`$${ecpm.toFixed(2)}`}
          icon={<BarChart3 className="h-4 w-4" />}
          accent="text-cyan-500"
          bgAccent="bg-cyan-500/10"
        />
      </div>

      {/* Performance Chart */}
      {timeSeries.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold">Spend & Revenue Over Time</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Advertiser spend vs. fleet revenue generated
              </p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-xs" />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-xs"
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [
                      `$${Number(value).toLocaleString()}`,
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                    fill="url(#spendGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#revGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-3 justify-center">
              <div className="flex items-center gap-2 text-xs">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-chart-1)" }} />
                <span className="text-muted-foreground">Ad Spend</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Fleet Revenue</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns Table with toggles */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Campaigns</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeCampaigns.length} active of {campaigns.length} total &mdash; toggle ads on or off
              </p>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Live</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Route</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id} className={c.status !== "active" ? "opacity-50" : ""}>
                  <TableCell>
                    <Switch
                      checked={c.status === "active"}
                      onCheckedChange={() => setConfirmTarget(c.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{c.name}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.route}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    ${c.spend.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {c.impressions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {c.ctr}%
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-emerald-500">
                    ${c.revenueGenerated.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                    No campaigns yet. This advertiser was recently invited.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmTarget} onOpenChange={(open) => !open && setConfirmTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {pendingAction === "pause" ? (
                <Pause className="h-4 w-4 text-amber-500" />
              ) : (
                <Play className="h-4 w-4 text-emerald-500" />
              )}
              {pendingAction === "pause" ? "Pause Campaign?" : "Resume Campaign?"}
            </DialogTitle>
            <DialogDescription>
              {pendingAction === "pause"
                ? `This will stop "${pendingCampaign?.name}" from running on your fleet. The advertiser will no longer see impressions for this campaign.`
                : `This will re-activate "${pendingCampaign?.name}" on your fleet. Ads will start serving again immediately.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmTarget(null)}>
              Cancel
            </Button>
            {pendingAction === "pause" ? (
              <Button
                variant="destructive"
                onClick={confirmToggle}
              >
                <Pause className="h-3.5 w-3.5 mr-1.5" />
                Pause Campaign
              </Button>
            ) : (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={confirmToggle}
              >
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Resume Campaign
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ROI Summary Card */}
      {totalCampaignSpend > 0 && (
        <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <h3 className="text-sm font-semibold">ROI Summary</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Advertiser Spend</p>
                <p className="text-lg font-bold">${totalCampaignSpend.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fleet Revenue Share</p>
                <p className="text-lg font-bold text-emerald-500">
                  ${totalCampaignRevenue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Revenue Rate</p>
                <p className="text-lg font-bold">
                  {totalCampaignSpend > 0
                    ? ((totalCampaignRevenue / totalCampaignSpend) * 100).toFixed(1)
                    : "0"}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Est. Reach</p>
                <p className="text-lg font-bold">
                  {formatCompact(Math.round(totalCampaignImpressions * 0.62))} people
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon,
  accent,
  bgAccent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  bgAccent: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <div className={`flex h-6 w-6 items-center justify-center rounded-md ${bgAccent} ${accent}`}>
            {icon}
          </div>
        </div>
        <p className="text-xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return (
        <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5 text-[11px]">
          Active
        </Badge>
      );
    case "invited":
      return (
        <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/5 text-[11px]">
          Invited
        </Badge>
      );
    case "paused":
      return (
        <Badge variant="outline" className="text-muted-foreground border-border text-[11px]">
          Paused
        </Badge>
      );
    default:
      return null;
  }
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}
