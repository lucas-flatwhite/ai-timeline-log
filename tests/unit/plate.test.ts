import { describe, test, expect } from 'vitest';
import { loadContent } from '../../src/lib/content.ts';
import { buildView } from '../../src/lib/view.ts';
import { plateText, makePlateFonts, covered } from '../../src/lib/plate.ts';

const v = buildView(loadContent(), 'ko', '2026-10-25');

describe('plate fonts', () => {
  test('plate text covers keywords, years and the day count', () => {
    const t = plateText(v);
    for (const ch of ['속', '도', '0', '9', ',', '일', 'G', '$']) expect(t).toContain(ch);
    // 쓰는 법의 번호와 핵심어도 판에 새긴다
    for (const ch of '12345보기열흐름포스터묻') expect(t).toContain(ch);
    expect(plateText(buildView(loadContent(), 'en', '2026-10-25'))).toMatch(/^(?=.*L)(?=.*K)(?=.*F)(?=.*W)/);
    // 줄바꿈은 빼고 공백은 담는다: 영어 일수 '1,434 days'의 공백을 대체 서체로 재면 그 서체가 오기 전후로 판 크기가 달라진다
    expect(t).not.toMatch(/[^\S ]/);
    expect(plateText(buildView(loadContent(), 'en', '2026-10-25'))).toContain(' ');
  });
  test('Korean plate fonts fit the 40KB budget', async () => {
    const fonts = await makePlateFonts(plateText(v));
    expect(fonts.map(f => f.family).sort()).toEqual(['PlateK', 'PlateL']);
    expect(fonts.reduce((a, f) => a + f.woff2.byteLength, 0)).toBeLessThanOrEqual(40 * 1024);
  }, 30_000);
  test('a Latin-only text skips the Korean source', async () => {
    const fonts = await makePlateFonts('PACE 2026 1,425 days');
    expect(fonts.map(f => f.family)).toEqual(['PlateL']);
    expect(await covered(fonts[0]!.woff2, [' '])).toEqual([' ']);   // 공백 글리프가 판 글꼴에 들어 있다
  }, 30_000);
});
