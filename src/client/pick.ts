/* 강조 하나: 주제, 시기, 찾기, 지난 방문 이후 새 상자. 한 번에 하나만 켜진다.
   .wall에 .pick, 고른 상자에 .on을 붙이고 나머지는 CSS가 흐리게 한다. 바뀔 때마다 document에 'pick'을 보낸다.
   주소에는 ?topic=, ?era=YYYY-MM, ?q=를 남기고(해시는 상세 창 주소가 쓴다) 언어 링크도 같은 쿼리를 들고 간다. 새 상자는 남기지 않는다 */
export type Pick = { kind: 'topic'; id: string } | { kind: 'era'; from: string } | { kind: 'q'; q: string } | { kind: 'new' } | null;
type On = NonNullable<Pick>;

/* 상자가 강조에 드는지. 시기와 찾기는 그 모듈이 붙인다(시기 범위, 찾기 글이 거기 있다) */
const match: { [K in On['kind']]?: (b: HTMLElement, p: Extract<On, { kind: K }>) => boolean } = {
  topic: (b, p) => (b.dataset.topics ?? '').split(' ').includes(p.id),
  new: b => b.classList.contains('new'),
};
export function addMatch<K extends On['kind']>(kind: K, f: (b: HTMLElement, p: Extract<On, { kind: K }>) => boolean): void {
  (match as Record<string, unknown>)[kind] = f;
}

let cur: Pick = null;

const param = (p: Pick): [string, string] | null =>
  p?.kind === 'topic' ? ['topic', p.id]
    : p?.kind === 'era' ? ['era', `${p.from.slice(0, 4)}-${p.from.slice(4)}`]
      : p?.kind === 'q' ? ['q', p.q] : null;

/* 주소와 언어 링크의 쿼리만 바꾼다(해시는 그대로) */
function withPick(href: string): string {
  const u = new URL(href, location.href);
  for (const k of ['topic', 'era', 'q']) u.searchParams.delete(k);
  const kv = param(cur);
  if (kv) u.searchParams.set(kv[0], kv[1]);
  return u.pathname + u.search + u.hash;
}

export function setPick(p: Pick): void {
  const wall = document.querySelector<HTMLElement>('.wall');
  if (!wall) return;
  cur = p;
  const f = p && (match[p.kind] as ((b: HTMLElement, p: On) => boolean) | undefined);
  wall.classList.toggle('pick', !!p);
  wall.querySelectorAll<HTMLElement>('.box').forEach(b => {
    b.classList.toggle('on', !!p && !!f && b.dataset.kind !== 'year' && f(b, p));
  });
  try { history.replaceState(null, '', withPick(location.href)); } catch { /* Safari가 너무 잦은 호출을 막는다. 주소만 못 바꾼다 */ }
  document.querySelectorAll<HTMLAnchorElement>('nav.lang a').forEach(a => a.setAttribute('href', withPick(a.getAttribute('href')!)));
  document.dispatchEvent(new CustomEvent('pick'));
}

export function currentPick(): Pick {
  return cur;
}

/** 강조가 켜져 있으면 고른 상자의 주소(격자 순서, 최신이 앞), 꺼져 있으면 null */
export function pickedSeq(): string[] | null {
  if (!cur) return null;
  return [...document.querySelectorAll<HTMLElement>('.wall .box.on')].map(b => b.dataset.addr!);
}

/** 고른 상자 가운데 첫(가장 최신) 상자가 위 막대와 강조 띠 바로 아래에 오도록 내린다 */
export function scrollToPicked(): void {
  const b = document.querySelector<HTMLElement>('.wall .box.on');
  if (!b) return;
  const over = [...document.querySelectorAll<HTMLElement>('.top, #pickbar')].reduce((h, e) => h + (e.hidden ? 0 : e.offsetHeight), 0);
  const top = b.getBoundingClientRect().top + scrollY - over - 12;
  scrollTo({ top: Math.max(0, top), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
