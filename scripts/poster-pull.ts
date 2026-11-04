/* 판 포스터의 Release가 생긴 뒤, 사이트의 가져가기 칸이 쓸 것을 저장소로 가져온다.
   1) 파일 크기(PDF, PNG, 화면용 PNG)와 PNG의 픽셀 크기를 content/editions.yaml의 그 판 files에 적는다
   2) 화면용 PNG를 가로 600px AVIF로 줄여 public/poster/edition-<n>-<언어>.avif에 둔다. 다른 판의 미리보기는 지운다
   포스터 원본은 지금처럼 Release에만 있다. 실행: npm run poster:pull -- --edition <n> */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import sharp from 'sharp';
import { parseDocument, isMap, isSeq, type Document, type YAMLMap } from 'yaml';
import { loadContent } from '../src/lib/content.ts';
import type { Locale } from '../src/lib/dates.ts';
import { editionFor, posterFiles, PREVIEW_DIR, PREVIEW_WIDTH, previewFile } from '../src/lib/poster.ts';

const LOCALES: Locale[] = ['ko', 'en'];
const root = new URL('..', import.meta.url);

const a = process.argv.slice(2), i = a.indexOf('--edition');
const n = Number(i >= 0 ? a[i + 1] : NaN);
if (!Number.isInteger(n)) { console.error('usage: npm run poster:pull -- --edition <n>'); process.exit(2); }

const content = loadContent();
try { editionFor(content.editions, n); } catch (e) { console.error((e as Error).message); process.exit(1); }
const repo = new URL(content.site.repo).pathname.replace(/^\/|\/$/g, '');   // owner/name

type Asset = { name: string; size: number; browser_download_url: string };
const headers: Record<string, string> = { accept: 'application/vnd.github+json', 'user-agent': 'ai-timeline-log-poster-pull' };
if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
const res = await fetch(`https://api.github.com/repos/${repo}/releases/tags/edition-${n}`, { headers });
if (!res.ok) { console.error(`edition-${n} Release를 찾지 못했습니다 (${res.status}). poster 워크플로가 끝났는지 확인하세요.`); process.exit(1); }
const assets = new Map(((await res.json()) as { assets: Asset[] }).assets.map(x => [x.name, x]));
const asset = (name: string): Asset => {
  const x = assets.get(name);
  if (!x) { console.error(`edition-${n} Release에 ${name}이 없습니다`); process.exit(1); }
  return x;
};

/** PNG 머리(IHDR)의 가로·세로. 앞 24바이트만 읽고 끊는다 */
async function pngSize(url: string): Promise<[number, number]> {
  const r = await fetch(url, { headers: { range: 'bytes=0-23' } });
  if (!r.ok || !r.body) throw new Error(`${url}: ${r.status}`);
  const reader = r.body.getReader();
  let buf = Buffer.alloc(0);
  while (buf.length < 24) {
    const { done, value } = await reader.read();
    if (done) break;
    buf = Buffer.concat([buf, value]);
  }
  await reader.cancel();
  if (buf.length < 24 || buf.toString('latin1', 1, 4) !== 'PNG') throw new Error(`${url}: not a PNG`);
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}

const files: Record<string, { pdf: number; png: number; web: number; px: [number, number] }> = {};
const dir = new URL(`public/${PREVIEW_DIR}/`, root);
mkdirSync(dir, { recursive: true });
const keep = new Set<string>();
for (const locale of LOCALES) {
  const f = posterFiles(locale);
  const pdf = asset(f.pdf), png = asset(f.png), web = asset(f.web);
  files[locale] = { pdf: pdf.size, png: png.size, web: web.size, px: await pngSize(png.browser_download_url) };
  const r = await fetch(web.browser_download_url);
  if (!r.ok) { console.error(`${f.web}: ${r.status}`); process.exit(1); }
  const avif = await sharp(Buffer.from(await r.arrayBuffer())).resize({ width: PREVIEW_WIDTH }).avif({ quality: 50 }).toBuffer();
  const out = basename(previewFile(n, locale));
  writeFileSync(new URL(out, dir), avif);
  keep.add(out);
  console.log(`${locale}: pdf ${pdf.size}B, png ${png.size}B ${files[locale].px.join('×')}px, web ${web.size}B → public/${PREVIEW_DIR}/${out} ${avif.length}B`);
}
// 사이트에는 마지막 판의 미리보기만 둔다(지난 판의 포스터는 Release에 그대로 있다)
for (const old of readdirSync(dir)) if (!keep.has(old)) { rmSync(new URL(old, dir)); console.log(`removed public/${PREVIEW_DIR}/${old}`); }

/* editions.yaml: 그 판에 files를 적는다. 주석과 다른 판의 모양은 그대로 둔다 */
const path = new URL('content/editions.yaml', root);
const doc: Document = parseDocument(readFileSync(path, 'utf8'));
if (!isSeq(doc.contents)) throw new Error('editions.yaml is not a list');
const item = doc.contents.items.find(x => isMap(x) && x.get('n') === n);
if (!isMap(item)) throw new Error(`editions.yaml: edition ${n} not found`);
const node = doc.createNode({}) as YAMLMap;
for (const locale of LOCALES) node.set(locale, doc.createNode(files[locale], { flow: true }));
item.set('files', node);
writeFileSync(path, doc.toString({ lineWidth: 0 }));
console.log(`content/editions.yaml: edition ${n} files`);
