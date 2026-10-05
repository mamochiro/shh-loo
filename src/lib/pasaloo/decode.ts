/** ภาษาลู → Thai: read syllables in pairs; initial comes from part 2, vowel / final from part 1, tone mark from part 2. */
import { toLoo } from './encode';
import { compose, parseSyllable } from './parse';
import type { Seg } from './segment';

export function fromPair(part1: string, part2: string): string {
  const p1 = parseSyllable(part1);
  const p2 = parseSyllable(part2);
  if (!p1 || !p2) return part1 + part2;
  return compose(p1.before, p2.initial, p1.rest, p2.tone);
}

const noTone = (t: string) => t.replace(/[่-๋]/g, '');

/** A real ภาษาลู pair: encoding the decoded syllable gives this pair back (tone marks ignored, so hand-written ล้าว + ขู้ว still counts). */
export function isValidPair(part1: string, part2: string): boolean {
  const [a, b] = toLoo(fromPair(part1, part2));
  return noTone(a) === noTone(part1) && noTone(b) === noTone(part2);
}

/** Pairs syllables within each contiguous Thai run; an odd leftover or an invalid pair is passed through unchanged. */
export function decode(segs: Seg[]): string {
  let out = '';
  let buf: string[] = [];
  let cur: number | null = null;
  const flush = () => {
    for (let i = 0; i < buf.length; i += 2) {
      const [a, b] = [buf[i]!, buf[i + 1]];
      // strict: leftovers and pairs that don't follow the rules (ลู+รู — รู is ซูรี) are passed through unchanged
      out += b !== undefined && isValidPair(a, b) ? fromPair(a, b) : a + (b ?? '');
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
