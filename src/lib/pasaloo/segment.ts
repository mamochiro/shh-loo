/** Text → segments: normalize, Thai word boundaries via Intl.Segmenter, then rule-based syllable splitting. */
import { KARAN, clusterAt, isAttached, isConsonant, isLeadVowel, isTone, isVowelMark } from './parse';

export interface Seg {
  /** the text of this segment */
  s: string;
  /** true for a Thai syllable (gets converted); false for spaces, latin, digits, punctuation */
  th: boolean;
  /** id of the contiguous Thai run this syllable belongs to (-1 for non-Thai) */
  run: number;
}


/** Could s[i] begin a new syllable here? */
function startsNext(s: string, i: number): boolean {
  const nx = s[i + 1];
  if (isAttached(nx) && nx !== KARAN) return true;
  if (isConsonant(nx) && clusterAt(s, i, '') && isAttached(s[i + 2])) return true;
  if (nx === 'อ' && !isAttached(s[i + 2]) && !(s[i + 2] === 'ย' && isAttached(s[i + 3]))) return true;
  return false;
}

/** Rule-based split of a run of Thai characters into syllables. */
export function syllabify(s: string, loo = false): string[] {
  const out: string[] = [];
  const n = s.length;
  let i = 0;
  while (i < n) {
    const st = i;
    let lead = '';
    if (isLeadVowel(s[i])) { lead = s[i]!; i++; }
    if (!isConsonant(s[i])) {
      while (i < n && !isConsonant(s[i]) && !isLeadVowel(s[i])) i++;
      if (i === st) i++;
      out.push(s.slice(st, i));
      continue;
    }
    const ini = i;
    // ภาษาลู side: a part 1 starting with ซ is always followed by a part 2 starting with ล / หล,
    // so ซูก|ลูก must not be read as ซู|กลูก
    const zi = loo && s[ini] === 'ซ';
    i++;
    if (clusterAt(s, ini, lead)) i++;
    let vm = '';
    let fin = '';
    while (i < n) {
      const c = s[i]!;
      if (isLeadVowel(c)) break;
      if (isTone(c) || c === KARAN) { i++; continue; }
      if (isVowelMark(c)) { vm += c; i++; continue; }
      if (!isConsonant(c)) { i++; continue; }
      if (s[i + 1] === KARAN) { i += 2; continue; }
      if (isConsonant(s[i + 1]) && s[i + 2] === KARAN && fin) { i += 3; continue; } // silent pair: ทร์
      if (c === 'อ' && !fin && !vm.includes('อ') && (vm === '' || vm === 'ื') && !isAttached(s[i + 1])) {
        vm += c; i++; continue;
      }
      const needFin = !fin && /[ั็]$/.test(vm);
      const loosePart2 = zi && !fin && c !== 'ล' && !(c === 'ห' && s[i + 1] === 'ล');
      if (needFin ? isAttached(s[i + 1]) && s[i + 1] !== KARAN : startsNext(s, i) && !loosePart2) break;
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

const THAI = 'ก-ฮะ-ฺเ-ๅ็-๎';
const RUN = new RegExp(`[${THAI}]+(?:-[${THAI}]+)*`, 'g'); // a "-" between Thai letters forces a split

const normalize = (t: string) => t.normalize('NFC').replace(/[​﻿]/g, '');

let segmenter: Intl.Segmenter | null | undefined;
function words(piece: string): string[] {
  if (segmenter === undefined) {
    try { segmenter = new Intl.Segmenter('th', { granularity: 'word' }); } catch { segmenter = null; }
  }
  return segmenter ? Array.from(segmenter.segment(piece), (x) => x.segment) : [piece];
}

/**
 * Split text into Thai syllables + pass-through segments.
 * `useWords` runs Intl.Segmenter first (Thai → ลู); ลู → Thai skips it because ลู text isn't real words.
 */
export function segment(text: string, useWords = true): Seg[] {
  text = normalize(text);
  const segs: Seg[] = [];
  let last = 0;
  let run = 0;
  for (const m of text.matchAll(RUN)) {
    const idx = m.index ?? 0;
    if (idx > last) segs.push({ s: text.slice(last, idx), th: false, run: -1 });
    run++;
    for (const piece of m[0].split('-')) {
      for (const w of useWords ? words(piece) : [piece]) {
        for (const syl of syllabify(w, !useWords)) segs.push({ s: syl, th: true, run });
      }
    }
    last = idx + m[0].length;
  }
  if (last < text.length) segs.push({ s: text.slice(last), th: false, run: -1 });
  return segs;
}

/** Positions where a syllable chip may be split (before a consonant or lead vowel). */
export function splitPoints(str: string): number[] {
  const pts: number[] = [];
  for (let k = 1; k < str.length; k++) if (isConsonant(str[k]) || isLeadVowel(str[k])) pts.push(k);
  return pts;
}

/** Merge segment i with i+1 (same Thai run only). Returns the same array if not allowed. */
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
  if (!a || !a.th || k <= 0 || k >= a.s.length) return segs;
  const next = segs.slice();
  next.splice(i, 1, { s: a.s.slice(0, k), th: true, run: a.run }, { s: a.s.slice(k), th: true, run: a.run });
  return next;
}
