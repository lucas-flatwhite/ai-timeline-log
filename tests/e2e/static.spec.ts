import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { test, expect } from '@playwright/test';
import { ui } from '../../src/i18n/index.ts';

/* content/를 직접 읽는다. src/lib/content.ts는 검사·경고까지 돌리므로 여기서는 쓰지 않는다 */
const dir = join(process.cwd(), 'content', 'scenes');
const scenes = readdirSync(dir).filter(f => f.endsWith('.yaml'))
  .map(f => parse(readFileSync(join(dir, f), 'utf8')) as Record<'ko' | 'en', { title: string }> & { items: Record<'ko' | 'en', string>[] });

for (const path of ['./ko/', './']) {
  const lang = path === './' ? 'en' : 'ko';
  const days = { ko: { tpl: '{days}일', glyph: /^[\d,]+일$/ }, en: { tpl: '{days} days', glyph: /^\d{1,3}(,\d{3})* days$/ } }[lang];

  test.describe(`${lang}: without JavaScript`, () => {
    test.use({ javaScriptEnabled: false });

    test('every scene title and event sentence is in the HTML', async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle('AI Timeline Log');
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      const text = (await page.locator('#details').textContent())!;
      const missing = scenes.flatMap(s => [s[lang].title, ...s.items.map(it => it[lang])]).filter(t => !text.includes(t));
      expect(missing).toEqual([]);
      await expect(page.locator('#details article.detail:not(.year)')).toHaveCount(72);
      await expect(page.locator('#details ol.items > li')).toHaveCount(268);
      await expect(page.locator('#details article.detail.year')).toHaveCount(4);
    });

    test('topic menu and since line stay out of the way without JS', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('.tp')).toBeHidden();
      await expect(page.locator('.since')).toBeHidden();
      const box = page.locator('.wall a.box.item').first();
      await expect(box).toHaveAttribute('data-topics', /\S/);
      await expect(box).toHaveAttribute('data-added', /^\d{4}-\d{2}-\d{2}$/);
      await expect(page.locator('#wall')).toHaveAttribute('data-latest', '2026-11-07');
    });

    test('boxes: 345, newest first, links to addresses', async ({ page }) => {
      await page.goto(path);
      const boxes = page.locator('.wall .box');
      await expect(boxes).toHaveCount(345);
      await expect(page.locator('.wall > :first-child')).toHaveClass(/\bcover\b/);
      await expect(page.locator('.wall a.box').first()).toHaveAttribute('href', '#year-2026');
      const glyphs = await boxes.evaluateAll(els => els.map(e => (e as HTMLElement).dataset.glyph ?? ''));
      expect(glyphs.filter(g => !g)).toEqual([]);
      await expect(page.locator('a.box[data-addr="2025-11-gemini-3"]')).toHaveAttribute('data-glyph', 'CODE\nRED');
      await expect(page.locator('a.box[data-addr="2024-11-computer-use-mcp"]')).toHaveAttribute('data-angle', '-20');
      await expect(page.locator('span.box.year.off')).toHaveAttribute('data-glyph', '2022');
      // 일수는 빌드한 날 기준. JS가 보는 날로 다시 채운다
      await expect(page.locator('.cover canvas.cv[data-kind="days"]')).toHaveAttribute('data-tpl', days.tpl);
      await expect(page.locator('.cover canvas.cv[data-kind="days"]')).toHaveAttribute('data-glyph', days.glyph);
    });

    test('without JS the details list is visible and box links jump to it', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('#details')).toBeVisible();
      await expect(page.locator('#detail')).toBeHidden();
      await page.locator('a.box[href="#2023-03-gpt-4"]').click();
      await expect(page.locator('[id="2023-03-gpt-4"]')).toBeInViewport();
    });

    test('plate font is preloaded', async ({ page }) => {
      await page.goto(path);
      expect(await page.locator(`link[rel=preload][as=font][href*="plate/${lang}-"]`).count()).toBeGreaterThan(0);
      expect(await page.locator(`link[rel=preload][as=font]:not([href*="plate/${lang}-"])`).count()).toBe(0);   // 다른 언어의 판 글꼴은 받지 않는다
      for (const link of await page.locator('link[rel=preload][as=font]').all()) {
        expect(await link.getAttribute('crossorigin')).not.toBeNull();
        expect((await page.request.get((await link.getAttribute('href'))!)).status()).toBe(200);
      }
    });

    test('language switch: this language current, the other links to its page', async ({ page }) => {
      const [cur, other] = lang === 'ko' ? ['KO', { label: 'EN', href: '/ai-timeline-log/' }] : ['EN', { label: 'KO', href: '/ai-timeline-log/ko/' }];
      await page.goto(path);
      for (const where of ['header.top', '.outro']) {
        const nav = page.locator(`${where} nav.lang`);
        await expect(nav.locator('a[aria-current="page"]')).toHaveText(cur);
        await expect(nav.locator('a', { hasText: other.label })).toHaveAttribute('href', other.href);
        await expect(nav.locator('a', { hasText: other.label })).not.toHaveAttribute('aria-current', /.*/);
        await expect(nav.locator('[aria-disabled="true"]')).toHaveCount(0);
      }
      await expect(page.locator('header.top a.report')).toHaveAttribute('target', '_blank');
      await expect(page.locator('header.top a.report')).toHaveText(ui[lang]!.report);
      // 스크립트가 없으면 제보 링크가 GitHub 이슈 목록으로 바로 간다
      await expect(page.locator('header.top a.report')).toHaveAttribute('href', 'https://github.com/lucas-flatwhite/ai-timeline-log/issues');
    });

    test('the GitHub icon sits left of the language switch and opens the repository in a new tab', async ({ page }) => {
      await page.goto(path);
      const gh = page.locator('header.top a.gh');
      await expect(gh).toHaveAttribute('href', 'https://github.com/lucas-flatwhite/ai-timeline-log');
      await expect(gh).toHaveAttribute('target', '_blank');
      await expect(gh).toHaveAttribute('rel', 'noopener');
      await expect(gh).toHaveAccessibleName(ui[lang]!.repo);
      await expect(gh.locator('svg')).toBeVisible();
      const [icon, nav] = [await gh.locator('svg').boundingBox(), await page.locator('header.top nav.lang').boundingBox()];
      expect(icon!.x + icon!.width).toBeLessThan(nav!.x);
    });

    test('the page ends with the author\'s site and X', async ({ page }) => {
      await page.goto(path);
      const by = page.locator('.outro .foot .by a');
      await expect(by).toHaveText(['lucasflatwhite.com', 'X @lucas_flatwhite']);
      await expect(by.nth(0)).toHaveAttribute('href', 'https://lucasflatwhite.com/');
      await expect(by.nth(1)).toHaveAttribute('href', 'https://x.com/lucas_flatwhite');
      await expect(by.nth(1)).toHaveAttribute('target', '_blank');
    });

    test('no external font service', async ({ page }) => {
      await page.goto(path);
      expect(await page.content()).not.toContain('fonts.googleapis.com');
    });

    test('tab and home-screen icons come from this site, at the sizes they declare', async ({ page }) => {
      await page.goto(path);
      const icons = page.locator('head link[rel="icon"], head link[rel="apple-touch-icon"]');
      await expect(icons).toHaveCount(3);
      for (const link of await icons.all()) {
        const href = (await link.getAttribute('href'))!;
        // '/favicon.png'처럼 base 없이 쓰면 404가 아니라 메인 사이트 아이콘(Lf)이 대신 뜬다
        expect(href).toMatch(/^\/ai-timeline-log\//);
        const res = await page.request.get(href);
        expect(res.status()).toBe(200);
        expect(res.headers()['content-type']).toBe('image/png');
        const png = await res.body();   // IHDR: 16바이트부터 가로, 20바이트부터 세로
        expect(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`).toBe(await link.getAttribute('sizes'));
      }
    });
  });

  test.describe(`${lang}: with JavaScript`, () => {
    test('the top bar fits on narrow phones with the GitHub icon', async ({ page }) => {
      await page.goto(path);
      for (const width of [320, 360, 375]) {
        await page.setViewportSize({ width, height: 640 });
        for (const sel of ['header.top a.gh svg', 'header.top nav.lang', 'header.top a.report']) {
          const box = await page.locator(sel).boundingBox();
          expect(box!.x + box!.width, `${sel} at ${width}`).toBeLessThanOrEqual(width);
        }
      }
    });

    test('the site name is not cut at common phone widths', async ({ page }) => {
      await page.goto(path);
      const name = page.locator('header.top .name');
      for (const width of [360, 375, 381, 390]) {
        await page.setViewportSize({ width, height: 640 });
        expect(await name.evaluate(e => e.scrollWidth <= e.clientWidth), `at ${width}`).toBe(true);
      }
    });

    test('details list is hidden; the top bar sticks', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('html')).toHaveClass(/\bjs\b/);
      await expect(page.locator('#details')).toBeHidden();
      await page.mouse.wheel(0, 2000);
      await page.waitForFunction(() => scrollY > 1000);
      await expect(page.locator('header.top')).toBeInViewport();
      expect(await page.locator('header.top').evaluate(e => getComputedStyle(e).position)).toBe('sticky');
    });

    test('report opens a guide dialog with GitHub and email; Esc and backdrop close it', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
      const dlg = page.locator('dialog#report');
      await expect(dlg).toBeHidden();
      await page.locator('header.top a.report').click();
      await expect(dlg).toBeVisible();
      expect(page.url()).not.toContain('github.com');   // 새 창이나 이동 없이 창만 연다
      await expect(dlg.locator('h2')).toHaveText(ui[lang]!.report);
      await expect(dlg.locator('a[href^="https://github.com/lucas-flatwhite/ai-timeline-log/issues"]')).toHaveText(`${ui[lang]!.reportIssue} ↗`);
      await expect(dlg.locator('a[href^="mailto:lucas.flatwhite@gmail.com"]')).toHaveText(ui[lang]!.reportMail);
      await expect(dlg.locator('.addr')).toHaveText('lucas.flatwhite@gmail.com');
      await page.keyboard.press('Escape');
      await expect(dlg).toBeHidden();
      await expect(page.locator('header.top a.report')).toBeFocused();
      // 맺음의 '만든 방법' 링크도 같은 창을 연다. 창 바깥(배경)을 누르면 닫힌다
      await page.locator('.making a[data-report]').click();
      await expect(dlg).toBeVisible();
      await page.mouse.click(5, 5);
      await expect(dlg).toBeHidden();
    });
  });
}

test.describe('exported files', () => {
  test('data files are served', async ({ request }) => {
    const json = await request.get('timeline.json');
    expect(json.status()).toBe(200);
    expect(json.headers()['content-type']).toMatch(/json/);
    expect((await json.json()).scenes).toHaveLength(72);
    for (const p of ['llms.txt', 'llms-full.txt', 'ko/llms-full.txt']) {
      const r = await request.get(p);
      expect(r.status(), p).toBe(200);
      expect((await r.text()).length, p).toBeGreaterThan(100);
    }
  });

  test('pages point to the data file', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('head link[rel=alternate][type="application/json"]')).toHaveAttribute('href', '/ai-timeline-log/timeline.json');
  });

  test('take section', async ({ page }) => {
    await page.goto('./ko/');
    const take = page.locator('#outro .take');
    const hrefs = await take.locator('a').evaluateAll(as => as.map(a => (a as HTMLAnchorElement).getAttribute('href')!));
    expect(hrefs).toEqual([
      'https://github.com/lucas-flatwhite/ai-timeline-log/releases/download/edition-5/poster-ko.pdf',
      'https://github.com/lucas-flatwhite/ai-timeline-log/releases/download/edition-5/poster-ko.png',
      'https://github.com/lucas-flatwhite/ai-timeline-log/releases',
      'https://lucasflatwhite.com/ai-timeline-log/ko/agent.md',
      'https://lucasflatwhite.com/ai-timeline-log/ko/llms-full.txt',
      'https://lucasflatwhite.com/ai-timeline-log/timeline.json',
      'https://github.com/lucas-flatwhite/ai-timeline-log/tree/main/skills/ai-lineage',
      'https://github.com/lucas-flatwhite/ai-timeline-log/blob/main/skills/ai-lineage/examples/moe.ko.png',
      '/ai-timeline-log/ko/feed.xml',
    ]);
    for (const a of await take.locator('a[href^="https://github.com"]').all()) {
      await expect(a).toHaveAttribute('target', '_blank');
      await expect(a).toHaveAttribute('rel', 'noopener');
    }
    const pst = take.locator('#take-poster');
    await expect(pst.locator('.eyebrow')).toHaveText('포스터 · 제 5판 · 2026.11.02');
    await expect(pst.locator('h3')).toHaveText('벽 전체를 A2 한 장에');
    // 받기 버튼에 규격과 용량을 함께 적는다(판 기록의 files. 숫자는 판마다 달라서 모양만 본다)
    await expect(pst.locator('.btn').nth(0)).toHaveText(/^PDF 받기\s*A2 · \d+(\.\d)?MB$/);
    await expect(pst.locator('.btn').nth(1)).toHaveText(/^PNG 받기\s*\d+px · \d+(\.\d)?MB$/);
    // 미리보기는 사이트에 둔 작은 AVIF 하나(늦게 읽는다). 포스터 원본은 GitHub에서 받는다
    const img = pst.locator('.proof img');
    await expect(img).toHaveAttribute('src', '/ai-timeline-log/poster/edition-5-ko.avif');
    await expect(img).toHaveAttribute('loading', 'lazy');
    await expect(img).toHaveAttribute('alt', '제 5판 포스터 미리보기');
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate(i => (i as HTMLImageElement).naturalWidth)).toBe(600);
    const box = (await img.boundingBox())!, fig = (await pst.locator('.proof').boundingBox())!;
    expect(box.width / fig.width).toBeCloseTo(300 / 520, 2);
    await expect(pst.locator('.proof svg text').first()).toHaveText('420 mm');
  });

  test('take section in English', async ({ page }) => {
    await page.goto('./');
    const pst = page.locator('#take-poster');
    await expect(pst.locator('.btn').nth(0)).toHaveText(/^Download PDF\s*A2 · \d+(\.\d)? MB$/);
    await expect(pst.locator('.proof img')).toHaveAttribute('src', '/ai-timeline-log/poster/edition-5-en.avif');
  });

  test('feeds are served', async ({ request, page }) => {
    for (const p of ['feed.xml', 'ko/feed.xml']) {
      const r = await request.get(p);
      expect(r.status(), p).toBe(200);
      expect(await r.text(), p).toContain('<rss version="2.0">');
    }
    await page.goto('./ko/');
    await expect(page.locator('head link[rel=alternate][type="application/rss+xml"]')).toHaveAttribute('href', '/ai-timeline-log/ko/feed.xml');
  });
});
