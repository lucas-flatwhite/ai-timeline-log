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
    test('copy shows copied state', async ({ page, context, browserName }) => {
      if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await go(page, path);
      const btn = page.locator('button.agt-cp[data-copy="agt-clip"]');
      await expect(btn.locator('.t')).toHaveText(t.aiButton);
      await btn.click();
      await btn.click();   // 연달아 눌러도 마지막 누름부터 다시 센다
      /* 클립보드 권한을 줄 수 있는 Chromium에서는 반드시 복사된다. CI의 Linux WebKit은 권한 없이 거부할 수 있어
         그때는 실패 안내가 맞게 뜨는지만 본다(실패 경로 자체는 아래 fallback 시험이 따로 본다) */
      await expect(btn).toHaveAttribute('data-state', browserName === 'chromium' ? 'copied' : /^(copied|failed)$/);
      if (await btn.getAttribute('data-state') === 'copied') {
        await expect(btn.locator('.t')).toHaveText(t.aiCopied);
        await expect(page.locator('#agt-hint')).toHaveText(t.aiHint);
      } else {
        await expect(page.locator('#agt-hint')).toHaveText(t.aiFailed);
      }
      await expect(page.locator('#agt-hint')).toHaveAttribute('aria-live', 'polite');
      if (browserName === 'chromium') {
        const clip = await page.evaluate(() => navigator.clipboard.readText());
        expect(clip).toBe(await page.locator('#agt-clip').textContent());
        expect(clip).toContain(lang === 'ko' ? '/ko/agent.md' : 'ai-timeline-log/agent.md');
      }
      await expect(btn).not.toHaveAttribute('data-state', /./, { timeout: 6000 });
      await expect(btn.locator('.t')).toHaveText(t.aiButton);
      await expect(page.locator('#agt-hint')).toHaveText('');
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
