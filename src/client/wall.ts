import { carveTile, type TileSpec } from './tiles.ts';
import type { Pic } from '../engine/pic.ts';

/* 새길 판 하나: 표지는 캔버스 자체, 상자는 상자 요소에 .carved를 붙인다 */
interface Job { el: HTMLElement; cv: HTMLCanvasElement; spec: TileSpec }

function pics(): Record<string, Pic> {
  try { return JSON.parse(document.getElementById('pics')?.textContent || '{}'); } catch { return {}; }
}

function jobs(): Job[] {
  const P = pics(), out: Job[] = [];
  const cover = document.querySelector<HTMLCanvasElement>('.cover canvas[data-kind="days"]');
  /* 일수 판의 시드는 시안 그대로(1130) */
  if (cover) out.push({ el: cover, cv: cover, spec: { kind: 'days', glyph: cover.dataset.glyph!, pattern: 'h', angle: 0, motif: 'rays', seed: 1130 } });
  document.querySelectorAll<HTMLElement>('.wall .box').forEach(el => {
    const d = el.dataset, cv = el.querySelector('canvas');
    if (!cv) return;
    out.push({ el, cv, spec: {
      kind: d.kind as TileSpec['kind'], glyph: d.glyph!, pattern: d.pattern!, angle: +(d.angle || 0),
      motif: d.motif!, seed: +d.seed!, pic: d.pic ? P[d.pic] : undefined,
    } });
  });
  return out;
}

const onScreen = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
};

/* 화면 가까이(위아래 300px) 온 판만 새긴다. 한 프레임에 8ms 안에서, 지금 화면 안의 판부터 */
export function initWall(): { ready: Promise<void> } {
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
