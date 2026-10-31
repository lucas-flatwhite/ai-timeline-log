/* 판 포스터를 찍는다: 벽 전체(최신순, 표지 상자가 맨 위) + 아래 먹 띠(이름, 기간, 수, 판 번호, 주소, CC BY 4.0, QR).
   칸 수는 A판 세로 비율에 가장 가깝게 고르고, A2 300dpi 너비가 되는 배율로 찍는다. 시계는 판 날짜로 고정한다.
   미리보기 서버가 떠 있어야 한다: npm run build && npx astro preview --port 4321 --ignore-lock &
   실행: node scripts/poster.ts --edition <n> [--locale ko,en] [--out dir]   (결과는 커밋하지 않는다. GitHub Releases에만 올린다)
         node scripts/poster.ts --edition <n> --check                        (포스터를 낼 판인지만 검사, 종료 코드 0/1) */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Browser } from '@playwright/test';
import QRCode from 'qrcode';
import { loadContent } from '../src/lib/content.ts';
import { formatDot, type Locale } from '../src/lib/dates.ts';
import { ORIGIN } from '../src/lib/origin.ts';
import { A_RATIO, editionFor, pickColumns, posterFiles, posterScale } from '../src/lib/poster.ts';
import type { Edition } from '../src/lib/schema.ts';

const SITE = process.env.SITE ?? 'http://localhost:4321/ai-timeline-log/';
const PAGE: Record<Locale, string> = { ko: '', en: 'en/' };
const BAND: Record<Locale, { edition: (n: number) => string; counts: (s: number, i: number, days: string) => string }> = {
  ko: { edition: n => `제 ${n}판`, counts: (s, i, d) => `장면 ${s} · 사건 ${i} · ${d}` },
  en: { edition: n => `Edition ${n}`, counts: (s, i, d) => `${s} scenes · ${i} events · ${d}` },
};
const CSS = `html,body{background:var(--paper)!important}
  .top,#details,.outro,dialog{display:none!important}
  #poster{position:absolute;left:0;top:0;padding:40px;background:var(--paper)}
  #poster .wall{padding:0!important;justify-content:start}
  #poster .band{margin-top:28px;background:var(--ink);color:var(--paper);display:flex;align-items:center;gap:28px;padding:26px 32px}
  #poster .band .nm{font:400 56px/1 var(--display)}
  #poster .band .mono{font:500 15px/1.5 'IBM Plex Mono',var(--mono)}
  #poster .band .ed{font:400 30px/1 var(--display);margin-bottom:8px}
  #poster .band .qr{width:88px;height:88px;flex:none}
  #poster .band .qr svg{display:block;width:100%;height:100%}`;

type Size = { n: number; w: number; h: number };

function parseArgs(): { edition: number; locales: Locale[]; out: string; check: boolean } {
  const a = process.argv.slice(2), get = (k: string) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
  const edition = Number(get('--edition'));
  const locales = (get('--locale') ?? 'ko,en').split(',') as Locale[];
  if (!Number.isInteger(edition) || locales.some(l => !(l in PAGE))) {
    console.error('usage: node scripts/poster.ts --edition <n> [--locale ko,en] [--out dir] [--check]');
    process.exit(2);
  }
  return { edition, locales, out: get('--out') ?? 'out', check: a.includes('--check') };
}

