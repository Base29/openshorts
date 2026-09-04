"""Operational email alerts for the admin (proxy out of credits, high failure rate).

Tracks recent managed-job outcomes in memory and emails ADMIN_EMAIL (via Resend)
when something looks broken, with a per-alert cooldown so it never spams.
"""
import time
from collections import deque

from .config import settings
from .emails import send_email

_recent = deque(maxlen=12)          # rolling window of recent job outcomes (ok bool)
_last_alert = {}                    # alert kind -> last-sent epoch
_ALERT_COOLDOWN = 3600              # 1 hour between repeats of the same alert
_FAIL_WINDOW_MIN = 6               # need at least this many recent jobs to judge a rate
_FAIL_THRESHOLD = 5                # ...and this many failures among them

# Specific signatures of a genuine proxy / download-stage failure. Kept precise
# on purpose: a bare "proxy"/"credit"/"balance" match fired on any job whose logs
# merely echoed the proxy URL (yt-dlp debug) or whose video title contained one of
# those words, producing false "out of credits" alerts for jobs that actually
# failed later in processing. These phrases only appear in real proxy failures.
_PROXY_HINTS = (
    "proxyerror",
    "cannot connect to proxy",
    "failed to connect to proxy",
    "unable to connect to proxy",
    "proxy authentication required",
    "407 proxy",
    "http error 407",
    "tunnel connection failed",
    "402 payment required",
    "out of credits",
    "insufficient balance",
)


def _looks_like_proxy_error(err: str) -> bool:
    e = (err or "").lower()
    return any(k in e for k in _PROXY_HINTS)


def _classify_failure(err: str) -> str:
    """One-word category for the last error, so the alert points the right way."""
    e = (err or "").lower()
    if _looks_like_proxy_error(e):
        return "proxy"
    if "no_audio" in e or "no audio" in e:
        return "no audio"
    if "sign in to confirm" in e or "not a bot" in e or "http error 403" in e \
            or "http error 429" in e or "video unavailable" in e or "read timed out" in e:
        return "youtube download"
    if "whisper" in e or "faster_whisper" in e or "transcrib" in e or "av/container" in e:
        return "transcription"
    # User content rejected by the AI provider's policy filter — deterministic,
    # not actionable on our side. Named so the alert doesn't read as an outage.
    if "prohibited_content" in e or "blocked this video" in e or "blocked its answer" in e:
        return "blocked content (user video)"
    if "gemini" in e or "google.genai" in e:
        return "gemini"
    if "ffmpeg" in e or "reframe" in e:
        return "ffmpeg/render"
    return "mixed"


def _cooldown_ok(kind: str) -> bool:
    now = time.time()
    if now - _last_alert.get(kind, 0) < _ALERT_COOLDOWN:
        return False
    _last_alert[kind] = now
    return True


# Prefix on every Shortify Agent Telegram message. The chat is shared with other
# internal bots; the prefix is what separates ours from noise.
TELEGRAM_PREFIX = "SHORTIFY AGENT ✂️ - "


async def send_telegram(text: str) -> bool:
    """Post Markdown-ish text to the admin Telegram chat; no-op when unset."""
    token = settings.telegram_bot_token
    chat_id = settings.telegram_chat_id
    if not token or not chat_id:
        return False
    msg = f"{TELEGRAM_PREFIX}{text}"
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": msg}
    import httpx
    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.post(url, json=payload)
        return res.is_success


async def send_email_alert(subject: str, html: str) -> bool:
    """Send an alert email to ADMIN_EMAIL; no-op when unset."""
    to = settings.admin_email
    if not to:
        return False
    await send_email(to, f"[Shortify Agent] {subject}", html)
    return True


async def send_admin_alert(subject: str, body: str):
    """Notify the admin via every configured channel (email + Telegram)."""
    # Telegram first — instant, and configured independently of email.
    await send_telegram(f"{subject}\n\n{body}")

    to = settings.admin_email
    if not to or not settings.smtp_configured:
        if not settings.telegram_configured:
            print(f"⚠️  [ADMIN ALERT] {subject}\n{body[:500]}"
                  + ("" if to else "  (set ADMIN_EMAIL + SMTP_* or TELEGRAM_* to receive these)"))
        return
    html = f"<pre style='font:13px/1.5 monospace;white-space:pre-wrap'>{body}</pre>"
    await send_email(to, f"[Shortify Agent] {subject}", html)


async def record_job_outcome(ok: bool, error_text: str = ""):
    """Record a managed job's result and fire an alert if the picture looks bad."""
    _recent.append(bool(ok))
    if ok:
        return

    # 1) Proxy / credits problem — most urgent, alert immediately.
    if _looks_like_proxy_error(error_text) and _cooldown_ok("proxy"):
        await send_admin_alert(
            "⚠️ Proxy error — may be out of credits",
            "A managed job failed with a proxy-related error. Check your proxy "
            "balance — downloads will keep failing until it's topped up.\n\n"
            f"Error:\n{error_text[:1200]}",
        )
        return

    # 2) High failure rate — report it honestly and classify the last error
    # instead of always blaming the download path (it's often transcription of
    # a silent upload, a bad video, etc.).
    recent = list(_recent)
    fails = recent.count(False)
    if len(recent) >= _FAIL_WINDOW_MIN and fails >= _FAIL_THRESHOLD and _cooldown_ok("failrate"):
        await send_admin_alert(
            f"⚠️ High job failure rate ({_classify_failure(error_text)})",
            f"{fails} of the last {len(recent)} managed jobs failed.\n\n"
            f"Last error:\n{error_text[:1200]}",
        )
