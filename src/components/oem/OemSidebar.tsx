"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Settings2,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ThemeToggle";
import { oemAdvertisers, oemOrg } from "@/fixtures/oem-demo";
import { cn } from "@/lib/utils";

const SIDEBAR_KEY = "oem-sidebar-collapsed";

const navItems = [
  { label: "Overview", href: "/oem", icon: LayoutDashboard },
  { label: "Advertisers", href: "/oem/advertisers", icon: Users },
  { label: "Config", href: "/oem/config", icon: Settings2 },
];

interface OemSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function OemSidebar({ mobileOpen, onMobileClose }: OemSidebarProps) {
  const pathname = usePathname();
  const activeCount = oemAdvertisers.filter((a) => a.status === "active").length;

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
          "flex h-full flex-col border-r border-border/50 bg-card transition-all duration-200",
          "max-md:w-72",
          collapsed ? "md:w-[72px]" : "md:w-60",
          !mounted && "md:w-60"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "py-5 transition-all duration-200",
            collapsed ? "max-md:px-4 md:px-0 md:flex md:justify-center" : "px-4"
          )}
        >
          {/* Mobile close */}
          <div className="flex items-center justify-between md:hidden mb-2">
            <div className="flex items-center gap-2.5">
              <Image src="/starship-logo.svg" alt="Starship" width={28} height={28} className="rounded-lg" />
              <div>
                <h1 className="text-lg font-bold leading-tight text-foreground">
                  {oemOrg.name}
                </h1>
                <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
                  Fleet Console
                </p>
              </div>
            </div>
            <button
              onClick={onMobileClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop header */}
          <div className="hidden md:block">
            {collapsed ? (
              <div className="flex justify-center">
                <Image src="/starship-logo.svg" alt="Starship" width={28} height={28} className="rounded-lg" />
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Image src="/starship-logo.svg" alt="Starship" width={28} height={28} className="rounded-lg shrink-0" />
                <div>
                  <h1 className="text-[15px] font-bold leading-tight text-foreground">
                    {oemOrg.name}
                  </h1>
                  <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
                    Fleet Console
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className={cn("mx-3", collapsed && "md:mx-2")}>
          <div className="h-px bg-gradient-to-r from-emerald-500/40 via-emerald-400/20 to-transparent" />
        </div>

        {/* Nav */}
        <nav
          className={cn(
            "flex-1 py-4 space-y-0.5",
            "max-md:px-2",
            collapsed ? "md:px-1.5" : "md:px-2"
          )}
          aria-label="OEM navigation"
        >
          {navItems.map((item) => {
            const isActive =
              item.href === "/oem"
                ? pathname === "/oem"
                : pathname.startsWith(item.href);

            const mobileLink = (
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors md:hidden",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-500 font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
                {item.label === "Advertisers" && activeCount > 0 && (
                  <Badge
                    variant={isActive ? "secondary" : "default"}
                    className="ml-auto h-5 min-w-[20px] justify-center px-1.5 text-[10px]"
                  >
                    {activeCount}
                  </Badge>
                )}
              </Link>
            );

            const desktopLink = (
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "hidden md:flex w-full items-center rounded-md text-sm font-medium transition-colors",
                  collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-500 font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {!collapsed && (
                  <>
                    {item.label}
                    {item.label === "Advertisers" && activeCount > 0 && (
                      <Badge
                        variant={isActive ? "secondary" : "default"}
                        className="ml-auto h-5 min-w-[20px] justify-center px-1.5 text-[10px]"
                      >
                        {activeCount}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            );

            return (
              <div key={item.href}>
                {mobileLink}
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{desktopLink}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  desktopLink
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t p-2 space-y-1">
          {/* Back to Advertiser Platform */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/chat"
                  className="hidden md:flex h-8 w-8 mx-auto items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Advertiser Platform
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-md px-3 h-8 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
              <span className="max-md:inline md:inline">Advertiser Platform</span>
            </Link>
          )}
          <ThemeToggle collapsed={collapsed} />
          <div
            className={cn(
              "hidden md:flex",
              collapsed ? "justify-center" : "justify-end"
            )}
          >
            <button
              onClick={toggle}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
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
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <div className="relative h-full w-72 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
