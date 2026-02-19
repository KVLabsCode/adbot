export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AdPod Display</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  height: 100%; overflow: hidden;
  background: #000; color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
body {
  display: flex; align-items: center; justify-content: center;
}

/* Fullscreen media */
.media-element {
  width: 100vw; height: 100vh;
  object-fit: contain;
  display: block;
}

/* Idle state */
.idle {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 100vh; width: 100vw;
  gap: 16px;
}
.idle .pulse-ring {
  width: 48px; height: 48px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.15);
  animation: pulse 2s ease-in-out infinite;
}
.idle .label {
  font-size: 14px; color: rgba(255,255,255,0.3);
  letter-spacing: 2px; text-transform: uppercase;
}
@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
}

/* Fade transition */
#screen {
  transition: opacity 0.4s ease;
}
</style>
</head>
<body>

<div id="screen">
  <div class="idle">
    <div class="pulse-ring"></div>
    <div class="label">AdPod Ready</div>
  </div>
</div>

<script>
const API_URL = window.location.origin + "/api/edge/latest";
const POLL_INTERVAL = 10000;
const screen = document.getElementById("screen");

let currentCampaignId = null;
let rotationTimer = null;

function renderMedia(data) {
  const items = data.media || [];
  if (items.length === 0) {
    showIdle();
    return;
  }

  let idx = 0;

  function showItem() {
    const item = items[idx];
    screen.style.opacity = "0";
    setTimeout(() => {
      screen.innerHTML = "";
      if (item.media_type === "video") {
        const v = document.createElement("video");
        v.src = item.media_url;
        v.autoplay = true;
        v.muted = true;
        v.playsInline = true;
        v.loop = items.length === 1;
        v.className = "media-element";
        if (items.length > 1) v.addEventListener("ended", nextItem);
        screen.appendChild(v);
      } else {
        const img = document.createElement("img");
        img.src = item.media_url;
        img.className = "media-element";
        screen.appendChild(img);
        if (items.length > 1) {
          rotationTimer = setTimeout(nextItem, (item.duration_seconds || 10) * 1000);
        }
      }
      screen.style.opacity = "1";
    }, 400);
  }

  function nextItem() {
    if (rotationTimer) clearTimeout(rotationTimer);
    idx = (idx + 1) % items.length;
    showItem();
  }

  showItem();
}

function showIdle() {
  screen.innerHTML = '<div class="idle"><div class="pulse-ring"></div><div class="label">AdPod Ready</div></div>';
}

async function poll() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (data.status === "no_content") {
      currentCampaignId = null;
      showIdle();
      return;
    }

    if (data.campaign_id !== currentCampaignId) {
      currentCampaignId = data.campaign_id;
      renderMedia(data);
    }
  } catch (err) {
    console.error("Poll error:", err);
  }
}

setInterval(poll, POLL_INTERVAL);
poll();
</script>

</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
