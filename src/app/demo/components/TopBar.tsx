'use client';

import { useEffect, useState } from 'react';
import { Metrics } from '../hooks/useSimulation';

interface Props {
  metrics: Metrics;
}

function AnimatedNumber({ value, prefix = '', decimals = 0 }: { value: number; prefix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const diff = value - display;
    if (Math.abs(diff) < 0.01) return;
    const step = diff / 8;
    let current = display;
    const timer = setInterval(() => {
      current += step;
      if (Math.abs(value - current) < Math.abs(step)) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(current);
      }
    }, 30);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const formatted = decimals > 0
    ? display.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.floor(display).toLocaleString('en-US');

  return <span>{prefix}{formatted}</span>;
}

export default function TopBar({ metrics }: Props) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-white/10"
      style={{ background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(12px)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3" fill="white" />
              <rect x="9" y="11" width="6" height="8" rx="1" fill="white" opacity="0.9" />
              <rect x="6" y="12" width="3" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="15" y="12" width="3" height="5" rx="1" fill="white" opacity="0.6" />
              <rect x="9" y="19" width="2" height="3" rx="1" fill="white" opacity="0.7" />
              <rect x="13" y="19" width="2" height="3" rx="1" fill="white" opacity="0.7" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Kovio</span>
        </div>

        {/* Live badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30"
          style={{ background: 'rgba(34,197,94,0.1)' }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-green-400 text-xs font-semibold tracking-wider uppercase">Live Network Demo</span>
        </div>
      </div>

      {/* Global stats */}
      <div className="flex items-center gap-8">
        <Stat
          label="Active Robots"
          value={<AnimatedNumber value={metrics.activeRobots + 2144} />}
          color="#4f46e5"
        />
        <Stat
          label="Campaigns"
          value={<AnimatedNumber value={metrics.activeCampaigns + 121} />}
          color="#7c3aed"
        />
        <Stat
          label="Impressions Today"
          value={<AnimatedNumber value={metrics.impressions} />}
          color="#22c55e"
        />
        <Stat
          label="Revenue Generated"
          value={<AnimatedNumber value={metrics.revenue} prefix="$" decimals={2} />}
          color="#f59e0b"
        />
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-mono font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
