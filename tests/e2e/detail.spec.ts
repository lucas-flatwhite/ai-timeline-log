import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { test, expect, type Page } from '@playwright/test';
import { ui } from '../../src/i18n/index.ts';

const ready = (page: Page, timeout = 15_000) => page.waitForFunction(() => document.documentElement.dataset.ready === '1', null, { timeout });
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  return errors;
}
const hash = (page: Page) => page.evaluate(() => location.hash);
/* 닫힘(close 이벤트)은 비동기라 주소가 바뀔 때까지 기다린다 */
const hashIs = (page: Page, h: string) => expect.poll(() => hash(page)).toBe(h);
/* 주소만 다른 goto는 같은 문서 안의 이동이라 다시 시작하지 않는다. 매번 새로 연다 */
async function visit(page: Page, path: string, h = '') {
  await page.goto('about:blank');
  await page.goto(path + h);
  await ready(page);
}
/* 사건 글은 content/에서 직접 읽는다 */
const sceneYaml = (file: string) => parse(readFileSync(join(process.cwd(), 'content', 'scenes', file), 'utf8')) as
  Record<'ko' | 'en', { title: string }> & { items: ({ date: string } & Record<'ko' | 'en', string>)[] };
const sandbox = sceneYaml('2026-07-21-sandbox-escape.yaml');
const dlg = (page: Page) => page.locator('#detail');
/* 격자의 시간순(연도 판 제외). 앞이 최신 */
const order = (page: Page) => page.locator('.wall .box:not(.year)').evaluateAll(els => els.map(e => (e as HTMLElement).dataset.addr!));
/* 시험용으로만 HTML을 고친다(내용에는 아직 별칭·사건 출처가 없다). 바꿀 곳이 없으면 시험이 헛돌지 않게 실패한다 */
async function rewrite(page: Page, from: string | RegExp, to: string) {
  await page.route(/\/ai-timeline-log\/(en\/)?(#.*)?$/, async r => {
    const res = await r.fetch(), html = await res.text(), body = html.replace(from, to);
    if (body === html) throw new Error(`fixture: not found: ${from}`);
    await r.fulfill({ response: res, body });
  });
}

