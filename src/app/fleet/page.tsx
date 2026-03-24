"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Zap,
  Bot,
  TrendingUp,
  MapPin,
  Activity,
  Power,
  PowerOff,
  AlertTriangle,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
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
  fleetRevenueTimeSeries,
  fleetRoutePerformance,
  nowPlaying,
  getFleetTotals,
} from "@/fixtures/fleet-demo";

// ─── AdPod Fixture Data ─────────────────────────────────────────────────────

type AdPodStatus = "online" | "offline" | "error";

interface AdPodUnit {
  unitId: string;
  model: string;
  location: string;
  status: AdPodStatus;
  campaign: string | null;
  moment: string | null;
  impressionsToday: number;
  uptimePercent: number;
  lastSeen: string;
  imageUrl: string;
}

const ADPOD_UNITS: AdPodUnit[] = [
  {
    unitId: "G1-001",
    model: "Unitree G1",
    location: "Grafton St · Level 2",
    status: "online",
    campaign: "Heineken Summer",
    moment: "Greeting window",
    impressionsToday: 342,
    uptimePercent: 98.2,
    lastSeen: "now",
    imageUrl: "/robots/humanoid.svg",
  },
  {
    unitId: "G1-002",
    model: "Unitree G1",
    location: "Brown Thomas · Ground floor",
    status: "online",
    campaign: "Aer Lingus",
    moment: "Product Q&A",
    impressionsToday: 287,
    uptimePercent: 96.5,
    lastSeen: "now",
    imageUrl: "/robots/humanoid.svg",
  },
  {
    unitId: "OB-014",
    model: "Ottobot 2.0",
    location: "UCD Campus · Zone B",
    status: "online",
    campaign: "AIB Student",
    moment: "Route sponsorship",
    impressionsToday: 518,
    uptimePercent: 99.1,
    lastSeen: "now",
    imageUrl: "/robots/delivery.svg",
  },
  {
    unitId: "OB-015",
    model: "Ottobot 2.0",
    location: "UCD Campus · Zone D",
    status: "offline",
    campaign: null,
    moment: null,
    impressionsToday: 0,
    uptimePercent: 0,
    lastSeen: "2h ago",
    imageUrl: "/robots/delivery.svg",
  },
  {
    unitId: "KN-007",
    model: "Keenon T6",
    location: "The Ivy Dublin",
    status: "error",
    campaign: null,
    moment: null,
    impressionsToday: 0,
    uptimePercent: 0,
    lastSeen: "47 min ago",
    imageUrl: "/robots/service.svg",
  },
  {
    unitId: "KW-003",
    model: "Kiwibot",
    location: "Trinity College · Front Gate",
    status: "online",
    campaign: "Spotify Student",
    moment: "Handoff",
    impressionsToday: 203,
    uptimePercent: 94.8,
    lastSeen: "now",
    imageUrl: "/robots/delivery.svg",
  },
  {
    unitId: "H1-001",
    model: "Unitree H1",
    location: "Amazon Logistics · Bay 3",
    status: "offline",
    campaign: null,
    moment: null,
    impressionsToday: 0,
    uptimePercent: 0,
    lastSeen: "5h ago",
    imageUrl: "/robots/humanoid.svg",
  },
];

const ECPM = 0.008;

const BAR_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-1)",
];

// ─── Main Page Component ────────────────────────────────────────────────────

