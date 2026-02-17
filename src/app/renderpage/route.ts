export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kovio R2B — Real-Time Bidding</title>
<style>
/* ── Reset & Base ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  height: 100%; overflow: hidden;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  background: #0a0a0f; color: #e0e0e0;
}

/* ── Layout: 3-column ── */
.layout {
  display: flex; height: 100vh; gap: 1px;
  background: rgba(255,255,255,0.03);
}
.panel {
  background: rgba(15,15,25,0.95);
  backdrop-filter: blur(20px);
  padding: 20px;
  overflow-y: auto;
}
.panel-left { width: 260px; border-right: 1px solid rgba(255,255,255,0.06); }
.panel-center { flex: 1; display: flex; flex-direction: column; }
.panel-right { width: 420px; border-left: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; }

/* ── Typography ── */
.section-title {
  font-size: 10px; text-transform: uppercase; letter-spacing: 2px;
  color: #888; margin-bottom: 12px; font-weight: 600;
}
.label { font-size: 11px; color: #666; margin-bottom: 2px; }
.value { font-size: 13px; color: #ccc; margin-bottom: 10px; font-weight: 500; }
.value.green { color: #4ade80; }
.value.amber { color: #fbbf24; }

/* ── Left Panel: Robot Context ── */
.context-block {
  margin-bottom: 16px; padding: 12px;
  background: rgba(255,255,255,0.02); border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.04);
}
.status-dot {
  display: inline-block; width: 8px; height: 8px; border-radius: 50%;
  margin-right: 6px; vertical-align: middle;
}
.status-dot.online { background: #4ade80; box-shadow: 0 0 6px #4ade80; }
.info-box {
  margin-top: 16px; padding: 12px; font-size: 11px; line-height: 1.6;
  background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2);
  border-radius: 8px; color: #a5b4fc;
}
.info-box-title { font-weight: 700; font-size: 11px; margin-bottom: 6px; color: #c7d2fe; }

/* Latency badge */
.latency-badge {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 10px; padding: 6px 10px;
  background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2);
  border-radius: 6px; font-size: 11px; color: #4ade80; font-weight: 600;
}
.latency-badge .dot-pulse {
  width: 6px; height: 6px; border-radius: 50%; background: #4ade80;
  animation: pulse 1.5s ease-in-out infinite;
}

/* ── Center Panel: Auction ── */
.auction-area { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px 0; }
.auction-header { text-align: center; margin-bottom: 16px; }
.auction-header h2 { font-size: 16px; color: #e0e0e0; font-weight: 600; }
.auction-header .bid-id { font-size: 11px; color: #555; margin-top: 4px; }
.auction-stage {
  width: 100%; max-width: 500px; min-height: 240px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}

/* ── Revenue Dashboard (Center) ── */
.revenue-dashboard {
  width: 100%; max-width: 500px; margin: 0 auto;
  padding: 14px 18px;
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px; margin-top: 12px;
}
.revenue-dashboard .rev-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;
}
.revenue-dashboard .rev-title {
  font-size: 10px; text-transform: uppercase; letter-spacing: 2px;
  color: #888; font-weight: 600;
}
.rev-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
}
.rev-cell {
  padding: 8px 10px; border-radius: 6px;
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);
  position: relative; overflow: hidden;
}
.rev-cell .rev-label { font-size: 9px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
.rev-cell .rev-value { font-size: 16px; font-weight: 700; color: #e0e0e0; transition: color 0.3s; }
.rev-cell .rev-value.green { color: #4ade80; }
.rev-cell.full-width { grid-column: 1 / -1; }

/* Revenue flash effect */
.rev-cell.flash::after {
  content: ''; position: absolute; inset: 0;
  background: rgba(74,222,128,0.12);
  animation: revFlash 0.8s ease-out forwards;
  pointer-events: none;
}
@keyframes revFlash {
  0% { opacity: 1; } 100% { opacity: 0; }
}

/* Floating revenue label */
.floating-revenue {
  position: absolute; right: 10px; top: 2px;
  font-size: 11px; font-weight: 700; color: #4ade80;
  animation: floatUp 1.2s ease-out forwards;
  pointer-events: none;
}
@keyframes floatUp {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-20px); opacity: 0; }
}

/* Progress bar */
.progress-track {
  width: 100%; height: 6px; background: rgba(255,255,255,0.06);
  border-radius: 3px; margin-top: 6px; overflow: hidden;
}
.progress-fill {
  height: 100%; border-radius: 3px;
  background: linear-gradient(90deg, #4ade80, #22d3ee);
  transition: width 0.8s ease;
}
.progress-label {
  display: flex; justify-content: space-between; margin-top: 4px;
  font-size: 9px; color: #666;
}

/* View toggle */
.view-toggle {
  display: flex; gap: 4px; background: rgba(255,255,255,0.04);
  border-radius: 6px; padding: 2px;
}
.view-toggle button {
  padding: 4px 10px; border: none; border-radius: 4px;
  font-size: 10px; font-family: inherit; cursor: pointer;
  background: transparent; color: #666; transition: all 0.2s;
}
.view-toggle button.active {
  background: rgba(255,255,255,0.08); color: #e0e0e0;
}

/* Fleet stats */
.fleet-stats {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 8px;
}
.fleet-stat {
  padding: 6px 8px; background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15);
  border-radius: 6px; text-align: center;
}
.fleet-stat .fs-val { font-size: 14px; font-weight: 700; color: #a5b4fc; }
.fleet-stat .fs-label { font-size: 8px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }

/* Revenue capture banner */
.revenue-capture {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.8);
  padding: 16px 32px; border-radius: 12px;
  background: rgba(15,15,25,0.95); border: 1px solid rgba(74,222,128,0.3);
  box-shadow: 0 0 40px rgba(74,222,128,0.15), 0 0 80px rgba(74,222,128,0.05);
  color: #4ade80; font-size: 18px; font-weight: 700;
  opacity: 0; pointer-events: none; z-index: 100;
  animation: none;
}
.revenue-capture.show {
  animation: revCapture 2s ease-out forwards;
}
@keyframes revCapture {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
  15% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
  25% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translate(-50%, -60%) scale(1); opacity: 0; }
}

/* Bid Request Pulse */
.bid-request-pulse {
  width: 80px; height: 80px; border-radius: 50%;
  background: radial-gradient(circle, rgba(251,191,36,0.3), transparent 70%);
  display: flex; align-items: center; justify-content: center;
  animation: pulseRing 0.5s ease-out;
}
.bid-request-pulse .icon { font-size: 28px; }
@keyframes pulseRing {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* Bidder Cards */
.bidders-list { width: 100%; max-width: 440px; }
.bidder-card {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; margin-bottom: 8px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px; opacity: 0; transform: translateX(-30px);
  transition: all 0.3s ease;
}
.bidder-card.visible { opacity: 1; transform: translateX(0); }
.bidder-card.winner {
  border-color: rgba(74,222,128,0.4);
  background: rgba(74,222,128,0.06);
  box-shadow: 0 0 20px rgba(74,222,128,0.1);
}
.bidder-name { font-size: 13px; font-weight: 600; }
.bidder-bid { font-size: 14px; font-weight: 700; color: #fbbf24; }
.bidder-card.winner .bidder-bid { color: #4ade80; }
.bidder-tag {
  font-size: 9px; padding: 2px 8px; border-radius: 4px;
  text-transform: uppercase; letter-spacing: 1px; font-weight: 700;
}
.bidder-tag.win { background: rgba(74,222,128,0.15); color: #4ade80; }
.bidder-tag.lose { background: rgba(255,255,255,0.05); color: #666; }

/* Mediation Checklist */
.mediation-list { width: 100%; max-width: 400px; }
.mediation-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0; font-size: 12px; color: #888;
  opacity: 0; transform: translateY(8px);
  transition: all 0.25s ease;
}
.mediation-item.visible { opacity: 1; transform: translateY(0); }
.mediation-item.pass { color: #4ade80; }
.check-icon { font-size: 14px; width: 20px; text-align: center; }

/* Winner Announcement */
.winner-announce {
  text-align: center; animation: fadeInScale 0.5s ease;
}
.winner-announce .title { font-size: 14px; color: #4ade80; font-weight: 700; margin-bottom: 6px; }
.winner-announce .detail { font-size: 12px; color: #888; }
@keyframes fadeInScale {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* ── Center Panel: Audit Log ── */
.audit-log {
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 14px 20px; max-height: 160px; overflow-y: auto;
}
.audit-log .section-title { margin-bottom: 8px; }
.log-entry {
  font-size: 10px; color: #555; padding: 3px 0;
  font-family: 'SF Mono', monospace; line-height: 1.5;
}
.log-entry span.ts { color: #444; }
.log-entry span.ev { color: #888; }
.log-entry span.revenue { color: #4ade80; font-weight: 600; }

/* ── Right Panel: AdPod Device ── */
.adpod-device {
  flex: 1; display: flex; flex-direction: column;
  border: 2px solid rgba(255,255,255,0.08);
  border-radius: 14px; overflow: hidden;
  background: linear-gradient(180deg, rgba(30,30,45,0.6) 0%, rgba(15,15,25,0.95) 100%);
  box-shadow: 0 0 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
  position: relative;
}
.adpod-device::before {
  content: ''; position: absolute; inset: -2px; border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
  z-index: -1;
}

/* Device header */
.device-header {
  padding: 12px 16px; display: flex; flex-direction: column; gap: 4px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
}
.device-header-top {
  display: flex; justify-content: space-between; align-items: center;
}
.device-id {
  font-size: 12px; font-weight: 700; color: #e0e0e0; letter-spacing: 1px;
}
.device-status {
  display: flex; align-items: center; gap: 6px;
  font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;
}
.device-status.idle { color: #666; }
.device-status.monetizing { color: #4ade80; }
.device-status .status-indicator {
  width: 6px; height: 6px; border-radius: 50%;
}
.device-status.idle .status-indicator { background: #666; }
.device-status.monetizing .status-indicator {
  background: #4ade80; box-shadow: 0 0 8px #4ade80;
  animation: pulse 1.5s ease-in-out infinite;
}
.device-meta-row {
  display: flex; gap: 16px; font-size: 10px; color: #555;
}
.device-meta-row span { display: flex; align-items: center; gap: 4px; }

/* Screen with glow */
.adpod-screen {
  flex: 1; background: #000; margin: 10px; border-radius: 8px;
  overflow: hidden; display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(255,255,255,0.04);
  position: relative; transition: box-shadow 0.6s ease;
}
.adpod-screen.glow {
  box-shadow: 0 0 20px rgba(74,222,128,0.2), 0 0 40px rgba(74,222,128,0.05);
}
.adpod-screen .media-element {
  max-width: 100%; max-height: 100%; object-fit: contain;
}
.adpod-screen .placeholder {
  color: #333; font-size: 12px; text-align: center; line-height: 1.8;
}

/* Device footer */
.device-footer {
  padding: 10px 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
}
.device-revenue-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 4px;
}
.device-revenue-row .dr-label { font-size: 10px; color: #666; }
.device-revenue-row .dr-value { font-size: 13px; font-weight: 700; color: #4ade80; }
.device-revenue-row .dr-value.last-win { color: #fbbf24; }

.adpod-brand {
  text-align: center; padding: 8px 0 4px;
  font-size: 9px; color: #444; letter-spacing: 2px; text-transform: uppercase;
}

/* Screen pulse on new ad */
@keyframes screenPulse {
  0% { box-shadow: 0 0 0 rgba(74,222,128,0); }
  50% { box-shadow: 0 0 30px rgba(74,222,128,0.3); }
  100% { box-shadow: 0 0 0 rgba(74,222,128,0); }
}

/* ── Creative Meta (below device) ── */
.creative-meta {
  margin-top: 10px; padding: 8px 12px;
  background: rgba(255,255,255,0.02); border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.04);
}
.creative-meta .label { font-size: 10px; color: #555; }
.creative-meta .value { font-size: 12px; color: #aaa; margin-bottom: 4px; }

/* ── Tooltips ── */
.tooltip-trigger {
  border-bottom: 1px dotted #555; cursor: help; position: relative;
}
.tooltip-trigger:hover::after {
  content: attr(data-tip);
  position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%);
  padding: 8px 12px; background: #1e1e2e; color: #ccc;
  font-size: 11px; border-radius: 6px; white-space: nowrap;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.4); z-index: 10;
  pointer-events: none;
}

/* ── Idle state ── */
.idle-msg {
  font-size: 12px; color: #444; text-align: center;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.4; } 50% { opacity: 1; }
}

/* ── Count-up animation helper ── */
.count-up {
  transition: color 0.3s;
}
</style>
</head>
<body>

<div class="layout">
  <!-- ══ LEFT: Robot Context ══ -->
  <div class="panel panel-left">
    <div class="section-title">Robot Context</div>

    <div class="context-block">
      <div class="label">Device State</div>
      <div class="value"><span class="status-dot online"></span>Online — <span id="left-device-state">Idle</span></div>
      <div class="label">Robot ID</div>
      <div class="value">KV10-R1-0042</div>
      <div class="label">Firmware</div>
      <div class="value">v3.1.7</div>
    </div>

    <div class="context-block">
      <div class="label">Placement</div>
      <div class="value">Chest-mounted 10" display</div>
      <div class="label">Location</div>
      <div class="value">Mall of America — Concourse B</div>
      <div class="label">Foot Traffic</div>
      <div class="value green">High (est. 1,200/hr)</div>
    </div>

    <div class="context-block">
      <div class="label">Consent &amp; Compliance</div>
      <div class="value green">&#10003; COPPA safe zone verified</div>
      <div class="value green">&#10003; No camera / no PII capture</div>
      <div class="value green">&#10003; Venue opt-in confirmed</div>
    </div>

    <div class="info-box">
      <div class="info-box-title">What does on-prem mean?</div>
      All bid mediation runs locally on the robot's edge processor. No personal data leaves the device. Advertisers bid on <em>context</em> (location, time, foot traffic) — never on identity.
      <div class="latency-badge">
        <span class="dot-pulse"></span>
        Latency: <span id="latency-value">22ms</span> (On-Prem)
      </div>
    </div>
  </div>

  <!-- ══ CENTER: Live Bidding ══ -->
  <div class="panel panel-center">
    <div class="auction-area">
      <div class="auction-header">
        <h2>R2B Auction — Live</h2>
        <div class="bid-id" id="bid-id">Waiting for bid request…</div>
      </div>
      <div class="auction-stage" id="auction-stage">
        <div class="idle-msg">Connecting to /api/edge/latest …</div>
      </div>

      <!-- Revenue Dashboard -->
      <div class="revenue-dashboard" id="revenue-dashboard">
        <div class="rev-header">
          <span class="rev-title">Live Revenue</span>
          <div class="view-toggle" id="view-toggle">
            <button class="active" data-view="robot">Robot</button>
            <button data-view="fleet">Fleet</button>
          </div>
        </div>

        <!-- Robot View -->
        <div id="robot-view">
          <div class="rev-grid">
            <div class="rev-cell" id="rev-auction">
              <div class="rev-label">This Auction</div>
              <div class="rev-value" id="rev-auction-val">$0.00</div>
            </div>
            <div class="rev-cell" id="rev-robot">
              <div class="rev-label">Robot Today</div>
              <div class="rev-value green" id="rev-robot-val">$0.00</div>
            </div>
            <div class="rev-cell" id="rev-kovio">
              <div class="rev-label">Kovio Share (50%)</div>
              <div class="rev-value" id="rev-kovio-val">$0.00</div>
            </div>
            <div class="rev-cell" id="rev-fleet-share">
              <div class="rev-label">Fleet Share (50%)</div>
              <div class="rev-value" id="rev-fleet-share-val">$0.00</div>
            </div>
            <div class="rev-cell full-width" id="rev-progress-cell">
              <div class="rev-label">Annual Target: $3,500</div>
              <div style="display:flex;align-items:baseline;gap:8px;">
                <div class="rev-value green" id="rev-annual-val" style="font-size:14px;">$0.00</div>
                <span style="font-size:10px;color:#666;" id="rev-annual-pct">(0%)</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" id="rev-progress-bar" style="width:0%"></div>
              </div>
              <div class="progress-label">
                <span>$0</span>
                <span>$3,500</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Fleet View (hidden by default) -->
        <div id="fleet-view" style="display:none;">
          <div class="fleet-stats">
            <div class="fleet-stat">
              <div class="fs-val" id="fleet-robots">200</div>
              <div class="fs-label">Robots Active</div>
            </div>
            <div class="fleet-stat">
              <div class="fs-val" id="fleet-cpm">$18.20</div>
              <div class="fs-label">Avg CPM</div>
            </div>
            <div class="fleet-stat">
              <div class="fs-val" id="fleet-total-rev">$0</div>
              <div class="fs-label">Fleet Rev Today</div>
            </div>
            <div class="fleet-stat">
              <div class="fs-val" id="fleet-auctions-min">42</div>
              <div class="fs-label">Auctions / Min</div>
            </div>
          </div>
          <div class="rev-grid" style="margin-top:8px;">
            <div class="rev-cell" id="fleet-kovio-cell">
              <div class="rev-label">Kovio Fleet Share</div>
              <div class="rev-value green" id="fleet-kovio-val">$0</div>
            </div>
            <div class="rev-cell" id="fleet-operator-cell">
              <div class="rev-label">Operator Fleet Share</div>
              <div class="rev-value" id="fleet-operator-val">$0</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="audit-log" id="audit-log">
      <div class="section-title">Transaction Log</div>
    </div>
  </div>

  <!-- ══ RIGHT: AdPod Device ══ -->
  <div class="panel panel-right">
    <div class="adpod-device">
      <div class="device-header">
        <div class="device-header-top">
          <div class="device-id">KV10-R1-0042</div>
          <div class="device-status idle" id="device-status">
            <span class="status-indicator"></span>
            <span id="device-status-text">Idle</span>
          </div>
        </div>
        <div class="device-meta-row">
          <span>&#9879; Battery: <strong style="color:#4ade80;">82%</strong></span>
          <span>&#9678; Signal: Strong</span>
          <span>&#9200; Uptime: 14h 22m</span>
        </div>
      </div>

      <div class="adpod-screen" id="robot-screen">
        <div class="placeholder">Awaiting winning creative…</div>
      </div>

      <div class="device-footer">
        <div class="device-revenue-row">
          <span class="dr-label">Revenue Today</span>
          <span class="dr-value" id="device-rev-today">$0.00</span>
        </div>
        <div class="device-revenue-row">
          <span class="dr-label">Last Win</span>
          <span class="dr-value last-win" id="device-last-win">—</span>
        </div>
      </div>

      <div class="adpod-brand">AdPod™ Powered by Kovio</div>
    </div>

    <div class="creative-meta" id="creative-meta" style="display:none;">
      <div class="label">Campaign</div>
      <div class="value" id="meta-campaign">—</div>
      <div class="label">Creative</div>
      <div class="value" id="meta-creative">—</div>
      <div class="label">Format</div>
      <div class="value" id="meta-format">—</div>
    </div>
  </div>
</div>

<!-- Revenue Capture Banner -->
<div class="revenue-capture" id="revenue-capture"></div>

<script>
// ── Revenue State ──
const FLEET_SIZE = 200;
const ANNUAL_TARGET = 3500;
const REV_SHARE = 0.50;

let currentAuctionRevenue = 0;
let robotTotalRevenue = 137.42; // Simulated accumulated today
let auctionCount = 23; // Simulated auctions today

// Derived
function kovioRevenue() { return robotTotalRevenue * REV_SHARE; }
function fleetShareRevenue() { return robotTotalRevenue * REV_SHARE; }
function fleetTotalRevenue() { return robotTotalRevenue * FLEET_SIZE; }
function annualProgress() { return Math.min((robotTotalRevenue / ANNUAL_TARGET * 365 / dayProgress()) * dayProgress(), robotTotalRevenue * (365 / dayOfYear())); }

function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}
function dayProgress() { return Math.max(1, dayOfYear()); }

// Simulated annual = robotTotalRevenue * (365 / dayOfYear) rough extrapolation
// But for demo, just use robotTotalRevenue accumulated as-is toward $3500
function annualAccumulated() { return robotTotalRevenue * 8.2; } // ~8 days of demo run

// ── State ──
let currentCampaignId = null;
let auctionRunning = false;
let currentView = 'robot';
const API_URL = window.location.origin + "/api/edge/latest";
const POLL_INTERVAL = 25000;

const FIXTURE_LOSERS = [
  { name: "DoorDash", domain: "doordash.com" },
  { name: "Uber Eats", domain: "ubereats.com" },
  { name: "Instacart", domain: "instacart.com" },
  { name: "Grubhub", domain: "grubhub.com" },
];

const MEDIATION_CHECKS = [
  { label: "Brand safety — content approved", key: "brand_safety" },
  { label: "Frequency cap — under limit", key: "freq_cap" },
  { label: "Holdout group — not excluded", key: "holdout" },
  { label: "Venue safety — environment OK", key: "venue_safety" },
];

// ── Helpers ──
function uid() { return 'br_' + Math.random().toString(36).slice(2, 10); }
function randBid(min, max) { return (Math.random() * (max - min) + min).toFixed(2); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function ts() { return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
function fmtUSD(n) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

const stage = document.getElementById("auction-stage");
const bidIdEl = document.getElementById("bid-id");
const logEl = document.getElementById("audit-log");
const screenEl = document.getElementById("robot-screen");
const metaEl = document.getElementById("creative-meta");
const revCapture = document.getElementById("revenue-capture");

function log(event) {
  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.innerHTML = '<span class="ts">' + ts() + '</span>  <span class="ev">' + event + '</span>';
  logEl.appendChild(entry);
  logEl.scrollTop = logEl.scrollHeight;
}

// ── Count-Up Animation ──
function countUp(el, start, end, duration, prefix) {
  prefix = prefix || '$';
  const startTime = performance.now();
  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * eased;
    el.textContent = prefix + current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ── Flash cell ──
function flashCell(cellId) {
  const cell = document.getElementById(cellId);
  if (!cell) return;
  cell.classList.remove('flash');
  void cell.offsetWidth; // force reflow
  cell.classList.add('flash');
}

// ── Update Revenue UI ──
function updateRevenueUI(auctionAmount) {
  const prevRobot = robotTotalRevenue - auctionAmount;

  // This Auction
  document.getElementById('rev-auction-val').textContent = fmtUSD(auctionAmount);
  flashCell('rev-auction');

  // Robot Today (count up)
  countUp(document.getElementById('rev-robot-val'), prevRobot, robotTotalRevenue, 700, '$');
  flashCell('rev-robot');

  // Kovio Share
  countUp(document.getElementById('rev-kovio-val'), prevRobot * REV_SHARE, kovioRevenue(), 700, '$');
  flashCell('rev-kovio');

  // Fleet Share
  countUp(document.getElementById('rev-fleet-share-val'), prevRobot * REV_SHARE, fleetShareRevenue(), 700, '$');
  flashCell('rev-fleet-share');

  // Annual progress
  const annualEst = annualAccumulated();
  const pct = Math.min((annualEst / ANNUAL_TARGET) * 100, 100);
  document.getElementById('rev-annual-val').textContent = fmtUSD(annualEst);
  document.getElementById('rev-annual-pct').textContent = '(' + Math.round(pct) + '%)';
  document.getElementById('rev-progress-bar').style.width = pct + '%';

  // Fleet view
  document.getElementById('fleet-total-rev').textContent = fmtUSD(fleetTotalRevenue());
  document.getElementById('fleet-kovio-val').textContent = fmtUSD(fleetTotalRevenue() * REV_SHARE);
  document.getElementById('fleet-operator-val').textContent = fmtUSD(fleetTotalRevenue() * REV_SHARE);

  // Device footer
  document.getElementById('device-rev-today').textContent = fmtUSD(robotTotalRevenue);
  document.getElementById('device-last-win').textContent = fmtUSD(auctionAmount);

  // Floating "+$X.XX" label
  const robotCell = document.getElementById('rev-robot');
  const floater = document.createElement('div');
  floater.className = 'floating-revenue';
  floater.textContent = '+' + fmtUSD(auctionAmount);
  robotCell.style.position = 'relative';
  robotCell.appendChild(floater);
  setTimeout(() => floater.remove(), 1300);
}

// ── Set device status ──
function setDeviceStatus(status) {
  const el = document.getElementById('device-status');
  const textEl = document.getElementById('device-status-text');
  const leftState = document.getElementById('left-device-state');
  el.className = 'device-status ' + status;
  textEl.textContent = status === 'monetizing' ? 'Monetizing' : 'Idle';
  leftState.textContent = status === 'monetizing' ? 'Monetizing' : 'Idle';
}

// ── Show revenue capture banner ──
function showRevCapture(amount) {
  revCapture.textContent = '+ ' + fmtUSD(amount) + ' Revenue Captured';
  revCapture.classList.remove('show');
  void revCapture.offsetWidth;
  revCapture.classList.add('show');
}

// ── Initialize revenue display ──
function initRevenueDisplay() {
  document.getElementById('rev-robot-val').textContent = fmtUSD(robotTotalRevenue);
  document.getElementById('rev-kovio-val').textContent = fmtUSD(kovioRevenue());
  document.getElementById('rev-fleet-share-val').textContent = fmtUSD(fleetShareRevenue());
  document.getElementById('device-rev-today').textContent = fmtUSD(robotTotalRevenue);
  document.getElementById('fleet-total-rev').textContent = fmtUSD(fleetTotalRevenue());
  document.getElementById('fleet-kovio-val').textContent = fmtUSD(fleetTotalRevenue() * REV_SHARE);
  document.getElementById('fleet-operator-val').textContent = fmtUSD(fleetTotalRevenue() * REV_SHARE);
  const annualEst = annualAccumulated();
  const pct = Math.min((annualEst / ANNUAL_TARGET) * 100, 100);
  document.getElementById('rev-annual-val').textContent = fmtUSD(annualEst);
  document.getElementById('rev-annual-pct').textContent = '(' + Math.round(pct) + '%)';
  document.getElementById('rev-progress-bar').style.width = pct + '%';
}

// ── View Toggle ──
document.getElementById('view-toggle').addEventListener('click', function(e) {
  const btn = e.target.closest('button');
  if (!btn) return;
  const view = btn.dataset.view;
  if (view === currentView) return;
  currentView = view;
  document.querySelectorAll('#view-toggle button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('robot-view').style.display = view === 'robot' ? 'block' : 'none';
  document.getElementById('fleet-view').style.display = view === 'fleet' ? 'block' : 'none';
});

// ── Auction Animation ──
async function runAuction(data) {
  if (auctionRunning) return;
  auctionRunning = true;

  const bidRequestId = uid();
  const winnerBid = parseFloat(randBid(4.50, 8.99));
  const winnerBidStr = winnerBid.toFixed(2);
  const campaignName = data.campaign_name || "Unknown Campaign";

  const kovioCut = (winnerBid * REV_SHARE).toFixed(2);
  const fleetCut = (winnerBid * REV_SHARE).toFixed(2);

  // Pick 2 random losers
  const shuffled = [...FIXTURE_LOSERS].sort(() => Math.random() - 0.5);
  const losers = shuffled.slice(0, 2).map(l => ({
    ...l,
    bid: randBid(1.00, winnerBid - 0.50)
  }));

  const bidders = [
    ...losers.map(l => ({ name: l.name, bid: l.bid, winner: false })),
    { name: campaignName, bid: winnerBidStr, winner: true },
  ].sort(() => Math.random() - 0.5);

  const startTime = performance.now();

  // ── Stage 1: Bid Request Sent ──
  bidIdEl.textContent = "Bid Request: " + bidRequestId;
  stage.innerHTML = '<div class="bid-request-pulse"><span class="icon">📡</span></div>';
  log("Auction triggered");
  log("Bid request <strong>" + bidRequestId + "</strong> sent — " + bidders.length + " bidders invited");
  await sleep(600);

  // ── Stage 2: Bids Appear ──
  let cardsHtml = '<div class="bidders-list">';
  bidders.forEach((b, i) => {
    cardsHtml += '<div class="bidder-card" id="bc-' + i + '">'
      + '<span class="bidder-name">' + b.name + '</span>'
      + '<span class="bidder-bid">$' + b.bid + '</span>'
      + '</div>';
  });
  cardsHtml += '</div>';
  stage.innerHTML = cardsHtml;
  log(bidders.length + " bidders responded");

  for (let i = 0; i < bidders.length; i++) {
    await sleep(300);
    const card = document.getElementById("bc-" + i);
    if (card) card.classList.add("visible");
  }
  await sleep(400);

  // ── Stage 3: Mediation Checks ──
  let medHtml = '<div class="mediation-list">';
  MEDIATION_CHECKS.forEach((m, i) => {
    medHtml += '<div class="mediation-item" id="mc-' + i + '"><span class="check-icon">—</span>' + m.label + '</div>';
  });
  medHtml += '</div>';
  stage.innerHTML = medHtml;
  log("Running mediation guardrails…");

  for (let i = 0; i < MEDIATION_CHECKS.length; i++) {
    await sleep(200);
    const item = document.getElementById("mc-" + i);
    if (item) {
      item.classList.add("visible", "pass");
      item.querySelector(".check-icon").textContent = "✓";
    }
  }
  await sleep(300);

  // ── Stage 4: Winner Selected ──
  let winHtml = '<div class="bidders-list">';
  bidders.forEach((b, i) => {
    const cls = b.winner ? "bidder-card visible winner" : "bidder-card visible";
    const tag = b.winner
      ? '<span class="bidder-tag win">WIN</span>'
      : '<span class="bidder-tag lose">—</span>';
    winHtml += '<div class="' + cls + '">'
      + '<span class="bidder-name">' + b.name + '</span>'
      + tag
      + '<span class="bidder-bid">$' + b.bid + '</span>'
      + '</div>';
  });
  winHtml += '</div>';
  stage.innerHTML = winHtml;

  const latency = Math.floor(Math.random() * 15) + 18; // 18-32ms simulated
  document.getElementById('latency-value').textContent = latency + 'ms';
  log("<strong>" + campaignName + "</strong> wins with <strong>$" + winnerBidStr + "</strong> — latency " + latency + "ms");
  await sleep(700);

  // ── Stage 5: Winner Announcement ──
  stage.innerHTML = '<div class="winner-announce">'
    + '<div class="title">✦ ' + campaignName + ' wins at $' + winnerBidStr + '</div>'
    + '<div class="detail">Rendering creative on robot display…</div>'
    + '</div>';

  // Revenue split log
  log('Revenue split → Fleet <span class="revenue">$' + fleetCut + '</span> | Kovio <span class="revenue">$' + kovioCut + '</span>');

  await sleep(800);

  // ── Update Revenue ──
  currentAuctionRevenue = winnerBid;
  robotTotalRevenue += winnerBid;
  auctionCount++;
  updateRevenueUI(winnerBid);

  // Revenue capture banner
  showRevCapture(winnerBid);

  // Update device status
  setDeviceStatus('monetizing');

  // Show idle state in auction stage
  stage.innerHTML = '<div class="idle-msg">Creative served — next auction in ' + (POLL_INTERVAL / 1000) + 's</div>';

  // ── Render creative in right panel with glow ──
  screenEl.classList.add('glow');
  renderCreative(data);
  log("Creative rendered on AdPod");

  setTimeout(() => {
    screenEl.classList.remove('glow');
  }, 3000);

  auctionRunning = false;
}

// ── Creative Renderer ──
function renderCreative(data) {
  const items = data.media || [];
  if (items.length === 0) {
    screenEl.innerHTML = '<div class="placeholder">No media assets</div>';
    metaEl.style.display = "none";
    return;
  }

  let idx = 0;

  function showItem() {
    const item = items[idx];
    // Crossfade: fade out then in
    screenEl.style.opacity = '0';
    setTimeout(() => {
      screenEl.innerHTML = "";
      if (item.media_type === "video") {
        const v = document.createElement("video");
        v.src = item.media_url; v.autoplay = true; v.muted = true; v.playsInline = true;
        v.loop = items.length === 1;
        v.className = "media-element";
        if (items.length > 1) v.addEventListener("ended", nextItem);
        screenEl.appendChild(v);
      } else {
        const img = document.createElement("img");
        img.src = item.media_url; img.className = "media-element";
        screenEl.appendChild(img);
        if (items.length > 1) setTimeout(nextItem, (item.duration_seconds || 10) * 1000);
      }
      screenEl.style.transition = 'opacity 0.4s ease';
      screenEl.style.opacity = '1';
    }, 300);

    // Update meta
    metaEl.style.display = "block";
    document.getElementById("meta-campaign").textContent = data.campaign_name || "—";
    document.getElementById("meta-creative").textContent = item.creative_name || item.media_url.split('/').pop() || "—";
    document.getElementById("meta-format").textContent = (item.media_type || "image").toUpperCase() + " — " + (item.width || "auto") + "×" + (item.height || "auto");
  }

  function nextItem() {
    idx = (idx + 1) % items.length;
    showItem();
  }

  showItem();
}

// ── Poll Loop ──
async function fetchAd() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (data.status === "no_content") {
      currentCampaignId = null;
      screenEl.innerHTML = '<div class="placeholder">No active campaigns</div>';
      metaEl.style.display = "none";
      stage.innerHTML = '<div class="idle-msg">No active campaigns — waiting…</div>';
      bidIdEl.textContent = "No active bid requests";
      setDeviceStatus('idle');
      return;
    }

    if (data.campaign_id !== currentCampaignId) {
      currentCampaignId = data.campaign_id;
      runAuction(data);
    }
  } catch (err) {
    console.error("API error:", err);
    log("Connection error — retrying in " + (POLL_INTERVAL / 1000) + "s");
  }
}

// ── Init ──
initRevenueDisplay();
setInterval(fetchAd, POLL_INTERVAL);
fetchAd();
</script>

</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
