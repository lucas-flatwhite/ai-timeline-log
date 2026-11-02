import { daysBetween, formatLong, todayISO } from '../lib/dates.ts';

/* 일수와 소개 글 끝 날짜는 빌드한 날로 미리 찍혀 있다. 보는 사람의 오늘로 다시 채워서, 다시 배포하지 않아도 매일 바뀌게 한다.
   둘이 같은 오늘을 쓰므로 어긋나지 않는다. 표지 판화가 data-glyph를 읽기 전에 불러야 한다 */
export function applyLiveDays(): void {
  const start = document.getElementById('wall')?.dataset.liveStart;
  if (!start) return;
  const today = todayISO();
  const days = daysBetween(start, today).toLocaleString('en-US');
  const long = formatLong(document.documentElement.lang === 'ko' ? 'ko' : 'en', today);
  const put = (tpl: string) => tpl.split('{days}').join(days).split('{todayLong}').join(long);
  const cv = document.querySelector<HTMLCanvasElement>('.cover canvas[data-tpl]');
  if (cv) {
    cv.dataset.glyph = put(cv.dataset.tpl!);
    cv.setAttribute('aria-label', cv.dataset.glyph);
  }
  document.querySelectorAll<HTMLElement>('[data-live]').forEach(el => { el.textContent = put(el.dataset.live!); });
}
