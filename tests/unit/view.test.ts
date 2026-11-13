import { describe, test, expect } from 'vitest';
import { loadContent } from '../../src/lib/content.ts';
import { hashSeed, itemAddresses } from '../../src/lib/grid.ts';
import { buildView, fill } from '../../src/lib/view.ts';
import { latestPosterEdition } from '../../src/lib/export.ts';
import { clipText } from '../../src/lib/agent.ts';
import { formatMB, previewSize } from '../../src/lib/poster.ts';

const v = buildView(loadContent(), 'ko', '2026-10-25');   // 일수는 기준일(asOf)이 아니라 오늘로 센다
const scene = (id: string) => v.scenes.find(s => s.id === id)!;
const item = (id: string, addr: string) => scene(id).items.find(it => it.addr === addr)!;

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
    expect(v.description).toBe('ChatGPT 공개(2022.11.30) 이후 생성형 AI의 사건을 흑백 목판화 상자로 찍어 최신순으로 늘어놓은 벽. 상자를 누르면 장면 76개의 자세한 내용이 열립니다.');
    expect(v.ogTitle).toBe('AI Timeline Log');
    expect(v.ogDescription).toBe('ChatGPT 공개 이후 생성형 AI의 사건을 목판화 상자로 찍어 최신순으로 늘어놓았습니다. 상자를 누르면 자세한 내용이 열립니다.');
    // 소개 글 끝은 일수와 같은 날(빌드한 날, 브라우저에서는 보는 날). 틀에는 {todayLong}을 남긴다
    expect(v.cover).toEqual({
      glyph: '1,425일', tpl: '{days}일', start: '2022-11-30',
      lede: 'ChatGPT가 공개된 2022년 11월 30일부터 2026년 10월 25일까지, AI가 지나온 장면들을 기록합니다.',
      ledeTpl: 'ChatGPT가 공개된 2022년 11월 30일부터 {todayLong}까지, AI가 지나온 장면들을 기록합니다.',
    });
    expect(v.report).toMatchObject({
      label: '제보', href: 'https://github.com/lucas-flatwhite/ai-timeline-log/issues', issue: 'GitHub 이슈 열기', mailLabel: '메일 보내기',
      email: 'lucas.flatwhite@gmail.com', mail: `mailto:lucas.flatwhite@gmail.com?subject=${encodeURIComponent('[AI Timeline Log] 제보')}`,
    });
    expect(v.report.note).toContain('GitHub 이슈');
    expect(v.dialog).toEqual({ prev: '← 이전 사건', next: '다음 사건 →', close: '닫기', fix: '정정·제보', sources: '출처', sceneSources: '이 장면의 출처' });
    expect(v.pics).toEqual(loadContent().pics);
    expect(v.aria).toEqual({ wall: 'AI 사건 격자', details: '모든 장면' });
  });

  test('canonical, og image and alternates', () => {
    expect(v.canonical).toBe('https://lucasflatwhite.com/ai-timeline-log/ko/');
    expect(v.ogImage).toBe('https://lucasflatwhite.com/ai-timeline-log/og/ko.png');
    expect(v.alternates).toEqual([
      { hreflang: 'ko', href: 'https://lucasflatwhite.com/ai-timeline-log/ko/' },
      { hreflang: 'en', href: 'https://lucasflatwhite.com/ai-timeline-log/' },
      { hreflang: 'x-default', href: 'https://lucasflatwhite.com/ai-timeline-log/' },
    ]);
  });

  test('language switch lists every locale, each with its page', () => {
    expect(v.langNav).toBe('언어');
    expect(v.langs).toEqual([
      { code: 'ko', label: 'KO', name: '한국어', path: 'ko/', current: true },
      { code: 'en', label: 'EN', name: 'English', path: '', current: false },
    ]);
  });

  test('the wall is newest first, with a year box per year', () => {
    expect(v.boxes.length).toBe(76 + 283 + 5);
    expect(v.boxes[0]).toMatchObject({ kind: 'year', addr: 'year-2026', date: '2026', off: false });
    expect(v.boxes.at(-1)).toMatchObject({ kind: 'scene', addr: '2022-11-chatgpt', date: '2022.11.30' });   // 가장 오래된 상자
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
    expect(m).toMatchObject({ kind: 'item', date: '2023.01', motif: 'none', scene: '2022-11-chatgpt', seed: hashSeed('2022-11-chatgpt~202301') });
    expect(v.boxes.filter(b => b.kind === 'item' && b.pattern === 'c')).toEqual([]);
    const day = v.boxes.find(b => b.addr === '2022-11-chatgpt~20230123')!;
    expect(v.boxes.indexOf(m)).toBeGreaterThan(v.boxes.indexOf(day));   // 월만 있는 날짜는 그달의 맨 끝(과거 쪽)
    expect(day.label.startsWith('2023.01.23 · ')).toBe(true);
  });

  test('scene detail', () => {
    const d = scene('2026-07-sandbox-escape');
    expect(d.meta.startsWith('2026.07.21 · ')).toBe(true);
    const it = item('2026-07-sandbox-escape', '2026-07-sandbox-escape~20260721');
    expect(it.meta).toBe('2026.07.21 · 사고 · ‘샌드박스를 나간 에이전트’ 장면의 사건');
    expect(decodeURIComponent(it.fix)).toContain('event=https://lucasflatwhite.com/ai-timeline-log/ko/#2026-07-sandbox-escape~20260721');
    expect(decodeURIComponent(it.fix)).toContain('title=[정정] 2026.07.21 ');
    expect(it.fix).toContain('&lang=ko');
    expect(d.fix).toContain('https://github.com/lucas-flatwhite/ai-timeline-log/issues/new?template=correction.yml&title=');
    expect(decodeURIComponent(d.fix)).toContain('event=https://lucasflatwhite.com/ai-timeline-log/ko/#2026-07-sandbox-escape&');
    expect(item('2025-01-deepseek', '2025-01-deepseek~20250120')).toMatchObject({ addr: '2025-01-deepseek~20250120', date: '2025.01.20', text: '딥시크, 추론 모델 R1을 MIT 라이선스로 공개.' });
    expect(scene('2025-01-deepseek').aliases).toEqual([]);
  });

  test('only the scenes added on the latest date are marked as recently added', () => {
    const marked = v.scenes.filter(s => s.meta.includes('추가'));
    expect(marked).toHaveLength(1);
    expect(marked.every(s => s.meta.endsWith(' · 추가 2026.11.13'))).toBe(true);
    expect(marked.map(s => s.id).sort()).toEqual(['2026-11-nvidia-ceo']);
    expect(scene('2025-01-deepseek').meta).not.toContain('추가');
    expect(v.scenes.filter(s => !s.meta.includes('추가'))).toHaveLength(75);
  });

  test('events in a recently added scene carry the same mark, after the scene name', () => {
    const fresh = scene('2026-11-nvidia-ceo');
    expect(fresh.items.length).toBeGreaterThan(0);
    for (const it of fresh.items) expect(it.meta).toMatch(/^\d{4}\.\d{2}(\.\d{2})? · .+ · ‘.+’ 장면의 사건 · 추가 2026\.11\.13$/);
    const marked = v.scenes.filter(s => s.meta.endsWith(' · 추가 2026.11.13')).flatMap(s => s.items);
    expect(v.scenes.flatMap(s => s.items).filter(it => it.meta.endsWith(' · 추가 2026.11.13'))).toEqual(marked);
    expect(scene('2025-01-deepseek').items.every(it => !it.meta.endsWith(' · 추가 2026.11.13'))).toBe(true);
  });

  test('item sources: its own when it has some, else the scene sources', () => {
    const c = structuredClone(loadContent());
    const s = c.scenes.find(x => x.id === '2025-01-deepseek')!;
    s.aliases = ['2025-01-r1'];
    s.sources = [{ url: 'https://example.com/scene', title: '장면 출처' }];
    s.items[0].sources = [{ url: 'https://example.com/item', title: '사건 출처' }];
    s.items[1].sources = [];
    const d = buildView(c, 'ko', '2026-10-25').scenes.find(x => x.id === s.id)!;
    const addrs = itemAddresses(s.id, s.items.map(x => x.date));
    const at = (k: number) => d.items.find(x => x.addr === addrs[k])!;
    expect(at(0).sources).toEqual([{ url: 'https://example.com/item', title: '사건 출처' }]);
    expect(at(1).sources).toEqual([{ url: 'https://example.com/scene', title: '장면 출처' }]);
    expect(d.sources).toEqual([{ url: 'https://example.com/scene', title: '장면 출처' }]);
    expect(d.aliases).toEqual(['2025-01-r1']);
  });

  test('details follow the wall order, newest first', () => {
    expect(v.scenes).toHaveLength(76);
    expect(v.scenes[0].id).toBe(v.boxes.find(b => b.kind === 'scene')!.addr);
    expect(v.scenes.at(-1)!.id).toBe('2022-11-chatgpt');
  });

  test('events in a scene card follow the wall order too, newest first', () => {
    const wall = v.boxes.map(b => b.addr);
    for (const s of v.scenes) {
      const seq = s.items.map(it => wall.indexOf(it.addr));
      expect(seq).toEqual([...seq].sort((a, b) => a - b));
    }
    const d = scene('2025-01-deepseek').items.map(it => it.addr);
    expect(d.indexOf('2025-01-deepseek~20250127')).toBeLessThan(d.indexOf('2025-01-deepseek~20250120'));
  });

  test('no plate numbers anywhere', () => {
    expect(JSON.stringify(v)).not.toMatch(/제\d+판/);
  });

  test('outro', () => {
    expect(v.outro.bar).toBe('업데이트 2026.11.13');   // '현재' 대신 마지막으로 고친 날(asOf)
    expect(v.outro.eyebrow).toBe('업데이트 2026.11.13');
    expect(v.outro.title).toBe('1,425일 동안 바뀐 것');
    expect(v.outro.arcs).toHaveLength(9);
    expect(v.outro.arcs[0].span).toBe('2022.11 – 2023.02');
    expect(v.outro.arcs[8].span).toBe('2026.09 – 2026.11.13');
    expect(v.outro.arcs[8]).toMatchObject({ title: '속도를 묻다' });
    for (const a of v.outro.arcs) expect(a.body.length).toBeGreaterThan(20);
    expect(v.outro.ledgerTitle).toBe('주요 모델 판본');
    expect(v.outro.ledger[0].models[0]).toEqual({ name: 'ChatGPT (GPT-3.5)', date: '2022.11' });
    expect(v.outro).not.toHaveProperty('sources');
    expect(v.outro.end).toEqual(['판 76장 · 2022.11.30 – 2026.11.13', 'AI Timeline Log']);
    expect(v.outro.making).toContain('GitHub 이슈나 메일(lucas.flatwhite@gmail.com)');
    expect(v.outro.making).not.toMatch(/AI의 도움|Claude/);
    expect(v.outro.makingTitle).toBe('만든 방법');
    expect(v.outro.titleTpl).toBe('{days}일 동안 바뀐 것');   // 브라우저가 보는 날로 다시 채우는 틀
  });
});

