import { test, expect, type Page } from '@playwright/test';

const ready = (page: Page, timeout = 15_000) => page.waitForFunction(() => document.documentElement.dataset.ready === '1', null, { timeout });
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  return errors;
}
/* 지금 화면 안에 있는 상자(.off 제외)와 새겨졌는지, 캔버스가 상자 크기를 그대로 덮는지 */
const firstScreen = (page: Page) => page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.box:not(.off)')]
  .filter(b => { const r = b.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; })
  .map(b => {
    const r = b.getBoundingClientRect(), c = b.querySelector('canvas')!.getBoundingClientRect();
    return { addr: b.dataset.addr, carved: b.classList.contains('carved'), fits: Math.abs(c.width - r.width) < 0.5 && Math.abs(c.height - r.height) < 0.5 };
  }));
/* IntersectionObserver가 모든 상자를 보도록 한 화면씩 내려간다 */
const scrollThrough = (page: Page) => page.evaluate(async () => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) {
    scrollTo(0, y);
    await new Promise(r => setTimeout(r, 60));
  }
  scrollTo(0, document.documentElement.scrollHeight);
});

for (const vp of [{ width: 390, height: 780 }, { width: 1440, height: 860 }]) {
  test.describe(`${vp.width}x${vp.height}`, () => {
    test.use({ viewport: vp });

    test('first screen boxes are carved after ready', async ({ page }) => {
      await page.goto('./');
      await ready(page);
      const boxes = await firstScreen(page);
      expect(boxes.length).toBeGreaterThan(0);
      expect(boxes.filter(b => !b.carved)).toEqual([]);
      expect(boxes.filter(b => !b.fits)).toEqual([]);
      await expect(page.locator('.cover canvas.cv')).toHaveClass(/\bcarved\b/);
      await expect(page.locator('.cover .g')).toBeHidden();
      // 칼선은 기기 화소로 새긴다
      const px = await page.locator('.cover canvas.cv').evaluate((c: HTMLCanvasElement) => [c.width, c.height, c.clientWidth, c.clientHeight]);
      expect(px[0]).toBe(Math.round(px[2] * Math.min(await page.evaluate(() => devicePixelRatio), 2)));
    });

    test('scrolling to the bottom carves every box', async ({ page }) => {
      await page.goto('./');
      await ready(page);
      // 처음부터 다 새기지는 않는다(1440px에서는 벽 전체가 화면 + 300px 안에 들어 다 새긴다)
      if (vp.width < 800) expect(await page.locator('.box:not(.off):not(.carved)').count()).toBeGreaterThan(0);
      await scrollThrough(page);
      await page.waitForTimeout(1000);
      await expect(page.locator('.box:not(.off):not(.carved)')).toHaveCount(0);
    });

    test('no console errors, no horizontal scroll', async ({ page }) => {
      const errors = watchErrors(page);
      await page.goto('./');
      await ready(page);
      await scrollThrough(page);
      await page.waitForTimeout(500);
      expect(errors).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    });
  });
}

