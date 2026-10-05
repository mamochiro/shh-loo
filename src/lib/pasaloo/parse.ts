/** Character classes + syllable parsing. Pure TS, no React/DOM. */

const KARAN = '์';
const CL_R = 'กขคตปผพบทดฟ'; // can take ร/ล as 2nd cluster consonant
const CL_W = 'กขค'; // can take ว as 2nd cluster consonant
const SONOR = 'งญนมยรลว'; // can follow a leading ห

type Ch = string | undefined;

export const isConsonant = (c: Ch): boolean => !!c && c >= 'ก' && c <= 'ฮ';
export const isLeadVowel = (c: Ch): boolean => !!c && c >= 'เ' && c <= 'ไ';
export const isTone = (c: Ch): boolean => !!c && c >= '่' && c <= '๋';
export const isVowelMark = (c: Ch): boolean =>
  !!c && (c === 'ะ' || c === 'ั' || (c >= 'า' && c <= 'ฺ') || c === 'ๅ' || c === '็' || c === 'ํ');
export const isAttached = (c: Ch): boolean => isVowelMark(c) || isTone(c) || c === KARAN;
export { KARAN };

/** Does s[i] + s[i+1] form an initial cluster (กร, ปล, คว, หม, อย …)? */
export function clusterAt(s: string, i: number, lead: string): boolean {
  const [c0, c1, c2, c3] = [s[i], s[i + 1], s[i + 2], s[i + 3]];
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

export interface Parsed {
  /** text before the initial (the leading vowel เ แ โ ไ ใ) */
  before: string;
  lead: string;
  /** initial consonant or cluster: ก, กร, ปล, คว, หม, อย */
  initial: string;
  /** everything after the initial with tone marks removed (vowel, final, silent letters) */
  rest: string;
  /** tone mark ่ ้ ๊ ๋ or '' */
  tone: string;
  /** vowel marks + vowel-letter components (อ, ย, ว) */
  vm: string;
  /** the sounded final consonant, '' if open */
  fin: string;
  /** consonant only, no vowel, no final: the ส in ส|วัส|ดี (implicit อะ) */
  bare: boolean;
  /** initial was glued together from loose consonants (user-merged chips) — splitter is guessing */
  odd: boolean;
}

/** Parse one syllable. Returns null when it has no consonant. */
export function parseSyllable(str: string): Parsed | null {
  const n = str.length;
  let i = 0;
  let lead = '';
  if (isLeadVowel(str[0])) { lead = str[0]!; i = 1; }
  while (i < n && !isConsonant(str[i])) i++;
  if (i >= n) return null;
  const a = i;
  let b = i + 1;
  if (clusterAt(str, a, lead)) b++;
  // consonants sitting before the first vowel mark join the initial (user-merged chips like สวัส)
  let odd = false;
  let k = b;
  while (k < n && isConsonant(str[k])) k++;
  if (k > b && k < n && isVowelMark(str[k])) { b = k; odd = true; }

  let tone = '';
  let vm = '';
  const fins: string[] = [];
  for (let j = b; j < n; j++) {
    const c = str[j]!;
    if (isTone(c)) { if (!tone) tone = c; continue; }
    if (c === KARAN) continue;
    if (isVowelMark(c)) { vm += c; continue; }
    if (!isConsonant(c)) continue;
    if (str[j + 1] === KARAN) { j++; continue; } // silent letter
    if (fins.length && isConsonant(str[j + 1]) && str[j + 2] === KARAN) { j += 2; continue; } // silent pair: ทร์
    if (!fins.length) {
      if (c === 'อ' && !vm.includes('อ') && (vm === '' || vm === 'ื')) { vm += c; continue; }
      if (c === 'ย' && lead === 'เ' && vm.includes('ี') && !vm.includes('ย')) { vm += c; continue; }
      if (c === 'ว' && !vm.includes('ว') && (vm === 'ั' || (vm === '' && !lead && isConsonant(str[j + 1])))) {
        vm += c; continue;
      }
    }
    fins.push(c);
  }
  const fin = lead === 'ไ' || lead === 'ใ' ? '' : fins[0] ?? '';
  return {
    before: str.slice(0, a),
    lead,
    initial: str.slice(a, b),
    rest: str.slice(b).replace(/[่-๋]/g, ''),
    tone,
    vm,
    fin,
    bare: !lead && !vm && !fin,
    odd,
  };
}

/** Rebuild a syllable: the tone mark sits after any upper/lower vowel marks that follow the initial. */
export function compose(before: string, initial: string, rest: string, tone: string): string {
  const n = /^[ัิ-ฺ็ํ]*/.exec(rest)![0].length;
  return before + initial + rest.slice(0, n) + tone + rest.slice(n);
}

/** The splitter / parser is guessing about this syllable. */
export const isUncertain = (syl: string): boolean => {
  const p = parseSyllable(syl);
  return !p || p.bare || p.odd;
};
