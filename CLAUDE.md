# CLAUDE.md — ภาษาลู Translator

Playful web app that converts Thai text to ภาษาลู (Pasa Loo) and back, live as you type.
Next.js (App Router, static export) + TypeScript strict + Tailwind v4 + shadcn/ui-style components. Deployed on Vercel from GitHub. No backend.

## Commands

- `npm install`
- `npm run dev` — dev server (http://localhost:3000)
- `npm test` — Vitest engine tests (must stay green)
- `npm run typecheck`
- `npm run build` — static export to `out/`

## Where things live

- `src/lib/pasaloo/` — **the engine**, pure TS, no React/DOM: `segment` (Intl.Segmenter words → rule-based syllables), `parse`, `tone`, `encode`, `decode`, `index` (`translate`). Tests live next to it; add a case for every rule change or bug fix.
- `src/lib/pasaloo/words.ts` — practice words by syllable count.
- `src/app/` — routes: `/` translator, `/practice`, `/how-it-works`, `opengraph-image.tsx`; `globals.css` holds design tokens (`:root`, `.dark`) mapped into Tailwind via `@theme inline`.
- `src/components/` — TranslatorPanel (page state), SyllableChips, SwapButton, HistoryList, PracticeCard, HowItWorks, Header, ThemeToggle; `ui/` is shadcn-style (cva + Radix).
- `src/hooks/` — `useHistory` (localStorage, max 20), `useSpeech` (th-TH, voice detection).
- `src/lib/i18n.ts` — TH/EN dictionary; add every UI string to both languages.

## ภาษาลู rules (implemented in `encode.ts` / `tone.ts`)

Per syllable:

- Part 1: initial → ล (ซ if the initial is already ล); keep vowel and final; recompute the tone mark so the **spoken tone** is unchanged. ล is low-class, so when it can't make the tone (low / rising) use หล. `ข้าว → ล่าวขู้ว`, `หมา → หลาหมู`, `ลา → ซาลู`
- Part 2: original initial + อู (อุ if short) + original tone mark + final. `กิน → ลินกุน`, `ไป → ไลปู`
- Reverse: read syllables in pairs; initial from Part 2, vowel/final from Part 1, tone mark from Part 2.
- Non-Thai text passes through; a typed `-` between Thai letters forces a syllable split.

## Known limitations

- Syllable splitting is rule-based; hidden-vowel words (สวัสดี, ขนม) can split wrong. Syllables the splitter is unsure about are flagged `uncertain`; users fix splits via the chips.
- Speech uses the device's Thai voice; some desktops have none.

## Conventions

- Keep the engine pure and fully tested; UI never re-implements rules.
- Colors only via the CSS variables / Tailwind theme tokens; check both themes and 390px width for any UI change.
- Touch targets ≥ 44px, real `<button>`/`<label>`, `aria-label` on icon-only buttons.
- UI copy is Thai by default with an English dictionary.
- No random or localStorage reads during SSR/first render (static export hydration); load them in effects.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