export default function FleetDashboardPage() {
  const totals = getFleetTotals();

  const [unitStatuses, setUnitStatuses] = useState<Record<string, AdPodStatus>>(
    () =>
      Object.fromEntries(ADPOD_UNITS.map((u) => [u.unitId, u.status]))
  );

  const [filter, setFilter] = useState<"all" | "online" | "offline" | "error">(
    "all"
  );

  // Derived counts using live statuses
  const onlineCount = Object.values(unitStatuses).filter(
    (s) => s === "online"
  ).length;
  const offlineCount = Object.values(unitStatuses).filter(
    (s) => s === "offline"
  ).length;
  const errorCount = Object.values(unitStatuses).filter(
    (s) => s === "error"
  ).length;
  const totalCount = ADPOD_UNITS.length;

  const impressionsToday = ADPOD_UNITS.reduce((sum, u) => {
    if (unitStatuses[u.unitId] === "online") return sum + u.impressionsToday;
    return sum;
  }, 0);

  const revenueToday = impressionsToday * ECPM;

  // Filtered units
  const filteredUnits = ADPOD_UNITS.filter((u) => {
    if (filter === "all") return true;
    return unitStatuses[u.unitId] === filter;
  });

  // Toggle handler
  function handleToggle(unitId: string) {
    setUnitStatuses((prev) => {
      const current = prev[unitId];
      let next: AdPodStatus;
      if (current === "online") next = "offline";
      else if (current === "offline") next = "online";
      else next = "online"; // error -> online (restart)
      return { ...prev, [unitId]: next };
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
      {/* Hero header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold tracking-tight">Fleet Revenue</h1>
          <Badge
            variant="outline"
            className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5"
          >
            Live
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Real-time earnings and fleet performance across all robots
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total Earnings"
          value={`$${totals.totalRevenue.toLocaleString()}`}
          sub="This period (OEM net share)"
          icon={<DollarSign className="h-4 w-4" />}
          accent="text-emerald-500"
          bgAccent="bg-emerald-500/10"
        />
        <KpiCard
          label="Impressions Served"
          value={formatCompact(totals.totalImpressions)}
          sub="Across all fleet units"
          icon={<Eye className="h-4 w-4" />}
          accent="text-blue-500"
          bgAccent="bg-blue-500/10"
        />
        <KpiCard
          label="Active Campaigns"
          value={String(totals.activeCampaignCount)}
          sub={`${totals.activeAdvertiserCount} advertisers`}
          icon={<Zap className="h-4 w-4" />}
          accent="text-violet-500"
          bgAccent="bg-violet-500/10"
        />
        <KpiCard
          label="Fleet Utilisation"
          value={`${totals.fleetUtilisation}%`}
          sub={`${totals.activeRobots.toLocaleString()} of ${totals.fleetSize.toLocaleString()} online`}
          icon={<Bot className="h-4 w-4" />}
          accent="text-cyan-500"
          bgAccent="bg-cyan-500/10"
        />
      </div>

      {/* ─── AdPod Summary Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="AdPods Online"
          value={`${onlineCount} / ${totalCount}`}
          sub="Units currently active"
          icon={<Wifi className="h-4 w-4" />}
          accent="text-green-500"
          bgAccent="bg-green-500/10"
        />
        <KpiCard
          label="Impressions Today"
          value={formatCompact(impressionsToday)}
          sub="From online AdPod units"
          icon={<Eye className="h-4 w-4" />}
          accent="text-blue-500"
          bgAccent="bg-blue-500/10"
        />
        <KpiCard
          label="Revenue Today"
          value={`$${revenueToday.toFixed(2)}`}
          sub={`eCPM $${ECPM.toFixed(3)}`}
          icon={<DollarSign className="h-4 w-4" />}
          accent="text-emerald-500"
          bgAccent="bg-emerald-500/10"
        />
        <KpiCard
          label="Errors"
          value={String(errorCount)}
          sub={errorCount > 0 ? "Requires attention" : "All systems nominal"}
          icon={<AlertTriangle className="h-4 w-4" />}
          accent={errorCount > 0 ? "text-red-500" : "text-muted-foreground"}
          bgAccent={errorCount > 0 ? "bg-red-500/10" : "bg-muted/50"}
        />
      </div>

      {/* ─── AdPod Fleet Status ──────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold">AdPod Fleet Status</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Live status and controls for all AdPod units
              </p>
            </div>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2 mb-5">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All units
              <Badge
                variant="secondary"
                className="ml-1.5 text-[10px] px-1.5 py-0"
              >
                {totalCount}
              </Badge>
            </Button>
            <Button
              variant={filter === "online" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("online")}
            >
              <Wifi className="h-3.5 w-3.5 mr-1" />
              Online
              <Badge
                variant="secondary"
                className="ml-1.5 text-[10px] px-1.5 py-0"
              >
                {onlineCount}
              </Badge>
            </Button>
            <Button
              variant={filter === "offline" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("offline")}
            >
              <WifiOff className="h-3.5 w-3.5 mr-1" />
              Offline
              <Badge
                variant="secondary"
                className="ml-1.5 text-[10px] px-1.5 py-0"
              >
                {offlineCount}
              </Badge>
            </Button>
            <Button
              variant={filter === "error" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("error")}
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              Errors
              <Badge
                variant="secondary"
                className="ml-1.5 text-[10px] px-1.5 py-0"
              >
                {errorCount}
              </Badge>
            </Button>
          </div>

          {/* Unit cards grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredUnits.map((unit) => {
              const status = unitStatuses[unit.unitId];
              return (
                <AdPodUnitCard
                  key={unit.unitId}
                  unit={unit}
                  status={status}
                  onToggle={() => handleToggle(unit.unitId)}
                />
              );
            })}
            {filteredUnits.length === 0 && (
              <div className="col-span-2 text-center py-12 text-muted-foreground text-sm">
                No AdPod units match the selected filter.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Now Playing — live feed */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Now Playing</h3>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs text-muted-foreground">
                Live feed
              </span>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Robot Unit ID</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Advertiser</TableHead>
                <TableHead>Creative</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nowPlaying.map((item) => (
                <TableRow key={item.robotUnitId}>
                  <TableCell>
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                  </TableCell>
                  <TableCell className="font-[family-name:var(--font-geist-mono)] text-sm font-medium">
                    {item.robotUnitId}
                  </TableCell>
                  <TableCell className="text-sm">{item.campaignName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.advertiser}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.creativeName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{item.route}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-[family-name:var(--font-geist-mono)] text-xs text-muted-foreground">
                    {formatTime(item.startedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Route */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Revenue by Route</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Top performing delivery zones
                </p>
              </div>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={fleetRoutePerformance}
                  layout="vertical"
                  margin={{ left: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    className="text-xs"
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="route"
                    width={130}
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
                    formatter={(value) => [
                      `$${Number(value).toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={20}>
                    {fleetRoutePerformance.map((_, i) => (
                      <Cell
                        key={i}
                        fill={BAR_COLORS[i % BAR_COLORS.length]}
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Over Time */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Revenue Over Time</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Monthly fleet ad revenue trend
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                <TrendingUp className="h-3.5 w-3.5" />
                +32% MoM
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fleetRevenueTimeSeries}>
                  <defs>
                    <linearGradient
                      id="fleetRevenueGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--color-chart-1)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--color-chart-1)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    className="text-xs"
                  />
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
                      "Revenue",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                    fill="url(#fleetRevenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-3 justify-center">
              <div className="flex items-center gap-2 text-xs">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "var(--color-chart-1)" }}
                />
                <span className="text-muted-foreground">Revenue</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── AdPod Unit Card ────────────────────────────────────────────────────────

function AdPodUnitCard({
  unit,
  status,
  onToggle,
}: {
  unit: AdPodUnit;
  status: AdPodStatus;
  onToggle: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  const ringClass =
    status === "online"
      ? "ring-2 ring-[#1D9E75]"
      : status === "error"
        ? "ring-2 ring-[#E24B4A]"
        : "ring-2 ring-border";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Robot thumbnail */}
          <div
            className={`relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden ${ringClass}`}
          >
            {imgError ? (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Bot className="h-6 w-6 text-muted-foreground" />
              </div>
            ) : (
              <Image
                src={unit.imageUrl}
                alt={unit.model}
                fill
                className="object-cover"
                sizes="48px"
                onError={() => setImgError(true)}
                unoptimized
              />
            )}
          </div>

          {/* Info block */}
          <div className="flex-1 min-w-0">
            {/* Row: unit ID + status pill */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-[family-name:var(--font-geist-mono)] text-sm font-bold">
                {unit.unitId}
              </span>
              <span className="text-xs text-muted-foreground">
                {unit.model}
              </span>
              <StatusPill status={status} />
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {unit.location}
              </span>
            </div>

            {/* Status-specific content */}
            {status === "online" && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium">
                    {unit.campaign}
                  </span>
                  {unit.moment && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {unit.moment}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span className="font-[family-name:var(--font-geist-mono)]">
                      {unit.impressionsToday.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span className="font-[family-name:var(--font-geist-mono)]">
                      {unit.uptimePercent}%
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${unit.uptimePercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {status === "offline" && (
              <p className="mt-3 text-xs text-muted-foreground italic">
                AdPod offline — no impressions serving. Turn on to resume
                campaigns.
              </p>
            )}

            {status === "error" && (
              <div className="mt-3 flex items-start gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-400">
                  AdPod connection lost — last seen {unit.lastSeen}. Check
                  device network.
                </p>
              </div>
            )}
          </div>

          {/* Toggle button */}
          <div className="flex-shrink-0">
            {status === "online" && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggle}
                className="gap-1.5"
              >
                <PowerOff className="h-3.5 w-3.5" />
                Turn Off
              </Button>
            )}
            {status === "offline" && (
              <Button size="sm" onClick={onToggle} className="gap-1.5">
                <Power className="h-3.5 w-3.5" />
                Turn On
              </Button>
            )}
            {status === "error" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onToggle}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Restart
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Status Pill ────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: AdPodStatus }) {
  if (status === "online") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        Online
      </span>
    );
  }

  if (status === "offline") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-500/15 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-zinc-400" />
        Offline
      </span>
    );
  }

  // error
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-400">
      <span className="relative flex h-1.5 w-1.5">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"
          style={{ animationDuration: "0.75s" }}
        />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400" />
      </span>
      Error
    </span>
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
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-md ${bgAccent} ${accent}`}
          >
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight font-[family-name:var(--font-geist-mono)]">
          {value}
        </p>
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

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
