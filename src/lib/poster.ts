import type { Locale } from './dates.ts';
import type { Edition } from './schema.ts';
import { ORIGIN } from './origin.ts';

/** 판 포스터의 배치와 파일 이름. 찍는 일은 scripts/poster.ts가, 올리는 일은 .github/workflows/poster.yml이 한다 */

export const A_RATIO = Math.SQRT2;   // A판 세로(높이/너비)

/** 칸 수마다 잰 포스터 크기 가운데 높이/너비가 ratio에 가장 가까운 칸 수. 같으면 적은 쪽 */
export function pickColumns(sizes: { n: number; w: number; h: number }[], ratio: number = A_RATIO): number {
  let best = sizes[0];
  for (const s of sizes) {
    const d = Math.abs(s.h / s.w - ratio), bd = Math.abs(best.h / best.w - ratio);
    if (d < bd || (d === bd && s.n < best.n)) best = s;
  }
  return best.n;
}

/** css 너비를 종이 너비(mm)·해상도(dpi)에 맞추는 배율. A2 너비 420mm, 300dpi면 4961px */
export function posterScale(cssWidth: number, mm = 420, dpi = 300): number {
  return Math.ceil(mm / 25.4 * dpi) / cssWidth;
}

/** 포스터의 QR과 먹 띠 주소: 그 언어의 페이지(영어 포스터는 /en/) */
export function posterSiteUrl(locale: Locale): string {
  return ORIGIN + (locale === 'en' ? 'en/' : '');
}

export function posterFiles(locale: Locale): { pdf: string; png: string; web: string } {
  return { pdf: `poster-${locale}.pdf`, png: `poster-${locale}.png`, web: `poster-${locale}-web.png` };
}

/** 포스터를 찍을 판. 판 기록에 없거나 poster가 false면 던진다 */
export function editionFor(editions: Edition[], n: number): Edition {
  const e = editions.find(x => x.n === n);
  if (!e?.poster) throw new Error(`edition ${n} has no poster`);
  return e;
}
