import { createHash } from 'node:crypto';
import { test, expect, type Page } from '@playwright/test';
import { ui } from '../../src/i18n/index.ts';

/* 가져가기의 AI 칸: 에이전트에게 알려 주기 버튼(복사), 쪽지, 그리고 그 글이 가리키는 설치 파일들 */
const go = async (page: Page, path: string) => {
  await page.goto(path);
  await page.locator('#take-ai').scrollIntoViewIfNeeded();
};

for (const path of ['./ko/', './']) {
  const lang = path === './' ? 'en' : 'ko';
  const t = ui[lang]!;

  test.describe(`${lang}: agent onboarding`, () => {
    /* 모든 브라우저에서 성공 경로를 본다. Playwright는 WebKit에 클립보드 권한을 줄 수 없어서,
       받은 글을 적어 두고 성공하는 가짜 writeText로 바꾼다(실제 클립보드는 아래 Chromium 시험이 본다) */
    test('copy shows copied state', async ({ page }) => {
      await page.addInitScript(() => {
        const w = window as unknown as { __copied: string[] };
        w.__copied = [];
        Object.defineProperty(navigator, 'clipboard', { value: { writeText: (s: string) => { w.__copied.push(s); return Promise.resolve(); } }, configurable: true });
      });
      await go(page, path);
      const btn = page.locator('button.agt-cp[data-copy="agt-clip"]');
      await expect(btn.locator('.t')).toHaveText(t.aiButton);
      await btn.click();
      await btn.click();   // 연달아 눌러도 마지막 누름부터 다시 센다
      await expect(btn).toHaveAttribute('data-state', 'copied');
      await expect(btn.locator('.t')).toHaveText(t.aiCopied);
      await expect(page.locator('#agt-hint')).toHaveText(t.aiHint);
      await expect(page.locator('#agt-hint')).toHaveAttribute('aria-live', 'polite');
      const note = await page.locator('#agt-clip').textContent();
      expect(await page.evaluate(() => (window as unknown as { __copied: string[] }).__copied)).toEqual([note, note]);
      expect(note).toContain(lang === 'ko' ? '/ko/agent.md' : 'ai-timeline-log/agent.md');
      await expect(btn).not.toHaveAttribute('data-state', /./, { timeout: 6000 });
      await expect(btn.locator('.t')).toHaveText(t.aiButton);
      await expect(page.locator('#agt-hint')).toHaveText('');
    });

    test('copy reaches the real clipboard (Chromium)', async ({ page, context, browserName }) => {
      test.skip(browserName !== 'chromium', 'only Chromium lets Playwright grant clipboard permissions');
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await go(page, path);
      await page.locator('button.agt-cp').click();
      await expect(page.locator('button.agt-cp')).toHaveAttribute('data-state', 'copied');
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await page.locator('#agt-clip').textContent());
    });

    test('copy falls back to selecting the note', async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) }, configurable: true });
      });
      await go(page, path);
      await page.locator('button.agt-cp').click();
      await expect(page.locator('button.agt-cp')).toHaveAttribute('data-state', 'failed');
      await expect(page.locator('#agt-hint')).toHaveText(t.aiFailed);
      const sel = await page.evaluate(() => getSelection()?.toString());
      expect(sel).toBe(await page.locator('#agt-clip').textContent());
    });

    test('button stays on one line at 360px', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await go(page, path);
      const btn = page.locator('button.agt-cp');
      const m = await btn.evaluate(b => ({ sw: b.scrollWidth, cw: b.clientWidth, h: b.getBoundingClientRect().height, r: b.getBoundingClientRect().right }));
      expect(m.sw).toBeLessThanOrEqual(m.cw);
      expect(m.h).toBeLessThan(60);
      expect(m.r).toBeLessThanOrEqual(360);
      await expect(btn.locator('.t')).toHaveCSS('white-space', 'nowrap');
    });

    test('examples put the label above the request on a wide screen', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 900 });
      await go(page, path);
      for (const li of await page.locator('#take-ai .agt-ex li').all()) {
        const em = (await li.locator('em').boundingBox())!, q = (await li.locator('q').boundingBox())!;
        expect(q.y).toBeGreaterThanOrEqual(em.y + em.height - 1);   // 이름 아래에 글
        expect(Math.abs(q.x - em.x)).toBeLessThan(2);                 // 같은 왼쪽 끝
      }
    });

    test.describe('without JS', () => {
      test.use({ javaScriptEnabled: false });
      test('note and link stay, button hides', async ({ page }) => {
        await page.goto(path);
        await expect(page.locator('button.agt-cp')).toBeHidden();
        await expect(page.locator('#agt-clip')).toBeVisible();
        const agent = lang === 'ko' ? 'https://lucasflatwhite.com/ai-timeline-log/ko/agent.md' : 'https://lucasflatwhite.com/ai-timeline-log/agent.md';
        await expect(page.locator('#take-ai .links a').first()).toHaveAttribute('href', agent);
        await expect(page.locator('#take-ai .agt-ex li')).toHaveCount(2);
      });
    });
  });
}

test('served index digest matches served SKILL.md', async ({ request }) => {
  const base = new URL('http://localhost:4321/ai-timeline-log/.well-known/agent-skills/index.json');
  const r = await request.get('./.well-known/agent-skills/index.json');
  expect(r.status()).toBe(200);
  const idx = await r.json() as { skills: { name: string; url: string; digest: string }[] };
  expect(idx.skills.map(s => s.name)).toEqual(['ai-timeline-log']);
  const s = idx.skills[0]!;
  const body = await (await request.get(new URL(s.url, base).toString())).body();
  expect('sha256:' + createHash('sha256').update(body).digest('hex')).toBe(s.digest);
  expect(body.toString('utf8')).toMatch(/^---\nname: ai-timeline-log\n/);
  for (const p of ['./agent.md', './ko/agent.md']) expect((await request.get(p)).status(), p).toBe(200);
});
