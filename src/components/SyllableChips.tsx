'use client';
import { useState } from 'react';
import { Plus, RotateCcw, X } from 'lucide-react';
import { motion } from 'motion/react';
import { fromPair, mergeSegs, splitPoints, splitSeg, toLoo, type Direction, type Seg, type Syllable } from '@/lib/pasaloo';
import { Button } from '@/components/ui/button';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useI18n } from '@/components/I18nProvider';

const TONES = ['mint', 'peach', 'lav'] as const;

interface Props {
  segs: Seg[];
  syllables: Syllable[];
  dir: Direction;
  edited: boolean;
  onChange: (segs: Seg[]) => void;
  onReset: () => void;
}

export function SyllableChips({ segs, syllables, dir, edited, onChange, onReset }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(-1);
  const th2loo = dir === 'th2loo';
  const runPos = new Map<number, number>();
  let thIdx = 0;

  const sameRun = (a?: Seg, b?: Seg) => !!a && !!b && a.th && b.th && a.run === b.run;
  const merge = (i: number, keep: number) => {
    const next = mergeSegs(segs, i);
    if (next !== segs) onChange(next);
    setOpen(keep);
  };

  const chips = segs.map((g, i) => {
    if (!g.th) return /^\s*$/.test(g.s) ? null : <span key={i} className="chip-other">{g.s}</span>;

    const pos = runPos.get(g.run) ?? 0;
    runPos.set(g.run, pos + 1);
    const next = segs[i + 1];
    const prev = segs[i - 1];
    const hasNext = sameRun(g, next);
    const hasPrev = sameRun(g, prev);

    let sub: string;
    let tone: (typeof TONES)[number];
    if (th2loo) {
      sub = toLoo(g.s).join('');
      tone = TONES[thIdx % 3];
    } else {
      tone = TONES[Math.floor(pos / 2) % 3];
      sub = pos % 2 === 0 ? (hasNext ? `= ${fromPair(g.s, next.s)}` : t('pair_missing')) : t('pair_second');
    }
    thIdx++;
    const points = splitPoints(g.s);
    const uncertain = !!syllables[thIdx - 1]?.uncertain;

    return (
      <motion.span key={i} className="chip-wrap" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Popover open={open === i} onOpenChange={(o) => setOpen(o ? i : -1)}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={`chip chip--${tone}`}
              aria-label={t('chip_aria', { s: g.s }) + (uncertain ? ` — ${t('chip_uncertain')}` : '')}
            >
              <span className="chip-main">{g.s}</span>
              <span className="chip-sub">{sub}</span>
              {uncertain && (
                <span className="chip-warn" title={t('chip_uncertain')} aria-hidden>
                  ?
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="muted">{t('adjust')}</span>
              <strong className="adjust-word">{g.s}</strong>
              <span className="spacer" />
              <PopoverClose asChild>
                <Button variant="flat" size="icon" className="border-none" aria-label={t('adjust_close')}>
                  <X aria-hidden />
                </Button>
              </PopoverClose>
            </div>
            <p className="muted !text-sm">{th2loo ? `→ ${toLoo(g.s).join(' · ')}` : t('adjust_loo')}</p>
            {points.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="muted">{t('split_where')}</span>
                <div className="row-wrap">
                  {points.map((k) => (
                    <button
                      key={k}
                      type="button"
                      className="split-opt"
                      onClick={() => {
                        onChange(splitSeg(segs, i, k));
                        setOpen(-1);
                      }}
                    >
                      {g.s.slice(0, k)} <span className="cut">|</span> {g.s.slice(k)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {(hasPrev || hasNext) && (
              <div className="row-wrap">
                {hasPrev && (
                  <Button variant="soft" size="sm" className="border-border" onClick={() => merge(i - 1, i - 1)}>
                    {t('merge_prev')}
                  </Button>
                )}
                {hasNext && (
                  <Button variant="soft" size="sm" className="border-border" onClick={() => merge(i, i)}>
                    {t('merge_next')}
                  </Button>
                )}
              </div>
            )}
            {edited && (
              <Button
                variant="text"
                size="sm"
                onClick={() => {
                  onReset();
                  setOpen(-1);
                }}
              >
                <RotateCcw aria-hidden /> {t('chips_reset')}
              </Button>
            )}
          </PopoverContent>
        </Popover>
        {hasNext && (
          <button type="button" className="merge" aria-label={t('merge_aria', { s: g.s })} title={t('merge_title')} onClick={() => merge(i, -1)}>
            <Plus size={14} aria-hidden />
          </button>
        )}
      </motion.span>
    );
  });

  const any = chips.some(Boolean);

  return (
    <section className="card" aria-labelledby="chips-title">
      <div className="card-head">
        <div>
          <h2 id="chips-title">{t('chips_title')}</h2>
          <p className="muted">{t('chips_hint')}</p>
        </div>
        {edited && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw aria-hidden /> {t('chips_reset')}
          </Button>
        )}
      </div>
      {any ? <div className="chips">{chips}</div> : <p className="empty-line">{t('chips_empty')}</p>}
    </section>
  );
}
