/* 공유 이미지를 찍는다: 격자 왼쪽 위(표지 상자 제외) 1200x630 위에 먹 띠를 얹고 이름과 기간을 쓴다.
   일수는 넣지 않는다(날마다 달라지는 값이라 이미지가 낡는다). 글꼴은 페이지 CSS의 것을 그대로 쓴다.
   미리보기 서버가 떠 있어야 한다: npm run build && npx astro preview --port 4321 --ignore-lock &
   실행: node scripts/og.ts ko [en…]  (결과는 public/og/<언어>.png에 커밋한다) */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { parse } from 'yaml';
import { chromium } from '@playwright/test';

const root = new URL('..', import.meta.url);
const SITE = process.env.OG_SITE ?? 'http://localhost:4321/ai-timeline-log/';
const W = 1200, H = 630;
const name = (parse(readFileSync(new URL('content/site.yaml', root), 'utf8')) as { name: string }).name;
const LOCALES: Record<string, { path: string; since: string }> = {
  ko: { path: '', since: '2022.11.30 → 현재' },
  en: { path: 'en/', since: 'Since Nov 30, 2022' },
};

const locales = process.argv.slice(2);
if (!locales.length) { console.error('usage: node scripts/og.ts <locale…>  (ko, en)'); process.exit(1); }
for (const l of locales) if (!LOCALES[l]) { console.error(`unknown locale: ${l}`); process.exit(1); }

const browser = await chromium.launch();
try {
  for (const locale of locales) {
    // 격자가 한 줄에 18칸 들어가는 너비. 가운데 정렬이라 양쪽 여백이 남으므로 안쪽 1200px만 잘라 낸다.
    // 표지가 차지하던 3줄이 비는 만큼 아래 상자가 올라오므로 화면 높이는 넉넉히 둔다
    const page = await browser.newPage({ viewport: { width: 1280, height: 1200 }, deviceScaleFactor: 1 });
    await page.goto(SITE + LOCALES[locale].path);
    await page.waitForFunction(() => document.documentElement.dataset.ready === '1', null, { timeout: 30_000 });
    await page.evaluate(async ({ since, name, W, H }) => {
      const $ = (s: string) => document.querySelector<HTMLElement>(s)!;
      // 표지와 위 막대를 치우고 격자를 화면 맨 위에 붙인다
      const s = document.createElement('style');
      s.textContent = '.top,.cover{display:none!important}.wall{padding-top:0!important}';
      document.head.append(s);
      // 치운 자리로 올라온 상자가 모두 새겨질 때까지 기다린다
      const wall = $('.wall'), top = wall.getBoundingClientRect().top + scrollY;
      const deadline = performance.now() + 20_000;
      for (;;) {
        const open = [...wall.querySelectorAll<HTMLElement>('.box')]
          .filter(b => b.getBoundingClientRect().top + scrollY - top < H && !b.classList.contains('carved') && !b.classList.contains('off'));
        if (!open.length) break;
        if (performance.now() > deadline) throw new Error(`새기지 못한 상자 ${open.length}개`);
        await new Promise(r => setTimeout(r, 50));
      }
      // 띠: 페이지 글꼴(Black Han Sans, IBM Plex Mono)로 쓴다
      const band = document.createElement('div');
      band.style.cssText = `position:absolute;left:0;right:0;top:${top + H - 224}px;height:224px;z-index:50;background:var(--ink);color:var(--paper);display:flex;flex-direction:column;justify-content:center;gap:18px;padding:0 64px`;
      band.innerHTML = '<div id="og-name" style="font:400 96px/1 var(--display);white-space:nowrap"></div>'
        + '<div id="og-since" style="font:500 34px/1 \'IBM Plex Mono\',var(--display);letter-spacing:.04em;white-space:nowrap"></div>';
      band.querySelector('#og-name')!.textContent = name;
      band.querySelector('#og-since')!.textContent = since;
      document.body.append(band);
      await Promise.all([
        document.fonts.load('400 96px "Black Han Sans"', name),
        document.fonts.load('500 34px "IBM Plex Mono"', since),
        document.fonts.load('400 34px "Black Han Sans"', since),
      ]);
      await document.fonts.ready;
    }, { since: LOCALES[locale].since, name, W, H });
    const wallTop = await page.evaluate(() => document.querySelector('.wall')!.getBoundingClientRect().top + scrollY);
    // 가운데 정렬된 격자의 안쪽에서 1200px를 자른다
    const gridBox = await page.evaluate(() => {
      const w = document.querySelector('.wall') as HTMLElement;
      const xs = [...w.querySelectorAll('.box')].map(b => b.getBoundingClientRect());
      return { left: Math.min(...xs.map(r => r.left)), right: Math.max(...xs.map(r => r.right)) };
    });
    const x = Math.round((gridBox.left + gridBox.right) / 2 - W / 2);
    const png = await page.screenshot({ clip: { x, y: wallTop, width: W, height: H }, fullPage: true });
    mkdirSync(new URL('public/og/', root), { recursive: true });
    writeFileSync(new URL(`public/og/${locale}.png`, root), png);
    console.log(`public/og/${locale}.png`);
    await page.close();
  }
} finally {
  await browser.close();
}
