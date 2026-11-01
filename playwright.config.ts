import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  /* 브라우저 언어에 따라 첫 화면이 달라진다. 시험은 이 컴퓨터의 언어와 상관없이 영어 브라우저로 돌린다(한국어는 test.use로) */
  use: { baseURL: 'http://localhost:4321/ai-timeline-log/', locale: 'en-US' },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'webkit', use: devices['Desktop Safari'] },   // iOS Safari와 같은 엔진
  ],
  webServer: {
    command: 'npm run build && npx astro preview --port 4321 --ignore-lock',  // --ignore-lock: 에이전트 환경에서도 앞에서 실행
    url: 'http://localhost:4321/ai-timeline-log/',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
