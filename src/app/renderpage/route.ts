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

/* ── Center Panel: Auction ── */
.auction-area { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px 0; }
.auction-header { text-align: center; margin-bottom: 20px; }
.auction-header h2 { font-size: 16px; color: #e0e0e0; font-weight: 600; }
.auction-header .bid-id { font-size: 11px; color: #555; margin-top: 4px; }
.auction-stage {
  width: 100%; max-width: 500px; min-height: 260px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
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
  padding: 14px 20px; max-height: 140px; overflow-y: auto;
}
.audit-log .section-title { margin-bottom: 8px; }
.log-entry {
  font-size: 10px; color: #555; padding: 3px 0;
  font-family: 'SF Mono', monospace; line-height: 1.5;
}
.log-entry span.ts { color: #444; }
.log-entry span.ev { color: #888; }

/* ── Right Panel: Robot Display ── */
.robot-frame-header {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 14px;
}
.robot-frame-header .dots { display: flex; gap: 5px; }
.robot-frame-header .dot {
  width: 10px; height: 10px; border-radius: 50%;
}
.dot.r { background: #ff5f57; } .dot.y { background: #ffbd2e; } .dot.g { background: #28c840; }
.robot-frame-header .title { font-size: 11px; color: #666; flex: 1; text-align: center; }

.robot-screen {
  flex: 1; background: #000; border-radius: 10px; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(255,255,255,0.06);
  position: relative;
}
.robot-screen .media-element {
  max-width: 100%; max-height: 100%; object-fit: contain;
}
.robot-screen .placeholder {
  color: #333; font-size: 12px; text-align: center; line-height: 1.8;
}
.creative-meta {
  margin-top: 12px; padding: 10px;
  background: rgba(255,255,255,0.02); border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.04);
}
.creative-meta .label { font-size: 10px; color: #555; }
.creative-meta .value { font-size: 12px; color: #aaa; margin-bottom: 6px; }

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
</style>
</head>
<body>

<div class="layout">
  <!-- ══ LEFT: Robot Context ══ -->
  <div class="panel panel-left">
    <div class="section-title">Robot Context</div>

    <div class="context-block">
      <div class="label">Device State</div>
      <div class="value"><span class="status-dot online"></span>Online — Idle</div>
      <div class="label">Robot ID</div>
      <div class="value">KVIO-R1-0042</div>
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
    </div>
    <div class="audit-log" id="audit-log">
      <div class="section-title">Audit Log</div>
    </div>
  </div>

  <!-- ══ RIGHT: Robot Display Output ══ -->
  <div class="panel panel-right">
    <div class="robot-frame-header">
      <div class="dots"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div></div>
      <div class="title">KVIO-R1-0042 — Display Output</div>
    </div>
    <div class="robot-screen" id="robot-screen">
      <div class="placeholder">Awaiting winning creative…</div>
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

<script>
// ── State ──
let currentCampaignId = null;
let auctionRunning = false;
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

const stage = document.getElementById("auction-stage");
const bidIdEl = document.getElementById("bid-id");
const logEl = document.getElementById("audit-log");
const screenEl = document.getElementById("robot-screen");
const metaEl = document.getElementById("creative-meta");

function log(event) {
  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.innerHTML = '<span class="ts">' + ts() + '</span>  <span class="ev">' + event + '</span>';
  logEl.appendChild(entry);
  logEl.scrollTop = logEl.scrollHeight;
}

// ── Auction Animation ──
async function runAuction(data) {
  if (auctionRunning) return;
  auctionRunning = true;

  const bidRequestId = uid();
  const winnerBid = randBid(4.50, 8.99);
  const campaignName = data.campaign_name || "Unknown Campaign";

  // Pick 2 random losers
  const shuffled = [...FIXTURE_LOSERS].sort(() => Math.random() - 0.5);
  const losers = shuffled.slice(0, 2).map(l => ({
    ...l,
    bid: randBid(1.00, parseFloat(winnerBid) - 0.50)
  }));

  const bidders = [
    ...losers.map(l => ({ name: l.name, bid: l.bid, winner: false })),
    { name: campaignName, bid: winnerBid, winner: true },
  ].sort(() => Math.random() - 0.5);

  const startTime = performance.now();

  // ── Stage 1: Bid Request Sent ──
  bidIdEl.textContent = "Bid Request: " + bidRequestId;
  stage.innerHTML = '<div class="bid-request-pulse"><span class="icon">📡</span></div>';
  log("Bid request <strong>" + bidRequestId + "</strong> sent — 3 bidders invited");
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
  log("Receiving bids…");

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

  const latency = Math.round(performance.now() - startTime);
  log("<strong>" + campaignName + "</strong> wins with <strong>$" + winnerBid + "</strong> — latency " + latency + "ms");
  await sleep(700);

  // ── Stage 5: Winner Announcement ──
  stage.innerHTML = '<div class="winner-announce">'
    + '<div class="title">✦ ' + campaignName + ' wins at $' + winnerBid + '</div>'
    + '<div class="detail">Rendering creative on robot display…</div>'
    + '</div>';
  await sleep(800);

  // Show idle state in auction stage
  stage.innerHTML = '<div class="idle-msg">Creative served — next auction in ' + (POLL_INTERVAL / 1000) + 's</div>';

  // ── Render creative in right panel ──
  renderCreative(data);
  log("Creative rendered on display");

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

setInterval(fetchAd, POLL_INTERVAL);
fetchAd();
</script>

</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
