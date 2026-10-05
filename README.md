# ภาษาลู Translator 🤫

Thai ⇄ ภาษาลู (Pasa Loo), live as you type. Next.js (App Router) + TypeScript + Tailwind v4 + shadcn/ui-style components. Everything runs client-side and exports as static HTML.

## Setup

```bash
bun install
bun run dev        # http://localhost:3000
bun run test         # Vitest — engine unit tests
bun run typecheck  # tsc --noEmit
bun run build      # static export → out/
```

Stack: Next.js · Tailwind CSS v4 · shadcn/ui pattern (Radix + cva) · `next/font` (Prompt for headings, Noto Sans Thai for body) · next-themes · Motion · Sonner · lucide-react · Vitest. No backend, no external APIs.

## Features

- Live translation (150 ms debounce) both ways, with a swap button
- Syllable chips; tap one for a split / merge popover that overrides the automatic split. A typed `-` between Thai letters forces a split
- Copy, Speak (Web Speech API, `th-TH`, detects whether a Thai voice exists), Share (`?t=<text>&d=th2loo|loo2th` link, native share sheet when available)
- History in `localStorage` (max 20), Practice mode (3 difficulty levels from `src/lib/pasaloo/words.ts`)
- TH / EN UI switch, light / dark mode, responsive from 390px to 1440px

## How the engine works

`src/lib/pasaloo/` is pure TypeScript with no React or DOM imports.

1. **segment.ts** normalizes text, splits Thai words with `Intl.Segmenter('th', { granularity: 'word' })`, then splits each word into syllables with rules. Non-Thai text, numbers, punctuation and spaces pass through untouched.
2. **parse.ts** turns a syllable into `{ initial, vowel, final, toneMark }`; the initial can be a cluster (กร, ปล, คว) or ห / อ-led (หมา, อย่า). Silent letters (การันต์) are dropped.
3. **tone.ts** knows consonant classes, live / dead syllables, the spoken tone, and which tone mark produces a given tone for a given class.
4. **encode.ts** (Thai → ภาษาลู), per syllable:
   - Part 1: initial → ล, vowel and final kept; ร / ล initial → ซ; vowel already อุ / อู → หล. The tone mark is recomputed to keep the **spoken** tone (ล is low-class, so low / rising tones need หล; หล can't make mid / high, so those fall back to ล).
   - Part 2: original initial + อู (อุ if the vowel is short) + original tone mark + final; อี / อิ when the vowel was already อู / อุ.
5. **decode.ts** reads syllables in pairs: initial from Part 2, vowel and final from Part 1, tone mark from Part 2.
6. **index.ts** exposes `translate(text, direction, segs?)` → `{ output, syllables: { text, uncertain }[], segs }`. A syllable is `uncertain` when the splitter couldn't parse it confidently; the UI marks it with a `?`.

Examples: `ไป → ไลปู`, `กิน → ลินกุน`, `ข้าว → ล่าวขู้ว`, `รัก → ซักรุก`, `ลา → ซาลู`, `หมา → หลาหมู`, `หมู → หลูหมี`.

## Project structure

```
src/app/            layout, page (translator), practice/, how-it-works/, opengraph-image.tsx
src/components/     TranslatorPanel, SyllableChips, SwapButton, HistoryList, PracticeCard, HowItWorks, Header, ThemeToggle, ui/
src/lib/pasaloo/    engine + words.ts (practice words)
src/lib/i18n.ts     TH / EN dictionary
src/hooks/          useHistory, useSpeech
```

## Deploy to Vercel

The app is a static export (`output: 'export'`), so no server or environment variables are needed.

1. Push the repo to GitHub.
2. On [vercel.com/new](https://vercel.com/new), import the repository. The Framework Preset is detected as **Next.js**; keep the defaults (Build: `bun run build`).
3. Click **Deploy**. Every push to `main` redeploys; pull requests get preview URLs.

Or with the CLI: `npx vercel` (preview) / `npx vercel --prod`.
