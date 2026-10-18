import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lucasflatwhite.com',   // lucasflatwhite.com/ai-timeline-log/ 로 서비스한다 (메인 사이트 Vercel rewrite)
  base: '/ai-timeline-log',
  trailingSlash: 'always',
  // 폰트 조각(unicode-range)을 base64로 CSS에 넣지 않는다. 넣으면 쓰지 않는 글자 범위까지 매번 내려받는다
  vite: { build: { assetsInlineLimit: 0 } },
});
