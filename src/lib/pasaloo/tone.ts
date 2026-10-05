/** Thai tone rules: consonant classes, live/dead syllables, spoken tone, and which tone mark makes a given tone. */
import type { Parsed } from './parse';

export type Tone = 'mid' | 'low' | 'falling' | 'high' | 'rising';
export type ConsClass = 'high' | 'mid' | 'low';

const HIGH = 'ขฃฉฐถผฝศษสห';
const MID = 'กจฎฏดตบปอ';
const STOP_FINALS = 'กขคฆจชซฎฏฐฑฒดตถทธศษสบปพฟภ'; // sound k / t / p → dead syllable

/** Class of the sounding initial: a leading ห makes it high, a leading อ (อย) makes it mid. */
export function classOf(initial: string): ConsClass {
  const c = initial[0] ?? '';
  if (initial.length > 1 && c === 'ห') return 'high';
  if (initial.length > 1 && c === 'อ') return 'mid';
  return HIGH.includes(c) ? 'high' : MID.includes(c) ? 'mid' : 'low';
}

export const finalOf = (p: Parsed): string => (p.vm.includes('ำ') ? 'ม' : p.fin);

/** Short vowel? (decides อุ vs อู in part 2, and dead-syllable tones) */
export function isShort(p: Parsed): boolean {
  if (p.vm.includes('ะ')) return true;
  if (!p.vm && !p.lead) return true; // implicit short โอะ: คน
  if (p.vm.includes('ัว')) return false;
  return /[ัิึุ็ำ]/.test(p.vm);
}

/** Live = long/open or sonorant final; dead = stop final or short open vowel. */
export function isLive(p: Parsed): boolean {
  const f = finalOf(p);
  return f ? !STOP_FINALS.includes(f) : !isShort(p);
}

/** The tone you actually hear. */
export function spokenTone(cls: ConsClass, mark: string, live: boolean, short: boolean): Tone {
  if (mark === '่') return cls === 'low' ? 'falling' : 'low';
  if (mark === '้') return cls === 'low' ? 'high' : 'falling';
  if (mark === '๊') return 'high';
  if (mark === '๋') return 'rising';
  if (live) return cls === 'high' ? 'rising' : 'mid';
  return cls !== 'low' ? 'low' : short ? 'high' : 'falling';
}

/** Tone mark ('' = none) that gives `tone` for this class + shape, or null if the class can't make it. */
export function markFor(cls: 'low' | 'high', tone: Tone, live: boolean, short: boolean): string | null {
  if (cls === 'low') {
    switch (tone) {
      case 'mid': return live ? '' : null;
      case 'falling': return !live && !short ? '' : '่';
      case 'high': return !live && short ? '' : '้';
      default: return null; // low / rising need a high-class initial
    }
  }
  switch (tone) {
    case 'rising': return live ? '' : null;
    case 'low': return live ? '่' : '';
    case 'falling': return '้';
    default: return null;
  }
}
