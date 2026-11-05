import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadFonts } from '../../../skills/ai-lineage/scripts/lib/fonts.mjs';
import { layout } from '../../../skills/ai-lineage/scripts/lib/layout.mjs';
import { toSvg } from '../../../skills/ai-lineage/scripts/lib/svg.mjs';
import { toPng } from '../../../skills/ai-lineage/scripts/lib/png.mjs';
import { toPdf } from '../../../skills/ai-lineage/scripts/lib/pdf.mjs';

const alpha: any = JSON.parse(readFileSync(new URL('../../fixtures/lineage/alpha.lineage.json', import.meta.url), 'utf8'));
const goldenPath = new URL('../../fixtures/lineage/alpha.woodcut.svg.sha256', import.meta.url);

let fonts: any;
beforeAll(async () => {
  fonts = await loadFonts();
});
const scene = (style: string, portrait: boolean): any => layout(alpha, fonts, { style, credit: true, portrait } as any).scene;
const STYLE_IDS = ['woodcut', 'soft', 'proof'];
const CASES = STYLE_IDS.flatMap((s) => [false, true].map((p) => [s, p] as const));
const hasQpdf = spawnSync('which', ['qpdf']).status === 0;

describe('svg', () => {
  test.each(CASES)('self-contained %s portrait=%s', (style, portrait) => {
    const sc = scene(style, portrait);
    const svg = toSvg(sc);
    for (const bad of ['<text', '<style', '<script', 'var(', 'url(', 'href=']) expect(svg).not.toContain(bad);
    expect(svg).toContain('<title>');
    expect(svg).toContain('<desc>');
    expect(svg).toContain(`width="${sc.width}" height="${sc.height}" viewBox="0 0 ${sc.width} ${sc.height}"`);
    for (const m of svg.matchAll(/\b(fill|stroke)="([^"]*)"/g)) expect(m[2]).toMatch(/^(#[0-9A-F]{6}|none)$/);
    expect(toSvg(scene(style, portrait))).toBe(svg);
  });
  test('landscape size', () => {
    expect(toSvg(scene('woodcut', false))).toContain('width="1200" height="675" viewBox="0 0 1200 675"');
  });
  test('golden', () => {
    const hash = createHash('sha256').update(toSvg(scene('woodcut', false))).digest('hex');
    expect(readFileSync(goldenPath, 'utf8').trim()).toBe(hash);
  });
});

function ihdr(png: Uint8Array): [number, number] {
  const v = new DataView(png.buffer, png.byteOffset, png.byteLength);
  return [v.getUint32(16), v.getUint32(20)];
}

describe('png', () => {
  test('size and determinism', async () => {
    const svg = toSvg(scene('woodcut', false));
    const a = await toPng(svg);
    expect(ihdr(a)).toEqual([2400, 1350]);
    const b = await toPng(svg);
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(true);
    const p = await toPng(toSvg(scene('soft', true)));
    expect(ihdr(p)).toEqual([2160, 2700]);
  });
});

describe('pdf', () => {
  test.each(CASES)('structure %s portrait=%s', (style, portrait) => {
    const sc = scene(style, portrait);
    const pdf = toPdf(sc);
    const s = Buffer.from(pdf).toString('latin1');
    expect(s.startsWith('%PDF-1.4')).toBe(true);
    expect(s.trimEnd().endsWith('%%EOF')).toBe(true);
    expect(s).toContain(`/MediaBox [0 0 ${sc.width} ${sc.height}]`);
    for (const bad of ['/CreationDate', '/ID', '/Producer']) expect(s).not.toContain(bad);
    expect(Buffer.from(toPdf(scene(style, portrait))).equals(Buffer.from(pdf))).toBe(true);
    if (hasQpdf) {
      const dir = mkdtempSync(join(tmpdir(), 'pdf-'));
      const f = join(dir, 'a.pdf');
      writeFileSync(f, pdf);
      expect(() => execFileSync('qpdf', ['--check', f], { stdio: 'pipe' })).not.toThrow();
    }
  });
  test('landscape media box', () => {
    expect(Buffer.from(toPdf(scene('woodcut', false))).toString('latin1')).toContain('/MediaBox [0 0 1200 675]');
  });
});
