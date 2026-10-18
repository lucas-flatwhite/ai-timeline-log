import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  use: { baseURL: 'http://localhost:4321/ai-timeline-log/' },
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
