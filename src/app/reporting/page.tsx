"use client";

import { useStore } from "@/store";
import { ReportingCharts } from "@/components/reporting/ReportingCharts";
import { ImpressionMetrics } from "@/components/reporting/ImpressionMetrics";

export default function ReportingPage() {
  const reportingData = useStore((s) => s.reportingData);

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Reporting</h2>
        <p className="text-sm text-muted-foreground">
          See how your campaigns influence robot decisions across the network
        </p>
      </div>
      <div className="space-y-10">
        <ImpressionMetrics />
        <ReportingCharts data={reportingData} />
      </div>
    </div>
  );
}