describe('buildView(en)', () => {
  const e = buildView(loadContent(), 'en', '2026-10-25');

  test('cover, canonical and language switch', () => {
    expect(e.cover).toEqual({
      glyph: '1,425 days', tpl: '{days} days', start: '2022-11-30',
      lede: 'Moments in AI from ChatGPT’s launch on November 30, 2022, to October 25, 2026.',
      ledeTpl: 'Moments in AI from ChatGPT’s launch on November 30, 2022, to {todayLong}.',
    });
    expect(e.canonical).toBe('https://lucasflatwhite.com/ai-timeline-log/');
    expect(e.langs.map(l => [l.label, l.current])).toEqual([['KO', false], ['EN', true]]);
  });

  test('box glyphs and labels have no Hangul, and an item reads in English', () => {
    expect(e.boxes).toHaveLength(v.boxes.length);
    expect(e.boxes.filter(b => /[가-힣]/.test(b.glyph + b.label))).toEqual([]);
    expect(e.scenes.find(s => s.id === '2025-01-deepseek')!.items.find(it => it.addr === '2025-01-deepseek~20250120')!.text).toBe('DeepSeek releases its reasoning model R1 under the MIT license.');
  });

  test('recently added scenes and their events carry the English mark', () => {
    const fresh = e.scenes.find(s => s.id === '2026-11-nvidia-ceo')!;
    expect(fresh.meta.endsWith(' · Added 2026.11.13')).toBe(true);
    expect(fresh.items.every(it => it.meta.endsWith(' · Added 2026.11.13'))).toBe(true);
    expect(e.scenes.flatMap(s => s.items).filter(it => it.meta.endsWith(' · Added 2026.11.13'))).toHaveLength(
      e.scenes.filter(s => s.meta.endsWith(' · Added 2026.11.13')).flatMap(s => s.items).length);
  });
});

