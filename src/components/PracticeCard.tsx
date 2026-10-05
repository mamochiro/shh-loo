'use client';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Eye, Lightbulb, Volume2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { initialOf, translate } from '@/lib/pasaloo';
import { LEVELS, LEVEL_SYLLABLES, WORDS, type Level } from '@/lib/pasaloo/words';
import { useSpeech } from '@/hooks/useSpeech';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/components/I18nProvider';

type Result = '' | 'right' | 'wrong' | 'reveal';

function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let j = n - 1; j > 0; j--) {
    const r = Math.floor(Math.random() * (j + 1));
    [a[j], a[r]] = [a[r], a[j]];
  }
  return a;
}

export function PracticeCard() {
  const { t } = useI18n();
  const speech = useSpeech();
  const [level, setLevel] = useState<Level>('easy');
  const pool = WORDS[LEVEL_SYLLABLES[level]];
  const total = pool.length;

  const [order, setOrder] = useState<number[] | null>(null); // shuffled after mount (Math.random would break hydration)
  const [pos, setPos] = useState(0);
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState<Result>('');
  const [showHint, setShowHint] = useState(false);
  const [counted, setCounted] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [tries, setTries] = useState(0);
  const [streak, setStreak] = useState(0);

  const resetRound = () => {
    setGuess('');
    setResult('');
    setShowHint(false);
    setCounted(false);
    setDone(false);
  };

  useEffect(() => {
    setOrder(shuffled(total));
    setPos(0);
    resetRound();
  }, [level, total]);

  const word = order ? pool[order[pos % total]] : '';
  const { loo, hint } = useMemo(() => {
    if (!word) return { loo: '', hint: '' };
    const syl = translate(word, 'th2loo').segs.filter((g) => g.th);
    return { loo: translate(word, 'th2loo').output, hint: t('pr_hint', { n: syl.length, ini: syl.map((g) => initialOf(g.s)).join(' · ') }) };
  }, [word, t]);

  const countTry = () => {
    if (!counted) {
      setTries((n) => n + 1);
      setCounted(true);
    }
  };

  const check = () => {
    if (done || !word) return;
    const g = guess.replace(/\s+/g, '');
    if (!g) return void toast.message(t('pr_empty'));
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
    if (done || !word) return;
    countTry();
    setResult('reveal');
    setDone(true);
    setStreak(0);
  };

  const next = () => {
    const np = pos + 1;
    if (np % total === 0) setOrder(shuffled(total));
    setPos(np);
    resetRound();
  };

  return (
    <section className="practice-wrap" aria-label={t('pr_label_section')}>
      <div className="card practice">
        <div className="card-head">
          <div>
            <h2 className="h-lg">{t('pr_title')}</h2>
            <p className="muted">{t('pr_sub')}</p>
          </div>
          <div className="row-wrap">
            <span className="badge badge--mint">{t('pr_right', { a: score, b: tries })}</span>
            <span className="badge badge--peach">{t('pr_streak', { n: streak })}</span>
          </div>
        </div>

        <div role="group" aria-label={t('pr_level')} className="levels">
          {LEVELS.map((l) => (
            <button key={l} type="button" className="level" aria-pressed={level === l} onClick={() => setLevel(l)}>
              {t(`lv_${l}`)}
            </button>
          ))}
        </div>

        <div className="word-box">
          <span className="word-count">{order ? t('pr_count', { n: (pos % total) + 1, total }) : ' '}</span>
          <span className="word" aria-live="polite">{loo || ' '}</span>
          <Button
            variant="soft"
            size="sm"
            className="text-ink"
            disabled={!speech.supported || !loo}
            title={speech.supported ? undefined : t('speech_off')}
            onClick={() => speech.speak(loo)}
          >
            <Volume2 aria-hidden /> {t('pr_listen')}
          </Button>
        </div>

        {showHint && <div className="hint">{hint}</div>}

        <div className="field">
          <label htmlFor="guess">{t('pr_answer')}</label>
          <Input
            id="guess"
            value={guess}
            autoComplete="off"
            placeholder={t('pr_ph')}
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

        <div aria-live="polite" className="min-h-[52px]">
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result}
                className={`feedback feedback--${result}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {result === 'right' && t('pr_ok', { w: word })}
                {result === 'wrong' && t('pr_wrong')}
                {result === 'reveal' && t('pr_reveal_fb', { loo, w: word })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="actions">
          <Button size="lg" onClick={check}>
            <Check aria-hidden /> {t('pr_check')}
          </Button>
          <Button variant="ghost" size="lg" onClick={() => setShowHint((h) => !h)}>
            <Lightbulb aria-hidden /> {t('pr_hint_btn')}
          </Button>
          <Button variant="ghost" size="lg" onClick={reveal}>
            <Eye aria-hidden /> {t('pr_reveal')}
          </Button>
          <span className="spacer" />
          <Button variant="mint" size="lg" onClick={next}>
            {t('pr_next')} <ArrowRight aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  );
}
