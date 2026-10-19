import { test, expect } from '@playwright/test';

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every piece of text is in the HTML', async ({ page }) => {
    await page.goto('./');
    await expect(page).toHaveTitle('AI Timeline Log');
    await expect(page.locator('section.ch')).toHaveCount(33);
    await expect(page.locator('section.ch h2')).toHaveCount(33);
    await expect(page.locator('.cuts li')).toHaveCount(128);
    await expect(page.locator('section.yr')).toHaveCount(4);
    await expect(page.locator('.lab')).toHaveCount(6);
    await expect(page.locator('.src li')).toHaveCount(22);
    await expect(page.locator('[id="2025-01-deepseek"] h2')).toHaveText('딥시크 쇼크');
    await expect(page.locator('[id="2022-11-chatgpt"] .cuts time').first()).toHaveText('12.05');
  });

  test('glyph data survives YAML → HTML', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('[id="2025-11-gemini-3"]')).toHaveAttribute('data-glyph', 'CODE\nRED');
    await expect(page.locator('[id="2026-01-ai-basic-act"]')).toHaveAttribute('data-glyph', '1.22');
    await expect(page.locator('[id="2024-11-computer-use-mcp"]')).toHaveAttribute('data-angle', '-20');
    await expect(page.locator('#numtext')).toHaveAttribute('data-tall-tpl', '{days}\n일');
    await expect(page.locator('#numtext')).toHaveAttribute('data-tall', /^[\d,]+\n일$/);   // 빌드한 날 기준. JS가 보는 날로 다시 채운다
  });

  test('language switch on the cover and at the end: KO is current, EN is not a link yet', async ({ page }) => {
    await page.goto('./');
    for (const where of ['.hero-top', '.outro']) {
      const nav = page.locator(`${where} nav.lang`);
      await expect(nav.locator('a[aria-current="page"]')).toHaveText('KO');
      await expect(nav.locator('[aria-disabled="true"]')).toHaveText('EN');
      await expect(nav.locator('a', { hasText: 'EN' })).toHaveCount(0);
    }
  });

  test('no external font service', async ({ page }) => {
    await page.goto('./');
    expect(await page.content()).not.toContain('fonts.googleapis.com');
  });

  test('tab and home-screen icons come from this site, at the sizes they declare', async ({ page }) => {
    await page.goto('./');
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
