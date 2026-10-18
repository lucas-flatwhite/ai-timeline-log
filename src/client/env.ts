export const root = document.documentElement;
export const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const cs = getComputedStyle(root);
export const INK = cs.getPropertyValue('--ink').trim() || '#111110';
export const PAPER = cs.getPropertyValue('--paper').trim() || '#E3E1D9';
/* 원본은 FONT 상수로 --display를 중복 정의했다. 이제 CSS 토큰이 유일한 출처다 */
export const FONT = cs.getPropertyValue('--display').trim() || 'sans-serif';
export const BODY = cs.getPropertyValue('--body').trim() || 'serif';
export const MONO = cs.getPropertyValue('--mono').trim() || 'monospace';
/* 레이아웃 상태 (원본의 W, wide, stickyTop, heroLen, ready) */
export const L = { W: 0, wide: false, stickyTop: 0, heroLen: 1, ready: false };
