"use client";

import { useState } from "react";
import { Menu, Zap } from "lucide-react";
import { AdvertiserSidebar } from "./AdvertiserSidebar";

export function AdvertiserShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-3 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600">
          <Zap className="h-3 w-3 text-white" />
        </div>
        <span className="text-sm font-semibold">Kovio</span>
        <span className="text-[10px] text-muted-foreground">Advertiser</span>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <AdvertiserSidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
