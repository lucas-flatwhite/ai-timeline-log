/* 일회용: 시안(brainstorm data.js)의 임시 핵심어를 33개 장면의 사건마다 glyph로 넣는다.
   장면은 파일 이름순, 사건은 YAML 순서. parseDocument로 주석과 모양을 보존한다. 개수가 128이 아니면 멈춘다.
   실행: node scripts/backfill-glyphs.ts (Task 13에서 지운다) */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { parseDocument } from 'yaml';

const SRC = '/Users/lucas-flatwhite/Documents/github/ai-timeline-log/.superpowers/brainstorm/15013-1792917035/content/data.js';
const data = JSON.parse(readFileSync(SRC, 'utf8').replace(/^window\.DATA=/, '').replace(/;\s*$/, ''));
const dir = new URL('../content/scenes/', import.meta.url);
const files = readdirSync(dir).filter(n => n.endsWith('.yaml')).sort();

if (files.length !== data.scenes.length) throw new Error(`scene count: ${files.length} files vs ${data.scenes.length} in data.js`);
let count = 0;
files.forEach((f, i) => {
  const doc = parseDocument(readFileSync(new URL(f, dir), 'utf8'));
  const items = data.scenes[i].items as { g: string }[];
  const n = (doc.get('items') as { items: unknown[] }).items.length;
  if (n !== items.length) throw new Error(`${f}: ${n} items vs ${items.length} in data.js`);
  items.forEach((it, k) => { doc.setIn(['items', k, 'glyph'], it.g); count++; });
  writeFileSync(new URL(f, dir), doc.toString({ lineWidth: 0 }));
});
if (count !== 128) throw new Error(`expected 128 glyphs, wrote ${count}`);
console.log(`wrote ${count} glyphs into ${files.length} scenes`);
