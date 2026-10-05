/**
 * ภาษาลู (Pasa Loo) engine — pure functions, no DOM.
 *
 * Rules (per Thai syllable), from common ภาษาลู guides:
 *  1. Part 1: replace the initial consonant with ล; keep vowel, final, tone mark.
 *     Part 2: original initial + อู (อุ if the vowel is short) + tone mark + final.
 *  2. Initial is ร or ล → Part 1 uses ซ instead of ล.          รัก → ซักรุก
 *  3. Vowel is already อุ/อู → Part 1 uses หล, Part 2 uses อี/อิ. หมู → หลูหมี
 *  4. Both 2 and 3 → ซ wins for Part 1, Part 2 still uses อี/อิ.  รู้ → ซู้รี้
 *  Open syllables (no final) take อู unless spelled with ะ.     ไป → ไลปู, นะ → ละนุ
 *
 * Syllable splitting is rule-based (no dictionary), so it can be wrong;
 * the UI lets users merge / split chips and passes the edited Seg[] to convert().
 */

export type Direction = 'th2loo' | 'loo2th';

export interface Seg {
  /** the text of this segment */
  s: string;
  /** true when this is a Thai syllable (gets converted); false for spaces, latin, punctuation */
  th: boolean;
  /** id of the contiguous Thai run this syllable belongs to (-1 for non-Thai) */
  run: number;
}

export interface Syllable {
  /** index where the initial consonant (cluster) starts */
  a: number;
  /** index just after the initial consonant (cluster) */
  b: number;
  lead: string;
  tone: string;
  /** vowel marks + vowel-letter components (อ, ย, ว) */
  vm: string;
  fin: string;
  /** consonant with no vowel and no final, e.g. ส in ส|วัส|ดี */
  bare: boolean;
}

const KARAN = '์'; // ์
const CL_R = 'กขคตปผพบทดฟ'; // can take ร/ล as 2nd cluster consonant
const CL_W = 'กขค'; // can take ว as 2nd cluster consonant
const SONOR = 'งญนมยรลว'; // can follow a leading ห

type Ch = string | undefined;

export const isConsonant = (c: Ch): boolean => !!c && c >= 'ก' && c <= 'ฮ';
export const isLeadVowel = (c: Ch): boolean => !!c && c >= 'เ' && c <= 'ไ';
const isTone = (c: Ch): boolean => !!c && c >= '่' && c <= '๋';
const isVowelMark = (c: Ch): boolean =>
  !!c &&
  (c === 'ะ' ||
    c === 'ั' ||
    (c >= 'า' && c <= 'ฺ') ||
    c === 'ๅ' ||
    c === '็' ||
    c === 'ํ');
const isAttached = (c: Ch): boolean => isVowelMark(c) || isTone(c) || c === KARAN;

/** Does s[i] + s[i+1] form an initial cluster (กร, ปล, คว, หม, อย …)? */
function clusterAt(s: string, i: number, lead: string): boolean {
  const c0 = s[i];
  const c1 = s[i + 1];
  const c2 = s[i + 2];
  const c3 = s[i + 3];
  if (!isConsonant(c1)) return false;
  if (c0 === 'ห' && SONOR.includes(c1!)) return true;
  if (c0 === 'อ' && c1 === 'ย') return true;
  const r = (c1 === 'ร' || c1 === 'ล') && CL_R.includes(c0!);
  const w = c1 === 'ว' && CL_W.includes(c0!);
  if (!r && !w) return false;
  if (lead) return true;
  if (isAttached(c2)) return true;
  if (r && isConsonant(c2) && !isAttached(c3)) return true; // implicit vowel: ครบ, กรม
  return false;
}

/** Could s[i] begin a new syllable here? */
function startsNext(s: string, i: number): boolean {
  const nx = s[i + 1];
  if (isAttached(nx) && nx !== KARAN) return true;
  if (isConsonant(nx) && clusterAt(s, i, '') && isAttached(s[i + 2])) return true;
  if (nx === 'อ' && !isAttached(s[i + 2]) && !(s[i + 2] === 'ย' && isAttached(s[i + 3]))) return true;
  return false;
}

