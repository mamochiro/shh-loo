/** Public API of the ภาษาลู engine. Pure TypeScript — no React, no DOM. */
import { decode } from './decode';
import { encode } from './encode';
import { isUncertain, parseSyllable } from './parse';
import { segment, type Seg } from './segment';

export type Direction = 'th2loo' | 'loo2th';
export interface Syllable { text: string; uncertain: boolean }
export interface TranslateResult { output: string; syllables: Syllable[]; segs: Seg[] }

/** `segs` = user-edited split (from mergeSegs / splitSeg); when given, auto-splitting is skipped. */
export function translate(text: string, dir: Direction, segs?: Seg[]): TranslateResult {
  const s = segs ?? segment(text, dir === 'th2loo');
  return {
    output: dir === 'th2loo' ? encode(s) : decode(s),
    syllables: s.filter((g) => g.th).map((g) => ({ text: g.s, uncertain: isUncertain(g.s) })),
    segs: s,
  };
}

export { segment, syllabify, mergeSegs, splitSeg, splitPoints, type Seg } from './segment';
export { toLoo } from './encode';
export { fromPair } from './decode';
export { parseSyllable } from './parse';
export { classOf, spokenTone } from './tone';
export const initialOf = (syl: string): string => parseSyllable(syl)?.initial ?? syl;