describe('topics and visits on the wall', () => {
  const e = buildView(loadContent(), 'en', '2026-10-25');

  test('boxes carry topics and added', () => {
    const it = v.boxes.find(b => b.addr === '2026-10-eth-review~20261026')!;
    expect(it.topics).toEqual(['science']);
    expect(it.added).toBe('2026-10-31');
    const sc = v.boxes.find(b => b.addr === '2024-11-computer-use-mcp')!;
    expect(sc.topics).toEqual(['agents']);
    const y = v.boxes.find(b => b.kind === 'year')!;
    expect(y.topics).toEqual([]);
    expect(y.added).toBeUndefined();
  });

  test('topics list follows topics.yaml with scene counts', () => {
    expect(v.topics.map(t => [t.id, t.count])).toEqual([
      ['agents', 13], ['compute', 16], ['rules', 19], ['safety', 13], ['open', 8], ['science', 5], ['society', 13], ['models', 17], ['korea', 4],
    ]);
    expect(v.topics[0].name).toBe('에이전트');
    expect(e.topics[0].name).toBe('Agents');
  });

  test('latestAdded is the newest added', () => {
    expect(v.latestAdded).toBe('2026-11-13');
  });

  test('wall ui strings', () => {
    expect(v.ui).toMatchObject({
      topic: '주제', topicAll: '모두', topicClear: '주제 해제',
      newLine: '지난 방문 이후 새 상자 {n}개', newShow: '보기', newLabel: '지난 방문 이후 추가',
      find: '찾기', eras: '시기',
      pick: { era: '시기 {i}/{n}', boxes: '상자 {n}개', box1: '상자 1개', none: '맞는 상자가 없습니다' },
    });
    expect(e.ui.pick).toMatchObject({ era: 'Era {i} of {n}', boxes: '{n} boxes', box1: '1 box' });
    // 시기: 오래된 것부터, YYYYMM, 마지막은 끝이 없다
    expect(v.eras[0]).toMatchObject({ from: '202211', to: '202302' });
    expect(v.eras.at(-1)!.to).toBeUndefined();
    expect(v.outro.arcs[0].from).toBe('202211');
    expect(e.ui.newLine).toBe('{n} new since your last visit');
  });
});

