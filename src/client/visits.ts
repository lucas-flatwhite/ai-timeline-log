import { isNew, sinceFor } from '../lib/visits.ts';
import { scrollToPicked, setPick } from './pick.ts';

/* 지난 방문 이후 새 상자. 저장소는 이 브라우저에만 있고 서버로 보내지 않는다.
   저장소가 막혀 있으면(개인 정보 보호 모드 등) 아무것도 표시하지 않고 지금처럼 동작한다 */
const LOCAL = 'atl:seen', SESSION = 'atl:since', OFF = 'atl:since-off';
const get = (s: () => Storage, k: string) => { try { return s().getItem(k); } catch { return null; } };
const put = (s: () => Storage, k: string, v: string | null) => {
  try { if (v === null) s().removeItem(k); else s().setItem(k, v); } catch { /* 막혀 있으면 기억하지 않는다 */ }
};

function storageAvailable(): boolean {
  try {
    sessionStorage.setItem('__test__', '1');
    sessionStorage.removeItem('__test__');
    return true;
  } catch {
    return false;
  }
}

export function initVisits(): void {
  const wall = document.getElementById('wall'), line = document.querySelector<HTMLElement>('.since');
  const latest = wall?.dataset.latest;
  document.querySelectorAll<HTMLElement>('.cv-recent, a[data-recent]:not(.box)').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      setPick({ kind: 'recent' });
      scrollToPicked();
    });
  });
  if (!wall || !line || !latest || !storageAvailable()) return;

  const fallback = wall.dataset.recentSince ?? null;
  const { since, session, first } = sinceFor(
    get(() => sessionStorage, SESSION),
    get(() => localStorage, LOCAL),
    latest,
    fallback,
  );
  put(() => sessionStorage, SESSION, session);
  put(() => localStorage, LOCAL, latest);

  const fresh = [...wall.querySelectorAll<HTMLElement>('.box')].filter(b =>
    first ? b.dataset.recent === '1' : isNew(b.dataset.added, since),
  );
  if (!fresh.length) return;

  if (!first) {
    const mark = ` · ${line.dataset.label}`;
    fresh.forEach(b => {
      b.classList.add('new');
      b.setAttribute('aria-label', (b.getAttribute('aria-label') ?? '') + mark);
    });
  }

  const tpl = (first ? line.dataset.tplFirst : line.dataset.tpl) ?? line.dataset.tpl!;
  const text = tpl.split('{n}').join(String(fresh.length));
  line.querySelector('span')!.textContent = text;
  const entry = document.querySelector<HTMLElement>('.tp-new');
  if (entry) {
    const btn = entry.querySelector('button')!;
    btn.textContent = text;
    btn.dataset.pick = first ? 'recent' : 'new';
    entry.hidden = false;
  }

  /* 알림 쪽지: 이 탭에서 닫았거나(보기, ×) 강조로 넘어간 뒤에는 다시 띄우지 않는다. 상자의 표시(.new)는 남는다 */
  if (get(() => sessionStorage, OFF) === latest) return;
  line.hidden = false;
  const off = () => { line.hidden = true; put(() => sessionStorage, OFF, latest); };
  line.querySelector('.since-show')!.addEventListener('click', () => {
    off();
    setPick(first ? { kind: 'recent' } : { kind: 'new' });
    scrollToPicked();
  });
  line.querySelector('.since-x')!.addEventListener('click', off);
}
