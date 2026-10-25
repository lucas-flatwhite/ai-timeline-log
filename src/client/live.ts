import { daysBetween, todayISO } from '../lib/dates.ts';

/* 일수는 빌드한 날로 미리 찍혀 있다. 보는 사람의 오늘로 다시 채워서, 다시 배포하지 않아도 매일 바뀌게 한다.
   표지 판화가 data-glyph를 읽기 전에 불러야 한다 */
export function applyLiveDays(): void {
  const start = document.getElementById('wall')?.dataset.liveStart;
  if (!start) return;
  const days = daysBetween(start, todayISO()).toLocaleString('en-US');
  const put = (tpl: string) => tpl.split('{days}').join(days);
  const cv = document.querySelector<HTMLCanvasElement>('.cover canvas[data-tpl]');
  if (cv) {
    cv.dataset.glyph = put(cv.dataset.tpl!);
    cv.setAttribute('aria-label', cv.dataset.glyph);
  }
  document.querySelectorAll<HTMLElement>('[data-live]').forEach(el => { el.textContent = put(el.dataset.live!); });
}
