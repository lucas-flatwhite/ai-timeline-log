import { describe, test, expect, vi, afterEach } from 'vitest';
import { drawPic } from '../../src/engine/pic.ts';

/* node에는 Path2D가 없다. 받은 path 문자열만 기억하는 가짜로 바꾼다 */
vi.stubGlobal('Path2D', class { constructor(public d: string) {} });
afterEach(() => { calls.length = 0; });

const calls: [string, ...unknown[]][] = [];
const rec = (name: string) => (...a: unknown[]) => { calls.push([name, ...a]); };
const g = {
  save: rec('save'), translate: rec('translate'), rotate: rec('rotate'),
  scale: rec('scale'), fill: rec('fill'), restore: rec('restore'),
} as unknown as CanvasRenderingContext2D;
const pic = { d: 'M20 20 H80 V80 H20 Z', cx: 58, cy: 42, note: '시험' };

describe('drawPic', () => {
  test('fills the path once and ends with restore', () => {
    drawPic(g, pic, { x: 10, y: 20, w: 200, h: 120 });
    expect(calls.filter(c => c[0] === 'fill')).toHaveLength(1);
    expect((calls.find(c => c[0] === 'fill')![1] as { d: string }).d).toBe(pic.d);
    expect(calls[0][0]).toBe('save');
    expect(calls.at(-1)![0]).toBe('restore');
  });

  test('centres on (cx, cy), tilts, and fits the square inside R', () => {
    drawPic(g, pic, { x: 10, y: 20, w: 200, h: 120 }, -0.2, 1.5);
    expect(calls.map(c => c[0])).toEqual(['save', 'translate', 'rotate', 'scale', 'translate', 'fill', 'restore']);
    expect(calls[1].slice(1)).toEqual([110, 80]);        // R의 가운데
    expect(calls[2][1]).toBe(-0.2);
    expect(calls[3].slice(1)).toEqual([1.2 * 1.5, 1.2 * 1.5]);   // 짧은 변 120 / 100
    expect(calls[4].slice(1)).toEqual([-58, -42]);
  });

  test('defaults: tilt -0.12, scale 1.1', () => {
    drawPic(g, pic, { x: 0, y: 0, w: 100, h: 100 });
    expect(calls[2][1]).toBe(-0.12);
    expect(calls[3][1]).toBeCloseTo(1.1);
  });
});
