import { existsSync, readFileSync, statSync } from 'node:fs';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { check } from '../../../skills/ai-lineage/scripts/lib/check.mjs';
import { toMermaid } from '../../../skills/ai-lineage/scripts/lib/mermaid.mjs';
import { toSourcesMd } from '../../../skills/ai-lineage/scripts/lib/sources.mjs';

const DIR = 'skills/ai-lineage/examples';
const LANGS = ['ko', 'en'] as const;
const MAX_AVIF = 102400;

const data = (lang: string) => JSON.parse(readFileSync(`${DIR}/moe.${lang}.lineage.json`, 'utf8'));
const facts = (lang: string) => {
  const d = data(lang);
  return { nodes: d.nodes.map(({ name, sub, ...rest }: Record<string, unknown>) => rest), edges: d.edges };
};

describe.each(LANGS)('MoE sample (%s)', (lang) => {
  const d = data(lang);

  it('passes check with no errors and no warnings', async () => {
    const r = await check(d, { style: 'woodcut', credit: true });
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
  });

  it('opened every source and has confirmed edges', () => {
    const sources = d.nodes.flatMap((n: { sources: { opened: boolean }[] }) => n.sources);
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.every((s: { opened: boolean }) => s.opened === true)).toBe(true);
    expect(d.edges.filter((e: { status: string }) => e.status === 'confirmed').length).toBeGreaterThanOrEqual(1);
  });

  it('keeps the committed Mermaid and source list in step with the tool', () => {
    expect(readFileSync(`${DIR}/moe.${lang}.mmd`, 'utf8')).toBe(toMermaid(d));
    expect(readFileSync(`${DIR}/moe.${lang}.sources.md`, 'utf8')).toBe(toSourcesMd(d));
  });

  it('has a site image of the agreed size', async () => {
    const file = `public/lineage/ai-lineage-${lang}.avif`;
    expect(existsSync(file)).toBe(true);
    expect(statSync(file).size).toBeLessThanOrEqual(MAX_AVIF);
    const { width, height } = await sharp(file).metadata();
    expect([width, height]).toEqual([1200, 675]);
  });
});

describe('MoE sample in two languages', () => {
  it('states the same facts apart from name and sub', () => {
    expect(facts('ko')).toEqual(facts('en'));
  });
});
