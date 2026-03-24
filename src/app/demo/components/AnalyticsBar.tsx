'use client';

import { useEffect, useState, useRef } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Metrics } from '../hooks/useSimulation';

interface Props {
  metrics: Metrics;
}

function AnimatedNumber({ value, prefix = '', decimals = 0 }: { value: number; prefix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const diff = value - display;
    if (Math.abs(diff) < 0.01) return;
    const step = diff / 10;
    let cur = display;
    const t = setInterval(() => {
      cur += step;
      if (Math.abs(value - cur) < Math.abs(step)) { setDisplay(value); clearInterval(t); }
      else setDisplay(cur);
    }, 28);
    return () => clearInterval(t);
  }, [value]); // eslint-disable-line
  const fmt = decimals > 0
    ? display.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.floor(display).toLocaleString('en-US');
  return <span>{prefix}{fmt}</span>;
}

function FlashTile({ label, value, color, icon, flashKey }: {
  label: string; value: React.ReactNode; color: string; icon: React.ReactNode; flashKey: number;
}) {
  const [flashing, setFlashing] = useState(false);
  const prevKey = useRef(flashKey);

  useEffect(() => {
    if (flashKey !== prevKey.current && flashKey > 0) {
      prevKey.current = flashKey;
      setFlashing(true);
      setTimeout(() => setFlashing(false), 600);
    }
  }, [flashKey]);

  return (
    <div className="flex items-center gap-3 px-5 h-full transition-all duration-300 relative"
      style={{ background: flashing ? `${color}12` : 'transparent' }}>
      {flashing && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: `inset 0 0 20px ${color}20`, animation: 'flashFade 0.6s ease-out' }} />
      )}
      <div style={{ color }} className="opacity-70">{icon}</div>
      <div>
        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-base font-mono font-bold transition-all duration-200" style={{ color, transform: flashing ? 'scale(1.06)' : 'scale(1)' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsBar({ metrics }: Props) {
  const chartData = metrics.revenueHistory.map((v, i) => ({ i, v }));

  return (
    <div className="flex items-center border-t border-white/8"
      style={{ height: '72px', background: 'rgba(8,8,18,0.97)', backdropFilter: 'blur(12px)' }}>

      <style>{`
        @keyframes flashFade { 0% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>

      <FlashTile
        label="Impressions"
        value={<AnimatedNumber value={metrics.impressions} />}
        color="#22c55e"
        flashKey={metrics.lastImpression}
        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
      />
      <Div />
      <FlashTile
        label="Engagements"
        value={<AnimatedNumber value={metrics.engagements} />}
        color="#4f46e5"
        flashKey={metrics.lastEngagement}
        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>}
      />
      <Div />
      <FlashTile
        label="Avg CPM"
        value={<AnimatedNumber value={metrics.avgCpm} prefix="$" decimals={2} />}
        color="#f59e0b"
        flashKey={metrics.lastRevenue}
        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
      />
      <Div />
      <FlashTile
        label="Rev / Minute"
        value={<AnimatedNumber value={metrics.revenuePerMinute} prefix="$" />}
        color="#ec4899"
        flashKey={metrics.lastRevenue}
        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>}
      />
      <Div />

      <div className="flex-1 flex flex-col justify-center px-4 h-full min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Revenue Trend</span>
          <span className="text-xs text-pink-400 font-mono animate-pulse">↑ live</span>
        </div>
        <ResponsiveContainer width="100%" height={30}>
          <LineChart data={chartData}>
            <Line type="monotone" dataKey="v" stroke="#ec4899" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Tooltip
              contentStyle={{ background: '#08080f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '11px' }}
              labelStyle={{ display: 'none' }}
              formatter={(v: number) => [`$${v.toFixed(0)}/min`, '']}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Div() {
  return <div className="h-8 w-px flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />;
}
