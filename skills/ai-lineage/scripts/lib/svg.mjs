// Scene을 SVG 글로 바꾼다. 글자는 모두 윤곽선이라 <text>, 글꼴, 스타일시트가 없다.
import { num } from './num.mjs';

/** @typedef {import('./layout.mjs').Scene} Scene */
/** @typedef {import('./draw.mjs').Item} Item */

/** @param {string} s */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** @param {Item['cmds']} cmds */
function pathData(cmds) {
  return cmds
    .map((c) => (c[0] === 'Z' ? 'Z' : c[0] + c.slice(1).map((v) => num(/** @type {number} */ (v))).join(' ')))
    .join('');
}

/** @param {Item} it */
function pathTag(it) {
  let a = `<path d="${pathData(it.cmds)}" fill="${it.fill ?? 'none'}"`;
  if (it.stroke) {
    a += ` stroke="${it.stroke}" stroke-width="${num(it.width ?? 1)}"`;
    a += ` stroke-linecap="${it.cap ?? 'butt'}" stroke-linejoin="${it.join ?? 'miter'}"`;
    if (it.dash) a += ` stroke-dasharray="${it.dash.map(num).join(' ')}"`;
  } else {
    a += ' stroke="none"';
  }
  return a + '/>';
}

/** @param {Scene} scene @returns {string} */
export function toSvg(scene) {
  const { width: w, height: h } = scene;
  const out = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    `<title>${esc(scene.title)}</title>`,
    `<desc>${esc(scene.desc)}</desc>`,
    `<rect width="${w}" height="${h}" fill="${scene.background}"/>`,
    ...scene.items.map(pathTag),
    '</svg>',
  ];
  return out.join('\n') + '\n';
}
