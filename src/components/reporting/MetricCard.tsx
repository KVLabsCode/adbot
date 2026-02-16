"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MetricInfo } from "@/components/ui/MetricInfo";
import { metricTooltips } from "@/lib/metricTooltips";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  trend?: "up" | "down" | "flat";
  metricKey: string;
}

export function MetricCard({ title, value, trend, metricKey }: MetricCardProps) {
  const plainLanguage = metricTooltips[metricKey]?.plainLanguage;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <MetricInfo metricKey={metricKey} />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <span
              className={cn(
                "flex items-center",
                trend === "up" && "text-green-600",
                trend === "down" && "text-red-500",
                trend === "flat" && "text-muted-foreground"
              )}
              aria-label={`Trend: ${trend}`}
            >
              {trend === "up" && <TrendingUp className="h-4 w-4" />}
              {trend === "down" && <TrendingDown className="h-4 w-4" />}
              {trend === "flat" && <Minus className="h-4 w-4" />}
            </span>
          )}
        </div>
        {plainLanguage && (
          <p className="text-[11px] text-muted-foreground mt-1">{plainLanguage}</p>
        )}
      </CardContent>
    </Card>
  );
}
