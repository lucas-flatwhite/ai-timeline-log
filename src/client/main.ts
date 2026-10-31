import { applyLiveDays } from './live.ts';
import { PLATE_ONLY, root } from './env.ts';
import { initWall } from './wall.ts';
import { initDetail } from './detail.ts';
import { initTopics } from './topics.ts';

/* 단계마다 오류를 따로 받는다. 어느 단계가 실패해도 다음 단계는 돌고, 끝에는 반드시 data-ready="1"이 된다 */
async function step(f: () => unknown): Promise<void> {
  try { await f(); } catch (e) { console.error(e); }
}

try {
  /* 1. 일수를 보는 날로 다시 채운다(표지 판이 data-glyph를 읽기 전) */
  await step(applyLiveDays);
  /* 2. 판 글꼴만 기다린다(대체 서체는 빼고). 오지 않으면 3.5초 뒤 대체 서체로라도 새긴다 */
  await step(() => {
    const glyphs = [...document.querySelectorAll<HTMLElement>('[data-glyph]')].map(e => e.dataset.glyph).join('');
    return Promise.race([
      document.fonts.load('400 64px ' + PLATE_ONLY, glyphs).catch(() => {}),
      new Promise(r => setTimeout(r, 3500)),
    ]);
  });
  /* 3. 첫 화면의 판을 새긴다 */
  await step(() => initWall().ready);
  /* 4. 주제 강조(?topic=). 상세 창보다 먼저: 주소에 주제와 사건이 함께 있으면 ←/→가 주제 안에서 움직이게 */
  await step(initTopics);
  /* 5. 상세 창. 주소로 들어왔으면 글꼴이 준비된 지금 연다 */
  await step(initDetail);
} finally {
  root.dataset.ready = '1';
}
