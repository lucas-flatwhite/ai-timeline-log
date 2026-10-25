/* 판 전용 글꼴을 언어별로 만든다: 그 언어 판에 새길 글자만 담은 woff2와, 페이지가 읽을 목록(plate.json).
   사이트 글(site.yaml)이 있는 언어만 만든다. predev·prebuild에서 돈다.
   산출물(public/plate/, src/generated/)은 커밋하지 않는다. */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { loadContent } from '../src/lib/content.ts';
import { buildView } from '../src/lib/view.ts';
import { makePlateFonts, plateText } from '../src/lib/plate.ts';
import { locales } from '../src/i18n/index.ts';

const root = new URL('..', import.meta.url);
const content = loadContent();
const dir = new URL('public/plate/', root);
rmSync(dir, { recursive: true, force: true });       // 지난 빌드의 글꼴이 남지 않게
mkdirSync(dir, { recursive: true });
mkdirSync(new URL('src/generated/', root), { recursive: true });

const manifest: Record<string, { family: string; file: string }[]> = {};
for (const { code } of locales) {
  if (!content.site[code]) continue;
  const fonts = await makePlateFonts(plateText(buildView(content, code)));
  manifest[code] = fonts.map(f => {
    const file = `plate/${code}-${f.sub}.woff2`;
    writeFileSync(new URL(`public/${file}`, root), f.woff2);
    console.log(`public/${file} ${f.woff2.byteLength}B`);
    return { family: f.family, file };
  });
}
writeFileSync(new URL('src/generated/plate.json', root), JSON.stringify(manifest, null, 2) + '\n');
console.log('src/generated/plate.json');
