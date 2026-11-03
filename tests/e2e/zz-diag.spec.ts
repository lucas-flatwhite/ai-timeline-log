/* 임시 진단: Linux WebKit에서 표지 판이 돌림 뒤 달라지는 이유를 모은다. 머지 전에 지운다 */
import { test, expect } from '@playwright/test';
test.use({ viewport: { width: 390, height: 780 } });
for (const gated of [false, true]) for (const path of ['./ko/', './']) for (let i = 0; i < 8; i++) test(`diag ${gated ? 'gated' : 'free'} ${path} #${i}`, async ({ page }) => {
  let open!: () => void; const gate = new Promise<void>(r => { open = r; });
  if (gated) await page.route(/black-han-sans-/, async route => { await gate; await route.continue(); });
  else open();
  await page.clock.install();
  await page.addInitScript(() => {
    const w = window as any; w.__f = [];
    const orig = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (t: string, ...a: [number, number]) {
      if (/^\d,\d{3}/.test(t)) w.__f.push([t, this.font.split('px')[0], Math.round(a[0] * 100) / 100, Math.round(a[1] * 100) / 100, this.canvas.width, this.canvas.height, document.fonts.status, [...document.fonts].filter(f => f.status !== 'unloaded').map(f => f.family + ':' + f.status).join(' ')]);
      return orig.call(this, t, ...a);
    };
  });
  await page.goto(path);
  await expect.poll(async () => { await page.clock.runFor(200); return page.evaluate(() => document.documentElement.dataset.ready); }).toBe('1');
  const cv = page.locator('.cover canvas.cv[data-kind="days"]');
  await expect(cv).toHaveClass(/\bcarved\b/);
  const snap = () => cv.evaluate((c: HTMLCanvasElement) => ({ url: c.toDataURL(), w: c.width, h: c.height, cw: c.clientWidth, ch: c.clientHeight, sw: c.style.width, dpr: devicePixelRatio, t: performance.now() }));
  const before = await snap();
  open();
  if (gated) { await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(500); }
  await page.clock.runFor(25_000);
  const after = await snap();
  const f = await page.evaluate(() => (window as any).__f);
  const info = { path, gated, before: { ...before, url: before.url.length }, after: { ...after, url: after.url.length }, f };
  expect(after.url === before.url, 'DIAG ' + JSON.stringify(info)).toBe(true);
});
