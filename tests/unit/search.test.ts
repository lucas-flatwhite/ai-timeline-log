import { describe, expect, it } from 'vitest';
import { norm, terms, hit, searchIndex, inEra } from '../../src/lib/search.ts';
import { loadContent } from '../../src/lib/content.ts';

describe('norm', () => {
  it('drops case, spaces and punctuation', () => {
    expect(norm('GPT-4')).toBe('gpt4');
    expect(norm('gpt 4')).toBe('gpt4');
    expect(norm('Claude 3.5 Sonnet')).toBe('claude35sonnet');
    expect(norm('“vibe coding”')).toBe('vibecoding');
    expect(norm('$500B')).toBe('500b');
  });
  it('keeps Hangul syllables and folds full-width letters', () => {
    expect(norm('딥시크, 추론 모델')).toBe('딥시크추론모델');
    expect(norm('ＧＰＴ')).toBe('gpt');
  });
  it('treats dates written with dots or hyphens alike', () => {
    expect(norm('2025.01')).toBe(norm('2025-01'));
    expect('20250120'.includes(norm('2025.01'))).toBe(true);
  });
});

describe('terms and hit', () => {
  it('splits on spaces and needs every term', () => {
    expect(terms('  open  ai ')).toEqual(['open', 'ai']);
    expect(terms(' - . ')).toEqual([]);
    expect(hit(norm('OpenAI releases Operator'), terms('operator openai'))).toBe(true);
    expect(hit(norm('OpenAI releases Operator'), terms('operator google'))).toBe(false);
  });
});

describe('inEra', () => {
  it('compares year and month, open-ended at the end', () => {
    expect(inEra('20230105', '202211', '202302')).toBe(true);
    expect(inEra('202301', '202211', '202302')).toBe(true);
    expect(inEra('20230301', '202211', '202302')).toBe(false);
    expect(inEra('20261101', '202609')).toBe(true);
    expect(inEra('20260831', '202609')).toBe(false);
    // 상자에 보이는 날짜(YYYY.MM.DD, YYYY.MM)도 같다
    expect(inEra('2023.01.05', '202211', '202302')).toBe(true);
    expect(inEra('2023.03', '202211', '202302')).toBe(false);
  });
});

describe('searchIndex', () => {
  const c = loadContent();
  it('covers every scene and event box with the given language', () => {
    const ko = searchIndex(c, 'ko'), en = searchIndex(c, 'en');
    const boxes = c.scenes.reduce((n, s) => n + 1 + s.items.length, 0);
    expect(Object.keys(ko)).toHaveLength(boxes);
    expect(Object.keys(en).sort()).toEqual(Object.keys(ko).sort());
    expect(ko['2025-01-deepseek~20250123']).toContain('오퍼레이터');
    expect(en['2025-01-deepseek~20250123']).toContain('operator');
    // 사건에는 날짜와 상자 글자도 들어 있다
    expect(en['2025-01-deepseek~20250123']).toContain('20250123');
    expect(en['2025-01-deepseek~20250120']).toContain('r1');
    // 장면에는 제목과 소개 글
    expect(ko['2025-01-deepseek']).toContain(norm('딥시크 쇼크'));
  });
});
