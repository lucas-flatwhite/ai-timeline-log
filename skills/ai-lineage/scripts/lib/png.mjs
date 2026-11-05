// SVG를 PNG로 바꾼다. 번들한 resvg(wasm)를 쓰고 시스템 글꼴은 읽지 않는다.
import { readFileSync } from 'node:fs';
import { Resvg, initWasm } from '../../vendor/resvg/index.mjs';

/** @type {Promise<void> | undefined} */
let ready;
function init() {
  ready ??= initWasm(readFileSync(new URL('../../vendor/resvg/index_bg.wasm', import.meta.url)));
  return ready;
}

/** @param {string} svg @param {number} [zoom] @returns {Promise<Uint8Array>} */
export async function toPng(svg, zoom = 2) {
  await init();
  const resvg = new Resvg(svg, { fitTo: { mode: 'zoom', value: zoom }, font: { loadSystemFonts: false } });
  const image = resvg.render();
  const png = image.asPng();
  const out = new Uint8Array(png);
  image.free?.();
  resvg.free?.();
  return out;
}
