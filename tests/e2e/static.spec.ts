import { test, expect } from '@playwright/test';

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every piece of text is in the HTML', async ({ page }) => {
    await page.goto('./');
    await expect(page).toHaveTitle('생성형 AI 1,405일');
    await expect(page.locator('section.ch')).toHaveCount(28);
    await expect(page.locator('section.ch h2')).toHaveCount(28);
    await expect(page.locator('.cuts li')).toHaveCount(109);
    await expect(page.locator('section.yr')).toHaveCount(4);
    await expect(page.locator('.lab')).toHaveCount(6);
    await expect(page.locator('.src li')).toHaveCount(21);
    await expect(page.locator('[id="2025-01-deepseek"] h2')).toHaveText('딥시크 쇼크');
    await expect(page.locator('[id="2022-11-chatgpt"] .cuts time').first()).toHaveText('12.05');
  });

  test('glyph data survives YAML → HTML', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('[id="2025-11-gemini-3"]')).toHaveAttribute('data-glyph', 'CODE\nRED');
    await expect(page.locator('[id="2026-01-ai-basic-act"]')).toHaveAttribute('data-glyph', '1.22');
    await expect(page.locator('[id="2024-11-computer-use-mcp"]')).toHaveAttribute('data-angle', '-20');
    await expect(page.locator('#numtext')).toHaveAttribute('data-tall', '1,405\n일');
  });

  test('no external font service', async ({ page }) => {
    await page.goto('./');
    expect(await page.content()).not.toContain('fonts.googleapis.com');
  });
});
