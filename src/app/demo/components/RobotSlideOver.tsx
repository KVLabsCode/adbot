'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Robot } from '../hooks/useSimulation';

interface Props {
  robot: Robot | null;
  onClose: () => void;
  engagingRobotId: string | null;
  onHighlightCampaign: (id: string | null) => void;
  highlightedCampaignId: string | null;
}

const SF_ZONE_COORDS = [
  { name: 'Union Square', lat: 37.7879, lng: -122.4075, traffic: 94 },
  { name: 'SoMa', lat: 37.7841, lng: -122.3963, traffic: 88 },
  { name: 'Mission', lat: 37.7599, lng: -122.4148, traffic: 82 },
  { name: 'Financial District', lat: 37.7946, lng: -122.3999, traffic: 91 },
  { name: 'Marina', lat: 37.8030, lng: -122.4369, traffic: 76 },
];

function getNearestZone(lat: number, lng: number) {
  let best: typeof SF_ZONE_COORDS[0] | null = null;
  let bestDist = Infinity;
  for (const z of SF_ZONE_COORDS) {
    const d = Math.sqrt((lat - z.lat) ** 2 + (lng - z.lng) ** 2);
    if (d < bestDist) { bestDist = d; best = z; }
  }
  return bestDist < 0.018 ? best : null;
}

function randInRange(min: number, max: number) { return Math.random() * (max - min) + min; }

interface RevenueBlip { id: number; amount: number }

