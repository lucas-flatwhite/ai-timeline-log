import { applyLiveDays } from './live.ts';
import { PLATE_ONLY, root } from './env.ts';
import { initWall } from './wall.ts';
import { initDetail } from './detail.ts';
import { initPickbar } from './pickbar.ts';
import { initSearch } from './search.ts';
import { initEras } from './eras.ts';
import { initFind } from './find.ts';
import { initVisits } from './visits.ts';
import { initReport } from './report.ts';
import { initGuide } from './guide.ts';
import { initCopy } from './copy.ts';

/* 단계마다 오류를 따로 받는다. 어느 단계가 실패해도 다음 단계는 돌고, 끝에는 반드시 data-ready="1"이 된다 */
async function step(f: () => unknown): Promise<void> {
  try { await f(); } catch (e) { console.error(e); }
}

try {
  /* 0. 제보 안내 창. 글꼴을 기다리지 않고 바로 붙인다 */
  await step(initReport);
  /* 0. 포스터와 데이터 칸의 복사 버튼. 판과 상관없으니 바로 붙인다 */
  await step(initCopy);
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
  /* 4. 지난 방문 이후 새 상자(.new). 주제보다 먼저 붙여 두어야 새 상자 강조가 이 표시를 읽는다 */
  await step(initVisits);
  /* 5. 강조 띠, 찾기(?q=), 시기(?era=), 주제(?topic=). 상세 창보다 먼저: 주소에 강조와 사건이 함께 있으면 ←/→가 그 안에서 움직이게.
     띠가 먼저 'pick'을 들어야 다른 단계가 고른 강조도 띠에 보인다 */
  await step(initPickbar);
  await step(initSearch);
  await step(initEras);
  await step(initFind);
  /* 6. 상세 창. 주소로 들어왔으면 글꼴이 준비된 지금 연다 */
  await step(initDetail);
  /* 7. 맺음의 쓰는 법. 상세 창과 찾기 창이 붙은 뒤에 눌러야 그 창을 연다 */
  await step(initGuide);
} finally {
  root.dataset.ready = '1';
}
