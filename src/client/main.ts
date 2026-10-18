import { clamp, ease } from '../engine/random.ts';
import { paint } from '../engine/mount.ts';
import { root, reduce, L, FONT, BODY, MONO } from './env.ts';
import { buildCh, buildYr } from './plates.ts';
import { hero, buildHero, releaseHero, paintHero, type HeroEls } from './hero.ts';
import type { SceneRec, YearRec, Rec } from './types.ts';
import { applyLiveDays } from './live.ts';

applyLiveDays();

const byId = (id: string) => document.getElementById(id) as HTMLElement;
const rail = byId('rail'), bar = byId('bar'), barT = byId('barT'), heroEl = byId('hero'), outro = byId('outro');
const els: HeroEls = { stage: byId('heroStage'), num: byId('numtext'), numCv: byId('nums') as HTMLCanvasElement, raysCv: byId('rays') as HTMLCanvasElement };
const ticks = [...rail.querySelectorAll<HTMLButtonElement>('button')];

const chs: SceneRec[] = [...document.querySelectorAll<HTMLElement>('.ch')].map((el, i) => {
  const d = el.dataset, lis = [...el.querySelectorAll<HTMLElement>('.cuts li')];
  return {
    kind: 'ch', el, i, stage: el.querySelector('.stage') as HTMLElement, plate: el.querySelector('.plate') as HTMLElement,
    cv: el.querySelector('.print') as HTMLCanvasElement, lis, n: lis.length,
    glyph: d.glyph || '', pattern: d.pattern || 'h', angle: d.angle ? +d.angle : 0, motif: d.motif || 'none',
    seed: d.seed ? +d.seed : i, bar: d.bar || '', p: d.p ? +d.p : 0, print: null, inked: -1, sc: -1, pin: false, sh: 0,
  };
});
const yrs: YearRec[] = [...document.querySelectorAll<HTMLElement>('.yr')].map(el => ({
  kind: 'yr', el, y: el.dataset.y || '', cv: el.querySelector('canvas') as HTMLCanvasElement,
  text: el.querySelector('.yr-text') as HTMLElement, bar: el.dataset.bar || '', p: el.dataset.p ? +el.dataset.p : 0, print: null,
}));

/* ── 배치 (원본 layout) ── */
function layout(): void {
  L.W = innerWidth; L.wide = L.W >= 900;
  const canPin = innerHeight >= 500;
  root.classList.toggle('pin', canPin);
  chs.forEach(o => o.el.classList.remove('dense', 'loose'));
  const st0 = getComputedStyle(chs[0].stage), padT = parseFloat(st0.paddingTop) || 0, padB = parseFloat(st0.paddingBottom) || 0;
  if (canPin) {
    const avail = chs[0].stage.clientHeight;
    chs.forEach(o => { if (o.plate.offsetHeight + padT + padB > avail) o.el.classList.add('dense'); });
    chs.forEach(o => { if (o.el.classList.contains('dense') && o.plate.offsetHeight + padT + padB > avail) { o.el.classList.remove('dense'); o.el.classList.add('loose'); } });
  }
  L.stickyTop = parseFloat(getComputedStyle(chs[0].stage).top) || 0;
  chs.forEach(o => { o.pin = canPin && !o.el.classList.contains('loose'); o.sh = o.stage.offsetHeight; o.inked = -1; });
  L.heroLen = Math.max(1, heroEl.offsetHeight - els.stage.offsetHeight);
}

