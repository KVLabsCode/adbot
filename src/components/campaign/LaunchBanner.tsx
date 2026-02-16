"use client";

import { CheckCircle } from "lucide-react";

interface LaunchBannerProps {
  campaignName: string;
}

export function LaunchBanner({ campaignName }: LaunchBannerProps) {
  return (
    <div className="w-full rounded-lg border border-green-500/30 bg-green-500/10 p-4">
      <div className="flex items-center gap-3">
        <CheckCircle className="h-6 w-6 text-green-500 animate-pulse flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">
            {campaignName} is Live
          </p>
          <p className="text-xs text-green-600 dark:text-green-500">
            Campaign Live Across 2,140 AdPods
          </p>
        </div>
      </div>
    </div>
  );
}
