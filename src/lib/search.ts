import type { Content } from './content.ts';
import type { Locale } from './dates.ts';
import { glyphFor, itemAddresses, ymd } from './grid.ts';

/* 찾기: 검색어와 상자 글을 같은 꼴로 바꿔 부분 문자열로 맞춘다. 브라우저와 빌드가 함께 쓴다(순수 함수).
   대소문자, 띄어쓰기, 문장 부호와 기호는 무시한다. 그래서 'gpt4'로 'GPT-4'를, '2025.01'로 '20250120'을 찾는다 */
export function norm(s: string): string {
  return s.normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
}

/** 띄어쓰기로 나눈 검색어. 꼴을 바꾼 뒤 비는 낱말은 버린다 */
export function terms(q: string): string[] {
  return q.split(/\s+/).map(norm).filter(Boolean);
}

/** 모든 낱말이 들어 있어야 맞는다 */
export function hit(hay: string, ts: string[]): boolean {
  return ts.length > 0 && ts.every(t => hay.includes(t));
}

/** 상자 날짜(YYYYMMDD, YYYYMM)가 시기(YYYYMM부터 YYYYMM까지, 끝이 없으면 현재까지) 안인가 */
export function inEra(date: string, from: string, to?: string): boolean {
  const ym = date.slice(0, 6);
  return ym >= from && (!to || ym <= to);
}

/** 한 언어의 글로 만든 상자별 찾기 글(주소 → 꼴을 바꾼 글). 사건: 날짜, 상자 글자, 사건 문장. 장면: 날짜, 상자 글자, 머리말, 제목, 소개 글.
 *  페이지에는 그 언어의 글이 이미 있으므로, 각 언어 페이지는 다른 언어의 이 색인만 받아 온다 */
export function searchIndex(c: Content, locale: Locale): Record<string, string> {
  const out: Record<string, string> = {};
  for (const s of c.scenes) {
    const t = s[locale];
    out[s.id] = norm([ymd(s.date), t.glyph ?? s.print.glyph, t.kicker, t.title, t.lede].join(' '));
    const addrs = itemAddresses(s.id, s.items.map(it => it.date));
    s.items.forEach((it, k) => {
      out[addrs[k]] = norm([ymd(it.date), glyphFor(it.glyph, locale), it[locale]].join(' '));
    });
  }
  return out;
}
