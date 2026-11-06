import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { toMermaid } from '../../../skills/ai-lineage/scripts/lib/mermaid.mjs';
import { toSourcesMd } from '../../../skills/ai-lineage/scripts/lib/sources.mjs';

const alpha = JSON.parse(readFileSync('tests/fixtures/lineage/alpha.lineage.json', 'utf8'));
const ko = () => ({ ...structuredClone(alpha), lang: 'ko' });

describe('toMermaid', () => {
  const m: string = toMermaid(alpha);
  it('starts with flowchart TB and has one subgraph per used row', () => {
    expect(m.split('\n')[0]).toBe('flowchart TB');
    expect(m.match(/^\s*subgraph /gm)?.length).toBe(4);
    expect(m).toContain('subgraph row_root["Roots"]');
    expect(toMermaid(ko())).toContain('subgraph row_spread["확산"]');
  });
  it('uses n_ ids with underscores and edge arrows by status', () => {
    expect(m).toContain('n_alpha_routing["');
    expect(m).toContain('n_alpha_routing --> n_gamma_pool');
    expect(m).toContain('n_alpha_routing -.-> n_delta_stack');
    expect(m).toContain('n_delta_stack -.-> n_epsilon_open');
  });
  it('marks focal and side nodes and defines classes', () => {
    expect(m).toContain('class n_delta_stack focal');
    expect(m).toContain('class n_beta_gate side');
    expect(m).toContain('classDef focal fill:#111110,color:#E3E1D9,stroke:#111110');
  });
  it('is deterministic, sorts nodes by date and id, and escapes quotes', () => {
    expect(toMermaid(alpha)).toBe(m);
    const reversed = structuredClone(alpha);
    reversed.nodes.reverse();
    expect(toMermaid(reversed)).toBe(m);
    const d = structuredClone(alpha);
    d.nodes[0].name = 'Say "hi"';
    expect(toMermaid(d)).toContain('Say #quot;hi#quot;');
  });
});

describe('toSourcesMd', () => {
  it('writes en headings, numbering, and evidence', () => {
    const s: string = toSourcesMd(alpha);
    expect(s.startsWith('# Where Alpha Sparse Routing came from\n')).toBe(true);
    expect(s).toContain('2026-11-05');
    expect(s).toContain('## Sources');
    expect(s).toContain('1. A. Example (2017). Alpha Sparse Routing. https://example.com/alpha');
    expect(s).toContain('2. Beta Gate Notes. https://example.com/beta');
    expect(s).toContain('3. Gamma Expert Pool (2021). https://example.com/gamma');
    expect(s).toContain('## Links and evidence');
    expect(s).toMatch(/Alpha Sparse Routing -> Gamma Expert Pool.*\[3\] Section 2/);
    expect(s).toContain('## Omitted');
    expect(s).not.toContain('## Sources not verified');
    expect(s.endsWith('\n') && !s.endsWith('\n\n')).toBe(true);
  });
  it('writes ko headings', () => {
    const s: string = toSourcesMd(ko());
    for (const h of ['## 출처', '## 관계와 근거', '## 뺀 것']) expect(s).toContain(h);
  });
  it('dedupes urls, lists unverified, handles original', () => {
    const d = structuredClone(alpha);
    d.nodes[1].sources.push({ title: 'Dup', url: 'https://example.com/alpha', opened: true });
    d.nodes[2].sources[0].opened = false;
    d.nodes[2].sources[0].original = '원제';
    const s: string = toSourcesMd(d);
    expect(s.match(/https:\/\/example\.com\/alpha/g)?.length).toBe(1);
    expect(s).toContain('## Sources not verified');
    expect(s).toContain('Gamma Expert Pool (원제)');
  });
  it('ends with the notes when there are any, and leaves the rest unchanged', () => {
    const plain: string = toSourcesMd(alpha);
    expect(plain).not.toContain('## Notes');
    const d = structuredClone(alpha);
    d.notes = 'As reported; both sides cited.';
    const en: string = toSourcesMd(d);
    expect(en).toBe(`${plain}\n## Notes\n\nAs reported; both sides cited.\n`);
    const k = { ...ko(), notes: '보도 기준.' };
    const kPlain: string = toSourcesMd(ko());
    expect(toSourcesMd(k)).toBe(`${kPlain}\n## 메모\n\n보도 기준.\n`);
    d.notes = '';
    expect(toSourcesMd(d)).toBe(plain);
  });
  it('has no em dash in fixed text', () => {
    expect(toSourcesMd(alpha) + toMermaid(alpha)).not.toContain(String.fromCharCode(0x2014));
  });

  it('keeps pasted text from carrying raw HTML or line breaks', () => {
    const d = structuredClone(alpha);
    d.nodes[0].sources[0].title = 'A <b>bold</b>\nsecond line';
    d.nodes[0].name = 'Line\none';
    d.edges[0].evidence.where = 'Section 2\n<img src=x>';
    d.notes = 'Note with <script>x</script>.';
    d.omitted = ['Left <i>out</i>'];
    const s: string = toSourcesMd(d);
    expect(s).not.toMatch(/<[a-z/]/i);
    expect(s).toContain('A &lt;b&gt;bold&lt;/b&gt; second line');
    expect(s).toContain('Line one ->');
    expect(s).toContain('Section 2 &lt;img src=x&gt;');
    expect(s).toContain('Note with &lt;script&gt;x&lt;/script&gt;.');
    expect(s).toContain('Left &lt;i&gt;out&lt;/i&gt;');
    expect(toMermaid(d)).toContain('Line one<br/>');
  });
  it('lists the timeline address of a node', () => {
    const s: string = toSourcesMd(alpha);
    expect(s).toContain('## AI Timeline Log');
    expect(s).toContain('- Epsilon Open Release: https://example.com/timeline/epsilon');
    expect(toSourcesMd(ko())).toContain('## AI Timeline Log');
    const d = structuredClone(alpha);
    d.nodes[4].timeline = null;
    expect(toSourcesMd(d)).not.toContain('## AI Timeline Log');
  });
});
