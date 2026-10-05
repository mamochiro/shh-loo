import type { Direction } from '../lib/pasaloo';
import { ClockIcon } from './Icons';

export interface HistoryItem {
  src: string;
  out: string;
  dir: Direction;
}

interface Props {
  items: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onClear: () => void;
}

export function History({ items, onRestore, onClear }: Props) {
  return (
    <section className="card col-hist" aria-labelledby="hist-title">
      <div className="card-head card-head--center">
        <h2 id="hist-title" className="with-icon">
          <ClockIcon size={22} /> ประวัติล่าสุด
        </h2>
        {items.length > 0 && (
          <button type="button" className="btn btn--text btn--sm" onClick={onClear}>
            ล้างประวัติ
          </button>
        )}
      </div>
      {items.length ? (
        <ul className="hist-list">
          {items.map((h) => (
            <li key={`${h.dir}:${h.src}`}>
              <button type="button" className="hist-item" onClick={() => onRestore(h)}>
                <span className={`badge badge--sm ${h.dir === 'th2loo' ? 'badge--peach' : 'badge--lav'}`}>
                  {h.dir === 'th2loo' ? 'ไทย → ลู' : 'ลู → ไทย'}
                </span>
                <span className="hist-src">{h.src}</span>
                <span className="hist-out">{h.out}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">
          <strong>ยังไม่มีประวัติ</strong>
          <span className="muted">คำที่แปลจะถูกเก็บไว้ตรงนี้ แตะเพื่อเรียกกลับมาได้</span>
        </div>
      )}
    </section>
  );
}
