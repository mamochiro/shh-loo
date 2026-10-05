import { describe, expect, it } from 'vitest';
import { mergeSegs, splitSeg, translate } from './index';
import { syllabify } from './segment';
import { WORDS } from './words';

const enc = (t: string) => translate(t, 'th2loo').output;
const dec = (t: string) => translate(t, 'loo2th').output;

// [thai, loo] — expected values derived by hand from the rules (see README / parse.ts / tone.ts)
const cases: Array<[string, string]> = [
  // spec examples
  ['ไป', 'ไลปู'],
  ['กิน', 'ลินกุน'],
  ['รัก', 'ลักรุก'],
  ['มา', 'ลามู'],
  ['ลา', 'ซาลู'],
  // simple, no tone mark
  ['ดี', 'ลีดู'],
  ['ใจ', 'ใลจู'],
  ['เรา', 'เลารู'],
  ['แมว', 'แลวมูว'],
  ['คน', 'ลนคุน'],
  ['กินข้าว', 'ลินกุนล่าวขู้ว'],
  // mid class (ก) × every tone mark
  ['กา', 'ลากู'],
  ['ก่า', 'หล่ากู่'],
  ['ก้า', 'ล่ากู้'],
  ['ก๊า', 'ล้ากู๊'],
  ['ก๋า', 'หลากู๋'],
  // high class (ข): no mark is rising → needs หล
  ['ขา', 'หลาขู'],
  ['ข่า', 'หล่าขู่'],
  ['ข้า', 'ล่าขู้'],
  // low class (ค)
  ['คา', 'ลาคู'],
  ['ค่า', 'ล่าคู่'],
  ['ค้า', 'ล้าคู้'],
  // dead syllables in each class
  ['กด', 'หลดกุด'], // mid, dead short → low
  ['ขับ', 'หลับขุบ'], // high, dead short → low
  ['นก', 'ลกนุก'], // low, dead short → high
  ['มาก', 'ลากมูก'], // low, dead long → falling
  ['โต๊ะ', 'โละตุ๊'], // mid + ไม้ตรี, dead short → high
  ['นะ', 'ละนุ'],
  ['ค่ะ', 'ล่ะคุ่'],
  // tone marks on words
  ['ข้าว', 'ล่าวขู้ว'],
  ['ข่าว', 'หล่าวขู่ว'],
  ['ไม้', 'ไล้มู้'],
  ['น้ำ', 'ล้ำนุ้ม'],
  ['ไก่', 'ไหล่กู่'],
  ['ปี่', 'หลี่ปู่'],
  ['เพื่อน', 'เลื่อนพู่น'],
  ['เที่ยว', 'เลี่ยวทู่ว'],
  ['รู้', 'ลู้รู้'],
  ['หมา', 'หลาหมู'],
  ['หมู', 'หลูหมู'],
  ['หนู', 'หลูหนู'],
  ['สวย', 'หลวยสูย'],
  ['สุก', 'หลุกสุก'],
  ['ผม', 'หลมผุม'],
  ['ฉัน', 'หลันฉุน'],
  ['ขอบคุณ', 'หลอบขูบลุณคุณ'],
  // clusters
  ['กรุง', 'ลุงกรุง'],
  ['ปลา', 'ลาปลู'],
  ['ครู', 'ลูครู'],
  ['ความ', 'ลามควูม'],
  ['พระ', 'ละพรุ'],
  ['ตรง', 'ลงตรุง'],
  ['ทราบ', 'ลาบทรูบ'],
  ['อยู่', 'หลู่อยู่'],
  ['อย่า', 'หล่าอยู่'],
  // ล-initial → ซ
  ['ลม', 'ซมลุม'],
  ['ลอง', 'ซองลูง'],
  ['ลูก', 'ซูกลูก'],
  ['ลิง', 'ซิงลุง'],
  ['ลาว', 'ซาวลูว'],
  // silent letters (การันต์)
  ['จันทร์', 'ลันทร์จุน'],
  ['พิมพ์', 'ลิมพ์พุม'],
  ['ศาสตร์', 'หลาสตร์ศูส'],
  ['ฟุตบอล', 'ลุตฟุตลอลบูล'],
  ['ไทย', 'ไลยทู'], // silent ย kept in part 1
  // ambiguous tone: ล-initial can't produce a low tone with ซ → mark kept
  ['หลับ', 'ซับหลุบ'],
  ['หรือ', 'หลือหรู'],
  // mixed text passes through
  ['hello ไป', 'hello ไลปู'],
  ['ไป 123!', 'ไลปู 123!'],
  ['I love กินข้าว.', 'I love ลินกุนล่าวขู้ว.'],
  ['ไป\nมา', 'ไลปู\nลามู'],
  ['OK ไหม', 'OK ไหลหมู'],
  ['กิน-ข้าว', 'ลินกุนล่าวขู้ว'], // "-" forces a split and is consumed
];

describe('Thai → ภาษาลู', () => {
  it.each(cases)('%s → %s', (thai, loo) => expect(enc(thai)).toBe(loo));
});

describe('ภาษาลู → Thai (decode(encode(x)) === x)', () => {
  const skip = new Set(['กิน-ข้าว']);
  it.each(cases.filter(([t]) => !skip.has(t)))('%s', (thai, loo) => expect(dec(loo)).toBe(thai));

  it('every practice word round-trips', () => {
    for (const w of Object.values(WORDS).flat()) expect(dec(enc(w)), w).toBe(w);
  });
});

describe('syllabify / segmentation', () => {
  it('splits common words', () => {
    expect(syllabify('กินข้าวหรือยัง')).toEqual(['กิน', 'ข้าว', 'หรือ', 'ยัง']);
    expect(syllabify('โรงเรียน')).toEqual(['โรง', 'เรียน']);
    expect(syllabify('ประเทศไทย')).toEqual(['ประ', 'เทศ', 'ไทย']);
  });

  it('reports syllables and flags uncertain ones', () => {
    expect(translate('กินข้าว', 'th2loo').syllables).toEqual([
      { text: 'กิน', uncertain: false },
      { text: 'ข้าว', uncertain: false },
    ]);
    // hidden vowel: สวัสดี is split ส|วัส|ดี, and the bare ส is flagged
    expect(translate('สวัสดี', 'th2loo').syllables.some((s) => s.uncertain)).toBe(true);
  });
});

describe('manual chip edits', () => {
  it('merges and splits within a run', () => {
    const { segs } = translate('กินข้าว', 'th2loo');
    const merged = mergeSegs(segs, 0);
    expect(merged.map((g) => g.s)).toEqual(['กินข้าว']);
    expect(splitSeg(merged, 0, 3).map((g) => g.s)).toEqual(['กิน', 'ข้าว']);
    expect(translate('กินข้าว', 'th2loo', splitSeg(merged, 0, 3)).output).toBe('ลินกุนล่าวขู้ว');
  });

  it('does not merge across a space', () => {
    const { segs } = translate('ไป ไป', 'th2loo');
    expect(mergeSegs(segs, 0)).toBe(segs);
  });
});