for (const path of ['./', './en/']) {
  const lang = path === './' ? 'ko' : 'en';
  const t = ui[lang]!;
  const gpt4 = sceneYaml('2023-03-14-gpt-4.yaml')[lang].title;
  const faces = lang === 'ko' ? ['PlateK:loaded', 'PlateL:loaded'] : ['PlateL:loaded'];
  const families = lang === 'ko' ? 'PlateL, PlateK' : 'PlateL';

  test.describe(`${lang}: desktop`, () => {
    test.use({ viewport: { width: 1280, height: 860 } });

    test('click opens the scene; list click switches to the event', async ({ page }) => {
      const errors = watchErrors(page);
      await visit(page, path);
      await page.locator('a.box[href="#2023-03-gpt-4"]').click();
      await expect(dlg(page)).toHaveAttribute('open', '');
      await expect(page.locator('#detail-title')).toHaveText(gpt4);
      await expect(page.locator('#detail .dbody p.meta')).toHaveText(/^20230314 · /);
      await hashIs(page, '#2023-03-gpt-4');
      // 복제한 글에 id가 겹치지 않는다
      expect(await page.locator('#detail .dbody [id]').evaluateAll(els => els.map(e => e.id))).toEqual(['detail-title']);
      await expect(page.locator('#detail .dbody li.hl')).toHaveCount(0);
      // 장면 출처가 상세 창 아래 줄에 모인다
      await expect(page.locator('#detail .dsrc')).toBeVisible();
      await expect(page.locator('#detail .dsrc a').first()).toHaveAttribute('href', 'https://openai.com/index/gpt-4-research/');

      const li = page.locator('#detail .dbody ol.items > li').nth(1);
      const addr = (await li.getAttribute('data-addr'))!;
      await li.click();
      await expect(page.locator('#detail .dbody li.hl')).toHaveCount(1);
      await expect(page.locator('#detail .dbody li.hl')).toHaveAttribute('data-addr', addr);
      await hashIs(page, '#' + addr);
      await expect(page.locator('#detail .dbody p.meta')).toContainText(t.sceneOf(gpt4));
      await expect(page.locator('#detail-title')).toHaveText(gpt4);
      expect(errors).toEqual([]);
    });

    test('arrow keys move in time order', async ({ page }) => {
      await visit(page, path);
      const all = await order(page);
      const at = all.findIndex(a => a.includes('~'));
      await page.locator(`a.box[data-addr="${all[at]}"]`).click();
      await expect(dlg(page)).toHaveAttribute('open', '');
      await hashIs(page, '#' + all[at]);
      await page.keyboard.press('ArrowLeft');
      await hashIs(page, '#' + all[at + 1]);
      await page.keyboard.press('ArrowRight');
      await hashIs(page, '#' + all[at]);
      await page.locator('#detail .prev').click();
      await hashIs(page, '#' + all[at + 1]);
      // 맨 처음(가장 최신) 상자에서는 다음이 없다
      await page.locator('#detail .x').click();
      await page.locator(`a.box[data-addr="${all[0]}"]`).click();
      await expect(page.locator('#detail .next')).toBeDisabled();
      await expect(page.locator('#detail .prev')).toBeEnabled();
      await page.keyboard.press('ArrowRight');
      await hashIs(page, '#' + all[0]);
      // 맨 끝(가장 과거) 상자에서는 이전이 없다
      await page.locator('#detail .x').click();
      await page.locator(`a.box[data-addr="${all.at(-1)}"]`).click();
      await expect(page.locator('#detail .prev')).toBeDisabled();
      await expect(page.locator('#detail .next')).toBeEnabled();
    });

    test('Esc closes and returns focus to the box; hash cleared', async ({ page, browserName }) => {
      await visit(page, path);
      // WebKit(macOS)은 Tab만으로는 링크에 가지 않는다(Safari 기본값)
      const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
      for (let n = 0; n < 40; n++) {
        await page.keyboard.press(tab);
        if (await page.evaluate(() => document.activeElement?.matches('a.box.item'))) break;
      }
      const addr = await page.evaluate(() => (document.activeElement as HTMLElement).dataset.addr);
      expect(addr).toBe(await page.locator('.wall a.box.item').first().getAttribute('data-addr'));
      await expect(page.locator('.wall')).toHaveClass(/\bfocus\b/);   // 키보드 초점도 같은 장면을 강조한다
      await page.keyboard.press('Enter');
      await expect(dlg(page)).toHaveAttribute('open', '');
      await hashIs(page, '#' + addr);
      await page.keyboard.press('Escape');
      await expect(dlg(page)).not.toHaveAttribute('open', '');
      expect(await page.evaluate(() => (document.activeElement as HTMLElement).dataset.addr)).toBe(addr);
      await hashIs(page, '');
    });

    test('focus returns to the box that opened the dialog, even after moving', async ({ page }) => {
      await visit(page, path);
      const all = await order(page);
      const at = all.findIndex(a => a.includes('~'));
      await page.locator(`a.box[data-addr="${all[at]}"]`).click();
      await expect(dlg(page)).toHaveAttribute('open', '');
      await page.keyboard.press('ArrowLeft');
      await hashIs(page, '#' + all[at + 1]);
      await page.locator('#detail .dbody ol.items > li').first().click();
      await page.keyboard.press('Escape');
      await expect(dlg(page)).not.toHaveAttribute('open', '');
      await hashIs(page, '');
      expect(await page.evaluate(() => (document.activeElement as HTMLElement).dataset.addr)).toBe(all[at]);
    });

    test('list items work from the keyboard', async ({ page }) => {
      await visit(page, path, '#2023-03-gpt-4');
      const items = page.locator('#detail .dbody ol.items > li');
      await expect(items.first()).toHaveAttribute('tabindex', '0');
      const addrs = await items.evaluateAll(els => els.map(e => (e as HTMLElement).dataset.addr!));
      await items.nth(0).focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('#detail .dbody li.hl')).toHaveAttribute('data-addr', addrs[0]);
      await hashIs(page, '#' + addrs[0]);
      // 다시 그린 뒤에도 초점은 같은 항목에 있다. Tab으로 다음 항목에 가서 Space
      expect(await page.evaluate(() => (document.activeElement as HTMLElement).dataset.addr)).toBe(addrs[0]);
      await page.keyboard.press('Tab');
      await page.keyboard.press(' ');
      await expect(page.locator('#detail .dbody li.hl')).toHaveAttribute('data-addr', addrs[1]);
      await hashIs(page, '#' + addrs[1]);
      await expect(dlg(page)).toHaveAttribute('open', '');
    });

    test('closing with × or the backdrop also returns focus', async ({ page }) => {
      await visit(page, path);
      await page.locator('a.box[href="#2023-03-gpt-4"]').click();
      await page.locator('#detail .x').click();
      await expect(dlg(page)).not.toHaveAttribute('open', '');
      expect(await page.evaluate(() => (document.activeElement as HTMLElement).dataset.addr)).toBe('2023-03-gpt-4');
      await hashIs(page, '');
      await page.locator('a.box[href="#2023-03-gpt-4"]').click();
      // 카드 안쪽 여백을 눌러도 닫히지 않는다
      const r = (await dlg(page).boundingBox())!;
      await page.mouse.click(r.x + 8, r.y + r.height / 2);
      await expect(dlg(page)).toHaveAttribute('open', '');
      await page.mouse.click(8, 8);
      await expect(dlg(page)).not.toHaveAttribute('open', '');
      await hashIs(page, '');
    });

    test('deep link to an event opens after fonts', async ({ page }) => {
      const errors = watchErrors(page);
      // 판 글꼴을 늦게 보낸다(3.5초 대체보다는 빨리). 창을 여는 순간(같은 작업에서 판을 새긴다)의 글꼴 상태를 적어 둔다
      await page.route('**/plate/**', async r => { await new Promise(res => setTimeout(res, 1500)); await r.continue(); });
      await page.addInitScript(() => {
        const w = window as unknown as { __atOpen: string[] };
        const orig = HTMLDialogElement.prototype.showModal;
        HTMLDialogElement.prototype.showModal = function () {
          w.__atOpen = [...document.fonts].filter(f => f.family.startsWith('Plate')).map(f => `${f.family}:${f.status}`).sort();
          return orig.call(this);
        };
      });
      await visit(page, path, '#2026-07-sandbox-escape~20260721');
      expect(await page.evaluate(() => (window as unknown as { __atOpen: string[] }).__atOpen)).toEqual(faces);
      await expect(dlg(page)).toHaveAttribute('open', '');
      await expect(page.locator('#detail .dbody li.hl')).toContainText(sandbox.items.find(it => String(it.date) === '2026-07-21')![lang]);
      const glyph = (await page.locator('a.box[data-addr="2026-07-sandbox-escape~20260721"]').getAttribute('data-glyph'))!;
      expect(await page.evaluate(([f, g]) => document.fonts.check(`64px ${f}`, g), [families, glyph])).toBe(true);
      // 판화를 280px로 새겼다
      expect(await page.locator('#detail .dcv').evaluate((c: HTMLCanvasElement) => [c.clientWidth, c.clientHeight, c.width > 0])).toEqual([280, 280, true]);
      expect(errors).toEqual([]);
    });

    test('alias and year addresses open', async ({ page }) => {
      await rewrite(page, 'data-addr="2023-03-gpt-4" data-aliases ', 'data-addr="2023-03-gpt-4" data-aliases="2023-gpt4 gpt-4-launch" ');
      await visit(page, path, '#gpt-4-launch');
      await expect(dlg(page)).toHaveAttribute('open', '');
      await expect(page.locator('#detail-title')).toHaveText(gpt4);
      await hashIs(page, '#2023-03-gpt-4');   // 별칭은 지금 주소로 바꾼다

      await visit(page, path, '#year-2024');
      await expect(dlg(page)).toHaveAttribute('open', '');
      await expect(page.locator('#detail-title')).toContainText('2024');
      // 연도 판: 목록·이동·정정 링크 없음
      await expect(page.locator('#detail .prev')).toBeDisabled();
      await expect(page.locator('#detail .next')).toBeDisabled();
      await expect(page.locator('#detail .fix')).toBeHidden();
      await expect(page.locator('#detail .dsrc')).toBeHidden();
      await page.keyboard.press('ArrowLeft');
      await hashIs(page, '#year-2024');
      // 연도 다음에 장면을 열면 이동·정정 링크가 돌아온다
      await page.keyboard.press('Escape');
      await page.locator('a.box[href="#2023-03-gpt-4"]').click();
      await expect(page.locator('#detail .fix')).toBeVisible();
      await expect(page.locator('#detail .prev')).toBeEnabled();
    });

    test('a failing wall still lets startup finish and the address open', async ({ page }) => {
      // 판 새기기가 통째로 실패해도(IntersectionObserver가 없는 경우) data-ready가 되고 상세가 열린다. console.error는 예상된다
      await page.addInitScript(() => {
        (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = class { constructor() { throw new Error('no IO'); } };
      });
      await visit(page, path, '#2023-03-gpt-4');
      await expect(dlg(page)).toHaveAttribute('open', '');
      await expect(page.locator('#detail-title')).toHaveText(gpt4);
    });

    test('bad hashes are ignored', async ({ page }) => {
      const errors = watchErrors(page);
      for (const h of ['#%E0%A4%A', '#없는-id', '#year-2022', '#year-1999']) {
        await visit(page, path, h);
        await expect(dlg(page)).not.toHaveAttribute('open', '');
      }
      expect(errors).toEqual([]);
    });

    test('correction link carries the event', async ({ page }) => {
      await visit(page, path, '#2026-07-sandbox-escape~20260721');
      const href = (await page.locator('#detail a.fix').getAttribute('href'))!;
      expect(href).toContain('template=correction.yml');
      expect(href).toContain('event=');
      expect(href).toContain(encodeURIComponent('#2026-07-sandbox-escape~20260721'));
      // 장면은 장면의 링크
      await visit(page, path, '#2026-07-sandbox-escape');
      const scene = (await page.locator('#detail a.fix').getAttribute('href'))!;
      expect(scene).toContain(encodeURIComponent('#2026-07-sandbox-escape') + '&lang=');
    });

    test('sources: the event\'s own, else the scene\'s', async ({ page }) => {
      // 소라 장면에는 사건 출처가 없어서 시험용 출처를 넣는다
      const addr = '2026-03-sora-shutdown~20260924';
      await rewrite(page, /(id="2026-03-sora-shutdown"[^]*?)(<p class="src")/,
        `$1<p class="src" data-for="${addr}" data-label="${t.sources} · 20260924"><a href="https://example.org/api">api</a></p>$2`);
      await visit(page, path, '#' + addr);
      await expect(page.locator('#detail .dsrc a')).toHaveText(['api']);
      await expect(page.locator('#detail .dsrc')).toHaveAttribute('data-label', `${t.sources} · 20260924`);
      // 사건 출처가 없는 사건은 장면 출처
      await page.locator('#detail .dbody ol.items > li').first().click();
      await expect(page.locator('#detail .dsrc a')).toHaveCount(2);
      await expect(page.locator('#detail .dsrc a').first()).toHaveAttribute('href', /decrypt\.co/);
      await expect(page.locator('#detail .dsrc')).toHaveAttribute('data-label', t.sources);
      // 복제한 글의 출처 줄은 두지 않는다(링크가 두 번 읽히지 않게)
      await expect(page.locator('#detail .dbody .src')).toHaveCount(0);
    });

    test('hover lights up the same scene', async ({ page }) => {
      await visit(page, path);
      const box = page.locator('.wall a.box.item').first();
      const scene = (await box.getAttribute('data-scene'))!;
      const items = await page.locator(`#details article[data-addr="${scene}"] ol.items > li`).count();
      await box.hover();
      await expect(page.locator('.wall')).toHaveClass(/\bfocus\b/);
      await expect(page.locator('.wall .box.rel')).toHaveCount(items + 1);
      await page.mouse.move(2, 2);
      await expect(page.locator('.wall')).not.toHaveClass(/\bfocus\b/);
      await expect(page.locator('.wall .box.rel')).toHaveCount(0);
    });

    test('language links keep the open address', async ({ page }) => {
      await visit(page, path);
      await page.locator('a.box[href="#2023-03-gpt-4"]').click();
      const hrefs = await page.locator('nav.lang a').evaluateAll(els => els.map(e => e.getAttribute('href')!));
      expect(hrefs.length).toBeGreaterThan(0);
      for (const h of hrefs) expect(h).toMatch(/^\/ai-timeline-log\/.*#2023-03-gpt-4$/);
      await page.keyboard.press('Escape');
      await expect.poll(() => page.locator('nav.lang a').evaluateAll(els => els.map(e => e.getAttribute('href')!).filter(h => h.includes('#')))).toEqual([]);
    });
  });

  test.describe(`${lang}: phone`, () => {
    test.use({ viewport: { width: 390, height: 780 } });

    test('opens full screen and closes', async ({ page }) => {
      await visit(page, path);
      const box = page.locator('.wall a.box.item').first();
      await box.click();
      await expect(dlg(page)).toHaveAttribute('open', '');
      const r = (await dlg(page).boundingBox())!;
      expect([r.x, r.y, r.width]).toEqual([0, 0, 390]);
      await page.locator('#detail .x').click();
      await expect(dlg(page)).not.toHaveAttribute('open', '');
      await hashIs(page, '');
    });
  });
}
