import { describe, test, expect } from 'vitest';
import { loadContent } from '../../src/lib/content.ts';
import { buildView } from '../../src/lib/view.ts';
import { plateText, makePlateFonts } from '../../src/lib/plate.ts';

const v = buildView(loadContent(), 'ko', '2026-10-25');

describe('plate fonts', () => {
  test('plate text covers keywords, years and the day count', () => {
    const t = plateText(v);
    for (const ch of ['속', '도', '0', '9', ',', '일', 'G', '$']) expect(t).toContain(ch);
    expect(t).not.toMatch(/\s/);
  });
  test('Korean plate fonts fit the 40KB budget', async () => {
    const fonts = await makePlateFonts(plateText(v));
    expect(fonts.map(f => f.family).sort()).toEqual(['PlateK', 'PlateL']);
    expect(fonts.reduce((a, f) => a + f.woff2.byteLength, 0)).toBeLessThanOrEqual(40 * 1024);
  }, 30_000);
  test('a Latin-only text skips the Korean source', async () => {
    expect((await makePlateFonts('PACE 2026 1,425 days')).map(f => f.family)).toEqual(['PlateL']);
  }, 30_000);
});
