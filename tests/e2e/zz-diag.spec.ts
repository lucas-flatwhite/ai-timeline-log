/* 임시 진단: Linux WebKit에서 표지 판이 돌림 뒤 달라지는 이유를 모은다. 머지 전에 지운다 */
import { test, expect } from '@playwright/test';
test.use({ viewport: { width: 390, height: 780 } });
test.skip(({ browserName }) => browserName !== 'webkit');
for (const gated of [false, true]) for (const path of ['./ko/', './']) for (let i = 0; i < 8; i++) test(`diag ${gated ? 'gated' : 'free'} ${path} #${i}`, async ({ page }) => {
  let open!: () => void; const gate = new Promise<void>(r => { open = r; });
  if (gated) await page.route(/black-han-sans-/, async route => { await gate; await route.continue(); });
  else open();
  await page.clock.install();
  await page.addInitScript(() => {
    const w = window as any; w.__f = []; w.__src = [];
    const gid = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function (...a: [number, number, number, number]) {
      const im = gid.apply(this, a);
      let h = 2166136261, ink = 0; for (let i = 0; i < im.data.length; i += 4) { h = Math.imul(h ^ im.data[i], 16777619); if (im.data[i] < 128) ink++; }
      w.__src.push([im.width, im.height, h >>> 0, ink]);
      return im;
    };
    const orig = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (t: string, ...a: [number, number]) {
      if (/^\d,\d{3}/.test(t)) w.__f.push([t, this.font.split('px')[0], Math.round(a[0] * 100) / 100, Math.round(a[1] * 100) / 100, this.canvas.width, this.canvas.height, document.fonts.status, [...document.fonts].filter(f => f.status !== 'unloaded').map(f => f.family + ':' + f.status).join(' ')]);
      return orig.call(this, t, ...a);
    };
  });
  await page.goto(path, { waitUntil: 'domcontentloaded' });
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
  const src = await page.evaluate(() => { const s = (window as any).__src; return s.filter((x: number[]) => x[0] === s[0][0]).map((x: number[]) => x.join('/')); });
  const diff = await page.evaluate(async ([a, b]) => {
    const load = (u: string) => new Promise<ImageData>(r => { const i = new Image(); i.onload = () => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d')!; g.drawImage(i, 0, 0); r(g.getImageData(0, 0, i.width, i.height)); }; i.src = u; });
    const [x, y] = [await load(a), await load(b)];
    let n = 0, max = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let i = 0; i < x.data.length; i++) { const d = Math.abs(x.data[i] - y.data[i]); if (d) { n++; max = Math.max(max, d); const p = i >> 2, px = p % x.width, py = (p / x.width) | 0; x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py); } }
    return { n, max, box: [x0, y0, x1, y1] };
  }, [before.url, after.url]);
  const info = { path, gated, diff, src: [src[0], src.at(-1), src.length], before: { ...before, url: before.url.length }, after: { ...after, url: after.url.length }, f: f.map((r: unknown[]) => r.slice(0, 7)) };
  expect(after.url === before.url, 'DIAG ' + JSON.stringify(info)).toBe(true);
});
