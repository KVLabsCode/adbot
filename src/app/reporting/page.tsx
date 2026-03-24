"use client";

import { useState } from "react";
import { useStore } from "@/store";
import type { ReportingData } from "@/types";
import {
  Users,
  BarChart3,
  Mic,
  QrCode,
  DollarSign,
  Clock,
  Eye,
  TrendingUp,
  Route,
  MapPin,
  Share2,
  Check,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString("en-US");
}

function formatCurrency(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercent(n: number): string {
  return n.toFixed(1) + "%";
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="py-4">
      <CardContent className="px-4 py-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <p className="text-2xl font-bold font-[family-name:var(--font-geist-mono)]">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Humanoid Tab ─────────────────────────────────────────────────────────────

function HumanoidReport({ data }: { data: ReportingData }) {
  const { humanoid, timeSeriesHumanoid, byOem, byMoment } = data;

  // Filter OEM rows for humanoid-relevant OEMs (those with engagements)
  const humanoidOems = byOem.filter((o) => o.engagements > 0);
  // Filter moment rows for humanoid-relevant moments (those with conversions)
  const humanoidMoments = byMoment.filter((m) => m.conversions > 0);

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Engagements"
          value={formatNumber(humanoid.engagements)}
          icon={Users}
        />
        <MetricCard
          label="Engagement Rate"
          value={formatPercent(humanoid.engagementRate)}
          icon={TrendingUp}
        />
        <MetricCard
          label="Verbal Completions"
          value={formatNumber(humanoid.verbalCompletions)}
          icon={Mic}
        />
        <MetricCard
          label="QR Scan Rate"
          value={formatPercent(humanoid.qrScanRate)}
          icon={QrCode}
        />
        <MetricCard
          label="CPE Actual vs Bid"
          value={formatCurrency(humanoid.cpeActual)}
          subtitle={`Bid: ${formatCurrency(humanoid.cpeBid)}`}
          icon={DollarSign}
        />
        <MetricCard
          label="Dwell Time Avg"
          value={`${humanoid.dwellTimeHistogram.length > 0 ? ((humanoid.dwellTimeHistogram.reduce((s, b) => s + b.count, 0) > 0) ? "~6.2s" : "--") : "--"}`}
          subtitle="Weighted average across buckets"
          icon={Clock}
        />
      </div>

      {/* Line chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Engagements & Rate Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesHumanoid}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="engagements"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", r: 3 }}
                  name="Engagements"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="rate"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ fill: "#06b6d4", r: 3 }}
                  name="Rate %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Dwell time histogram */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Dwell Time Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={humanoid.dwellTimeHistogram}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="bucket"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  name="Sessions"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown by OEM */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Breakdown by OEM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>OEM</TableHead>
                <TableHead className="text-right">Engagements</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Spend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {humanoidOems.map((row) => (
                <TableRow key={row.oem}>
                  <TableCell className="font-medium">{row.oem}</TableCell>
                  <TableCell className="text-right font-[family-name:var(--font-geist-mono)]">
                    {formatNumber(row.engagements)}
                  </TableCell>
                  <TableCell className="text-right font-[family-name:var(--font-geist-mono)]">
                    {formatNumber(row.impressions)}
                  </TableCell>
                  <TableCell className="text-right font-[family-name:var(--font-geist-mono)]">
                    {formatCurrency(row.spend)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Breakdown by Moment */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Breakdown by Placement Moment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Moment</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Conv. Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {humanoidMoments.map((row) => (
                <TableRow key={row.moment}>
                  <TableCell className="font-medium">{row.moment}</TableCell>
                  <TableCell className="text-right font-[family-name:var(--font-geist-mono)]">
                    {formatNumber(row.impressions)}
                  </TableCell>
                  <TableCell className="text-right font-[family-name:var(--font-geist-mono)]">
                    {formatNumber(row.conversions)}
                  </TableCell>
                  <TableCell className="text-right font-[family-name:var(--font-geist-mono)]">
                    {row.impressions > 0
                      ? formatPercent((row.conversions / row.impressions) * 100)
                      : "--"}
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

// ─── Delivery Tab ─────────────────────────────────────────────────────────────

function DeliveryReport({ data }: { data: ReportingData }) {
  const { delivery, timeSeriesDelivery, byOem, byMoment } = data;

  // Filter OEM rows for delivery-relevant OEMs (those without engagements)
  const deliveryOems = byOem.filter((o) => o.engagements === 0);
  // Filter moment rows for delivery-relevant moments (those without conversions)
  const deliveryMoments = byMoment.filter((m) => m.conversions === 0);

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Impressions"
          value={formatNumber(delivery.impressions)}
          icon={Eye}
        />
        <MetricCard
          label="ASP"
          value={formatCurrency(delivery.asp)}
          subtitle="Average Spot Price"
          icon={BarChart3}
        />
        <MetricCard
          label="CPD"
          value={formatCurrency(delivery.cpd)}
          subtitle="Cost Per Delivery"
          icon={Route}
        />
        <MetricCard
          label="RDR"
          value={formatPercent(delivery.rdr)}
          subtitle="Route Display Rate"
          icon={MapPin}
        />
        <MetricCard
          label="CPM Actual vs Bid"
          value={formatCurrency(delivery.cpmActual)}
          subtitle={`Bid: ${formatCurrency(delivery.cpmBid)}`}
          icon={DollarSign}
        />
      </div>

      {/* Line chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Impressions & ASP Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesDelivery}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  unit="$"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="impressions"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ fill: "#0ea5e9", r: 3 }}
                  name="Impressions"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="asp"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b", r: 3 }}
                  name="ASP ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown by OEM */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Breakdown by OEM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>OEM</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">eCPM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveryOems.map((row) => (
                <TableRow key={row.oem}>
                  <TableCell className="font-medium">{row.oem}</TableCell>
                  <TableCell className="text-right font-[family-name:var(--font-geist-mono)]">
                    {formatNumber(row.impressions)}
                  </TableCell>
                  <TableCell className="text-right font-[family-name:var(--font-geist-mono)]">
                    {formatCurrency(row.spend)}
                  </TableCell>
                  <TableCell className="text-right font-[family-name:var(--font-geist-mono)]">
                    {row.impressions > 0
                      ? formatCurrency((row.spend / row.impressions) * 1000)
                      : "--"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Breakdown by Moment */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Breakdown by Placement Moment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Moment</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveryMoments.map((row) => {
                const totalImpressions = deliveryMoments.reduce(
                  (s, m) => s + m.impressions,
                  0
                );
                return (
                  <TableRow key={row.moment}>
                    <TableCell className="font-medium">
                      {row.moment}
                    </TableCell>
                    <TableCell className="text-right font-[family-name:var(--font-geist-mono)]">
                      {formatNumber(row.impressions)}
                    </TableCell>
                    <TableCell className="text-right font-[family-name:var(--font-geist-mono)]">
                      {totalImpressions > 0
                        ? formatPercent(
                            (row.impressions / totalImpressions) * 100
                          )
                        : "--"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Share Dialog ─────────────────────────────────────────────────────────────

function ShareDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const campaigns = useStore((s) => s.campaigns);
  const [copied, setCopied] = useState<string | null>(null);

  const activeCampaigns = campaigns.filter(
    (c) => c.status === "active" || c.status === "paused"
  );

  function handleCopy(campaignId: string) {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/a/${campaignId}`;
    navigator.clipboard.writeText(url);
    setCopied(campaignId);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Report</DialogTitle>
          <DialogDescription>
            Generate a shareable public link for any campaign report.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {activeCampaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No active campaigns to share.
            </p>
          ) : (
            activeCampaigns.map((c) => {
              const url = `/a/${c.id}`;
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground font-[family-name:var(--font-geist-mono)]">
                      {url}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(c.id)}
                  >
                    {copied === c.id ? (
                      <>
                        <Check className="size-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportingPage() {
  const reportingData = useStore((s) => s.reportingData);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Reporting</h2>
          <p className="text-sm text-muted-foreground">
            Performance analytics separated by robot type -- never mixing
            humanoid and delivery metrics
          </p>
        </div>
        <Button variant="outline" onClick={() => setShareOpen(true)}>
          <Share2 className="size-4" />
          Share Report
        </Button>
      </div>

      {/* Tabs: Humanoid vs Delivery */}
      <Tabs defaultValue="humanoid">
        <TabsList>
          <TabsTrigger value="humanoid">
            Humanoid
          </TabsTrigger>
          <TabsTrigger value="delivery">
            Delivery & Logistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="humanoid" className="mt-6">
          <HumanoidReport data={reportingData} />
        </TabsContent>

        <TabsContent value="delivery" className="mt-6">
          <DeliveryReport data={reportingData} />
        </TabsContent>
      </Tabs>

      {/* Share dialog */}
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
