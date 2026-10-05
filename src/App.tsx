import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { History, type HistoryItem } from './components/History';
import { HowItWorks } from './components/HowItWorks';
import { CloseIcon, CopyIcon, MoonIcon, ShareIcon, SpeakerIcon, SunIcon, SwapIcon } from './components/Icons';
import { Mascot } from './components/Mascot';
import { Practice } from './components/Practice';
import { SyllableChips } from './components/SyllableChips';
import { copyText, shareText, speakThai, storage } from './lib/browser';
import { convert, mergeSegs, splitSeg, tokenize, type Direction, type Seg } from './lib/pasaloo';

type Theme = 'light' | 'dark';
type Tab = 'translate' | 'practice';

const HISTORY_KEY = 'pasaloo:history';
const THEME_KEY = 'pasaloo:theme';
const HISTORY_MAX = 8;
const HISTORY_DELAY_MS = 1400;

function initialTheme(): Theme {
  const saved = storage.get<Theme | null>(THEME_KEY, null);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [text, setText] = useState('กินข้าวหรือยัง');
  const [dir, setDir] = useState<Direction>('th2loo');
  const [editedSegs, setEditedSegs] = useState<Seg[] | null>(null);
  const [selected, setSelected] = useState(-1);
  const [tab, setTab] = useState<Tab>('translate');
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [history, setHistory] = useState<HistoryItem[]>(() => storage.get<HistoryItem[]>(HISTORY_KEY, []));
  const [toast, setToast] = useState('');

  const th2loo = dir === 'th2loo';
  const segs = useMemo(() => editedSegs ?? tokenize(text), [editedSegs, text]);
  const output = useMemo(() => convert(segs, dir), [segs, dir]);
  const hasOutput = output.trim().length > 0;

  // theme → <html data-theme>
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#16131E' : '#FFF7F1');
    storage.set(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => storage.set(HISTORY_KEY, history), [history]);

  // toast
  const toastTimer = useRef<number>();
  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 1800);
  }, []);

  // history: saved after a pause in typing, or on copy / share
  const pushHistory = useCallback(() => {
    const src = text.trim();
    if (!src) return;
    const out = output.trim();
    setHistory((h) => [{ src, out, dir }, ...h.filter((x) => !(x.src === src && x.dir === dir))].slice(0, HISTORY_MAX));
  }, [text, output, dir]);

  useEffect(() => {
    const id = window.setTimeout(pushHistory, HISTORY_DELAY_MS);
    return () => window.clearTimeout(id);
    // only re-arm when the text or direction changes, not on chip edits
  }, [text, dir]);

  const setInput = (value: string, nextDir: Direction = dir) => {
    setText(value);
    setDir(nextDir);
    setEditedSegs(null);
    setSelected(-1);
  };

  const swap = () => setInput(output, th2loo ? 'loo2th' : 'th2loo');

  const speak = (t: string) => {
    if (!t.trim()) return flash('ยังไม่มีข้อความให้อ่านนะ');
    if (!speakThai(t)) flash('อุปกรณ์นี้ยังอ่านออกเสียงไม่ได้');
  };

  const copy = async () => {
    if (!hasOutput) return flash('ยังไม่มีอะไรให้คัดลอกนะ');
    pushHistory();
    flash((await copyText(output)) ? 'คัดลอกแล้ว! ส่งให้เพื่อนได้เลย' : 'คัดลอกไม่ได้ ลองกดค้างที่ข้อความแทนนะ');
  };

  const share = async () => {
    if (!hasOutput) return flash('ยังไม่มีอะไรให้แชร์นะ');
    pushHistory();
    const r = await shareText(output);
    if (r === 'copied') flash('คัดลอกแล้ว! ส่งให้เพื่อนได้เลย');
    if (r === 'failed') flash('แชร์ไม่ได้ ลองกดค้างที่ข้อความแทนนะ');
  };

  const srcLabel = th2loo ? 'ภาษาไทย' : 'ภาษาลู';
  const dstLabel = th2loo ? 'ภาษาลู' : 'ภาษาไทย';
  const swapLabel = th2loo ? 'สลับเป็น ภาษาลู → ภาษาไทย' : 'สลับเป็น ภาษาไทย → ภาษาลู';

  return (
    <div className="wrap">
      <header className="header">
        <div className="brand">
          <Mascot />
          <div>
            <h1 className="title">
              ภาษาลู <span className="title-accent">Translator</span>
            </h1>
            <p className="tagline">ภาษาลับของแก๊งเรา — พิมพ์ปุ๊บ แปลงปั๊บ คนอื่นฟังไม่รู้เรื่อง</p>
          </div>
        </div>
        <div className="header-r">
          <nav className="tabs" aria-label="เลือกโหมด">
            <button type="button" className="tab" aria-pressed={tab === 'translate'} onClick={() => setTab('translate')}>
              แปลภาษา
            </button>
            <button type="button" className="tab" aria-pressed={tab === 'practice'} onClick={() => setTab('practice')}>
              โหมดฝึก
            </button>
          </nav>
          <button
            type="button"
            className="icon-btn icon-btn--lg"
            aria-label={theme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <SunIcon size={22} /> : <MoonIcon size={22} />}
          </button>
        </div>
      </header>

      <main>
        {tab === 'translate' ? (
          <div className="stack">
            <div className="panels">
              <div className="card panel">
                <div className="panel-head">
                  <label htmlFor="src" className={`badge ${th2loo ? 'badge--peach' : 'badge--lav'}`}>
                    {srcLabel}
                  </label>
                  <span className="meta">{text.length} ตัวอักษร</span>
                </div>
                <textarea
                  id="src"
                  className="input"
                  rows={5}
                  value={text}
                  placeholder={th2loo ? 'พิมพ์ภาษาไทยตรงนี้… เช่น กินข้าวหรือยัง' : 'วางภาษาลูตรงนี้… เช่น ลินกุนล้าวขู้ว'}
                  onChange={(e) => setInput(e.target.value)}
                />
                <div className="row-end">
                  <button type="button" className="icon-btn" aria-label="ฟังเสียงข้อความต้นฉบับ" onClick={() => speak(text)}>
                    <SpeakerIcon />
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={() => setInput('')}>
                    <CloseIcon size={18} /> ล้าง
                  </button>
                </div>
              </div>

              <button type="button" className="swap" aria-label={swapLabel} title={swapLabel} onClick={swap}>
                <SwapIcon size={26} strokeWidth={2.4} />
              </button>

              <div className="card panel panel--out">
                <div className="panel-head">
                  <span className={`badge ${th2loo ? 'badge--lav' : 'badge--peach'}`}>{dstLabel}</span>
                  <span className="meta">แปลสดขณะพิมพ์</span>
                </div>
                <div className="out-box">
                  {hasOutput ? (
                    <output htmlFor="src" aria-live="polite" className="out">
                      {output}
                    </output>
                  ) : (
                    <p className="out-empty">คำแปลจะโผล่ตรงนี้… ลองพิมพ์ทางซ้ายดูสิ</p>
                  )}
                </div>
                <div className="row-end">
                  <button type="button" className="icon-btn" aria-label="ฟังเสียงคำแปล" onClick={() => speak(output)}>
                    <SpeakerIcon />
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={share}>
                    <ShareIcon size={18} /> แชร์
                  </button>
                  <button type="button" className="btn btn--primary" onClick={copy}>
                    <CopyIcon size={18} /> คัดลอก
                  </button>
                </div>
              </div>
            </div>

            <SyllableChips
              segs={segs}
              dir={dir}
              selected={selected}
              edited={editedSegs !== null}
              onSelect={setSelected}
              onMerge={(i) => {
                const next = mergeSegs(segs, i);
                if (next !== segs) {
                  setEditedSegs(next);
                  setSelected(i);
                }
              }}
              onSplit={(i, k) => {
                setEditedSegs(splitSeg(segs, i, k));
                setSelected(-1);
              }}
              onReset={() => {
                setEditedSegs(null);
                setSelected(-1);
              }}
            />

            <div className="cols">
              <HowItWorks onTry={(w) => setInput(w, 'th2loo')} />
              <History
                items={history}
                onRestore={(h) => setInput(h.src, h.dir)}
                onClear={() => setHistory([])}
              />
            </div>
          </div>
        ) : (
          <Practice onSpeak={speak} onToast={flash} />
        )}
      </main>

      <footer className="footer">แบ่งพยางค์อัตโนมัติอาจพลาดบ้าง — แตะพยางค์เพื่อแก้ได้เสมอ</footer>

      {toast && (
        <div role="status" className="toast">
          {toast}
        </div>
      )}
    </div>
  );
}
