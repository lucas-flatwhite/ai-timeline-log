import { daysBetween, todayISO } from '../lib/dates.ts';

/* 일수는 빌드한 날로 미리 찍혀 있다. 보는 사람의 오늘로 다시 채워서, 다시 배포하지 않아도 매일 바뀌게 한다.
   판화(표지)가 data-wide / data-tall을 읽기 전에 불러야 한다 */
export function applyLiveDays(): void {
  const start = document.getElementById('hero')?.dataset.liveStart;
  if (!start) return;
  const days = daysBetween(start, todayISO()).toLocaleString('en-US');
  const put = (tpl: string) => tpl.split('{days}').join(days);
  const num = document.getElementById('numtext');
  if (num?.dataset.wideTpl && num.dataset.tallTpl) {
    num.dataset.wide = put(num.dataset.wideTpl);
    num.dataset.tall = put(num.dataset.tallTpl);
    const lines = num.dataset.tall.split('\n');
    num.querySelectorAll(':scope > span:not(.sr)').forEach((s, i) => { s.textContent = lines[i] ?? ''; });
  }
  document.querySelectorAll<HTMLElement>('[data-live]').forEach(el => { el.textContent = put(el.dataset.live!); });
}
