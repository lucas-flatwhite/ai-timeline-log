/* 용량 예산을 검사한다: 언어별 판 글꼴 합계, 클라이언트 JS 합계(압축 전, 바이트), 포스터 미리보기 한 장의 크기와 개수.
   빌드 결과(dist/)를 읽으므로 npm run build 뒤에 돈다. 넘으면 종료 코드 1.
   사이트 글(site.yaml의 <언어>)이 있는 언어에 판 글꼴 파일이 하나도 없어도 종료 코드 1이다(조용히 통과하지 않게).
   시험할 때는 BUDGET_FONT, BUDGET_JS, BUDGET_PREVIEW 환경 변수로 한도를 바꾼다. */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { parse } from 'yaml';

const dist = new URL('../dist/', import.meta.url);
const site = parse(readFileSync(new URL('../content/site.yaml', import.meta.url), 'utf8')) as Record<string, unknown>;
const EXPECTED = ['ko', 'en'].filter(l => site[l]);   // 판 글꼴이 있어야 하는 언어
const limit = (name: string, fallback: number): number => {
  const v = process.env[name];
  if (v === undefined || v === '') return fallback;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) { console.error(`${name}은(는) 바이트 수여야 합니다: ${v}`); process.exit(2); }
  return n;
};
const FONT = limit('BUDGET_FONT', 40960);   // 40KB, 언어별
const JS = limit('BUDGET_JS', 30720);       // 30KB
const PREVIEW = limit('BUDGET_PREVIEW', 102400);   // 100KB, 가져가기의 포스터 미리보기 한 장

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
const missing = EXPECTED.filter(l => !byLocale.has(l));
rows.push({ label: '클라이언트 JS', size: js.reduce((n, f) => n + f.size, 0), limit: JS });
/* 포스터 미리보기: 마지막 포스터 판의 것만 언어별로 하나(판마다 덮어써서 쌓이지 않는다). 원본 포스터는 GitHub Releases에만 둔다 */
const previews = list('poster/', '');
for (const f of previews) rows.push({ label: `미리보기 ${f.name}`, size: f.size, limit: PREVIEW });

const w = Math.max(...rows.map(r => r.label.length));
console.log(`${'항목'.padEnd(w)}  ${'크기'.padStart(8)}  ${'한도'.padStart(8)}  결과`);
let failed = false;
for (const r of rows) {
  const ok = r.size <= r.limit;
  if (!ok) failed = true;
  console.log(`${r.label.padEnd(w)}  ${(r.size + 'B').padStart(8)}  ${(r.limit + 'B').padStart(8)}  ${ok ? '통과' : '초과'}`);
}
for (const l of missing) {
  failed = true;
  console.error(`판 글꼴 ${l}: dist/plate/${l}-*.woff2가 없습니다(site.yaml에 ${l} 글이 있음)`);
}
if (previews.length > EXPECTED.length) {
  failed = true;
  console.error(`dist/poster/에 미리보기가 ${previews.length}개 있습니다. 언어별로 하나(${EXPECTED.length}개)만 둡니다: npm run poster:pull`);
}
process.exit(failed ? 1 : 0);
