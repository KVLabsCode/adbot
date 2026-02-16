"use client";

interface MetricsRevealProps {
  metrics: {
    asp: number;
    dcv: number;
    cpd: number;
    rdr: number;
  };
}

const metricDefs = [
  { key: "asp" as const, label: "ASP", format: (v: number) => `$${v.toFixed(2)}` },
  { key: "dcv" as const, label: "DCV", format: (v: number) => v.toLocaleString() },
  { key: "cpd" as const, label: "CPD", format: (v: number) => `$${v.toFixed(2)}` },
  { key: "rdr" as const, label: "RDR", format: (v: number) => `${(v * 100).toFixed(0)}%` },
];

export function MetricsReveal({ metrics }: MetricsRevealProps) {
  return (
    <div className="w-full grid grid-cols-2 gap-2">
      {metricDefs.map((def, i) => (
        <div
          key={def.key}
          className="rounded-lg border bg-card p-3 animate-in fade-in slide-in-from-bottom-2"
          style={{ animationDelay: `${i * 150}ms`, animationFillMode: "both" }}
        >
          <p className="text-[10px] font-medium text-muted-foreground uppercase">
            {def.label}
          </p>
          <p className="text-lg font-bold">{def.format(metrics[def.key])}</p>
        </div>
      ))}
    </div>
  );
}
