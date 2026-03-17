"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { OemSidebar } from "./OemSidebar";
import { oemOrg } from "@/fixtures/oem-demo";

export function OemShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      {/* Mobile header */}
      <div className="flex items-center gap-3 border-b bg-card px-4 py-3 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Image src="/starship-logo.svg" alt="Starship" width={28} height={28} />
        <h1 className="text-lg font-bold text-foreground">
          {oemOrg.name}
        </h1>
        <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
          Fleet Console
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <OemSidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* OEM Footer */}
      <div className="border-t bg-muted/50 px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <span>
          Powered by{" "}
          <span className="font-semibold bg-gradient-to-r from-kovio-blue to-kovio-violet bg-clip-text text-transparent">
            Kovio
          </span>{" "}
          AdBot Network
        </span>
        <span className="font-mono text-[10px]">
          Fleet: {oemOrg.activeRobots.toLocaleString()} / {oemOrg.fleetSize.toLocaleString()} robots online
        </span>
      </div>
    </div>
  );
}
