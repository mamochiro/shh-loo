import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const alt = 'ภาษาลู Translator';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const FONT_DIR = join(process.cwd(), 'node_modules/@fontsource/noto-sans-thai/files');

export default async function Image() {
  const font = await readFile(join(FONT_DIR, 'noto-sans-thai-thai-600-normal.woff'));
  const latin = await readFile(join(FONT_DIR, 'noto-sans-thai-latin-600-normal.woff'));
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 56,
          background: '#FFF7F1',
          color: '#2A2140',
          fontFamily: 'Noto Thai',
        }}
      >
        <svg width="260" height="260" viewBox="0 0 80 80">
          <circle cx="38" cy="44" r="31" fill="#9FE3C4" />
          <path d="M22 40q5-6 10 0M44 40q5-6 10 0M31 57q7 4 14 0" fill="none" stroke="#2A2140" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="20" cy="50" rx="5" ry="3" fill="#FFB79C" />
          <ellipse cx="56" cy="50" rx="5" ry="3" fill="#FFB79C" />
          <rect x="34" y="44" width="8" height="24" rx="4" fill="#FFC9A8" stroke="#2A2140" strokeWidth="2.5" />
          <path d="M66 22l7-4M68 31h8M66 40l7 4" fill="none" stroke="#9C88F0" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 110, lineHeight: 1.3 }}>
            ภาษาลู <span style={{ color: '#4B36A8', marginLeft: 24 }}>Translator</span>
          </div>
          <div style={{ fontSize: 40, color: '#625A75' }}>กินข้าว → ลินกุนล่าวขู้ว</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Noto Thai', data: font, weight: 600, style: 'normal' },
        { name: 'Noto Thai', data: latin, weight: 600, style: 'normal' },
      ],
    },
  );
}
