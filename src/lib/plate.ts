/* 판 전용 subset 글꼴: 상자에 새길 글자만 Black Han Sans 원본에서 뽑아 woff2로 만든다.
   원본이 라틴과 한글로 나뉘어 있어서 글꼴도 둘(PlateL, PlateK)이다. 어느 쪽에도 없는 글자는 대체 서체가 맡는다. */
import { readFile } from 'node:fs/promises';
import subsetFont from 'subset-font';
import type { PageView } from './view.ts';

export type PlateFont = { sub: 'latin' | 'korean'; family: 'PlateL' | 'PlateK'; woff2: Uint8Array };

const SOURCES: { sub: PlateFont['sub']; family: PlateFont['family'] }[] = [
  { sub: 'latin', family: 'PlateL' },
  { sub: 'korean', family: 'PlateK' },
];
const sourceUrl = (sub: string) =>
  new URL(`../../node_modules/@fontsource/black-han-sans/files/black-han-sans-${sub}-400-normal.woff2`, import.meta.url);

/** 새길 글자의 고유 집합: 상자 핵심어, 연도, 표지 일수의 숫자와 쉼표. 줄바꿈·공백은 뺀다 */
export function plateText(v: PageView): string {
  const all = v.boxes.map(b => b.glyph).join('') + v.cover.tpl.replaceAll('{days}', '0123456789,');
  return [...new Set([...all].filter(ch => !/\s/.test(ch)))].join('');
}

/** sfnt의 maxp.numGlyphs. .notdef 하나뿐이면 1이다 */
function glyphCount(sfnt: Uint8Array): number {
  const dv = new DataView(sfnt.buffer, sfnt.byteOffset, sfnt.byteLength);
  for (let i = 0, n = dv.getUint16(4); i < n; i++) {
    const rec = 12 + i * 16;
    if (dv.getUint32(rec) === 0x6d617870) return dv.getUint16(dv.getUint32(rec + 8) + 4);   // 'maxp'
  }
  throw new Error('maxp table not found');
}

/** 원본이 실제로 가진 글자만 남긴다: 한 글자씩 뽑아 보고 .notdef 밖의 글리프가 있는지 본다 */
async function covered(src: Uint8Array, chars: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const ch of chars) {
    if (glyphCount(await subsetFont(Buffer.from(src), ch, { targetFormat: 'sfnt' })) > 1) out.push(ch);
  }
  return out;
}

/** 글자를 원본 순서(라틴 먼저)대로 나눠 담아 중복 없이 subset한다. 담을 글자가 없는 원본은 건너뛴다 */
export async function makePlateFonts(text: string): Promise<PlateFont[]> {
  let rest = [...new Set([...text].filter(ch => !/\s/.test(ch)))];
  const fonts: PlateFont[] = [];
  for (const { sub, family } of SOURCES) {
    const src = new Uint8Array(await readFile(sourceUrl(sub)));
    const mine = await covered(src, rest);
    if (!mine.length) continue;
    rest = rest.filter(ch => !mine.includes(ch));
    const woff2 = await subsetFont(Buffer.from(src), mine.join(''), { targetFormat: 'woff2' });
    fonts.push({ sub, family, woff2: new Uint8Array(woff2) });
  }
  return fonts;
}
