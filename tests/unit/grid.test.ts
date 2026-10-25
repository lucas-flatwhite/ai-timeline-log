import { describe, test, expect } from 'vitest';
import { glyphFor, ymd, itemAddresses, hashSeed, sortWall, type WallEntry } from '../../src/lib/grid.ts';

describe('grid helpers', () => {
  test('glyphFor picks the locale or the shared string', () => {
    expect(glyphFor('GPT-6', 'en')).toBe('GPT-6');
    expect(glyphFor({ ko: '속도', en: 'PACE' }, 'en')).toBe('PACE');
  });
  test('ymd keeps month-only dates short', () => {
    expect(ymd('2025-01-20')).toBe('20250120');
    expect(ymd('2023-01')).toBe('202301');
  });
  test('itemAddresses suffixes same-date items', () => {
    expect(itemAddresses('2026-09-pace', ['2026-09-12', '2026-09-22', '2026-09-22', '2023-01']))
      .toEqual(['2026-09-pace~20260912', '2026-09-pace~20260922', '2026-09-pace~20260922-2', '2026-09-pace~202301']);
  });
  test('hashSeed is stable and small', () => {
    expect(hashSeed('2025-01-deepseek')).toBe(hashSeed('2025-01-deepseek'));
    expect(hashSeed('a')).not.toBe(hashSeed('b'));
    for (const s of ['x', '2025-01-deepseek', '2026-09-pace~20260922-2']) {
      expect(hashSeed(s)).toBeGreaterThanOrEqual(1);
      expect(hashSeed(s)).toBeLessThanOrEqual(99991);
    }
  });
  test('sortWall: newest first, year leads its year, scene before same-date item, month-only at month end', () => {
    const e = (kind: WallEntry['kind'], date: string, seq: number, order = 0): WallEntry => ({ kind, date, seq, order });
    const out = sortWall([
      e('item', '2023-01', 0), e('item', '2023-01-23', 1), e('scene', '2023-01-23', 2), e('year', '2023', 3),
      e('item', '2022-12-05', 4), e('year', '2022', 5), e('scene', '2023-03-14', 6),
    ]).map(x => x.seq);
    expect(out).toEqual([3, 6, 2, 1, 0, 5, 4]);
  });
  test('sortWall breaks ties by order then seq and leaves the input untouched', () => {
    const e = (seq: number, order: number): WallEntry => ({ kind: 'scene', date: '2024-05-13', seq, order });
    const input = [e(0, 1), e(1, 0), e(2, 0)];
    expect(sortWall(input).map(x => x.seq)).toEqual([1, 2, 0]);
    expect(input.map(x => x.seq)).toEqual([0, 1, 2]);
  });
});
