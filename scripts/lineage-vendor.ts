/* 계보 스킬이 쓰는 라이브러리를 node_modules에서 skills/ai-lineage/vendor/로 복사한다.
   스킬은 설치 단계 없이 돌아야 하므로 복사본을 저장소에 둔다. 쓴 경로와 바이트를 출력한다. */
import { copyFileSync, mkdirSync, statSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const COPIES: [string, string][] = [
  ['node_modules/harfbuzzjs/dist/index.mjs', 'skills/ai-lineage/vendor/harfbuzzjs/index.mjs'],
  ['node_modules/harfbuzzjs/dist/harfbuzz.js', 'skills/ai-lineage/vendor/harfbuzzjs/harfbuzz.js'],
  ['node_modules/harfbuzzjs/dist/harfbuzz.wasm', 'skills/ai-lineage/vendor/harfbuzzjs/harfbuzz.wasm'],
  ['node_modules/harfbuzzjs/LICENSE', 'skills/ai-lineage/vendor/harfbuzzjs/LICENSE'],
  ['node_modules/@resvg/resvg-wasm/index.mjs', 'skills/ai-lineage/vendor/resvg/index.mjs'],
  ['node_modules/@resvg/resvg-wasm/index_bg.wasm', 'skills/ai-lineage/vendor/resvg/index_bg.wasm'],
];

for (const [from, to] of COPIES) {
  const dest = new URL(to, root);
  mkdirSync(new URL('./', dest), { recursive: true });
  copyFileSync(new URL(from, root), dest);
  console.log(`${to} ${statSync(dest).size}B`);
}
