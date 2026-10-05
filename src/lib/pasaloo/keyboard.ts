/** Thai Kedmanee layout: recover Thai typed while the keyboard was on English ("l;ylfu" → "สวัสดี"). */
const LOWER = "ๅ/-ภถุึคตจขช" + "ๆไำพะัีรนยบลฃ" + "ฟหกดเ้่าสวง" + "ผปแอิืทมใฝ";
const UPPER = '+๑๒๓๔ู฿๕๖๗๘๙' + '๐"ฎฑธํ๊ณฯญฐ,ฅ' + 'ฤฆฏโฌ็๋ษศซ.' + '()ฉฮฺ์?ฒฬฦ';
const KEYS_LOWER = "1234567890-=" + "qwertyuiop[]\\" + "asdfghjkl;'" + 'zxcvbnm,./';
const KEYS_UPPER = '!@#$%^&*()_+' + 'QWERTYUIOP{}|' + 'ASDFGHJKL:"' + 'ZXCVBNM<>?';

const MAP = new Map<string, string>();
[...KEYS_LOWER].forEach((k, i) => MAP.set(k, LOWER[i]!));
[...KEYS_UPPER].forEach((k, i) => MAP.set(k, UPPER[i]!));

const HAS_THAI = /[ก-๛]/;
const WORD_OK = /^[ก-ฮเ-ไ](?:.*[^เ-ไ])?$/; // starts with a consonant / lead vowel, doesn't end on a lead vowel

/** If `text` has no Thai and looks like Thai typed on the wrong layout, return the Thai; otherwise null. */
export function fixKeyboard(text: string): string | null {
  const t = text.trim();
  if (t.length < 3 || HAS_THAI.test(t)) return null;
  const thai = [...t].map((c) => MAP.get(c) ?? c).join('');
  const words = thai.split(/\s+/);
  const ok = words.every((w) => !HAS_THAI.test(w) || (WORD_OK.test(w) && /[ะ-ฺเ-ๅ็]|[ก-ฮ]{2}/.test(w)));
  return ok && HAS_THAI.test(thai) ? thai : null;
}
