"use client";

import { useState, useRef, useCallback } from "react";
import { Info } from "lucide-react";
import { metricTooltips } from "@/lib/metricTooltips";

interface MetricInfoProps {
  metricKey: string;
}

export function MetricInfo({ metricKey }: MetricInfoProps) {
  const info = metricTooltips[metricKey];
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  if (!info) return null;

  const show = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setVisible(true);
  };

  const hide = () => {
    hideTimer.current = setTimeout(() => setVisible(false), 400);
  };

  return (
    <div
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <button
        className="inline-flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        aria-label={`Info about ${info.title}`}
        onFocus={show}
        onBlur={hide}
      >
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <div
        className={`absolute right-0 bottom-full mb-2 w-[300px] z-50 bg-gray-900 text-white rounded-lg px-4 py-3 transition-opacity duration-150 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        role="tooltip"
      >
        <p className="font-semibold text-xs">{info.title}</p>
        <p className="text-[11px] leading-relaxed mt-1.5 text-gray-300">
          {info.description}
        </p>
      </div>
    </div>
  );
}
