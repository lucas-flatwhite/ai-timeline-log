import { describe, test, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';

const root = new URL('../../../', import.meta.url);
const skill = new URL('skills/ai-lineage/', root);
const read = (u: URL): Buffer => readFileSync(u);

function frontmatter(path: URL): Record<string, any> {
  const m = readFileSync(path, 'utf8').match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error(`frontmatter 없음: ${path.pathname}`);
  return parse(m[1]);
}

describe('ai-lineage SKILL.md frontmatter', () => {
  const fm = frontmatter(new URL('SKILL.md', skill));
  test('name and description', () => {
    expect(fm.name).toBe('ai-lineage');
    expect(typeof fm.description).toBe('string');
    expect(fm.description.length).toBeGreaterThan(0);
    expect(fm.description.length).toBeLessThanOrEqual(1024);
  });
  test('is not hidden', () => { expect(fm.metadata?.internal).toBeUndefined(); });
});

describe('internal skills are hidden', () => {
  for (const name of ['scene-research', 'edition-release', 'draw-pic']) {
    test(name, () => {
      const fm = frontmatter(new URL(`.agents/skills/${name}/SKILL.md`, root));
      expect(fm.name).toBe(name);
      expect(fm.metadata?.internal).toBe(true);
    });
  }
});

describe('vendored files match node_modules', () => {
  const pairs: [string, string][] = [
    ...['index.mjs', 'harfbuzz.js', 'harfbuzz.wasm'].map(f => [`vendor/harfbuzzjs/${f}`, `node_modules/harfbuzzjs/dist/${f}`] as [string, string]),
    ...['index.mjs', 'index_bg.wasm'].map(f => [`vendor/resvg/${f}`, `node_modules/@resvg/resvg-wasm/${f}`] as [string, string]),
  ];
  for (const [vendored, original] of pairs) {
    test(vendored, () => {
      expect(read(new URL(vendored, skill)).equals(read(new URL(original, root)))).toBe(true);
    });
  }
});

describe('fonts and notices exist', () => {
  const files = [
    'fonts/BlackHanSans-Regular.ttf', 'fonts/Hahmlet-wght.ttf', 'fonts/IBMPlexMono-Regular.ttf',
    'fonts/OFL-BlackHanSans.txt', 'fonts/OFL-Hahmlet.txt', 'fonts/OFL-IBMPlexMono.txt',
    'THIRD_PARTY_NOTICES.md', 'LICENSE', 'vendor/harfbuzzjs/LICENSE', 'vendor/resvg/LICENSE-MPL-2.0.txt',
  ];
  for (const f of files) test(f, () => { expect(existsSync(new URL(f, skill))).toBe(true); });
});
