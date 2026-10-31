import { describe, test, expect } from 'vitest';
import { loadContent } from '../../src/lib/content.ts';
import { A_RATIO, editionFor, pickColumns, posterFiles, posterScale, posterSiteUrl } from '../../src/lib/poster.ts';

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
    expect(posterSiteUrl('ko')).toBe('https://lucasflatwhite.com/ai-timeline-log/');
    expect(posterSiteUrl('en')).toBe('https://lucasflatwhite.com/ai-timeline-log/en/');
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
