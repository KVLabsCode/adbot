'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface Brand {
  name: string;
  color: string;
  bgGradient: string;
  cpmRange: [number, number];
  campaignTypes: string[];
}

export const BRANDS: Brand[] = [
  { name: 'Nike', color: '#22c55e', bgGradient: 'from-green-900 to-black', cpmRange: [10, 18], campaignTypes: ['Proximity Trigger', 'Route Sponsorship'] },
  { name: 'Coca-Cola', color: '#ef4444', bgGradient: 'from-red-900 to-black', cpmRange: [8, 15], campaignTypes: ['Ambient', 'Proximity Trigger'] },
  { name: 'Uber Eats', color: '#84cc16', bgGradient: 'from-lime-900 to-black', cpmRange: [12, 20], campaignTypes: ['Route Sponsorship', 'Proximity Trigger'] },
  { name: 'Spotify', color: '#1db954', bgGradient: 'from-green-800 to-zinc-900', cpmRange: [9, 16], campaignTypes: ['Ambient', 'Route Sponsorship'] },
  { name: 'Apple', color: '#a1a1aa', bgGradient: 'from-zinc-700 to-zinc-900', cpmRange: [15, 25], campaignTypes: ['Proximity Trigger', 'Ambient'] },
  { name: 'Adidas', color: '#3b82f6', bgGradient: 'from-blue-900 to-black', cpmRange: [10, 17], campaignTypes: ['Route Sponsorship', 'Ambient'] },
  { name: 'Starbucks', color: '#16a34a', bgGradient: 'from-green-900 to-zinc-900', cpmRange: [8, 14], campaignTypes: ['Proximity Trigger', 'Route Sponsorship'] },
  { name: 'Netflix', color: '#dc2626', bgGradient: 'from-red-950 to-black', cpmRange: [11, 19], campaignTypes: ['Ambient', 'Proximity Trigger'] },
  { name: 'Airbnb', color: '#f43f5e', bgGradient: 'from-rose-900 to-black', cpmRange: [9, 15], campaignTypes: ['Route Sponsorship', 'Ambient'] },
  { name: 'Google', color: '#4f46e5', bgGradient: 'from-indigo-900 to-black', cpmRange: [13, 22], campaignTypes: ['Proximity Trigger', 'Ambient'] },
];

export type CampaignStatus = 'Entering Auction' | 'Live' | 'Scaling';
export type RobotType = 'Humanoid' | 'Delivery' | 'Retail';

export interface Campaign {
  id: string;
  brand: Brand;
  type: string;
  budget: number;
  status: CampaignStatus;
  cpm: number;
  timestamp: number;
  robots: string[];
  impressions: number;
  engagements: number;
  location: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  sub?: string;
  timestamp: number;
  type: 'switch' | 'engagement' | 'auction' | 'launch';
  color: string;
}

export interface RevenueEvent {
  id: string;
  lat: number;
  lng: number;
  amount: number;
  robotId: string;
  timestamp: number;
}

export interface Robot {
  id: string;
  lat: number;
  lng: number;
  activeCampaign: Campaign | null;
  engagementMode: boolean;
  heading: number;
  targetLat: number;
  targetLng: number;
  robotType: RobotType;
  impressionsToday: number;
  revenueToday: number;
  recentActivity: ActivityItem[];
  fleet: string;
}

export interface AuctionEvent {
  id: string;
  brand: Brand;
  cpm: number;
  robotId: string;
  won: boolean;
  timestamp: number;
}

export interface Metrics {
  impressions: number;
  engagements: number;
  revenue: number;
  avgCpm: number;
  revenuePerMinute: number;
  revenueHistory: number[];
  activeRobots: number;
  activeCampaigns: number;
  lastImpression: number;   // timestamp of last tick — used for flash
  lastEngagement: number;
  lastRevenue: number;
}

const SF_CENTER = { lat: 37.773, lng: -122.431 };
const SF_SPREAD = { lat: 0.035, lng: 0.045 };
const ROBOT_TYPES: RobotType[] = ['Humanoid', 'Delivery', 'Retail'];
export const SF_LOCATIONS = ['Union Square', 'SoMa', 'Mission District', 'Hayes Valley', 'Castro', 'Financial District', 'Marina', 'Tenderloin'];

