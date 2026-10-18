import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const NEW = 'http://localhost:4321/ai-timeline-log/';
const ORIGINAL = 'file://' + resolve('reference/original/index.html');
const VIEWPORTS = [{ width: 390, height: 780 }, { width: 1440, height: 860 }];
/* [이름, 원본 선택자, 새 선택자] — 장면 3개는 첫 장면과 글이 가장 긴 두 장면 */
const SHOTS: [string, string, string][] = [
  ['hero', '#hero', '#hero'],
  ['year-2023', '.yr[data-y="2023"]', '.yr[data-y="2023"]'],
  ['chatgpt', '#p01', '[id="2022-11-chatgpt"]'],
  ['pentagon', '#p23', '[id="2026-02-pentagon"]'],
  ['mythos', '#p24', '[id="2026-04-mythos"]'],
  ['outro', '#outro', '#outro'],
];

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const dir = `.parity/${vp.width}x${vp.height}`;
  mkdirSync(dir, { recursive: true });
  for (const [label, url, pick] of [['original', ORIGINAL, 1], ['new', NEW, 2]] as const) {
    const page = await browser.newPage({ viewport: vp });
    await page.goto(url);
    await page.waitForTimeout(4000);                       // 폰트·표지 찍기 연출
    for (const shot of SHOTS) {
      const sel = shot[pick];
      await page.evaluate((sel) => {
        const el = document.querySelector<HTMLElement>(sel)!;
        const stage = el.querySelector<HTMLElement>('.stage');
        const pinned = !!stage && document.documentElement.classList.contains('pin') && !el.classList.contains('loose');
        scrollTo(0, el.getBoundingClientRect().top + scrollY + (pinned ? (el.offsetHeight - stage!.offsetHeight) * 0.72 : 0));
      }, sel);
      await page.waitForTimeout(shot[0] === 'hero' ? 2000 : 1200);
      await page.screenshot({ path: `${dir}/${shot[0]}-${label}.png` });
    }
    await page.close();
  }
}
await browser.close();
console.log('saved to .parity/');
