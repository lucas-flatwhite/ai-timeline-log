import { describe, test, expect, beforeAll } from 'vitest';
import { loadFonts, shapeText } from '../../../skills/ai-lineage/scripts/lib/fonts.mjs';

let f: any;
beforeAll(async () => {
  f = await loadFonts();
});

describe('shapeText', () => {
  test('measures Latin and Hangul', () => {
    const r = shapeText(f, 'bodyBold', 'Sparsely-Gated MoE 희소', 28, 0, 0);
    expect(r.width).toBeGreaterThan(340);
    expect(r.width).toBeLessThan(360);
    expect(r.missing).toEqual([]);
  });

  test('display falls back to Hahmlet', () => {
    const r = shapeText(f, 'display', 'Łukasz', 28, 0, 0);
    expect(r.missing).toEqual([]);
    expect(r.cmds.length).toBeGreaterThan(0);
  });

  test('mono falls back for Hangul', () => {
    expect(shapeText(f, 'mono', '구글 2017', 16, 0, 0).missing).toEqual([]);
  });

  test('reports glyphs no font has', () => {
    expect(shapeText(f, 'body', '日本', 20, 0, 0).missing).toEqual(['日 (U+65E5)', '本 (U+672C)']);
  });

  test('does not report whitespace or repeats', () => {
    expect(shapeText(f, 'body', '日 日\n日', 20, 0, 0).missing).toEqual(['日 (U+65E5)']);
  });

  test('deterministic and offset', () => {
    const a = shapeText(f, 'display', '혼합 MoE', 30, 0, 50);
    const b = shapeText(f, 'display', '혼합 MoE', 30, 0, 50);
    expect(a.cmds).toEqual(b.cmds);
    const c = shapeText(f, 'display', '혼합 MoE', 30, 10, 50);
    expect(c.cmds.length).toBe(a.cmds.length);
    a.cmds.forEach((cmd: any[], i: number) => {
      if (cmd[0] === 'M' || cmd[0] === 'L') expect(c.cmds[i][1]).toBeCloseTo(cmd[1] + 10, 6);
    });
  });

  test('cmds use only M L Q C Z', () => {
    const r = shapeText(f, 'display', '혼합 Łukasz MoE', 30, 0, 0);
    for (const c of r.cmds) expect(['M', 'L', 'Q', 'C', 'Z']).toContain(c[0]);
  });
});

test('glyph x positions advance with the pen', () => {
  const one = shapeText(f, 'body', 'I', 20, 0, 0);
  const two = shapeText(f, 'body', 'II', 20, 0, 0);
  const n = one.cmds.length;
  expect(two.cmds.length).toBe(n * 2);
  one.cmds.forEach((c: any[], k: number) => {
    const d: any[] = two.cmds[n + k];
    expect(d[0]).toBe(c[0]);
    if (c[0] !== 'Z') expect(d[1]).toBeCloseTo(c[1] + one.width, 6);
  });
});
