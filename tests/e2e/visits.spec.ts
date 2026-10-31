import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

/* 지난 방문 이후 새 상자: localStorage에 마지막으로 본 판의 날짜를 두고, 그 뒤에 추가된 상자를 표시한다 */

async function ready(page: Page, path = './') {
  await page.goto(path);
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
}
async function addedAfter(request: APIRequestContext, since: string): Promise<number> {
  const t = await (await request.get('timeline.json')).json() as { scenes: { added: string; items: unknown[] }[] };
  return t.scenes.filter(s => s.added > since).reduce((n, s) => n + 1 + s.items.length, 0);
}

test('first visit', async ({ page }) => {
  await ready(page);
  await expect(page.locator('.wall .box.new')).toHaveCount(0);
  await expect(page.locator('.cover .since')).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('atl:seen'))).toBe('2026-10-31');
});

test('returning visitor', async ({ page, request }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('atl:seen', '2026-10-27'); sessionStorage.setItem('seeded', '1'); } });
  await ready(page);
  const n = await addedAfter(request, '2026-10-27');
  expect(n).toBeGreaterThan(0);
  await expect(page.locator('.wall .box.new')).toHaveCount(n);
  await expect(page.locator('.cover .since')).toBeVisible();
  await expect(page.locator('.cover .since')).toContainText(`지난 방문 이후 새 상자 ${n}개`);
  await expect(page.locator('.wall .box.new').first()).toHaveAttribute('aria-label', / · 지난 방문 이후 추가$/);
  expect(await page.evaluate(() => localStorage.getItem('atl:seen'))).toBe('2026-10-31');

  await page.locator('.cover .since button').click();
  await expect(page.locator('.wall.pick')).toHaveCount(1);
  await expect(page.locator('.wall .box.on')).toHaveCount(n);
  await page.locator('.cover .since button').click();
  await expect(page.locator('.wall.pick')).toHaveCount(0);

  // 같은 탭에서 새로 고쳐도 표시가 남는다
  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
  await expect(page.locator('.wall .box.new')).toHaveCount(n);
});

test('storage that throws', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('blocked'); };
    Storage.prototype.setItem = () => { throw new Error('blocked'); };
  });
  await ready(page);
  await expect(page.locator('.wall .box.new')).toHaveCount(0);
  await expect(page.locator('.cover .since')).toBeHidden();
  expect(errors).toEqual([]);
});

test('topic and new are exclusive', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('atl:seen', '2026-10-27'));
  await ready(page);
  await page.locator('.cover .since button').click();
  await page.locator('.top .tp-btn').click();
  await page.locator('.tp-list button[data-topic="korea"]').click();
  const korea = await page.locator('.wall .box[data-topics~="korea"]').count();
  await expect(page.locator('.wall .box.on')).toHaveCount(korea);
  await expect(page.locator('.cover .since button')).toHaveAttribute('aria-pressed', 'false');
});
