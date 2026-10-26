import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { test, expect } from '@playwright/test';
import { ui } from '../../src/i18n/index.ts';

/* content/를 직접 읽는다. src/lib/content.ts는 검사·경고까지 돌리므로 여기서는 쓰지 않는다 */
const dir = join(process.cwd(), 'content', 'scenes');
const scenes = readdirSync(dir).filter(f => f.endsWith('.yaml'))
  .map(f => parse(readFileSync(join(dir, f), 'utf8')) as Record<'ko' | 'en', { title: string }> & { items: Record<'ko' | 'en', string>[] });

for (const path of ['./', './en/']) {
  const lang = path === './' ? 'ko' : 'en';
  const days = { ko: { tpl: '{days}일', glyph: /^[\d,]+일$/ }, en: { tpl: '{days} days', glyph: /^\d{1,3}(,\d{3})* days$/ } }[lang];

  test.describe(`${lang}: without JavaScript`, () => {
    test.use({ javaScriptEnabled: false });

    test('every scene title and event sentence is in the HTML', async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle('AI Timeline Log');
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      const text = (await page.locator('#details').textContent())!;
      const missing = scenes.flatMap(s => [s[lang].title, ...s.items.map(it => it[lang])]).filter(t => !text.includes(t));
      expect(missing).toEqual([]);
      await expect(page.locator('#details article.detail:not(.year)')).toHaveCount(33);
      await expect(page.locator('#details ol.items > li')).toHaveCount(128);
      await expect(page.locator('#details article.detail.year')).toHaveCount(4);
    });

    test('boxes: 166, newest first, links to addresses', async ({ page }) => {
      await page.goto(path);
      const boxes = page.locator('.wall .box');
      await expect(boxes).toHaveCount(166);
      await expect(page.locator('.wall > :first-child')).toHaveClass(/\bcover\b/);
      await expect(page.locator('.wall a.box').first()).toHaveAttribute('href', '#year-2026');
      const glyphs = await boxes.evaluateAll(els => els.map(e => (e as HTMLElement).dataset.glyph ?? ''));
      expect(glyphs.filter(g => !g)).toEqual([]);
      await expect(page.locator('a.box[data-addr="2025-11-gemini-3"]')).toHaveAttribute('data-glyph', 'CODE\nRED');
      await expect(page.locator('a.box[data-addr="2024-11-computer-use-mcp"]')).toHaveAttribute('data-angle', '-20');
      await expect(page.locator('span.box.year.off')).toHaveAttribute('data-glyph', '2022');
      // 일수는 빌드한 날 기준. JS가 보는 날로 다시 채운다
      await expect(page.locator('.cover canvas.cv[data-kind="days"]')).toHaveAttribute('data-tpl', days.tpl);
      await expect(page.locator('.cover canvas.cv[data-kind="days"]')).toHaveAttribute('data-glyph', days.glyph);
    });

    test('without JS the details list is visible and box links jump to it', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('#details')).toBeVisible();
      await expect(page.locator('#detail')).toBeHidden();
      await page.locator('a.box[href="#2023-03-gpt-4"]').click();
      await expect(page.locator('[id="2023-03-gpt-4"]')).toBeInViewport();
    });

    test('plate font is preloaded', async ({ page }) => {
      await page.goto(path);
      expect(await page.locator(`link[rel=preload][as=font][href*="plate/${lang}-"]`).count()).toBeGreaterThan(0);
      expect(await page.locator(`link[rel=preload][as=font]:not([href*="plate/${lang}-"])`).count()).toBe(0);   // 다른 언어의 판 글꼴은 받지 않는다
      for (const link of await page.locator('link[rel=preload][as=font]').all()) {
        expect(await link.getAttribute('crossorigin')).not.toBeNull();
        expect((await page.request.get((await link.getAttribute('href'))!)).status()).toBe(200);
      }
    });

    test('language switch: this language current, the other links to its page', async ({ page }) => {
      const [cur, other] = lang === 'ko' ? ['KO', { label: 'EN', href: '/ai-timeline-log/en/' }] : ['EN', { label: 'KO', href: '/ai-timeline-log/' }];
      await page.goto(path);
      for (const where of ['header.top', '.outro']) {
        const nav = page.locator(`${where} nav.lang`);
        await expect(nav.locator('a[aria-current="page"]')).toHaveText(cur);
        await expect(nav.locator('a', { hasText: other.label })).toHaveAttribute('href', other.href);
        await expect(nav.locator('a', { hasText: other.label })).not.toHaveAttribute('aria-current', /.*/);
        await expect(nav.locator('[aria-disabled="true"]')).toHaveCount(0);
      }
      await expect(page.locator('header.top a.report')).toHaveAttribute('target', '_blank');
      await expect(page.locator('header.top a.report')).toHaveText(`${ui[lang]!.report} ↗`);
    });

    test('no external font service', async ({ page }) => {
      await page.goto(path);
      expect(await page.content()).not.toContain('fonts.googleapis.com');
    });

    test('tab and home-screen icons come from this site, at the sizes they declare', async ({ page }) => {
      await page.goto(path);
      const icons = page.locator('head link[rel="icon"], head link[rel="apple-touch-icon"]');
      await expect(icons).toHaveCount(3);
      for (const link of await icons.all()) {
        const href = (await link.getAttribute('href'))!;
        // '/favicon.png'처럼 base 없이 쓰면 404가 아니라 메인 사이트 아이콘(Lf)이 대신 뜬다
        expect(href).toMatch(/^\/ai-timeline-log\//);
        const res = await page.request.get(href);
        expect(res.status()).toBe(200);
        expect(res.headers()['content-type']).toBe('image/png');
        const png = await res.body();   // IHDR: 16바이트부터 가로, 20바이트부터 세로
        expect(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`).toBe(await link.getAttribute('sizes'));
      }
    });
  });

  test.describe(`${lang}: with JavaScript`, () => {
    test('details list is hidden; the top bar sticks', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('html')).toHaveClass(/\bjs\b/);
      await expect(page.locator('#details')).toBeHidden();
      await page.mouse.wheel(0, 2000);
      await page.waitForFunction(() => scrollY > 1000);
      await expect(page.locator('header.top')).toBeInViewport();
      expect(await page.locator('header.top').evaluate(e => getComputedStyle(e).position)).toBe('sticky');
    });
  });
}
