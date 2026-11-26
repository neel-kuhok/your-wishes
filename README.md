# Your wishes — birthday surprise maker

Plain HTML/CSS/JS (no build step, no paid services). Bengali + English.
MADE WITH ♡ BY Misbah — Developer.

```
your-wishes/
├─ index.html
├─ css/style.css
├─ js/config.js   ← Supabase keys + developer info (edit this)
├─ js/app.js
└─ README.md
```

## What works where

| Feature | Local / Termux | GitHub Pages only | + Supabase |
|---|---|---|---|
| Create form, preview, Edit Card, JSON download | ✅ | ✅ | ✅ |
| Gift box, cake, candles, balloons, letter, final message | ✅ | ✅ | ✅ |
| Photos, voice, music in preview | ✅ | ✅ | ✅ |
| Share link opens on another phone | ❌ | ⚠️ text only (no photos / voice / uploaded music) | ✅ full card |
| Music via URL | ✅ | ✅ | ✅ |
| Voice recording | ✅ (localhost) | ✅ (HTTPS) | ✅ |

Without a backend the link stores the card text inside the URL (`#d=...`). Photos, voice and uploaded music are too big for that, so they are left out. GitHub Pages is static hosting: it has no database or private storage.

## Download Information
Downloads a JSON file with all text, settings, and the photos/voice/music **embedded as base64**. The PIN itself is not exported.

## Secret PIN — security limits
The PIN is stored as a salted SHA-256 hash and checked **in the browser**. Anyone who opens the card data (the link, or the Supabase row) can read the content directly or brute-force a short PIN. Treat it as a polite lock, not real security. Use a 6+ character PIN, share it separately from the link, and don't put anything highly sensitive in a card. Real protection would need server-side verification (e.g. a Supabase Edge Function that only returns the card after checking the PIN), which is not included.

## Supabase setup (free)
1. Create an account at supabase.com → **New project**.
2. **SQL Editor** → run:
```sql
create table cards (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);
alter table cards enable row level security;
create policy "anyone can read cards"   on cards for select using (true);
create policy "anyone can create cards" on cards for insert with check (true);
```
(No update/delete policy, so cards can't be changed or removed through the public key.)
3. **Project Settings → API**: copy the **Project URL** and the **anon public** key into `js/config.js`.
4. Never use the `service_role` key in this project. The anon key is meant to be public; the policies above limit what it can do.
5. Photos (compressed to ~900px) and audio are stored inside the JSON row, so no Storage bucket is needed. Limits: voice ≤ 1.5 MB, music ≤ 2 MB. Keep the card total under a few MB.

## Deploy to GitHub Pages
1. Create a repository, upload everything in this folder (keep `index.html` at the root).
2. **Settings → Pages → Deploy from a branch → `main` / root → Save**.
3. Open `https://<username>.github.io/<repo>/`.

## Run in Termux
```bash
pkg update && pkg install python git -y
cd your-wishes
python -m http.server 8080
```
Open `http://localhost:8080` in Chrome. (Microphone and PIN hashing need `localhost` or HTTPS; don't open `index.html` as a `file://` file.)

## Customise
- Developer name, role, Facebook link, default photo: `js/config.js`. Tap the round photo on the page to pick your own picture (saved in that browser).
- Colours: CSS variables at the top of `css/style.css`.
- Fonts load from Google Fonts (Hind Siliguri for Bengali); offline, system fonts are used.
