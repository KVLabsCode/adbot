'use client';

import { useEffect, useRef, useState } from 'react';
import { AuctionEvent, Campaign, ActivityItem } from '../hooks/useSimulation';

import { Robot } from '../hooks/useSimulation';

interface Props {
  auctionFeed: AuctionEvent[];
  activityFeed: ActivityItem[];
  activeCampaign: Campaign | null;
  engagementEvent: boolean;
  selectedRobot?: Robot | null;
}

export default function AuctionPanel({ auctionFeed, activityFeed, activeCampaign, engagementEvent, selectedRobot }: Props) {
  const displayCampaign = selectedRobot?.activeCampaign ?? activeCampaign;
  const robotLabel = selectedRobot ? `Live from ${selectedRobot.id}` : 'Live on network';
  return (
    <div className="flex flex-col h-full" style={{
      background: 'rgba(255,255,255,0.025)',
      borderLeft: '1px solid rgba(255,255,255,0.07)',
    }}>
      {/* Auction Feed — top 38% */}
      <div className="flex flex-col flex-shrink-0" style={{ height: '38%', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-4 py-3 border-b border-white/7 flex-shrink-0 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Live Auction</span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5" style={{ scrollbarWidth: 'none' }}>
          {auctionFeed.map(event => <AuctionRow key={event.id} event={event} />)}
          {auctionFeed.length === 0 && (
            <div className="text-zinc-600 text-xs text-center mt-3">Waiting for bids...</div>
          )}
        </div>
      </div>

      {/* Ad preview — middle 40% */}
      <div className="flex flex-col flex-shrink-0" style={{ height: '40%', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-4 py-3 border-b border-white/7 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Ad Preview</span>
          </div>
          <span className="text-xs font-mono" style={{ color: selectedRobot ? '#22c55e' : '#52525b' }}>{robotLabel}</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-3">
          <RobotVisual campaign={displayCampaign} engagementEvent={engagementEvent} />
        </div>
      </div>

      {/* Activity feed — bottom 22% */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-4 py-2.5 border-b border-white/7 flex-shrink-0 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Activity</span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1" style={{ scrollbarWidth: 'none' }}>
          {activityFeed.map(item => <ActivityRow key={item.id} item={item} />)}
          {activityFeed.length === 0 && (
            <div className="text-zinc-600 text-xs text-center mt-2">Waiting for activity...</div>
          )}
        </div>
      </div>
    </div>
  );
}

function AuctionRow({ event }: { event: AuctionEvent }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.opacity = '0';
    ref.current.style.transform = 'translateX(8px)';
    requestAnimationFrame(() => setTimeout(() => {
      if (ref.current) {
        ref.current.style.transition = 'opacity 0.3s, transform 0.3s';
        ref.current.style.opacity = '1';
        ref.current.style.transform = 'translateX(0)';
      }
    }, 10));
  }, []);

  return (
    <div ref={ref} className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
      style={{
        background: event.won ? 'rgba(245,158,11,0.07)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${event.won ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)'}`,
      }}>
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: event.brand.color }} />
        <span className="text-xs text-white font-medium truncate">{event.brand.name}</span>
        <span className="text-xs text-zinc-600 hidden xl:block truncate">→ {event.robotId}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
        <span className="text-xs font-mono" style={{ color: event.won ? '#f59e0b' : '#52525b' }}>
          ${event.cpm.toFixed(2)}
        </span>
        {event.won && (
          <span className="text-xs px-1.5 py-0.5 rounded font-bold text-amber-400"
            style={{ background: 'rgba(245,158,11,0.15)' }}>WIN</span>
        )}
      </div>
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.opacity = '0';
    requestAnimationFrame(() => setTimeout(() => {
      if (ref.current) {
        ref.current.style.transition = 'opacity 0.4s';
        ref.current.style.opacity = '1';
      }
    }, 10));
  }, []);

  return (
    <div ref={ref} className="px-2.5 py-1.5 rounded-lg"
      style={{ borderLeft: `2px solid ${item.color}50`, background: 'rgba(255,255,255,0.02)' }}>
      <div className="text-xs text-zinc-300">{item.text}</div>
      {item.sub && <div className="text-xs text-zinc-600 mt-0.5">{item.sub}</div>}
    </div>
  );
}

function RobotVisual({ campaign, engagementEvent }: { campaign: Campaign | null; engagementEvent: boolean }) {
  const [displayCampaign, setDisplayCampaign] = useState(campaign);
  const [fading, setFading] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    if (campaign?.id !== displayCampaign?.id) {
      setFading(true);
      setTimeout(() => { setDisplayCampaign(campaign); setFading(false); }, 300);
    }
  }, [campaign, displayCampaign?.id]);

  useEffect(() => {
    if (engagementEvent) {
      setShowBadge(true);
      setTimeout(() => setShowQr(true), 600);
      setTimeout(() => { setShowQr(false); setShowBadge(false); }, 3500);
    }
  }, [engagementEvent]);

  const brandColor = displayCampaign?.brand.color ?? '#4f46e5';

  return (
    <div className="relative flex flex-col items-center" style={{ width: '140px' }}>
      {/* Engagement badge */}
      {showBadge && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-bold text-white"
          style={{ background: '#16a34a', animation: 'pulse 1s infinite', fontSize: '10px' }}>
          👤 Human Detected
        </div>
      )}

      {/* Sonar rings */}
      {showBadge && [0, 1, 2].map(i => (
        <div key={i} className="absolute rounded-full border pointer-events-none"
          style={{
            width: `${100 + i * 35}px`, height: `${100 + i * 35}px`,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            borderColor: `${brandColor}35`,
            animation: `sonarRing 1.5s ${i * 0.4}s ease-out infinite`,
          }} />
      ))}

      <svg viewBox="0 0 120 200" width="140" height="233" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="bGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#2a2a3e" />
            <stop offset="100%" stopColor="#15151f" />
          </radialGradient>
        </defs>

        {/* Body */}
        <rect x="25" y="70" width="70" height="85" rx="12" fill="url(#bGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        {/* Arms */}
        <rect x="6" y="80" width="19" height="55" rx="8" fill="#181825" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        <rect x="95" y="80" width="19" height="55" rx="8" fill="#181825" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        <circle cx="15" cy="143" r="8" fill="#1e1e2e" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <circle cx="105" cy="143" r="8" fill="#1e1e2e" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        {/* Legs */}
        <rect x="37" y="152" width="16" height="38" rx="7" fill="#181825" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        <rect x="67" y="152" width="16" height="38" rx="7" fill="#181825" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        <rect x="32" y="186" width="26" height="10" rx="5" fill="#1e1e2e" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <rect x="62" y="186" width="26" height="10" rx="5" fill="#1e1e2e" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        {/* Head */}
        <rect x="27" y="18" width="66" height="54" rx="14" fill="#1e1e2e" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
        {/* Neck */}
        <rect x="48" y="68" width="24" height="7" rx="3" fill="#15151f" />
        {/* Eyes */}
        <rect x="36" y="31" width="18" height="11" rx="5.5"
          fill={showBadge ? brandColor : '#4f46e5'} filter="url(#glow2)"
          style={{ transition: 'fill 0.3s' }} />
        <rect x="66" y="31" width="18" height="11" rx="5.5"
          fill={showBadge ? brandColor : '#4f46e5'} filter="url(#glow2)"
          style={{ transition: 'fill 0.3s' }} />
        <circle cx="44" cy="36" r="2.5" fill="white" opacity="0.45" />
        <circle cx="74" cy="36" r="2.5" fill="white" opacity="0.45" />
        {/* Antenna */}
        <line x1="60" y1="18" x2="60" y2="6" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        <circle cx="60" cy="5" r="3.5" fill={brandColor} filter="url(#glow2)" />
        {/* Mouth / speaker */}
        <rect x="44" y="54" width="32" height="4" rx="2" fill="#111" />
        {[0,1,2,3,4].map(i => (
          <rect key={i} x={46 + i * 6} y="55" width="3" height="2" rx="1" fill={brandColor} opacity="0.5" />
        ))}
        {/* Chest screen */}
        <rect x="32" y="76" width="56" height="54" rx="7" fill="#0a0a14" stroke={`${brandColor}45`} strokeWidth="1.5" />
        {/* Screen corner accents */}
        {[
          [[32,82],[32,76],[38,76]], [[82,76],[88,76],[88,82]],
          [[32,124],[32,130],[38,130]], [[88,124],[88,130],[82,130]]
        ].map((pts, i) => (
          <polyline key={i} points={pts.map(p => p.join(',')).join(' ')}
            stroke={brandColor} strokeWidth="1.5" fill="none" opacity="0.55" />
        ))}

        {/* Screen content */}
        <foreignObject x="33" y="77" width="54" height="52">
          <div xmlns="http://www.w3.org/1999/xhtml" style={{
            width: '54px', height: '52px', borderRadius: '5px', overflow: 'hidden',
            opacity: fading ? 0 : 1, transition: 'opacity 0.3s ease',
            background: displayCampaign ? `linear-gradient(135deg, ${brandColor}50, #050510)` : '#0a0a14',
          }}>
            {showQr ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                <svg width="24" height="24" viewBox="0 0 8 8">
                  {[[1,1,1,0,1,1,1,0],[1,0,1,1,0,1,0,0],[1,1,1,0,1,0,1,0],[0,0,1,0,0,1,1,0],[1,1,0,1,0,1,0,0],[1,0,1,0,1,0,1,1],[1,1,0,1,0,0,1,0],[0,0,0,0,1,1,1,1]].map((row, r) =>
                    row.map((v, c) => v ? <rect key={`${r}-${c}`} x={c} y={r} width="0.9" height="0.9" fill={brandColor} /> : null)
                  )}
                </svg>
                <span style={{ fontSize: '5px', color: brandColor, fontWeight: 700 }}>SCAN NOW</span>
              </div>
            ) : displayCampaign ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', padding: '4px' }}>
                <span style={{ fontSize: '8px', color: 'white', fontWeight: 900, textAlign: 'center' }}>{displayCampaign.brand.name}</span>
                <div style={{ width: '28px', height: '1px', background: brandColor }} />
                <div style={{ padding: '2px 5px', background: brandColor, borderRadius: '2px' }}>
                  <span style={{ fontSize: '5px', color: 'black', fontWeight: 800 }}>TAP</span>
                </div>
              </div>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '7px', color: '#333' }}>IDLE</span>
              </div>
            )}
          </div>
        </foreignObject>

        {/* Status LEDs */}
        <circle cx="38" cy="58" r="3" fill={brandColor} filter="url(#glow2)" opacity="0.85" />
        <circle cx="50" cy="58" r="2" fill="#22c55e" opacity="0.65" />
        <circle cx="61" cy="58" r="2" fill="#f59e0b" opacity="0.55" />
        <circle cx="72" cy="58" r="1.5" fill="#ef4444" opacity="0.4" />
      </svg>

      <style>{`
        @keyframes sonarRing {
          0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
      `}</style>

      {/* Brand label */}
      <div className="mt-1 text-center">
        {displayCampaign ? (
          <>
            <div className="text-xs font-bold" style={{ color: brandColor }}>{displayCampaign.brand.name}</div>
            <div className="text-xs text-zinc-600">${displayCampaign.cpm.toFixed(2)} CPM</div>
          </>
        ) : (
          <div className="text-xs text-zinc-700">Idle</div>
        )}
      </div>
    </div>
  );
}
