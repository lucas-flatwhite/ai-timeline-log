import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lucas-flatwhite.github.io',
  base: '/ai-timeline-log',
  trailingSlash: 'always',
  // CSS를 HTML에 넣는다. WebKit은 모듈 스크립트를 외부 스타일시트보다 먼저 돌릴 수 있어서,
  // 그러면 env.ts가 빈 CSS 토큰을 읽고 판화를 대체 서체로 새긴다 (원본도 한 파일 안의 <style>이었다)
  build: { inlineStylesheets: 'always' },
  // 폰트 조각(unicode-range)을 base64로 CSS에 넣지 않는다. 넣으면 쓰지 않는 글자 범위까지 매번 내려받는다
  vite: { build: { assetsInlineLimit: 0 } },
});
