'use client';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useI18n } from '@/components/I18nProvider';

/** Web Speech API (th-TH). `hasThaiVoice` updates when the browser finishes loading its voice list. */
export function useSpeech() {
  const { t } = useI18n();
  const [supported, setSupported] = useState(false);
  const [hasThaiVoice, setHasThaiVoice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    setSupported(true);
    const update = () => setHasThaiVoice(synth.getVoices().some((v) => v.lang.toLowerCase().replace('_', '-').startsWith('th')));
    update();
    synth.addEventListener?.('voiceschanged', update);
    return () => synth.removeEventListener?.('voiceschanged', update);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!text.trim()) return toast.message(t('t_no_speak'));
      if (!supported) return toast.error(t('speech_off'));
      try {
        if (!hasThaiVoice) toast.message(t('t_no_voice')); // still try: some platforms speak th-TH without listing a voice
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'th-TH';
        u.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch {
        toast.error(t('speech_off'));
      }
    },
    [supported, hasThaiVoice, t],
  );

  return { supported, hasThaiVoice, speak };
}
