import { describe, expect, it } from 'vitest';
import { DICT } from './i18n';
import { translate } from './pasaloo';

describe('English UI', () => {
  it('has every Thai key, none empty, and the same {placeholders}', () => {
    const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
    for (const [k, th] of Object.entries(DICT.th)) {
      const en = (DICT.en as Record<string, string>)[k];
      expect(en, k).toBeTruthy();
      expect(vars(en!), k).toBe(vars(th));
    }
    expect(Object.keys(DICT.en)).toEqual(Object.keys(DICT.th));
  });
});

describe('English text in the engine', () => {
  it.each([
    "Hello, world! It's 2026.",
    'user@example.com https://shh-loo.dev',
    'Line one\nLine two',
  ])('passes %j through unchanged in both directions', (t) => {
    expect(translate(t, 'th2loo').output).toBe(t);
    expect(translate(t, 'loo2th').output).toBe(t);
    expect(translate(t, 'th2loo').syllables).toEqual([]);
  });
});
