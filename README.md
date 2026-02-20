# refreshly-site

Static marketing site for Refreshly.

## Local testing (Windows)

1. Open PowerShell.
2. Run:

```powershell
cd "D:\Application Development\refreshly-site"
py -m http.server 4173
```

3. Open `http://localhost:4173`.
4. Stop the server with `Ctrl + C`.

If `py` is not available, use:

```powershell
python -m http.server 4173
```

## Structure

- `index.html`: main marketing/landing page
- `privacy.html`: privacy policy
- `terms.html`: terms of service
- `support.html`: support page
- `assets/css/site.css`: shared site styles
- `assets/js/site.js`: shared interactions (scroll reveals + year)
- `assets/images/branding`: icon and feature graphic
- `assets/images/screenshots`: app screenshots
