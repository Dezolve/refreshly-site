# Local runbook (Windows / PowerShell)

## One-time setup

Open PowerShell and go to the repo:

```powershell
cd "D:\Application Development\refreshly-site"
```

## Start the local preview server

Use the helper script instead of calling `http.server` directly:

```powershell
.\scripts\Start-LocalServer.ps1
```

If PowerShell blocks local scripts on your machine, use:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Start-LocalServer.ps1
```

Default port: `4180`

What it does:

- Stops stale `python -m http.server` processes already using that port.
- Starts a fresh server bound to `0.0.0.0` for both desktop and phone testing.
- Prints the desktop URL, phone URL, and a direct CSS test URL.

Example output URLs:

- Desktop: `http://localhost:4180`
- Phone: `http://192.168.x.x:4180`
- CSS check: `http://localhost:4180/assets/css/site.css`

## Use a different port

```powershell
.\scripts\Start-LocalServer.ps1 -Port 4173
```

## Stop the local preview server

```powershell
.\scripts\Stop-LocalServer.ps1
```

If needed:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Stop-LocalServer.ps1
```

Or for a specific port:

```powershell
.\scripts\Stop-LocalServer.ps1 -Port 4173
```

## Verify the server is healthy

This checks both the homepage and the shared stylesheet:

```powershell
.\scripts\Test-LocalServer.ps1
```

If needed:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Test-LocalServer.ps1
```

Or for a specific port:

```powershell
.\scripts\Test-LocalServer.ps1 -Port 4173
```

## Standard deploy step for CSS or JS changes

Before pushing any CSS or JS update, bump the shared asset version:

```powershell
.\scripts\Update-AssetVersion.ps1
```

If PowerShell blocks local scripts:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Update-AssetVersion.ps1
```

What it does:

- Updates the `?v=...` cache-busting token for `site.css` and `site.js`
- Applies the same version to `index.html`, `privacy.html`, `support.html`, and `terms.html`
- Uses a timestamp by default so every deploy gets a fresh asset URL

Optional explicit version:

```powershell
.\scripts\Update-AssetVersion.ps1 -Version 20260312-090000
```

Recommended release flow:

```powershell
.\scripts\Update-AssetVersion.ps1
git add assets/css/site.css assets/js/site.js index.html privacy.html support.html terms.html
git commit -m "Publish mobile layout updates"
git push
```

## Desktop testing

Open:

```text
http://localhost:4180
```

If you used another port, replace `4180`.

## Phone testing

1. Make sure the phone and PC are on the same network.
2. Start the local server with `.\scripts\Start-LocalServer.ps1`.
3. Copy the printed `Phone URL` into the phone browser.
4. If the page loads without styling, open the printed CSS URL on the phone.

Expected result:

- If the CSS URL shows raw CSS text, the server is fine and the phone likely has a cache issue.
- If the CSS URL does not load, the issue is usually firewall, VPN, or using the wrong LAN IP.

## Common fixes

If `localhost` says `ERR_EMPTY_RESPONSE`:

```powershell
.\scripts\Stop-LocalServer.ps1 -Port 4180
.\scripts\Start-LocalServer.ps1 -Port 4180
.\scripts\Test-LocalServer.ps1 -Port 4180
```

If the phone cannot load the page:

- Confirm the phone is using the same Wi-Fi or LAN as the PC.
- Disable VPN on both devices.
- Make sure Windows Firewall is not blocking Python.
- Use a private/incognito tab on the phone to avoid stale cached CSS.

## Fallback without scripts

If needed, the raw command is still:

```powershell
python -m http.server 4180 --bind 0.0.0.0
```
