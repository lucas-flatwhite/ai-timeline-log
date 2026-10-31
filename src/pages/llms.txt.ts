import { loadContent } from '../lib/content.ts';
import { buildLlmsIndex } from '../lib/export.ts';

/* llmstxt.org 형식의 안내. 빌드 때 파일로 쓴다 */
export const GET = () => new Response(buildLlmsIndex(loadContent()), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
