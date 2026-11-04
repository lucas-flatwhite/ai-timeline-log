import { test, expect, type Page } from '@playwright/test';

/* 맺음 맨 끝의 쓰는 법: 다섯 칸이 보이고, 판이 새겨지고, 누르면 그 일을 한다 */

async function ready(page: Page, path: string) {
  await page.goto(path);
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
}
const step = (page: Page, act: string) => page.locator(`.guide a[data-act="${act}"]`);
async function toGuide(page: Page) {
  await page.locator('#guide').scrollIntoViewIfNeeded();
  await expect(page.locator('.guide .gd-plate:not(.carved)')).toHaveCount(0);
}

for (const [path, title, words] of [
  ['./ko/', '쓰는 법', ['보기', '열기', '흐름', '포스터', '묻기']],
  ['./', 'How to use', ['LOOK', 'OPEN', 'FOLLOW', 'POSTER', 'ASK']],
] as const) {
  test(`${path}: five steps after "making", plates carved near the bottom`, async ({ page }) => {
    await ready(page, path);
    await expect(page.locator('#guideH')).toHaveText(title);
    await expect(page.locator('.guide .gd-t b')).toHaveText([...words]);
    // 만든 방법 다음, 끝 줄 앞
    expect(await page.evaluate(() => {
      const g = document.getElementById('guide')!;
      return [g.previousElementSibling?.className, g.nextElementSibling?.className];
    })).toEqual(['making', 'end']);
    await toGuide(page);
    await expect(page.locator('.guide .gd-plate')).toHaveCount(10);
  });
}

test('open shows the newest box in the dialog', async ({ page }) => {
  await ready(page, './ko/');
  await toGuide(page);
  const addr = (await step(page, 'open').getAttribute('href'))!.slice(1);
  await step(page, 'open').click();
  await expect(page.locator('#detail')).toHaveAttribute('open', '');
  await expect(page).toHaveURL(new RegExp(`#${addr.replace(/[~.]/g, '\\$&')}$`));
});

test('follow scrolls up and leaves the find panel open', async ({ page }) => {
  await ready(page, './');
  await toGuide(page);
  await step(page, 'follow').click();
  await expect(page.locator('.top .tp-btn')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#tp-list')).toBeVisible();
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test('take and ask land on their rows in "Poster and data"; look goes back to the top', async ({ page }) => {
  await ready(page, './');
  await toGuide(page);
  await step(page, 'ask').click();
  await expect(page.locator('#take-ai')).toBeInViewport();
  await toGuide(page);
  await step(page, 'take').click();
  await expect(page.locator('#takeH')).toBeInViewport();
  await toGuide(page);
  await step(page, 'look').click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  // 해시를 남기지 않는다(상세 창 주소와 섞이지 않게)
  expect(new URL(page.url()).hash).toBe('');
});