/** 페이지를 열어 상자를 모두 새긴 뒤 포스터 모양으로 바꾼다. 칸 수를 주지 않으면 A판 비율로 고른다 */
async function open(browser: Browser, ed: Edition, locale: Locale, scale: number, qr: string, n?: number) {
  const page = await browser.newPage({ viewport: { width: 1800, height: 2400 }, deviceScaleFactor: scale });
  await page.clock.setFixedTime(new Date(`${ed.date}T12:00:00+09:00`));
  await page.goto(SITE + PAGE[locale]);
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1', null, { timeout: 60_000 });
  await page.waitForFunction(() => [...document.querySelectorAll('.wall .box:not(.off)')].every(b => b.classList.contains('carved')), null, { timeout: 120_000 });
  await page.evaluate(() => document.fonts.ready);
  const scenes = await page.locator('.wall .box.scene').count(), items = await page.locator('.wall .box.item').count();
  const days = (await page.locator('.cover .g').textContent())!.trim();
  const band = {
    name: loadContent().site.name,
    sub: `${formatDot(loadContent().site.start)} → ${formatDot(ed.date)} · ${BAND[locale].counts(scenes, items, days)}`,
    edition: BAND[locale].edition(ed.n), url: ORIGIN.replace(/^https:\/\//, '').replace(/\/$/, ''),
  };
  const sizes: Size[] = await page.evaluate(({ band, qr, css }) => {
    const wall = document.querySelector<HTMLElement>('.wall')!;
    document.head.append(Object.assign(document.createElement('style'), { textContent: css }));
    const poster = Object.assign(document.createElement('div'), { id: 'poster' });
    document.body.append(poster);
    poster.append(wall);
    const el = (cls: string, text = '') => Object.assign(document.createElement('div'), { className: cls, textContent: text });
    const b = el('band'), left = el(''), right = el('mono'), sub = el('mono', band.sub), q = el('qr');
    left.style.flex = '1';
    right.style.textAlign = 'right';
    sub.style.marginTop = '12px';
    left.append(el('nm', band.name), sub);
    right.append(el('ed', band.edition), el('', band.url), el('', 'CC BY 4.0'));
    q.innerHTML = qr;   // 이 스크립트가 qrcode로 만든 SVG(외부 입력이 아니다)
    b.append(left, right, q);
    poster.append(b);
    scrollTo(0, 0);
    const out = [];
    for (let k = 10; k <= 26; k++) {
      wall.style.gridTemplateColumns = `repeat(${k},64px)`;
      const r = poster.getBoundingClientRect();
      out.push({ n: k, w: r.width, h: r.height });
    }
    return out;
  }, { band, qr, css: CSS });
  const pick = n ?? pickColumns(sizes, A_RATIO);
  await page.evaluate(k => { document.querySelector<HTMLElement>('#poster .wall')!.style.gridTemplateColumns = `repeat(${k},64px)`; }, pick);
  return { page, pick, size: sizes.find(s => s.n === pick)! };
}

const opts = parseArgs();
let edition: Edition;
try { edition = editionFor(loadContent().editions, opts.edition); } catch (e) { console.error((e as Error).message); process.exit(1); }
if (opts.check) { console.log(`edition ${edition.n} (${edition.date}) has a poster`); process.exit(0); }

const qr = await QRCode.toString(ORIGIN, { type: 'svg', margin: 2, color: { dark: '#111110', light: '#E3E1D9' } });
mkdirSync(opts.out, { recursive: true });
const browser = await chromium.launch();
try {
  for (const locale of opts.locales) {
    const files = posterFiles(locale);
    /* 1) 배율 1로 칸 수와 크기를 정한다 2) A2 300dpi가 되는 배율로 다시 열어 찍는다(캔버스는 배율에 맞춰 새로 새겨진다) */
    const first = await open(browser, edition, locale, 1, qr);
    await first.page.close();
    const scale = posterScale(first.size.w);
    const shot = await open(browser, edition, locale, scale, qr, first.pick);
    const png = await shot.page.locator('#poster').screenshot({ type: 'png' });
    await shot.page.close();
    writeFileSync(join(opts.out, files.png), png);

    /* PDF(A2 한 쪽)와 화면용 PNG(가로 2400px)는 찍은 PNG를 담은 페이지에서 만든다 */
    const sheet = await browser.newPage({ viewport: { width: 2400, height: 3400 }, deviceScaleFactor: 1 });
    const src = `data:image/png;base64,${png.toString('base64')}`;
    await sheet.setContent(`<!doctype html><style>@page{size:420mm 594mm;margin:0}html,body{margin:0;background:#E3E1D9}
      #a{width:420mm;height:594mm;display:block;object-fit:contain}#w{width:2400px;display:block}</style>
      <img id="w" src="${src}"><img id="a" src="${src}">`);
    await sheet.evaluate(() => Promise.all([...document.images].map(i => i.decode())));
    await sheet.locator('#w').screenshot({ path: join(opts.out, files.web) });
    await sheet.evaluate(() => document.getElementById('w')!.remove());
    await sheet.pdf({ path: join(opts.out, files.pdf), width: '420mm', height: '594mm', printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } });
    await sheet.close();

    console.log(`${locale}: ${first.pick} columns, ${Math.round(first.size.w)}×${Math.round(first.size.h)} css px, scale ${scale.toFixed(3)} → ${png.readUInt32BE(16)}×${png.readUInt32BE(20)} px`);
  }
} finally {
  await browser.close();
}
