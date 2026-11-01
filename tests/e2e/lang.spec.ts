import { test, expect, type Page } from '@playwright/test';

/* 고른 언어 기억: 영어가 기본(base), 한국어는 ko/. 언어 링크를 누르면 lucas-flatwhite:locale에 적고,
   base로 다시 들어오면 그 언어로 옮긴다. ko/처럼 언어 주소를 직접 열면 저장된 선택과 상관없이 그 주소를 따른다 */
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
