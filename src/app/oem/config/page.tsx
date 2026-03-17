"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Clock,
  Eye,
  Hand,
  Package,
  Radar,
  Route,
  MapPin,
  Bot,
  DollarSign,
  TrendingUp,
  Shield,
  Zap,
  Sparkles,
  SlidersHorizontal,
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
import { oemRoutePerformance, oemCampaigns } from "@/fixtures/oem-demo";
import { cn } from "@/lib/utils";

// ─── Moment definitions ─────────────────────────────────────────────────────

interface AdMoment {
  id: string;
  name: string;
  what: string;
  icon: React.ReactNode;
  enabled: boolean;
  revenuePerMonth: number;
  impressionsPerMonth: number;
}

const initialMoments: AdMoment[] = [
  {
    id: "route",
    name: "On-Route Display",
    what: "Ads show on the robot's screen while it travels busy streets",
    icon: <Route className="h-5 w-5" />,
    enabled: true,
    revenuePerMonth: 6_840,
    impressionsPerMonth: 412_000,
  },
  {
    id: "idle",
    name: "Waiting & Idle",
    what: "Ads display when the robot is stationary — outside a store, at a light, in a queue",
    icon: <Clock className="h-5 w-5" />,
    enabled: true,
    revenuePerMonth: 2_940,
    impressionsPerMonth: 189_000,
  },
  {
    id: "interaction",
    name: "Customer Interaction",
    what: "Ads appear when someone taps, scans, or opens the robot's lid",
    icon: <Hand className="h-5 w-5" />,
    enabled: true,
    revenuePerMonth: 5_210,
    impressionsPerMonth: 287_000,
  },
  {
    id: "handoff",
    name: "Pickup & Dropoff",
    what: "Ads during delivery handoff — highest attention, highest value",
    icon: <Package className="h-5 w-5" />,
    enabled: true,
    revenuePerMonth: 7_120,
    impressionsPerMonth: 356_000,
  },
  {
    id: "contextual",
    name: "Contextual Triggers",
    what: "Ads triggered by context — near a coffee shop at 8am, near a gym at 6pm",
    icon: <Radar className="h-5 w-5" />,
    enabled: false,
    revenuePerMonth: 1_470,
    impressionsPerMonth: 98_000,
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function OemConfigPage() {
  const [moments, setMoments] = useState(initialMoments);
  const [adsPerTrip, setAdsPerTrip] = useState(3);
  const [quietStart, setQuietStart] = useState(22);
  const [quietEnd, setQuietEnd] = useState(7);
  const [motionBlock, setMotionBlock] = useState(true);
  const [maxPause, setMaxPause] = useState(15);
  const [mode, setMode] = useState<"smart" | "manual">("smart");
  const [simRoute, setSimRoute] = useState(oemRoutePerformance[0].route);

  const enabled = moments.filter((m) => m.enabled);
  const totalRevenue = enabled.reduce((s, m) => s + m.revenuePerMonth, 0);
  const totalImpressions = enabled.reduce((s, m) => s + m.impressionsPerMonth, 0);

  const toggle = (id: string) =>
    setMoments((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] space-y-10">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Monetisation Config
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose when your robots earn, set safety rules, and preview revenue.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-card p-1">
          <button
            onClick={() => setMode("smart")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              mode === "smart"
                ? "bg-emerald-500/10 text-emerald-500"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Auto
          </button>
          <button
            onClick={() => setMode("manual")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              mode === "manual"
                ? "bg-blue-500/10 text-blue-500"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Manual
          </button>
        </div>
      </div>

      {/* ── Revenue estimate banner ─────────────────────────────────── */}
      <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Estimated Monthly Revenue</p>
                <p className="text-xs text-muted-foreground">
                  With {enabled.length} ad moment{enabled.length !== 1 && "s"} enabled
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-500">
                  ${totalRevenue.toLocaleString()}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatCompact(totalImpressions)} impressions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 1 — Ad Moments
          ════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Ad Moments</h2>
          <p className="text-sm text-muted-foreground">
            When should your robots show ads? Toggle each moment on or off.
          </p>
        </div>

        <div className="grid gap-3">
          {moments.map((m) => (
            <Card
              key={m.id}
              className={cn(
                "transition-all duration-200",
                !m.enabled && "opacity-50"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl shrink-0 transition-colors",
                      m.enabled
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {m.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{m.name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {m.what}
                    </p>
                  </div>

                  {/* Revenue chip */}
                  <div className="text-right shrink-0 hidden sm:block">
                    <p
                      className={cn(
                        "text-sm font-bold font-mono",
                        m.enabled ? "text-emerald-500" : "text-muted-foreground"
                      )}
                    >
                      +${m.revenuePerMonth.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">/ month</p>
                  </div>

                  {/* Toggle */}
                  <Switch
                    checked={m.enabled}
                    onCheckedChange={() => toggle(m.id)}
                    className="shrink-0"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 2 — Safety Rules
          ════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Safety Rules
          </h2>
          <p className="text-sm text-muted-foreground">
            Set boundaries so ads never get in the way of deliveries.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Ads per trip */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Ads per trip</p>
                  <p className="text-xs text-muted-foreground">
                    Max ads a robot can show in one delivery
                  </p>
                </div>
                <span className="text-2xl font-bold font-mono">{adsPerTrip}</span>
              </div>
              <Slider
                value={[adsPerTrip]}
                min={1}
                max={8}
                step={1}
                onValueChange={([v]) => setAdsPerTrip(v)}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </CardContent>
          </Card>

          {/* Max pause */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Max ad pause</p>
                  <p className="text-xs text-muted-foreground">
                    Longest a robot can pause to show an ad
                  </p>
                </div>
                <span className="text-2xl font-bold font-mono">{maxPause}s</span>
              </div>
              <Slider
                value={[maxPause]}
                min={5}
                max={60}
                step={5}
                onValueChange={([v]) => setMaxPause(v)}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>5 sec</span>
                <span>60 sec</span>
              </div>
            </CardContent>
          </Card>

          {/* Quiet hours */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <div>
                <p className="text-sm font-medium">Quiet hours</p>
                <p className="text-xs text-muted-foreground">
                  No ads during these hours
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={String(quietStart)}
                  onValueChange={(v) => setQuietStart(Number(v))}
                >
                  <SelectTrigger className="h-9 text-sm flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {fmtHour(i)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground text-sm">to</span>
                <Select
                  value={String(quietEnd)}
                  onValueChange={(v) => setQuietEnd(Number(v))}
                >
                  <SelectTrigger className="h-9 text-sm flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {fmtHour(i)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Motion block */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Motion block</p>
                  <p className="text-xs text-muted-foreground">
                    Pause screen ads while robot is moving
                  </p>
                </div>
                <Switch
                  checked={motionBlock}
                  onCheckedChange={setMotionBlock}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">
                {motionBlock
                  ? "Screen ads only show when stationary. Audio ads still play."
                  : "Screen ads play at all times, including during motion."}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 3 — Route Simulator
          ════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-violet-500" />
            Route Simulator
          </h2>
          <p className="text-sm text-muted-foreground">
            Pick a route to see how much revenue it generates.
          </p>
        </div>

        <RouteSimulator
          selectedRoute={simRoute}
          onRouteChange={setSimRoute}
          enabledMoments={enabled}
          adsPerTrip={adsPerTrip}
          quietStart={quietStart}
          quietEnd={quietEnd}
        />
      </section>
    </div>
  );
}

// ─── Route Simulator ────────────────────────────────────────────────────────

function RouteSimulator({
  selectedRoute,
  onRouteChange,
  enabledMoments,
  adsPerTrip,
  quietStart,
  quietEnd,
}: {
  selectedRoute: string;
  onRouteChange: (r: string) => void;
  enabledMoments: AdMoment[];
  adsPerTrip: number;
  quietStart: number;
  quietEnd: number;
}) {
  const route = oemRoutePerformance.find((r) => r.route === selectedRoute);
  const campaigns = oemCampaigns.filter(
    (c) => c.route === selectedRoute && c.status === "active"
  );

  const robots = route?.robots ?? 0;
  const base = route?.impressions ?? 0;
  const momentScale = enabledMoments.length / 5;
  const tripScale = Math.min(adsPerTrip / 5, 1);
  const impressions = Math.round(base * momentScale * tripScale);
  const revenue = route
    ? Math.round(route.revenue * momentScale * tripScale)
    : 0;
  const perRobot = robots > 0 ? Math.round(revenue / robots) : 0;

  // Hourly curve (synthetic)
  const hourly = Array.from({ length: 24 }, (_, h) => {
    const quiet =
      quietStart > quietEnd
        ? h >= quietStart || h < quietEnd
        : h >= quietStart && h < quietEnd;
    const peak =
      h >= 7 && h <= 9
        ? 1.8
        : h >= 11 && h <= 13
        ? 2.2
        : h >= 17 && h <= 19
        ? 2.0
        : h >= 21 || h <= 5
        ? 0.3
        : 1.0;
    return {
      hour: `${String(h).padStart(2, "0")}:00`,
      impressions: quiet ? 0 : Math.round((impressions / 24) * peak),
    };
  });

  return (
    <div className="space-y-4">
      {/* Route picker */}
      <Select value={selectedRoute} onValueChange={onRouteChange}>
        <SelectTrigger className="w-64">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {oemRoutePerformance.map((r) => (
            <SelectItem key={r.route} value={r.route}>
              {r.route}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SimCard icon={<Bot className="h-4 w-4" />} label="Robots" value={String(robots)} />
        <SimCard icon={<Eye className="h-4 w-4" />} label="Impressions" value={formatCompact(impressions)} />
        <SimCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Revenue"
          value={`$${revenue.toLocaleString()}`}
          highlight
        />
        <SimCard icon={<TrendingUp className="h-4 w-4" />} label="Per Robot" value={`$${perRobot}`} />
      </div>

      {/* Chart */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Impressions by Hour</p>
            <Badge variant="outline" className="text-[10px]">
              <Clock className="h-3 w-3 mr-1" />
              Quiet {fmtHour(quietStart)}–{fmtHour(quietEnd)}
            </Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly}>
                <defs>
                  <linearGradient id="simFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} className="text-xs" />
                <YAxis tick={{ fontSize: 10 }} className="text-xs" tickFormatter={(v: number) => formatCompact(v)} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [Number(value).toLocaleString(), "Impressions"]}
                />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#simFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns on this route */}
      {campaigns.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-semibold mb-3">
              Active Campaigns on {selectedRoute}
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Advertiser</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-sm font-medium">{c.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.advertiser}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {c.impressions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-emerald-500">
                      ${c.revenueGenerated.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Small helpers ──────────────────────────────────────────────────────────

function SimCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
          {icon}
          <span className="text-[10px] uppercase tracking-wide font-medium">{label}</span>
        </div>
        <p className={cn("text-lg font-bold font-mono", highlight && "text-emerald-500")}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function fmtHour(h: number): string {
  const s = h >= 12 ? "PM" : "AM";
  const d = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${d}${s}`;
}
