"use client";

import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, Target, BarChart3, CreditCard, RotateCcw, Database, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/store";
import { CampaignStatus } from "@/types";
import { cn } from "@/lib/utils";
import { useDemoMode } from "@/lib/supabase/hooks";

const navItems = [
  { label: "Studio", href: "/studio", icon: MessageSquare },
  { label: "Campaigns", href: "/campaigns", icon: Target },
  { label: "Reporting", href: "/reporting", icon: BarChart3 },
  { label: "Billing", href: "/billing", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const resetDemo = useStore((s) => s.resetDemo);
  const campaigns = useStore((s) => s.campaigns);
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const activeCampaignCount = campaigns.filter(
    (c) => c.status === CampaignStatus.ACTIVE
  ).length;

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-card">
      <div className="px-4 py-4">
        <h1 className="text-lg font-bold tracking-tight">BlitzMode</h1>
        <p className="text-xs text-muted-foreground">Advertiser Platform</p>
      </div>
      <Separator />
      <nav className="flex-1 px-2 py-2 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname === "/" && item.href === "/studio");
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              aria-label={`Navigate to ${item.label}`}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
              {item.label === "Campaigns" && activeCampaignCount > 0 && (
                <Badge
                  variant={isActive ? "secondary" : "default"}
                  className="ml-auto h-5 min-w-[20px] justify-center px-1.5 text-[10px]"
                >
                  {activeCampaignCount}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>
      <Separator />
      {/* Demo Mode Toggle Panel */}
      <div className="px-3 py-3">
        <div
          className={cn(
            "rounded-lg border p-3 transition-colors",
            isDemoMode
              ? "border-amber-500/30 bg-amber-500/5"
              : "border-emerald-500/30 bg-emerald-500/5"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            {isDemoMode ? (
              <FlaskConical className="h-3.5 w-3.5 text-amber-600" />
            ) : (
              <Database className="h-3.5 w-3.5 text-emerald-600" />
            )}
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider",
                isDemoMode ? "text-amber-600" : "text-emerald-600"
              )}
            >
              {isDemoMode ? "Demo Mode" : "Live Mode"}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mb-2.5 leading-relaxed">
            {isDemoMode
              ? "Using local fixtures. No data persisted."
              : "Connected to Supabase. All changes saved."}
          </p>
          <button
            onClick={() => {
              if (isDemoMode !== null) {
                toggleDemoMode(!isDemoMode);
              }
            }}
            disabled={isDemoMode === null}
            className={cn(
              "w-full rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors",
              isDemoMode
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-amber-600 text-white hover:bg-amber-700",
              isDemoMode === null && "opacity-50 cursor-not-allowed"
            )}
          >
            {isDemoMode === null
              ? "Loading..."
              : isDemoMode
                ? "Switch to Live"
                : "Switch to Demo"}
          </button>
        </div>
      </div>
      <Separator />
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => {
            resetDemo();
            router.push("/studio");
          }}
          aria-label="Reset demo to initial state"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset Demo
        </Button>
      </div>
    </aside>
  );
}
