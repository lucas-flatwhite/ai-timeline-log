// Scene을 PDF 한 쪽으로 쓴다. 쪽 하나, 내용 스트림 하나, 날짜와 ID 없음.
import { deflateSync } from 'node:zlib';
import { num } from './num.mjs';

/** @typedef {import('./layout.mjs').Scene} Scene */
/** @typedef {import('./draw.mjs').Item} Item */

/** @param {string} hex */
const rgb = (hex) => [1, 3, 5].map((i) => num(parseInt(hex.slice(i, i + 2), 16) / 255)).join(' ');
const CAP = { butt: 0, round: 1, square: 2 };
const JOIN = { miter: 0, round: 1 };

/** @param {Item} it @returns {string[]} */
function itemOps(it) {
  const ops = ['q'];
  if (it.fill) ops.push(`${rgb(it.fill)} rg`);
  if (it.stroke) {
    ops.push(`${rgb(it.stroke)} RG`, `${num(it.width ?? 1)} w`);
    ops.push(`${CAP[it.cap ?? 'butt']} J`, `${JOIN[it.join ?? 'miter']} j`);
    if (it.dash) ops.push(`[${it.dash.map(num).join(' ')}] 0 d`);
  }
  let cx = 0, cy = 0, sx = 0, sy = 0;
  for (const c of it.cmds) {
    if (c[0] === 'M') {
      [, cx, cy] = c; sx = cx; sy = cy;
      ops.push(`${num(cx)} ${num(cy)} m`);
    } else if (c[0] === 'L') {
      [, cx, cy] = c;
      ops.push(`${num(cx)} ${num(cy)} l`);
    } else if (c[0] === 'Q') {
      const [, x1, y1, x, y] = c;
      const a1x = cx + (2 / 3) * (x1 - cx), a1y = cy + (2 / 3) * (y1 - cy);
      const a2x = x + (2 / 3) * (x1 - x), a2y = y + (2 / 3) * (y1 - y);
      ops.push(`${[a1x, a1y, a2x, a2y, x, y].map(num).join(' ')} c`);
      cx = x; cy = y;
    } else if (c[0] === 'C') {
      const [, x1, y1, x2, y2, x, y] = c;
      ops.push(`${[x1, y1, x2, y2, x, y].map(num).join(' ')} c`);
      cx = x; cy = y;
    } else {
      ops.push('h');
      cx = sx; cy = sy;
    }
  }
  ops.push(it.fill && it.stroke ? 'B' : it.fill ? 'f' : 'S', 'Q');
  return ops;
}

/** @param {Scene} scene @returns {Uint8Array} */
export function toPdf(scene) {
  const { width: w, height: h } = scene;
  const content = [`1 0 0 -1 0 ${num(h)} cm`, `${rgb(scene.background)} rg`, `0 0 ${num(w)} ${num(h)} re`, 'f'];
  for (const it of scene.items) content.push(...itemOps(it));
  const stream = deflateSync(Buffer.from(content.join('\n') + '\n', 'latin1'), { level: 9 });

  /** @type {Buffer[]} */
  const objs = [
    Buffer.from('<< /Type /Catalog /Pages 2 0 R >>'),
    Buffer.from('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
    Buffer.from(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(w)} ${num(h)}] /Contents 4 0 R /Resources << >> >>`),
    Buffer.concat([
      Buffer.from(`<< /Length ${stream.length} /Filter /FlateDecode >>\nstream\n`),
      stream,
      Buffer.from('\nendstream'),
    ]),
  ];
  /** @type {Buffer[]} */
  const parts = [Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'latin1')];
  let pos = parts[0].length;
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(pos);
    const b = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`), o, Buffer.from('\nendobj\n')]);
    parts.push(b);
    pos += b.length;
  });
  const xref = ['xref', `0 ${objs.length + 1}`, '0000000000 65535 f '];
  for (const o of offsets) xref.push(`${String(o).padStart(10, '0')} 00000 n `);
  parts.push(Buffer.from(`${xref.join('\n')}\ntrailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${pos}\n%%EOF\n`));
  return new Uint8Array(Buffer.concat(parts));
}
