# Edge API Spec — Raspberry Pi Integration

## Overview

The AdBot platform serves ad creatives (images and videos) to Raspberry Pi-powered AdPod devices. The Pi polls a single REST endpoint to get the currently active campaign's media. No authentication required.

---

## Base URL

```
Production:  https://<your-vercel-domain>/api/edge/live
Local dev:   http://localhost:3000/api/edge/live
```

---

## GET `/api/edge/live`

Returns the active campaign's media payload. One call gives the Pi everything it needs to display an ad.

### Request

```
GET /api/edge/live
Content-Type: not required
Authorization: not required
```

No query params, no headers, no body. Just GET.

### Response — Active Campaign (200)

```json
{
  "campaign_id": "c1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "campaign_name": "Retail — Impulse Buy Booster",
  "media_type": "image",
  "mime_type": "image/png",
  "media_url": "https://qmwvwpdtvdpbhqswvvrw.supabase.co/storage/v1/object/sign/creative-assets/org/...<signed-token>",
  "duration_seconds": null
}
```

### Response — No Active Campaign (200)

```json
{
  "status": "no_content"
}
```

### Response — Server Error (500)

```json
{
  "error": "Failed to generate signed URL"
}
```

---

## Field Reference

| Field | Type | Description |
|---|---|---|
| `campaign_id` | `string` (UUID) | Unique ID of the active campaign |
| `campaign_name` | `string` | Human-readable name, useful for logging |
| `media_type` | `"image"` \| `"video"` | Determines how the Pi should render the asset |
| `mime_type` | `string` | Exact MIME type: `image/png`, `image/jpeg`, `image/webp`, `video/mp4`, `video/webm` |
| `media_url` | `string` (URL) | **Signed URL** to download the media file. Valid for **1 hour**. |
| `duration_seconds` | `number` \| `null` | For videos: length in seconds. For images: `null` (display indefinitely or use your own timer). |

---

## Signed URL Behavior

- The `media_url` is a **time-limited signed URL** from Supabase Storage
- It expires **1 hour** after generation
- After expiry, the URL returns `400 Bad Request`
- The Pi must re-call `/api/edge/live` to get a fresh URL
- Each call generates a new signed URL (cheap operation, no caching concern)

---

## Recommended Pi Polling Strategy

```
┌─────────────────────────────────────┐
│          Boot / Start Loop          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   GET /api/edge/live                │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
  "no_content"     Has media_url
       │                │
       ▼                ▼
  Sleep 30s      Download media
       │            Display it
       │                │
       │         Sleep 30 minutes
       │                │
       └────────┬───────┘
                │
                ▼
          Loop back to GET
```

### Timing recommendations

| Scenario | Poll interval |
|---|---|
| `no_content` returned | Every **30 seconds** (waiting for a campaign to go live) |
| Active campaign playing | Every **30 minutes** (refresh signed URL before 1hr expiry) |
| Network error / 500 | Retry after **10 seconds**, exponential backoff up to 60s |

---

## Reference Implementation (Python)

