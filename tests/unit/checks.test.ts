import { describe, test, expect } from 'vitest';
import { loadContent } from '../../src/lib/content.ts';
import type { GlyphSpec } from '../../src/lib/schema.ts';
import { checkContent, hasHangul } from '../../src/lib/checks.ts';

function broken(fn: (c: ReturnType<typeof loadContent>) => void) {
  const c = structuredClone(loadContent());
  fn(c);
  return checkContent(c);
}
const errsOf = (fn: Parameters<typeof broken>[0]) => broken(fn).errors;

describe('checkContent', () => {
  test('real content passes', () => { expect(checkContent(loadContent()).errors).toEqual([]); });
  test('hasHangul', () => {
    expect(hasHangul('출발')).toBe(true);
    expect(hasHangul('Go')).toBe(false);
  });
  test('Hangul in an English keyword', () => {
    const errs = errsOf(c => { c.scenes[0].en = { ...c.scenes[0].ko, glyph: '출발' }; });
    expect(errs).toContainEqual(expect.stringMatching(/en glyph .*Hangul/));
  });
  test('Hangul in an English item keyword', () => {
    const errs = errsOf(c => { c.scenes[0].items[0].glyph = { ko: '속도', en: '속도' }; });
    expect(errs).toContainEqual(expect.stringMatching(/items\.0 en glyph/));
  });
  test('unknown picture', () => {
    const errs = errsOf(c => { c.scenes[0].items[0].pic = 'nope'; });
    expect(errs).toContainEqual(expect.stringMatching(/pic "nope"/));
  });
  test('forbidden word', () => {
    const errs = errsOf(c => { c.scenes[0].ko.lede += ' 놀라운'; });
    expect(errs).toContainEqual(expect.stringMatching(/forbidden "놀라운"/));
  });
  test('forbidden English word, whole word and any case', () => {
    const errs = errsOf(c => { c.scenes[0].en = { ...c.scenes[0].ko, lede: 'A Revolutionary step.' }; });
    expect(errs).toContainEqual(expect.stringMatching(/forbidden "revolutionary"/));
    expect(errsOf(c => { c.scenes[0].en = { ...c.scenes[0].ko, lede: 'Stunningly plain.' }; }).join()).not.toMatch(/forbidden/);
  });
  test('exclamation mark and emoji', () => {
    const errs = errsOf(c => {
      c.scenes[0].items[1].ko += '!';
      const y = Object.keys(c.years)[0];
      c.years[y].ko.body += ' 🚀';
    });
    expect(errs).toContainEqual(expect.stringMatching(/exclamation mark/));
    expect(errs).toContainEqual(expect.stringMatching(/emoji/));
  });
  test('relative time word in scene text', () => {
    const errs = errsOf(c => { c.scenes[0].ko.lede += ' 최근'; });
    expect(errs).toContainEqual(expect.stringMatching(/relative time "최근"/));
  });
  test('relative time word in English year text', () => {
    const errs = errsOf(c => {
      const y = Object.keys(c.years)[0];
      c.years[y].en = { title: 'A year', body: 'It happened Recently.' };
    });
    expect(errs).toContainEqual(expect.stringMatching(/relative time "recently"/));
  });
  test('site lede may say 현재까지', () => {
    expect(loadContent().site.ko.lede).toMatch(/현재/);
    expect(checkContent(loadContent()).errors.join()).not.toMatch(/site/);
  });
  test('scene added after firstEdition needs a source', () => {
    const errs = errsOf(c => {
      c.scenes[0].added = c.site.asOf;
      c.scenes[0].sources = [];
      for (const it of c.scenes[0].items) it.sources = [];
    });
    expect(errs).toContainEqual(expect.stringMatching(/needs a source/));
  });
  test('an item source satisfies the source rule', () => {
    const errs = errsOf(c => {
      c.scenes[0].added = c.site.asOf;
      c.scenes[0].sources = [];
      c.scenes[0].items[0].sources = [{ url: 'https://example.com/a', title: 'A' }];
    });
    expect(errs.join()).not.toMatch(/needs a source/);
  });
  test('long small-box keyword is a warning, not an error', () => {
    let id = '';
    const r = broken(c => { id = c.scenes[0].id; c.scenes[0].items[0].glyph = '행정명령'; });
    expect(r.errors).toEqual([]);
    expect(r.warnings).toContainEqual(expect.stringContaining(`scene ${id}: items.0: glyph "행정명령"`));
  });
  test('each line of a keyword is judged on its own', () => {
    const own = (glyph: GlyphSpec) => {
      let id = '';
      const r = broken(c => { id = c.scenes[0].id; c.scenes[0].items[0].glyph = glyph; });
      return r.warnings.filter(w => w.startsWith(`scene ${id}: items.0:`));
    };
    expect(own('행정\n명령')).toEqual([]);
    expect(own({ ko: '속도', en: 'Blenheim' })).toContainEqual(expect.stringMatching(/Blenheim/));
  });
});
