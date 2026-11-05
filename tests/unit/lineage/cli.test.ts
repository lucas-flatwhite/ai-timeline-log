import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('../../../', import.meta.url).pathname;
const skillDir = join(root, 'skills/ai-lineage');
const script = join(skillDir, 'scripts/lineage.mjs');
const alphaPath = join(root, 'tests/fixtures/lineage/alpha.lineage.json');
const alpha = JSON.parse(readFileSync(alphaPath, 'utf8'));

const temps: string[] = [];
const tmp = () => {
  const d = mkdtempSync(join(tmpdir(), 'lineage-cli-'));
  temps.push(d);
  return d;
};
afterAll(() => {
  for (const d of temps) rmSync(d, { recursive: true, force: true });
});

const run = (args: string[], cwd: string, bin = script) =>
  spawnSync(process.execPath, [bin, ...args], { cwd, encoding: 'utf8' });

const FIVE = ['alpha.png', 'alpha.svg', 'alpha.pdf', 'alpha.mmd', 'alpha.sources.md'];

describe('lineage cli', () => {
  test('check alpha passes silently', () => {
    const r = run(['check', alphaPath], tmp());
    expect(r.status).toBe(0);
    expect(r.stderr).toBe('');
  });

  test('check broken reports an unknown node', () => {
    const d = tmp();
    const bad = structuredClone(alpha);
    bad.edges.push({ from: 'alpha-routing', to: 'no-such-node', type: 'lineage', status: 'confirmed' });
    const f = join(d, 'broken.lineage.json');
    writeFileSync(f, JSON.stringify(bad));
    const r = run(['check', f], d);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('error: ');
    expect(r.stderr).toContain('unknown node');
  });

  test('usage errors exit 2', () => {
    const d = tmp();
    expect(run([], d).status).toBe(2);
    expect(run(['bogus'], d).status).toBe(2);
    expect(run(['draw', alphaPath, '--style', 'neon', '--out', join(d, 'o')], d).status).toBe(2);
    expect(existsSync(join(d, 'o'))).toBe(false);
    expect(run(['check', join(d, 'missing.json')], d).status).toBe(2);
    writeFileSync(join(d, 'bad.json'), '{ nope');
    expect(run(['check', join(d, 'bad.json')], d).status).toBe(2);
  });

  test('runs from another cwd with spaces in the skill path (Review Focus 2)', () => {
    const d = tmp();
    const copy = join(d, 'a b', 'ai-lineage');
    mkdirSync(join(d, 'a b'), { recursive: true });
    cpSync(skillDir, copy, { recursive: true });
    const out = join(tmp(), 'out');
    const r = run(['draw', alphaPath, '--out', out], tmp(), join(copy, 'scripts/lineage.mjs'));
    expect(r.stderr).toBe('');
    expect(r.status).toBe(0);
    expect(readdirSync(out).sort()).toEqual([...FIVE].sort());
  });

  test('creates a missing --out and names files by slug (Review Focus 5)', () => {
    const d = tmp();
    const out = join(d, 'x/y/z');
    const r = run(['draw', alphaPath, '--out', out], d);
    expect(r.status).toBe(0);
    for (const f of FIVE) expect(existsSync(join(out, f))).toBe(true);
    expect(r.stdout.trim().split('\n').length).toBe(5);
    const beta = join(d, 'beta.json');
    writeFileSync(beta, JSON.stringify(alpha));
    const r2 = run(['draw', beta], d);
    expect(r2.status).toBe(0);
    expect(existsSync(join(d, 'beta.png'))).toBe(true);
    expect(existsSync(join(d, 'beta.sources.md'))).toBe(true);
  });

  test('defaults the output to the data folder', () => {
    const d = tmp();
    writeFileSync(join(d, 'alpha.lineage.json'), JSON.stringify(alpha));
    expect(run(['draw', 'alpha.lineage.json'], d).status).toBe(0);
    expect(existsSync(join(d, 'alpha.svg'))).toBe(true);
  });

  test('--portrait adds a portrait png only', () => {
    const d = tmp();
    const r = run(['draw', alphaPath, '--portrait', '--out', d], d);
    expect(r.status).toBe(0);
    expect(readdirSync(d).sort()).toEqual([...FIVE, 'alpha.portrait.png'].sort());
  });

  test('--no-credit and credit:false give the same svg, different from default', () => {
    const d = tmp();
    const a = join(d, 'a'), b = join(d, 'b'), c = join(d, 'c');
    run(['draw', alphaPath, '--out', a], d);
    run(['draw', alphaPath, '--no-credit', '--out', b], d);
    const nc = join(d, 'alpha.lineage.json');
    writeFileSync(nc, JSON.stringify({ ...alpha, credit: false }));
    run(['draw', nc, '--out', c], d);
    const svg = (x: string) => readFileSync(join(x, 'alpha.svg'), 'utf8');
    expect(svg(a)).not.toBe(svg(b));
    expect(svg(c)).toBe(svg(b));
  });

  test('--style changes the output', () => {
    const d = tmp();
    run(['draw', alphaPath, '--out', join(d, 'w')], d);
    expect(run(['draw', alphaPath, '--style', 'proof', '--out', join(d, 'p')], d).status).toBe(0);
    expect(readFileSync(join(d, 'p/alpha.svg'), 'utf8')).not.toBe(readFileSync(join(d, 'w/alpha.svg'), 'utf8'));
  });

  test('a failed draw writes nothing', () => {
    const d = tmp();
    const bad = structuredClone(alpha);
    bad.edges.push({ from: 'alpha-routing', to: 'no-such-node', type: 'lineage', status: 'confirmed' });
    const f = join(d, 'broken.lineage.json');
    writeFileSync(f, JSON.stringify(bad));
    const out = join(d, 'out');
    const r = run(['draw', f, '--out', out], d);
    expect(r.status).toBe(1);
    expect(existsSync(out) ? readdirSync(out) : []).toEqual([]);
    expect(r.stdout).toBe('');
  });
});
