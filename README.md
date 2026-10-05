# ภาษาลู Translator 🤫

แปลภาษาไทยเป็นภาษาลู และแปลกลับ แบบสด ๆ ขณะพิมพ์ — React + Vite + TypeScript

- Live translation both ways, with a swap button
- Syllable chips you can merge / split when the auto-split is wrong
- Copy, Share, text-to-speech (Thai)
- "How it works" card, Practice mode, recent history (saved in the browser)
- Light / dark mode, responsive down to 360px

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # engine unit tests
npm run build    # production build → dist/
```

## Deploy to Vercel via GitHub

1. Create an empty repo on GitHub (e.g. `pasaloo-translator`), then from this folder:
   ```bash
   git remote add origin https://github.com/<you>/pasaloo-translator.git
   git push -u origin main
   ```
2. On [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → pick the repo.
3. Vercel detects **Vite** automatically (Build: `npm run build`, Output: `dist`). Click **Deploy**.

Every push to `main` redeploys; pull requests get preview URLs.

## Continue with Claude Code

```bash
cd pasaloo-translator
claude
```

`CLAUDE.md` gives Claude Code the architecture, the ภาษาลู rules, and known limitations to work on.
