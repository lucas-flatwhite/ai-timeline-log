import { compose } from '../engine/compose.ts';
import { fitGlyph, drawGlyph, type Fit } from '../engine/glyph.ts';
import { engrave } from '../engine/engrave.ts';
import { mount, paint, buckets, type Print } from '../engine/mount.ts';
import { clamp } from '../engine/random.ts';
import { INK, PAPER, FONT } from './env.ts';

export interface HeroEls { stage: HTMLElement; num: HTMLElement; numCv: HTMLCanvasElement; raysCv: HTMLCanvasElement }
export const hero: { num: Print | null; rays: Print | null; t0: number; op: number; rot: number } = { num: null, rays: null, t0: 0, op: -1, rot: -1 };

/* 원본 buildHero. 바뀐 점: 표지 글자를 data-wide / data-tall에서 읽는다 */
export function buildHero(els: HeroEls): void {
  const st = els.stage, w = st.clientWidth, h = st.clientHeight; if (!w || !h) return;
  const nb = els.num.getBoundingClientRect(), sb = st.getBoundingClientRect();
  const R = { x: Math.max(8, nb.left - sb.left), y: nb.top - sb.top + 6, w: Math.min(w - 16, nb.width), h: nb.height - 12 };
  const txt = (w / h > 1.1) ? (els.num.dataset.wide || '') : (els.num.dataset.tall || ''), s = w >= 900 ? 7 : 5.2;
  let fit!: Fit;
  const smp = compose(w, h, g => { fit = fitGlyph(g, txt, R, 0.98, FONT); g.fillStyle = '#000'; drawGlyph(g, fit, FONT); });
  const P = engrave({ w, h, s, src: smp, mode: 'lines', ang: 0, maxR: 0.86, seed: 99, sweep: 0.2 });
  hero.num = mount(els.numCv, w, h, P as Path2D[], PAPER); hero.num.fit = fit;
  const cx = fit.box.x + fit.box.w / 2, cy = fit.box.y + fit.box.h / 2;
  const D = Math.ceil(2 * Math.max(Math.hypot(cx, cy), Math.hypot(w - cx, cy), Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy))) + 16;
  const sr = w >= 900 ? 8 : 6;
  const smp2 = compose(D, D, g => {
    const c = D / 2, N = 36;
    g.fillStyle = 'rgba(0,0,0,.42)';
    for (let k = 0; k < N; k++) { const a = k / N * 6.2832, da = 6.2832 / N * 0.5; g.beginPath(); g.moveTo(c, c); g.arc(c, c, D, a, a + da); g.closePath(); g.fill(); }
    const r1 = Math.max(fit.box.w, fit.box.h) * 0.6;
    g.strokeStyle = 'rgba(0,0,0,.8)'; g.lineWidth = sr * 1.7; g.beginPath(); g.arc(c, c, r1, 0, 7); g.stroke();
    g.lineWidth = sr * 1.1; g.beginPath(); g.arc(c, c, r1 + sr * 4, 0, 7); g.stroke();
    const gr = g.createRadialGradient(c, c, 0, c, c, Math.min(fit.box.w, fit.box.h) * 0.5);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, D, D);
  });
  const P2 = engrave({ w: D, h: D, s: sr, src: smp2, mode: 'rings', cx: D / 2, cy: D / 2, maxR: 0.82, seed: 7, sweep: 0 });
  hero.rays = mount(els.raysCv, D, D, P2 as Path2D[], PAPER, 5e6);
  els.raysCv.style.left = (cx - D / 2) + 'px'; els.raysCv.style.top = (cy - D / 2) + 'px';
  paint(hero.rays, 1, 0);
  hero.t0 = performance.now(); hero.op = -1; hero.rot = -1;
  els.num.classList.add('printed');
}

export function releaseHero(els: HeroEls): void {
  if (hero.num) { els.numCv.width = els.numCv.height = 0; hero.num = null; }
  if (hero.rays) { els.raysCv.width = els.raysCv.height = 0; hero.rays = null; }
}

/* 원본 paintHero */
export function paintHero(tin: number, tout: number): void {
  const pr = hero.num; if (!pr || !pr.fit) return;
  const key = (Math.round(tin * 512) << 10) | Math.round(tout * 512);
  if (key === pr.key) return; pr.key = key;
  const g = pr.ctx; g.setTransform(pr.k, 0, 0, pr.k, 0, 0); g.clearRect(0, 0, pr.w, pr.h);
  const ha = clamp(Math.min(tin * 1.6, 1 - tout));
  if (ha > 0) {
    const fit = pr.fit;
    g.globalAlpha = ha; g.fillStyle = INK; g.strokeStyle = INK; g.lineJoin = 'round'; g.lineWidth = fit.F * 0.11;
    g.font = '400 ' + fit.F + 'px ' + FONT; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    fit.lines.forEach(L => { g.strokeText(L.t, L.x, L.y); g.fillText(L.t, L.x, L.y); });
    g.globalAlpha = 1;
  }
  buckets(pr, tin, tout);
}
