// 글자를 윤곽선으로 바꾼다. 글꼴과 harfbuzz는 모두 이 파일 기준 경로에서 읽는다.
import { readFileSync } from 'node:fs';

/** @typedef {['M',number,number]|['L',number,number]|['Q',number,number,number,number]|['C',number,number,number,number,number,number]|['Z']} Cmd */
/** @typedef {'display'|'body'|'bodyBold'|'mono'} Role */
/** @typedef {{ font: any, upem: number }} Face */
/** @typedef {{ hb: any, chains: Record<Role, Face[]> }} Fonts */

const fontUrl = (name) => new URL(`../../fonts/${name}`, import.meta.url);

/** @type {Promise<Fonts> | null} */
let cache = null;

/** @returns {Promise<Fonts>} */
export function loadFonts() {
  cache ??= (async () => {
    const hb = await import(new URL('../../vendor/harfbuzzjs/index.mjs', import.meta.url).href);
    const open = (name) => {
      const face = new hb.Face(new hb.Blob(new Uint8Array(readFileSync(fontUrl(name)))), 0);
      return { face, upem: face.upem };
    };
    const hahmlet = open('Hahmlet-wght.ttf');
    const weighted = (wght) => {
      const font = new hb.Font(hahmlet.face);
      font.setVariations([new hb.Variation('wght', wght)]);
      return { font, upem: hahmlet.upem };
    };
    const plain = (name) => {
      const f = open(name);
      return { font: new hb.Font(f.face), upem: f.upem };
    };
    const body = weighted(400);
    const bold = weighted(600);
    return {
      hb,
      chains: {
        display: [plain('BlackHanSans-Regular.ttf'), bold],
        body: [body],
        bodyBold: [bold],
        mono: [plain('IBMPlexMono-Regular.ttf'), body],
      },
    };
  })();
  return cache;
}

const hex = (cp) => `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;

/**
 * @param {Fonts} fonts
 * @param {Role} role
 * @param {string} text
 * @param {number} size
 * @param {number} x
 * @param {number} baseline
 * @returns {{ cmds: Cmd[], width: number, missing: string[] }}
 */
export function shapeText(fonts, role, text, size, x, baseline) {
  const { hb } = fonts;
  const chain = fonts.chains[role];
  /** @type {Cmd[]} */
  const cmds = [];
  const missing = [];
  // 글자마다 처음 그 글자가 있는 글꼴을 찾아 같은 글꼴끼리 덩어리로 묶는다.
  /** @type {{ idx: number, text: string }[]} */
  const runs = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    let idx = chain.findIndex((f) => f.font.nominalGlyph(cp) !== undefined);
    if (idx < 0) {
      idx = 0;
      if (!/\s/u.test(ch)) {
        const label = `${ch} (${hex(cp)})`;
        if (!missing.includes(label)) missing.push(label);
      }
    }
    const last = runs[runs.length - 1];
    if (last && last.idx === idx) last.text += ch;
    else runs.push({ idx, text: ch });
  }
  let pen = 0;
  for (const run of runs) {
    const { font, upem } = chain[run.idx];
    const scale = size / upem;
    const buf = new hb.Buffer();
    try {
      buf.addText(run.text);
      buf.guessSegmentProperties();
      hb.shape(font, buf);
      for (const g of buf.getGlyphInfosAndPositions()) {
        if (g.codepoint !== 0) {
          for (const seg of font.glyphToJson(g.codepoint)) {
            if (seg.type === 'Z') {
              cmds.push(['Z']);
              continue;
            }
            const out = [seg.type];
            seg.values.forEach((v, i) => {
              out.push(
                i % 2 === 0
                  ? x + pen + ((g.xOffset ?? 0) + v) * scale
                  : baseline - ((g.yOffset ?? 0) + v) * scale,
              );
            });
            cmds.push(/** @type {Cmd} */ (out));
          }
        }
        pen += g.xAdvance * scale;
      }
    } finally {
      buf.destroy?.();
    }
  }
  return { cmds, width: pen, missing };
}
