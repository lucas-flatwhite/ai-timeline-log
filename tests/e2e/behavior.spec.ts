import { test, expect, type Page } from '@playwright/test';

const ready = (page: Page) => page.waitForFunction(() => document.documentElement.dataset.ready === '1', null, { timeout: 15_000 });
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => {
    // 미리보기 서버에는 favicon이 없다(원본도 없음). 그 404만 무시한다
    if (m.type() === 'error' && !m.location().url.includes('favicon')) errors.push(`console: ${m.text()}`);
  });
  return errors;
}
async function pinnedPoint(page: Page, id: string) {
  await page.evaluate((id) => {
    const el = document.getElementById(id)!;
    const stage = el.querySelector<HTMLElement>('.stage')!;
    const pinned = document.documentElement.classList.contains('pin') && !el.classList.contains('loose');
    scrollTo(0, el.getBoundingClientRect().top + scrollY + (pinned ? (el.offsetHeight - stage.offsetHeight) * 0.72 : 0));
  }, id);
}

for (const vp of [{ width: 390, height: 780 }, { width: 1440, height: 860 }]) {
  test.describe(`${vp.width}x${vp.height}`, () => {
    test.use({ viewport: vp });

    test('no errors while scrolling the whole page; prints get carved', async ({ page }) => {
      const errors = watchErrors(page);
      await page.goto('./');
      await ready(page);
      await pinnedPoint(page, '2025-01-deepseek');
      await page.waitForTimeout(800);
      expect(await page.locator('[id="2025-01-deepseek"] canvas.print').evaluate((c: HTMLCanvasElement) => c.width)).toBeGreaterThan(0);
      expect(await page.locator('#nums').evaluate((c: HTMLCanvasElement) => c.width)).toBe(0); // 표지에서 멀어지면 해제
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) {
          scrollTo(0, y);
          await new Promise(r => setTimeout(r, 25));
        }
      });
      expect(errors).toEqual([]);
    });

    test('pinned plates fit the screen (or fall back to loose)', async ({ page }) => {
      await page.goto('./');
      await ready(page);
      const r = await page.evaluate(() => {
        const out = { clipped: [] as string[], dense: [] as string[], loose: [] as string[] };
        for (const el of document.querySelectorAll<HTMLElement>('.ch')) {
          if (el.classList.contains('dense')) out.dense.push(el.id);
          if (el.classList.contains('loose')) { out.loose.push(el.id); continue; }
          const stage = el.querySelector<HTMLElement>('.stage')!;
          scrollTo(0, el.getBoundingClientRect().top + scrollY + (el.offsetHeight - stage.offsetHeight) * 0.72);
          const b = el.querySelector('.plate')!.getBoundingClientRect();
          if (b.top < -0.5 || b.bottom > innerHeight + 0.5) out.clipped.push(`${el.id} top=${b.top.toFixed(1)} bottom=${b.bottom.toFixed(1)}`);
        }
        return out;
      });
      console.log(`[ko ${vp.width}x${vp.height}] dense: ${r.dense.join(', ') || '-'} | loose: ${r.loose.join(', ') || '-'}`);
      expect(r.clipped).toEqual([]);
    });

    test('no horizontal scroll', async ({ page }) => {
      await page.goto('./');
      await ready(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  });
}

test.describe('reduced motion', () => {
  test('every item is inked from the start', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
    await ready(page);
    await page.evaluate(() => scrollTo(0, 2000));
    await expect(page.locator('.cuts li.inked')).toHaveCount(109);
  });
});

test.describe('desktop rail', () => {
  test.use({ viewport: { width: 1440, height: 860 } });
  test('clicking a tick jumps to that scene', async ({ page }) => {
    await page.goto('./');
    await ready(page);
    await page.evaluate(() => scrollTo(0, innerHeight * 2));
    await expect(page.locator('#rail')).toHaveClass(/\bon\b/);
    await page.locator('#rail button').nth(12).click();
    await expect.poll(() => page.locator('#barT').textContent(), { timeout: 10_000 }).toContain('2025.01  ·  제13판');
  });
});