```python
#!/usr/bin/env python3
"""
AdPod Pi Client — polls the Edge API and displays media.
Requires: requests, Pillow (for images), vlc or omxplayer (for video)
"""

import requests
import time
import subprocess
import os
import sys

API_URL = os.environ.get("ADBOT_API_URL", "https://YOUR_DOMAIN/api/edge/live")
MEDIA_DIR = "/tmp/adpod"
os.makedirs(MEDIA_DIR, exist_ok=True)


def fetch_campaign():
    """Fetch the current active campaign from the edge API."""
    try:
        resp = requests.get(API_URL, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as e:
        print(f"[ERROR] API request failed: {e}")
        return None


def download_media(url, filename):
    """Download media file to local disk."""
    try:
        resp = requests.get(url, timeout=30, stream=True)
        resp.raise_for_status()
        filepath = os.path.join(MEDIA_DIR, filename)
        with open(filepath, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        return filepath
    except requests.RequestException as e:
        print(f"[ERROR] Download failed: {e}")
        return None


def display_image(filepath):
    """Display image fullscreen using feh (install: sudo apt install feh)."""
    subprocess.Popen(["feh", "--fullscreen", "--hide-pointer", filepath])


def play_video(filepath):
    """Play video using vlc (install: sudo apt install vlc)."""
    subprocess.run([
        "cvlc", "--fullscreen", "--no-osd",
        "--play-and-exit", filepath
    ])


def main():
    print(f"[INFO] AdPod Pi Client started")
    print(f"[INFO] Polling: {API_URL}")

    current_campaign_id = None

    while True:
        data = fetch_campaign()

        if data is None:
            # Network error — retry quickly
            time.sleep(10)
            continue

        if data.get("status") == "no_content":
            print("[INFO] No active campaign. Waiting...")
            current_campaign_id = None
            time.sleep(30)
            continue

        campaign_id = data["campaign_id"]
        media_type = data["media_type"]
        mime_type = data["mime_type"]
        media_url = data["media_url"]
        duration = data.get("duration_seconds")

        print(f"[INFO] Campaign: {data['campaign_name']} ({campaign_id})")
        print(f"[INFO] Media: {media_type} ({mime_type})")

        # Determine file extension from MIME type
        ext_map = {
            "image/png": ".png",
            "image/jpeg": ".jpg",
            "image/webp": ".webp",
            "video/mp4": ".mp4",
            "video/webm": ".webm",
        }
        ext = ext_map.get(mime_type, ".bin")
        filename = f"current_media{ext}"

        # Download the media
        filepath = download_media(media_url, filename)
        if not filepath:
            time.sleep(10)
            continue

        # Display/play
        if media_type == "image":
            display_image(filepath)
            # Show image for 30 minutes, then refresh
            time.sleep(1800)
        elif media_type == "video":
            play_video(filepath)
            # After video ends, wait a beat then re-fetch
            time.sleep(5)
        else:
            print(f"[WARN] Unknown media type: {media_type}")
            time.sleep(30)


if __name__ == "__main__":
    main()
```

### Running on the Pi

```bash
# Install dependencies
sudo apt update && sudo apt install -y python3-pip feh vlc
pip3 install requests

# Set the API URL
export ADBOT_API_URL="https://your-domain.vercel.app/api/edge/live"

# Run
python3 adpod_client.py
```

### Auto-start on boot (systemd)

```ini
# /etc/systemd/system/adpod.service
[Unit]
Description=AdPod Display Client
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
Environment=ADBOT_API_URL=https://your-domain.vercel.app/api/edge/live
ExecStart=/usr/bin/python3 /home/pi/adpod_client.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable adpod
sudo systemctl start adpod
```

---

## Testing

### Quick test from any machine

```bash
# Should return {"status":"no_content"} if no campaign is live
curl https://your-domain.vercel.app/api/edge/live

# Pretty-printed
curl -s https://your-domain.vercel.app/api/edge/live | python3 -m json.tool
```

### End-to-end test

1. Open the AdBot dashboard
2. Switch to **Live Mode** (sidebar toggle)
3. Go to **Creatives > Create New** — upload an image/video, save
4. Go to **Launch Campaign** — select the creative, launch
5. Call the API:
   ```bash
   curl -s https://your-domain.vercel.app/api/edge/live | python3 -m json.tool
   ```
6. You should get back a JSON payload with `media_url` pointing to the uploaded asset

### Verify the signed URL works

```bash
# Download the media file
curl -o test_media.png "$(curl -s https://your-domain.vercel.app/api/edge/live | python3 -c 'import sys,json; print(json.load(sys.stdin).get("media_url",""))')"
```

---

## Error Handling Summary

| Scenario | API returns | Pi should |
|---|---|---|
| No campaign active | `{"status": "no_content"}` | Retry in 30s |
| Campaign active | Full payload with `media_url` | Download & display, refresh in 30min |
| Server error | `500` with `{"error": "..."}` | Retry in 10s with backoff |
| Signed URL expired | `media_url` returns 400 | Re-call `/api/edge/live` for fresh URL |
| Network down | Connection timeout | Retry in 10s, keep displaying last media |
