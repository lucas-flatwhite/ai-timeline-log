/* 용량 예산을 검사한다: 언어별 판 글꼴 합계와 클라이언트 JS 합계(압축 전, 바이트).
   빌드 결과(dist/)를 읽으므로 npm run build 뒤에 돈다. 넘으면 종료 코드 1.
   시험할 때는 BUDGET_FONT, BUDGET_JS 환경 변수로 한도를 바꾼다. */
import { existsSync, readdirSync, statSync } from 'node:fs';

const dist = new URL('../dist/', import.meta.url);
const limit = (name: string, fallback: number): number => {
  const v = process.env[name];
  if (v === undefined || v === '') return fallback;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) { console.error(`${name}은(는) 바이트 수여야 합니다: ${v}`); process.exit(2); }
  return n;
};
const FONT = limit('BUDGET_FONT', 40960);   // 40KB, 언어별
const JS = limit('BUDGET_JS', 30720);       // 30KB

const list = (sub: string, ext: string): { name: string; size: number }[] => {
  const dir = new URL(sub, dist);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith(ext)).sort()
    .map(name => ({ name, size: statSync(new URL(name, dir)).size }));
};

const fonts = list('plate/', '.woff2');
const js = list('_astro/', '.js');
if (!fonts.length || !js.length) {
  console.error('dist/plate 또는 dist/_astro에 파일이 없습니다. 먼저 npm run build를 실행하세요.');
  process.exit(2);
}

const rows: { label: string; size: number; limit: number }[] = [];
const byLocale = new Map<string, number>();
for (const f of fonts) {
  const locale = f.name.split('-')[0]!;       // <언어>-<latin|korean>.woff2
  byLocale.set(locale, (byLocale.get(locale) ?? 0) + f.size);
}
for (const [locale, size] of byLocale) rows.push({ label: `판 글꼴 ${locale}`, size, limit: FONT });
rows.push({ label: '클라이언트 JS', size: js.reduce((n, f) => n + f.size, 0), limit: JS });

const w = Math.max(...rows.map(r => r.label.length));
console.log(`${'항목'.padEnd(w)}  ${'크기'.padStart(8)}  ${'한도'.padStart(8)}  결과`);
let failed = false;
for (const r of rows) {
  const ok = r.size <= r.limit;
  if (!ok) failed = true;
  console.log(`${r.label.padEnd(w)}  ${(r.size + 'B').padStart(8)}  ${(r.limit + 'B').padStart(8)}  ${ok ? '통과' : '초과'}`);
}
process.exit(failed ? 1 : 0);