/** Split a run of Thai characters into syllables. */
export function syllabify(s: string): string[] {
  const out: string[] = [];
  const n = s.length;
  let i = 0;
  while (i < n) {
    const st = i;
    let lead = '';
    if (isLeadVowel(s[i])) {
      lead = s[i];
      i++;
    }
    if (!isConsonant(s[i])) {
      while (i < n && !isConsonant(s[i]) && !isLeadVowel(s[i])) i++;
      if (i === st) i++;
      out.push(s.slice(st, i));
      continue;
    }
    const ini = i;
    i++;
    if (clusterAt(s, ini, lead)) i++;
    let vm = '';
    let fin = '';
    while (i < n) {
      const c = s[i];
      if (isLeadVowel(c)) break;
      if (isTone(c) || c === KARAN) { i++; continue; }
      if (isVowelMark(c)) { vm += c; i++; continue; }
      if (!isConsonant(c)) { i++; continue; }
      if (s[i + 1] === KARAN) { i += 2; continue; }
      if (c === 'อ' && !fin && !vm.includes('อ') && (vm === '' || vm === 'ื') && !isAttached(s[i + 1])) {
        vm += c; i++; continue;
      }
      const needFin = !fin && /[ั็]$/.test(vm);
      if (needFin ? isAttached(s[i + 1]) && s[i + 1] !== KARAN : startsNext(s, i)) break;
      if (fin) break;
      if (c === 'ย' && lead === 'เ' && vm.includes('ี') && !vm.includes('ย')) { vm += c; i++; continue; }
      if (c === 'ว' && !vm.includes('ว') &&
          (vm === 'ั' || (vm === '' && !lead && isConsonant(s[i + 1]) && !isAttached(s[i + 2])))) {
        vm += c; i++; continue;
      }
      const noFin =
        lead === 'ไ' || lead === 'ใ'
          ? c !== 'ย'
          : vm.includes('ะ') || vm.includes('ำ') || (lead === 'เ' && vm === 'า');
      if (noFin) break;
      fin = c;
      i++;
    }
    out.push(s.slice(st, i));
  }
  return out;
}

/** Parse one syllable into its parts. Returns null when it has no consonant. */
export function parseSyllable(str: string): Syllable | null {
  const n = str.length;
  let i = 0;
  let lead = '';
  if (isLeadVowel(str[0])) { lead = str[0]; i = 1; }
  while (i < n && !isConsonant(str[i])) i++;
  if (i >= n) return null;
  const a = i;
  let b = i + 1;
  if (clusterAt(str, a, lead)) b++;
  // consonants sitting before the first vowel mark join the initial (user-merged chips like สวัส)
  let k = b;
  while (k < n && isConsonant(str[k])) k++;
  if (k > b && k < n && isVowelMark(str[k])) b = k;

  let tone = '';
  let vm = '';
  const fins: string[] = [];
  for (let j = b; j < n; j++) {
    const c = str[j];
    if (isTone(c)) { if (!tone) tone = c; continue; }
    if (c === KARAN) continue;
    if (isVowelMark(c)) { vm += c; continue; }
    if (!isConsonant(c)) continue;
    if (str[j + 1] === KARAN) continue; // silent letter
    if (!fins.length) {
      if (c === 'อ' && !vm.includes('อ') && (vm === '' || vm === 'ื')) { vm += c; continue; }
      if (c === 'ย' && lead === 'เ' && vm.includes('ี') && !vm.includes('ย')) { vm += c; continue; }
      if (c === 'ว' && !vm.includes('ว') && (vm === 'ั' || (vm === '' && !lead && isConsonant(str[j + 1])))) {
        vm += c; continue;
      }
    }
    fins.push(c);
  }
  const finals = lead === 'ไ' || lead === 'ใ' ? [] : fins;
  return { a, b, lead, tone, vm, fin: finals[0] ?? '', bare: !lead && !vm && !finals.length };
}

/** Initial consonant (cluster) of a syllable, e.g. "คร" for ครู. */
export function initialOf(str: string): string {
  const p = parseSyllable(str);
  return p ? str.slice(p.a, p.b) : str;
}

