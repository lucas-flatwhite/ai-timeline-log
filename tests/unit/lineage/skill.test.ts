import { describe, test, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
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
    'vendor/harfbuzzjs/LICENSE-HarfBuzz.txt', 'vendor/resvg/LICENSE-tiny-skia.txt',
    'vendor/resvg/LICENSE-Apache-2.0.txt', 'vendor/resvg/LICENSE-MIT-BSD-Zlib.txt',
    'vendor/harfbuzzjs/package.json',
  ];
  for (const f of files) test(f, () => { expect(existsSync(new URL(f, skill))).toBe(true); });
});

describe('skill docs', () => {
  const docs = ['SKILL.md', ...readdirSync(new URL('references/', skill)).filter(f => f.endsWith('.md')).map(f => `references/${f}`)];
  const text = (f: string): string => readFileSync(new URL(f, skill), 'utf8');
  const skillMd = text('SKILL.md');

  test('skill docs are English, except the Korean names of the looks', () => {
    const koreanNames = ['먹판', '가까운 변화', '교정지'];
    for (const name of koreanNames) expect(text('references/styles.md')).toContain(`| ${name} |`);
    for (const f of docs) {
      const rest = f === 'references/styles.md' ? koreanNames.reduce((t, name) => t.replaceAll(`| ${name} |`, ''), text(f)) : text(f);
      expect(rest, f).not.toMatch(/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/);
    }
  });
  test('skill docs name the real commands', () => {
    for (const s of ['scripts/lineage.mjs check', 'scripts/lineage.mjs draw', '--style', '--credit', '--portrait', 'woodcut', 'soft', 'proof']) {
      expect(skillMd, s).toContain(s);
    }
  });
  test('asks for language, look and scope first and leaves the credit line off', () => {
    for (const f of ['SKILL.md', 'references/styles.md']) expect(text(f), f).not.toContain('Do not ask every time');
    expect(skillMd).toContain('ask which look');
    expect(skillMd).toContain('use the Korean names listed there');
    expect(skillMd).toContain('ask whether the chart should be in Korean or English');
    expect(skillMd).toContain('say how you would scope this lineage');
    expect(skillMd).toContain('Put the chosen language in `"lang"` and the chosen look in `"style"`');
    expect(skillMd).not.toContain('--no-credit');
    expect(skillMd).toContain('off by default');
  });
  test('no install step', () => { expect(skillMd).not.toContain('npm install'); });
  test('references linked', () => {
    for (const f of ['research', 'data-format', 'styles']) {
      expect(existsSync(new URL(`references/${f}.md`, skill))).toBe(true);
      expect(skillMd).toContain(`references/${f}.md`);
    }
  });
});
