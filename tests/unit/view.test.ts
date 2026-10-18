import { describe, test, expect } from 'vitest';
import { loadContent } from '../../src/lib/content.ts';
import { buildView, fill } from '../../src/lib/view.ts';

const v = buildView(loadContent(), 'ko', '2026-10-18');   // 일수는 기준일(asOf)이 아니라 오늘로 센다
const scene = (id: string) => v.scenes.find(s => s.id === id)!;

describe('fill', () => {
  test('replaces known keys and rejects unknown ones', () => {
    expect(fill('{a}·{b}', { a: '1', b: '2' })).toBe('1·2');
    expect(() => fill('{nope}', {})).toThrow(/nope/);
  });
});

describe('buildView(ko)', () => {
  test('head and hero', () => {
    expect(v.title).toBe('AI Timeline Log');
    expect(v.description).toBe('ChatGPT 공개(2022.11.30)부터 현재까지 생성형 AI의 주요 장면 33개를 흑백 목판화 스타일로 찍어 스크롤로 넘겨 보는 연표.');
    expect(v.ogTitle).toBe('AI Timeline Log');
    expect(v.ogDescription).toBe('ChatGPT 공개부터 현재까지, 생성형 AI의 장면 33개를 목판화로 찍은 스크롤 연표.');
    expect(v.barTitle).toBe('AI Timeline Log');
    expect(v.barStart).toBe('2022.11.30');
    expect(v.heroName).toBe('AI Timeline Log');
    expect(v.heroRange).toBe('2022.11.30 → 현재');
    expect(v.heroSr).toBe('AI Timeline Log ');
    expect(v.heroLines).toEqual(['1,418', '일']);
    expect(v.heroWide).toBe('1,418일');
    expect(v.heroTall).toBe('1,418\n일');
    expect(v.live).toEqual({ start: '2022-11-30', wide: '{days}일', tall: '{days}\n일', outroTitle: '{days}일 동안 바뀐 것' });
    expect(v.lede).toBe('ChatGPT가 공개된 2022년 11월 30일부터 현재까지, AI가 지나온 장면들을 기록합니다.');
    expect(v.cue).toBe('아래로');
  });

  test('language switch lists every locale; one without a page is not a link yet', () => {
    expect(v.langNav).toBe('언어');
    expect(v.langs).toEqual([
      { code: 'ko', label: 'KO', name: '한국어', path: '', current: true },
      { code: 'en', label: 'EN', name: 'English', path: null, current: false, soon: 'English 준비 중' },
    ]);
  });

  test('blocks: year plates sit before their first scene, none for 2022', () => {
    const order = v.blocks.map(b => (b.kind === 'year' ? `Y${b.year.year}` : b.scene.index));
    expect(order.slice(0, 3)).toEqual([0, 'Y2023', 1]);
    expect(order.filter(x => typeof x === 'string')).toEqual(['Y2023', 'Y2024', 'Y2025', 'Y2026']);
    const y2023 = v.blocks.find(b => b.kind === 'year' && b.year.year === '2023') as { kind: 'year'; year: { countLine: string; bar: string } };
    expect(y2023.year.countLine).toBe('장면 5개 · 제2판–제6판');
    expect(y2023.year.bar).toBe('2023년  ·  장면 5개');
  });

  test('scenes', () => {
    const d = scene('2025-01-deepseek');
    expect(d.no).toBe('제13판');
    expect(d.when).toBe('2025.01');
    expect(d.bar).toBe('2025.01  ·  제13판 / 33');
    expect(d.aria).toBe('제13판 2025.01 딥시크 쇼크');
    expect(d.seed).toBe(12);
    expect(d.items[0]).toEqual({ date: '2025-01-20', label: '01.20', text: '딥시크, 추론 모델 R1을 MIT 라이선스로 공개.' });
    expect(scene('2022-11-chatgpt').items.map(i => i.label)).toEqual(['12.05', '12.21', '2023.01', '2023.01.23']);
    expect(scene('2025-11-gemini-3').glyph).toBe('CODE\nRED');
    expect(scene('2024-11-computer-use-mcp').angle).toBe(-20);
    expect(scene('2022-11-chatgpt').angle).toBeUndefined();
  });

  test('rail', () => {
    expect(v.rail.nav).toBe('연표 바로가기');
    expect(v.rail.labels.map(l => l.text)).toEqual(['22.11', '2023', '2024', '2025', '2026', '26.10']);
    expect(v.rail.labels[0].top).toBe('0');
    expect(v.rail.labels[5].top).toBe('100%');
    expect(v.rail.ticks).toHaveLength(33);
    expect(v.rail.ticks[0].top).toBe('0.00%');
  });

  test('outro', () => {
    expect(v.outro.bar).toBe('현재');
    expect(v.outro.eyebrow).toBe('현재');
    expect(v.outro.title).toBe('1,418일 동안 바뀐 것');
    expect(v.outro.arcs[0].span).toBe('2022.11 – 2023');
    expect(v.outro.ledgerTitle).toBe('주요 모델 판본');
    expect(v.outro.ledger[0].models[0]).toEqual({ name: 'ChatGPT (GPT-3.5)', date: '22.11' });
    expect(v.outro.sourcesTitle).toBe('출처와 기준');
    expect(v.outro.sourcesNote.startsWith('2026년 10월 18일까지의 각 사 발표와')).toBe(true);
    expect(v.outro.end).toEqual(['판 33장 · 2022.11.30 – 현재', 'AI Timeline Log']);
  });
});
