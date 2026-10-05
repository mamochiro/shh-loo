import { useMemo, useState } from 'react';
import { PRACTICE_WORDS } from '../data/words';
import { initialOf, tokenize, translate } from '../lib/pasaloo';
import { ArrowIcon, BulbIcon, CheckIcon, EyeIcon, SpeakerIcon } from './Icons';

function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let j = n - 1; j > 0; j--) {
    const r = Math.floor(Math.random() * (j + 1));
    [a[j], a[r]] = [a[r], a[j]];
  }
  return a;
}

type Result = '' | 'right' | 'wrong' | 'reveal';

interface Props {
  onSpeak: (text: string) => void;
  onToast: (msg: string) => void;
}

export function Practice({ onSpeak, onToast }: Props) {
  const total = PRACTICE_WORDS.length;
  const [order, setOrder] = useState(() => shuffled(total));
  const [pos, setPos] = useState(0);
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState<Result>('');
  const [showHint, setShowHint] = useState(false);
  const [counted, setCounted] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [tries, setTries] = useState(0);
  const [streak, setStreak] = useState(0);

  const word = PRACTICE_WORDS[order[pos % total]];
  const loo = useMemo(() => translate(word, 'th2loo'), [word]);
  const hint = useMemo(() => {
    const syl = tokenize(word).filter((g) => g.th);
    return `ใบ้: คำนี้มี ${syl.length} พยางค์ · ท่อนหลังของแต่ละคู่บอกพยัญชนะต้น → ${syl.map((g) => initialOf(g.s)).join(' · ')}`;
  }, [word]);

  const countTry = () => {
    if (!counted) {
      setTries((t) => t + 1);
      setCounted(true);
    }
  };

  const check = () => {
    if (done) return;
    const g = guess.replace(/\s+/g, '');
    if (!g) {
      onToast('พิมพ์คำตอบก่อนนะ');
      return;
    }
    countTry();
    if (g === word) {
      setResult('right');
      setDone(true);
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setResult('wrong');
      setStreak(0);
    }
  };

  const reveal = () => {
    if (done) return;
    countTry();
    setResult('reveal');
    setDone(true);
    setStreak(0);
  };

  const next = () => {
    const np = pos + 1;
    if (np % total === 0) setOrder(shuffled(total));
    setPos(np);
    setGuess('');
    setResult('');
    setShowHint(false);
    setCounted(false);
    setDone(false);
  };

  return (
    <section className="practice-wrap" aria-label="โหมดฝึก">
      <div className="card practice">
        <div className="card-head">
          <div>
            <h2 className="h-lg">ถอดรหัสให้ได้!</h2>
            <p className="muted">อ่านคำภาษาลูข้างล่าง แล้วพิมพ์คำภาษาไทยเดิม</p>
          </div>
          <div className="row-wrap">
            <span className="badge badge--mint">
              ถูก {score}/{tries}
            </span>
            <span className="badge badge--peach">ติดกัน {streak}</span>
          </div>
        </div>

        <div className="word-box">
          <span className="word-count">
            คำที่ {(pos % total) + 1} จาก {total}
          </span>
          <span className="word">{loo}</span>
          <button type="button" className="btn btn--card btn--sm" onClick={() => onSpeak(loo)}>
            <SpeakerIcon size={18} /> ฟังเสียง
          </button>
        </div>

        {showHint && <div className="hint">{hint}</div>}

        <div className="field">
          <label htmlFor="guess">คำตอบของคุณ</label>
          <input
            id="guess"
            className="guess"
            type="text"
            value={guess}
            autoComplete="off"
            placeholder="พิมพ์คำภาษาไทย แล้วกด Enter"
            onChange={(e) => {
              setGuess(e.target.value);
              if (result === 'wrong') setResult('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                check();
              }
            }}
          />
        </div>

        <div aria-live="polite">
          {result === 'right' && <div className="feedback feedback--right">เก่งมาก! ใช่เลย คือคำว่า “{word}”</div>}
          {result === 'wrong' && (
            <div className="feedback feedback--wrong">ยังไม่ใช่นะ ลองดูท่อนหลังของแต่ละคู่ แล้วเดาอีกที</div>
          )}
          {result === 'reveal' && (
            <div className="feedback feedback--reveal">
              เฉลย: {loo} = “{word}”
            </div>
          )}
        </div>

        <div className="actions">
          <button type="button" className="btn btn--primary btn--lg" onClick={check}>
            <CheckIcon size={18} /> ตรวจคำตอบ
          </button>
          <button type="button" className="btn btn--ghost btn--lg" onClick={() => setShowHint((h) => !h)}>
            <BulbIcon size={18} /> ใบ้หน่อย
          </button>
          <button type="button" className="btn btn--ghost btn--lg" onClick={reveal}>
            <EyeIcon size={18} /> เฉลย
          </button>
          <span className="spacer" />
          <button type="button" className="btn btn--mint btn--lg" onClick={next}>
            คำต่อไป <ArrowIcon size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
