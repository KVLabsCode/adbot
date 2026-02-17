# Edge API Spec — Raspberry Pi Integration

## Overview

The AdBot platform serves ad creatives (images and videos) to Raspberry Pi-powered AdPod devices. The Pi polls a single REST endpoint to get all active campaigns' media as a playlist. No authentication required.

---

## Base URL

```
Production:  https://adbot-nine.vercel.app/api/edge/live
Local dev:   http://localhost:3000/api/edge/live
```

---

## GET `/api/edge/live`

Returns a playlist of all active campaigns' media. One call gives the Pi everything it needs to cycle through ads.

### Request

```
GET /api/edge/live
Content-Type: not required
Authorization: not required
```

No query params, no headers, no body. Just GET.

### Response — Active Campaigns (200)

```json
{
  "playlist": [
    {
      "campaign_id": "c1a2b3c4-d5e6-7890-abcd-ef1234567890",
      "campaign_name": "Retail — Impulse Buy Booster",
      "media_type": "image",
      "mime_type": "image/png",
      "media_url": "https://qmwvwpdtvdpbhqswvvrw.supabase.co/storage/v1/object/sign/creative-assets/org/...<signed-token>",
      "duration_seconds": null
    },
    {
      "campaign_id": "a9b8c7d6-e5f4-3210-abcd-ef9876543210",
      "campaign_name": "Delivery Robots — Video Ad",
      "media_type": "video",
      "mime_type": "video/mp4",
      "media_url": "https://qmwvwpdtvdpbhqswvvrw.supabase.co/storage/v1/object/sign/creative-assets/org/...<signed-token>",
      "duration_seconds": 30
    }
  ]
}
```

### Response — No Active Campaign (200)

```json
{
  "status": "no_content"
}
```

---

## Field Reference

| Field | Type | Description |
|---|---|---|
| `playlist` | `array` | Array of media items, one per campaign/creative pair |
| `playlist[].campaign_id` | `string` (UUID) | Unique ID of the campaign |
| `playlist[].campaign_name` | `string` | Human-readable name, useful for logging |
| `playlist[].media_type` | `"image"` \| `"video"` | Determines how the Pi should render the asset |
| `playlist[].mime_type` | `string` | Exact MIME type: `image/png`, `image/jpeg`, `image/webp`, `video/mp4`, `video/webm` |
| `playlist[].media_url` | `string` (URL) | **Signed URL** to download the media file. Valid for **1 hour**. |
| `playlist[].duration_seconds` | `number` \| `null` | For videos: length in seconds. For images: `null` (display indefinitely or use your own timer). |

---

## Signed URL Behavior

- The `media_url` is a **time-limited signed URL** from Supabase Storage
- It expires **1 hour** after generation
- After expiry, the URL returns `400 Bad Request`
- The Pi must re-call `/api/edge/live` to get fresh URLs
- Each call generates new signed URLs (cheap operation, no caching concern)

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
  "no_content"     Has playlist
       │                │
       ▼                ▼
  Sleep 30s      Download all media
       │         Loop through playlist
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
| Playlist playing | Every **30 minutes** (refresh signed URLs before 1hr expiry) |
| Network error / 500 | Retry after **10 seconds**, exponential backoff up to 60s |

---

## Reference Implementation (Python)

