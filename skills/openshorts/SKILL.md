---
name: shortify-agent
version: 1.0.0
description: Turn long videos (podcasts, webinars, streams) into vertical 9:16 clips with subtitles and publish them to TikTok, Instagram Reels and YouTube Shorts via the Shortify Agent API or MCP server. Use when the user wants to clip a video into shorts, restyle captions on a clip, schedule or post clips to social platforms, or automate a clipping pipeline.
homepage: https://www.shortifyagent.app/mcp
metadata:
  openclaw:
    emoji: "🎬"
    primaryEnv: SHORTIFY_API_KEY
  hermes:
    category: media
    tags: [video, clips, shorts, social-media, publishing, automation]
---

# Shortify Agent: clip and publish video

Shortify Agent turns a long video into 3-15 vertical clips (15-60s each) with
word-level subtitles burned in, then optionally publishes them. One job takes
minutes, not seconds: always work async (submit, then webhook or poll).

## Connect

Two equivalent surfaces; prefer MCP when the client supports it:

- **MCP** (streamable HTTP): `/mcp` with header
  `Authorization: Bearer sak_...`. Six tools: `process_video`,
  `get_job_status`, `list_clips`, `get_quota`, `add_subtitles`, `publish_clip`.
- **REST**: same key against the API (OpenAPI at `/openapi.json`, docs at `/docs`).

Keys are created in the account page and start with `sak_` (or `osk_`).
**Self-hosted instances expose the same endpoints on `http://localhost:8000`
with no key.** If a call returns 401/404 on `/api/me`, assume self-host or
anonymous: there is no minute quota to enforce.

## The core loop

1. `get_quota` first when the job is large: `process_video` fails with
   `quota_exceeded` if minutes run out on cloud mode.
2. Submit: `POST /api/process` with JSON
   `{"url": "...", "acknowledged": true}`. Optional: `layouts`
   (`"auto,split,screencast"`), `output_format` (`"1080p"`), `webhook_url` +
   `webhook_secret`. Returns `{"job_id": ...}` immediately.
3. Finish: **webhooks beat polling.** With `webhook_url` set, Shortify Agent POSTs
   exactly once when the job ends (completed OR failed, so pipelines never
   hang): `{"event": "job.completed", "job_id", "status", "clips": [{"index",
   "title", "video_url", "download_url"}]}`. If a secret was set, verify
   `X-Shortify-Signature: sha256=<hex>` = HMAC-SHA256 of the raw body.
   Without a webhook, poll `GET /api/status/{job_id}` every ~10s; response is
   `{"status", "logs", "result"}` and `result.clips` appears on completion.
4. Publish: `POST /api/social/post` with `{"job_id", "clip_index",
   "platforms": ["tiktok", "instagram", "youtube"]}`, optional `title`,
   `scheduled_date` (ISO) + `timezone`. Restyle captions first if asked:
   `POST /api/subtitle` with `{"job_id", "clip_index", "style"}` (`classic`
   or karaoke word highlighting).

## Rules

- Only submit videos the user has rights to; `process_video` requires the
  `confirm_rights` acknowledgement and that is deliberate.
- `download_url` links are presigned for 24h: fetch or forward them promptly.
- Self-hosted Shortify Agent is 100% free and MIT-licensed with no watermark or limits.

## CLI shortcut

When shell access is easier than HTTP: `uvx shortify process <url> --wait`,
`shortify clips <job_id>`, `shortify publish <job_id> 0 --platforms
tiktok`. Auth via `SHORTIFY_API_KEY` / `SHORTIFY_API_URL` env vars.
