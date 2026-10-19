/* 탭·홈 화면 아이콘을 찍는다: 먹 사각형에 "AI"를 한지색으로 파낸 도장.
   색은 tokens.css, 글자 맞춤은 판화 엔진의 fitGlyph·drawGlyph를 그대로 쓴다.
   큰 그림을 줄이지 않고 크기마다 따로 그려서 16px에서도 흐려지지 않는다.
   실행: npm run favicon (결과는 public/에 커밋한다) */
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { fitGlyph, drawGlyph } from '../src/engine/glyph.ts';

const root = new URL('..', import.meta.url);
const OUT: [string, number][] = [['favicon-16.png', 16], ['favicon-32.png', 32], ['apple-touch-icon.png', 180]];

const tokens = readFileSync(new URL('src/styles/tokens.css', root), 'utf8');
const token = (name: string) => tokens.match(new RegExp(`--${name}:\\s*([^;]+);`))![1].trim();
const font = readFileSync(new URL('node_modules/@fontsource/black-han-sans/files/black-han-sans-latin-400-normal.woff2', root)).toString('base64');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(`<style>@font-face{font-family:"Black Han Sans";src:url(data:font/woff2;base64,${font}) format("woff2")}</style>`);
await page.addScriptTag({ content: `${fitGlyph}\n${drawGlyph}` });
const pngs = await page.evaluate(async ({ sizes, ink, paper }) => {
  const { fitGlyph, drawGlyph } = globalThis as unknown as typeof import('../src/engine/glyph.ts');
  const FONT = '"Black Han Sans"';
  await document.fonts.load('400 100px ' + FONT);
  if (!document.fonts.check('400 100px ' + FONT)) throw new Error('Black Han Sans를 불러오지 못했다');
  return sizes.map(S => {
    const c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d')!;
    g.fillStyle = ink; g.fillRect(0, 0, S, S);
    const fit = fitGlyph(g, 'AI', { x: 0, y: 0, w: S, h: S }, 0.74, FONT);
    g.fillStyle = paper; drawGlyph(g, fit, FONT);
    return c.toDataURL('image/png').split(',')[1];
  });
}, { sizes: OUT.map(([, s]) => s), ink: token('ink'), paper: token('paper') });
await browser.close();

OUT.forEach(([file], i) => {
  writeFileSync(new URL(`public/${file}`, root), Buffer.from(pngs[i], 'base64'));
  console.log(`public/${file}`);
});
