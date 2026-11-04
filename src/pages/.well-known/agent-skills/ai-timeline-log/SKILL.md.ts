import { loadContent } from '../../../../lib/content.ts';
import { buildSkill } from '../../../../lib/agent.ts';

/* 스킬 본문(영어). 바이트가 index.json의 digest와 같아야 설치된다 */
export const GET = () => new Response(buildSkill(loadContent()), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
