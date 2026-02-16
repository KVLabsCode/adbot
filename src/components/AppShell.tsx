"use client";

import { Sidebar } from "./Sidebar";
import { GuardrailFooter } from "./GuardrailFooter";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <GuardrailFooter />
    </div>
  );
}