describe('poster and data section', () => {
  const e = buildView(loadContent(), 'en', '2026-10-25');
  const REL = 'https://github.com/lucas-flatwhite/ai-timeline-log/releases';

  // 용량과 미리보기 크기는 Release 뒤(poster:pull)에야 정해지므로 판 기록의 files에서 읽는다
  const files = latestPosterEdition(loadContent())!.files!;
  test('take section links poster 6, feed and data', () => {
    expect(v.outro.take.title).toBe('포스터와 데이터');
    expect(e.outro.take.title).toBe('Poster and data');
    expect(v.outro.take.poster).toEqual({
      label: '포스터 · 제 6판 · 2026.11.07', note: '벽 전체를 A2 한 장에',
      desc: '420 × 594 mm, 300dpi로 찍은 PDF와 PNG입니다.',
      pdf: { href: `${REL}/download/edition-6/poster-ko.pdf`, label: 'PDF 받기', meta: `A2 · ${formatMB(files.ko.pdf, 'ko')}` },
      png: { href: `${REL}/download/edition-6/poster-ko.png`, label: 'PNG 받기', meta: `${files.ko.px[0]}px · ${formatMB(files.ko.png, 'ko')}` },
      all: REL, allLabel: '지난 판', from: '파일은 GitHub Releases에서 받습니다.',
      proof: {
        src: '/ai-timeline-log/poster/edition-6-ko.avif', ...previewSize(files.ko.px), alt: '제 6판 포스터 미리보기',
        width: '420 mm', height: '594 mm', caption: '제 6판 · 2026.11.07 · A2 · 300dpi',
      },
    });
    const ep = e.outro.take.poster!;
    expect(ep.png).toEqual({ href: `${REL}/download/edition-6/poster-en.png`, label: 'Download PNG', meta: `${files.en.px[0]} px · ${formatMB(files.en.png, 'en')}` });
    expect(ep.pdf.meta).toBe(`A2 · ${formatMB(files.en.pdf, 'en')}`);
    expect(ep.label).toBe('Poster · Edition 6 · 2026.11.07');
    expect(ep.proof!.src).toBe('/ai-timeline-log/poster/edition-6-en.avif');
    expect(ep.proof!.caption).toBe('Edition 6 · 2026.11.07 · A2 · 300 dpi');
    expect(v.outro.take.feed).toEqual({ label: '피드', note: '새 장면과 정정을 RSS로 받기', href: '/ai-timeline-log/ko/feed.xml' });
    expect(e.outro.take.feed.href).toBe('/ai-timeline-log/feed.xml');
    expect(v.outro.take.license).toBe('내용은 CC BY 4.0을 따릅니다. 출처: AI Timeline Log');
    expect(v.outro.take.ai).toEqual({
      eyebrow: 'AI에게 건네기 · 기준일 2026.11.13', title: '쓰는 에이전트에 이 연표를 들여놓기',
      desc: '한 번 들여놓으면 AI 역사나 모델 출시를 물을 때 에이전트가 이 연표를 찾아 읽고, 날짜와 출처를 달아 답합니다. 장면이 늘어도 다시 할 일은 없습니다.',
      clip: clipText(loadContent(), 'ko'), slipCap: '클립보드에 들어가는 글',
      slipFoot: 'agent.md가 에이전트마다 할 일을 알려 줍니다. 파일을 저장할 수 있으면 스킬로, 채팅이면 메모리나 프로젝트 지침으로.',
      button: '에이전트에게 알려 주기', copied: '복사했습니다', hint: '이제 에이전트에 붙여 넣으세요.', failed: '직접 복사해 주세요.',
      steps: ['버튼을 누르면 쪽지의 글이 복사됩니다.', 'Claude Code, Codex, Cursor, OpenCode에 붙여 넣습니다. ChatGPT 같은 채팅도 됩니다.', '일을 맡깁니다.'],
      examples: [
        { label: '맥락 붙이기', text: '이 기사에 나온 발표가 연표의 어느 흐름에 이어지는지, 앞선 장면을 날짜와 링크로 짚어 주세요.' },
        { label: '새 소식 챙기기', text: '매주 월요일에 연표의 새 장면과 정정을 확인해서 세 줄로 알려 주세요.' },
      ],
      links: {
        agent: 'https://lucasflatwhite.com/ai-timeline-log/ko/agent.md', llms: 'https://lucasflatwhite.com/ai-timeline-log/ko/llms-full.txt',
        json: 'https://lucasflatwhite.com/ai-timeline-log/timeline.json',
      },
    });
    for (const [view, lang] of [[v, 'ko'], [e, 'en']] as const) {
      const ln = view.outro.take.lineage;
      expect(ln.command).toBe('npx skills add lucas-flatwhite/ai-timeline-log --skill ai-lineage -g');
      expect(ln.links.folder).toBe('https://github.com/lucas-flatwhite/ai-timeline-log/tree/main/skills/ai-lineage');
      expect(ln.links.sample).toBe(`https://github.com/lucas-flatwhite/ai-timeline-log/blob/main/skills/ai-lineage/examples/moe.${lang}.png`);
      expect(ln.img).toEqual({ src: `/ai-timeline-log/lineage/ai-lineage-${lang}.avif`, w: 1200, h: 675 });
      expect(ln.steps.length).toBe(3);
    }
    expect(e.outro.take.ai.button).toBe('Onboard your agent');
    expect(e.outro.take.ai.eyebrow).toBe('Hand It to an AI · As of 2026.11.13');
    expect(e.outro.take.ai.title).toBe('Onboard your agent to this timeline');
    expect(e.outro.take.ai.clip).toBe(clipText(loadContent(), 'en'));
    expect(e.outro.take.ai.links.agent).toBe('https://lucasflatwhite.com/ai-timeline-log/agent.md');
    expect(e.outro.take.ai.links.llms).toBe('https://lucasflatwhite.com/ai-timeline-log/llms-full.txt');
    expect(e.outro.take.ai.examples.map(x => x.label)).toEqual(['Add context', 'Keep up']);
  });

  test('before poster:pull: links without sizes and no proof sheet', () => {
    const c = structuredClone(loadContent());
    delete c.editions.at(-1)!.files;
    const p = buildView(c, 'ko', '2026-10-25').outro.take.poster!;
    expect(p.pdf).toEqual({ href: `${REL}/download/edition-6/poster-ko.pdf`, label: 'PDF 받기', meta: undefined });
    expect(p.png.meta).toBeUndefined();
    expect(p.proof).toBeUndefined();
  });

  test('no poster edition, no poster row', () => {
    const f = buildView(loadContent('tests/fixtures/content'), 'ko', '2026-10-25');
    expect(f.outro.take.poster).toBeUndefined();
  });
});

