import { describe, expect, it } from 'vitest';
import { mergeSegs, splitSeg, syllabify, tokenize, translate } from './pasaloo';

const cases: Array<[string, string]> = [
  // rule 1 — basic
  ['ไป', 'ไลปู'],
  ['กิน', 'ลินกุน'],
  ['กินข้าว', 'ลินกุนล้าวขู้ว'],
  ['โอเค', 'โลอูเลคู'],
  ['หมา', 'ลาหมู'],
  ['แมว', 'แลวมูว'],
  ['น้ำ', 'ล้ำนุ้ม'],
  ['เพื่อน', 'เลื่อนพู่น'],
  ['ไปเที่ยว', 'ไลปูเลี่ยวทู่ว'],
  ['สวย', 'ลวยสูย'],
  // rule 2 — ร / ล → ซ
  ['รัก', 'ซักรุก'],
  ['ลม', 'ซมลุม'],
  ['ลองรัก', 'ซองลูงซักรุก'],
  ['หลับ', 'ซับหลุบ'],
  // rule 3 — อุ / อู → หล + อี / อิ
  ['หมู', 'หลูหมี'],
  ['สุก', 'หลุกสิก'],
  ['กูด', 'หลูดกีด'],
  ['ขอบคุณ', 'ลอบขูบหลุณคิณ'],
  // rule 4 — both
  ['หนูไม่รู้', 'หลูหนีไล่มู่ซู้รี้'],
  ['กินข้าวหรือยัง', 'ลินกุนล้าวขู้วซือหรูลังยุง'],
];

describe('Thai → ภาษาลู', () => {
  it.each(cases)('%s → %s', (thai, loo) => {
    expect(translate(thai, 'th2loo')).toBe(loo);
  });
});

describe('ภาษาลู → Thai (round trip)', () => {
  it.each(cases)('%s', (thai, loo) => {
    expect(translate(loo, 'loo2th')).toBe(thai);
  });
});

describe('syllabify', () => {
  it('splits common words', () => {
    expect(syllabify('กินข้าวหรือยัง')).toEqual(['กิน', 'ข้าว', 'หรือ', 'ยัง']);
    expect(syllabify('โรงเรียน')).toEqual(['โรง', 'เรียน']);
    expect(syllabify('ประเทศไทย')).toEqual(['ประ', 'เทศ', 'ไทย']);
  });

  it('passes through non-Thai text', () => {
    expect(translate('hi ไป!', 'th2loo')).toBe('hi ไลปู!');
  });
});

describe('manual chip edits', () => {
  it('merges and splits within a run', () => {
    const segs = tokenize('กินข้าว');
    const merged = mergeSegs(segs, 0);
    expect(merged.map((g) => g.s)).toEqual(['กินข้าว']);
    expect(splitSeg(merged, 0, 3).map((g) => g.s)).toEqual(['กิน', 'ข้าว']);
  });

  it('does not merge across a space', () => {
    const segs = tokenize('ไป ไป');
    expect(mergeSegs(segs, 0)).toBe(segs);
  });
});
