import { describe, expect, it } from 'vitest';
import { ko } from '../../src/i18n/ko.ts';
import { en } from '../../src/i18n/en.ts';
import { ui } from '../../src/i18n/index.ts';

describe('화면 문구', () => {
  it('ko와 en의 키 집합이 같다', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(ko).sort());
  });
  it('en.sceneOf는 따옴표로 장면 제목을 감싼다', () => {
    expect(en.sceneOf('X')).toBe('Part of “X”');
  });
  it('새 문구가 ko와 en에 모두 있다', () => {
    expect(ko.report).toBe('제보');
    expect(en.report).toBe('Report');
    expect(ko.fixTitle('2024-05-13', '사건')).toBe('[정정] 2024-05-13 사건');
    expect(en.fixTitle('2024-05-13', 'Event')).toBe('[Correction] 2024-05-13 Event');
    expect(ko.sceneOf('X')).toBe('‘X’ 장면의 사건');
    expect(ko.added('2025-01-02')).toBe('추가 2025-01-02');
    expect(en.added('2025-01-02')).toBe('Added 2025-01-02');
  });
  it('스크롤판 전용 문구는 ko에 없다', () => {
    for (const k of ['plateNo', 'railNav', 'cue']) expect(ko).not.toHaveProperty(k);
  });
  it('en의 맺음 문구', () => {
    expect(en.now).toBe('present');
    expect(en.outroTitle('9')).toBe('What changed in 9 days');
    expect(en.ledgerTitle).toBe('Major model releases');
    expect(en.endCount(33, '2022.11.30', 'present')).toBe('33 prints · 2022.11.30 – present');
  });
  it('ui에 ko와 en이 등록된다', () => {
    expect(ui.ko).toBe(ko);
    expect(ui.en).toBe(en);
  });
});

describe('언어 주소', () => {
  it('영어가 기본이고 base 바로 아래, 한국어는 ko/ 아래에 있다', async () => {
    const { DEFAULT_LOCALE, localePath, LOCALE_KEY } = await import('../../src/i18n/index.ts');
    expect(DEFAULT_LOCALE).toBe('en');
    expect(localePath('en')).toBe('');
    expect(localePath('ko')).toBe('ko/');
    expect(LOCALE_KEY).toBe('lucas-flatwhite:locale');
  });
  it('예전 en/ 주소는 base로 영구 이동한다. 경로가 빈 en/은 :path*가 잡지 못해 맨 앞에 따로 둔다', async () => {
    const { readFileSync } = await import('node:fs');
    const v = JSON.parse(readFileSync('vercel.json', 'utf8')) as { redirects: { source: string; destination: string; permanent: boolean }[] };
    expect(v.redirects).toEqual([
      { source: '/ai-timeline-log/en/', destination: '/ai-timeline-log/', permanent: true },
      { source: '/ai-timeline-log/en', destination: '/ai-timeline-log/', permanent: true },
      { source: '/ai-timeline-log/en/:path*', destination: '/ai-timeline-log/:path*', permanent: true },
    ]);
  });
});
