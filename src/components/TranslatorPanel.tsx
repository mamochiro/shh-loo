'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Copy, Share2, Volume2, X } from 'lucide-react';
import { toast } from 'sonner';
import { fixKeyboard, translate, type Direction, type Seg } from '@/lib/pasaloo';
import { copyText } from '@/lib/browser';
import { useHistory, type HistoryItem } from '@/hooks/useHistory';
import { useSpeech } from '@/hooks/useSpeech';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/components/I18nProvider';
import { HistoryList } from '@/components/HistoryList';
import { HowItWorks } from '@/components/HowItWorks';
import { SwapButton } from '@/components/SwapButton';
import { SyllableChips } from '@/components/SyllableChips';

const DEBOUNCE_MS = 150;
const HISTORY_DELAY_MS = 1400;

export function TranslatorPanel() {
  const { t } = useI18n();
  const params = useSearchParams();
  const speech = useSpeech();
  const history = useHistory();

  const [text, setText] = useState(() => params.get('t') ?? 'กินข้าวหรือยัง');
  const [dir, setDir] = useState<Direction>(() => (params.get('d') === 'loo2th' ? 'loo2th' : 'th2loo'));
  const [edited, setEdited] = useState<Seg[] | null>(null);
  const [debounced, setDebounced] = useState(text);

  const th2loo = dir === 'th2loo';
  const result = useMemo(() => translate(debounced, dir, edited ?? undefined), [debounced, dir, edited]);
  const output = result.output;
  const hasOutput = output.trim().length > 0;
  const noThai = debounced.trim().length > 0 && !/[ก-๛]/.test(debounced) && /[A-Za-z]/.test(debounced);
  const kbFix = noThai ? fixKeyboard(debounced) : null;

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(text), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [text]);

  // history: saved after a pause in typing (also on copy / share)
  const pushHistory = (src = text, d = dir, segs = edited) => {
    const s = src.trim();
    if (s) history.add({ src: s, out: translate(src, d, segs ?? undefined).output.trim(), dir: d });
  };
  const pushRef = useRef(pushHistory);
  pushRef.current = pushHistory;
  useEffect(() => {
    const id = window.setTimeout(() => pushRef.current(), HISTORY_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [text, dir]);

  /** Programmatic input change (swap, restore, example, clear): applied immediately, no debounce. */
  const setInput = (value: string, nextDir: Direction = dir) => {
    setText(value);
    setDebounced(value);
    setDir(nextDir);
    setEdited(null);
  };

  const swap = () => setInput(translate(text, dir, edited ?? undefined).output, th2loo ? 'loo2th' : 'th2loo');

  const copy = async () => {
    if (!hasOutput) return toast.message(t('t_no_copy'));
    pushHistory();
    if (await copyText(output)) toast.success(t('t_copied'));
    else toast.error(t('t_copy_fail'));
  };

  const share = async () => {
    if (!hasOutput) return toast.message(t('t_no_share'));
    pushHistory();
    const url = `${location.origin}${location.pathname}?${new URLSearchParams({ t: text.trim(), d: dir })}`;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'ภาษาลู Translator', text: output, url });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
      }
    }
    if (await copyText(url)) toast.success(t('t_link_copied'));
    else toast.error(t('t_share_fail'));
  };

  const speakBtn = (label: string, value: string) => (
    <Button
      variant="ghost"
      size="icon"
      aria-label={speech.supported ? label : `${label} — ${t('speech_off')}`}
      title={speech.supported ? label : t('speech_off')}
      disabled={!speech.supported || !/[ก-๛]/.test(value)}
      onClick={() => speech.speak(value)}
    >
      <Volume2 aria-hidden />
    </Button>
  );

  const srcLabel = t(th2loo ? 'src_th' : 'src_loo');
  const dstLabel = t(th2loo ? 'src_loo' : 'src_th');
  const restore = (h: HistoryItem) => setInput(h.src, h.dir);

  return (
    <div className="stack">
      <div className="panels">
        <div className="card panel">
          <div className="panel-head">
            <label htmlFor="src" className={`badge ${th2loo ? 'badge--peach' : 'badge--lav'}`}>
              {srcLabel}
            </label>
            <span className="meta">{t('chars', { n: text.length })}</span>
          </div>
          <Textarea
            id="src"
            rows={5}
            value={text}
            placeholder={t(th2loo ? 'ph_th' : 'ph_loo')}
            onChange={(e) => {
              setText(e.target.value);
              setEdited(null);
            }}
          />
          <div className="row-end">
            {speakBtn(t('listen_src'), text)}
            <Button variant="ghost" onClick={() => setInput('')}>
              <X aria-hidden /> {t('clear')}
            </Button>
          </div>
        </div>

        <SwapButton label={t(th2loo ? 'swap_to_loo2th' : 'swap_to_th2loo')} onClick={swap} />

        <div className="card panel panel--out">
          <div className="panel-head">
            <span className={`badge ${th2loo ? 'badge--lav' : 'badge--peach'}`}>{dstLabel}</span>
            <span className="meta">{t('live')}</span>
          </div>
          <div className="out-box">
            <output htmlFor="src" aria-live="polite" className={hasOutput ? 'out' : 'out-empty'}>
              {hasOutput ? output : t('out_empty')}
            </output>
          </div>
          {noThai && (
            <p className="hint" role="status">
              {t('no_thai')}
              {kbFix && (
                <>
                  {' '}
                  {t('kb_suggest')}
                  <button type="button" className="underline font-semibold" onClick={() => setInput(kbFix)}>
                    {kbFix}
                  </button>
                </>
              )}
            </p>
          )}
          <div className="row-end">
            {speakBtn(t('listen_out'), output)}
            <Button variant="ghost" onClick={share}>
              <Share2 aria-hidden /> {t('share')}
            </Button>
            <Button onClick={copy}>
              <Copy aria-hidden /> {t('copy')}
            </Button>
          </div>
        </div>
      </div>

      <SyllableChips segs={result.segs} syllables={result.syllables} dir={dir} edited={edited !== null} onChange={setEdited} onReset={() => setEdited(null)} />

      <div className="cols">
        <HowItWorks onTry={(w) => setInput(w, 'th2loo')} />
        <HistoryList items={history.items} onRestore={restore} onClear={history.clear} />
      </div>
    </div>
  );
}
