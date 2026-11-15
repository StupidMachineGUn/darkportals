# Linux server hardening (SSH keys, no passwords)

1164 failed logins = normal internet bots guessing passwords. Fix: keys only, no passwords, ban repeat offenders.
**Rule #1: keep your current SSH session open until the new login is tested in a second window.**

## 1. Make a key (on YOUR computer or phone app, not the server)
    ssh-keygen -t ed25519 -C "darkportals-admin"
Use a passphrase. Keep the private key (`~/.ssh/id_ed25519`) secret; back it up (password manager). Never send it to anyone, including me.

## 2. Install the public key on the server
    ssh-copy-id -i ~/.ssh/id_ed25519.pub USER@SERVER_IP
(or paste the `.pub` line into `~/.ssh/authorized_keys` on the server, then `chmod 700 ~/.ssh; chmod 600 ~/.ssh/authorized_keys`).
TEST in a NEW window: `ssh -i ~/.ssh/id_ed25519 USER@SERVER_IP` must log in without the account password.

## 3. Disable password logins
Create `/etc/ssh/sshd_config.d/99-hardening.conf`:

    PasswordAuthentication no
    KbdInteractiveAuthentication no
    PubkeyAuthentication yes
    PermitRootLogin no
    MaxAuthTries 3
    LoginGraceTime 20
    X11Forwarding no
    AllowUsers YOUR_USER

Check and reload (keep old session open!):

    sudo sshd -t && sudo systemctl reload ssh
Test a NEW login. Check `sudo sshd -T | grep -i passwordauth` says `no`. (Some distros ship a cloud-init file that re-enables passwords: `grep -ri PasswordAuthentication /etc/ssh/`.)

## 4. Firewall (allow only what you need)
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow 22/tcp        # or your SSH port / your home IP only: ufw allow from YOUR_IP to any port 22
    sudo ufw allow 80,443/tcp    # web (game)
    sudo ufw enable
Do NOT open 5432 (Postgres) or the Node port to the internet. Note: Docker bypasses ufw for published ports, so in `docker-compose.yml` publish the DB and app only to localhost (`127.0.0.1:8080:8080`) and let nginx/Caddy/Cloudflare tunnel face the world, or have no `ports:` for `db`.

## 5. Ban the bots: fail2ban
    sudo apt install fail2ban
    printf '[sshd]\nenabled=true\nmaxretry=3\nfindtime=10m\nbantime=1d\n' | sudo tee /etc/fail2ban/jail.d/sshd.local
    sudo systemctl restart fail2ban; sudo fail2ban-client status sshd
(Optional: `bantime.increment = true` for longer repeat bans.) After keys-only, failed attempts are harmless noise, but fail2ban quiets the logs.

## 6. Extra hardening
- Optional: move SSH to a high port (reduces noise only, not real security) or put SSH behind Tailscale/WireGuard so port 22 is not public at all (best option).
- Automatic security updates: `sudo apt install unattended-upgrades && sudo dpkg-reconfigure -plow unattended-upgrades`.
- Use a normal sudo user, not root; `sudo passwd -l root` once sudo user works.
- 2FA for SSH (optional): `libpam-google-authenticator` on top of the key.
- Secrets: `.env` with `chmod 600`, never in git; strong random `ADMINS`/DB password; rotate if ever exposed.
- Backups: nightly `pg_dump` to another machine or object storage; test a restore monthly.
- Monitoring: `sudo apt install logwatch` or a simple uptime check; look at `lastb | head` and `last` weekly.
- Check who is logged in / keys: `last`, `cat ~/.ssh/authorized_keys` (remove unknown keys).
- If the box was ever reachable with a weak password, assume it could be compromised: check `last`, `ps aux`, cron (`crontab -l`, `/etc/cron*`), unknown users in `/etc/passwd`, and consider rebuilding from a clean image.
- Cloud provider: enable provider firewall/security group too (second layer), and snapshots.
