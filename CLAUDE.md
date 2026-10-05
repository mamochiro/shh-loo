# CLAUDE.md — ภาษาลู Translator

Playful web app that converts Thai text to ภาษาลู (Pasa Loo) and back, live as you type.
React 18 + Vite 5 + TypeScript, no UI library, plain CSS with design tokens. Deployed on Vercel from GitHub.

## Commands

- `npm install`
- `npm run dev` — local dev server (http://localhost:5173)
- `npm test` — Vitest unit tests for the translation engine (must stay green)
- `npm run build` — type-check + production build to `dist/`

## Where things live

- `src/lib/pasaloo.ts` — **the engine**. Pure functions, no DOM: `syllabify`, `parseSyllable`, `toLoo`, `fromPair`, `tokenize`, `convert`, `translate`, `mergeSegs`, `splitSeg`. All language rules are documented at the top of this file.
- `src/lib/pasaloo.test.ts` — rule examples from public ภาษาลู guides + round-trip tests. Add a test case for every rule change or bug fix.
- `src/lib/browser.ts` — clipboard, Web Share, speech synthesis (th-TH), safe localStorage.
- `src/data/words.ts` — practice words and "How it works" examples.
- `src/App.tsx` — page state (text, direction, edited syllables, tab, theme, history, toast).
- `src/components/` — `SyllableChips`, `HowItWorks`, `History`, `Practice`, `Mascot`, `Icons`.
- `src/styles.css` — tokens on `:root`, dark theme on `:root[data-theme='dark']`, responsive breakpoints at 860px and 560px.

## ภาษาลู rules (implemented in `toLoo`)

1. Part 1: initial consonant → ล, keep vowel / final / tone mark. Part 2: original initial + อู (อุ if short) + tone mark + final. `กิน → ลินกุน`, `ข้าว → ล้าวขู้ว`
2. Initial ร or ล → Part 1 uses ซ. `รัก → ซักรุก`, `ลม → ซมลุม`
3. Vowel already อุ/อู → Part 1 uses หล, Part 2 uses อี/อิ. `หมู → หลูหมี`, `สุก → หลุกสิก`
4. Rules 2 + 3 together → ซ for Part 1, อี/อิ for Part 2. `รู้ → ซู้รี้`
5. Open syllables take อู unless spelled with ะ. `ไป → ไลปู`, `นะ → ละนุ`

Reverse (ภาษาลู → Thai): pair syllables within a Thai run; original = Part 1 with its initial replaced by Part 2's initial.

## Known limitations / good next tasks

- Syllable splitting is rule-based, not dictionary-based: words with hidden vowels (สวัสดี → ส|วัส|ดี, ขนม) can split wrong. Users fix via chips. A dictionary-backed splitter (e.g. `Intl.Segmenter('th', { granularity: 'word' })` to find word boundaries first) would help.
- Clusters (กร, ปล, คร) keep the 2nd consonant in Part 2 (`ปลา → ลาปลู`); sources don't specify.
- Silent ย after ไ is kept (`ไทย → ไลยทู`).
- Speech uses the device's Thai voice; some desktops have none.

## Conventions

- Keep the engine pure and fully tested; UI never re-implements rules.
- Colors only via CSS variables; check both themes and 390px width for any UI change.
- Touch targets ≥ 44px, real `<button>`/`<label>`, `aria-label` on icon-only buttons.
- UI copy is Thai.
