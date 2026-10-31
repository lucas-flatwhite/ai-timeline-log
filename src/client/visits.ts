import { isNew, sinceFor } from '../lib/visits.ts';
import { currentPick, setPick } from './pick.ts';

/* 지난 방문 이후 새 상자. 저장소는 이 브라우저에만 있고 서버로 보내지 않는다.
   저장소가 막혀 있으면(개인 정보 보호 모드 등) 아무것도 표시하지 않고 지금처럼 동작한다 */
const LOCAL = 'atl:seen', SESSION = 'atl:since';
const get = (s: () => Storage, k: string) => { try { return s().getItem(k); } catch { return null; } };
const put = (s: () => Storage, k: string, v: string | null) => {
  try { if (v === null) s().removeItem(k); else s().setItem(k, v); } catch { /* 막혀 있으면 기억하지 않는다 */ }
};

export function initVisits(): void {
  const wall = document.getElementById('wall'), line = document.querySelector<HTMLElement>('.cover .since');
  const latest = wall?.dataset.latest;
  if (!wall || !line || !latest) return;
  const { since, session } = sinceFor(get(() => sessionStorage, SESSION), get(() => localStorage, LOCAL), latest);
  put(() => sessionStorage, SESSION, session);
  put(() => localStorage, LOCAL, latest);

  const fresh = [...wall.querySelectorAll<HTMLElement>('.box')].filter(b => isNew(b.dataset.added, since));
  if (!fresh.length) return;
  const mark = ` · ${line.dataset.label}`;
  fresh.forEach(b => {
    b.classList.add('new');
    b.setAttribute('aria-label', (b.getAttribute('aria-label') ?? '') + mark);
  });
  line.querySelector('span')!.textContent = line.dataset.tpl!.split('{n}').join(String(fresh.length));
  line.hidden = false;
  line.closest('.cover')?.classList.add('has-new');
  const btn = line.querySelector('button')!;
  btn.setAttribute('aria-pressed', 'false');
  btn.addEventListener('click', () => setPick(currentPick()?.kind === 'new' ? null : { kind: 'new' }));
  document.addEventListener('pick', () => btn.setAttribute('aria-pressed', String(currentPick()?.kind === 'new')));
}
