import { currentPick, setPick } from './pick.ts';

/* 위 막대의 주제 단추. 고르면 그 주제의 상자만 남기고 흐리게 한다.
   주소에 ?topic=<id>를 남긴다(해시는 상세 창 주소가 쓴다). 언어 링크도 같은 쿼리를 들고 간다 */
export function initTopics(): void {
  const tp = document.querySelector<HTMLElement>('.top .tp');
  if (!tp) return;
  const btn = tp.querySelector<HTMLButtonElement>('.tp-btn')!, list = tp.querySelector<HTMLElement>('.tp-list')!;
  const items = [...list.querySelectorAll<HTMLButtonElement>('button[data-topic]')];
  const names = new Map(items.filter(b => b.dataset.topic).map(b => [b.dataset.topic!, b.dataset.name!]));
  const label = tp.dataset.label!;

  const open = (v: boolean) => {
    list.hidden = !v;
    btn.setAttribute('aria-expanded', String(v));
  };
  /* 주소와 언어 링크의 쿼리만 바꾼다(해시는 그대로) */
  const withTopic = (href: string, id: string) => {
    const u = new URL(href, location.href);
    if (id) u.searchParams.set('topic', id); else u.searchParams.delete('topic');
    return u.pathname + u.search + u.hash;
  };
  const sync = () => {
    const p = currentPick(), id = p?.kind === 'topic' ? p.id : '';
    btn.textContent = id ? `${label}: ${names.get(id)}` : label;
    btn.setAttribute('aria-pressed', String(!!id));
    items.forEach(b => b.setAttribute('aria-current', String(b.dataset.topic === id)));
    try { history.replaceState(null, '', withTopic(location.href, id)); } catch { /* Safari가 너무 잦은 호출을 막는다. 주소만 못 바꾼다 */ }
    document.querySelectorAll<HTMLAnchorElement>('nav.lang a').forEach(a => a.setAttribute('href', withTopic(a.getAttribute('href')!, id)));
  };

  btn.addEventListener('click', () => open(list.hidden));
  list.addEventListener('click', e => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button[data-topic]');
    if (!b) return;
    const id = b.dataset.topic!;
    setPick(id ? { kind: 'topic', id } : null);
    open(false);
    btn.focus();
  });
  document.addEventListener('click', e => { if (!list.hidden && !tp.contains(e.target as Node)) open(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !list.hidden) { open(false); btn.focus(); }
  });
  document.addEventListener('pick', sync);

  const id = new URLSearchParams(location.search).get('topic');
  if (id && names.has(id)) setPick({ kind: 'topic', id });
  else {
    btn.setAttribute('aria-pressed', 'false');
  }
}
