import { test, expect } from '@playwright/test';

const ORIGIN = 'https://lucasflatwhite.com/ai-timeline-log/';
const meta = (page: import('@playwright/test').Page, sel: string) => page.locator(`head ${sel}`);

test('canonical, hreflang and social meta, each tag exactly once', async ({ page, request }) => {
  await page.goto('./');
  await expect(meta(page, 'link[rel="canonical"]')).toHaveAttribute('href', ORIGIN);
  await expect(meta(page, 'link[rel="canonical"]')).toHaveCount(1);
  await expect(meta(page, 'link[rel="alternate"][hreflang="ko"]')).toHaveAttribute('href', ORIGIN);
  await expect(meta(page, 'link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', ORIGIN);
  await expect(meta(page, 'link[rel="alternate"][hreflang="en"]')).toHaveCount(0);   // en 판이 나오면 늘어난다

  await expect(meta(page, 'meta[property="og:type"]')).toHaveAttribute('content', 'website');
  await expect(meta(page, 'meta[property="og:url"]')).toHaveAttribute('content', ORIGIN);
  await expect(meta(page, 'meta[property="og:title"]')).toHaveAttribute('content', 'AI Timeline Log');
  await expect(meta(page, 'meta[property="og:image"]')).toHaveAttribute('content', `${ORIGIN}og/ko.png`);
  await expect(meta(page, 'meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
  await expect(meta(page, 'meta[property="og:image:height"]')).toHaveAttribute('content', '630');
  await expect(meta(page, 'meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  for (const sel of ['meta[property="og:image"]', 'meta[property="og:url"]', 'meta[name="twitter:card"]', 'meta[name="description"]']) {
    await expect(meta(page, sel)).toHaveCount(1);
  }

  // 공유 이미지는 실제로 열리고, 1200x630 PNG다
  const res = await request.get('./og/ko.png');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toBe('image/png');
  const png = await res.body();
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
});

test('the share description describes the wall, not a scroll', async ({ page }) => {
  await page.goto('./');
  const desc = await meta(page, 'meta[name="description"]').getAttribute('content');
  const og = await meta(page, 'meta[property="og:description"]').getAttribute('content');
  expect(desc).not.toContain('스크롤');
  expect(og).not.toContain('스크롤');
});