test.describe('deep link', () => {
  test.use({ viewport: { width: 390, height: 780 } });
  test('opening /#scene-id lands on that scene after fonts settle', async ({ page }) => {
    await page.goto('./#2025-01-deepseek');
    await ready(page);
    await expect.poll(() => page.locator('#barT').textContent(), { timeout: 5_000 }).toContain('2025.01');
  });
});

test.describe('fonts blocked', () => {
  test('falls back after the timeout without breaking', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route(/\.(woff2?)$/, r => r.abort());
    await page.goto('./');
    await ready(page);
    await expect.poll(() => page.locator('#nums').evaluate((c: HTMLCanvasElement) => c.width)).toBeGreaterThan(0);
    await expect(page.locator('section.ch')).toHaveCount(28);
    expect(errors).toEqual([]);
  });
});

test.describe('short landscape', () => {
  test.use({ viewport: { width: 844, height: 390 } });
  test('no pinning, no errors, no horizontal scroll', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('./');
    await ready(page);
    expect(await page.evaluate(() => document.documentElement.classList.contains('pin'))).toBe(false);
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight / 2));
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
});

test.describe('review fixes', () => {
  test.use({ viewport: { width: 390, height: 780 } });

  test('a malformed hash does not stall startup', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('./#50%');
    await ready(page);
    await expect.poll(() => page.locator('#nums').evaluate((c: HTMLCanvasElement) => c.width)).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });

  test('deep link is realigned when the browser scrolled before the script ran', async ({ page }) => {
    // 번들을 늦게 보내 브라우저가 먼저 #id로 스크롤하게 만든다 → main.ts의 재정렬 경로를 강제한다
    // Chromium은 레이아웃이 바뀌어도 #목표로 스스로 다시 스크롤하므로, 재정렬 경로가 실행됐는지도 센다
    await page.addInitScript(() => {
      const w = window as unknown as { __siv: number };
      w.__siv = 0;
      const orig = Element.prototype.scrollIntoView;
      Element.prototype.scrollIntoView = function (...a: Parameters<Element['scrollIntoView']>) { w.__siv++; return orig.apply(this, a); };
    });
    await page.route(/_astro\/.*\.js$/, async r => { await new Promise(res => setTimeout(res, 1500)); await r.continue(); });
    await page.goto('./#2025-01-deepseek');
    await ready(page);
    await expect.poll(() => page.locator('[id="2025-01-deepseek"]').evaluate(el => Math.abs(el.getBoundingClientRect().top))).toBeLessThan(2);
    await expect.poll(() => page.locator('#barT').textContent()).toContain('2025.01  ·  제13판');
    expect(await page.evaluate(() => (window as unknown as { __siv: number }).__siv)).toBeGreaterThanOrEqual(1);
  });

  test('the engraver waits for the real typefaces, not fallbacks', async ({ page }) => {
    // WebKit은 모듈 스크립트를 스타일시트보다 먼저 돌릴 수 있다 → CSS 토큰이 비면 sans-serif로 새긴다
    await page.addInitScript(() => {
      const w = window as unknown as { __fonts: string[] };
      w.__fonts = [];
      const orig = FontFaceSet.prototype.load;
      FontFaceSet.prototype.load = function (font: string, text?: string) { w.__fonts.push(font); return orig.call(this, font, text); };
    });
    await page.goto('./');
    await ready(page);
    const fonts = await page.evaluate(() => (window as unknown as { __fonts: string[] }).__fonts);
    expect(fonts.slice(0, 4)).toEqual([
      expect.stringContaining('"Black Han Sans"'),
      expect.stringContaining('"Hahmlet"'),
      expect.stringContaining('"Hahmlet"'),
      expect.stringContaining('"IBM Plex Mono"'),
    ]);
  });

  test('fonts that never arrive fall back after the timeout', async ({ page }) => {
    await page.route(/\.(woff2?)$/, () => { /* 응답하지 않음 */ });
    const t0 = Date.now();
    await page.goto('./', { waitUntil: 'domcontentloaded' });
    await ready(page);
    const took = Date.now() - t0;
    expect(took).toBeGreaterThan(3000);
    expect(took).toBeLessThan(8000);
    await expect.poll(() => page.locator('#nums').evaluate((c: HTMLCanvasElement) => c.width)).toBeGreaterThan(0);
  });
});
