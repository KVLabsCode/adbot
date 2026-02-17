"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  PlusCircle,
  Palette,
  Target,
  BarChart3,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  X,
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
import { CampaignStatus } from "@/types";
import { cn } from "@/lib/utils";

const SIDEBAR_KEY = "sidebar-collapsed";

const navItems = [
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Create Campaign", href: "/create", icon: PlusCircle },
  { label: "Creatives", href: "/creatives", icon: Palette },
  { label: "Campaigns", href: "/campaigns", icon: Target },
  { label: "Reporting", href: "/reporting", icon: BarChart3 },
  { label: "Billing", href: "/billing", icon: CreditCard },
];

function RobotIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <rect x="5" y="9" width="14" height="11" rx="2" />
      <circle cx="9" cy="14" r="1.5" />
      <circle cx="15" cy="14" r="1.5" />
      <path d="M12 2v4" />
      <circle cx="12" cy="2" r="1" />
      <path d="M2 14h3" />
      <path d="M19 14h3" />
      <path d="M10 18h4" />
    </svg>
  );
}

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const campaigns = useStore((s) => s.campaigns);
  const activeCampaignCount = campaigns.filter(
    (c) => c.status === CampaignStatus.ACTIVE
  ).length;

  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(SIDEBAR_KEY) === "true");
    setMounted(true);
  }, []);

  // Close mobile drawer on route change
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
          // Desktop sizing (collapse feature only on desktop)
          "max-md:w-72",
          collapsed ? "md:w-[72px]" : "md:w-60",
          !mounted && "md:w-60"
        )}
      >
        {/* Hero header */}
        <div
          className={cn(
            "py-5 transition-all duration-200",
            collapsed ? "max-md:px-4 md:px-0 md:flex md:justify-center" : "px-4"
          )}
        >
          {/* Mobile close button */}
          <div className="flex items-center justify-between md:hidden mb-2">
            <div className="flex items-center gap-2.5">
              <RobotIcon
                className="h-6 w-6 text-kovio-blue shrink-0"
                style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
              />
              <div>
                <h1
                  className="text-[22px] font-bold leading-tight bg-gradient-to-r from-kovio-blue to-kovio-violet bg-clip-text text-transparent"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  Kovio
                </h1>
                <p className="text-xs text-muted-foreground">Grow with Robots</p>
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
                <RobotIcon
                  className="h-6 w-6 text-kovio-blue"
                  style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <RobotIcon
                  className="h-6 w-6 text-kovio-blue shrink-0"
                  style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
                />
                <div>
                  <h1
                    className="text-[22px] font-bold leading-tight bg-gradient-to-r from-kovio-blue to-kovio-violet bg-clip-text text-transparent"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    Kovio
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Grow with Robots
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Divider under header */}
        <div className={cn("mx-3", collapsed && "md:mx-2")}>
          <div className="h-px bg-gradient-to-r from-kovio-blue/40 via-kovio-violet/30 to-transparent" />
        </div>

        {/* Nav */}
        <nav
          className={cn(
            "flex-1 py-4 space-y-0.5",
            "max-md:px-2",
            collapsed ? "md:px-1.5" : "md:px-2"
          )}
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname === "/" && item.href === "/chat");

            // Mobile always shows expanded links
            const mobileLink = (
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors md:hidden",
                  isActive
                    ? "bg-kovio-blue/10 text-kovio-blue font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
                {item.label === "Campaigns" && activeCampaignCount > 0 && (
                  <Badge
                    variant={isActive ? "secondary" : "default"}
                    className="ml-auto h-5 min-w-[20px] justify-center px-1.5 text-[10px]"
                  >
                    {activeCampaignCount}
                  </Badge>
                )}
              </Link>
            );

            // Desktop link (respects collapse state)
            const desktopLink = (
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "hidden md:flex w-full items-center rounded-md text-sm font-medium transition-colors",
                  collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
                  isActive
                    ? "bg-kovio-blue/10 text-kovio-blue font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {!collapsed && (
                  <>
                    {item.label}
                    {item.label === "Campaigns" &&
                      activeCampaignCount > 0 && (
                        <Badge
                          variant={isActive ? "secondary" : "default"}
                          className="ml-auto h-5 min-w-[20px] justify-center px-1.5 text-[10px]"
                        >
                          {activeCampaignCount}
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

        {/* Bottom controls */}
        <div className="border-t p-2 space-y-1">
          <ThemeToggle collapsed={collapsed} />
          {/* Collapse toggle — desktop only */}
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
      {/* Desktop sidebar — always visible */}
      <div className="hidden md:block h-full">{sidebarContent}</div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="relative h-full w-72 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
