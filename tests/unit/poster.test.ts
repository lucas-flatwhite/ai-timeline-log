import { describe, test, expect } from 'vitest';
import { loadContent } from '../../src/lib/content.ts';
import { readdirSync } from 'node:fs';
import { A_RATIO, editionFor, formatMB, pickColumns, posterFiles, posterScale, posterSiteUrl, previewFile, previewSize, PREVIEW_DIR } from '../../src/lib/poster.ts';
import { latestPosterEdition } from '../../src/lib/export.ts';

describe('poster layout', () => {
  test('pickColumns takes the ratio closest to A paper', () => {
    expect(pickColumns([{ n: 16, w: 1164, h: 1800 }, { n: 17, w: 1232, h: 1742 }, { n: 18, w: 1300, h: 1650 }])).toBe(17);
    expect(A_RATIO).toBeCloseTo(1.4142, 4);
  });
  test('pickColumns prefers fewer columns on a tie', () => {
    expect(pickColumns([{ n: 12, w: 100, h: 150 }, { n: 13, w: 100, h: 150 }], 1.5)).toBe(12);
  });
  test('posterScale reaches A2 at 300 dpi', () => {
    expect(posterScale(1232)).toBeCloseTo(4961 / 1232, 4);
    expect(posterScale(1000, 420, 200)).toBeCloseTo(3308 / 1000, 4);
  });
  test('posterSiteUrl points each poster at its own language page', () => {
    expect(posterSiteUrl('ko')).toBe('https://lucasflatwhite.com/ai-timeline-log/ko/');
    expect(posterSiteUrl('en')).toBe('https://lucasflatwhite.com/ai-timeline-log/');
  });
  test('posterFiles', () => {
    expect(posterFiles('en')).toEqual({ pdf: 'poster-en.pdf', png: 'poster-en.png', web: 'poster-en-web.png' });
  });
});

describe('editionFor', () => {
  const eds = loadContent().editions;
  test('an edition with a poster', () => { expect(editionFor(eds, 4).date).toBe('2026-10-31'); });
  test('an edition without a poster or an unknown one', () => {
    expect(() => editionFor(eds, 3)).toThrow('edition 3 has no poster');
    expect(() => editionFor(eds, 9)).toThrow('edition 9 has no poster');
  });
});

describe('take section preview', () => {
  test('previewFile and previewSize', () => {
    expect(previewFile(5, 'ko')).toBe('poster/edition-5-ko.avif');
    expect(previewSize([4961, 6961])).toEqual({ w: 600, h: 842 });
  });
  test('formatMB: MiB, one decimal under 10, Korean without a space', () => {
    expect(formatMB(23076115, 'ko')).toBe('22MB');
    expect(formatMB(19977260, 'en')).toBe('19 MB');
    expect(formatMB(7091762, 'ko')).toBe('6.8MB');
    expect(formatMB(10443817, 'en')).toBe('10 MB');   // 9.96MB는 10.0이 아니라 10으로
  });
  // 사이트에는 마지막 포스터 판의 미리보기만 언어별로 하나. 판을 찍을 때마다 바뀌고 쌓이지 않는다
  // 새 판을 적고 Release를 기다리는 동안(files 없음)은 빌드 경고만 내고 이 검사는 건너뛴다
  const last = latestPosterEdition(loadContent())!;
  test.runIf(!!last.files)('public/poster holds exactly the last poster edition previews', () => {
    const want = (['en', 'ko'] as const).map(l => previewFile(last.n, l).slice(PREVIEW_DIR.length + 1));
    expect(readdirSync(`public/${PREVIEW_DIR}`).sort()).toEqual(want);
  });
});
