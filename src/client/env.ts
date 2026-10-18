/* 스크립트는 CSS가 준비됐다고 가정하지 않는다. WebKit은 모듈 스크립트를 외부 스타일시트보다 먼저 돌릴 수 있어서,
   그대로 읽으면 아래 토큰이 비고 판화가 대체 서체로 새겨진다. 이 모듈을 가져오는 쪽은 모두 여기서 함께 기다린다 */
const sheetReady = (l: HTMLLinkElement) => l.sheet ? Promise.resolve() : new Promise<void>(r => {
  l.addEventListener('load', () => r(), { once: true });
  l.addEventListener('error', () => r(), { once: true });
});
await Promise.all([...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map(sheetReady));

export const root = document.documentElement;
export const reduce = typeof window.matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const cs = getComputedStyle(root);
export const INK = cs.getPropertyValue('--ink').trim() || '#111110';
export const PAPER = cs.getPropertyValue('--paper').trim() || '#E3E1D9';
/* 원본은 FONT 상수로 --display를 중복 정의했다. 이제 CSS 토큰이 유일한 출처다 */
export const FONT = cs.getPropertyValue('--display').trim() || 'sans-serif';
export const BODY = cs.getPropertyValue('--body').trim() || 'serif';
export const MONO = cs.getPropertyValue('--mono').trim() || 'monospace';
/* 레이아웃 상태 (원본의 W, wide, stickyTop, heroLen, ready) */
export const L = { W: 0, wide: false, stickyTop: 0, heroLen: 1, ready: false };
