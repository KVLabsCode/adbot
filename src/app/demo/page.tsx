'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useSimulation, Robot, Campaign, BRANDS } from './hooks/useSimulation';
import TopBar from './components/TopBar';
import CampaignsFeed from './components/CampaignsFeed';
import AuctionPanel from './components/AuctionPanel';
import AnalyticsBar from './components/AnalyticsBar';
import RobotSlideOver from './components/RobotSlideOver';
import CampaignModal from './components/CampaignModal';

const RobotMap = dynamic(() => import('./components/RobotMap'), { ssr: false });

function DemoContent() {
  const {
    robots, campaigns, auctionFeed, activityFeed, revenueEvents,
    metrics, activeCampaign, engagementEvent, engagingRobotId,
    highlightedCampaignId, setHighlightedCampaignId,
    launchCampaign,
  } = useSimulation();

  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launchPhase, setLaunchPhase] = useState<'idle' | 'entering' | 'auctioning' | 'live'>('idle');

  // Keep selectedRobot in sync with live data
  useEffect(() => {
    if (!selectedRobot) return;
    const updated = robots.find(r => r.id === selectedRobot.id);
    if (updated) setSelectedRobot(updated);
  }, [robots]); // eslint-disable-line

  // Keep selectedCampaign in sync
  useEffect(() => {
    if (!selectedCampaign) return;
    const updated = campaigns.find(c => c.id === selectedCampaign.id);
    if (updated) setSelectedCampaign(updated);
  }, [campaigns]); // eslint-disable-line

  const handleLaunch = () => {
    if (launching) return;
    setLaunching(true);
    setLaunchPhase('entering');
    setTimeout(() => setLaunchPhase('auctioning'), 600);
    setTimeout(() => setLaunchPhase('live'), 2000);
    setTimeout(() => { setLaunching(false); setLaunchPhase('idle'); }, 4500);
    launchCampaign(BRANDS.find(b => b.name === 'Adidas'));
  };

  const launchLabel = {
    idle: '🚀 Launch Flash Campaign',
    entering: '📋 Entering campaign feed...',
    auctioning: '⚡ Bidding in progress...',
    live: '✅ Live on 8 robots!',
  }[launchPhase];

  const launchColors = {
    idle: { bg: 'linear-gradient(135deg, #3b82f6, #4f46e5)', shadow: '0 4px 24px rgba(79,70,229,0.55), 0 0 50px rgba(59,130,246,0.25)' },
    entering: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', shadow: '0 4px 24px rgba(245,158,11,0.5)' },
    auctioning: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', shadow: '0 4px 24px rgba(239,68,68,0.5), 0 0 40px rgba(239,68,68,0.2)' },
    live: { bg: 'linear-gradient(135deg, #22c55e, #16a34a)', shadow: '0 4px 24px rgba(34,197,94,0.55), 0 0 50px rgba(34,197,94,0.2)' },
  }[launchPhase];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', width: '100vw',
      background: '#08080f', overflow: 'hidden',
      fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)', color: 'white',
    }}>
      <TopBar metrics={metrics} />

      <div style={{
        flex: 1, minHeight: 0,
        display: 'grid',
        gridTemplateColumns: '256px 1fr 272px',
        overflow: 'hidden',
        width: '100%',
      }}>
        {/* Left — campaigns */}
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <CampaignsFeed
            campaigns={campaigns}
            onCampaignClick={setSelectedCampaign}
            highlightedCampaignId={highlightedCampaignId}
          />
        </div>

        {/* Center — map */}
        <div style={{ position: 'relative', overflow: 'hidden', minWidth: 0 }}>
          <RobotMap
            robots={robots}
            onRobotClick={(robot) => {
              setSelectedRobot(robot);
              setHighlightedCampaignId(null);
            }}
            highlightedCampaignId={highlightedCampaignId}
            selectedRobotId={selectedRobot?.id ?? null}
            brandFilter={brandFilter}
            setBrandFilter={setBrandFilter}
            showActiveOnly={showActiveOnly}
            setShowActiveOnly={setShowActiveOnly}
            revenueEvents={revenueEvents}
            engagingRobotId={engagingRobotId}
          />

          {/* Launch button */}
          <div className="absolute bottom-5 left-1/2 z-30" style={{ transform: 'translateX(-50%)', pointerEvents: 'auto' }}>
            {/* Ripple rings when live */}
            {launchPhase === 'live' && (
              <>
                {[0, 1, 2].map(i => (
                  <div key={i} className="absolute rounded-full pointer-events-none"
                    style={{
                      inset: `-${20 + i * 18}px`,
                      border: '1.5px solid rgba(34,197,94,0.4)',
                      animation: `launchRipple 1.2s ${i * 0.3}s ease-out infinite`,
                    }} />
                ))}
              </>
            )}
            <button
              onClick={handleLaunch}
              disabled={launching}
              className="relative flex items-center gap-2.5 px-6 py-3 rounded-full font-bold text-sm text-white transition-all duration-500"
              style={{
                background: launchColors.bg,
                boxShadow: launchColors.shadow,
                border: '1px solid rgba(255,255,255,0.18)',
                cursor: launching ? 'default' : 'pointer',
                minWidth: '220px',
                justifyContent: 'center',
              }}>
              {launching && launchPhase !== 'live' && (
                <div style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
              )}
              <span>{launchLabel}</span>
            </button>
          </div>
        </div>

        {/* Right — auction + preview */}
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <AuctionPanel
            auctionFeed={auctionFeed}
            activityFeed={activityFeed}
            activeCampaign={activeCampaign}
            engagementEvent={engagementEvent}
            selectedRobot={selectedRobot}
          />
        </div>
      </div>

      <AnalyticsBar metrics={metrics} />

      <RobotSlideOver
        robot={selectedRobot}
        onClose={() => setSelectedRobot(null)}
        engagingRobotId={engagingRobotId}
        onHighlightCampaign={(id) => { setHighlightedCampaignId(id); }}
        highlightedCampaignId={highlightedCampaignId}
      />

      {selectedCampaign && (
        <CampaignModal
          campaign={selectedCampaign}
          robots={robots}
          onClose={() => setSelectedCampaign(null)}
          onHighlightRobots={(id) => { setHighlightedCampaignId(id); setSelectedRobot(null); }}
          highlightedCampaignId={highlightedCampaignId}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes launchRipple { 0% { transform: scale(0.6); opacity: 0.7; } 100% { transform: scale(1.4); opacity: 0; } }
      `}</style>
    </div>
  );
}

export default function DemoPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div style={{ height: '100vh', width: '100vw', background: '#08080f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', border: '2px solid #4f46e5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: '#52525b', fontSize: '13px' }}>Initializing Kovio network...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  return <DemoContent />;
}
