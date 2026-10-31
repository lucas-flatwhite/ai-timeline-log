import { describe, test, expect } from 'vitest';
import { loadContent, loadGlossary } from '../../src/lib/content.ts';
import { hasHangul } from '../../src/lib/checks.ts';
import {
  buildLlmsFull, buildLlmsIndex, buildTimeline, latestPosterEdition, posterUrl, releaseUrl, sceneUrl, SCOPE,
} from '../../src/lib/export.ts';

const c = loadContent();
const t = buildTimeline(c, loadGlossary());
const ORIGIN = 'https://lucasflatwhite.com/ai-timeline-log/';

describe('urls', () => {
  test('scene, poster and release urls', () => {
    expect(sceneUrl('ko', '2026-10-eth-review')).toBe(`${ORIGIN}#2026-10-eth-review`);
    expect(sceneUrl('en', '2026-10-eth-review')).toBe(`${ORIGIN}en/#2026-10-eth-review`);
    expect(posterUrl(c.site.repo, 4, 'ko', 'pdf'))
      .toBe('https://github.com/lucas-flatwhite/ai-timeline-log/releases/download/edition-4/poster-ko.pdf');
    expect(releaseUrl(c.site.repo, 4)).toBe('https://github.com/lucas-flatwhite/ai-timeline-log/releases/tag/edition-4');
    expect(latestPosterEdition(c)?.n).toBe(4);
  });
});

describe('buildTimeline', () => {
  test('timeline has every scene and event', () => {
    expect(t.scenes).toHaveLength(41);
    expect(t.scenes.flatMap(s => s.items)).toHaveLength(157);
    expect(t.site.asOf).toBe('2026-10-31');
    expect(t.site.license.name).toBe('CC BY 4.0');
    expect(t.site.scope).toEqual(SCOPE);
    expect(t.topics.agents.en).toBe('Agents');
    expect(t.editions.at(-1)!.n).toBe(4);
    expect(t.scenes[0].id).toBe('2026-10-eth-review');
    expect(t.glossary.length).toBeGreaterThan(0);
  });

  test('timeline items carry addresses and urls', () => {
    const s = t.scenes[0];
    expect(s.items[0].addr).toBe('2026-10-eth-review~20261026');
    expect(s.url.en).toBe(`${ORIGIN}en/#2026-10-eth-review`);
    expect(s.items[0].url.ko).toBe(`${ORIGIN}#2026-10-eth-review~20261026`);
    expect(s.topics).toEqual(['science']);
  });

  test('timeline leaves out print settings', () => {
    const json = JSON.stringify(t);
    expect(json).not.toContain('"print"');
    expect(json).not.toContain('"pic"');
  });
});

describe('llms', () => {
  test('llms index links the full files', () => {
    const s = buildLlmsIndex(c);
    expect(s).toMatch(/^# AI Timeline Log\n\n> /);
    for (const x of [`${ORIGIN}llms-full.txt`, `${ORIGIN}en/llms-full.txt`, `${ORIGIN}timeline.json`, 'CC BY 4.0', SCOPE.en]) {
      expect(s).toContain(x);
    }
  });

  test('llms-full (ko) states scope, asOf and sources', () => {
    const s = buildLlmsFull(c, 'ko');
    expect(s).toContain(SCOPE.ko);
    expect(s).toContain('2026.10.31');
    const items = c.scenes.flatMap(sc => sc.items);
    expect(items.filter(it => !s.includes(it.ko))).toEqual([]);
    const urls = items.flatMap(it => it.sources.map(x => x.url));
    expect(urls.filter(u => !s.includes(u))).toEqual([]);
  });

  test('llms-full (en) has no Hangul', () => {
    const s = buildLlmsFull(c, 'en');
    expect(s).toContain(SCOPE.en);
    expect(hasHangul(s)).toBe(false);
  });
});
