import { boxSpec, carveTile, readPics } from './tiles.ts';

/* 상세 창. 글은 #details의 article을 복제해 쓴다(문구는 모두 빌드 때 마크업에 들어 있다).
   주소: 장면 id, 사건 주소(li id), year-YYYY, 장면 별칭. 열면 주소를 바꾸고 닫으면 지운다(방문 기록은 쌓지 않는다) */
export function initDetail(): void {
  const dlg = document.getElementById('detail') as HTMLDialogElement | null;
  const wall = document.querySelector<HTMLElement>('.wall');
  if (!dlg || !wall) return;
  const $ = <T extends Element>(s: string) => dlg.querySelector<T>(s)!;
  const cv = $<HTMLCanvasElement>('.dcv'), body = $<HTMLElement>('.dbody'), src = $<HTMLElement>('.dsrc');
  const fix = $<HTMLAnchorElement>('a.fix'), prev = $<HTMLButtonElement>('.prev'), next = $<HTMLButtonElement>('.next');
  const pics = readPics(), langs = [...document.querySelectorAll<HTMLAnchorElement>('nav.lang a')];
  const boxOf = new Map([...wall.querySelectorAll<HTMLElement>('a.box')].map(b => [b.dataset.addr!, b]));
  /* 앞뒤 순서는 격자의 DOM 순서(최신이 앞, 연도 판 제외). 앞(이전 인덱스)이 다음 사건, 뒤가 이전(과거) 사건 */
  const seq = [...wall.querySelectorAll<HTMLElement>('.box:not(.year)')].map(b => b.dataset.addr!);
  const alias = new Map<string, string>();
  document.querySelectorAll<HTMLElement>('#details article[data-aliases]').forEach(a =>
    a.dataset.aliases!.split(/\s+/).filter(Boolean).forEach(k => alias.set(k, a.dataset.addr!)));
  /* cur: 지금 보이는 주소. opener: 창을 연 상자(앞뒤로 옮겨 다녀도 바뀌지 않는다. 닫으면 여기로 초점을 돌린다) */
  let cur: string | null = null, opener: HTMLElement | undefined;

  /* 주소를 글(장면·연도 article, 사건이면 그 li)로 바꾼다. 모르는 주소면 null */
  function resolve(addr: string): { article: HTMLElement; li?: HTMLElement } | null {
    const el = document.getElementById(alias.get(addr) ?? addr);
    if (!el?.closest('#details')) return null;
    if (el.matches('article.detail')) return { article: el };
    if (el.matches('ol.items > li')) return { article: el.closest<HTMLElement>('article')!, li: el };
    return null;
  }
  /* 언어 링크(위 막대·맺음·창 안)가 지금 연 주소를 들고 간다 */
  const syncLang = (h: string) => langs.forEach(a => a.setAttribute('href', a.getAttribute('href')!.replace(/#.*$/, '') + h));
  /* Safari는 replaceState를 너무 자주 부르면 SecurityError를 던진다. 주소만 못 바꾸고 창은 그대로 둔다 */
  const setUrl = (u: string) => { try { history.replaceState(null, '', u); } catch { /* 무시 */ } };

  function show(addr: string): boolean {
    const r = resolve(addr);
    if (!r) return false;
    const { article, li } = r, at = (li ?? article).dataset.addr!, year = article.classList.contains('year');
    /* 복제한 글: id는 지우고(겹치지 않게) 제목에만 detail-title. 출처는 .dsrc 한 곳에 모은다 */
    const c = article.cloneNode(true) as HTMLElement;
    c.removeAttribute('id');
    c.querySelectorAll('[id]').forEach(e => e.removeAttribute('id'));
    c.querySelectorAll('.src').forEach(e => e.remove());
    const h = c.querySelector<HTMLElement>('h2');
    if (h) { h.id = 'detail-title'; h.tabIndex = -1; }   // 초점을 둘 곳이 없을 때 제목으로 옮긴다
    /* 목록의 사건은 키보드로도 고를 수 있다(Tab, Enter·Space) */
    c.querySelectorAll<HTMLElement>('ol.items > li').forEach(x => {
      x.classList.toggle('hl', !!li && x.dataset.addr === at);
      x.tabIndex = 0;
    });
    const meta = c.querySelector('.meta');
    if (li && meta) meta.textContent = li.dataset.meta!;
    /* 다시 그리면 초점이 있던 글이 사라진다. 새 글의 같은 항목, 없으면(다른 장면) 강조한 항목, 그것도 없으면 제목으로 옮긴다 */
    const act = document.activeElement as HTMLElement | null;
    const had = !!act && body.contains(act), was = had ? act!.dataset.addr : undefined;
    body.replaceChildren(c);
    if (had) ((was && [...c.querySelectorAll<HTMLElement>('ol.items > li')].find(x => x.dataset.addr === was))
      || c.querySelector<HTMLElement>('li.hl') || h)?.focus();
    /* 출처: 사건 출처가 있으면 그것, 없으면 장면 출처, 둘 다 없으면 비워서 숨긴다(:empty) */
    const from = (li && [...article.querySelectorAll<HTMLElement>('p.src[data-for]')].find(p => p.dataset.for === at))
      || article.querySelector<HTMLElement>('p.src:not([data-for])');
    src.replaceChildren(...(from ? [...from.children].map(x => x.cloneNode(true)) : []));
    if (from?.dataset.label) src.dataset.label = from.dataset.label;
    /* 정정 링크·앞뒤: 연도 판에는 없다 */
    fix.hidden = year;
    if (!year) fix.href = (li ?? article).dataset.fix!;
    const i = year ? -1 : seq.indexOf(at);
    prev.disabled = i < 0 || i >= seq.length - 1;
    next.disabled = i <= 0;
    const box = boxOf.get(at);
    if (box) {
      try { carveTile(cv, boxSpec(box, pics), 280, 280); } catch (e) { console.error(e); }
    }
    cur = at;
    setUrl('#' + at);
    syncLang('#' + at);
    if (!dlg!.open) { opener = box; dlg!.showModal(); }
    return true;
  }
  const step = (d: number) => {
    const i = cur === null ? -1 : seq.indexOf(cur);
    if (i >= 0 && seq[i + d]) show(seq[i + d]);
  };

  wall.addEventListener('click', e => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;   // 새 탭 열기 등은 그대로
    const b = (e.target as Element).closest<HTMLElement>('a.box');
    if (b && show(b.dataset.addr!)) e.preventDefault();
  });
  const itemOf = (e: Event) => (e.target as Element).closest<HTMLElement>('ol.items > li')?.dataset.addr;
  body.addEventListener('click', e => { const a = itemOf(e); if (a) show(a); });
  body.addEventListener('keydown', e => {
    const a = itemOf(e);
    if (a && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(a); }
  });
  prev.addEventListener('click', () => step(1));
  next.addEventListener('click', () => step(-1));
  $<HTMLButtonElement>('.x').addEventListener('click', () => dlg.close());
  /* ← 과거, → 최신. 끝에서 버튼이 꺼지면 초점이 창 밖으로 빠질 수 있어 문서에서 듣는다 */
  document.addEventListener('keydown', e => {
    if (!dlg.open || e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(-1); }
  });
  /* 바깥(배경) 클릭. 카드 안쪽 여백도 target이 dialog라서 좌표로 가린다.
     글을 고르다 바깥에서 손을 떼도 click이 dialog로 오므로, 누른 곳도 바깥이어야 닫는다 */
  const outside = (e: MouseEvent) => {
    if (e.target !== dlg) return false;
    const r = dlg.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };
  let downOut = false;
  dlg.addEventListener('pointerdown', e => { downOut = outside(e); });
  dlg.addEventListener('click', e => {
    if (downOut && outside(e)) dlg.close();
    downOut = false;
  });
  /* Esc·×·바깥 클릭이 모두 여기로 온다. 주소를 지우고 창을 연 상자로 초점을 돌린다 */
  dlg.addEventListener('close', () => {
    setUrl(location.pathname + location.search);
    syncLang('');
    const b = opener;
    cur = null; opener = undefined;
    b?.focus();
  });

  /* 주소로 들어왔거나 주소를 손으로 고치면 연다. 디코딩에 실패하거나 모르는 주소면 무시하고, 주소를 비우면 닫는다.
     replaceState는 hashchange를 부르지 않는다 */
  const fromHash = () => {
    let h = '';
    try { h = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (h) show(h);
    else if (dlg.open) dlg.close();
  };
  window.addEventListener('hashchange', fromHash);
  fromHash();
}
