"use client";

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
  Users,
  Zap,
  TrendingUp,
  Bot,
  MapPin,
  ArrowUpRight,
  Clock,
  QrCode,
  Footprints,
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
import Link from "next/link";
import {
  oemOrg,
  oemRevenueTimeSeries,
  oemRoutePerformance,
  oemCampaigns,
  oemAdvertisers,
  oemTimeOfDay,
  getOemTotals,
  getEngagementData,
} from "@/fixtures/oem-demo";

const BAR_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-1)",
];

export default function OemOverviewPage() {
  const totals = getOemTotals();
  const engagement = getEngagementData();
  const topCampaigns = [...oemCampaigns]
    .sort((a, b) => b.revenueGenerated - a.revenueGenerated)
    .slice(0, 8);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] space-y-8">
      {/* Hero header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold tracking-tight">Fleet Overview</h1>
          <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5">
            Live
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {oemOrg.name} &mdash; {oemOrg.regions.join(", ")}
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard
          label="Total Revenue"
          value={`$${totals.totalRevenue.toLocaleString()}`}
          sub={`$${totals.revenuePerRobot}/robot`}
          icon={<DollarSign className="h-4 w-4" />}
          accent="text-emerald-500"
          bgAccent="bg-emerald-500/10"
        />
        <KpiCard
          label="Total Impressions"
          value={formatCompact(totals.totalImpressions)}
          sub={`eCPM $${totals.ecpm.toFixed(2)}`}
          icon={<Eye className="h-4 w-4" />}
          accent="text-blue-500"
          bgAccent="bg-blue-500/10"
        />
        <KpiCard
          label="Active Campaigns"
          value={String(totals.activeCampaignCount)}
          sub={`${totals.totalCampaignCount} total`}
          icon={<Zap className="h-4 w-4" />}
          accent="text-violet-500"
          bgAccent="bg-violet-500/10"
        />
        <KpiCard
          label="Advertisers"
          value={String(totals.activeAdvertiserCount)}
          sub={`${totals.totalAdvertiserCount} total`}
          icon={<Users className="h-4 w-4" />}
          accent="text-amber-500"
          bgAccent="bg-amber-500/10"
        />
        <KpiCard
          label="Fleet Utilisation"
          value={`${totals.fleetUtilisation}%`}
          sub={`${oemOrg.activeRobots.toLocaleString()} online`}
          icon={<Bot className="h-4 w-4" />}
          accent="text-cyan-500"
          bgAccent="bg-cyan-500/10"
        />
      </div>

      {/* Engagement & Pilot Data */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Pass-By Count"
          value={formatCompact(engagement.totalPassBys)}
          sub="People who walked past robots"
          icon={<Footprints className="h-4 w-4" />}
          accent="text-pink-500"
          bgAccent="bg-pink-500/10"
        />
        <KpiCard
          label="Avg Dwell Time"
          value={`${engagement.avgDwellSeconds}s`}
          sub="Time people look at ads"
          icon={<Clock className="h-4 w-4" />}
          accent="text-orange-500"
          bgAccent="bg-orange-500/10"
        />
        <KpiCard
          label="QR Scans"
          value={formatCompact(engagement.totalQrScans)}
          sub={`${engagement.qrScanRate.toFixed(1)}% scan rate`}
          icon={<QrCode className="h-4 w-4" />}
          accent="text-teal-500"
          bgAccent="bg-teal-500/10"
        />
        <KpiCard
          label="Est. Reach"
          value={formatCompact(engagement.estimatedReach)}
          sub={`${engagement.frequency}x avg frequency`}
          icon={<Radio className="h-4 w-4" />}
          accent="text-indigo-500"
          bgAccent="bg-indigo-500/10"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue over time */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Revenue Over Time</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Monthly ad revenue from fleet monetisation
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                <TrendingUp className="h-3.5 w-3.5" />
                +32% MoM
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={oemRevenueTimeSeries}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
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
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Impressions by Route */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Impressions by Route</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Top performing delivery routes
                </p>
              </div>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={oemRoutePerformance}
                  layout="vertical"
                  margin={{ left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    className="text-xs"
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="route"
                    width={120}
                    tick={{ fontSize: 11 }}
                    className="text-xs"
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [Number(value).toLocaleString(), "Impressions"]}
                  />
                  <Bar dataKey="impressions" radius={[0, 4, 4, 0]} barSize={20}>
                    {oemRoutePerformance.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Leaderboard + Top Advertisers */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Campaign Leaderboard */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Campaign Leaderboard</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Top campaigns by revenue generated
                </p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Advertiser</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCampaigns.map((c, i) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {i + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{c.name}</span>
                        {c.status === "active" && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.advertiser}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.route}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {c.impressions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-emerald-500">
                      ${c.revenueGenerated.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {c.ctr}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Advertisers */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Top Advertisers</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  By revenue contribution
                </p>
              </div>
              <Link
                href="/oem/advertisers"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
              >
                View all
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {[...oemAdvertisers]
                .filter((a) => a.status === "active")
                .sort((a, b) => b.revenueGenerated - a.revenueGenerated)
                .slice(0, 5)
                .map((adv, i) => {
                  const maxRev = oemAdvertisers[0]?.revenueGenerated || 1;
                  const pct = Math.round((adv.revenueGenerated / maxRev) * 100);
                  return (
                    <Link
                      key={adv.id}
                      href={`/oem/advertiser/${adv.id}`}
                      className="block group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: adv.accentColor }}
                          >
                            {adv.logoInitials}
                          </div>
                          <span className="text-sm font-medium group-hover:text-foreground transition-colors">
                            {adv.name}
                          </span>
                        </div>
                        <span className="text-sm font-mono text-emerald-500">
                          ${adv.revenueGenerated.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: adv.accentColor,
                            opacity: 0.7,
                          }}
                        />
                      </div>
                    </Link>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time-of-Day Performance */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Time-of-Day Performance</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Impressions and pass-by traffic by hour across all routes
              </p>
            </div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={oemTimeOfDay}>
                <defs>
                  <linearGradient id="todImpr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="todPass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} className="text-xs" interval={1} />
                <YAxis tick={{ fontSize: 10 }} className="text-xs" tickFormatter={(v: number) => formatCompact(v)} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [Number(value).toLocaleString()]}
                />
                <Area type="monotone" dataKey="passBys" stroke="var(--color-chart-2)" strokeWidth={1.5} fill="url(#todPass)" name="Pass-bys" />
                <Area type="monotone" dataKey="impressions" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#todImpr)" name="Impressions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-3 justify-center">
            <div className="flex items-center gap-2 text-xs">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-chart-1)" }} />
              <span className="text-muted-foreground">Impressions</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-chart-2)" }} />
              <span className="text-muted-foreground">Pass-by traffic</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Route Performance Table (with engagement data) */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Route Performance</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Impressions, engagement, and revenue across delivery zones
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead className="text-right">Robots</TableHead>
                <TableHead className="text-right">Pass-bys</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Dwell</TableHead>
                <TableHead className="text-right">QR Scans</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {oemRoutePerformance.map((r) => (
                <TableRow key={r.route}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{r.route}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {r.robots}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCompact(r.passBys)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {r.impressions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {r.dwellTimeAvg}s
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {r.qrScans.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-emerald-500">
                    ${r.revenue.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon,
  accent,
  bgAccent,
}: {
  label: string;
  value: string;
  sub: string;
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
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}
