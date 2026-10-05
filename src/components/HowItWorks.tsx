import { EXAMPLES } from '../data/words';
import { toLoo, tokenize } from '../lib/pasaloo';
import { ArrowIcon } from './Icons';

export function HowItWorks({ onTry }: { onTry: (word: string) => void }) {
  return (
    <section className="card col-how" aria-labelledby="how-title">
      <h2 id="how-title">ภาษาลูทำงานยังไง?</h2>
      <div className="steps">
        <div className="step step--mint">
          <strong>ท่อนแรก</strong>
          <span>เปลี่ยนพยัญชนะต้นเป็น ล สระ ตัวสะกด วรรณยุกต์เหมือนเดิม</span>
        </div>
        <div className="step step--lav">
          <strong>ท่อนหลัง</strong>
          <span>ใช้พยัญชนะต้นเดิม + สระอู (เสียงสั้นใช้ อุ) ตัวสะกดและวรรณยุกต์เหมือนเดิม</span>
        </div>
        <div className="step step--peach">
          <strong>ขึ้นต้นด้วย ร หรือ ล?</strong>
          <span>ท่อนแรกใช้ ซ แทน ล เช่น รัก → ซักรุก, ลม → ซมลุม</span>
        </div>
        <div className="step step--soft">
          <strong>มีสระอุ / อู อยู่แล้ว?</strong>
          <span>ท่อนแรกใช้ หล (ถ้าขึ้นต้นด้วย ร/ล ใช้ ซ) ท่อนหลังใช้ อี (สั้นใช้ อิ) เช่น หมู → หลูหมี, รู้ → ซู้รี้</span>
        </div>
      </div>
      <div className="examples">
        {EXAMPLES.map((w) => (
          <button key={w} type="button" className="example" aria-label={`ลองแปลคำว่า ${w}`} onClick={() => onTry(w)}>
            <span className="example-word">{w}</span>
            <ArrowIcon />
            <span className="pills">
              {tokenize(w)
                .filter((g) => g.th)
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
            <span className="example-try">ลองเลย</span>
          </button>
        ))}
      </div>
    </section>
  );
}