describe('guide (쓰는 법)', () => {
  const c = loadContent();
  for (const loc of ['ko', 'en'] as const) {
    const g = buildView(c, loc, '2026-10-25').outro.guide;
    test(`${loc}: five steps in order, each pic in pics.yaml`, () => {
      expect(g.steps.map(s => s.act)).toEqual(['look', 'open', 'follow', 'take', 'ask']);
      expect(g.steps.map(s => s.n)).toEqual(['1', '2', '3', '4', '5']);
      for (const s of g.steps) {
        expect(c.pics[s.pic]).toBeDefined();
        expect(s.glyph).not.toBe('');
        expect(s.note).not.toBe('');
      }
    });
    test(`${loc}: open goes to the newest box, the others to anchors on the page`, () => {
      const v2 = buildView(c, loc, '2026-10-25');
      const newest = v2.boxes.find(b => b.kind !== 'year' && !b.off)!;
      expect(Object.fromEntries(g.steps.map(s => [s.act, s.href]))).toEqual({
        look: '#wall', open: `#${newest.addr}`, follow: '#wall', take: '#take', ask: '#take-ai',
      });
    });
  }
  test('ask points to the one-click onboarding', () => {
    expect(buildView(c, 'ko', '2026-10-25').outro.guide.steps.find(s => s.act === 'ask')!.note).toBe('버튼 하나로 에이전트에 들여놓기.');
    expect(buildView(c, 'en', '2026-10-25').outro.guide.steps.find(s => s.act === 'ask')!.note).toBe('Onboard your agent in one click.');
  });
  test('titles and keywords: Korean on the Korean page, English on the English page', () => {
    const ko = buildView(c, 'ko', '2026-10-25').outro.guide, en = buildView(c, 'en', '2026-10-25').outro.guide;
    expect(ko.title).toBe('쓰는 법');
    expect(ko.steps.map(s => s.glyph)).toEqual(['보기', '열기', '흐름', '포스터', '묻기']);
    expect(en.title).toBe('How to use');
    expect(en.steps.map(s => s.glyph)).toEqual(['LOOK', 'OPEN', 'FOLLOW', 'POSTER', 'ASK']);
    // 작은 판 규칙: 한글 3자 이내, 영어 핵심어에는 한글이 없다
    for (const s of ko.steps) expect([...s.glyph].length).toBeLessThanOrEqual(3);
    for (const s of en.steps) expect(s.glyph).not.toMatch(/[가-힣]/);
  });
});
