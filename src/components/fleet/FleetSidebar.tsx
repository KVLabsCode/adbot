"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Settings,
  ClipboardCheck,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";

const SIDEBAR_KEY = "fleet-sidebar-collapsed";

const navItems = [
  { label: "Revenue", href: "/fleet", icon: BarChart3, exact: true, badge: false },
  { label: "Configuration", href: "/fleet/config", icon: Settings, exact: false, badge: false },
  { label: "Approvals", href: "/fleet/approvals", icon: ClipboardCheck, exact: false, badge: true },
  { label: "Advertisers", href: "/fleet/advertisers", icon: Users, exact: false, badge: false },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function FleetSidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const approvalQueue = useStore((s) => s.approvalQueue);

  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(SIDEBAR_KEY) === "true");
    setMounted(true);
  }, []);

  useEffect(() => {
    onMobileClose?.();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(SIDEBAR_KEY, String(next));
  };

  const sidebarContent = (
    <TooltipProvider>
      <aside
        className={cn(
          "flex h-full flex-col border-r border-border bg-sidebar transition-all duration-200",
          "max-md:w-64",
          collapsed ? "md:w-16" : "md:w-56",
          !mounted && "md:w-56"
        )}
      >
        {/* Logo */}
        <div className={cn("py-5", collapsed ? "px-0 flex justify-center" : "px-4")}>
          <div className="flex items-center justify-between md:hidden px-0 mb-0">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-semibold text-foreground">Kovio</span>
            </Link>
            <button
              onClick={onMobileClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="hidden md:block">
            {collapsed ? (
              <Link href="/" className="flex justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              </Link>
            ) : (
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-base font-semibold text-foreground">Kovio</span>
                  <p className="text-[10px] text-muted-foreground leading-none">Fleet Console</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav
          className={cn(
            "flex-1 space-y-0.5 py-2",
            "max-md:px-2",
            collapsed ? "md:px-1.5" : "md:px-2"
          )}
          aria-label="Fleet navigation"
        >
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const badgeCount = item.badge ? approvalQueue.length : 0;

            const content = (
              <>
                <span className="relative">
                  <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-emerald-600" : "text-muted-foreground")} aria-hidden="true" />
                  {collapsed && badgeCount > 0 && (
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </span>
                {!collapsed && (
                  <>
                    <span className={cn("text-sm", isActive ? "font-semibold text-foreground" : "text-muted-foreground")}>{item.label}</span>
                    {badgeCount > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 min-w-[20px] justify-center px-1.5 text-[10px] font-semibold">
                        {badgeCount}
                      </Badge>
                    )}
                  </>
                )}
              </>
            );

            const classes = cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
              collapsed && "justify-center px-0",
              isActive
                ? "bg-emerald-50 dark:bg-emerald-500/10"
                : "hover:bg-muted"
            );

            const mobileLink = (
              <Link href={item.href} aria-current={isActive ? "page" : undefined} className={cn(classes, "md:hidden")}>
                {content}
              </Link>
            );
            const desktopLink = (
              <Link href={item.href} aria-current={isActive ? "page" : undefined} className={cn(classes, "hidden md:flex")}>
                {content}
              </Link>
            );

            return (
              <div key={item.href}>
                {mobileLink}
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{desktopLink}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      {item.label}{badgeCount > 0 && ` (${badgeCount})`}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  desktopLink
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={cn("border-t p-2 space-y-1", collapsed && "md:px-1.5")}>
          <ThemeToggle collapsed={collapsed} />
          <div className={cn("hidden md:flex", collapsed ? "justify-center" : "justify-end")}>
            <button
              onClick={toggle}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );

  return (
    <>
      <div className="hidden md:block h-full">{sidebarContent}</div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onMobileClose} aria-hidden="true" />
          <div className="relative h-full w-64 animate-in slide-in-from-left duration-200">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
