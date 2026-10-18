import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

export interface OrigScene { d: string; when: string; k: string; t: string; l: string; i: [string, string][]; g: string; p: string; a?: number; m: string }
export interface Original {
  CH: OrigScene[];
  YR: Record<string, { t: string; p: string }>;
  LEDGER: [string, [string, string][]][];
  arcs: { span: string; title: string; body: string }[];
  sources: { url: string; title: string }[];
}

/** 원본 CH 배열 순서와 같은 장면 슬러그 */
export const SLUGS = [
  'chatgpt', 'bing-bard-llama', 'gpt-4', 'warnings', 'llama-2', 'openai-board', 'sora',
  'claude-3', 'gpt-4o', 'nvidia-top', 'reasoning-nobel', 'computer-use-mcp', 'deepseek',
  'vibe-coding', 'ghibli', 'coding-agents', 'gpt-5', 'gigawatt', 'gyeongju-gpu', 'gemini-3',
  'ai-basic-act', 'saaspocalypse', 'pentagon', 'mythos', 'export-control', 'sandbox-escape',
  'math-gpt-6', 'pace',
];

function literal(html: string, name: string, close: string): unknown {
  const head = `var ${name}=`;
  const from = html.indexOf(head);
  if (from < 0) throw new Error(`${name} not found`);
  const end = html.indexOf(`\n${close};`, from);
  if (end < 0) throw new Error(`${name} end not found`);
  // 사용자가 직접 만든 원본 파일의 데이터 리터럴만 평가한다
  return runInNewContext(`(${html.slice(from + head.length, end + 1 + close.length)})`);
}

const decode = (s: string) => s.replace(/&amp;/g, '&');

export function readOriginal(path = 'reference/original/index.html'): Original {
  const html = readFileSync(path, 'utf8');
  const arcsBlock = html.slice(html.indexOf('<ol class="arcs">'), html.indexOf('</ol>', html.indexOf('<ol class="arcs">')));
  const arcs = [...arcsBlock.matchAll(/<li><span class="span">(.*?)<\/span><h3>(.*?)<\/h3><p>(.*?)<\/p><\/li>/g)]
    .map(m => ({ span: m[1], title: m[2], body: m[3] }));
  const srcBlock = html.slice(html.indexOf('<details class="src">'), html.indexOf('</details>'));
  const sources = [...srcBlock.matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)]
    .map(m => ({ url: decode(m[1]), title: decode(m[2]) }));
  return {
    CH: literal(html, 'CH', ']') as OrigScene[],
    YR: literal(html, 'YR', '}') as Original['YR'],
    LEDGER: literal(html, 'LEDGER', ']') as Original['LEDGER'],
    arcs,
    sources,
  };
}
