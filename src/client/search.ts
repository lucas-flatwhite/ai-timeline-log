import { hit, norm, terms } from '../lib/search.ts';
import { addMatch, currentPick, scrollToPicked, setPick } from './pick.ts';

/* 찾기 글. 이 페이지 언어의 글은 이미 페이지에 있으니(상세 글, 상자 글자, 날짜) 바로 쓰고,
   다른 언어의 글은 찾기 창을 처음 열 때 search.json으로 받아 덧붙인다. 받지 못하면 이 언어로만 찾는다 */
const hay = new Map<string, string>();
let cache: { q: string; ts: string[] } = { q: '', ts: [] };
let loading: Promise<void> | null = null;

function fromPage(): void {
  document.querySelectorAll<HTMLElement>('.wall .box:not(.year)').forEach(b => {
    hay.set(b.dataset.addr!, norm(`${b.querySelector(".d")?.textContent ?? ""} ${b.dataset.glyph}`));
  });
  const add = (addr: string, text: string) => hay.set(addr, (hay.get(addr) ?? '') + ' ' + norm(text));
  document.querySelectorAll<HTMLElement>('#details article.detail:not(.year)').forEach(a => {
    add(a.dataset.addr!, [a.querySelector('.meta'), a.querySelector('h2'), a.querySelector('.lede')].map(e => e?.textContent ?? '').join(' '));
    a.querySelectorAll<HTMLElement>('ol.items > li').forEach(li => add(li.dataset.addr!, li.querySelector('.text')?.textContent ?? ''));
  });
}

/** 다른 언어의 찾기 글을 한 번만 받는다. 받으면 지금 찾는 말을 다시 맞춘다 */
export function loadOther(): Promise<void> {
  loading ??= fetch(new URL('search.json', location.href))
    .then(r => (r.ok ? r.json() : {}))
    .then((other: Record<string, string>) => {
      for (const [a, t] of Object.entries(other)) if (hay.has(a)) hay.set(a, hay.get(a)! + ' ' + t);
      const p = currentPick();
      if (p?.kind === 'q') setPick(p);
    })
    .catch(() => { /* 이 언어로만 찾는다 */ });
  return loading;
}

export function initSearch(): void {
  fromPage();
  addMatch('q', (b, p) => {
    if (cache.q !== p.q) cache = { q: p.q, ts: terms(p.q) };
    return hit(hay.get(b.dataset.addr!) ?? '', cache.ts);
  });
  /* 주소로 찾는 말이 들어왔으면(?q=) 바로 이 언어로 맞추고, 다른 언어 글도 받아 온다 */
  const q = new URLSearchParams(location.search).get('q');
  if (q && terms(q).length) {
    setPick({ kind: 'q', q });
    scrollToPicked();
    void loadOther();
  }
}
