// 세 가지 그림 결. 값은 설계 문서의 "그림 결" 표를 옮긴 것이고, 색은 사이트 토큰(src/styles/tokens.css)과 같다.

/** @typedef {'woodcut'|'soft'|'proof'} StyleId */
/** @typedef {'display'|'body'|'bodyBold'|'mono'} Role */
/**
 * @typedef {{
 *   id: StyleId,
 *   background: string,
 *   node: { fill: string, stroke: string, width: number, radius: number, text: string, sub: string },
 *   side: { fill: string, stroke: string },
 *   focal: { fill: string, stroke: string, width: number, text: string, sub: string },
 *   edge: { color: string, width: number, radius: number, arrow: number, arrowHalf: number },
 *   line: { cap: 'butt'|'round'|'square', join: 'miter'|'round' },
 *   fonts: { title: Role, label: Role, badge: Role },
 *   badge: 'stamp'|'tag',
 *   frame: 'none'|'block'|'proof',
 * }} Style
 */

export const TOKENS = {
  paper: '#E3E1D9',
  ink: '#111110',
  ink2: '#3B3A35',
  ghost: '#A3A097',
  wood: '#D3D0C6',
};

/** 교정지 바탕. 반투명 먹은 이 바탕 위에 미리 섞는다. */
export const PROOF_PAPER = '#EEECE6';

/** @param {string} hex */
function rgb(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`not a #RRGGBB color: ${hex}`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Premixes `hex` at `alpha` over `bgHex` and returns an uppercase #RRGGBB.
 * @param {string} hex
 * @param {number} alpha
 * @param {string} bgHex
 * @returns {string}
 */
export function blend(hex, alpha, bgHex) {
  const a = rgb(hex);
  const b = rgb(bgHex);
  const mix = a.map((v, i) => Math.round(alpha * v + (1 - alpha) * b[i]));
  return `#${mix.map((v) => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

const { paper, ink, ink2, ghost, wood } = TOKENS;

/** @type {Record<StyleId, Style>} */
export const STYLES = {
  woodcut: {
    id: 'woodcut',
    background: paper,
    node: { fill: paper, stroke: ink, width: 2, radius: 0, text: ink, sub: ink2 },
    side: { fill: wood, stroke: ink2 },
    focal: { fill: ink, stroke: ink, width: 2, text: paper, sub: paper },
    edge: { color: ink, width: 2, radius: 0, arrow: 10, arrowHalf: 5 },
    line: { cap: 'square', join: 'miter' },
    fonts: { title: 'display', label: 'display', badge: 'display' },
    badge: 'stamp',
    frame: 'block',
  },
  soft: {
    id: 'soft',
    background: paper,
    node: { fill: PROOF_PAPER, stroke: ink, width: 1, radius: 4, text: ink, sub: ink2 },
    side: { fill: wood, stroke: ghost },
    focal: { fill: ink, stroke: ink, width: 1, text: paper, sub: paper },
    edge: { color: ink2, width: 1, radius: 8, arrow: 8, arrowHalf: 4 },
    line: { cap: 'round', join: 'round' },
    fonts: { title: 'bodyBold', label: 'body', badge: 'body' },
    badge: 'tag',
    frame: 'none',
  },
  proof: {
    id: 'proof',
    background: PROOF_PAPER,
    node: { fill: '#F6F5F1', stroke: ink, width: 0.8, radius: 0, text: ink, sub: ink2 },
    side: { fill: blend(ink, 0.06, PROOF_PAPER), stroke: ghost },
    focal: { fill: blend(ink, 0.14, PROOF_PAPER), stroke: ink, width: 2, text: ink, sub: ink2 },
    edge: { color: ink2, width: 0.8, radius: 6, arrow: 7, arrowHalf: 3.5 },
    line: { cap: 'butt', join: 'miter' },
    fonts: { title: 'bodyBold', label: 'mono', badge: 'body' },
    badge: 'tag',
    frame: 'proof',
  },
};
