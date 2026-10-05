import { describe, expect, it } from 'vitest';
import { fixKeyboard } from './keyboard';

describe('wrong-keyboard rescue', () => {
  it('recovers สวัสดี', () => expect(fixKeyboard('l;ylfu')).toBe('สวัสดี'));
  it('ignores Thai and short input', () => {
    expect(fixKeyboard('สวัสดี')).toBeNull();
    expect(fixKeyboard('hi')).toBeNull();
  });
  it('rejects common English words that map to junk', () => {
    for (const w of ['hello', 'dog', 'the']) expect(fixKeyboard(w), w).toBeNull();
  });
});
