import { describe, test, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { EM_DASH } from '../../src/lib/checks.ts';

/* em dash는 저장소 어디에도 두지 않는다(AGENTS.md "Style rules"). 콘텐츠 검사(checks.ts)는 문자열만 보니,
   여기서는 YAML 주석, 코드 주석, 문서, 테스트까지 글 파일 전체를 읽는다 */
const ROOTS = ['content', 'src', 'scripts', 'tests', 'docs', '.github', 'public', '.agents', 'skills'];
const FILES = ['AGENTS.md', 'CLAUDE.md', 'README.md', 'package.json', 'astro.config.mjs', 'playwright.config.ts', 'vitest.config.ts', 'vercel.json', 'tsconfig.json'];
const TEXT = new Set(['.md', '.yaml', '.yml', '.ts', '.astro', '.css', '.mjs', '.js', '.json', '.txt', '.html', '.svg', '.xml']);
const SKIP = new Set(['node_modules', 'dist', 'generated', '.astro', 'test-results', 'playwright-report', 'vendor', 'fonts']);

function walk(dir: string, out: string[]): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (TEXT.has(extname(name))) out.push(p);
  }
  return out;
}

describe('no em dash in the repository', () => {
  const files = [...ROOTS.flatMap(r => { try { return walk(r, []); } catch { return []; } }), ...FILES];
  test('there are files to scan', () => { expect(files.length).toBeGreaterThan(100); });
  test('no text file contains an em dash', () => {
    const hits = files.flatMap(f => readFileSync(f, 'utf8').split('\n')
      .map((line, i) => (line.includes(EM_DASH) ? `${f}:${i + 1}` : null)).filter((x): x is string => x !== null));
    expect(hits).toEqual([]);
  });
});
