'use client';

import { useEffect, useRef } from 'react';
import { Campaign } from '../hooks/useSimulation';

const STATUS_CONFIG = {
  'Entering Auction': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  'Live': { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)' },
  'Scaling': { color: '#4f46e5', bg: 'rgba(79,70,229,0.12)', border: 'rgba(79,70,229,0.25)' },
};

interface Props {
  campaigns: Campaign[];
  onCampaignClick: (campaign: Campaign) => void;
  highlightedCampaignId: string | null;
}

export default function CampaignsFeed({ campaigns, onCampaignClick, highlightedCampaignId }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(campaigns.length);

  useEffect(() => {
    if (campaigns.length > prevLengthRef.current && listRef.current) {
      listRef.current.scrollTop = 0;
    }
    prevLengthRef.current = campaigns.length;
  }, [campaigns.length]);

  return (
    <div className="flex flex-col h-full" style={{
      background: 'rgba(255,255,255,0.025)',
      borderRight: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div className="px-4 py-3 border-b border-white/7 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Live Campaigns</span>
          </div>
          <span className="text-xs text-zinc-600">{campaigns.length} active</span>
        </div>
        <div className="mt-1.5 text-xs text-zinc-600">Click any campaign to inspect</div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto p-2.5 space-y-2" style={{ scrollbarWidth: 'none' }}>
        {campaigns.map((c, i) => (
          <CampaignCard
            key={c.id}
            campaign={c}
            isNew={i === 0 && c.status === 'Entering Auction'}
            isHighlighted={highlightedCampaignId === c.id}
            onClick={() => onCampaignClick(c)}
          />
        ))}
      </div>
    </div>
  );
}

function CampaignCard({ campaign, isNew, isHighlighted, onClick }: {
  campaign: Campaign;
  isNew: boolean;
  isHighlighted: boolean;
  onClick: () => void;
}) {
  const cfg = STATUS_CONFIG[campaign.status];
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNew && cardRef.current) {
      cardRef.current.style.opacity = '0';
      cardRef.current.style.transform = 'translateY(-8px)';
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            cardRef.current.style.opacity = '1';
            cardRef.current.style.transform = 'translateY(0)';
          }
        }, 10);
      });
    }
  }, [isNew]);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className="rounded-xl p-3 border cursor-pointer transition-all duration-200 group"
      style={{
        background: isHighlighted
          ? `linear-gradient(135deg, ${campaign.brand.color}15, rgba(255,255,255,0.04))`
          : 'rgba(255,255,255,0.03)',
        borderColor: isHighlighted ? `${campaign.brand.color}40` : 'rgba(255,255,255,0.07)',
        boxShadow: isHighlighted ? `0 0 20px ${campaign.brand.color}15` : 'none',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, ${campaign.brand.color}12, rgba(255,255,255,0.05))`;
        (e.currentTarget as HTMLElement).style.borderColor = `${campaign.brand.color}35`;
        (e.currentTarget as HTMLElement).style.transform = 'translateX(2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = isHighlighted
          ? `linear-gradient(135deg, ${campaign.brand.color}15, rgba(255,255,255,0.04))`
          : 'rgba(255,255,255,0.03)';
        (e.currentTarget as HTMLElement).style.borderColor = isHighlighted ? `${campaign.brand.color}40` : 'rgba(255,255,255,0.07)';
        (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
      }}
    >
      {/* Brand header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: campaign.brand.color, boxShadow: `0 0 5px ${campaign.brand.color}` }} />
          <span className="text-sm font-semibold text-white">{campaign.brand.name}</span>
        </div>
        <span className="text-xs font-mono text-zinc-500">${campaign.cpm.toFixed(2)}</span>
      </div>

      {/* Type + location */}
      <div className="text-xs text-zinc-600 mb-2">{campaign.type} · {campaign.location}</div>

      {/* Budget + status */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-zinc-500">${campaign.budget.toLocaleString()}</span>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
          color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
        }}>
          {campaign.status === 'Live' && (
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle animate-pulse"
              style={{ background: cfg.color }} />
          )}
          {campaign.status}
        </span>
      </div>

      {/* Progress bar */}
      {campaign.status !== 'Entering Auction' && (
        <div className="mt-2 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-full rounded-full"
            style={{
              width: `${30 + (parseInt(campaign.id, 36) % 60)}%`,
              background: `linear-gradient(90deg, ${campaign.brand.color}, ${campaign.brand.color}40)`,
            }} />
        </div>
      )}

      {/* Click hint */}
      <div className="mt-1.5 text-xs text-zinc-700 group-hover:text-zinc-500 transition-colors">
        Click to inspect →
      </div>
    </div>
  );
}