function randInRange(min: number, max: number) { return Math.random() * (max - min) + min; }
function genId() { return Math.random().toString(36).slice(2, 9); }
function genRobotId() { return `R-${Math.floor(1000 + Math.random() * 9000)}`; }

function createRobot(): Robot {
  const lat = SF_CENTER.lat + randInRange(-SF_SPREAD.lat, SF_SPREAD.lat);
  const lng = SF_CENTER.lng + randInRange(-SF_SPREAD.lng, SF_SPREAD.lng);
  const impressionsToday = Math.floor(randInRange(200, 1800));
  return {
    id: genRobotId(),
    lat, lng,
    targetLat: lat + randInRange(-0.003, 0.003),
    targetLng: lng + randInRange(-0.003, 0.003),
    activeCampaign: null,
    engagementMode: false,
    heading: Math.random() * 360,
    robotType: ROBOT_TYPES[Math.floor(Math.random() * ROBOT_TYPES.length)],
    impressionsToday,
    revenueToday: parseFloat((impressionsToday * randInRange(10, 20) / 1000).toFixed(2)),
    recentActivity: [],
    fleet: 'Starship SF Fleet',
  };
}

function createCampaign(brand: Brand): Campaign {
  const type = brand.campaignTypes[Math.floor(Math.random() * brand.campaignTypes.length)];
  const cpm = parseFloat(randInRange(brand.cpmRange[0], brand.cpmRange[1]).toFixed(2));
  const budget = Math.floor(randInRange(2000, 15000) / 500) * 500;
  const impressions = Math.floor(randInRange(1000, 8000));
  return {
    id: genId(),
    brand, type, budget,
    status: 'Entering Auction',
    cpm, timestamp: Date.now(),
    robots: [],
    impressions,
    engagements: Math.floor(impressions * randInRange(0.04, 0.12)),
    location: SF_LOCATIONS[Math.floor(Math.random() * SF_LOCATIONS.length)],
  };
}

const INITIAL_ROBOT_COUNT = 40;

