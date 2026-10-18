import { describe, test, expect } from 'vitest';
import { readOriginal, SLUGS } from '../../scripts/lib/original.ts';
import { loadContent } from '../../src/lib/content.ts';
import { formatSpan, formatYYMM, formatDate, parseLegacyItemDate } from '../../src/lib/dates.ts';

const O = readOriginal();
const C = loadContent();

describe('migrated content matches the original artifact', () => {
  test('counts', () => {
    expect(O.CH).toHaveLength(28);
    expect(C.scenes).toHaveLength(28);
    expect(C.scenes.reduce((n, s) => n + s.items.length, 0)).toBe(109);
    expect(O.arcs).toHaveLength(3);
    expect(O.sources).toHaveLength(21);
  });

  test('scenes, in order, field by field', () => {
    C.scenes.forEach((s, i) => {
      const o = O.CH[i];
      expect(s.id).toBe(`${o.d.slice(0, 7)}-${SLUGS[i]}`);
      expect(s.date).toBe(o.d);
      expect(formatSpan('ko', s.span)).toBe(o.when);
      expect(s.ko.kicker).toBe(o.k);
      expect(s.ko.title).toBe(o.t);
      expect(s.ko.lede).toBe(o.l);
      expect(s.print.glyph).toBe(o.g);
      expect(s.print.pattern).toBe(o.p);
      expect(s.print.angle).toBe(o.a);
      expect(s.print.motif).toBe(o.m || 'none');
      expect(s.items.map(x => x.ko)).toEqual(o.i.map(x => x[1]));
      expect(s.items.map(x => x.date)).toEqual(o.i.map(x => parseLegacyItemDate(x[0], +o.d.slice(0, 4))));
      expect(s.added).toBe('2026-10-05');
    });
  });

  test('glyphs that look like numbers or contain newlines stay strings', () => {
    const g = Object.fromEntries(C.scenes.map(s => [s.id, s.print.glyph]));
    expect(g['2026-01-ai-basic-act']).toBe('1.22');
    expect(g['2026-02-pentagon']).toBe('2.27');
    expect(g['2025-11-gemini-3']).toBe('CODE\nRED');
  });

  test('years, arcs, ledger, sources', () => {
    for (const [y, v] of Object.entries(O.YR)) {
      expect(C.years[y].ko).toEqual({ title: v.t, body: v.p });
    }
    expect(C.arcs.map(a => ({
      span: formatDate('ko', a.from) + (a.to ? ' – ' + formatDate('ko', a.to) : ''),
      title: a.ko.title, body: a.ko.body,
    }))).toEqual(O.arcs);
    expect(C.ledger.map(l => [l.lab.ko, l.models.map(m => [m.name, formatYYMM(m.date)])])).toEqual(O.LEDGER);
    expect(C.sources).toEqual(O.sources);
  });
});
