/* 강조 하나: 주제(data-topics) 또는 지난 방문 이후 새 상자(.new). 한 번에 하나만 켜진다.
   .wall에 .pick, 고른 상자에 .on을 붙이고 나머지는 CSS가 흐리게 한다. 바뀔 때마다 document에 'pick'을 보낸다 */
export type Pick = { kind: 'topic'; id: string } | { kind: 'new' } | null;

let cur: Pick = null;

export function setPick(p: Pick): void {
  const wall = document.querySelector<HTMLElement>('.wall');
  if (!wall) return;
  cur = p;
  wall.classList.toggle('pick', !!p);
  wall.querySelectorAll<HTMLElement>('.box').forEach(b => {
    const on = !!p && b.dataset.kind !== 'year'
      && (p.kind === 'topic' ? (b.dataset.topics ?? '').split(' ').includes(p.id) : b.classList.contains('new'));
    b.classList.toggle('on', on);
  });
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
