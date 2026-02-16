# Design: Client-Side Direct Upload via Signed URLs

## Problem

Video uploads (17-100MB+) fail through the current server-proxy architecture. Three chokepoints:

1. **Next.js API route** buffers the entire file in memory (`Buffer.from(await file.arrayBuffer())`)
2. **Supabase JS `.upload()`** sends a single HTTP request — large files cause `EPIPE` / connection drops
3. **Vercel Hobby plan** has a hard 4.5MB request body limit on serverless functions

Images work because they're small enough to survive all three bottlenecks. Videos don't.

## Solution

Upload directly from the browser to Supabase Storage using a **signed upload URL**. The file never touches the Next.js server.

```
Browser  --[1. POST /api/upload/sign]-->  API Route (JSON only, no file)
Browser  <--[2. { signedUrl, path }]----  API Route
Browser  --[3. PUT raw file]----------->  Supabase Storage (direct)
Browser  <--[4. 200 OK]----------------  Supabase Storage
```

## Changes

### New: `src/app/api/upload/sign/route.ts`

- Accepts JSON body: `{ orgId, fileName, contentType }`
- Validates content type against allowlist (PNG, JPEG, WebP, MP4, WebM)
- Generates path: `org/{orgId}/{timestamp}-{fileName}`
- Calls `supabase.storage.from('creative-assets').createSignedUploadUrl(path)`
- Returns `{ signedUrl, path, token }`
- Signed URL valid for 2 minutes

### Modify: `src/components/creative/CreateNewFlow.tsx`

- Replace single `fetch('/api/upload')` with two-step flow:
  1. `POST /api/upload/sign` with file metadata (tiny JSON request)
  2. `PUT` raw file bytes to the signed URL using `XMLHttpRequest` for upload progress
- Add progress bar UI during upload
- Client-side file type validation before requesting signed URL

### Modify: Supabase bucket `creative-assets`

- Increase `file_size_limit` from 25MB to 500MB

### Keep: `src/app/api/upload/route.ts`

- Remove or keep as unused fallback. No longer the primary upload path.

## Security

- Signed upload URLs bypass RLS — generated server-side with service role key
- URLs are time-limited (2 min expiry)
- Client never sees the service role key
- File type validated both client-side and in the signed URL path

## Trade-offs

| | Signed URL (chosen) | Server proxy (current) | TUS resumable |
|---|---|---|---|
| Max file size | 5GB (Supabase limit) | 4.5MB on Vercel | 5GB |
| Server memory | Zero (no file transit) | Full file buffered | Zero |
| Complexity | Low | Lowest | High |
| Upload progress | Yes (XHR) | No | Yes |
| Resume on failure | No | No | Yes |
| Works on Vercel Hobby | Yes | No (>4.5MB) | Yes |
