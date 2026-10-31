import { describe, test, expect } from 'vitest';
import { loadContent } from '../../src/lib/content.ts';
import { hasHangul } from '../../src/lib/checks.ts';
import { feedItems, renderRss } from '../../src/lib/feed.ts';

const c = loadContent();
const ko = feedItems(c, 'ko');
const byGuid = (g: string) => ko.find(i => i.guid === g);
const exportControl = c.scenes.find(s => s.id.endsWith('export-control'))!.id;

describe('feedItems', () => {
  test('first edition is one item', () => {
    expect(ko.filter(i => i.guid.startsWith('first:'))).toHaveLength(1);
    expect(byGuid('first:2026-10-05')?.title).toBe('첫 판: 장면 28개');
    const firstScenes = c.scenes.filter(s => s.added === '2026-10-05').map(s => s.id);
    expect(ko.filter(i => i.guid.startsWith('scene:') && firstScenes.some(id => i.guid.includes(`:${id}:`)))).toEqual([]);
  });

  test('later scenes, corrections and posters', () => {
    expect(byGuid('scene:2026-10-eth-review:2026-10-31')?.link).toBe('https://lucasflatwhite.com/ai-timeline-log/#2026-10-eth-review');
    expect(byGuid(`correction:${exportControl}:2026-10-27`)).toBeDefined();
    expect(byGuid('poster:4:2026-10-31')?.link).toBe('https://github.com/lucas-flatwhite/ai-timeline-log/releases/tag/edition-4');
    expect(ko.filter(i => i.guid.startsWith('poster:'))).toHaveLength(1);
    expect(ko.filter(i => i.guid.startsWith('scene:'))).toHaveLength(13);
    expect(ko.filter(i => i.guid.startsWith('correction:'))).toHaveLength(2);
  });

  test('newest first', () => {
    const dates = ko.map(i => i.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  test('english feed never leaks Hangul', () => {
    const c2 = structuredClone(c);
    for (const s of c2.scenes) for (const x of s.corrections) delete x.en;
    const en = feedItems(c2, 'en');
    const corr = en.filter(i => i.guid.startsWith('correction:'));
    expect(corr.length).toBe(2);
    expect(corr.every(i => i.description.includes('A correction was made.'))).toBe(true);
    expect(en.filter(i => hasHangul(i.title + i.description))).toEqual([]);
  });
});

describe('renderRss', () => {
  test('rss is well formed', () => {
    const c2 = structuredClone(c);
    c2.scenes.find(s => s.id === '2026-10-eth-review')!.ko.title = 'A & B <C>';
    const xml = renderRss(c2, 'ko');
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0">');
    expect(xml).toContain('A &amp; B &lt;C&gt;');
    expect(xml).toContain('<pubDate>Sat, 31 Oct 2026 00:00:00 +0900</pubDate>');
    expect(xml).toContain('<language>ko</language>');
    const guids = [...xml.matchAll(/<guid isPermaLink="false">([^<]+)<\/guid>/g)].map(m => m[1]);
    expect(guids.length).toBe(17);
    expect(new Set(guids).size).toBe(guids.length);
  });

  test('english channel', () => {
    const xml = renderRss(c, 'en');
    expect(xml).toContain('<link>https://lucasflatwhite.com/ai-timeline-log/en/</link>');
    expect(xml).toContain('<title>Edition 4 poster</title>');
  });
});
