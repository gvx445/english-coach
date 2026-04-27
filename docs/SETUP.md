# Setup

## 1. Get a Gemini API key

⚠️ If you previously shared an API key (e.g. in a screenshot), **revoke it first** at <https://aistudio.google.com/apikey>, then generate a new one.

1. Visit <https://aistudio.google.com/apikey>
2. Click **Create API key**
3. Copy the key (starts with `AIza…`)

## 2. Paste the key into config.local.js

Open `config.local.js` in any text editor. Replace `PASTE_YOUR_NEW_GEMINI_KEY_HERE` with your real key.

```js
window.APP_CONFIG = {
  GEMINI_API_KEY: "AIza...",   // ← your key here
  ...
};
```

Save the file. **Do not commit this file** if you ever publish the project.

## 3. Run the app

### Option A — Desktop, just open the file

Double-click `index.html`. It opens in your default browser. ✅ Everything works **except** PWA install on mobile (which requires HTTPS).

### Option B — Local server (recommended for full features)

```bash
cd english-coach
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

### Option C — Mobile / PWA install

To install as a PWA on your phone, you need HTTPS. Two easy paths:

**GitHub Pages (free)**
1. Push the project to a GitHub repo (private or public).
2. Settings → Pages → Build from `main` branch, root.
3. After ~1 minute, GitHub gives you a `https://<you>.github.io/<repo>/` URL.
4. Open that URL on your phone, tap the browser's **share** icon → **Add to Home Screen**.

**Cloudflare Pages / Netlify / Vercel**
Drag-and-drop the folder. Free tier is more than enough.

⚠️ If you do publish online, **never commit `config.local.js`**. The included `.gitignore` already excludes it. Either:
- Keep your key only in your local copy, OR
- Self-host LanguageTool and proxy Gemini through a small backend (out of scope for this personal app).

## 4. First run

The app will detect first run and show the **placement test**: 3 short writing prompts. Gemini will estimate your CEFR level and gap areas. This populates your starting profile (you can override in Settings later).

## 5. Import your study materials

In the **Import** tab:

- Drop PDF research reports (your "intesa" Drive folder). They are chunked, embedded, and used as gold standards in the Mirror Writing exercise.
- Drop Excel files (your "inglese" Drive folder — *parole da libro*, *parole più utilizzate*, idioms, etc.). The first column becomes the term, the second the Italian translation/definition, the third an example.

## 6. Daily routine (suggested)

- **Editor** — write something every day (a flash note, a bullet thesis, a client-style email). Apply the suggested fixes.
- **Mirror** — 1 round/day, 60s study time. Forces you to absorb analyst phrasing.
- **Vocabulary → Review due** — clear your daily SRS queue (5-10 minutes).
- **Weekly Challenge** — once a week, 30 minutes.

## Troubleshooting

- **"Gemini API key not configured"** → you didn't replace `PASTE_YOUR_NEW_GEMINI_KEY_HERE` in `config.local.js`, or didn't reload the page.
- **No internet?** → analysis won't run, but the editor and vocabulary still work locally.
- **LanguageTool fails or is slow** → free tier has rate limits. Either wait, self-host it, or just disable that layer (only Gemini will run).
- **Lost my data** → use Settings → Export to back up regularly. Restore via Import on a new browser/profile.
