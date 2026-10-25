import { applyLiveDays } from './live.ts';
import { PLATE_ONLY, root } from './env.ts';
import { initWall } from './wall.ts';

/* 1. 일수를 보는 날로 다시 채운다(표지 판이 data-glyph를 읽기 전) */
applyLiveDays();
/* 2. 판 글꼴만 기다린다(대체 서체는 빼고). 오지 않으면 3.5초 뒤 대체 서체로라도 새긴다 */
const glyphs = [...document.querySelectorAll<HTMLElement>('[data-glyph]')].map(e => e.dataset.glyph).join('');
await Promise.race([
  document.fonts.load('400 64px ' + PLATE_ONLY, glyphs).catch(() => {}),
  new Promise(r => setTimeout(r, 3500)),
]);
/* 3. 첫 화면의 판을 새긴다 */
await initWall().ready;
root.dataset.ready = '1';
