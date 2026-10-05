/** Draws a 1080×1350 share card (source → translation) on a canvas and returns it as a PNG. Browser only. */

interface Card {
  src: string;
  out: string;
  srcLabel: string;
  dstLabel: string;
}

const W = 1080;
const H = 1350;
const PAD = 64;

const chunks = (text: string): string[] => {
  try {
    return Array.from(new Intl.Segmenter('th', { granularity: 'word' }).segment(text), (s) => s.segment);
  } catch {
    return [...text];
  }
};

/** Wrap on word boundaries (hard-breaking words that are too wide by themselves). */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const piece of chunks(para)) {
      if (ctx.measureText(line + piece).width <= maxW) { line += piece; continue; }
      if (line.trim()) lines.push(line.trim());
      line = '';
      for (const ch of piece) {
        if (ctx.measureText(line + ch).width > maxW && line) { lines.push(line); line = ''; }
        line += ch;
      }
    }
    lines.push(line.trim());
  }
  return lines;
}

/** Biggest font size (≤ max) whose wrapped text fits the box; at min size the text is cut with …  */
function fit(ctx: CanvasRenderingContext2D, family: string, text: string, w: number, h: number, max: number, min: number) {
  for (let size = max; size >= min; size -= 4) {
    ctx.font = `600 ${size}px ${family}`;
    const lines = wrap(ctx, text, w);
    if (lines.length * size * 1.4 <= h) return { size, lines };
  }
  ctx.font = `600 ${min}px ${family}`;
  const rows = Math.max(1, Math.floor(h / (min * 1.4)));
  const lines = wrap(ctx, text, w).slice(0, rows);
  lines[rows - 1] = (lines[rows - 1] ?? '').replace(/.?$/, '…');
  return { size: min, lines };
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

export async function renderShareCard({ src, out, srcLabel, dstLabel }: Card): Promise<Blob> {
  const family = getComputedStyle(document.body).fontFamily;
  await Promise.all([document.fonts.load(`600 48px ${family}`, src + out + srcLabel + dstLabel), document.fonts.ready]);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.textBaseline = 'top';

  ctx.fillStyle = '#FFF7F1';
  ctx.fillRect(0, 0, W, H);

  // header: mascot + name
  try {
    ctx.drawImage(await loadImage('/favicon.svg'), PAD, 56, 120, 120);
  } catch { /* mascot is decoration only */ }
  ctx.fillStyle = '#2A2140';
  ctx.font = `600 56px ${family}`;
  ctx.fillText('ภาษาลู', PAD + 144, 70);
  ctx.fillStyle = '#4B36A8';
  ctx.font = `600 40px ${family}`;
  ctx.fillText('shh-loo 🤫', PAD + 144, 138);

  const block = (y: number, h: number, bg: string, labelBg: string, labelInk: string, label: string, text: string, ink: string, maxSize: number) => {
    roundRect(ctx, PAD, y, W - PAD * 2, h, 48, bg);
    ctx.font = `600 34px ${family}`;
    const lw = ctx.measureText(label).width + 56;
    roundRect(ctx, PAD + 40, y + 40, lw, 60, 30, labelBg);
    ctx.fillStyle = labelInk;
    ctx.fillText(label, PAD + 68, y + 52);
    const boxW = W - PAD * 2 - 80;
    const boxH = h - 160;
    const { size, lines } = fit(ctx, family, text, boxW, boxH, maxSize, 36);
    ctx.fillStyle = ink;
    lines.forEach((l, i) => ctx.fillText(l, PAD + 40, y + 124 + i * size * 1.4));
  };

  block(230, 400, '#FFDCCB', '#FFFFFF', '#8F361A', srcLabel, src, '#2A2140', 72);
  // arrow
  roundRect(ctx, W / 2 - 36, 616, 72, 72, 36, '#4B36A8');
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(W / 2, 636);
  ctx.lineTo(W / 2, 668);
  ctx.moveTo(W / 2 - 14, 654);
  ctx.lineTo(W / 2, 668);
  ctx.lineTo(W / 2 + 14, 654);
  ctx.stroke();
  block(660, 520, '#E3DBFF', '#FFFFFF', '#4B36A8', dstLabel, out, '#2A2140', 84);

  ctx.fillStyle = '#625A75';
  ctx.font = `500 32px ${family}`;
  ctx.textAlign = 'center';
  ctx.fillText(location.host, W / 2, H - 100);

  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png'));
}
