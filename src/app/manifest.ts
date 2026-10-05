import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ภาษาลู Translator',
    short_name: 'shh-loo',
    description: 'แปลภาษาไทยเป็นภาษาลู และแปลกลับ แบบสด ๆ ขณะพิมพ์',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF7F1',
    theme_color: '#FFF7F1',
    lang: 'th',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