export default function RobotSlideOver({ robot, onClose, engagingRobotId, onHighlightCampaign, highlightedCampaignId }: Props) {
  const open = robot !== null;
  const isEngaging = robot?.id === engagingRobotId;
  const campaign = robot?.activeCampaign;
  const brandColor = campaign?.brand.color ?? '#4f46e5';

  // Stable per-robot values
  const stableRef = useRef({ engagementRate: 0, competitorCpm: 0, trafficScore: 0 });
  if (robot && stableRef.current.engagementRate === 0) {
    stableRef.current.engagementRate = 55 + (robot.id.charCodeAt(2) % 30);
    stableRef.current.competitorCpm = campaign ? parseFloat((campaign.cpm * randInRange(0.7, 0.9)).toFixed(2)) : 0;
    stableRef.current.trafficScore = 70 + (robot.id.charCodeAt(3) % 25);
  }
  // Reset stables when robot changes
  const prevRobotId = useRef<string | null>(null);
  if (robot?.id !== prevRobotId.current) {
    prevRobotId.current = robot?.id ?? null;
    stableRef.current = { engagementRate: 0, competitorCpm: 0, trafficScore: 0 };
    if (robot) {
      stableRef.current.engagementRate = 55 + (robot.id.charCodeAt(2) % 30);
      stableRef.current.competitorCpm = campaign ? parseFloat((campaign.cpm * randInRange(0.7, 0.9)).toFixed(2)) : 0;
      stableRef.current.trafficScore = 70 + (robot.id.charCodeAt(3) % 25);
    }
  }

  // Live revenue state
  const [liveRevenue, setLiveRevenue] = useState(robot?.revenueToday ?? 0);
  const [revenueBlips, setRevenueBlips] = useState<RevenueBlip[]>([]);
  const [revenueFlash, setRevenueFlash] = useState(false);
  const [engagementFlash, setEngagementFlash] = useState(false);
  const blipCounter = useRef(0);

  // Sync base revenue when robot changes
  useEffect(() => {
    if (robot) setLiveRevenue(robot.revenueToday);
  }, [robot?.id, robot?.revenueToday]); // eslint-disable-line

  // Live revenue ticker
  useEffect(() => {
    if (!open || !campaign) return;
    const tick = () => {
      const gain = parseFloat(randInRange(0.01, 0.08).toFixed(2));
      setLiveRevenue(prev => parseFloat((prev + gain).toFixed(2)));
      setRevenueFlash(true);
      blipCounter.current += 1;
      const id = blipCounter.current;
      setRevenueBlips(prev => [...prev, { id, amount: gain }]);
      setTimeout(() => setRevenueBlips(prev => prev.filter(b => b.id !== id)), 1800);
      setTimeout(() => setRevenueFlash(false), 500);
    };
    const interval = setInterval(tick, randInRange(2200, 4500) as unknown as number);
    return () => clearInterval(interval);
  }, [open, campaign?.id]); // eslint-disable-line

  // Engagement flash when this robot engages
  useEffect(() => {
    if (isEngaging) {
      setEngagementFlash(true);
      setTimeout(() => setEngagementFlash(false), 800);
    }
  }, [isEngaging]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const nearZone = robot ? getNearestZone(robot.lat, robot.lng) : null;
  const revenuePerMinute = campaign ? parseFloat(((campaign.cpm / 1000) * 18).toFixed(3)) : 0;
  const isCampaignHighlighted = campaign && highlightedCampaignId === campaign.id;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 transition-opacity duration-300"
        style={{ zIndex: 9998, background: 'rgba(0,0,0,0.5)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full flex flex-col"
        style={{
          zIndex: 9999,
          width: '360px',
          background: '#07071a',
          borderLeft: `1px solid ${open && campaign ? brandColor + '35' : 'rgba(255,255,255,0.08)'}`,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: open ? '-20px 0 70px rgba(0,0,0,0.85)' : 'none',
        }}>

        {/* Header */}
        <div className="flex-shrink-0 px-5 py-4 border-b"
          style={{
            borderColor: 'rgba(255,255,255,0.07)',
            background: campaign ? `linear-gradient(90deg, ${brandColor}15 0%, transparent 100%)` : 'transparent',
          }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: brandColor, boxShadow: `0 0 ${isEngaging ? '14px' : '7px'} ${brandColor}`, animation: isEngaging ? 'pulse 0.7s infinite' : undefined }} />
              <div>
                <div className="text-white font-bold font-mono text-sm leading-tight">{robot?.id}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{robot?.fleet} · {robot?.robotType}</div>
              </div>
              {isEngaging && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold text-black ml-1"
                  style={{ background: '#22c55e', fontSize: '9px', letterSpacing: '0.05em' }}>● ENGAGING</span>
              )}
            </div>
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-white hover:bg-white/10 transition-colors">✕</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

          {/* ── REVENUE (hero section) ── */}
          <div className="mx-4 mt-4">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Revenue</div>
            <div className="grid grid-cols-2 gap-2">

              {/* Earned today — live */}
              <div className="relative rounded-xl p-3 overflow-hidden col-span-1 transition-all duration-300"
                style={{
                  background: revenueFlash
                    ? 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(34,197,94,0.1))'
                    : 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))',
                  border: `1px solid ${revenueFlash ? 'rgba(34,197,94,0.4)' : 'rgba(34,197,94,0.18)'}`,
                  boxShadow: revenueFlash ? '0 0 20px rgba(34,197,94,0.15)' : 'none',
                }}>
                <div className="text-xs text-zinc-500 mb-1">Earned Today</div>
                <div className="text-xl font-mono font-black text-emerald-400">
                  ${liveRevenue.toFixed(2)}
                </div>
                {/* Floating blips */}
                <div className="absolute top-2 right-2 pointer-events-none overflow-hidden" style={{ width: '60px', height: '40px' }}>
                  {revenueBlips.map(blip => (
                    <div key={blip.id} className="absolute text-xs font-mono font-bold text-emerald-400 right-0"
                      style={{ animation: 'blipUp 1.8s ease-out forwards', textShadow: '0 0 8px rgba(34,197,94,0.8)' }}>
                      +${blip.amount.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Per minute */}
              <div className="rounded-xl p-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-xs text-zinc-500 mb-1">Per Minute</div>
                <div className="text-lg font-mono font-bold text-amber-400">
                  ${revenuePerMinute.toFixed(3)}
                </div>
              </div>
            </div>
          </div>

          {/* ── METRICS ── */}
          <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl px-3 py-2.5 transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
              <div className="text-xs text-zinc-600 mb-0.5">CPM</div>
              <div className="text-sm font-mono font-bold text-amber-400">{campaign ? `$${campaign.cpm.toFixed(2)}` : '—'}</div>
            </div>
            <div className="rounded-xl px-3 py-2.5 transition-all duration-500"
              style={{
                background: engagementFlash ? 'rgba(79,70,229,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${engagementFlash ? 'rgba(79,70,229,0.4)' : 'rgba(255,255,255,0.06)'}`,
                boxShadow: engagementFlash ? '0 0 14px rgba(79,70,229,0.2)' : 'none',
              }}>
              <div className="text-xs text-zinc-600 mb-0.5">Engagement</div>
              <div className="text-sm font-mono font-bold text-indigo-400">{stableRef.current.engagementRate.toFixed(1)}%</div>
            </div>
            <div className="rounded-xl px-3 py-2.5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xs text-zinc-600 mb-0.5">Impressions</div>
              <div className="text-sm font-mono font-bold text-zinc-300">{(robot?.impressionsToday ?? 0).toLocaleString()}</div>
            </div>
          </div>

          {/* ── AD PREVIEW ── */}
          <div className="mx-4 mt-4">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Ad Currently Playing</div>
            <div className="rounded-xl overflow-hidden" style={{ background: '#060614', border: `1px solid ${brandColor}28` }}>
              <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
                <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-800" />)}</div>
                <span className="text-xs text-zinc-700 font-mono flex-1 text-center">kovio://robot/{robot?.id}</span>
              </div>
              <div className="relative flex flex-col items-center justify-center py-5 px-4 min-h-24"
                style={{ background: campaign ? `linear-gradient(135deg, ${brandColor}28 0%, transparent 100%)` : 'transparent' }}>
                {isEngaging && (
                  <div className="absolute top-2 inset-x-2 px-2 py-1 rounded-lg text-xs font-bold text-black text-center"
                    style={{ background: '#22c55e', zIndex: 1 }}>
                    👤 Human Detected — Engagement Mode
                  </div>
                )}
                {campaign ? (
                  <>
                    <div className="text-2xl font-black text-white" style={{ textShadow: `0 0 24px ${brandColor}70` }}>{campaign.brand.name}</div>
                    <div className="text-xs text-zinc-500 mt-1 mb-3">{campaign.type}</div>
                    <div className="px-4 py-1.5 rounded-full text-xs font-bold text-black" style={{ background: brandColor }}>
                      {isEngaging ? '📱 Scan to Engage' : '👆 Tap to Explore'}
                    </div>
                  </>
                ) : (
                  <span className="text-zinc-700 text-sm">No active campaign</span>
                )}
              </div>
            </div>
          </div>

          {/* ── WHY THIS AD WON ── */}
          {campaign && (
            <div className="mx-4 mt-4">
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Why This Ad Won</div>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>

                {nearZone && (
                  <AuctionReason
                    icon="🔥"
                    label="High Traffic Zone"
                    value={nearZone.name}
                    sub={`Traffic score ${nearZone.traffic}/100`}
                    score={nearZone.traffic}
                    color="#f59e0b"
                  />
                )}
                <AuctionReason
                  icon="📡"
                  label={campaign.type.includes('Proximity') ? 'Proximity Trigger Active' : 'Route Match Detected'}
                  value={campaign.type}
                  sub="Sensor confirmed human presence"
                  color={brandColor}
                />
                <AuctionReason
                  icon="🏆"
                  label="Won Auction"
                  value={`$${campaign.cpm.toFixed(2)} CPM`}
                  sub={`Beat competitor at $${stableRef.current.competitorCpm.toFixed(2)} CPM (+${((campaign.cpm / Math.max(stableRef.current.competitorCpm, 0.01) - 1) * 100).toFixed(0)}%)`}
                  color="#22c55e"
                  highlight
                />
              </div>
            </div>
          )}

          {/* ── CAMPAIGN + HIGHLIGHT BUTTON ── */}
          {campaign && (
            <div className="mx-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-zinc-500 uppercase tracking-widest">Campaign</div>
                <button
                  onClick={() => onHighlightCampaign(isCampaignHighlighted ? null : campaign.id)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold transition-all duration-200"
                  style={{
                    background: isCampaignHighlighted ? `${brandColor}25` : 'rgba(255,255,255,0.06)',
                    color: isCampaignHighlighted ? brandColor : '#71717a',
                    border: `1px solid ${isCampaignHighlighted ? brandColor + '45' : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: isCampaignHighlighted ? `0 0 12px ${brandColor}20` : 'none',
                  }}>
                  <span>{isCampaignHighlighted ? '●' : '○'}</span>
                  <span>{isCampaignHighlighted ? 'Highlighted on map' : 'Show on map'}</span>
                </button>
              </div>
              <div className="rounded-xl p-3 space-y-1.5"
                style={{ background: `${brandColor}0c`, border: `1px solid ${brandColor}20` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: brandColor }} />
                  <span className="text-sm font-bold text-white">{campaign.brand.name}</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: `${brandColor}20`, color: brandColor, border: `1px solid ${brandColor}30` }}>
                    {campaign.status}
                  </span>
                </div>
                <Row label="Location" value={campaign.location} />
                <Row label="Budget" value={`$${campaign.budget.toLocaleString()}`} />
                <Row label="CTR" value={`${((campaign.engagements / Math.max(campaign.impressions, 1)) * 100).toFixed(2)}%`} color="#22c55e" />
              </div>
            </div>
          )}

          {/* ── RECENT ACTIVITY ── */}
          <div className="mx-4 mt-4 mb-6">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Recent Activity</div>
            {robot?.recentActivity && robot.recentActivity.length > 0 ? (
              <div className="space-y-1.5">
                {robot.recentActivity.map((act, i) => (
                  <div key={act.id} className="flex items-start gap-2 px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.025)', borderLeft: `2px solid ${act.color}55` }}>
                    <div className="flex-1">
                      <div className="text-xs text-zinc-300">{act.text}</div>
                      <div className="text-xs text-zinc-700">{i === 0 ? 'just now' : `${i * 7 + 2}s ago`}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-zinc-700 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                No recent activity
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes blipUp {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-32px); opacity: 0; }
          }
        `}</style>
      </div>
    </>
  );
}

function AuctionReason({ icon, label, value, sub, score, color, highlight }: {
  icon: string; label: string; value: string; sub: string; score?: number; color: string; highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 px-3 py-3 border-b last:border-b-0"
      style={{
        borderColor: 'rgba(255,255,255,0.05)',
        background: highlight ? `${color}08` : 'transparent',
      }}>
      <span className="text-base mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-400">{label}</span>
          <span className="text-xs font-mono font-bold" style={{ color }}>{value}</span>
        </div>
        <div className="text-xs text-zinc-600 mt-0.5">{sub}</div>
        {score !== undefined && (
          <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-zinc-600">{label}</span>
      <span className="text-xs font-mono" style={{ color: color ?? '#d4d4d8' }}>{value}</span>
    </div>
  );
}