/** Convert one Thai syllable into its two ภาษาลู parts. */
export function toLoo(str: string): [string, string] {
  const p = parseSyllable(str);
  if (!p) return [str, ''];
  const init = str.slice(p.a, p.b);
  const sound = init.length > 1 && (init[0] === 'ห' || init[0] === 'อ') ? init[1] : init[0];
  const hasU = /[ุู]/.test(p.vm);
  const L = sound === 'ล' || sound === 'ร' ? 'ซ' : hasU ? 'หล' : 'ล';
  const before = str.slice(0, p.a);
  const after = str.slice(p.b);

  if (p.bare) {
    return [before + L + after + (p.tone ? 'อ' : 'ะ'), init + (p.tone ? 'ู' : 'ุ') + p.tone];
  }

  const fin = p.vm.includes('ำ') ? 'ม' : p.fin;
  let short: boolean;
  if (p.vm.includes('ะ')) short = true;
  else if (!p.vm && !p.lead) short = true; // implicit โ-ะ: คน
  else if (p.vm.includes('ัว')) short = false;
  else short = /[ัิึุ็ำ]/.test(p.vm);

  const u = hasU
    ? p.vm.includes('ู') ? 'ี' : 'ิ'
    : fin
      ? short ? 'ุ' : 'ู'
      : p.vm.includes('ะ') ? 'ุ' : 'ู';

  return [before + L + after, init + u + p.tone + fin];
}

/** Rebuild the original Thai syllable from a ภาษาลู pair. */
export function fromPair(part1: string, part2: string): string {
  const p1 = parseSyllable(part1);
  const p2 = parseSyllable(part2);
  if (!p1 || !p2) return part1 + part2;
  return part1.slice(0, p1.a) + part2.slice(p2.a, p2.b) + part1.slice(p1.b);
}

const THAI_RUN = /[ก-ฮะ-ฺเ-ๅ็-๎]+/g;

/** Split any text into Thai syllables and pass-through segments. */
export function tokenize(text: string): Seg[] {
  const segs: Seg[] = [];
  let last = 0;
  let run = 0;
  for (const m of text.matchAll(THAI_RUN)) {
    const idx = m.index ?? 0;
    if (idx > last) segs.push({ s: text.slice(last, idx), th: false, run: -1 });
    run++;
    for (const syl of syllabify(m[0])) segs.push({ s: syl, th: true, run });
    last = idx + m[0].length;
  }
  if (last < text.length) segs.push({ s: text.slice(last), th: false, run: -1 });
  return segs;
}

/** Convert segments in the given direction. ภาษาลู → Thai pairs syllables within each Thai run. */
export function convert(segs: Seg[], dir: Direction): string {
  if (dir === 'th2loo') {
    return segs.map((g) => (g.th ? toLoo(g.s).join('') : g.s)).join('');
  }
  let out = '';
  let buf: string[] = [];
  let cur: number | null = null;
  const flush = () => {
    for (let i = 0; i < buf.length; i += 2) {
      out += i + 1 < buf.length ? fromPair(buf[i], buf[i + 1]) : buf[i];
    }
    buf = [];
  };
  for (const g of segs) {
    if (!g.th) { flush(); cur = null; out += g.s; continue; }
    if (g.run !== cur) { flush(); cur = g.run; }
    buf.push(g.s);
  }
  flush();
  return out;
}

/** Convenience: translate plain text. */
export const translate = (text: string, dir: Direction = 'th2loo'): string => convert(tokenize(text), dir);

/** Positions where a syllable chip may be split (before a consonant or lead vowel). */
export function splitPoints(str: string): number[] {
  const pts: number[] = [];
  for (let k = 1; k < str.length; k++) if (isConsonant(str[k]) || isLeadVowel(str[k])) pts.push(k);
  return pts;
}

/** Merge segment i with i+1 (same Thai run only). Returns a new array, or the same one if not allowed. */
export function mergeSegs(segs: Seg[], i: number): Seg[] {
  const a = segs[i];
  const b = segs[i + 1];
  if (!a || !b || !a.th || !b.th || a.run !== b.run) return segs;
  const next = segs.slice();
  next.splice(i, 2, { s: a.s + b.s, th: true, run: a.run });
  return next;
}

/** Split segment i at character k. */
export function splitSeg(segs: Seg[], i: number, k: number): Seg[] {
  const a = segs[i];
  if (!a || k <= 0 || k >= a.s.length) return segs;
  const next = segs.slice();
  next.splice(i, 1, { s: a.s.slice(0, k), th: true, run: a.run }, { s: a.s.slice(k), th: true, run: a.run });
  return next;
}
