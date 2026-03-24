'use client';

import { useEffect } from 'react';
import { Campaign, Robot } from '../hooks/useSimulation';

interface Props {
  campaign: Campaign | null;
  robots: Robot[];
  onClose: () => void;
  onHighlightRobots: (campaignId: string | null) => void;
  highlightedCampaignId: string | null;
}

export default function CampaignModal({ campaign, robots, onClose, onHighlightRobots, highlightedCampaignId }: Props) {
  const open = campaign !== null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!campaign) {
    return (
      <div className="fixed inset-0 z-40 pointer-events-none" style={{ opacity: 0 }} />
    );
  }

  const brandColor = campaign.brand.color;
  const assignedRobots = robots.filter(r => campaign.robots.includes(r.id));
  const ctr = campaign.impressions > 0 ? ((campaign.engagements / campaign.impressions) * 100).toFixed(2) : '0.00';
  const spendPercent = Math.min(100, Math.floor((campaign.impressions * campaign.cpm) / (campaign.budget * 10)));
  const isHighlighted = highlightedCampaignId === campaign.id;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 transition-opacity duration-300"
        style={{ zIndex: 9998, background: 'rgba(0,0,0,0.65)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 9999 }}>
        <div className="pointer-events-auto rounded-2xl overflow-hidden"
          style={{
            width: '480px',
            maxHeight: '85vh',
            background: 'rgba(8,8,20,0.99)',
            border: `1px solid ${brandColor}30`,
            boxShadow: `0 24px 80px rgba(0,0,0,0.8), 0 0 60px ${brandColor}15`,
            transform: open ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
            transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
            display: 'flex',
            flexDirection: 'column',
          }}>

          {/* Header */}
          <div className="px-6 py-5 border-b border-white/8 flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${brandColor}15 0%, transparent 100%)` }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ background: brandColor, boxShadow: `0 0 12px ${brandColor}` }} />
                <div>
                  <div className="text-white font-bold text-lg">{campaign.brand.name}</div>
                  <div className="text-xs text-zinc-400">{campaign.type} · {campaign.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={campaign.status} color={brandColor} />
                <button onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors text-sm">
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{ scrollbarWidth: 'none' }}>
            {/* Budget progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Budget</span>
                <span className="text-xs font-mono text-zinc-300">${campaign.budget.toLocaleString()} total</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${spendPercent}%`, background: `linear-gradient(90deg, ${brandColor}, ${brandColor}80)` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-zinc-600">${Math.floor(campaign.budget * spendPercent / 100).toLocaleString()} spent</span>
                <span className="text-xs text-zinc-600">{spendPercent}%</span>
              </div>
            </div>

            {/* Performance grid */}
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Live Performance</div>
              <div className="grid grid-cols-3 gap-2">
                <PerfTile label="Impressions" value={campaign.impressions.toLocaleString()} color={brandColor} />
                <PerfTile label="Engagements" value={campaign.engagements.toLocaleString()} color="#22c55e" />
                <PerfTile label="CTR" value={`${ctr}%`} color="#f59e0b" />
                <PerfTile label="CPM" value={`$${campaign.cpm.toFixed(2)}`} color="#4f46e5" />
                <PerfTile label="Est. Revenue" value={`$${(campaign.impressions * campaign.cpm / 1000).toFixed(0)}`} color="#ec4899" />
                <PerfTile label="Robots" value={`${assignedRobots.length}`} color="#a1a1aa" />
              </div>
            </div>

            {/* Targeting */}
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Targeting</div>
              <div className="rounded-xl p-4 space-y-2.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <TargetRow icon="📍" label="Location" value={campaign.location + ', San Francisco'} />
                <TargetRow icon="⚡" label="Trigger" value={campaign.type} />
                <TargetRow icon="🤖" label="Robot Types" value="Humanoid · Delivery · Retail" />
                <TargetRow icon="💰" label="Bid Strategy" value={`Max CPM $${(campaign.cpm * 1.3).toFixed(2)}`} />
              </div>
            </div>

            {/* Assigned robots */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Assigned Robots ({assignedRobots.length})</div>
                <button
                  onClick={() => onHighlightRobots(isHighlighted ? null : campaign.id)}
                  className="text-xs px-3 py-1 rounded-full font-semibold transition-all duration-200"
                  style={{
                    background: isHighlighted ? `${brandColor}30` : 'rgba(255,255,255,0.07)',
                    color: isHighlighted ? brandColor : '#a1a1aa',
                    border: `1px solid ${isHighlighted ? brandColor + '50' : 'rgba(255,255,255,0.1)'}`,
                  }}>
                  {isHighlighted ? '● Highlighted on map' : 'Highlight on map'}
                </button>
              </div>

              {assignedRobots.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                  {assignedRobots.map(r => (
                    <div key={r.id} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: brandColor }} />
                      <span className="text-xs font-mono text-zinc-300">{r.id}</span>
                      <span className="text-xs text-zinc-600">{r.robotType}</span>
                      <span className="ml-auto text-xs text-zinc-500">{r.impressionsToday.toLocaleString()} imp</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-zinc-600 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  Robots are being assigned...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatusBadge({ status, color }: { status: string; color: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    'Entering Auction': { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
    'Live': { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
    'Scaling': { bg: 'rgba(79,70,229,0.15)', text: '#4f46e5' },
  };
  const cfg = map[status] ?? { bg: `${color}15`, text: color };
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
      style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.text}30` }}>
      {status === 'Live' && <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle animate-pulse" style={{ background: cfg.text }} />}
      {status}
    </span>
  );
}

function PerfTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl px-3 py-2.5 text-center"
      style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
      <div className="text-base font-mono font-bold" style={{ color }}>{value}</div>
      <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
    </div>
  );
}

function TargetRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-sm">{icon}</span>
      <span className="text-xs text-zinc-500 w-20">{label}</span>
      <span className="text-xs text-zinc-200">{value}</span>
    </div>
  );
}
