import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { validate, dateKey } from '../../../skills/ai-lineage/scripts/lib/schema.mjs';

const alpha = JSON.parse(
  readFileSync(new URL('../../fixtures/lineage/alpha.lineage.json', import.meta.url), 'utf8'),
);
const clone = (): any => structuredClone(alpha);

function errorsOf(edit: (d: any) => void): string[] {
  const d = clone();
  edit(d);
  return validate(d).errors;
}
function warningsOf(edit: (d: any) => void): string[] {
  const d = clone();
  edit(d);
  return validate(d).warnings;
}
const has = (list: string[], word: string): boolean => list.some((m) => m.includes(word));

describe('validate', () => {
  test('alpha is clean', () => {
    expect(validate(alpha)).toEqual({ errors: [], warnings: [] });
  });

  test('bad input returns errors instead of throwing', () => {
    for (const bad of [null, undefined, [], 'x', 3]) {
      expect(validate(bad).errors.length).toBeGreaterThan(0);
    }
    expect(errorsOf((d) => { d.nodes = 'no'; }).length).toBeGreaterThan(0);
    expect(errorsOf((d) => { d.edges = [null]; }).length).toBeGreaterThan(0);
    expect(errorsOf((d) => { d.nodes[0].sources = [7]; }).length).toBeGreaterThan(0);
  });

  const cases: [string, (d: any) => void, string][] = [
    ['schema not 1', (d) => { d.schema = 2; }, 'schema'],
    ['lang ja', (d) => { d.lang = 'ja'; }, 'lang'],
    ['researched not full date', (d) => { d.researched = '2026-11'; }, 'researched'],
    ['bad style', (d) => { d.style = 'neon'; }, 'style'],
    ['credit not boolean', (d) => { d.credit = 'yes'; }, 'credit'],
    ['ten nodes', (d) => {
      for (let i = 0; i < 5; i++) {
        const n = structuredClone(d.nodes[0]);
        n.id = `extra-${i}`;
        d.nodes.push(n);
      }
    }, 'at most 9 nodes'],
    ['duplicate id', (d) => { d.nodes[1].id = d.nodes[0].id; }, 'duplicate node id'],
    ['bad id', (d) => { d.nodes[0].id = 'Bad_ID'; }, 'node id'],
    ['bad row', (d) => { d.nodes[0].row = 'top'; }, 'row'],
    ['bad kind', (d) => { d.nodes[0].kind = 'blog'; }, 'kind'],
    ['bad edge type', (d) => { d.edges[0].type = 'cites'; }, 'type'],
    ['bad status', (d) => { d.edges[0].status = 'maybe'; }, 'status'],
    ['date month 13', (d) => { d.nodes[0].date = '2017-13'; }, 'date'],
    ['date 17', (d) => { d.nodes[0].date = '17'; }, 'date'],
    ['date empty', (d) => { d.nodes[0].date = ''; }, 'date'],
    ['no sources', (d) => { d.nodes[0].sources = []; }, 'no source'],
    ['url without scheme', (d) => { d.nodes[0].sources[0].url = 'example.com/x'; }, 'url'],
    ['opened missing', (d) => { delete d.nodes[0].sources[0].opened; }, 'opened'],
    ['unknown node in edge', (d) => { d.edges[0].to = 'nope'; }, 'unknown node'],
    ['self edge', (d) => { d.edges[0].to = d.edges[0].from; }, 'self'],
    ['duplicate edge', (d) => { d.edges.push(structuredClone(d.edges[0])); }, 'duplicate edge'],
    ['parallel edge with another type', (d) => {
      d.edges.push({ from: d.edges[0].from, to: d.edges[0].to, type: 'enables', status: 'inferred' });
    }, 'duplicate edge'],
    ['reverse edge between the same pair', (d) => {
      d.edges.push({ from: d.edges[0].to, to: d.edges[0].from, type: 'enables', status: 'inferred' });
    }, 'duplicate edge'],
    ['confirmed without evidence', (d) => { delete d.edges[0].evidence; }, 'evidence'],
    ['inferred with malformed evidence', (d) => {
      d.edges[1].evidence = { node: d.edges[1].from };
    }, 'evidence'],
    ['evidence node has no opened source', (d) => { d.nodes.find((n: any) => n.id === 'gamma-pool').sources[0].opened = false; }, 'inferred'],
    ['evidence node unrelated', (d) => { d.edges[0].evidence.node = 'beta-gate'; }, 'evidence'],
    ['focal unknown', (d) => { d.focal.node = 'nope'; }, 'focal'],
    ['timeline before 2022-11-30', (d) => {
      d.nodes[0].timeline = { id: 'x', url: 'https://example.com/t' };
    }, 'timeline'],
    ['timeline url without scheme', (d) => {
      d.nodes[4].timeline = { id: 'x', url: '/ai-timeline-log/#x' };
    }, 'timeline'],
  ];
  for (const [name, edit, word] of cases) {
    test(`error: ${name}`, () => {
      const errors = errorsOf(edit);
      expect(errors.length).toBeGreaterThan(0);
      expect(has(errors, word)).toBe(true);
    });
  }

  test('error messages name the place', () => {
    expect(has(errorsOf((d) => { d.nodes[0].kind = 'blog'; }), 'node "alpha-routing"')).toBe(true);
    expect(has(errorsOf((d) => { d.edges[0].status = 'maybe'; }), 'edge alpha-routing -> gamma-pool')).toBe(true);
  });

  test('empty edges array is allowed', () => {
    const d = clone();
    d.edges = [];
    d.focal = undefined;
    expect(validate(d).errors).toEqual([]);
  });

  test('timeline on or after 2022-11-30 is fine', () => {
    const d = clone();
    d.nodes[3].date = '2022-11-30';
    d.nodes[3].timeline = { id: 'x', url: 'https://example.com/t' };
    expect(validate(d).errors).toEqual([]);
  });

  test('warning: all sources unopened', () => {
    const w = warningsOf((d) => { d.nodes[0].sources.forEach((s: any) => { s.opened = false; }); });
    expect(has(w, 'not verified')).toBe(true);
  });
  test('warning: lineage target earlier than source', () => {
    const w = warningsOf((d) => { d.nodes[2].date = '2016'; });
    expect(has(w, 'earlier')).toBe(true);
  });
  test('warning: node without edges', () => {
    const w = warningsOf((d) => { d.edges = d.edges.filter((e: any) => e.from !== 'beta-gate'); });
    expect(has(w, 'no edges')).toBe(true);
  });
  test('warning: nine nodes and empty omitted', () => {
    const w = warningsOf((d) => {
      for (let i = 0; i < 4; i++) {
        const n = structuredClone(d.nodes[0]);
        n.id = `extra-${i}`;
        d.nodes.push(n);
        d.edges.push({ from: 'alpha-routing', to: n.id, type: 'enables', status: 'inferred' });
      }
      d.omitted = [];
    });
    expect(has(w, 'omitted')).toBe(true);
  });
});

describe('dateKey', () => {
  test('pads missing parts with -01', () => {
    expect(dateKey('2017')).toBe('2017-01-01');
    expect(dateKey('2017-03')).toBe('2017-03-01');
    expect(dateKey('2017-03-09')).toBe('2017-03-09');
  });
  test('orders by padded key', () => {
    const keys = ['2017-01-15', '2017', '2017-01'].map(dateKey).sort();
    expect(keys).toEqual(['2017-01-01', '2017-01-01', '2017-01-15']);
  });
});
