'use client';
import { ArrowRight } from 'lucide-react';
import { toLoo, translate } from '@/lib/pasaloo';
import { EXAMPLES } from '@/lib/pasaloo/words';
import { useI18n } from '@/components/I18nProvider';

export function HowItWorks({ onTry }: { onTry: (word: string) => void }) {
  const { t } = useI18n();
  return (
    <section className="card col-how" aria-labelledby="how-title">
      <div>
        <h2 id="how-title">{t('how_title')}</h2>
        <p className="muted mt-1">{t('how_sub')}</p>
      </div>
      <div className="steps">
        <div className="step step--mint"><strong>{t('step1_t')}</strong><span>{t('step1_d')}</span></div>
        <div className="step step--lav"><strong>{t('step2_t')}</strong><span>{t('step2_d')}</span></div>
        <div className="step step--peach"><strong>{t('step3_t')}</strong><span>{t('step3_d')}</span></div>
        <div className="step step--soft"><strong>{t('step4_t')}</strong><span>{t('step4_d')}</span></div>
      </div>
      <div className="examples">
        {EXAMPLES.map((w) => (
          <button key={w} type="button" className="example" aria-label={t('try_aria', { w })} onClick={() => onTry(w)}>
            <span className="example-word">{w}</span>
            <ArrowRight size={20} aria-hidden />
            <span className="pills">
              {translate(w, 'th2loo')
                .segs.filter((g) => g.th)
                .map((g, i) => {
                  const [p1, p2] = toLoo(g.s);
                  return (
                    <span key={i} className="pill-pair">
                      <span className="pill pill--1">{p1}</span>
                      <span className="pill pill--2">{p2}</span>
                    </span>
                  );
                })}
            </span>
            <span className="example-try">{t('try')}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
