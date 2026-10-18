import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lucas-flatwhite.github.io',
  base: '/ai-timeline-log',
  trailingSlash: 'always',
  // 폰트 조각(unicode-range)을 base64로 CSS에 넣지 않는다. 넣으면 쓰지 않는 글자 범위까지 매번 내려받는다
  vite: { build: { assetsInlineLimit: 0 } },
});
