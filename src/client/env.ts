/* 스크립트는 CSS가 준비됐다고 가정하지 않는다. WebKit은 모듈 스크립트를 외부 스타일시트보다 먼저 돌릴 수 있어서,
   그대로 읽으면 아래 토큰이 비고 판화가 대체 서체로 새겨진다. 이 모듈을 가져오는 쪽은 모두 여기서 함께 기다린다 */
const sheetReady = (l: HTMLLinkElement) => l.sheet ? Promise.resolve() : new Promise<void>(r => {
  l.addEventListener('load', () => r(), { once: true });
  l.addEventListener('error', () => r(), { once: true });
});
await Promise.all([...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map(sheetReady));

export const root = document.documentElement;
const cs = getComputedStyle(root);
export const INK = cs.getPropertyValue('--ink').trim() || '#111110';
export const PAPER = cs.getPropertyValue('--paper').trim() || '#E3E1D9';
/* 판 글꼴(PlateL, PlateK) 뒤에 --display가 이어진다. 토큰이 비면 --display, 그것도 비면 sans-serif */
const DISPLAY = cs.getPropertyValue('--display').trim();
export const PLATE = cs.getPropertyValue('--plate').trim() || DISPLAY || 'sans-serif';
/* 기다릴 것은 판 글꼴뿐이다. --display까지 넘기면 document.fonts.load가 Black Han Sans 조각도 받고 기다린다 */
export const PLATE_ONLY = (DISPLAY && PLATE.endsWith(DISPLAY) && PLATE.slice(0, -DISPLAY.length).replace(/,\s*$/, '')) || PLATE;
