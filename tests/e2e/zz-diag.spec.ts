/* 임시 진단: 화소 수 비교가 Linux WebKit에서 흔들리지 않는지 본다. 머지 전에 지운다 */
import { test, expect, type Page } from '@playwright/test';
test.use({ viewport: { width: 390, height: 780 } });
test.skip(({ browserName }) => browserName !== 'webkit');
const pixelsOff = (page: Page, a: string, b: string) => page.evaluate(async ([a, b]) => {
  const read = (u: string) => new Promise<ImageData>(ok => { const i = new Image(); i.onload = () => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d')!; g.drawImage(i, 0, 0); ok(g.getImageData(0, 0, i.width, i.height)); }; i.src = u; });
  const [x, y] = [await read(a!), await read(b!)];
  let n = 0; for (let i = 0; i < x.data.length; i += 4) if (x.data[i] !== y.data[i] || x.data[i + 1] !== y.data[i + 1] || x.data[i + 2] !== y.data[i + 2] || x.data[i + 3] !== y.data[i + 3]) n++;
  return n;
}, [a, b]);
for (const path of ['./ko/', './']) for (let i = 0; i < 8; i++) test(`diag ${path} #${i}`, async ({ page }) => {
  await page.clock.install();
  await page.goto(path);
  await expect.poll(async () => { await page.clock.runFor(200); return page.evaluate(() => document.documentElement.dataset.ready); }).toBe('1');
  const cv = page.locator('.cover canvas.cv[data-kind="days"]');
  await expect(cv).toHaveClass(/\bcarved\b/);
  const before = await cv.evaluate((c: HTMLCanvasElement) => c.toDataURL());
  await page.clock.runFor(25_000);
  const after = await cv.evaluate((c: HTMLCanvasElement) => c.toDataURL());
  const off = await pixelsOff(page, before, after);
  console.log(`OFF ${path} ${off} exact=${after === before}`);
  expect(off, `DIAG ${off} pixels`).toBeLessThanOrEqual(50);
});
