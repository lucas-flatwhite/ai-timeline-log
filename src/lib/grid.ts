import type { Locale } from './dates.ts';
import type { GlyphSpec } from './schema.ts';

/** 격자 칸 정렬과 사건 주소에 쓰는 순수 함수 모음. */

export function glyphFor(g: GlyphSpec, locale: Locale): string {
  return typeof g === 'string' ? g : g[locale];
}

/** '2025-01-20' → '20250120', 월까지만 있는 '2023-01' → '202301' */
export function ymd(iso: string): string {
  return iso.replaceAll('-', '');
}

/** 사건 주소 `<장면 id>~<YYYYMMDD>`. 같은 날짜가 겹치면 두 번째부터 `-2`, `-3`을 붙인다. */
export function itemAddresses(sceneId: string, dates: string[]): string[] {
  const seen = new Map<string, number>();
  return dates.map(d => {
    const base = `${sceneId}~${ymd(d)}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  });
}

/** 판화 무늬 씨앗: FNV-1a 32비트 해시를 1..99991 범위로 줄인다. */
export function hashSeed(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return ((h >>> 0) % 99991) + 1;
}

export interface WallEntry { kind: 'year' | 'scene' | 'item'; date: string; order: number; seq: number }

// 연도는 그 해의 맨 앞(= 내림차순에서 가장 먼저), 월까지만 있는 날짜는 그 달의 맨 끝(과거 쪽)에 둔다.
function wallKey(e: WallEntry): string {
  if (e.kind === 'year') return `${e.date}-99-99`;
  return /^\d{4}-\d{2}$/.test(e.date) ? `${e.date}-00` : e.date;
}

/** 최신순. 열쇠가 같으면 장면이 사건보다 앞, 그다음 order, seq 오름차순. 원본은 바꾸지 않는다. */
export function sortWall<T extends WallEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const ka = wallKey(a), kb = wallKey(b);
    if (ka !== kb) return ka < kb ? 1 : -1;
    const ra = a.kind === 'item' ? 1 : 0, rb = b.kind === 'item' ? 1 : 0;
    return ra - rb || a.order - b.order || a.seq - b.seq;
  });
}
