'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Robot, RevenueEvent, BRANDS } from '../hooks/useSimulation';

interface FloatingRevenue {
  id: string;
  x: number;
  y: number;
  amount: number;
  createdAt: number;
}

interface Props {
  robots: Robot[];
  onRobotClick: (robot: Robot) => void;
  highlightedCampaignId: string | null;
  selectedRobotId: string | null;
  brandFilter: string | null;
  setBrandFilter: (b: string | null) => void;
  showActiveOnly: boolean;
  setShowActiveOnly: (v: boolean) => void;
  revenueEvents: RevenueEvent[];
  engagingRobotId: string | null;
}

const HEAT_ZONES = [
  { lat: 37.7879, lng: -122.4075, label: 'Union Square' },
  { lat: 37.7841, lng: -122.3963, label: 'SoMa' },
  { lat: 37.7599, lng: -122.4148, label: 'Mission' },
];

export default function RobotMap({
  robots, onRobotClick, highlightedCampaignId, selectedRobotId,
  brandFilter, setBrandFilter, showActiveOnly, setShowActiveOnly,
  revenueEvents, engagingRobotId,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const robotsRef = useRef(robots);
  robotsRef.current = robots;
  const [hoveredRobot, setHoveredRobot] = useState<Robot | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [floatingRevenue, setFloatingRevenue] = useState<FloatingRevenue[]>([]);

  // Convert revenue events → screen positions
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || revenueEvents.length === 0) return;
    const map = mapInstanceRef.current;
    const container = mapRef.current;
    if (!container) return;

    const newItems: FloatingRevenue[] = revenueEvents
      .filter(e => Date.now() - e.timestamp < 500) // only brand new events
      .map(e => {
        try {
          const pt = map.latLngToContainerPoint([e.lat, e.lng]);
          return { id: e.id, x: pt.x, y: pt.y, amount: e.amount, createdAt: Date.now() };
        } catch { return null; }
      })
      .filter(Boolean) as FloatingRevenue[];

    if (newItems.length > 0) {
      setFloatingRevenue(prev => [...prev, ...newItems].slice(-12));
      // Expire after 2.5s
      setTimeout(() => {
        setFloatingRevenue(prev => prev.filter(f => Date.now() - f.createdAt < 2400));
      }, 2500);
    }
  }, [revenueEvents, isLoaded]);

  const isVisible = useCallback((robot: Robot) => {
    if (showActiveOnly && !robot.activeCampaign) return false;
    if (brandFilter && robot.activeCampaign?.brand.name !== brandFilter) return false;
    return true;
  }, [showActiveOnly, brandFilter]);

  const markerOpacity = useCallback((robot: Robot) => {
    if (selectedRobotId && robot.id !== selectedRobotId) return 0.35;
    if (highlightedCampaignId) {
      const inCampaign = robot.activeCampaign?.robots?.includes(robot.id) || robot.activeCampaign?.id === highlightedCampaignId;
      if (!inCampaign) return 0.3;
    }
    if (!isVisible(robot)) return 0;
    return 1;
  }, [selectedRobotId, highlightedCampaignId, isVisible]);

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const initMap = async () => {
      const leaflet = await import('leaflet');
      const L = leaflet.default;
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const container = mapRef.current! as any;
      if (container._leaflet_id) container._leaflet_id = undefined;

      const map = L.map(mapRef.current!, {
        center: [37.773, -122.431],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);

      HEAT_ZONES.forEach(zone => {
        L.circle([zone.lat, zone.lng], {
          radius: 500,
          color: 'rgba(79,70,229,0.3)', fillColor: 'rgba(79,70,229,0.06)', fillOpacity: 1, weight: 1,
        }).addTo(map);
        const label = L.divIcon({
          html: `<div style="font-size:10px;color:rgba(139,122,255,0.5);font-family:monospace;white-space:nowrap;">${zone.label}</div>`,
          className: '', iconSize: [100, 14], iconAnchor: [50, 0],
        });
        L.marker([zone.lat + 0.0045, zone.lng], { icon: label }).addTo(map);
      });

      mapInstanceRef.current = map;
      setIsLoaded(true);
    };
    initMap();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current.clear();
      }
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;
    const update = async () => {
      const leaflet = await import('leaflet');
      const L = leaflet.default;
      const map = mapInstanceRef.current;

      robots.forEach(robot => {
        const opacity = markerOpacity(robot);
        const isSelected = robot.id === selectedRobotId;
        const isEngaging = robot.id === engagingRobotId;
        const color = robot.activeCampaign?.brand.color ?? '#3f3f5a';
        const size = isSelected ? 20 : isEngaging ? 18 : 13;
        const glowSize = isSelected ? 18 : isEngaging ? 14 : 7;

        const iconHtml = `
          <div style="position:relative;width:${size}px;height:${size}px;cursor:pointer;opacity:${opacity};transition:opacity 0.4s ease,transform 0.2s ease;">
            ${isSelected ? `
              <div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid ${color};opacity:0.4;animation:selectedRing 1.8s ease-in-out infinite;"></div>
              <div style="position:absolute;inset:-16px;border-radius:50%;border:1px solid ${color};opacity:0.2;animation:selectedRing 1.8s 0.4s ease-in-out infinite;"></div>
            ` : ''}
            <div style="position:absolute;inset:0;border-radius:50%;background:${color};box-shadow:0 0 ${glowSize}px ${color};transition:all 0.4s;"></div>
            <div style="position:absolute;inset:-5px;border-radius:50%;border:1.5px solid ${color};opacity:0.4;animation:ping ${isEngaging ? '0.7s' : isSelected ? '1.2s' : '2.4s'} cubic-bezier(0,0,0.2,1) infinite;"></div>
            ${isSelected ? `<div style="position:absolute;inset:3px;border-radius:50%;background:white;opacity:0.35;"></div>` : ''}
          </div>
        `;

        const icon = L.divIcon({ html: iconHtml, className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
        const existing = markersRef.current.get(robot.id);

        if (existing) {
          existing.setLatLng([robot.lat, robot.lng]);
          existing.setIcon(icon);
        } else {
          const marker = L.marker([robot.lat, robot.lng], { icon });
          marker.on('click', () => onRobotClick(robotsRef.current.find(r => r.id === robot.id) ?? robot));
          marker.on('mouseover', () => setHoveredRobot(robotsRef.current.find(r => r.id === robot.id) ?? robot));
          marker.on('mouseout', () => setHoveredRobot(null));
          marker.addTo(map);
          markersRef.current.set(robot.id, marker);
        }
      });
    };
    update();
  }, [robots, isLoaded, highlightedCampaignId, selectedRobotId, brandFilter, showActiveOnly, engagingRobotId, markerOpacity, onRobotClick]);

  const activeBrands = Array.from(new Set(robots.filter(r => r.activeCampaign).map(r => r.activeCampaign!.brand.name)));

  return (
    <div className="relative h-full w-full">
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        @keyframes ping { 75%, 100% { transform: scale(2.4); opacity: 0; } }
        @keyframes selectedRing { 0%,100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.15); opacity: 0.7; } }
        @keyframes floatUp { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-40px); opacity: 0; } }
        .leaflet-container { background: #0a0a0f !important; }
        .leaflet-control-zoom { border: 1px solid rgba(255,255,255,0.1) !important; margin: 10px !important; }
        .leaflet-control-zoom a { background: rgba(8,8,20,0.95) !important; color: #71717a !important; border-color: rgba(255,255,255,0.08) !important; font-size: 16px !important; }
        .leaflet-control-zoom a:hover { background: rgba(79,70,229,0.25) !important; color: white !important; }
      `}</style>

      <div ref={mapRef} className="w-full h-full" />

      {/* Loading */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: '#0d0d1a' }}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-zinc-500 text-sm">Loading SF network...</span>
          </div>
        </div>
      )}

      {/* Subtle vignette when robot selected — keeps map readable */}
      {selectedRobotId && (
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,5,14,0.35) 100%)', transition: 'opacity 0.4s' }} />
      )}

      {/* Filter bar */}
      {isLoaded && (
        <div className="absolute top-3 left-3 right-14 z-20 flex items-center gap-1.5 flex-wrap">
          <FilterPill label="All" active={brandFilter === null} onClick={() => setBrandFilter(null)} color="#4f46e5" />
          {activeBrands.slice(0, 5).map(name => {
            const brand = BRANDS.find(b => b.name === name);
            return (
              <FilterPill key={name} label={name} active={brandFilter === name}
                onClick={() => setBrandFilter(brandFilter === name ? null : name)}
                color={brand?.color ?? '#4f46e5'} />
            );
          })}
          <FilterPill label="Active Only" active={showActiveOnly} onClick={() => setShowActiveOnly(!showActiveOnly)} color="#22c55e" />
        </div>
      )}

      {/* Floating revenue indicators */}
      {floatingRevenue.map(item => (
        <div key={item.id}
          className="absolute pointer-events-none z-30 font-mono font-bold text-xs"
          style={{
            left: item.x - 20,
            top: item.y - 10,
            color: '#22c55e',
            textShadow: '0 0 8px rgba(34,197,94,0.8)',
            animation: 'floatUp 2.4s ease-out forwards',
          }}>
          +${item.amount.toFixed(2)}
        </div>
      ))}

      {/* Hover tooltip */}
      {hoveredRobot && !selectedRobotId && (
        <div className="absolute bottom-16 left-4 z-20 px-3 py-2 rounded-xl pointer-events-none"
          style={{ background: 'rgba(6,6,16,0.97)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(0,0,0,0.6)' }}>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-2 h-2 rounded-full"
              style={{ background: hoveredRobot.activeCampaign?.brand.color ?? '#4f46e5' }} />
            <span className="text-xs font-mono font-semibold text-white">{hoveredRobot.id}</span>
            <span className="text-xs text-zinc-500">·</span>
            <span className="text-xs font-semibold" style={{ color: hoveredRobot.activeCampaign?.brand.color ?? '#71717a' }}>
              {hoveredRobot.activeCampaign?.brand.name ?? 'Idle'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            {hoveredRobot.activeCampaign && (
              <span className="text-amber-400 font-mono">${hoveredRobot.activeCampaign.cpm.toFixed(2)} CPM</span>
            )}
            <span className="text-emerald-400 font-mono">${hoveredRobot.revenueToday.toFixed(2)} today</span>
            <span>{hoveredRobot.robotType}</span>
          </div>
          <div className="text-xs text-zinc-700 mt-0.5">Click to inspect →</div>
        </div>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{
        background: 'linear-gradient(to bottom, rgba(10,10,15,0.4) 0%, transparent 18%, transparent 82%, rgba(10,10,15,0.45) 100%)',
      }} />
    </div>
  );
}

function FilterPill({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color: string }) {
  return (
    <button onClick={onClick} className="text-xs px-2.5 py-1 rounded-full font-semibold transition-all duration-200"
      style={{
        background: active ? `${color}22` : 'rgba(8,8,20,0.88)',
        color: active ? color : '#71717a',
        border: `1px solid ${active ? color + '45' : 'rgba(255,255,255,0.1)'}`,
        backdropFilter: 'blur(8px)',
        boxShadow: active ? `0 0 10px ${color}18` : 'none',
      }}>
      {label}
    </button>
  );
}
