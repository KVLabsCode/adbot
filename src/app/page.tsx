"use client";

import Link from "next/link";
import { ArrowRight, Bot, Building2, Zap, Shield } from "lucide-react";

const oems = [
  { name: "Unitree", color: "#4F46E5" },
  { name: "Starship", color: "#7C3AED" },
  { name: "Coco", color: "#0891B2" },
  { name: "Serve", color: "#059669" },
  { name: "Ottonomy", color: "#D97706" },
  { name: "Kiwibot", color: "#DC2626" },
  { name: "Keenon", color: "#EA580C" },
  { name: "Bear Robotics", color: "#4F46E5" },
];

export default function RoleSplitPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-base font-semibold">Kovio</span>
        </div>
        <p className="hidden sm:block text-sm text-muted-foreground">Robot Fleet Advertising</p>
      </div>

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Advertiser */}
        <Link
          href="/create"
          className="group relative flex flex-1 flex-col items-center justify-center p-10 md:p-16 hover:bg-indigo-50/50 transition-colors"
        >
          <div className="flex max-w-md flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <Bot className="h-8 w-8" />
            </div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Zap className="h-3 w-3" />
              For Advertisers
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Advertise on robot fleets
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm">
              Reach customers at decision moments through humanoid robots, delivery bots, and service robots.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-1.5">
              {oems.map((oem) => (
                <span
                  key={oem.name}
                  className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs text-muted-foreground"
                >
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: oem.color }} />
                  {oem.name}
                </span>
              ))}
            </div>
            <div className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-transform group-hover:scale-[1.02]">
              Create your first campaign
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="hidden md:block w-px h-full bg-border" />
          <div className="block md:hidden h-px w-full bg-border" />
          <div className="absolute flex h-8 w-8 items-center justify-center rounded-full bg-background border text-xs font-semibold text-muted-foreground">
            or
          </div>
        </div>

        {/* Fleet */}
        <Link
          href="/fleet"
          className="group relative flex flex-1 flex-col items-center justify-center p-10 md:p-16 hover:bg-emerald-50/50 transition-colors"
        >
          <div className="flex max-w-md flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <Building2 className="h-8 w-8" />
            </div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Shield className="h-3 w-3" />
              For Fleet Operators
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Monetise your robot fleet
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm">
              Control content policies, set CPM floors, approve campaigns, and track fleet revenue in real time.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-xs">
              {[
                { label: "Robots", value: "2,847" },
                { label: "Monthly Rev", value: "$55.8K" },
                { label: "Advertisers", value: "7" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-lg font-bold font-[family-name:var(--font-geist-mono)]">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 inline-flex items-center gap-2 rounded-lg border-2 border-emerald-600 px-6 py-3 text-sm font-semibold text-emerald-700 transition-transform group-hover:scale-[1.02] group-hover:bg-emerald-50">
              Open fleet console
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