/* ── 찍을 순서 (원본 want / release / pump) ── */
const queue: Rec[] = [];
let qTimer = 0;
function want(o: Rec): void { if (o.print || !L.ready || queue.indexOf(o) >= 0) return; queue.push(o); if (!qTimer) qTimer = window.setTimeout(pump, 0); }
function release(o: Rec): void {
  const k = queue.indexOf(o); if (k >= 0) queue.splice(k, 1);
  if (o.print) { o.cv.width = o.cv.height = 0; o.print = null; if (o.kind === 'ch') o.sc = -1; }
}
function pump(): void {
  qTimer = 0; if (!queue.length) return;
  const vh = innerHeight; let best = 0, bd = 1e9;
  queue.forEach((o, k) => { const r = o.el.getBoundingClientRect(), d = Math.abs(r.top + Math.min(r.height, vh) / 2 - vh / 2); if (d < bd) { bd = d; best = k; } });
  const o = queue.splice(best, 1)[0];
  if (!o.print) { try { if (o.kind === 'ch') buildCh(o); else buildYr(o); } catch (e) { console.warn(e); } }
  need();
  if (queue.length) qTimer = window.setTimeout(pump, 24);
}

/* ── 스크롤 (원본 tick). 바뀐 점: 표시줄 문구와 진행값을 data-bar / data-p에서 읽는다 ── */
let raf = 0, barOn: boolean | null = null, barKey = '', activeTick = -2;
function need(): void { if (!raf) raf = requestAnimationFrame(tick); }
function tick(): void {
  raf = 0;
  const vh = innerHeight, sy = window.scrollY || window.pageYOffset, now = performance.now();
  let more = false;
  const hp = clamp(sy / L.heroLen);

  const hr = heroEl.getBoundingClientRect();
  if (L.ready) { if (hr.bottom < -vh * 2.5) releaseHero(els); else if (!hero.num) { try { buildHero(els); } catch (e) { console.warn(e); } } }
  if (hero.num) {
    const ld = reduce ? 1 : clamp((now - hero.t0) / 1700); if (ld < 1) more = true;
    paintHero(ease(ld), reduce ? 0 : ease((hp - 0.1) / 0.75));
    const op = (reduce ? 1 : ease((now - hero.t0) / 1300)) * (1 - 0.9 * hp), rot = reduce ? 0 : hp * 16;
    if (Math.abs(op - hero.op) > 0.004) { hero.op = op; els.raysCv.style.opacity = op.toFixed(3); }
    if (Math.abs(rot - hero.rot) > 0.02) { hero.rot = rot; els.raysCv.style.transform = 'rotate(' + rot.toFixed(2) + 'deg)'; }
  }

  let activeY: YearRec | null = null, active: SceneRec | null = null;
  for (const o of yrs) {
    const r = o.el.getBoundingClientRect();
    if (r.top < vh * 1.8 && r.bottom > -vh * 0.8) want(o); else if (r.top > vh * 3.2 || r.bottom < -vh * 2.4) release(o);
    if (o.print) { const raw = (vh - r.top) / (r.height + vh); paint(o.print, reduce ? 1 : ease((raw - 0.03) / 0.33), reduce ? 0 : ease((raw - 0.68) / 0.28)); }
    if (r.top <= vh * 0.5 && r.bottom > vh * 0.5) activeY = o;
  }
  for (const o of chs) {
    const r = o.el.getBoundingClientRect();
    if (r.top < vh * 1.8 && r.bottom > -vh * 0.8) want(o); else if (r.top > vh * 3.2 || r.bottom < -vh * 2.4) release(o);
    let tin = 1, tout = 0, inked = o.n;
    if (o.pin) {
      const top = r.top - L.stickyTop, len = Math.max(1, r.height - o.sh);
      const pinP = clamp(-top / len), enterP = clamp(1 - top / o.sh), leaveP = clamp(-(top + len) / o.sh);
      if (!reduce) {
        tin = top <= 0 ? 1 : ease((enterP - 0.1) / 0.8); tout = ease((leaveP - 0.04) / 0.8);
        inked = 0; for (let k = 0; k < o.n; k++) { if (pinP >= 0.04 + k * (0.64 / Math.max(1, o.n - 1))) inked = k + 1; }
      }
    } else if (!reduce) {
      const raw = (vh - r.top) / (r.height + vh); tin = ease((raw - 0.04) / 0.32); tout = ease((raw - 0.7) / 0.26);
    }
    if (inked !== o.inked) { o.inked = inked; o.lis.forEach((li, k) => li.classList.toggle('inked', k < inked)); }
    if (o.print) {
      paint(o.print, tin, tout);
      const sc = reduce ? 1 : Math.round((1.035 - 0.035 * tin) * 2000) / 2000;
      if (sc !== o.sc) { o.sc = sc; o.cv.style.transform = 'scale(' + sc + ')'; }
    }
    if (r.top <= vh * 0.5 && r.bottom > vh * 0.5) active = o;
  }

  const on = sy > L.heroLen * 0.85;
  if (on !== barOn) { barOn = on; bar.classList.toggle('on', on); rail.classList.toggle('on', on); }
  let label: string, p: number;
  const a = active as SceneRec | null, ay = activeY as YearRec | null;
  if (a) { label = a.bar; p = a.p; }
  else if (ay) { label = ay.bar; p = ay.p; }
  else if (outro.getBoundingClientRect().top < vh * 0.5) { label = outro.dataset.bar || ''; p = 1; }
  else { label = bar.dataset.start || ''; p = 0; }
  if (label !== barKey) { barKey = label; barT.textContent = label; bar.style.setProperty('--p', p.toFixed(4)); }
  const at = a ? a.i : -1;
  if (at !== activeTick) { if (activeTick >= 0 && ticks[activeTick]) ticks[activeTick].classList.remove('on'); if (at >= 0) ticks[at].classList.add('on'); activeTick = at; }

  if (more) need();
}

