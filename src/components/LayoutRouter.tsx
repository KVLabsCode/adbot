"use client";

import { usePathname } from "next/navigation";
import { AdvertiserShell } from "./advertiser/AdvertiserShell";
import { FleetShell } from "./fleet/FleetShell";

export function LayoutRouter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Root landing page — no shell
  if (pathname === "/") {
    return <>{children}</>;
  }

  // Public advertiser dashboard — no shell
  if (pathname.startsWith("/a/")) {
    return <>{children}</>;
  }

  // AdPod — no shell (robot hardware renderer)
  if (pathname.startsWith("/adpod")) {
    return <>{children}</>;
  }

  // Demo — standalone investor page, no shell
  if (pathname.startsWith("/demo")) {
    return <>{children}</>;
  }

  // OEM Fleet portal
  if (pathname.startsWith("/fleet")) {
    return <FleetShell>{children}</FleetShell>;
  }

  // Everything else is advertiser portal
  return <AdvertiserShell>{children}</AdvertiserShell>;
}
