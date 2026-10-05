/** ภาษาลู → Thai: read syllables in pairs; initial comes from part 2, vowel / final from part 1, tone mark from part 2. */
import { compose, parseSyllable } from './parse';
import type { Seg } from './segment';

export function fromPair(part1: string, part2: string): string {
  const p1 = parseSyllable(part1);
  const p2 = parseSyllable(part2);
  if (!p1 || !p2) return part1 + part2;
  return compose(p1.before, p2.initial, p1.rest, p2.tone);
}

/** Pairs syllables within each contiguous Thai run; an odd leftover is passed through. */
export function decode(segs: Seg[]): string {
  let out = '';
  let buf: string[] = [];
  let cur: number | null = null;
  const flush = () => {
    for (let i = 0; i < buf.length; i += 2) out += i + 1 < buf.length ? fromPair(buf[i]!, buf[i + 1]!) : buf[i];
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
