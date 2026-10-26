import { describe, test, expect } from 'vitest';
import { loadContent } from '../../src/lib/content.ts';
import { hashSeed } from '../../src/lib/grid.ts';
import { buildView, fill } from '../../src/lib/view.ts';

const v = buildView(loadContent(), 'ko', '2026-10-25');   // 일수는 기준일(asOf)이 아니라 오늘로 센다
const scene = (id: string) => v.scenes.find(s => s.id === id)!;

describe('fill', () => {
  test('replaces known keys and rejects unknown ones', () => {
    expect(fill('{a}·{b}', { a: '1', b: '2' })).toBe('1·2');
    expect(() => fill('{nope}', {})).toThrow(/nope/);
  });
});

describe('buildView(ko)', () => {
  test('head, cover and report link', () => {
    expect(v.title).toBe('AI Timeline Log');
    expect(v.name).toBe('AI Timeline Log');
    expect(v.description).toBe('ChatGPT 공개(2022.11.30)부터 현재까지, 생성형 AI의 사건을 흑백 목판화 상자로 찍어 최신순으로 늘어놓은 벽. 상자를 누르면 장면 33개의 자세한 내용이 열립니다.');
    expect(v.ogTitle).toBe('AI Timeline Log');
    expect(v.ogDescription).toBe('ChatGPT 공개부터 현재까지, 생성형 AI의 사건을 목판화 상자로 찍어 최신순으로 늘어놓았습니다. 상자를 누르면 자세한 내용이 열립니다.');
    expect(v.cover).toEqual({ glyph: '1,425일', tpl: '{days}일', start: '2022-11-30', lede: 'ChatGPT가 공개된 2022년 11월 30일부터 현재까지, AI가 지나온 장면들을 기록합니다.' });
    expect(v.report).toEqual({ label: '제보·정정', href: 'https://github.com/lucas-flatwhite/ai-timeline-log/issues' });
    expect(v.dialog).toEqual({ prev: '← 이전 사건', next: '다음 사건 →', close: '닫기', fix: '이 사건 정정·제보', sources: '출처' });
    expect(v.pics).toEqual(loadContent().pics);
    expect(v.aria).toEqual({ wall: 'AI 사건 격자', details: '모든 장면' });
  });

  test('canonical, og image and alternates', () => {
    expect(v.canonical).toBe('https://lucasflatwhite.com/ai-timeline-log/');
    expect(v.ogImage).toBe('https://lucasflatwhite.com/ai-timeline-log/og/ko.png');
    expect(v.alternates).toEqual([
      { hreflang: 'ko', href: 'https://lucasflatwhite.com/ai-timeline-log/' },
      { hreflang: 'en', href: 'https://lucasflatwhite.com/ai-timeline-log/en/' },
      { hreflang: 'x-default', href: 'https://lucasflatwhite.com/ai-timeline-log/' },
    ]);
  });

  test('language switch lists every locale, each with its page', () => {
    expect(v.langNav).toBe('언어');
    expect(v.langs).toEqual([
      { code: 'ko', label: 'KO', name: '한국어', path: '', current: true },
      { code: 'en', label: 'EN', name: 'English', path: 'en/', current: false },
    ]);
  });

  test('the wall is newest first, with a year box per year', () => {
    expect(v.boxes.length).toBe(33 + 128 + 5);
    expect(v.boxes[0]).toMatchObject({ kind: 'year', addr: 'year-2026', date: '2026', off: false });
    expect(v.boxes.at(-1)).toMatchObject({ kind: 'scene', addr: '2022-11-chatgpt', date: '20221130' });   // 가장 오래된 상자
    expect(v.boxes.filter(b => b.kind === 'year').map(b => b.addr)).toEqual(['year-2026', 'year-2025', 'year-2024', 'year-2023', 'year-2022']);
    expect(v.boxes.find(b => b.addr === 'year-2022')).toMatchObject({ off: true });
    expect(v.years.map(y => y.year)).toEqual(['2026', '2025', '2024', '2023']);
  });

  test('scene boxes keep their print; seeds come from the address', () => {
    const gpt4 = v.boxes.find(b => b.addr === '2023-03-gpt-4')!;
    expect(gpt4).toMatchObject({ kind: 'scene', seed: hashSeed('2023-03-gpt-4'), scene: '2023-03-gpt-4' });
    expect(v.boxes.find(b => b.addr === '2024-11-computer-use-mcp')).toMatchObject({ kind: 'scene', angle: -20 });
    expect(v.boxes.find(b => b.addr === '2025-11-gemini-3')!.glyph).toBe('CODE\nRED');
    expect(v.boxes.find(b => b.addr === 'year-2025')).toMatchObject({ seed: 2025, label: expect.stringMatching(/^2025 · .+/) });
  });

  test('item boxes: month-only dates, no motif, no concentric pattern', () => {
    const m = v.boxes.find(b => b.addr === '2022-11-chatgpt~202301')!;
    expect(m).toMatchObject({ kind: 'item', date: '202301', motif: 'none', scene: '2022-11-chatgpt', seed: hashSeed('2022-11-chatgpt~202301') });
    expect(v.boxes.filter(b => b.kind === 'item' && b.pattern === 'c')).toEqual([]);
    const day = v.boxes.find(b => b.addr === '2022-11-chatgpt~20230123')!;
    expect(v.boxes.indexOf(m)).toBeGreaterThan(v.boxes.indexOf(day));   // 월만 있는 날짜는 그달의 맨 끝(과거 쪽)
    expect(day.label.startsWith('20230123 · ')).toBe(true);
  });

  test('scene detail', () => {
    const d = scene('2026-07-sandbox-escape');
    expect(d.meta.startsWith('20260721 · ')).toBe(true);
    expect(d.items[1].meta).toBe('20260721 · 사고 · ‘샌드박스를 나간 에이전트’ 장면의 사건');
    expect(decodeURIComponent(d.items[1].fix)).toContain('event=https://lucasflatwhite.com/ai-timeline-log/#2026-07-sandbox-escape~20260721');
    expect(decodeURIComponent(d.items[1].fix)).toContain('title=[정정] 20260721 ');
    expect(d.items[1].fix).toContain('&lang=ko');
    expect(d.fix).toContain('https://github.com/lucas-flatwhite/ai-timeline-log/issues/new?template=correction.yml&title=');
    expect(decodeURIComponent(d.fix)).toContain('event=https://lucasflatwhite.com/ai-timeline-log/#2026-07-sandbox-escape&');
    expect(scene('2025-01-deepseek').items[0]).toMatchObject({ addr: '2025-01-deepseek~20250120', date: '20250120', text: '딥시크, 추론 모델 R1을 MIT 라이선스로 공개.' });
    expect(scene('2025-01-deepseek').aliases).toEqual([]);
  });

  test('only the scenes added on the latest date are marked as recently added', () => {
    const marked = v.scenes.filter(s => s.meta.includes('추가'));
    expect(marked).toHaveLength(5);
    expect(marked.every(s => s.meta.endsWith(' · 추가 2026.10.18'))).toBe(true);
    expect(marked.map(s => s.id)).toContain('2026-03-sora-shutdown');
    expect(scene('2025-01-deepseek').meta).not.toContain('추가');
    expect(v.scenes.filter(s => !s.meta.includes('추가'))).toHaveLength(28);
  });

  test('item sources: its own when it has some, else the scene sources', () => {
    const c = structuredClone(loadContent());
    const s = c.scenes.find(x => x.id === '2025-01-deepseek')!;
    s.aliases = ['2025-01-r1'];
    s.sources = [{ url: 'https://example.com/scene', title: '장면 출처' }];
    s.items[0].sources = [{ url: 'https://example.com/item', title: '사건 출처' }];
    s.items[1].sources = [];
    const d = buildView(c, 'ko', '2026-10-25').scenes.find(x => x.id === s.id)!;
    expect(d.items[0].sources).toEqual([{ url: 'https://example.com/item', title: '사건 출처' }]);
    expect(d.items[1].sources).toEqual([{ url: 'https://example.com/scene', title: '장면 출처' }]);
    expect(d.sources).toEqual([{ url: 'https://example.com/scene', title: '장면 출처' }]);
    expect(d.aliases).toEqual(['2025-01-r1']);
  });

  test('details follow the wall order, newest first', () => {
    expect(v.scenes).toHaveLength(33);
    expect(v.scenes[0].id).toBe(v.boxes.find(b => b.kind === 'scene')!.addr);
    expect(v.scenes.at(-1)!.id).toBe('2022-11-chatgpt');
  });

  test('no plate numbers anywhere', () => {
    expect(JSON.stringify(v)).not.toMatch(/제\d+판/);
  });

  test('outro', () => {
    expect(v.outro.bar).toBe('현재');
    expect(v.outro.eyebrow).toBe('현재');
    expect(v.outro.title).toBe('1,425일 동안 바뀐 것');
    expect(v.outro.arcs[0].span).toBe('2022.11 – 2023');
    expect(v.outro.ledgerTitle).toBe('주요 모델 판본');
    expect(v.outro.ledger[0].models[0]).toEqual({ name: 'ChatGPT (GPT-3.5)', date: '22.11' });
    expect(v.outro.sourcesTitle).toBe('출처와 기준');
    expect(v.outro.sourcesNote.startsWith('2026년 10월 18일까지의 각 사 발표와')).toBe(true);
    expect(v.outro.end).toEqual(['판 33장 · 2022.11.30 – 현재', 'AI Timeline Log']);
    expect(v.outro.making).toContain('GitHub 이슈');
    expect(v.outro.makingTitle).toBe('만든 방법');
    expect(v.outro.titleTpl).toBe('{days}일 동안 바뀐 것');   // 브라우저가 보는 날로 다시 채우는 틀
  });
});

describe('buildView(en)', () => {
  const e = buildView(loadContent(), 'en', '2026-10-25');

  test('cover, canonical and language switch', () => {
    expect(e.cover).toEqual({
      glyph: '1,425 days', tpl: '{days} days', start: '2022-11-30',
      lede: 'A record of the moments AI has passed through, from ChatGPT’s launch on November 30, 2022, to the present.',
    });
    expect(e.canonical).toBe('https://lucasflatwhite.com/ai-timeline-log/en/');
    expect(e.langs.map(l => [l.label, l.current])).toEqual([['KO', false], ['EN', true]]);
  });

  test('box glyphs and labels have no Hangul, and an item reads in English', () => {
    expect(e.boxes).toHaveLength(v.boxes.length);
    expect(e.boxes.filter(b => /[가-힣]/.test(b.glyph + b.label))).toEqual([]);
    expect(e.scenes.find(s => s.id === '2025-01-deepseek')!.items[0].text).toBe('DeepSeek releases its reasoning model R1 under the MIT license.');
  });
});
