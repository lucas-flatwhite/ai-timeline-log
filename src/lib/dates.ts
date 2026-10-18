export type Locale = 'ko' | 'en';
export interface Span { from: string; to?: string }
interface Parts { y: number; m?: number; d?: number }

const EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EN_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const RE = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;

export function parts(iso: string): Parts {
  const r = RE.exec(iso);
  if (!r) throw new Error(`Invalid date "${iso}" (expected YYYY, YYYY-MM or YYYY-MM-DD)`);
  const y = +r[1];
  const m = r[2] ? +r[2] : undefined;
  const d = r[3] ? +r[3] : undefined;
  if (m !== undefined && (m < 1 || m > 12)) throw new Error(`Invalid month in "${iso}"`);
  if (d !== undefined && (d < 1 || d > new Date(Date.UTC(y, m!, 0)).getUTCDate())) throw new Error(`Invalid day in "${iso}"`);
  return { y, m, d };
}

export function normalizeDate(v: unknown): string {
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) throw new Error('Invalid date object');
    return v.toISOString().slice(0, 10);
  }
  if (typeof v === 'number' && Number.isInteger(v)) v = String(v);
  if (typeof v !== 'string') throw new Error(`Invalid date ${JSON.stringify(v)}`);
  parts(v);
  return v;
}

export function toUTC(iso: string): number {
  const p = parts(iso);
  return Date.UTC(p.y, (p.m ?? 1) - 1, p.d ?? 1);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((toUTC(b) - toUTC(a)) / 86_400_000);
}

export function fraction(iso: string, start: string, end: string): number {
  return (toUTC(iso) - toUTC(start)) / (toUTC(end) - toUTC(start));
}

const p2 = (n: number) => String(n).padStart(2, '0');

function dot(p: Parts, withYear = true): string {
  const out: string[] = withYear ? [String(p.y)] : [];
  if (p.m !== undefined) out.push(p2(p.m));
  if (p.d !== undefined) out.push(p2(p.d));
  return out.join('.');
}

function en(p: Parts): string {
  if (p.m === undefined) return String(p.y);
  if (p.d === undefined) return `${EN[p.m - 1]} ${p.y}`;
  return `${EN[p.m - 1]} ${p.d}, ${p.y}`;
}

export function formatDot(iso: string): string {
  return dot(parts(iso));
}

export function formatYYMM(iso: string): string {
  const p = parts(iso);
  return `${String(p.y).slice(2)}.${p2(p.m ?? 1)}`;
}

export function formatDate(locale: Locale, iso: string): string {
  const p = parts(iso);
  return locale === 'ko' ? dot(p) : en(p);
}

export function formatLong(locale: Locale, iso: string): string {
  const p = parts(iso);
  if (p.m === undefined || p.d === undefined) throw new Error(`formatLong needs YYYY-MM-DD: ${iso}`);
  return locale === 'ko' ? `${p.y}년 ${p.m}월 ${p.d}일` : `${EN_LONG[p.m - 1]} ${p.d}, ${p.y}`;
}

export function formatMonthLong(locale: Locale, iso: string): string {
  const p = parts(iso);
  if (p.m === undefined) throw new Error(`formatMonthLong needs a month: ${iso}`);
  return locale === 'ko' ? `${p.y}년 ${p.m}월` : `${EN_LONG[p.m - 1]} ${p.y}`;
}

export function formatSpan(locale: Locale, span: Span): string {
  const f = parts(span.from);
  if (!span.to) return locale === 'ko' ? dot(f) : en(f);
  const t = parts(span.to);
  if (locale === 'ko') return `${dot(f)}–${dot(t, t.y !== f.y)}`;
  if (t.y !== f.y) return `${en(f)} – ${en(t)}`;
  if (f.d === undefined && t.d === undefined) return `${EN[f.m! - 1]}–${EN[t.m! - 1]} ${f.y}`;
  if (f.d !== undefined && t.d !== undefined) return `${EN[f.m! - 1]} ${f.d} – ${EN[t.m! - 1]} ${t.d}, ${f.y}`;
  return `${en(f)} – ${en(t)}`;
}

export function formatItemDate(locale: Locale, iso: string, sceneYear: number): string {
  const p = parts(iso);
  const short = p.y === sceneYear && p.d !== undefined;
  if (locale === 'ko') return short ? dot(p, false) : dot(p);
  return short ? `${EN[p.m! - 1]} ${p.d}` : en(p);
}

/** 원본의 기간 표기("2023.07–08", "2023.12–2024.02", "2022.11.30")를 Span으로 */
export function parseLegacyWhen(when: string): Span {
  const r = /^(\d{4})\.(\d{2})(?:\.(\d{2}))?(?:–(?:(\d{4})\.)?(\d{2}))?$/.exec(when);
  if (!r) throw new Error(`Unrecognized when "${when}"`);
  const [, y, mo, d, y2, mo2] = r;
  const from = d ? `${y}-${mo}-${d}` : `${y}-${mo}`;
  return mo2 ? { from, to: `${y2 ?? y}-${mo2}` } : { from };
}

/** 원본의 항목 날짜 축약형: "MM.DD"(장면 연도), "YY.MM", "YY.MM.DD" */
export function parseLegacyItemDate(s: string, sceneYear: number): string {
  const p = s.split('.');
  if (p.length === 3) return normalizeDate(`20${p[0]}-${p[1]}-${p[2]}`);
  if (p.length === 2) return normalizeDate(+p[0] > 12 ? `20${p[0]}-${p[1]}` : `${sceneYear}-${p[0]}-${p[1]}`);
  throw new Error(`Unrecognized item date "${s}"`);
}
