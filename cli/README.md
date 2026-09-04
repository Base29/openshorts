# Shortify Agent CLI

Clip long videos into vertical 9:16 shorts from the terminal. Zero
dependencies; talks to the same API the dashboard, the MCP server and the
webhooks use.

```bash
pip install shortify        # or: uvx shortify / pipx run shortify

export SHORTIFY_API_KEY=sak_...   # from your account page

shortify process "https://youtube.com/watch?v=..." --wait
shortify clips <job_id>
shortify publish <job_id> 0 --platforms tiktok,youtube
shortify quota
```

Self-hosted instance? Point it at your own machine and skip the key:

```bash
export SHORTIFY_API_URL=http://localhost:8000
shortify process "https://youtube.com/watch?v=..." --wait
```

For pipelines, prefer the webhook to `--wait`: pass `--webhook` and
`--webhook-secret` and Shortify Agent POSTs once (HMAC-signed,
`X-Shortify-Signature: sha256=<hex>`) when the job ends, with clip titles
and durable download links.

The self-hosted edition is MIT-licensed and 100% free with no meter. Agent-native
version of the same surface at `/mcp`.
