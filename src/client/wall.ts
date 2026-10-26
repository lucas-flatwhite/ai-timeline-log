import { boxSpec, carveTile, readPics, type TileSpec } from './tiles.ts';

/* 새길 판 하나: 표지는 캔버스 자체, 상자는 상자 요소에 .carved를 붙인다 */
interface Job { el: HTMLElement; cv: HTMLCanvasElement; spec: TileSpec }

function jobs(): Job[] {
  const P = readPics(), out: Job[] = [];
  const cover = document.querySelector<HTMLCanvasElement>('.cover canvas[data-kind="days"]');
  /* 일수 판의 시드는 시안 그대로(1130) */
  if (cover) out.push({ el: cover, cv: cover, spec: { kind: 'days', glyph: cover.dataset.glyph!, pattern: 'h', angle: 0, motif: 'rays', seed: 1130 } });
  document.querySelectorAll<HTMLElement>('.wall .box').forEach(el => {
    const cv = el.querySelector('canvas');
    if (cv) out.push({ el, cv, spec: boxSpec(el, P) });
  });
  return out;
}

const onScreen = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
};

/* 같은 장면 강조: 상자에 마우스가 오르거나 키보드 초점이 가면 .wall에 .focus, 같은 장면 상자(장면 상자 포함)에 .rel.
   터치는 올림 효과 없이 바로 연다. 마우스로 닫은 뒤 상자로 돌아온 초점은 강조하지 않는다(:focus-visible일 때만) */
function bindHighlight(): void {
  const wall = document.querySelector<HTMLElement>('.wall');
  if (!wall) return;
  const boxes = [...wall.querySelectorAll<HTMLElement>('.box')];
  const light = (scene?: string) => {
    wall.classList.toggle('focus', !!scene);
    boxes.forEach(b => b.classList.toggle('rel', !!scene && b.dataset.scene === scene));
  };
  boxes.forEach(b => {
    b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') light(b.dataset.scene); });
    b.addEventListener('pointerleave', () => light());
    b.addEventListener('focusin', () => { if (b.matches(':focus-visible')) light(b.dataset.scene); });
    b.addEventListener('focusout', () => light());
  });
}

/* 화면 가까이(위아래 300px) 온 판만 새긴다. 한 프레임에 8ms 안에서, 지금 화면 안의 판부터 */
export function initWall(): { ready: Promise<void> } {
  bindHighlight();
  const all = jobs(), byEl = new Map(all.map(j => [j.el as Element, j]));
  const first = new Set(all.filter(j => onScreen(j.el)));
  let done!: () => void;
  const ready = new Promise<void>(r => { done = r; });
  if (!first.size) done();

  const queue: Job[] = [];
  let pending = false;
  function carve(j: Job) {
    /* 하나가 실패해도 나머지를 새기고, 시작은 멈추지 않는다 */
    try {
      carveTile(j.cv, j.spec, j.cv.clientWidth, j.cv.clientHeight);
      j.el.classList.add('carved');
    } catch (e) { console.error(e); }
    if (first.delete(j) && !first.size) done();
  }
  function pump() {
    const t0 = performance.now();
    queue.sort((a, b) => +onScreen(b.el) - +onScreen(a.el));
    while (queue.length && performance.now() - t0 < 8) carve(queue.shift()!);
    if (queue.length) requestAnimationFrame(pump); else pending = false;
  }
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      const j = byEl.get(e.target);
      if (e.isIntersecting && j) { queue.push(j); io.unobserve(e.target); byEl.delete(e.target); }
    });
    if (queue.length && !pending) { pending = true; requestAnimationFrame(pump); }
  }, { rootMargin: '300px 0px' });
  all.forEach(j => io.observe(j.el));
  return { ready };
}
