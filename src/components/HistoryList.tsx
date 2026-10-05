'use client';
import { Clock } from 'lucide-react';
import type { HistoryItem } from '@/hooks/useHistory';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/I18nProvider';

interface Props {
  items: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onClear: () => void;
}

export function HistoryList({ items, onRestore, onClear }: Props) {
  const { t } = useI18n();
  return (
    <section className="card col-hist" aria-labelledby="hist-title">
      <div className="card-head card-head--center">
        <h2 id="hist-title" className="with-icon">
          <Clock size={22} aria-hidden /> {t('hist_title')}
        </h2>
        {items.length > 0 && (
          <Button variant="text" size="sm" onClick={onClear}>
            {t('hist_clear')}
          </Button>
        )}
      </div>
      {items.length ? (
        <ul className="hist-list">
          {items.map((h) => (
            <li key={`${h.dir}:${h.src}`}>
              <button type="button" className="hist-item" onClick={() => onRestore(h)}>
                <span className={`badge badge--sm ${h.dir === 'th2loo' ? 'badge--peach' : 'badge--lav'}`}>
                  {h.dir === 'th2loo' ? t('hist_th2loo') : t('hist_loo2th')}
                </span>
                <span className="hist-src">{h.src}</span>
                <span className="hist-out">{h.out}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">
          <strong>{t('hist_empty_t')}</strong>
          <span className="muted">{t('hist_empty_d')}</span>
        </div>
      )}
    </section>
  );
}
