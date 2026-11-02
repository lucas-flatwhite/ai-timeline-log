import { test, expect, type Page } from '@playwright/test';

/* 찾기 창: 찾는 말(한국어·영어 글 모두), 시기 강조, 강조 띠 */

async function ready(page: Page, path: string) {
  await page.goto(path);
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
}
const on = (page: Page) => page.locator('.wall .box.on').evaluateAll(bs => bs.map(b => (b as HTMLElement).dataset.addr!));
const box = (page: Page, addr: string) => page.locator(`.wall .box[data-addr="${addr}"]`);
const operator = '2025-01-deepseek~20250123';

test('typing a word lights the boxes that contain it', async ({ page }) => {
  await ready(page, './ko/');
  await page.locator('.top .tp-btn').click();
  await page.locator('.tp-list input').fill('오퍼레이터');
  await expect(box(page, operator)).toHaveClass(/\bon\b/);
  await expect(page).toHaveURL(/\?q=/);
  const n = (await on(page)).length;
  await expect(page.locator('#pickbar .pb-n')).toHaveText(`상자 ${n}개`);
  await expect(page.locator('.tp-list .tp-n')).toHaveText(`상자 ${n}개`);
  await expect(page.locator('#pickbar .pb-k')).toHaveText('찾기');
});

test('Korean page finds English words, English page finds Korean words', async ({ page }) => {
  await ready(page, './ko/?q=Operator');
  await expect(box(page, operator)).toHaveClass(/\bon\b/);
  await ready(page, './?q=오퍼레이터');
  await expect(box(page, operator)).toHaveClass(/\bon\b/);
});

test('case, spaces and hyphens do not matter; dates match', async ({ page }) => {
  await ready(page, './?q=gpt4');
  await expect(box(page, '2023-03-gpt-4')).toHaveClass(/\bon\b/);
  await ready(page, './?q=2025.01.23');
  expect(await on(page)).toEqual([operator]);
});

test('every word must match', async ({ page }) => {
  await ready(page, './?q=OpenAI Operator');
  expect(await on(page)).toEqual([operator]);
});

test('no match says so', async ({ page }) => {
  await ready(page, './?q=zzqqxx');
  await expect(page.locator('.wall .box.on')).toHaveCount(0);
  await expect(page.locator('#pickbar .pb-n')).toHaveText('No boxes match');
});

test('Enter closes the panel and scrolls to the first match; clearing removes everything', async ({ page }) => {
  await ready(page, './');
  await page.locator('.top .tp-btn').click();
  const input = page.locator('.tp-list input');
  await input.fill('Bletchley');
  await input.press('Enter');
  await expect(page.locator('#tp-list')).toBeHidden();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(500);
  await page.locator('.top .tp-btn').click();
  await expect(input).toHaveValue('Bletchley');
  await input.fill('');
  await expect(page.locator('.wall.pick')).toHaveCount(0);
  await expect(page.locator('#pickbar')).toBeHidden();
  expect(new URL(page.url()).search).toBe('');
});

test('the language link carries the search', async ({ page }) => {
  await ready(page, './?q=Operator');
  await expect(page.locator('header.top nav.lang a[lang=ko]')).toHaveAttribute('href', /\?q=Operator/);
});

test('an era lights its boxes and steps to the next era', async ({ page }) => {
  await ready(page, './ko/');
  await page.locator('.top .tp-btn').click();
  await page.locator('.tp-list button[data-era="202211"]').click();
  await expect(page.locator('#tp-list')).toBeHidden();
  await expect(page).toHaveURL(/\?era=2022-11$/);
  await expect(page.locator('#pickbar .pb-k')).toHaveText('시기 1/9');
  await expect(page.locator('#pickbar .pb-body')).toBeVisible();
  await expect(page.locator('#pickbar .pb-prev')).toBeDisabled();
  const dates = await page.locator('.wall .box.on .d').allTextContents();
  expect(dates.length).toBeGreaterThan(0);
  for (const d of dates) expect(d.slice(0, 6) >= '202211' && d.slice(0, 6) <= '202302').toBe(true);
  await page.locator('#pickbar .pb-next').click();
  await expect(page.locator('#pickbar .pb-k')).toHaveText('시기 2/9');
  await expect(page).toHaveURL(/\?era=2023-03$/);
  await page.locator('#pickbar .pb-x').click();
  await expect(page.locator('#pickbar')).toBeHidden();
  await expect(page.locator('.wall.pick')).toHaveCount(0);
});

test('the last era runs to the present and the outro links pick an era', async ({ page }) => {
  await ready(page, './');
  await page.locator('.arcs .arc-go').last().click();
  await expect(page.locator('#pickbar .pb-k')).toHaveText('Era 9 of 9');
  await expect(page.locator('#pickbar .pb-next')).toBeDisabled();
  // 끝으로 갔던 화면이 그 시기의 첫 상자 쪽으로 올라온다
  await expect.poll(() => page.locator('.wall .box.on').first().evaluate(b => b.getBoundingClientRect().top)).toBeLessThan(400);
});

test('arrows stay inside the era', async ({ page }) => {
  await ready(page, './ko/?era=2024-07');
  const allowed = new Set(await page.locator('.wall .box.item.on').evaluateAll(bs => bs.map(b => (b as HTMLElement).dataset.addr!)));
  await page.locator('.wall .box.item.on').first().click();
  const prev = page.locator('#detail .prev');
  const seen: string[] = [];
  for (let i = 0; i < 40 && !(await prev.isDisabled()); i++) {
    await page.keyboard.press('ArrowLeft');
    seen.push(decodeURIComponent(new URL(page.url()).hash.slice(1)));
  }
  expect(seen.length).toBe(allowed.size - 1);
  expect(seen.filter(a => !allowed.has(a))).toEqual([]);
  await expect(page.locator('#detail .pos')).toHaveText(`1 / ${allowed.size}`);
});
