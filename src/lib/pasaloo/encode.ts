/** Thai → ภาษาลู */
import { compose, parseSyllable } from './parse';
import type { Seg } from './segment';
import { classOf, finalOf, isLive, isShort, markFor, spokenTone } from './tone';

/** Convert one Thai syllable into its two ภาษาลู parts. */
export function toLoo(str: string): [string, string] {
  const p = parseSyllable(str);
  if (!p) return [str, ''];
  // a bare consonant has an implicit short อะ
  if (p.bare) { p.vm = 'ะ'; p.rest = 'ะ'; }

  const short = isShort(p);
  const live = isLive(p);
  const tone = spokenTone(classOf(p.initial), p.tone, live, short);

  const hasU = /[ุู]/.test(p.vm);

  // part 1: initial → ล. ร / ล sounds → ซ. A vowel that is already อุ/อู → หล (ล + อู would look like part 2).
  // The tone mark is recomputed to keep the spoken tone; where หล / ล can't make it, the next best letter is used.
  const sound = p.initial.length > 1 && (p.initial[0] === 'ห' || p.initial[0] === 'อ') ? p.initial[1] : p.initial[0];
  let L = 'ล';
  let mark: string | null;
  if (sound === 'ร' || sound === 'ล') {
    L = 'ซ';
    mark = markFor('low', tone, live, short);
  } else {
    const hl = hasU ? markFor('high', tone, live, short) : null;
    if (hl !== null) {
      L = 'หล';
      mark = hl;
    } else {
      mark = markFor('low', tone, live, short);
      if (mark === null) {
        // ล is low-class and can't make a low / rising tone → ห + ล (high-class) can
        mark = markFor('high', tone, live, short);
        if (mark !== null) L = 'หล';
      }
    }
  }
  if (mark === null) mark = p.tone; // can't preserve the tone (e.g. หลับ with ซ): keep the original mark

  // part 2: original initial + อู (อุ if short) — อี (อิ) when the vowel was already อู (อุ) — + original tone mark + final
  const u = hasU ? (p.vm.includes('ู') ? 'ี' : 'ิ') : short ? 'ุ' : 'ู';
  return [compose(p.before, L, p.rest, mark), compose('', p.initial, u + finalOf(p), p.tone)];
}

export const encode = (segs: Seg[]): string => segs.map((g) => (g.th ? toLoo(g.s).join('') : g.s)).join('');
