"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "./AppShell";
import { OemShell } from "./oem/OemShell";

export function LayoutRouter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Public advertiser dashboard — no shell, standalone page
  if (pathname.startsWith("/a/")) {
    return <>{children}</>;
  }

  if (pathname.startsWith("/oem")) {
    return <OemShell>{children}</OemShell>;
  }

  return <AppShell>{children}</AppShell>;
}