test.describe('plate font', () => {
  test.use({ viewport: { width: 390, height: 780 } });

  test('waits for the plate font', async ({ page }) => {
    // WebKit은 모듈 스크립트를 스타일시트보다 먼저 돌릴 수 있다 → 토큰이 비면 대체 서체로 새긴다
    await page.addInitScript(() => {
      const w = window as unknown as { __fonts: string[] };
      w.__fonts = [];
      const orig = FontFaceSet.prototype.load;
      FontFaceSet.prototype.load = function (font: string, text?: string) { w.__fonts.push(font); return orig.call(this, font, text); };
    });
    await page.route(/_astro\/.*\.css$/, async r => { await new Promise(res => setTimeout(res, 800)); await r.continue(); });  // 경쟁을 매번 재현
    await page.goto('./');
    await ready(page);
    const fonts = await page.evaluate(() => (window as unknown as { __fonts: string[] }).__fonts);
    expect(fonts[0]).toContain('PlateL');
    expect(fonts[0]).toContain('PlateK');
    expect(fonts[0]).not.toContain('Black Han Sans');   // 대체 서체의 조각까지 받고 기다리지 않는다
    // 새기기 시작할 때 판 글꼴이 이미 와 있다
    const faces = await page.evaluate(() => [...document.fonts].filter(f => f.family.startsWith('Plate')).map(f => `${f.family}:${f.status}`));
    expect(faces.sort()).toEqual(['PlateK:loaded', 'PlateL:loaded']);
  });

  test('fonts that never arrive fall back after 3.5s', async ({ page }) => {
    const errors = watchErrors(page);
    await page.route('**/plate/**', () => { /* 응답하지 않음 */ });
    const t0 = Date.now();
    await page.goto('./', { waitUntil: 'domcontentloaded' });
    await ready(page, 6000);
    const took = Date.now() - t0;
    expect(took).toBeGreaterThan(3000);
    expect(took).toBeLessThan(6000);
    const boxes = await firstScreen(page);
    expect(boxes.length).toBeGreaterThan(0);
    expect(boxes.filter(b => !b.carved)).toEqual([]);
    await expect(page.locator('.cover canvas.cv')).toHaveClass(/\bcarved\b/);
    expect(errors).toEqual([]);
  });
});

test.describe('live day count', () => {
  test.use({ viewport: { width: 390, height: 780 } });

  test('the cover shows today\'s day count', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-12-01T12:00:00'));   // 2022-11-30 → 2026-12-01 = 1,462일
    // 판에 실제로 새긴 글자를 기록한다: 다시 채운 값으로 새겨야 한다
    await page.addInitScript(() => {
      const w = window as unknown as { __drawn: string[] };
      w.__drawn = [];
      const orig = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function (t: string, ...a: [number, number]) { w.__drawn.push(t); return orig.call(this, t, ...a); };
    });
    await page.goto('./');
    await ready(page);
    const cv = page.locator('.cover canvas.cv[data-kind="days"]');
    await expect(cv).toHaveAttribute('data-glyph', '1,462일');
    await expect(cv).toHaveAttribute('aria-label', '1,462일');
    await expect(cv).toHaveClass(/\bcarved\b/);
    await expect(page.locator('.cover .g')).toHaveText('1,462일');
    await expect(page.locator('#outroH')).toHaveText('1,462일 동안 바뀐 것');
    // 장면 핵심어에도 '19일' 같은 글자가 있으니 네 자리 일수만 본다. 빌드한 날의 일수로 새긴 적이 없어야 한다
    const days = (await page.evaluate(() => (window as unknown as { __drawn: string[] }).__drawn)).filter(t => /^\d,\d{3}일$/.test(t));
    expect(days).toEqual(['1,462일']);
  });
});

test.describe('picture boxes', () => {
  test.use({ viewport: { width: 390, height: 780 } });

  test('a picture box carves its outline', async ({ page }) => {
    // 칠한 윤곽선을 기록한다: 그림 이름이 없으면 그림 없이 조용히 새기므로 .carved만으로는 모자란다
    await page.addInitScript(() => {
      const w = window as unknown as { __paths: string[] };
      w.__paths = [];
      const P = window.Path2D;
      window.Path2D = class extends P { constructor(d?: string | Path2D) { super(d as string); if (typeof d === 'string') w.__paths.push(d); } };
    });
    await page.goto('./');
    await ready(page);
    const names = await page.evaluate(() => {
      const pics = JSON.parse(document.getElementById('pics')!.textContent!);
      return [...document.querySelectorAll<HTMLElement>('.box[data-pic]')].map(b => [b.dataset.pic!, b.dataset.pic! in pics]);
    });
    expect(names.length).toBeGreaterThanOrEqual(10);
    expect(names.filter(([, known]) => !known)).toEqual([]);
    const box = page.locator('.box[data-pic]').first();
    await box.scrollIntoViewIfNeeded();
    await expect(box).toHaveClass(/\bcarved\b/);
    const d = await page.evaluate(n => JSON.parse(document.getElementById('pics')!.textContent!)[n!].d, await box.getAttribute('data-pic'));
    expect(await page.evaluate(() => (window as unknown as { __paths: string[] }).__paths)).toContain(d);
  });
});