/* ── 이벤트 (원본 657–676행) ── */
rail.addEventListener('click', e => {
  const b = (e.target as Element).closest('button'); if (!b) return;
  const o = chs[+(b.getAttribute('data-i') || 0)];
  const y = o.el.getBoundingClientRect().top + (window.scrollY || 0) - L.stickyTop + (o.pin ? (o.el.offsetHeight - o.sh) * 0.72 : 0);
  window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
});
addEventListener('scroll', need, { passive: true });
let rsT = 0, lastW = innerWidth, lastH = 0;
addEventListener('resize', () => {
  clearTimeout(rsT);
  rsT = window.setTimeout(() => {
    const sh = els.stage.clientHeight;
    if (innerWidth !== lastW || Math.abs(sh - lastH) > 2) { lastW = innerWidth; lastH = sh; relayout(); } else need();
  }, 220);
});
function relayout(): void { layout(); chs.forEach(release); yrs.forEach(release); releaseHero(els); need(); }

/* ── 시작 (원본 678–686행). 바뀐 점: 폰트 목록은 CSS 토큰과 현재 페이지의 글자에서,
   폰트 대기 뒤 레이아웃이 바뀌어 주소(#id)로 들어온 위치가 어긋나면 다시 맞춘다 ── */
layout(); lastH = els.stage.clientHeight; need();
const initialY = window.scrollY;
const glyphs = chs.map(o => o.glyph).join('') + (els.num.dataset.wide || '') + yrs.map(o => o.y).join('');
const fontJobs: Promise<unknown>[] = [];
try {
  if (document.fonts && document.fonts.load) {
    fontJobs.push(
      document.fonts.load('400 80px ' + FONT, glyphs),
      document.fonts.load('400 15px ' + BODY, '가나다'),
      document.fonts.load('600 15px ' + BODY, '가나다'),
      document.fonts.load('500 12px ' + MONO, '2026'),
    );
  }
} catch (e) { console.warn(e); }
Promise.race([Promise.all(fontJobs).catch(() => {}), new Promise(r => setTimeout(r, 3500))]).then(() => {
  L.ready = true; layout(); lastH = els.stage.clientHeight;
  let id = location.hash.slice(1);
  try { id = decodeURIComponent(id); } catch { /* 깨진 %-인코딩은 그대로 둔다 */ }
  const target = id ? document.getElementById(id) : null;
  if (target && Math.abs(window.scrollY - initialY) < 2) target.scrollIntoView();
  need();
  root.dataset.ready = '1';
});
