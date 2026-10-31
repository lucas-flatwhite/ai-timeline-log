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
  test('Hangul string keyword on an item that has English text', () => {
    const errs = errsOf(c => { c.scenes[0].items[0].en = 'An event.'; c.scenes[0].items[0].glyph = '속도'; });
    expect(errs).toContainEqual(expect.stringMatching(/items\.0 en glyph .*Hangul/));
  });
  test('scene en without glyph falls back to a Hangul print.glyph', () => {
    const errs = errsOf(c => {
      const { glyph: _g, ...rest } = c.scenes[0].ko;
      c.scenes[0].en = rest;
      c.scenes[0].print.glyph = '출발';
    });
    expect(errs).toContainEqual(expect.stringMatching(/en glyph "출발".*Hangul/));
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
  test('a scene with no source anywhere is a warning, not an error', () => {
    let id = '';
    const r = broken(c => {
      id = c.scenes[0].id;
      c.scenes[0].sources = [];
      for (const it of c.scenes[0].items) it.sources = [];
    });
    expect(r.warnings).toContainEqual(expect.stringMatching(new RegExp(`scene ${id}: .*no source`)));
    expect(r.errors.join()).not.toMatch(/no source/);
  });
  test('a source on one item silences the no-source warning', () => {
    let id = '';
    const r = broken(c => {
      id = c.scenes[0].id;
      c.scenes[0].sources = [];
      for (const it of c.scenes[0].items) it.sources = [];
      c.scenes[0].items[0].sources = [{ url: 'https://example.com/a', title: 'A' }];
    });
    expect(r.warnings.join()).not.toContain(`scene ${id}: has no source`);
  });
  test('long small-box keyword is a warning, not an error', () => {
    let id = '';
    const r = broken(c => { id = c.scenes[0].id; c.scenes[0].items[0].glyph = { ko: '행정명령', en: 'ORDER' }; });   // 영어 글이 있는 사건이라 en도 둔다
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

describe('topics and editions', () => {
  const firstId = loadContent().scenes[0].id;
  const withTopics = (c: ReturnType<typeof loadContent>) => {
    c.topics = { a: { ko: '가', en: 'A' } };
    c.scenes.forEach(s => { s.topics = ['a']; });
  };
  test('unknown topic id', () => {
    const errs = errsOf(c => { withTopics(c); c.scenes[0].topics = ['nope']; });
    expect(errs).toContainEqual(`scene ${firstId}: topic "nope" is not in topics.yaml`);
  });
  test('scene without a topic warns', () => {
    const r = broken(c => { withTopics(c); c.scenes[0].topics = []; });
    expect(r.warnings).toContainEqual(`scene ${firstId}: has no topic`);
  });
  test('no topic warning while topics.yaml is empty', () => {
    const r = broken(c => { c.topics = {}; c.scenes.forEach(s => { s.topics = []; }); });
    expect(r.warnings.join()).not.toMatch(/has no topic/);
  });
  test('topic with fewer than three scenes warns', () => {
    const r = broken(c => { withTopics(c); c.topics.b = { ko: '나', en: 'B' }; c.scenes[0].topics = ['a', 'b']; });
    expect(r.warnings).toContainEqual('topics.yaml: b has only 1 scene(s)');
  });
  const ed = (n: number, date: string, poster = false) => ({ n, date, poster, ko: '판.', en: 'Edition.' });
  test('editions numbered 1..N', () => {
    const errs = errsOf(c => { c.editions = [ed(1, '2026-10-05'), ed(3, '2026-10-18')]; });
    expect(errs).toContainEqual('editions.yaml: editions must be numbered 1..2 in order');
  });
  test('edition dates ascend', () => {
    const errs = errsOf(c => { c.editions = [ed(1, '2026-10-05'), ed(2, '2026-10-05')]; });
    expect(errs).toContainEqual('editions.yaml: edition 2 date 2026-10-05 is not after edition 1');
  });
  test('edition after asOf', () => {
    const errs = errsOf(c => { c.editions = [ed(1, '2026-10-05'), ed(2, '2099-01-01')]; });
    expect(errs).toContainEqual(expect.stringMatching(/^editions\.yaml: edition 2 date 2099-01-01 is after asOf /));
  });
  test('first edition is dated firstEdition', () => {
    const errs = errsOf(c => { c.editions = [ed(1, '2026-10-04')]; });
    expect(errs).toContainEqual('editions.yaml: edition 1 must be dated firstEdition 2026-10-05');
  });
  test('no edition without a poster after one had a poster', () => {
    const errs = errsOf(c => { c.editions = [ed(1, '2026-10-05', true), ed(2, '2026-10-18')]; });
    expect(errs).toContainEqual('editions.yaml: edition 2 has no poster after edition 1 had one');
  });
  test('edition and topic text follow the style rules', () => {
    const errs = errsOf(c => {
      c.editions = [{ ...ed(1, '2026-10-05'), ko: '오늘 찍은 판.' }];
      c.topics = { a: { ko: '놀라운 것', en: 'A' } };
    });
    expect(errs).toContainEqual(expect.stringMatching(/editions\.yaml 1\.ko: relative time "오늘"/));
    expect(errs).toContainEqual(expect.stringMatching(/topics\.yaml a\.ko: forbidden "놀라운"/));
  });
});