```python
#!/usr/bin/env python3
"""
AdPod Pi Client — polls the Edge API and cycles through a playlist.
Requires: requests, Pillow (for images), vlc or omxplayer (for video)
"""

import requests
import time
import subprocess
import os
import sys

API_URL = os.environ.get("ADBOT_API_URL", "https://adbot-nine.vercel.app/api/edge/live")
MEDIA_DIR = "/tmp/adpod"
os.makedirs(MEDIA_DIR, exist_ok=True)


def fetch_playlist():
    """Fetch the current playlist from the edge API."""
    try:
        resp = requests.get(API_URL, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        if "playlist" in data:
            return data["playlist"]
        return None
    except requests.RequestException as e:
        print(f"[ERROR] API request failed: {e}")
        return None


def download_media(url, filename):
    """Download media file to local disk."""
    try:
        resp = requests.get(url, timeout=60, stream=True)
        resp.raise_for_status()
        filepath = os.path.join(MEDIA_DIR, filename)
        with open(filepath, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        return filepath
    except requests.RequestException as e:
        print(f"[ERROR] Download failed: {e}")
        return None


def display_image(filepath, duration=15):
    """Display image fullscreen using feh (install: sudo apt install feh)."""
    proc = subprocess.Popen(["feh", "--fullscreen", "--hide-pointer", filepath])
    time.sleep(duration)
    proc.terminate()


def play_video(filepath):
    """Play video using vlc (install: sudo apt install vlc)."""
    subprocess.run([
        "cvlc", "--fullscreen", "--no-osd",
        "--play-and-exit", filepath
    ])


def main():
    print(f"[INFO] AdPod Pi Client started")
    print(f"[INFO] Polling: {API_URL}")

    while True:
        playlist = fetch_playlist()

        if playlist is None:
            print("[INFO] No active campaigns or network error. Waiting...")
            time.sleep(30)
            continue

        if len(playlist) == 0:
            print("[INFO] Empty playlist. Waiting...")
            time.sleep(30)
            continue

        print(f"[INFO] Got {len(playlist)} item(s) in playlist")

        # Download and play each item in the playlist
        for i, item in enumerate(playlist):
            media_type = item["media_type"]
            mime_type = item["mime_type"]
            media_url = item["media_url"]

            print(f"[INFO] [{i+1}/{len(playlist)}] {item['campaign_name']} ({media_type})")

            # Determine file extension
            ext_map = {
                "image/png": ".png",
                "image/jpeg": ".jpg",
                "image/webp": ".webp",
                "video/mp4": ".mp4",
                "video/webm": ".webm",
            }
            ext = ext_map.get(mime_type, ".bin")
            filename = f"media_{i}{ext}"

            filepath = download_media(media_url, filename)
            if not filepath:
                continue

            if media_type == "image":
                display_image(filepath, duration=15)
            elif media_type == "video":
                play_video(filepath)
            else:
                print(f"[WARN] Unknown media type: {media_type}")

        # After cycling through all items, wait then refresh
        print("[INFO] Playlist cycle complete. Refreshing in 30 minutes...")
        time.sleep(1800)


if __name__ == "__main__":
    main()
```

### Running on the Pi

```bash
# Install dependencies
sudo apt update && sudo apt install -y python3-pip feh vlc
pip3 install requests

# Set the API URL
export ADBOT_API_URL="https://adbot-nine.vercel.app/api/edge/live"

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
Environment=ADBOT_API_URL=https://adbot-nine.vercel.app/api/edge/live
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
# Should return playlist or {"status":"no_content"}
curl -s https://adbot-nine.vercel.app/api/edge/live | python3 -m json.tool
```

### End-to-end test

1. Open the AdBot dashboard
2. Switch to **Live Mode** (sidebar toggle)
3. Go to **Creatives > Create New** — upload an image/video, save
4. Go to **Launch Campaign** — select the creative, launch
5. Call the API:
   ```bash
   curl -s https://adbot-nine.vercel.app/api/edge/live | python3 -m json.tool
   ```
6. You should get back a JSON payload with a `playlist` array containing your campaign

---

## Error Handling Summary

| Scenario | API returns | Pi should |
|---|---|---|
| No campaign active | `{"status": "no_content"}` | Retry in 30s |
| Campaigns active | `{"playlist": [...]}` | Download & cycle through, refresh in 30min |
| Network down | Connection timeout | Retry in 10s, keep displaying last media |
| Signed URL expired | `media_url` returns 400 | Re-call `/api/edge/live` for fresh URLs |
