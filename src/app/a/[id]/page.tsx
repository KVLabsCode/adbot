"use client";

import { use } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  DollarSign,
  Eye,
  TrendingUp,
  Zap,
  Users,
  Clock,
  QrCode,
  MapPin,
  Radio,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  getAdvertiserById,
  getCampaignsForAdvertiser,
  getAdvertiserTimeSeries,
  oemOrg,
  oemRoutePerformance,
} from "@/fixtures/oem-demo";
import { cn } from "@/lib/utils";

const ROUTE_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#10b981"];

export default function PublicAdvertiserDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const adv = getAdvertiserById(id);
  const allCampaigns = getCampaignsForAdvertiser(id);
  const campaigns = allCampaigns.filter((c) => c.status === "active");
  const timeSeries = getAdvertiserTimeSeries(id);

  if (!adv) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">This dashboard link is invalid or has expired.</p>
      </div>
    );
  }

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const avgCtr = campaigns.length > 0
    ? campaigns.reduce((s, c) => s + c.ctr, 0) / campaigns.length
    : 0;
  const reach = Math.round(totalImpressions * 0.62);
  const qrScans = Math.round(totalImpressions * 0.013);
  const avgDwell = 7.8;
  const frequency = 2.4;
  const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  const costPerPerson = reach > 0 ? totalSpend / reach : 0;

  // Route breakdown for this advertiser
  const routeBreakdown = campaigns.reduce<Record<string, { impressions: number; spend: number; qr: number }>>((acc, c) => {
    if (!acc[c.route]) acc[c.route] = { impressions: 0, spend: 0, qr: 0 };
    acc[c.route].impressions += c.impressions;
    acc[c.route].spend += c.spend;
    acc[c.route].qr += Math.round(c.impressions * 0.013);
    return acc;
  }, {});
  const routeData = Object.entries(routeBreakdown)
    .map(([route, data]) => ({ route, ...data }))
    .sort((a, b) => b.impressions - a.impressions);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-[1000px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: adv.accentColor }}
            >
              {adv.logoInitials}
            </div>
            <div>
              <h1 className="text-lg font-bold">{adv.name}</h1>
              <p className="text-xs text-muted-foreground">Campaign Performance Report</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Powered by</span>
            <span className="font-semibold bg-gradient-to-r from-kovio-blue to-kovio-violet bg-clip-text text-transparent">
              Kovio
            </span>
            <span>&times;</span>
            <span className="font-medium text-foreground">{oemOrg.name}</span>
          </div>
        </div>
      </header>

      <div className="max-w-[1000px] mx-auto px-6 py-8 space-y-8">
        {/* Primary KPIs */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <ReportKpi
            label="Your Spend"
            value={`$${totalSpend.toLocaleString()}`}
            icon={<DollarSign className="h-4 w-4" />}
            accent="text-blue-500"
            bg="bg-blue-500/10"
          />
          <ReportKpi
            label="Ad Impressions"
            value={formatCompact(totalImpressions)}
            icon={<Eye className="h-4 w-4" />}
            accent="text-violet-500"
            bg="bg-violet-500/10"
          />
          <ReportKpi
            label="Engagement Rate"
            value={`${avgCtr.toFixed(1)}%`}
            icon={<Zap className="h-4 w-4" />}
            accent="text-amber-500"
            bg="bg-amber-500/10"
          />
          <ReportKpi
            label="People Reached"
            value={formatCompact(reach)}
            icon={<Users className="h-4 w-4" />}
            accent="text-emerald-500"
            bg="bg-emerald-500/10"
          />
        </div>

        {/* Engagement KPIs */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <ReportKpi
            label="Avg Dwell Time"
            value={`${avgDwell}s`}
            icon={<Clock className="h-4 w-4" />}
            accent="text-orange-500"
            bg="bg-orange-500/10"
          />
          <ReportKpi
            label="QR Scans"
            value={qrScans.toLocaleString()}
            icon={<QrCode className="h-4 w-4" />}
            accent="text-teal-500"
            bg="bg-teal-500/10"
          />
          <ReportKpi
            label="Avg Frequency"
            value={`${frequency}x`}
            icon={<Radio className="h-4 w-4" />}
            accent="text-indigo-500"
            bg="bg-indigo-500/10"
          />
          <ReportKpi
            label="Cost per 1K Views"
            value={`$${cpm.toFixed(2)}`}
            icon={<TrendingUp className="h-4 w-4" />}
            accent="text-pink-500"
            bg="bg-pink-500/10"
          />
        </div>

        {/* ROI Banner */}
        {totalSpend > 0 && (
          <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Campaign ROI Summary</p>
                    <p className="text-xs text-muted-foreground">
                      {campaigns.length} active campaign{campaigns.length !== 1 && "s"} across {oemOrg.name}&apos;s robot fleet
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Cost per person</p>
                    <p className="text-xl font-bold">${costPerPerson.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Cost per QR scan</p>
                    <p className="text-xl font-bold">
                      ${qrScans > 0 ? (totalSpend / qrScans).toFixed(2) : "0.00"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Over Time */}
        {timeSeries.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold">Performance Over Time</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Monthly ad spend and impressions across the robot network
                </p>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeries}>
                    <defs>
                      <linearGradient id="pubSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
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
                      formatter={(value) => [`$${Number(value).toLocaleString()}`]}
                    />
                    <Area type="monotone" dataKey="spend" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#pubSpend)" name="Spend" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Route Comparison */}
        {routeData.length > 1 && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold">Performance by Delivery Zone</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Compare how your campaigns perform across different routes
                  </p>
                </div>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={routeData} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} className="text-xs" tickFormatter={(v: number) => formatCompact(v)} />
                    <YAxis type="category" dataKey="route" width={130} tick={{ fontSize: 11 }} className="text-xs" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [Number(value).toLocaleString(), "Impressions"]}
                    />
                    <Bar dataKey="impressions" radius={[0, 4, 4, 0]} barSize={18}>
                      {routeData.map((_, i) => (
                        <Cell key={i} fill={ROUTE_COLORS[i % ROUTE_COLORS.length]} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaigns Table */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-3">Your Campaigns</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery Zone</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Engagement</TableHead>
                  <TableHead className="text-right">QR Scans</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allCampaigns.map((c) => (
                  <TableRow key={c.id} className={c.status !== "active" ? "opacity-40" : ""}>
                    <TableCell className="text-sm font-medium">{c.name}</TableCell>
                    <TableCell>
                      {c.status === "active" ? (
                        <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5 text-[10px]">
                          Live
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground border-border text-[10px]">
                          {c.status === "paused" ? "Paused" : "Done"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.route}</TableCell>
                    <TableCell className="text-right font-mono text-sm">${c.spend.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{c.impressions.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{c.ctr}%</TableCell>
                    <TableCell className="text-right font-mono text-sm">{Math.round(c.impressions * 0.013).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t space-y-1">
          <p>
            Robot-native advertising powered by{" "}
            <span className="font-semibold bg-gradient-to-r from-kovio-blue to-kovio-violet bg-clip-text text-transparent">
              Kovio
            </span>{" "}
            &times; {oemOrg.name}
          </p>
          <p className="text-[10px]">
            Data reflects campaign performance to date. Reach and frequency are estimated.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function ReportKpi({
  label,
  value,
  icon,
  accent,
  bg,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <div className={cn("flex h-6 w-6 items-center justify-center rounded-md", bg, accent)}>
            {icon}
          </div>
        </div>
        <p className="text-xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}