export function useSimulation() {
  const [robots, setRobots] = useState<Robot[]>(() =>
    Array.from({ length: INITIAL_ROBOT_COUNT }, createRobot)
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const initial: Campaign[] = [];
    for (let i = 0; i < 7; i++) {
      const brand = BRANDS[i % BRANDS.length];
      const c = createCampaign(brand);
      c.status = i < 4 ? 'Live' : 'Scaling';
      initial.push(c);
    }
    return initial;
  });
  const [auctionFeed, setAuctionFeed] = useState<AuctionEvent[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [revenueEvents, setRevenueEvents] = useState<RevenueEvent[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    impressions: 847320, engagements: 23891, revenue: 48234.50,
    avgCpm: 13.4, revenuePerMinute: 127,
    revenueHistory: Array.from({ length: 30 }, (_, i) => 80 + i * 2 + Math.random() * 20),
    activeRobots: INITIAL_ROBOT_COUNT, activeCampaigns: 7,
    lastImpression: 0, lastEngagement: 0, lastRevenue: 0,
  });
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [engagementEvent, setEngagementEvent] = useState(false);
  const [engagingRobotId, setEngagingRobotId] = useState<string | null>(null);
  const [highlightedCampaignId, setHighlightedCampaignId] = useState<string | null>(null);

  const robotsRef = useRef(robots);
  const campaignsRef = useRef(campaigns);
  robotsRef.current = robots;
  campaignsRef.current = campaigns;

  const pushActivity = useCallback((item: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    setActivityFeed(prev => [{ ...item, id: genId(), timestamp: Date.now() }, ...prev].slice(0, 40));
  }, []);

  useEffect(() => { setActiveCampaign(campaigns[0]); }, []); // eslint-disable-line

  // Engagement loop
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        const allRobots = robotsRef.current;
        const activeRobots = allRobots.filter(r => r.activeCampaign);
        const robot = activeRobots.length > 0
          ? activeRobots[Math.floor(Math.random() * activeRobots.length)]
          : allRobots[Math.floor(Math.random() * allRobots.length)];

        setEngagementEvent(true);
        setEngagingRobotId(robot.id);

        const revAmount = parseFloat((randInRange(0.08, 0.45)).toFixed(2));

        // Floating revenue event
        setRevenueEvents(prev => [
          { id: genId(), lat: robot.lat, lng: robot.lng, amount: revAmount, robotId: robot.id, timestamp: Date.now() },
          ...prev,
        ].slice(0, 15));

        // Update robot revenue
        setRobots(prev => prev.map(r => {
          if (r.id !== robot.id) return r;
          const act: ActivityItem = {
            id: genId(), timestamp: Date.now(),
            text: 'Human detected — engagement mode',
            type: 'engagement', color: '#22c55e',
          };
          return {
            ...r,
            revenueToday: parseFloat((r.revenueToday + revAmount).toFixed(2)),
            impressionsToday: r.impressionsToday + Math.floor(randInRange(3, 10)),
            recentActivity: [act, ...r.recentActivity].slice(0, 5),
          };
        }));

        pushActivity({
          text: `Robot ${robot.id} detected a human`,
          sub: `Switched to engagement mode · +$${revAmount} earned`,
          type: 'engagement', color: '#22c55e',
        });

        setMetrics(m => ({
          ...m,
          engagements: m.engagements + Math.floor(randInRange(3, 12)),
          revenue: m.revenue + revAmount,
          lastEngagement: Date.now(),
          lastRevenue: Date.now(),
        }));

        // Expire revenue event
        setTimeout(() => {
          setRevenueEvents(prev => prev.filter(e => e.robotId !== robot.id || Date.now() - e.timestamp < 2800));
        }, 2800);

        setTimeout(() => { setEngagementEvent(false); setEngagingRobotId(null); }, 3500);
        schedule();
      }, randInRange(7000, 13000));
    };
    schedule();
    return () => clearTimeout(timer);
  }, [pushActivity]);

  // Main loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Move robots
      setRobots(prev => prev.map(r => {
        const dLat = r.targetLat - r.lat;
        const dLng = r.targetLng - r.lng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        const step = 0.00028;
        const newLat = r.lat + (dLat / Math.max(dist, 0.0001)) * step;
        const newLng = r.lng + (dLng / Math.max(dist, 0.0001)) * step;
        const nearTarget = dist < 0.0005;
        return {
          ...r, lat: newLat, lng: newLng,
          targetLat: nearTarget ? SF_CENTER.lat + randInRange(-SF_SPREAD.lat, SF_SPREAD.lat) : r.targetLat,
          targetLng: nearTarget ? SF_CENTER.lng + randInRange(-SF_SPREAD.lng, SF_SPREAD.lng) : r.targetLng,
        };
      }));

      // Spawn campaign
      if (Math.random() < 0.3) {
        const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
        const newCampaign = createCampaign(brand);
        setCampaigns(prev => [newCampaign, ...prev].slice(0, 12));

        setTimeout(() => {
          const allRobots = robotsRef.current;
          const count = Math.floor(randInRange(3, 7));
          const winning = [...allRobots].sort(() => Math.random() - 0.5).slice(0, count).map(r => r.id);
          const outbidBrand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
          const outbidCpm = parseFloat((newCampaign.cpm - randInRange(1, 3)).toFixed(2));

          setAuctionFeed(prev => [
            { id: genId(), brand: outbidBrand, cpm: outbidCpm, robotId: winning[0], won: false, timestamp: Date.now() },
            { id: genId(), brand: newCampaign.brand, cpm: newCampaign.cpm, robotId: winning[0], won: true, timestamp: Date.now() + 100 },
            ...prev,
          ].slice(0, 25));

          const liveCampaign: Campaign = { ...newCampaign, status: 'Live', robots: winning };
          setCampaigns(prev => prev.map(c => c.id === newCampaign.id ? liveCampaign : c));

          setRobots(prev => prev.map(r => {
            if (!winning.includes(r.id)) return r;
            const prevBrand = r.activeCampaign?.brand.name;
            const act: ActivityItem = {
              id: genId(), timestamp: Date.now(),
              text: prevBrand ? `Switched ${prevBrand} → ${newCampaign.brand.name}` : `Started ${newCampaign.brand.name}`,
              type: 'switch', color: newCampaign.brand.color,
            };
            return {
              ...r, activeCampaign: liveCampaign,
              impressionsToday: r.impressionsToday + Math.floor(randInRange(10, 40)),
              revenueToday: parseFloat((r.revenueToday + randInRange(0.05, 0.3)).toFixed(2)),
              recentActivity: [act, ...r.recentActivity].slice(0, 5),
            };
          }));

          setActiveCampaign(liveCampaign);
          pushActivity({
            text: `${newCampaign.brand.name} won ${winning.length} robots in ${newCampaign.location}`,
            sub: `$${newCampaign.cpm.toFixed(2)} CPM beat ${outbidBrand.name} ($${outbidCpm})`,
            type: 'auction', color: newCampaign.brand.color,
          });

          setMetrics(m => ({ ...m, lastRevenue: Date.now() }));
          setTimeout(() => setCampaigns(prev => prev.map(c => c.id === newCampaign.id ? { ...c, status: 'Scaling' } : c)), 8000);
        }, 2000);
      }

      // Tick metrics
      const impDelta = Math.floor(randInRange(15, 45));
      const revDelta = parseFloat((impDelta * randInRange(0.010, 0.022)).toFixed(2));
      setMetrics(prev => ({
        ...prev,
        impressions: prev.impressions + impDelta,
        revenue: prev.revenue + revDelta,
        avgCpm: parseFloat((prev.avgCpm + randInRange(-0.08, 0.12)).toFixed(2)),
        revenuePerMinute: Math.max(80, prev.revenuePerMinute + randInRange(-4, 6)),
        revenueHistory: [...prev.revenueHistory.slice(1), prev.revenuePerMinute + randInRange(-5, 8)],
        activeCampaigns: campaignsRef.current.filter(c => c.status !== 'Entering Auction').length,
        lastImpression: Date.now(),
      }));
    }, 1500);

    return () => clearInterval(interval);
  }, [pushActivity]);

  // Listen for campaigns launched from the main Kovio app (cross-tab BroadcastChannel)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let ch: BroadcastChannel;
    try {
      ch = new BroadcastChannel('kovio_demo');
      ch.onmessage = (e) => {
        if (e.data?.type !== 'CAMPAIGN_LAUNCHED') return;
        const src = e.data.campaign;

        // Map main-app campaign → demo Brand
        const DEMO_COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4', '#f97316'];
        const colorIdx = (src.name ?? '?').charCodeAt(0) % DEMO_COLORS.length;
        const brand: Brand = {
          name: src.name ?? 'Custom Campaign',
          color: DEMO_COLORS[colorIdx],
          bgGradient: 'from-indigo-900 to-black',
          cpmRange: [10, 20],
          campaignTypes: ['Proximity Trigger', 'Route Sponsorship'],
        };
        const cpm = parseFloat(randInRange(10, 20).toFixed(2));
        const campaign: Campaign = {
          id: src.id ?? genId(),
          brand,
          type: 'Proximity Trigger',
          budget: src.budget ?? 5000,
          status: 'Entering Auction',
          cpm,
          timestamp: Date.now(),
          robots: [],
          impressions: 0,
          engagements: 0,
          location: SF_LOCATIONS[Math.floor(Math.random() * SF_LOCATIONS.length)],
        };

        setCampaigns(prev => [campaign, ...prev].slice(0, 12));
        pushActivity({ text: `🚀 "${src.name}" launched from main app`, sub: 'Entering auction now...', type: 'launch', color: brand.color });

        // Auction after 2s
        setTimeout(() => {
          const allRobots = robotsRef.current;
          const count = Math.floor(randInRange(4, 8));
          const winning = [...allRobots].sort(() => Math.random() - 0.5).slice(0, count).map(r => r.id);
          const liveCampaign: Campaign = { ...campaign, status: 'Live', robots: winning };

          setCampaigns(prev => prev.map(c => c.id === campaign.id ? liveCampaign : c));
          setRobots(prev => prev.map(r => {
            if (!winning.includes(r.id)) return r;
            const act: ActivityItem = { id: genId(), timestamp: Date.now(), text: `Campaign: ${src.name}`, type: 'launch', color: brand.color };
            return { ...r, activeCampaign: liveCampaign, recentActivity: [act, ...r.recentActivity].slice(0, 5) };
          }));

          setActiveCampaign(liveCampaign);
          setHighlightedCampaignId(liveCampaign.id);
          setAuctionFeed(prev => [
            { id: genId(), brand, cpm, robotId: winning[0], won: true, timestamp: Date.now() },
            ...prev,
          ].slice(0, 25));
          pushActivity({
            text: `"${src.name}" is live on ${winning.length} robots`,
            sub: `$${cpm.toFixed(2)} CPM · launched from advertiser portal`,
            type: 'launch', color: brand.color,
          });
          setMetrics(m => ({ ...m, lastRevenue: Date.now(), lastImpression: Date.now() }));
          setTimeout(() => setHighlightedCampaignId(null), 8000);
          setTimeout(() => setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, status: 'Scaling' } : c)), 10000);
        }, 2000);
      };
    } catch (_) {}
    return () => { try { ch?.close(); } catch (_) {} };
  }, [pushActivity]); // eslint-disable-line

  // Launch campaign manually
  const launchCampaign = useCallback((brand?: Brand) => {
    const b = brand ?? BRANDS[Math.floor(Math.random() * BRANDS.length)];
    const campaign = createCampaign(b);
    campaign.budget = Math.floor(randInRange(8000, 20000) / 500) * 500;
    campaign.cpm = parseFloat(randInRange(b.cpmRange[1] * 0.9, b.cpmRange[1] * 1.3).toFixed(2));

    setCampaigns(prev => [campaign, ...prev].slice(0, 12));
    pushActivity({ text: `🚀 ${b.name} Flash Campaign launched`, sub: 'Entering auction now...', type: 'launch', color: b.color });

    // Dramatic auction sequence
    const outbid1 = BRANDS[Math.floor(Math.random() * BRANDS.length)];
    const outbid2 = BRANDS[Math.floor(Math.random() * BRANDS.length)];
    setTimeout(() => setAuctionFeed(prev => [
      { id: genId(), brand: outbid1, cpm: parseFloat((campaign.cpm * 0.7).toFixed(2)), robotId: 'R-???', won: false, timestamp: Date.now() },
      ...prev,
    ].slice(0, 25)), 400);
    setTimeout(() => setAuctionFeed(prev => [
      { id: genId(), brand: outbid2, cpm: parseFloat((campaign.cpm * 0.85).toFixed(2)), robotId: 'R-???', won: false, timestamp: Date.now() },
      ...prev,
    ].slice(0, 25)), 900);

    setTimeout(() => {
      const allRobots = robotsRef.current;
      const count = Math.floor(randInRange(6, 10));
      const winning = [...allRobots].sort(() => Math.random() - 0.5).slice(0, count).map(r => r.id);

      setAuctionFeed(prev => [
        { id: genId(), brand: b, cpm: campaign.cpm, robotId: winning[0], won: true, timestamp: Date.now() },
        ...prev,
      ].slice(0, 25));

      const liveCampaign: Campaign = { ...campaign, status: 'Live', robots: winning };
      setCampaigns(prev => prev.map(c => c.id === campaign.id ? liveCampaign : c));
      setRobots(prev => prev.map(r => {
        if (!winning.includes(r.id)) return r;
        const act: ActivityItem = { id: genId(), timestamp: Date.now(), text: `Flash: ${b.name}`, type: 'launch', color: b.color };
        return {
          ...r, activeCampaign: liveCampaign,
          impressionsToday: r.impressionsToday + Math.floor(randInRange(20, 60)),
          revenueToday: parseFloat((r.revenueToday + randInRange(0.2, 0.8)).toFixed(2)),
          recentActivity: [act, ...r.recentActivity].slice(0, 5),
        };
      }));

      setActiveCampaign(liveCampaign);
      setHighlightedCampaignId(liveCampaign.id);
      pushActivity({
        text: `${b.name} is live on ${winning.length} robots`,
        sub: `$${campaign.cpm.toFixed(2)} CPM · ${b.campaignTypes[0]} · ${campaign.location}`,
        type: 'launch', color: b.color,
      });
      setMetrics(prev => ({
        ...prev,
        impressions: prev.impressions + 420,
        revenue: prev.revenue + 6.8,
        engagements: prev.engagements + 28,
        revenuePerMinute: prev.revenuePerMinute + 45,
        lastImpression: Date.now(), lastEngagement: Date.now(), lastRevenue: Date.now(),
      }));

      setTimeout(() => setHighlightedCampaignId(null), 7000);
      setTimeout(() => setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, status: 'Scaling' } : c)), 9000);
    }, 1800);
  }, [pushActivity]);

  return {
    robots, campaigns, auctionFeed, activityFeed, revenueEvents,
    metrics, activeCampaign, engagementEvent, engagingRobotId,
    highlightedCampaignId, setHighlightedCampaignId,
    launchCampaign,
  };
}
