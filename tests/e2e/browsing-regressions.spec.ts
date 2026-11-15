import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

for (const path of ['./ko/', './']) {
  test(`${path} search scene can step into the matching event`, async ({ page }) => {
    await page.goto(`${path}?q=METR`);
    await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
    const scene = page.locator('.wall .box.scene.on').first();
    const event = page.locator('.wall .box.item.on');
    await expect(event).toHaveCount(1);
    const addr = await event.getAttribute('data-addr');
    await scene.click();
    await expect(page.locator('#detail .next')).toBeEnabled();
    await expect(page.locator('#detail .pos')).toHaveText('');
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => page.evaluate(() => location.hash)).toBe(`#${addr}`);
    await expect(page.locator('#detail .pos')).toHaveText('1 / 1');
  });
}

for (const width of [320, 390]) {
  test(`${width}px recent shortcuts scroll inside the expanded panel`, async ({ page }) => {
    await page.setViewportSize({ width, height: 480 });
    await page.goto('./ko/');
    await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
    await page.locator('.since-show').click();
    const body = page.locator('#pickbar .pb-body');
    const bar = page.locator('#pickbar');
    const last = body.locator('[data-bundle="recent"] .pb-chip').last();
    await expect(body).toBeVisible();
    const rect = await body.boundingBox();
    expect(rect!.y + rect!.height).toBeLessThanOrEqual(480);
    expect(await body.evaluate(e => e.scrollHeight > e.clientHeight)).toBe(true);

    await body.hover();
    await page.mouse.wheel(0, 2000);
    await expect.poll(() => body.evaluate(e => e.scrollTop)).toBeGreaterThan(0);
    await expect(body).toBeVisible();
    await expect(bar).not.toHaveClass(/\btight\b/);
    await last.dispatchEvent('touchmove', { bubbles: true });
    await expect(bar).not.toHaveClass(/\btight\b/);

    const addr = await last.getAttribute('data-scene');
    await last.click();
    await expect(page.locator('#detail')).toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => location.hash)).toBe(`#${addr}`);
    await page.keyboard.press('Escape');

    // Scrolling the wall still folds the panel.
    await page.locator('.wall').dispatchEvent('touchmove', { bubbles: true });
    await expect(bar).toHaveClass(/\btight\b/);
    await expect(body).toBeHidden();
  });
}
