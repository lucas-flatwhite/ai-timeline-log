import { describe, test, expect } from 'vitest';
import { engrave, BK, type PathLike } from '../../src/engine/engrave.ts';
import { mulberry, clamp, ease } from '../../src/engine/random.ts';

function recorder() {
  const made: { m: number; l: number; c: number }[] = [];
  const make = (): PathLike => {
    const ops = { m: 0, l: 0, c: 0 };
    made.push(ops);
    return { moveTo() { ops.m++; }, lineTo() { ops.l++; }, closePath() { ops.c++; } };
  };
  return { made, make, strokes: () => made.reduce((n, o) => n + o.c, 0) };
}
const base = { w: 200, h: 120, s: 5, mode: 'lines' as const, ang: 0, maxR: 0.9, seed: 3, sweep: 1 };

describe('engrave', () => {
  test('returns BK buckets', () => {
    const r = recorder();
    expect(engrave({ ...base, src: () => 1 }, r.make)).toHaveLength(BK);
  });
  test('white sketch carves nothing, dark sketch carves strokes', () => {
    const white = recorder(); engrave({ ...base, src: () => 0 }, white.make);
    const dark = recorder(); engrave({ ...base, src: () => 1 }, dark.make);
    expect(white.strokes()).toBe(0);
    expect(dark.strokes()).toBeGreaterThan(50);
  });
  test('same seed → same cut, different seed → different cut', () => {
    const a = recorder(); engrave({ ...base, src: (x) => (x > 100 ? 0.7 : 0.3) }, a.make);
    const b = recorder(); engrave({ ...base, src: (x) => (x > 100 ? 0.7 : 0.3) }, b.make);
    const c = recorder(); engrave({ ...base, seed: 4, src: (x) => (x > 100 ? 0.7 : 0.3) }, c.make);
    expect(a.made).toEqual(b.made);
    expect(a.made).not.toEqual(c.made);
  });
  test('rings and waves modes carve', () => {
    const r = recorder(); engrave({ ...base, mode: 'rings', cx: 100, cy: 60, src: () => 1 }, r.make);
    const w = recorder(); engrave({ ...base, wave: { f: 0.02, g: 0.005, ph: 1 }, src: () => 1 }, w.make);
    expect(r.strokes()).toBeGreaterThan(20);
    expect(w.strokes()).toBeGreaterThan(20);
  });
});

describe('random', () => {
  test('mulberry is deterministic', () => {
    const a = mulberry(7), b = mulberry(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  test('clamp and ease', () => {
    expect(clamp(-1)).toBe(0); expect(clamp(2)).toBe(1);
    expect(ease(0)).toBe(0); expect(ease(1)).toBe(1); expect(ease(0.5)).toBe(0.5);
  });
});
