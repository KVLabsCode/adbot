"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "./MetricCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ImpressionData {
  totalImpressions: number;
  impressionsToday: number;
  totalRevenue: number;
  ecpm: number;
  uniqueDevices: number;
  perCampaign: {
    campaign_id: string;
    campaign_name: string;
    impressions: number;
    revenue: number;
  }[];
}

export function ImpressionMetrics() {
  const [data, setData] = useState<ImpressionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch("/api/reporting/impressions");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch impression metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Impression Metrics
        </h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-lg border bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          Impression Metrics
        </h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            title="Impressions"
            value={data.totalImpressions.toLocaleString()}
            metricKey="impressions"
          />
          <MetricCard
            title="Revenue"
            value={`$${data.totalRevenue.toFixed(2)}`}
            metricKey="revenue"
          />
          <MetricCard
            title="eCPM"
            value={`$${data.ecpm.toFixed(2)}`}
            metricKey="ecpm"
          />
          <MetricCard
            title="Devices Active"
            value={data.uniqueDevices.toLocaleString()}
            metricKey="devices_active"
          />
        </div>
      </section>

      {data.perCampaign.length > 0 && (
        <section>
          <div className="rounded-lg border p-4">
            <h4 className="text-sm font-semibold mb-1">
              Impressions by Campaign
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Breakdown of impressions and revenue per campaign
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">eCPM</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.perCampaign.map((row) => (
                  <TableRow key={row.campaign_id}>
                    <TableCell className="text-sm">
                      {row.campaign_name}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {row.impressions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      ${row.revenue.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      $
                      {row.impressions > 0
                        ? ((row.revenue / row.impressions) * 1000).toFixed(2)
                        : "0.00"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}
    </div>
  );
}
