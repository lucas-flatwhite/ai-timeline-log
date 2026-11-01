import { test, expect, type Page } from '@playwright/test';

/* 언어 고르기: 영어가 기본(base), 한국어는 ko/. 순서는 고른 언어 → 브라우저의 첫 언어 → 영어.
   언어 링크를 누르면 lucas-flatwhite:locale에 적고, base로 다시 들어오면 그 언어로 옮긴다.
   ko/처럼 언어 주소를 직접 열면 저장된 선택과 상관없이 그 주소를 따른다. 설정의 기본 브라우저 언어는 en-US다 */
const KEY = 'lucas-flatwhite:locale';
const stored = (page: Page) => page.evaluate(k => localStorage.getItem(k), KEY);
const path = (page: Page) => new URL(page.url()).pathname;
async function seed(page: Page, value: string) {
  await page.addInitScript(([k, v]) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem(k, v); sessionStorage.setItem('seeded', '1'); } }, [KEY, value]);
}

test('first visit opens in English and remembers nothing', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(path(page)).toBe('/ai-timeline-log/');
  expect(await stored(page)).toBeNull();
});

test('choosing KO is remembered, and the base address follows it', async ({ page }) => {
  await page.goto('./');
  await page.locator('header.top nav.lang a[lang=ko]').click();
  await page.waitForURL(u => u.pathname === '/ai-timeline-log/ko/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  expect(await stored(page)).toBe('ko');

  await page.goto('./');
  await page.waitForURL(u => u.pathname === '/ai-timeline-log/ko/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
});

test('choosing EN again goes back to the English base and stays there', async ({ page }) => {
  await seed(page, 'ko');
  await page.goto('./');
  await page.waitForURL(u => u.pathname === '/ai-timeline-log/ko/');
  await page.locator('header.top nav.lang a[lang=en]').click();
  await page.waitForURL(u => u.pathname === '/ai-timeline-log/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(await stored(page)).toBe('en');

  await page.reload();
  expect(path(page)).toBe('/ai-timeline-log/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('the move keeps the topic and the opened event', async ({ page }) => {
  await seed(page, 'ko');
  await page.goto('./?topic=agents#2026-07-sandbox-escape');
  await page.waitForURL(u => u.pathname === '/ai-timeline-log/ko/');
  const u = new URL(page.url());
  expect(u.search).toBe('?topic=agents');
  expect(u.hash).toBe('#2026-07-sandbox-escape');
});

test('a language address opened directly wins over the stored choice', async ({ page }) => {
  await seed(page, 'en');
  await page.goto('./ko/');
  expect(path(page)).toBe('/ai-timeline-log/ko/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  expect(await stored(page)).toBe('en');   // 열어 본 것만으로는 선택을 바꾸지 않는다
});

test('an unknown stored value is ignored', async ({ page }) => {
  await seed(page, 'zh');
  await page.goto('./');
  expect(path(page)).toBe('/ai-timeline-log/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test.describe('Korean browser', () => {
  test.use({ locale: 'ko-KR' });

  test('opens in Korean without storing a choice', async ({ page }) => {
    await page.goto('./?topic=agents#2026-07-sandbox-escape');
    await page.waitForURL(u => u.pathname === '/ai-timeline-log/ko/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    const u = new URL(page.url());
    expect(u.search + u.hash).toBe('?topic=agents#2026-07-sandbox-escape');
    expect(await stored(page)).toBeNull();
  });

  test('choosing EN is remembered over the browser language', async ({ page }) => {
    await page.goto('./');
    await page.waitForURL(u => u.pathname === '/ai-timeline-log/ko/');
    await page.locator('header.top nav.lang a[lang=en]').click();
    await page.waitForURL(u => u.pathname === '/ai-timeline-log/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(await stored(page)).toBe('en');

    await page.goto('about:blank');
    await page.goto('./');
    expect(path(page)).toBe('/ai-timeline-log/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('with storage blocked, EN still reaches English', async ({ page }) => {
    // 저장소가 막힌 브라우저: 적지도 읽지도 못한다. 한국어 페이지에서 EN으로 넘어오면 브라우저 언어로 되돌리지 않는다
    await page.addInitScript(() => {
      Storage.prototype.getItem = () => { throw new Error('blocked'); };
      Storage.prototype.setItem = () => { throw new Error('blocked'); };
    });
    await page.goto('./');
    await page.waitForURL(u => u.pathname === '/ai-timeline-log/ko/');
    await page.locator('header.top nav.lang a[lang=en]').click();
    await page.waitForURL(u => u.pathname === '/ai-timeline-log/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(path(page)).toBe('/ai-timeline-log/');
  });
});

test.describe('other browser languages', () => {
  for (const locale of ['ja-JP', 'zh-CN', 'en-GB']) {
    test.describe(locale, () => {
      test.use({ locale });
      test(`${locale} opens in English`, async ({ page }) => {
        await page.goto('./');
        expect(path(page)).toBe('/ai-timeline-log/');
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      });
    });
  }
});
