# Security notes (v0.5.8)

What the server now does by itself:
- **Real IP**: uses `CF-Connecting-IP` when `CF=1`, otherwise the Nth-from-last `X-Forwarded-For` entry (`PROXY_HOPS`, default 1 for Caddy). Spoofed leading entries are ignored, so IP limits cannot be dodged with a fake header.
- **Signup**: username filter (no admin/root/mod lookalikes, no all-digits), global cap `SIGNUPS_PER_HOUR`, one account per IP (`IP_LIMIT`), optional Turnstile captcha (`TURNSTILE_SITEKEY` + `TURNSTILE_SECRET`).
- **Login**: 12 tries/min per IP, plus per-username lockout (5 free fails, then 2,4,8... seconds up to 15 min, even with the right password).
- **Everything under /api**: 240 requests/min per IP. Saves: 20/min per account.
- **WebSocket**: max 6 sockets per IP, 30 connects/min per IP, 40 msgs/s (burst 80) per connection, flooders are disconnected.
- **DB**: never-played accounts older than 7 days and claimed mail older than 30 days are cleaned every 6 h.
- **Logs**: every blocked action prints `SECURITY <reason> ip=<ip>` (reasons: login-fail, lockout, api-rate, save-rate, ws-conn, ws-flood, signup-cap, captcha-fail). Feed these to fail2ban (see SERVER_HARDENING.md).

Still on the plan: full anti-cheat with the server-owned economy (v0.6.0 / v0.6.1).

## Server authority (v0.6.0)
- Login/register travel over HTTPS (Caddy). The password is only readable inside the player's own browser devtools, never on the network; it is stored as a salted scrypt hash. HSTS is sent so browsers refuse plain http.
- Saves are validated and corrected by the server (see CHANGELOG 0.6.0). The client is a display of server-approved numbers: tampering with xp/gold/items in the browser is clamped or stripped at the next save.
- Not yet server-computed (next steps, v0.6.2+): kills/gathering/crafting grant xp, gold and loot on the server itself, so the client only sends actions.
