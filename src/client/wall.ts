import { boxSpec, carveTile, readPics, type TileSpec } from './tiles.ts';

/* 새길 판 하나: 표지는 캔버스 자체, 상자는 상자 요소에 .carved를 붙인다 */
interface Job { el: HTMLElement; cv: HTMLCanvasElement; spec: TileSpec }

function jobs(): Job[] {
  const P = readPics(), out: Job[] = [];
  const cover = document.querySelector<HTMLCanvasElement>('.cover canvas[data-kind="days"]');
  /* 일수 판의 시드는 시안 그대로(1130) */
  if (cover) out.push({ el: cover, cv: cover, spec: { kind: 'days', glyph: cover.dataset.glyph!, pattern: 'h', angle: 0, motif: 'none', seed: 1130 } });
  /* 맺음의 쓰는 법 판도 같은 줄에 세운다. 벽의 상자가 아니라서 강조·뽑기·상세 창은 이 판을 모른다 */
  document.querySelectorAll<HTMLElement>('.wall .box, .guide .gd-plate').forEach(el => {
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
   터치는 올림 효과 없이 바로 연다. 마우스로 닫은 뒤 상자로 돌아온 초점은 강조하지 않는다(:focus-visible일 때만).
   강조(주제·시기·찾기·새 상자)가 켜져 있으면 마우스 올림으로는 바꾸지 않는다. 스크롤하면 가만히 있는 마우스 아래로
   상자가 지나가며 올림이 생겨, 고른 상자 대신 그 상자의 장면이 켜지기 때문이다. 키보드 초점은 일부러 옮긴 것이라 그대로 둔다 */
function bindHighlight(): void {
  const wall = document.querySelector<HTMLElement>('.wall');
  if (!wall) return;
  const boxes = [...wall.querySelectorAll<HTMLElement>('.box')];
  const light = (scene?: string) => {
    wall.classList.toggle('focus', !!scene);
    boxes.forEach(b => b.classList.toggle('rel', !!scene && b.dataset.scene === scene));
  };
  /* 강조가 켜지는 순간 남아 있던 올림 강조를 끈다 */
  document.addEventListener('pick', () => { if (wall.classList.contains('focus') && !wall.querySelector('.box:focus-visible')) light(); });
  boxes.forEach(b => {
    b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && !wall.classList.contains('pick')) light(b.dataset.scene); });
    b.addEventListener('pointerleave', () => light());
    b.addEventListener('focusin', () => { if (b.matches(':focus-visible')) light(b.dataset.scene); });
    b.addEventListener('focusout', () => light());
  });
}

/* 표지 뽑기: 일수 판을 누르면 벽의 상자 글자가 판 위에 빠르게 바뀌어 찍히다가 점점 느려져 하나에 멈추고,
   판이 한 번 눌렸다 올라온 뒤 그 상자를 연다. 창을 닫으면 결이 다른 일수 판으로 돌아온다.
   동작 줄이기 설정이면 돌리지 않고 바로 하나를 골라 연다.
   누르지 않으면 IDLE_MS마다 같은 돌림만 보여 주고 일수 판으로 돌아와 눌린다. 상자는 열지 않는다.
   판이 화면 밖이거나, 탭이 숨었거나, 창이 열려 있거나, 동작 줄이기 설정이면 건너뛴다. 돌리는 중에 누르면 바로 뽑기로 넘어간다 */
const FAST = 16, FAST_MS = 45, GROW = 1.2, SLOW_MS = 480, HOLD_MS = 600, IDLE_MS = 20000;
const reels = (() => {
  const d: number[] = Array(FAST).fill(FAST_MS);
  for (let t = FAST_MS * GROW; t < SLOW_MS; t *= GROW) d.push(Math.round(t));
  return d;
})();
function bindCover(j: Job): void {
  const days = j.spec;
  let busy = false, round = 0, run = 0, idle = 0;
  const carve = (t: TileSpec) => { try { carveTile(j.cv, t, j.cv.clientWidth, j.cv.clientHeight); } catch (e) { console.error(e); } };
  const face = (b: HTMLElement, seed: number): TileSpec => ({ kind: 'days', glyph: b.dataset.glyph!, pattern: 'h', angle: 0, motif: 'none', seed });
  const pool = () => [...document.querySelectorAll<HTMLElement>('.wall a.box')];
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* 상자 글자를 돌리다 land를 새기고 눌린다. 새 돌림이 시작되면(run이 바뀌면) 멈춘다 */
  const spin = (boxes: HTMLElement[], avoid: HTMLElement | null, land: () => TileSpec, then: () => void) => {
    const me = ++run;
    const any = () => boxes[Math.floor(Math.random() * boxes.length)];
    let last: HTMLElement | null = null;
    const step = (k: number) => {
      if (me !== run) return;
      if (k === reels.length) {
        carve(land());
        j.cv.classList.remove('press');
        void j.cv.offsetWidth;
        j.cv.classList.add('press');
        setTimeout(() => { if (me === run) then(); }, HOLD_MS);
        return;
      }
      let b = any();
      for (let n = 0; n < 4 && (b === last || b === avoid); n++) b = any();
      last = b;
      carve(face(b, k + round * 97));
      setTimeout(() => step(k + 1), reels[k]);
    };
    step(0);
  };
  const later = () => { clearTimeout(idle); idle = window.setTimeout(tick, IDLE_MS); };
  function tick(): void {
    const boxes = pool();
    if (busy || still() || !boxes.length || document.hidden || !onScreen(j.cv) || !j.cv.classList.contains('carved')
      || document.getElementById('detail')?.hasAttribute('open')) { later(); return; }
    spin(boxes, null, () => j.spec, later);
  }
  j.cv.addEventListener('animationend', () => j.cv.classList.remove('press'));
  j.cv.addEventListener('click', () => {
    const boxes = pool();
    if (busy || !boxes.length) return;
    busy = true;
    clearTimeout(idle);
    round++;
    const won = boxes[Math.floor(Math.random() * boxes.length)];
    const open = () => {
      document.dispatchEvent(new CustomEvent('open-addr', { detail: won.dataset.addr }));
      const back = () => { j.spec = { ...days, seed: days.seed + round }; carve(j.spec); busy = false; later(); };
      const dlg = document.getElementById('detail');
      if (dlg?.hasAttribute('open')) dlg.addEventListener('close', back, { once: true }); else back();
    };
    if (still()) { run++; carve(face(won, round)); open(); return; }
    spin(boxes, won, () => face(won, round * 97), open);
  });
  later();
}

/* 화면 가까이(위아래 300px) 온 판만 새긴다. 한 프레임에 8ms 안에서, 지금 화면 안의 판부터 */
export function initWall(): { ready: Promise<void> } {
  bindHighlight();
  const all = jobs(), byEl = new Map(all.map(j => [j.el as Element, j]));
  const cover = all.find(j => j.spec.kind === 'days');
  if (cover) bindCover(cover);
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
