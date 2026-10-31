import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

/* 주제 강조: 위 막대의 주제 단추, ?topic= 주소, 상세 창 ←/→가 주제 안에서만 움직이기 */

async function ready(page: Page, path: string) {
  await page.goto(path);
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
}
/** 주제에 속한 상자 수: 장면 상자 하나 + 사건 상자들 */
async function boxCount(request: APIRequestContext, topic: string): Promise<number> {
  const t = await (await request.get('timeline.json')).json() as { scenes: { topics: string[]; items: unknown[] }[] };
  return t.scenes.filter(s => s.topics.includes(topic)).reduce((n, s) => n + 1 + s.items.length, 0);
}
const onAddrs = (page: Page) => page.locator('.wall .box.on').evaluateAll(bs => bs.map(b => (b as HTMLElement).dataset.addr!));

test('menu highlights a topic', async ({ page, request }) => {
  await ready(page, './');
  const btn = page.locator('.top .tp-btn');
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await page.locator('.tp-list button[data-topic="agents"]').click();
  await expect(page.locator('.wall.pick')).toHaveCount(1);
  await expect(page.locator('.wall .box.on')).toHaveCount(await boxCount(request, 'agents'));
  await expect(page).toHaveURL(/\?topic=agents$/);
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await expect(btn).toContainText('에이전트');
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
});

test('topic from the address', async ({ page }) => {
  await ready(page, './?topic=science');
  await expect(page.locator('.wall.pick')).toHaveCount(1);
  await expect(page.locator('.top .tp-btn')).toContainText('과학과 수학');
});

test('ignores an unknown topic', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  await ready(page, './?topic=nope');
  await expect(page.locator('.wall.pick')).toHaveCount(0);
  await expect(page.locator('.top .tp-btn')).toHaveAttribute('aria-pressed', 'false');
  expect(errors).toEqual([]);
});

test('arrows stay inside the topic', async ({ page }) => {
  await ready(page, './?topic=korea');
  const allowed = new Set(await onAddrs(page));
  await page.locator('.wall .box.on').first().click();
  await expect(page.locator('#detail')).toBeVisible();
  const prev = page.locator('#detail .prev');
  const seen: string[] = [];
  for (let i = 0; i < 40 && !(await prev.isDisabled()); i++) {
    await page.keyboard.press('ArrowLeft');
    seen.push(decodeURIComponent(new URL(page.url()).hash.slice(1)));
  }
  expect(seen.length).toBe(allowed.size - 1);
  expect(seen.filter(a => !allowed.has(a))).toEqual([]);
  await expect(prev).toBeDisabled();
  await expect(page).toHaveURL(/\?topic=korea#/);
});

test('falls back to the full order', async ({ page }) => {
  await ready(page, './?topic=korea');
  const all = await page.locator('.wall .box:not(.year)').evaluateAll(bs => bs.map(b => (b as HTMLElement).dataset.addr!));
  const allowed = new Set(await onAddrs(page));
  const outside = all.find(a => !allowed.has(a))!;
  await page.locator('.wall .box.on').first().click();
  await page.evaluate(a => { location.hash = a; }, outside);
  await expect(page).toHaveURL(new RegExp(`#${outside.replace(/[~]/g, '\\$&')}$`));
  await page.keyboard.press('ArrowLeft');
  const next = all[all.indexOf(outside) + 1];
  expect(decodeURIComponent(new URL(page.url()).hash.slice(1))).toBe(next);
});

test('clearing removes the query and the highlight', async ({ page }) => {
  await ready(page, './?topic=agents');
  await page.locator('.top .tp-btn').click();
  await page.locator('.tp-list button[data-topic=""]').click();
  await expect(page.locator('.wall.pick')).toHaveCount(0);
  expect(new URL(page.url()).search).toBe('');
  await expect(page.locator('.top .tp-btn')).toHaveText('주제');
});

test('escape closes the menu and returns focus', async ({ page }) => {
  await ready(page, './');
  const btn = page.locator('.top .tp-btn');
  await btn.click();
  await expect(page.locator('#tp-list')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#tp-list')).toBeHidden();
  await expect(btn).toBeFocused();
});

test('language link carries the topic', async ({ page }) => {
  await ready(page, './');
  await page.locator('.top .tp-btn').click();
  await page.locator('.tp-list button[data-topic="agents"]').click();
  await expect(page.locator('header.top nav.lang a[lang=en]')).toHaveAttribute('href', /\?topic=agents/);
});

test.describe('touch', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  test('touch devices see the highlight', async ({ page }) => {
    await ready(page, './?topic=agents');
    await expect.poll(() => page.locator('.wall .box:not(.on):not(.year) canvas').first()
      .evaluate(c => getComputedStyle(c).opacity)).toBe('0.25');
  });
});
