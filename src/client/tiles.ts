import { compose } from '../engine/compose.ts';
import { fitGlyph, drawGlyph, type Rect } from '../engine/glyph.ts';
import { vignette, motif, frame } from '../engine/motif.ts';
import { engrave, type PathLike } from '../engine/engrave.ts';
import { mount, paint } from '../engine/mount.ts';
import { mulberry } from '../engine/random.ts';
import { drawPic, type Pic } from '../engine/pic.ts';
import { INK, PAPER, PLATE } from './env.ts';

export type TileSpec = { kind: 'scene' | 'item' | 'year' | 'days'; glyph: string; pattern: string; angle: number; motif: string; seed: number; pic?: Pic };

/* 그림 밑그림(script#pics). 깨져 있으면 그림 없이 새긴다 */
export function readPics(): Record<string, Pic> {
  try { return JSON.parse(document.getElementById('pics')?.textContent || '{}'); } catch { return {}; }
}

/* 상자의 data-*에서 판 설정을 읽는다(격자와 상세 창이 함께 쓴다) */
export function boxSpec(el: HTMLElement, pics: Record<string, Pic>): TileSpec {
  const d = el.dataset;
  return {
    kind: d.kind as TileSpec['kind'], glyph: d.glyph!, pattern: d.pattern!, angle: +(d.angle || 0),
    motif: d.motif!, seed: +d.seed!, pic: d.pic ? pics[d.pic] : undefined,
  };
}

const TAU = 6.2832;
const box = (w: number, h: number, pad: number): Rect => ({ x: pad, y: pad, w: w - 2 * pad, h: h - 2 * pad });

/* 장면·사건(시안 renderPrint). 그림이 있으면 위 60%에 그림, 아래 37%에 핵심어(composePic) */
function cutPrint(t: TileSpec, w: number, h: number, s: number, css: number): PathLike[] {
  const rng = mulberry(t.seed * 131 + 7), R = box(w, h, Math.min(w, h) * (css < 100 ? 0.1 : 0.11));
  let at: Rect = R;
  const smp = compose(w, h, g => {
    g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 0, w, h); vignette(g, w, h, 0.15);
    if (t.pic) {
      g.fillStyle = '#000'; drawPic(g, t.pic, { x: R.x, y: R.y, w: R.w, h: R.h * 0.6 });
      drawGlyph(g, fitGlyph(g, t.glyph, { x: R.x, y: R.y + R.h * 0.63, w: R.w, h: R.h * 0.37 }, 0.96, PLATE), PLATE);
      frame(g, w, h, s); return;
    }
    const fit = fitGlyph(g, t.glyph, R, 0.94, PLATE); at = fit.box; motif(g, t.motif, fit.box, R, w, h, rng);
    g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#000'; drawGlyph(g, fit, PLATE); frame(g, w, h, s);
  });
  return engrave({
    w, h, s, src: smp, mode: t.pattern === 'c' ? 'rings' : 'lines',
    ang: t.pattern === 'd' ? (t.angle || 12) * Math.PI / 180 : 0,
    wave: t.pattern === 'w' ? { f: TAU / ((380 + rng() * 260) * w / 1000), g: 0.005, ph: rng() * 6.28 } : null,
    cx: at.x + at.w / 2, cy: at.y + at.h / 2, maxR: 0.9, seed: t.seed + 1, sweep: rng() * TAU,
  });
}

/* 연도 판(시안 renderYear). 시드는 연도, 사선은 홀수 해 -22°, 짝수 해 +22° */
function cutYear(t: TileSpec, w: number, h: number, s: number): PathLike[] {
  const yy = t.seed, R = box(w, h, Math.min(w, h) * 0.12);
  const smp = compose(w, h, g => {
    g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(0, 0, w, h); vignette(g, w, h, 0.12);
    g.fillStyle = '#000'; drawGlyph(g, fitGlyph(g, t.glyph, R, 0.98, PLATE), PLATE); frame(g, w, h, s);
  });
  return engrave({ w, h, s, src: smp, mode: 'lines', ang: t.angle * Math.PI / 180, maxR: 0.86, seed: yy, sweep: yy % 2 ? 0.4 : 2.6 });
}

/* 일수 판(시안 renderDays). 먹 바탕에 무늬 없이 가로 칼선만 새긴다 */
function cutDays(t: TileSpec, w: number, h: number, s: number): PathLike[] {
  const R = box(w, h, Math.min(w, h) * 0.13);
  let at: Rect = R;
  const smp = compose(w, h, g => {
    g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(0, 0, w, h); vignette(g, w, h, 0.12);
    const fit = fitGlyph(g, t.glyph, R, 0.96, PLATE); at = fit.box;
    g.fillStyle = '#000'; drawGlyph(g, fit, PLATE); frame(g, w, h, s);
  });
  return engrave({ w, h, s, src: smp, mode: 'lines', ang: 0, cx: at.x + at.w / 2, cy: at.y + at.h / 2, maxR: 0.9, seed: t.seed + 1, sweep: 1.3 });
}

/* 시안처럼 기기 화소로 새긴다(칼선 간격 s = max(1.5, css/48) × dpr). mount의 배율은 1로 두고,
   mount가 기기 화소로 적은 인라인 크기는 CSS 상자 크기로 되돌린다. paint는 칼선만 칠하므로 바탕은 캔버스 배경색이다 */
export function carveTile(cv: HTMLCanvasElement, t: TileSpec, cssW: number, cssH: number): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.round(cssW * dpr), h = Math.round(cssH * dpr);
  const s = Math.max(1.5, Math.min(cssW, cssH) / 48) * dpr, dark = t.kind === 'year' || t.kind === 'days';
  const P = t.kind === 'year' ? cutYear(t, w, h, s) : t.kind === 'days' ? cutDays(t, w, h, s) : cutPrint(t, w, h, s, Math.min(cssW, cssH));
  const pr = mount(cv, w, h, P as Path2D[], dark ? PAPER : INK, w * h);
  cv.style.width = cssW + 'px'; cv.style.height = cssH + 'px'; cv.style.background = dark ? INK : PAPER;
  paint(pr, 1, 0);
}
