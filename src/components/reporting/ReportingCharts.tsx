"use client";

import { ReportingData } from "@/types";
import { MetricCard } from "./MetricCard";
import { MetricInfo } from "@/components/ui/MetricInfo";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useCallback } from "react";

interface ReportingChartsProps {
  data: ReportingData;
}

export function ReportingCharts({ data }: ReportingChartsProps) {
  const exportCSV = useCallback(() => {
    const headers = ["Date", "ASP"];
    const rows = data.aspTrend.map((d) => `${d.date},${d.value}`);
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporting-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [data.aspTrend]);

  return (
    <div className="space-y-8">
      {/* Top: Big KPIs */}
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          Key Performance Indicators
        </h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            title="ASP"
            value={`$${data.kpis.asp.toFixed(2)}`}
            trend={data.kpis.aspTrend}
            metricKey="asp"
          />
          <MetricCard
            title="DCV"
            value={data.kpis.dcv.toLocaleString()}
            trend={data.kpis.dcvTrend}
            metricKey="dcv"
          />
          <MetricCard
            title="CPD"
            value={`$${data.kpis.cpd.toFixed(2)}`}
            trend={data.kpis.cpdTrend}
            metricKey="cpd"
          />
          <MetricCard
            title="RDR"
            value={`${(data.kpis.rdr * 100).toFixed(0)}%`}
            trend={data.kpis.rdrTrend}
            metricKey="rdr"
          />
        </div>
      </section>

      {/* Middle: Trend graph */}
      <section>
        <div className="rounded-lg border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">ASP Trend</h3>
                <MetricInfo metricKey="asp" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Average selling price over time
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              aria-label="Export reporting data as CSV"
            >
              <Download className="h-4 w-4 mr-1" aria-hidden="true" />
              Export CSV
            </Button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.aspTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: number) => `$${v.toFixed(2)}`}
                />
                <RechartsTooltip
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, "ASP"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Bottom: Breakdown tables */}
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          Detailed Breakdown
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h4 className="text-sm font-semibold mb-1">
              Performance by Flow
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              How each decision stage contributes to results
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flow</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                  <TableHead className="text-right">ASP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.flowBreakdown.map((row) => (
                  <TableRow key={row.flow}>
                    <TableCell className="text-sm">{row.flow}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {row.impressions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {row.conversions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      ${row.asp.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-lg border p-4">
            <h4 className="text-sm font-semibold mb-1">
              Performance by Format
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              How each ad format drives engagement
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Format</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.formatBreakdown.map((row) => (
                  <TableRow key={row.format}>
                    <TableCell className="text-sm">{row.format}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {row.impressions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {row.clicks.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {row.ctr.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  );
}
