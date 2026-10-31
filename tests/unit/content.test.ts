import { describe, test, expect } from 'vitest';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadContent, loadGlossary } from '../../src/lib/content.ts';

const FIXTURE = 'tests/fixtures/content';
const SCENE = 'scenes/2023-03-14-gpt-4.yaml';

function copyFixture(): string {
  const dir = mkdtempSync(join(tmpdir(), 'content-'));
  cpSync(FIXTURE, dir, { recursive: true });
  return dir;
}
function edit(dir: string, rel: string, fn: (s: string) => string) {
  const p = join(dir, rel);
  writeFileSync(p, fn(readFileSync(p, 'utf8')));
}

describe('loadContent', () => {
  test('loads and normalizes the valid fixture', () => {
    const c = loadContent(FIXTURE);
    expect(c.site.asOf).toBe('2026-10-05');
    expect(c.site.name).toBe('AI Timeline Log');    // 이름은 언어와 상관없이 하나
    expect(c.scenes.map(s => s.id)).toEqual(['2023-03-gpt-4']);
    expect(c.scenes[0].order).toBe(0);
    expect(c.scenes[0].aliases).toEqual([]);
    expect(c.arcs[0].to).toBe('2023');              // YAML 숫자 2023 → 문자열
    expect(c.ledger[0].models.map(m => m.name)).toEqual(['ChatGPT', 'GPT-4']);  // 날짜순
    expect(c.years['2023'].ko.title).toBe('경쟁이 시작된 해');
  });

  test('loads every event glyph from the real content', () => {
    const c = loadContent();
    const items = c.scenes.flatMap(s => s.items);
    expect(items.length).toBeGreaterThan(0);
    expect(items.every(it => it.glyph)).toBe(true);
    expect(c.scenes[0].items[0].glyph).toEqual({ ko: '100만', en: '1M' });
  });

  test('picture boxes: at least 10 closed outlines, each used by an event', () => {
    const c = loadContent();
    const names = Object.keys(c.pics), used = new Set(c.scenes.flatMap(s => s.items).flatMap(it => it.pic ? [it.pic] : []));
    expect(names.length).toBeGreaterThanOrEqual(10);
    expect([...used].sort()).toEqual([...names].sort());   // 쓰이지 않는 그림이 없다
    for (const [name, p] of Object.entries(c.pics)) {
      // 조각마다 닫혀 있다(M 수 = Z 수), 기준점은 100×100 안
      expect(p.d.trim(), name).toMatch(/^M[\s\S]*Z$/);
      expect((p.d.match(/[Mm]/g) ?? []).length, name).toBe((p.d.match(/[Zz]/g) ?? []).length);
      for (const v of [p.cx, p.cy]) { expect(v, name).toBeGreaterThanOrEqual(0); expect(v, name).toBeLessThanOrEqual(100); }
    }
  });

  test('requires a glyph on every event', () => {
    const dir = copyFixture();
    edit(dir, SCENE, s => s.replace(', glyph: { ko: 하나, en: ONE } }', ' }'));
    expect(() => loadContent(dir)).toThrowError(/items\.0\.glyph/);
  });

  test('requires English on every scene, event, year, arc, lab and the site', () => {
    const dir = copyFixture();
    edit(dir, SCENE, s => s.replace(/^en: .*\n/m, ''));
    expect(() => loadContent(dir)).toThrow(/en: .*Required|expected object/);
    edit(dir, SCENE, s => s.replace(', en: Item one', ''));
    edit(dir, 'site.yaml', s => s.replace(/^en:[\s\S]*$/m, ''));
    edit(dir, 'years.yaml', s => s.replace(/^  en: .*\n/m, ''));
    edit(dir, 'arcs.yaml', s => s.replace(/^  en: .*\n/m, ''));
    edit(dir, 'ledger.yaml', s => s.replace(', en: OpenAI', ''));
    let msg = '';
    try { loadContent(dir); } catch (e) { msg = (e as Error).message; }
    for (const field of [`${SCENE}: en`, `${SCENE}: items.0.en`, 'site.yaml: en', 'years.yaml: 2023.en', 'arcs.yaml: 0.en', 'ledger.yaml: 0.lab.en']) {
      expect(msg).toContain(field);
    }
  });

  test('names the file and field of a missing value', () => {
    const dir = copyFixture();
    edit(dir, SCENE, s => s.replace('title: GPT-4, ', ''));
    expect(() => loadContent(dir)).toThrowError(`${SCENE}: ko.title`);
  });

  test('collects file-name and duplicate-id problems together', () => {
    const dir = copyFixture();
    cpSync(join(dir, SCENE), join(dir, 'scenes/2023-03-14-gpt-4-copy.yaml'));
    let msg = '';
    try { loadContent(dir); } catch (e) { msg = (e as Error).message; }
    expect(msg).toContain('Content errors:');
    expect(msg).toContain('scenes/2023-03-14-gpt-4-copy.yaml: file name must be 2023-03-14-gpt-4.yaml');
    expect(msg).toContain('duplicate id 2023-03-gpt-4');
  });

  test('rejects dates after asOf and added before firstEdition', () => {
    const dir = copyFixture();
    edit(dir, SCENE, s => s.replace('2023-03-31', '2027-01').replace('added: 2026-10-05', 'added: 2026-10-01'));
    expect(() => loadContent(dir)).toThrowError(/item date 2027-01 is after asOf 2026-10-05[\s\S]*added 2026-10-01 is before firstEdition/);
  });

  test('requires a year summary for years after the start year', () => {
    const dir = copyFixture();
    edit(dir, 'years.yaml', () => '{}\n');
    expect(() => loadContent(dir)).toThrowError(/years.yaml: missing summary for 2023/);
  });

  test('rejects impossible dates and bad item counts', () => {
    const dir = copyFixture();
    edit(dir, SCENE, s => s.replace('2023-03-15', '2023-02-30').replace(/  - \{ date: 2023-03-31.*\n/, ''));
    let msg = '';
    try { loadContent(dir); } catch (e) { msg = (e as Error).message; }
    expect(msg).toContain(`${SCENE}: items.0.date: Invalid day in "2023-02-30"`);
    expect(msg).toMatch(new RegExp(`${SCENE}: items: `));
  });

  test('rejects a span that ends before it starts', () => {
    const dir = copyFixture();
    edit(dir, SCENE, s => s.replace('span: { from: 2023-03-14 }', 'span: { from: 2023-07, to: 2023-05 }'));
    expect(() => loadContent(dir)).toThrowError(`${SCENE}: span.to: span ends (2023-05) before it starts (2023-07)`);
  });

  test('accepts a span ending in the month it starts', () => {
    const dir = copyFixture();
    edit(dir, SCENE, s => s.replace('span: { from: 2023-03-14 }', 'span: { from: 2023-03-14, to: 2023-03 }'));
    expect(loadContent(dir).scenes[0].span).toEqual({ from: '2023-03-14', to: '2023-03' });
  });

  test('requires span dates to name at least a month', () => {
    const dir = copyFixture();
    edit(dir, SCENE, s => s.replace('span: { from: 2023-03-14 }', 'span: { from: 2023, to: 2024 }'));
    let msg = '';
    try { loadContent(dir); } catch (e) { msg = (e as Error).message; }
    expect(msg).toContain(`${SCENE}: span.from: Expected YYYY-MM or YYYY-MM-DD`);
    expect(msg).toContain(`${SCENE}: span.to: Expected YYYY-MM or YYYY-MM-DD`);
  });

  test('reports a missing scenes folder alongside other errors', () => {
    const dir = copyFixture();
    rmSync(join(dir, 'scenes'), { recursive: true });
    edit(dir, 'site.yaml', s => s.replace(/^asOf: .*$/m, 'asOf: nope'));
    let msg = '';
    try { loadContent(dir); } catch (e) { msg = (e as Error).message; }
    expect(msg).toContain('Content errors:');
    expect(msg).toContain('scenes/: folder not found');
    expect(msg).toContain('site.yaml: asOf');
  });
});

describe('topics, editions and glossary', () => {
  test('loads topics, editions and scene topics', () => {
    const c = loadContent(FIXTURE);
    expect(c.topics.models.ko).toBe('모델 경쟁');
    expect(c.editions[0]).toMatchObject({ n: 1, date: '2026-10-05', poster: false });
    expect(c.scenes[0].topics).toEqual(['models']);
  });

  test('missing topics.yaml is an error', () => {
    const dir = copyFixture();
    rmSync(join(dir, 'topics.yaml'));
    expect(() => loadContent(dir)).toThrowError(/topics\.yaml/);
  });

  test('loadGlossary reads the glossary', () => {
    expect(loadGlossary()[0]).toMatchObject({ ko: 'OpenAI', en: 'OpenAI' });
  });
});
