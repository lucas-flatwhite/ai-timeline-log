/* 계보 스킬의 견본(MoE)을 한국어와 영어로 그리고, 사이트 칸이 쓸 AVIF를 만든다.
   기본 결(woodcut)로, 사용자가 받는 기본 모습 그대로(출처 줄 없이) 그린다. 결과물은 examples/와 public/lineage/에 쓴다.
   실행: npm run lineage:sample */
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { main } from '../skills/ai-lineage/scripts/lineage.mjs';

const LANGS = ['ko', 'en'] as const;
const OUTPUTS = ['png', 'svg', 'pdf', 'mmd', 'sources.md'];
const SITE_WIDTH = 1200;

const root = new URL('..', import.meta.url);
const examples = new URL('skills/ai-lineage/examples/', root);
const site = new URL('public/lineage/', root);
mkdirSync(site, { recursive: true });

for (const lang of LANGS) {
  const code = await main(['draw', fileURLToPath(new URL(`moe.${lang}.lineage.json`, examples))]);
  if (code !== 0) process.exit(code);
  for (const ext of OUTPUTS) {
    console.log(`moe.${lang}.${ext}: ${statSync(new URL(`moe.${lang}.${ext}`, examples)).size}B`);
  }
  const png = fileURLToPath(new URL(`moe.${lang}.png`, examples));
  const avif = await sharp(png).resize({ width: SITE_WIDTH }).avif({ quality: 50 }).toBuffer();
  writeFileSync(new URL(`ai-lineage-${lang}.avif`, site), avif);
  console.log(`public/lineage/ai-lineage-${lang}.avif: ${avif.length}B`);
}
