"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { GuardrailFooter } from "./GuardrailFooter";

export function AppShell({ children }: { children: React.ReactNode }) {
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
        <h1
          className="text-lg font-bold bg-gradient-to-r from-kovio-blue to-kovio-violet bg-clip-text text-transparent"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Kovio
        </h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <GuardrailFooter />
    </div>
  );
}
