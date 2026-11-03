/* 에이전트가 장면 YAML을 하나씩 열지 않고 중복과 빈자리를 확인하도록 콘텐츠를 짧게 펼쳐 보인다.
   npm run index                     장면마다 한 줄: 날짜, id, 사건 수, 주제, 영어 제목. 위에 주제별 장면 수
   npm run index -- --items          장면 아래에 사건마다 한 줄(날짜, 영어 문장 앞부분)
   npm run index -- --since 2026-09  그 날짜 이후 장면만(--items와 함께 쓸 수 있다)
   npm run index -- --grep 낱말       장면(제목, 사건 글, 출처 주소)과 용어집에서 낱말을 찾는다(대소문자 무시) */
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';

type Item = { date: unknown; ko: string; en: string; sources?: { url: string }[] };
type Scene = {
  id: string; date: unknown; topics?: string[]; items: Item[];
  sources?: { url: string }[]; ko: { title: string }; en: { title: string };
};
type Term = { ko: string; en: string; source?: string };

const root = new URL('../content/', import.meta.url);
const read = (path: string): unknown => parse(readFileSync(new URL(path, root), 'utf8'));

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  const v = args[i + 1];
  if (v === undefined || v.startsWith('--')) { console.error(`${name} 뒤에 값이 필요합니다`); process.exit(2); }
  return v;
};
const showItems = args.includes('--items');
const since = flag('--since');
const needle = flag('--grep')?.toLowerCase();

const scenes = readdirSync(new URL('scenes/', root)).filter(f => f.endsWith('.yaml'))
  .map(f => read(`scenes/${f}`) as Scene)
  .map(s => ({ ...s, date: String(s.date) }))
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));   // 사이트처럼 최신순

const cut = (s: string, n: number): string => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const sceneLine = (s: Scene & { date: string }): string =>
  `${s.date}  ${s.id}  ${s.items.length}  [${(s.topics ?? []).join(',')}]  ${s.en.title}`;
const itemLine = (it: Item): string => `    ${String(it.date)}  ${cut(it.en, 110)}`;

if (needle) {
  const hit = (...xs: (string | undefined)[]): boolean => xs.some(x => x?.toLowerCase().includes(needle));
  let n = 0;
  for (const s of scenes) {
    const head = hit(s.id, s.ko.title, s.en.title, ...(s.sources ?? []).map(x => x.url));
    const items = s.items.filter(it => hit(it.ko, it.en, ...(it.sources ?? []).map(x => x.url)));
    if (!head && !items.length) continue;
    n++;
    console.log(sceneLine(s));
    for (const it of items) console.log(itemLine(it));
  }
  const terms = (read('glossary.yaml') as Term[]).filter(t => hit(t.ko, t.en));
  if (terms.length) {
    console.log('\n용어집 (content/glossary.yaml):');
    for (const t of terms) console.log(`  ${t.ko} = ${t.en}${t.source ? `  <${t.source}>` : ''}`);
  }
  if (!n && !terms.length) console.log(`"${needle}"에 맞는 장면이나 용어가 없습니다`);
} else {
  const list = since ? scenes.filter(s => s.date >= since) : scenes;
  const topics = read('topics.yaml') as Record<string, { en: string }>;
  const count = (id: string): number => scenes.filter(s => s.topics?.includes(id)).length;
  console.log(`장면 ${scenes.length}개. 주제: ${Object.keys(topics).map(id => `${id}(${count(id)})`).join(' ')}`);
  console.log('날짜  id  사건 수  [주제]  영어 제목\n');
  for (const s of list) {
    console.log(sceneLine(s));
    if (showItems) for (const it of s.items) console.log(itemLine(it));
  }
}
