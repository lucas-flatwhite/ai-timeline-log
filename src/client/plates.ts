import { compose } from '../engine/compose.ts';
import { fitGlyph, drawGlyph, type Fit, type Rect } from '../engine/glyph.ts';
import { vignette, border, motif } from '../engine/motif.ts';
import { engrave } from '../engine/engrave.ts';
import { mount } from '../engine/mount.ts';
import { mulberry } from '../engine/random.ts';
import { L, INK, PAPER, FONT } from './env.ts';
import type { SceneRec, YearRec } from './types.ts';

/* 원본 buildCh. 바뀐 점: CH[i] 대신 data-* 값, 시드는 o.seed(1단계에서는 순번) */
export function buildCh(o: SceneRec): void {
  const st = o.stage, w = st.clientWidth, h = st.clientHeight; if (!w || !h) return;
  const pl = o.plate, pt = pl.offsetTop, px = pl.offsetLeft, pw = pl.offsetWidth;
  let R: Rect;
  if (L.wide) { const x0 = px + pw + 28; R = { x: x0, y: 72, w: w - x0 - (L.W >= 960 ? 88 : 24), h: h - 72 - 36 }; }
  else R = { x: 14, y: 50, w: w - 28, h: pt - 50 - 12 };
  if (R.w < 140 || R.h < 96) R = { x: 14, y: 50, w: w - 28, h: Math.max(160, h * 0.42) };
  const s = L.wide ? 6.5 : 5, rng = mulberry(o.seed * 131 + 7);
  let fit!: Fit;
  const smp = compose(w, h, g => {
    g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 0, w, h);
    vignette(g, w, h, 0.15);
    fit = fitGlyph(g, o.glyph, R, 0.94, FONT);
    motif(g, o.motif, fit.box, R, w, h, rng);
    g.fillStyle = '#000'; drawGlyph(g, fit, FONT);
    border(g, w, h, s);
  });
  const P = engrave({
    w, h, s, src: smp, mode: o.pattern === 'c' ? 'rings' : 'lines', ang: o.pattern === 'd' ? (o.angle || 12) * Math.PI / 180 : 0,
    wave: o.pattern === 'w' ? { f: 6.2832 / (380 + rng() * 260), g: 0.005, ph: rng() * 6.28 } : null,
    cx: fit.box.x + fit.box.w / 2, cy: fit.box.y + fit.box.h / 2, maxR: 0.9, seed: o.seed + 1, sweep: rng() * 6.2832,
  });
  o.print = mount(o.cv, w, h, P as Path2D[], INK);
}

/* 원본 buildYr */
export function buildYr(o: YearRec): void {
  const el = o.el, w = el.clientWidth, h = el.clientHeight; if (!w || !h) return;
  const tt = o.text.offsetTop, side = L.wide ? L.W * 0.05 : 14;
  let R: Rect = { x: side, y: 60, w: w - side * 2 - (L.W >= 960 ? 70 : 0), h: tt - 60 - 24 };
  if (R.h < 120) R = { x: side, y: 60, w: w - side * 2, h: Math.max(140, h * 0.45) };
  const s = L.wide ? 7 : 5.5, yy = +o.y;
  const smp = compose(w, h, g => {
    g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(0, 0, w, h); vignette(g, w, h, 0.12);
    const fit = fitGlyph(g, o.y, R, 0.98, FONT); g.fillStyle = '#000'; drawGlyph(g, fit, FONT); border(g, w, h, s);
  });
  const P = engrave({ w, h, s, src: smp, mode: 'lines', ang: (yy % 2 ? -22 : 22) * Math.PI / 180, maxR: 0.86, seed: yy, sweep: (yy % 2 ? 0.4 : 2.6) });
  o.print = mount(o.cv, w, h, P as Path2D[], PAPER);
}
