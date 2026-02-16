"use client";

import { useStore } from "@/store";
import { ReportingCharts } from "@/components/reporting/ReportingCharts";

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
      <ReportingCharts data={reportingData} />
    </div>
  );
}
