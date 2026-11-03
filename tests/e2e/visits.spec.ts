import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

/* 지난 방문 이후 새 상자: localStorage에 마지막으로 본 판의 날짜를 두고, 그 뒤에 추가된 상자를 표시한다 */

async function ready(page: Page, path = './ko/') {
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
  await expect(page.locator('.since')).toBeHidden();
  await expect(page.locator('.tp-new')).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('atl:seen'))).toBe('2026-11-03');
});

test('returning visitor', async ({ page, request }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('atl:seen', '2026-10-27'); sessionStorage.setItem('seeded', '1'); } });
  await ready(page);
  const n = await addedAfter(request, '2026-10-27');
  expect(n).toBeGreaterThan(0);
  await expect(page.locator('.wall .box.new')).toHaveCount(n);
  await expect(page.locator('.since')).toBeVisible();
  await expect(page.locator('.since')).toContainText(`지난 방문 이후 새 상자 ${n}개`);
  await expect(page.locator('.wall .box.new').first()).toHaveAttribute('aria-label', / · 지난 방문 이후 추가$/);
  expect(await page.evaluate(() => localStorage.getItem('atl:seen'))).toBe('2026-11-03');

  // 보기: 새 상자만 남기고 쪽지는 닫는다. 띠의 ×로 푼다
  await page.locator('.since .since-show').click();
  await expect(page.locator('.wall.pick')).toHaveCount(1);
  await expect(page.locator('.wall .box.on')).toHaveCount(n);
  await expect(page.locator('.since')).toBeHidden();
  await expect(page.locator('#pickbar .pb-k')).toHaveText('새 상자');
  await page.locator('#pickbar .pb-x').click();
  await expect(page.locator('.wall.pick')).toHaveCount(0);

  // 같은 탭에서 새로 고쳐도 표시는 남고, 닫은 쪽지는 다시 뜨지 않는다. 찾기 창에서 다시 고를 수 있다
  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
  await expect(page.locator('.wall .box.new')).toHaveCount(n);
  await expect(page.locator('.since')).toBeHidden();
  await page.locator('.top .tp-btn').click();
  await expect(page.locator('.tp-new button')).toHaveText(`지난 방문 이후 새 상자 ${n}개`);
  await page.locator('.tp-new button').click();
  await expect(page.locator('.wall .box.on')).toHaveCount(n);
});

test('× closes the slip for this tab', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('atl:seen', '2026-10-27'));
  await ready(page);
  await page.locator('.since .since-x').click();
  await expect(page.locator('.since')).toBeHidden();
  await expect(page.locator('.wall.pick')).toHaveCount(0);
  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
  await expect(page.locator('.since')).toBeHidden();
});

test('the intro stays and the wall does not move when the slip appears', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('atl:seen', '2026-10-27'));
  await ready(page);
  await expect(page.locator('.since')).toBeVisible();
  // 다시 온 사람도 소개 글을 본다
  await expect(page.locator('.cover .lede')).toBeVisible();
  await expect(page.locator('.cover .lede')).toContainText('ChatGPT');
  // 표지는 첫 방문과 같은 4칸×3칸(64px 칸 3개 + 간격 2개)이다. 표지가 길어지면 뒤의 상자가 모두 다시 놓인다
  expect((await page.locator('.cover').boundingBox())!.height).toBe(200);
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
  await expect(page.locator('.since')).toBeHidden();
  expect(errors).toEqual([]);
});

test('topic and new are exclusive', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('atl:seen', '2026-10-27'));
  await ready(page);
  await page.locator('.since .since-show').click();
  await page.locator('.top .tp-btn').click();
  await page.locator('.tp-list button[data-topic="korea"]').click();
  const korea = await page.locator('.wall .box[data-topics~="korea"]').count();
  await expect(page.locator('.wall .box.on')).toHaveCount(korea);
  await expect(page.locator('#pickbar .pb-k')).toHaveText('주제');
});
