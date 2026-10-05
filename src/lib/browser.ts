/** Thin wrappers around browser APIs that may be missing or blocked. Each resolves to success/failure. */

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Uses the native share sheet when available, otherwise copies. Returns 'shared' | 'copied' | 'failed'. */
export async function shareText(text: string): Promise<'shared' | 'copied' | 'failed' | 'cancelled'> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: 'ภาษาลู Translator', text });
      return 'shared';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
    }
  }
  return (await copyText(text)) ? 'copied' : 'failed';
}

export function speakThai(text: string): boolean {
  try {
    if (!('speechSynthesis' in window)) return false;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'th-TH';
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

/** localStorage that never throws (private mode, blocked storage). */
export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
};
