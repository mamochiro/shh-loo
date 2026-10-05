import { fromPair, splitPoints, toLoo, type Direction, type Seg } from '../lib/pasaloo';
import { CloseIcon, PlusIcon, ResetIcon } from './Icons';

const TONES = ['mint', 'peach', 'lav'] as const;

interface Props {
  segs: Seg[];
  dir: Direction;
  selected: number;
  edited: boolean;
  onSelect: (i: number) => void;
  onMerge: (i: number) => void;
  onSplit: (i: number, k: number) => void;
  onReset: () => void;
}

export function SyllableChips({ segs, dir, selected, edited, onSelect, onMerge, onSplit, onReset }: Props) {
  const th2loo = dir === 'th2loo';
  const runPos = new Map<number, number>();
  let thIdx = 0;

  const chips = segs.map((g, i) => {
    if (!g.th) {
      if (/^\s*$/.test(g.s)) return null;
      return (
        <span key={i} className="chip-other">
          {g.s}
        </span>
      );
    }
    const pos = runPos.get(g.run) ?? 0;
    runPos.set(g.run, pos + 1);
    const next = segs[i + 1];
    const sameRunNext = !!next && next.th && next.run === g.run;

    let sub: string;
    let tone: (typeof TONES)[number];
    if (th2loo) {
      sub = toLoo(g.s).join('');
      tone = TONES[thIdx % 3];
    } else {
      tone = TONES[Math.floor(pos / 2) % 3];
      sub = pos % 2 === 0 ? (sameRunNext ? `= ${fromPair(g.s, next.s)}` : 'ขาดคู่') : 'ท่อนหลัง';
    }
    thIdx++;
    const isSel = selected === i;

    return (
      <span key={i} className="chip-wrap">
        <button
          type="button"
          className={`chip chip--${tone}`}
          aria-pressed={isSel}
          aria-label={`พยางค์ ${g.s} แตะเพื่อแก้`}
          onClick={() => onSelect(isSel ? -1 : i)}
        >
          <span className="chip-main">{g.s}</span>
          <span className="chip-sub">{sub}</span>
        </button>
        {sameRunNext && (
          <button
            type="button"
            className="merge"
            aria-label={`รวม ${g.s} กับพยางค์ถัดไป`}
            title="รวมกับพยางค์ถัดไป"
            onClick={() => onMerge(i)}
          >
            <PlusIcon size={14} />
          </button>
        )}
      </span>
    );
  });

  const sel = selected >= 0 && segs[selected]?.th ? segs[selected] : null;
  const prev = sel ? segs[selected - 1] : undefined;
  const next = sel ? segs[selected + 1] : undefined;
  const canPrev = !!sel && !!prev && prev.th && prev.run === sel.run;
  const canNext = !!sel && !!next && next.th && next.run === sel.run;
  const visible = chips.filter(Boolean);

  return (
    <section className="card" aria-labelledby="chips-title">
      <div className="card-head">
        <div>
          <h2 id="chips-title">แบ่งพยางค์</h2>
          <p className="muted">แตะพยางค์เพื่อแยกใหม่ หรือกด + เพื่อรวมสองพยางค์ที่ถูกแบ่งผิด</p>
        </div>
        {edited && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={onReset}>
            <ResetIcon size={18} /> แบ่งอัตโนมัติใหม่
          </button>
        )}
      </div>

      {visible.length ? (
        <div className="chips">{chips}</div>
      ) : (
        <p className="empty-line">ยังไม่มีพยางค์ให้ดู พิมพ์ข้อความภาษาไทยก่อนนะ</p>
      )}

      {sel && (
        <div className="adjust">
          <div className="adjust-head">
            <span className="muted">แก้พยางค์</span>
            <strong className="adjust-word">{sel.s}</strong>
            <span className="muted">
              {th2loo ? `→ ${toLoo(sel.s).join(' · ')}` : 'ในภาษาลู พยางค์จะจับคู่กันทีละสอง'}
            </span>
            <span className="spacer" />
            <button type="button" className="icon-btn icon-btn--flat" aria-label="ปิดแผงแก้พยางค์" onClick={() => onSelect(-1)}>
              <CloseIcon size={18} />
            </button>
          </div>
          {splitPoints(sel.s).length > 0 && (
            <div className="adjust-group">
              <span className="muted">แยกตรงไหนดี?</span>
              <div className="row-wrap">
                {splitPoints(sel.s).map((k) => (
                  <button key={k} type="button" className="split-opt" onClick={() => onSplit(selected, k)}>
                    {sel.s.slice(0, k)} <span className="cut">|</span> {sel.s.slice(k)}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="row-wrap">
            {canPrev && (
              <button type="button" className="btn btn--soft btn--sm" onClick={() => onMerge(selected - 1)}>
                รวมกับพยางค์ก่อนหน้า
              </button>
            )}
            {canNext && (
              <button type="button" className="btn btn--soft btn--sm" onClick={() => onMerge(selected)}>
                รวมกับพยางค์ถัดไป
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
